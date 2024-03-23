"use client"

import { use, useEffect, useRef, useState } from "react";
import Chat from "@/app/components/Chat";
import Split from '@uiw/react-split';


export default function ChatPage() {

    return (
        <Split
            className="flex h-screen w-full"
            mode="horizontal"
        >
            <div style={{ width: '400px', minWidth: '50px' }} className="ml-1 overflow-hidden h-screen border border-black">
                <Chat />
            </div>
            <div className="flex-1 overflow-auto h-screen border border-black">
                Dies ist nur ein erster Test!
            </div>
        </Split>
    );
}