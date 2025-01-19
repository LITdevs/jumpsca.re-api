// TEMP TEMP TEMP TEMP TEMP TEMP
import mongoose from "mongoose";

const schema : mongoose.Schema = new mongoose.Schema({
    siteId: String,
    secret: String,
    deployConfig: {
        branch: String,
        serveFolder: String,
        buildCommand: String,
        environment: Object,
        domains: Array,
        headers: Object,
        redirects: Array,
        spa: Boolean
    }
});

export default schema;
