import mongoose from "mongoose";

export default new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        unique: true
    }
});