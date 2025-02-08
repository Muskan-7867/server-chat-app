import express from 'express';
import cors from "cors";
import  { createServer } from "http";
import { Server } from 'socket.io';
// import dotenv from 'dotenv';

// dotenv.config(); 

const port = 3000;
const app = express();

//http server
const server = createServer(app);

//websocket server using socket.io
const io = new Server(server, {
  cors: {
    origin: "https://client-chat-app-chi.vercel.app",  
    methods: ["GET", "POST"],
    credentials: true,
  }},
);

app.use(cors({
  origin: "https://client-chat-app-chi.vercel.app" ,
  methods:["GET" , "POST"],
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send(" Hello world")
});

//listen for client connection  Handles New User Connections
io.on("connection" , (socket) =>{
  console.log("user connected", socket.id);  //socket show connection with specific user

//listen for incoming msg that client send
socket.on("send_message", (data) => {
  io.emit("receive_message" , data)  //broadcast msg to all users
})

//listen for user disconnect
socket.on("disconnect" , () =>{
  console.log("user disconnected", socket.id);
})
});

server.listen(port , () => {
  console.log(`Chat app server is running on ${port}`);
})