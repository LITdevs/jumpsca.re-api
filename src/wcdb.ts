import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import EventEmitter from "events";
import addressSchema from "./schemas/addressSchema.js";
import userSchema from "./schemas/userSchema.js";
import tokenSchema from "./schemas/tokenSchema.js";
import loginCodeSchema from "./schemas/loginCodeSchema.js";
import couponSchema from "./schemas/couponSchema.js";

export default class WCDatabase {

    private static _instance: WCDatabase;
    connected: boolean = false;

    db: any;
    events: EventEmitter = new EventEmitter();

    Token;

    constructor() {
        if (typeof WCDatabase._instance === "object") return WCDatabase._instance;
        WCDatabase._instance = this;

        // Connect to the database
        const DB_URI : string | undefined = process.env.WC_MONGODB_URI
        if (typeof DB_URI === "undefined") {
            console.error("\nWC_MONGODB_URI not found, Exiting...");
            process.exit(2);
        }

        this.db = mongoose.createConnection(DB_URI);

        this.db.once("open", () => {
            this.#onOpen();
            this.connected = true;
        })
    }

    #onOpen() {
        console.log("Brittle Hollow connection established");
        this.Token = this.db.model('token', tokenSchema);
        this.events.emit("ready");
    }
}