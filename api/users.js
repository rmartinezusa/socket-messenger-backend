const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

router.get("/profile", authenticate, async (req, res, next) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                name: true,
                createdAt: true,
            }
        });

        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

router.get("/", authenticate, async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                createdAt: true,
            }
        });

        res.status(200).json(users);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

router.get("/:id", authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUniqueOrThrow({
            where: { id: +id },
            select: {
                id: true,
                username: true,
                name: true,
                createdAt: true,
            }
        });

        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        next(e)
    }
});

module.exports = router;
