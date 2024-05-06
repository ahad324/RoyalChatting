const serverless = require("serverless-http");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const router = express.Router();

// Initialize a simple HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io on the HTTP server
const io = socketIo(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};
io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    console.log("New User Connected ", name);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
    socket.emit("current-members", Object.values(users));
  });
  socket.on("send", (message) => {
    socket.broadcast.emit("recieve", {
      message: message,
      name: users[socket.id],
    });
  });
  socket.on("disconnect", (message) => {
    socket.broadcast.emit("leave", users[socket.id]);
    delete users[socket.id];
  });
});

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// Export the serverless function handler
module.exports.handler = serverless(app);
