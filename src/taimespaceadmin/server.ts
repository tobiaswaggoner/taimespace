import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server as SocketIOServer } from "socket.io";
import ChatHandler from './app/components/ChatHandler';
import AIChatHandler from './server/aichat/AIChatHandler';
import mqConnection from './server/rabbitmq/rabbitmqconnection';

const port: number = parseInt(process.env.PORT as string, 10) || 3000;
const dev: boolean = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressServer = express();

  // Create a shared HTTP server
  const httpServer = createServer(expressServer);

  // Attach the WebSocket server to the shared HTTP server
  const io = new SocketIOServer(httpServer);

  // Initialize RabbitMQ connection
  const rmqConnection = mqConnection;

  // Initialize the ChatHandler with the WebSocket server
  // and the RabbitMQ connection
  const chatHandler = ChatHandler;
  chatHandler.init(io, rmqConnection);

  // // Initialize the AIChatHandler with the RabbitMQ connection
  const aiChatHandler = AIChatHandler;
  aiChatHandler.init(rmqConnection);

  expressServer.get('*', (req, res) => {
    return handle(req, res);
  });

  // Listen on the same port for both HTTP and WebSocket connections
  httpServer.listen(port, () => {
    console.log(`UI and Socket IO server running at http://localhost:${port}`);
  });
});
