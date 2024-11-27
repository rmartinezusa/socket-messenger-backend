const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

router.get("/", authenticate, async (req, res, next) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: req.user.id, 
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });

        res.status(200).json(conversations);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post("/", authenticate, async (req, res, next) => {
    try {
        const { participantIds } = req.body;

        // Check that two participant Ids are in "participantIds" value
        if (!participantIds || participantIds.length < 2) {
            next({ status: 400, error: "At least two participant IDs are required." });
        }

        // Check if a conversation between these participants already exists
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        id: {
                            in: participantIds,
                        },
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });

        // Return the existing conversation if found
        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // Create a new conversation 
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: participantIds.map((id) => ({ id })),
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });

        res.status(201).json(newConversation);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id", authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: +id,
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        sentAt: true,
                    },
                },
            },
        });

        if (!conversation) {
            next({ status: 404, error: "Conversation not found." });
        }

        res.status(200).json(conversation);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
