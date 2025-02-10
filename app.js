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
  console.log("new User connected:", socket.id);
  //every user have new unique socket id
   io.emit('your-socket-id',socket.id)

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
    io.emit("after-send-sockerid", socket.id)
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Ensure the server starts properly
const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`Chat app server is running on ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
