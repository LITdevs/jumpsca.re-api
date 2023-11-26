import Token from "./Token.js";

export default class RefreshToken extends Token {
    constructor(scope: "WC"|"JR" = "JR") {
        super("refresh", new Date(0), scope);
    }
}