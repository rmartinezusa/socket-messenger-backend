const express = require("express");
const { createServer } = require("http");
const initializeSocket = require("./socket");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
// Restrict CORS to client origin
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" })); 
app.use(morgan("dev"));
app.use(express.json());

// API Routes
app.use("/auth", require("./api/auth").router);
app.use("/users", require("./api/users"));
app.use("/conversations", require("./api/conversations"));
app.use("/messages", require("./api/messages"));

// 404 Middleware
app.use((req, res, next) => {
    next({ status: 404, message: "Endpoint not found." });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Initialize Socket.IO
const io = initializeSocket(server);

// Start Server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
