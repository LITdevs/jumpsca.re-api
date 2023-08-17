import Token from "./Token.js";

export default class AccessToken extends Token {
    constructor(expiresAt : Date, scope: "JR"|"WC" = "JR") {
        super("access", expiresAt, scope);
    }
}