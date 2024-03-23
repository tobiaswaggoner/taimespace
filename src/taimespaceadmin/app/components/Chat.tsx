"use client"
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDropzone } from 'react-dropzone'
import IFileAddedMessage from '@/contract/Messages/IFileAddedMessage';
import IChatMessage from '@/contract/Messages/IChatMessage';
import ITAImeSpaceMessage from '@/contract/Messages/ITAImeSpaceMessage';
import { RoutingKeys } from '@/contract/RoutingKeys';

interface IChatProps {
    user: string;
}

export default function Chat(props: IChatProps) {
    const user = props.user;

    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const socketRef = useRef<any>(null);
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [input, setInput] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function sendFileToServer(file: File, e: ProgressEvent<FileReader>) {
        const data = e.target?.result;
        if(!data) return;

        const [dataUrl, base64Data] = data!.toString().split(',');
        const mediaType = dataUrl?.split(':')[1]?.split(';')[0];

        const type = file.type || mediaType;

        if (data) {
            const fileAddedMessage = {} as IFileAddedMessage;
            fileAddedMessage.FileName = file.name;
            fileAddedMessage.Size = file.size;
            fileAddedMessage.Type = type;
            fileAddedMessage.Data = base64Data;
            fileAddedMessage.LastModified = new Date(file.lastModified);

            console.log("Sending " + RoutingKeys.FILE_ADDED, fileAddedMessage.FileName);

            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit(RoutingKeys.FILE_ADDED, fileAddedMessage);
            }
            else {
                console.log('socket is not connected');
            }
        }
    }

    const onDrop = useCallback((acceptedFiles: Array<File>) => {
        for (const file of acceptedFiles) {
            const reader = new FileReader();
            reader.onerror = (e) => {
                console.log(e);
            };
            reader.onload = (e) => sendFileToServer(file, e);
            reader.readAsDataURL(file);
        }
    }, [])
    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop, noClick: true, noKeyboard: true })

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    // Disable auto-scroll when user scrolls up
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
        setAutoScroll(bottom);
    }

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {

        if (input === "") {
            console.log('no message to send');
            return;
        }

        if (socketRef.current && socketRef.current.connected) {

            const newMessage = {} as IChatMessage;
            newMessage.Message = input;
            newMessage.Sender = user;
            newMessage.Timestamp = new Date();

            socketRef.current.emit(RoutingKeys.CHAT_MESSAGE_USER, newMessage);

            setMessages([...messages, newMessage]);
            setInput('');
            if (inputRef?.current) {
                inputRef.current.focus();
            }

        }
        else {
            console.log('socket is not connected');
        }
    }

    useEffect(() => {
        const newSocket = io();

        socketRef.current = newSocket;
        newSocket.connect();

        newSocket.on('connect', () => {
            console.log('connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('disconnected');
            setConnected(false);
        });

        // listen for all incoming messages
        newSocket.onAny((event, ...args) => {
            console.log(event, args);
        });

        newSocket.on(RoutingKeys.CHAT_MESSAGE_AI, (msg) => {
            const taimespaceMessage = msg as ITAImeSpaceMessage;
            const newAIMessage = JSON.parse(taimespaceMessage.Payload) as IChatMessage;
            setMessages((prevMessages) => [...prevMessages, newAIMessage]);
        });
        return () => {
            newSocket.disconnect();
        };
    }, []);
    return (
        <main className="flex flex-col h-full">
            <div className="w-full px-4 pt-3 border border-2 bg-gray-800 border-gray-800" style={{ flexShrink: 0 }}>
                <span className="text-xl font-bold text-gray-300">T</span>
                <span className="text-xl font-bold text-red-700">AI</span>
                <span className="text-xl font-bold text-gray-300">meSpace</span>
            </div>
            <div className="w-full px-4 border border-2 bg-gray-800 border-gray-800" style={{ flexShrink: 0 }}>
                <span className="text-small text-gray-400">Chatte mit der KI: {(user)}</span>
            </div>
            <div {...getRootProps()} className={`flex flex-col w-full flex-grow overflow-y-auto p-2 text-white border border-2 border-gray-800 ${isDragActive ? "bg-gray-400" : "bg-gray-800"}`} onScroll={handleScroll} >
                {messages.map((message, index) => (
                    <div key={index} className={`my-2 ${message.Sender === user ? 'text-green-300' : 'text-blue-300'}`}>
                        <span className='p-2 rounded-lg'>{message.Message}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Invisible div for scrolling to bottom */}
            </div>
            <div className="w-full px-4 py-3 border border-2 border-gray-800 bg-gray-800" >
                <div className="flex flex-row w-full">
                    <button onClick={open} className={`rounded-l-lg text-white p-2 ${connected ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-500'}`}><input {...getInputProps()} />{connected ? '📁' : '⌛'}</button>
                    <input ref={inputRef} type="text" placeholder="Nachricht ..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 p-2 border text-l min-w-0" disabled={!connected} style={{flex: '1 1 auto', minWidth: '50px'}} />
                    <button onClick={() => sendMessage()} className={`rounded-r-lg text-white p-2 ${connected ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-500'}`} disabled={!connected}>{connected ? '📤' : '⌛'}</button>
                </div>
            </div>
        </main>
    );
}