import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const port = 3000;
const app = express();
const server = createServer(app);

const allowedOrigins = [
  process.env.VITE_FRONTEND_URL || "http://localhost:5173",
  process.env.VITE_BACKEND_URL || "http://localhost:3000"
,
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", (socket) => {
  console.log("New User connected:", socket.id);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    io.to(room).emit("user_joined", { userId: socket.id, room, username });
  });

  socket.on("send_message", ({ message, room, username, timestamp, image }) => {
    const messageWithTimestamp = {
      message,
      sender: socket.id,
      username,
      timestamp: timestamp || new Date().toISOString(), 
      image// Ensure a timestamp is always present
    };
  
    console.log(`Received message from ${username}: ${message} in room ${room}`);
    io.to(room).emit("receive_message", messageWithTimestamp);
  });
  

  //listen for typing event
  socket.on("user_typing", ({room, username}) => {
    io.to(room).emit("user_typing", {username})
  })

  socket.on("user_stopped_typing", ({room}) => {
    io.to(room).emit("user_stopped_typing")
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Chat app server is running on ${port}`);
});