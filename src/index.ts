import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import NotFoundReply from "./classes/Reply/NotFoundReply.js";
import Database from "./db.js";
import { initialize } from 'unleash-client';

const pjson = JSON.parse(fs.readFileSync("package.json").toString());
const ejson = JSON.parse(fs.readFileSync("environment.json").toString());
if (ejson.env === "prod") process.env.NODE_ENV = "production";

export { pjson, ejson }

const database = new Database();
const app = express();

export const unleash = initialize({
    url: 'https://feature-gacha.litdevs.org/api',
    appName: 'jumpsca.re-api',
    environment: ejson.environment === "dev" ? "development" : "production",
    // @ts-ignore
    customHeaders: { Authorization: process.env.UNLEASH_TOKEN },
});

// Set up body parsers
app.use(express.json())

// Set up custom middleware
app.use((req, res, next) => {
    // Allow CORS usage
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*")
    res.header("Access-Control-Allow-Methods", "*")

    // Define reply method, to set status code accordingly
    res.reply = (reply : Reply) => {
        res.status(reply.request.status_code).json(reply);
    }

    res.locals.unleashContext = {
        remoteAddress: req.headers["cf-connecting-ip"] || req.ip,
    };

    console.log(res.locals.unleashContext)

    // Continue
    next();
})

app.use(FeatureFlag("JU-API-killswitch"))

// Set up locals
app.locals.pjson = pjson;
app.locals.ejson = ejson;

// Set up routes
import v1_home from "./routes/v1/home.js";
import FeatureFlag from "./util/FeatureFlagMiddleware.js";
import Reply from "./classes/Reply/Reply.js";
app.use("/v1", v1_home);

// Catch all other requests with 404
app.all("*", async (req, res) => {
    res.reply(new NotFoundReply());
})

// Make sure both the database and feature gacha are ready before starting listening for requests
let unleashReady = false;
let databaseReady = false;
database.events.once("ready", () => {
    databaseReady = true;
    if (unleashReady) startServer();
});

unleash.on('synchronized', () => {
    unleashReady = true;
    if (databaseReady) startServer();
});

const startServer = () => {
    app.listen(process.env.PORT || 13717, async () => {
        console.log(`${await database.Address.countDocuments({})} address documents in Runestone`)
        console.log(`Listening on port ${process.env.PORT || 13717}`);
    });
}