const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

router.get("/", authenticate, async (req, res, next) => {
    try {
        res.send("ghgg gfhfhf gfhgf hfhh fhgf sdf");
    } catch (e) {
        console.error(e);
        next(e)
    }
});

module.exports = router;

