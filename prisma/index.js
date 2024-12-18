const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
    model: {
        user: {
            async register(username, password) {
                try {
                    const hashedPass = await bcrypt.hash(password, 10);
                    const user = await prisma.user.create({
                        data: { username, password: hashedPass },
                    });
                    return user;
                } catch (e) {
                    if (e.code === 'P2002') {
                        throw new Error("username already taken...");
                    }
                    throw e;
                }
            },
            async login(username, password) {
                try {
                    const user = await prisma.user.findUniqueOrThrow({
                        where: { username },
                    });
                    const valid = await bcrypt.compare(password, user.password);
                    if(!valid) {
                        throw Error("Invalid password");
                    }
                    return user
                } catch (e) {
                    throw e;
                }
            },
            async updatePassword(id, currentPassword, newPassword) {
                try {
                    const user = await prisma.user.findUniqueOrThrow({
                        where: { id },
                    });
                    const valid = await bcrypt.compare(currentPassword, user.password);
                    if (!valid) {
                        throw new Error("Current password is incorrect.");
                    }

                    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                    const updatedUser = await prisma.user.update({
                        where: { id },
                        data: { password: hashedNewPassword },
                    });
                    return updatedUser;
                } catch (e) {
                    throw e;
                }
            },
        }
    }
})

module.exports = prisma