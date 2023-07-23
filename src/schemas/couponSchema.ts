import mongoose from "mongoose";

const schema : mongoose.Schema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    }
});

export default schema;