import express from 'express';
import Reply from "../../classes/Reply/Reply.js";
import Database from "../../db.js";
const router = express.Router();

const database = new Database();

router.get("/", async (req, res) => {
    res.reply(new Reply({
        response: {
            message: "OK",
            version: req.app.locals.pjson.version,
            env: req.app.locals.ejson
        }}));
})

router.get("/ip", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.json({ ip });
})


export default router;