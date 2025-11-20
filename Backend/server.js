

// server.js
import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import "./utils/gemini.js"; // Keep this — runs Gemini test on startup

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/student.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

// Initialize Socket.IO with correct CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // Your React app (Vite)
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Mwalimu Assist Backend is LIVE!");
});

// ==================== REAL-TIME FEATURES ====================

let onlineUsers = 0;
const communityMessages = []; // In-memory for now (fast & simple)

io.on("connection", (socket) => {
  console.log(`Teacher connected: ${socket.id}`);
  onlineUsers++;
  io.emit("onlineCount", onlineUsers); // Update everyone

  // === COMMUNITY CHAT ===
  socket.emit("loadMessages", communityMessages); // Send history to new user

  socket.on("sendMessage", (msgData) => {
    const fullMessage = {
      id: Date.now().toString(),
      text: msgData.text,
      author: msgData.author || "Mwalimu",
      timestamp: new Date().toISOString()
    };

    communityMessages.push(fullMessage);
    io.emit("newMessage", fullMessage); // Send to ALL teachers instantly
  });

  // Optional: Join a room (for future private chats)
  socket.on("joinMessages", () => {
    socket.join("community");
  });

  // === UPVOTES (if you want later) ===
  // socket.on("upvote", (messageId) => {
  //   const msg = communityMessages.find(m => m.id === messageId);
  //   if (msg) {
  //     msg.upvotes = (msg.upvotes || 0) + 1;
  //     io.emit("updateUpvotes", { id: messageId, upvotes: msg.upvotes });
  //   }
  // });

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("onlineCount", onlineUsers);
    console.log(`Teacher disconnected: ${socket.id}`);
  });
});

// ==================== DATABASE & SERVER START ====================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Error:", err));

// VERY IMPORTANT: Use server.listen(), NOT app.listen()
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mwalimu Assist Server Running on http://localhost:${PORT}`);
  console.log(`Real-time chat ACTIVE — ${onlineUsers} teachers online`);
});























// import express from "express";
// import mongoose from "mongoose";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import dotenv from "dotenv";
// import "./utils/gemini.js"; // this will run gemini test automatically
// import authRoutes from "./routes/auth.js";
// import studentRoutes from "./routes/student.js"
// import Message from "./models/Messages.js";
// // import aiRoutes from "./routes/ai.js";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: {
// //     origin: 'http://localhost:5173',
// //   }
// // })

// // Middleware
// app.use(cors({
//   origin: "http://localhost:5173"
// }));


// app.use(express.json());


// // Initialize Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your React app
//     methods: ["GET", "POST"],
//   },
// });

// // Socket.IO Logic
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on("sendMessage", (message) => {
//     console.log("Message received:", message); // SEE IT HERE IN TERMINAL
//     io.emit("receiveMessage", message); // Broadcast to all
//   });

//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });
// // app.use(cors({
// //   origin: "http://localhost:5173"
// // }))

// // Routes
// // app.use("/api/ai", aiRoutes)
// app.use("/api/auth", authRoutes);
// app.use("/api/students", studentRoutes);

// app.get("/", (req, res) => res.send("API Running"));
// //Listen for incoming messages
// // io.on('connection', (socket) => {
// //   socket.on('chat message', async(msg) => {
// //     const message = new Message({ content: msg });
// //     await message.Save();
// //     io.emit('chat message', msg);
// //   });
// //   console.log('A user connected', socket.id);

// //   socket.on('connection', async() => {
// //     const recentMessages = await Message.find().sort({ timestamp: -1 }).limit(10);
// //     socket.emit('load messages', recentMessages);
// //   });
// //   //Handle chat message event
// //   // socket.on('chat message', (msg) => {
// //   //   io.emit('chat message', msg); //Broadcast the message to all clients
// //   // });

// //   //Handle disconnection
// //   socket.on('disconnect', () => {
// //     console.log('User disconnected', socket.id);
// //   })

// // })
  

  

// // Connect DB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
