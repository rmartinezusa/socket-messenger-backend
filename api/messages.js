const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

router.get("/:id", authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const messages = await prisma.message.findMany({
            where: {
                conversationId: +id, 
            },
            select: {
                id: true,
                content: true,
                senderId: true,
                sentAt: true,
            },
        });

        if (!messages || messages.length === 0) {
            next({ statud: 404, error: "No messages found for this conversation." });
        }

        res.status(200).json(messages);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

router.post("/:id", authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content || content.trim() === "") {
            return res.status(400).json({ error: "Message content is required." });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: +id },
            include: {
                participants: {
                    select: { id: true },
                },
            },
        });

        if (!conversation) {
            next({ status: 404, error: "Conversation not found." });
        }

        const isParticipant = conversation.participants.some(
            (participant) => participant.id === senderId
        );

        if (!isParticipant) {
            next({ status: 403, error: "You are not a participant in this conversation." });
        }

        const newMessage = await prisma.message.create({
            data: {
                content,
                senderId,
                conversationId: +id,
            },
            select: {
                id: true,
                content: true,
                senderId: true,
                sentAt: true,
            },
        });

        res.status(201).json(newMessage);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

module.exports = router;
