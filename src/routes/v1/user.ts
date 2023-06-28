import express from 'express';
import Reply from "../../classes/Reply/Reply.js";
import Database from "../../db.js";
import RequiredProperties from "../../util/middleware/RequiredProperties.js";
import {encryptPassword} from "../../util/Password.js";
import {emailRegex} from "../../schemas/userSchema.js";
const router = express.Router();

const database = new Database();

// https://my.lettuce.systems/file/qL8imQ.png
// Two uppercase, one special*, two numbers, three lowercase, eight characters or more
// *The list of special characters could be improved
export const passwordRegex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$%^&*()\-_+.§½?\\\/])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/

router.get("/", async (req, res) => {
    res.reply(new Reply({}))
})


export default router;