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
  "https://client-chat-nine.vercel.app",
  "https://server-chat-app-1.onrender.com",
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

  socket.on("send_message", ({ message, room, username }) => {
    console.log(`Received message from ${username}: ${message} in room ${room}`);
    io.to(room).emit("receive_message", { message, sender: socket.id, username });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Chat app server is running on ${port}`);
});