import express from 'express';
import RequiredProperties from "../../util/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
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

router.post("/", RequiredProperties([
    "one",
    {property: "two"},
    {property: "three", optional: true},
    {property: "four", optional: true, isArray: true},
    {property: "five", min: 0, max: 5},
    {property: "six", minLength: 2, maxLength: 5},
    {property: "seven", trim: true, minLength: 2, maxLength: 5},
    {property: "eight", enum: ["one", "two", "three"]},
    {property: "nine", regex: /^[a-zA-Z]+$/},
    {property: "ten", custom: (value) => { return {pass: value == "ten", reason: "Meow the cat ate your request :3"} }}
]), async (req, res) => {
    res.reply(new Reply({
        response: {
            message: "OK",
            version: req.app.locals.pjson.version,
            env: req.app.locals.ejson
        }}));
})

router.get("/test", async (req, res) => {
    try {
        let tests = await database.Test.find();
        res.reply(new Reply({
            response: {
                message: "Here are all tests",
                data: tests
            }
        }));
    } catch (e) {
        res.reply(new ServerErrorReply({
            message: "Failed to fetch tests",
            error: e
        }))
    }
});

router.post("/test", RequiredProperties(["name", "password"]), async (req, res) => {
    try {
        let test = new database.Test({
            name: req.body.name,
            password: req.body.password
        })
        await test.save();
        res.reply(new Reply({
            response: {
                message: "Test created",
                data: test
            }
        }));
    } catch (e) {
        res.reply(new ServerErrorReply({
            message: "Failed to create test",
            error: e
        }))
    }
})


export default router;