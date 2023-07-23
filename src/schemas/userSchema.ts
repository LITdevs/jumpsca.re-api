import mongoose from "mongoose";

export const emailRegex = /^[^@]+@[^@]+$/
export const pronounRegex = /^[a-zA-Z]\/[a-zA-Z](\/[a-zA-Z])?$/

const schema : mongoose.Schema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: Buffer
    },
    salt: {
        type: Buffer
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid email address. @ _ @`,
            validator: function(v) {
                // check if the email is valid
                return emailRegex.test(v); // Emails are verified anyway, so the regex doesn't need to be perfect (do not parse html with regex)
            }
        }
    },
    pronouns: {
        type: String,
        required: false,
        validate: {
            message: props => `${props.value} is not a valid pronoun set, please use the format X/X or X/X/X`,
            validator: function(v) {
                return pronounRegex.test(v)
            }
        }
    }
});

export default schema;

/**
 * Returns a safe version of the user object, that can be sent to the client
 * Removes the hashed password and salt from the user object, and optionally the email
 * @param user
 * @param includeEmail
 */
export function safeUser(user : any, includeEmail = true) {
    return {
        displayName: user.displayName,
        email: includeEmail ? user.email : undefined,
        pronouns: user.pronouns,
        _id: user._id
    }
}