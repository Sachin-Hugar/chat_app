import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import Message from "./models/message.js";

// Connect to MongoDB
const mongoURI = "mongodb://localhost:27017/chat-app";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ Error connecting to MongoDB:", err));

// Set up Express and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Chat server is running 🚀");
});

// 💬 Socket.io logic
io.on("connection", async (socket) => {
  console.log("🔌 New user connected: " + socket.id);

  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // oldest to newest
    socket.emit("chat history", messages);
  } catch (err) {
    console.log("❌ Error fetching chat history:", err);
  }

  socket.on("chat message", async (data) => {
    console.log("💬 Message received:", data);

    // Save message to MongoDB
    const newMessage = new Message({
      user: data.user,
      text: data.text,
    });

    try {
      await newMessage.save();
      console.log("✅ Message saved to MongoDB");
    } catch (err) {
      console.log("❌ Error saving message:", err);
    }

    // Broadcast to all users
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
