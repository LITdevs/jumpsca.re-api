import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import NotFoundReply from "./classes/Reply/NotFoundReply.js";
import Database from "./db.js";
import FeatureFlag from "./util/middleware/FeatureFlagMiddleware.js";
import Reply from "./classes/Reply/Reply.js";
import { initialize } from 'unleash-client';
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_KEY;
const stripeWebhookKey = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeKey) throw new Error("STRIPE_KEY not found in environment variables");
if (!stripeWebhookKey) throw new Error("STRIPE_WEBHOOK_SECRET not found in environment variables");

// Sort of an odd export, mainly to get typescript to believe it cannot be undefined
export const stripeWebhook = stripeWebhookKey;

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2022-11-15',
});

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
// Stripe webhook needs raw body, so we need to use raw body parser for that
app.use((req, res, next) => {
    if (req.path === "/v1/address/checkout/fulfill") {
        express.raw({type: 'application/json'})(req, res, next);
    } else {
        express.json()(req, res, next);
    }
})

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
import v1_address from "./routes/v1/address.js";
import v1_user from "./routes/v1/user.js";
import Email from "./classes/Email/Email.js";
import RefreshToken from "./classes/Token/RefreshToken.js";
import AccessToken from "./classes/Token/AccessToken.js";
import Token from "./classes/Token/Token.js";
import ServerErrorReply from "./classes/Reply/ServerErrorReply.js";
app.use("/v1", v1_home);
app.use("/v1/address", v1_address);
app.use("/v1/user", v1_user);

/*app.get("/token", async (req, res) => {
    try {
        res.reply(new Reply({
            response: {
                message: "Token",
                newToken: `Token: ${req?.query?.type === "refresh" ? new RefreshToken() : new AccessToken(new Date(Date.now() + 1000 * 60 * 60))}`,
                oldToken: req?.query?.token && Token.parse(req.query.token),
                fromToken: req?.query?.token && Token.from(req.query.token),
            }
        }))
    } catch (e : any) {
        res.reply(new ServerErrorReply({message: e.message}))
    }
})*/

/*app.post("/testemail", async (req, res) => {
    // constructor(subject, recipientAddress, recipientDisplayName, bodyPlain, bodyHTML) {
    const email = new Email(req.body.subject, req.body.recipientAddress, req.body.recipientDisplayName, req.body.bodyPlain, req.body.bodyHTML)
    res.reply(new Reply({
        response: {
            message: "Sent",
            info: await email.send()
        }
    }))
})*/

// Catch all other requests with 404
app.all("*", async (req, res) => {
    res.reply(new NotFoundReply());
})

// Make sure both the database and feature gacha are ready before starting listening for requests
let unleashReady = false;
let databaseReady = false;
database.events.once("ready", () => {
    databaseReady = true;
    startServer();
});

unleash.on('synchronized', () => {
    console.debug("Feature gacha rolled")
    unleashReady = true;
    startServer();
});

const startServer = () => {
    if (!databaseReady || !unleashReady) return;
    app.listen(process.env.PORT || 18665, async () => {
        console.log(`${await database.Address.countDocuments({})} address documents in Runestone`)
        console.log(`Listening on port ${process.env.PORT || 18665}`);
    });
}