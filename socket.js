const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectedUsers = new Map();

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            // Restrict to specific client origin
            origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", 
            methods: ["GET", "POST"],
        },
    });

    // Middleware for socket authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        // Ensures only authenticated users can connect and exchange messages.
        if (!token) {
            return next(new Error("Unauthorized: Missing token"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Assume the JWT includes the userId
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error("Unauthorized: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId;

        console.log(`User connected: ${userId} (${socket.id})`);
        connectedUsers.set(userId, socket.id);

        // Handle incoming messages
        socket.on("sendMessage", async (message) => {
            const { conversationId, recipientId, content } = message;

            if (!conversationId || !userId || !recipientId || !content) {
                return socket.emit("error", "Invalid message payload");
            }

            // Emit message to the sender for confirmation
            socket.emit("messageSent", {
                conversationId,
                senderId: userId,
                content,
                sentAt: new Date(),
            });

            // Emit message to the recipient if connected
            const recipientSocketId = connectedUsers.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", {
                    conversationId,
                    senderId: userId,
                    content,
                    sentAt: new Date(),
                });
            } else {
                console.log(`User ${recipientId} is offline.`);
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
            connectedUsers.delete(userId);
        });
    });

    return io;
};

module.exports = initializeSocket;
