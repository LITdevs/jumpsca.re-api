import express from 'express';
import Reply from "../../classes/Reply/Reply.js";
import Database from "../../db.js";
const router = express.Router();

const database = new Database();

router.get("/", async (req, res) => {
    res.reply(new Reply({
        response: {
            message: "Hello world"
        }
    }));
})


export default router;