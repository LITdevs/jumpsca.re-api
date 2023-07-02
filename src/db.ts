import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import EventEmitter from "events";
import addressSchema from "./schemas/addressSchema.js";
import userSchema from "./schemas/userSchema.js";
import tokenSchema from "./schemas/tokenSchema.js";
/*import loginUserSchema from './schemas/loginUserSchema.js'
import userAvatarSchema from './schemas/userAvatarSchema.js'
import quarkSchema from "./schemas/quarkSchema.js";
import channelSchema from "./schemas/channelSchema.js";
import messageSchema from "./schemas/messageSchema.js";
import quarkOrderSchema from "./schemas/quarkOrderSchema.js";
import nicknameSchema from "./schemas/nicknameSchema.js";*/

export default class Database {

    private static _instance: Database;
    connected: boolean = false;

    db: any;
    events: EventEmitter = new EventEmitter();

    Address;
    User;
    Token;

    constructor() {
        if (typeof Database._instance === "object") return Database._instance;
        Database._instance = this;

        // Connect to the database
        const DB_URI : string | undefined = process.env.MONGODB_URI
        if (typeof DB_URI === "undefined") {
            console.error("\nMONGODB_URI not found, Exiting...");
            process.exit(2);
        }

        this.db = mongoose.createConnection(DB_URI);

        this.db.once("open", () => {
            this.#onOpen();
            this.connected = true;
        })
    }

    #onOpen() {
        console.log("Runestone connection established");
        this.Address = this.db.model('address', addressSchema);
        this.User = this.db.model('user', userSchema);
        this.Token = this.db.model('token', tokenSchema);
        /*Avatars = lqdb.model('avatar', userAvatarSchema)
        Quarks = lqdb.model('quark', quarkSchema)
        Channels = lqdb.model('channel', channelSchema)
        Messages = lqdb.model('message', messageSchema)
        QuarkOrders = lqdb.model('quarkOrder', quarkOrderSchema)
        Nicks = lqdb.model('nick', nicknameSchema)*/
        this.events.emit("ready");
    }
}