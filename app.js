import express from "express";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";

const port = 3000;

const app = express();
//create an http server
const server = createServer(app)  

const allowedOrigins = [process.env.VITE_FRONTEND_URL || "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors:{
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }
});


app.get("/", (req,res) =>{
 res.send("hello world");
})


io.on("connection", (socket) => {
  console.log("user connected" , socket.id)


socket.on("join_room", (room) => {
  socket.join(room);
  console.log(`User ${socket.id} joined room: ${room}`);
  io.to(room).emit("user_joined", { userId: socket.id, room })
});

socket.on("send_message", ({message, room, username}) => {
  io.to(room).emit("receive_message", { message, sender: socket.id, username });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


});

server.listen(port, () => {
  console.log(`chat app server is running on ${port}`)
})