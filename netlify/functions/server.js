const serverless = require("serverless-http");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const httpServer = http.createServer(app);

const io = socketIo(httpServer, {
  cors: {
    origin: "https://royalchatting.netlify.app",
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

// Handle HTTP requests
app.use((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!");
});

// Wrap the Express app to make it compatible with serverless environments
const handler = serverless(httpServer);

// Export the handler
module.exports.handler = async (event, context) => {
  // Call the handler function
  const result = await handler(event, context);
  return result;
};