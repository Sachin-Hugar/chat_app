import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For now allow all origins
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Chat server is running 🚀");
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("🔌 New user connected: " + socket.id);

  socket.on("chat message", (msg) => {
    console.log("💬 Message received:", msg);
    io.emit("chat message", msg); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
