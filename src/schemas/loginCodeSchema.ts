import mongoose from "mongoose";
import url from 'node:url';
import Token from "../classes/Token/Token.js";

const schema : mongoose.Schema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
});

export default schema;