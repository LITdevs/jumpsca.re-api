import mongoose from "mongoose";
import url from 'node:url';

let blacklist : string[] = [
    "api",
    "www",
    "phoenix",
    "runestone", // There is a reason for this one
    "mailer-daemon",
    "postmaster",
    "nobody",
    "hostmaster",
    "usenet",
    "news",
    "webmaster",
    "www",
    "ftp",
    "abuse",
    "root",
    "help",
    "admin",
    "administrator",
    "owner",
    "noreply",
    "no-reply"
]

const schema : mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid subdomain`,
            validator: function(v) {
                // check if the name is blacklisted
                if (blacklist.includes(v.toLowerCase())) return false;
                // check if the name is a valid subdomain
                return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.domainToASCII(v.toLowerCase()));
            }
        }
    },
    owner: {
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