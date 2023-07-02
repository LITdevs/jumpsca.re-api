import mongoose from "mongoose";
import url from 'node:url';

const schema : mongoose.Schema = new mongoose.Schema({
    access: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid subdomain`,
            validator: function(v) {
                return true;
            }
        }
    },
    refresh: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid subdomain`,
            validator: function(v) {
                return true;
            }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

export default schema;