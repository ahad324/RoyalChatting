const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "https://royalchatting.netlify.app",
    // origin: "http://localhost:8888",
    methods: ["GET", "POST"],
  },
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

module.exports = (req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!");
  } else if (req.method === "POST") {
    // Allow socket.io to handle the request
    server.emit("request", req, res);
  }
};