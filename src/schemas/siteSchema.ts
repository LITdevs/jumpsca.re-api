// TEMP TEMP TEMP TEMP TEMP TEMP
import mongoose from "mongoose";

const schema : mongoose.Schema = new mongoose.Schema({
    siteId: String,
    secret: String,
    deployConfig: {
        serveFolder: String,
        buildCommand: String,
        domains: Array
    }
});

export default schema;
