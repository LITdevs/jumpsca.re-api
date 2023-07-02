import Token from "./Token.js";

export default class AccessToken extends Token {
    constructor(expiresAt : Date) {
        super("access", expiresAt);
    }
}