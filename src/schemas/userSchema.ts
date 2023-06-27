import mongoose from "mongoose";

const schema : mongoose.Schema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: Buffer,
        required: true
    },
    salt: {
        type: Buffer,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid email address. @ _ @`,
            validator: function(v) {
                // check if the email is valid
                return /^[^@]+@[^@]+$/.test(v); // Emails are verified anyway, so the regex doesn't need to be perfect (do not parse html with regex)
            }
        }
    },
    pronouns: {
        type: String,
        required: false,
        validate: {
            message: props => `${props.value} is not a valid pronoun set, please use the format X/X or X/X/X`,
            validator: function(v) {
                return /^[a-zA-Z]\/[a-zA-Z](\/[a-zA-Z])?$/.test(v)
            }
        }
    }
});

export default schema;