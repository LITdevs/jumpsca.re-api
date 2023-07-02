import UnauthorizedReply from "../../classes/Reply/UnauthorizedReply.js";
import Token from "../../classes/Token/Token.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
import Reply from "../../classes/Reply/Reply.js";

let database = new Database();

/**
 * Make sure a request is authenticated
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function Auth(req, res, next) {
    if (!req.headers.authorization) return res.reply(new UnauthorizedReply("Missing Authorization header with Bearer token"))
    if (!req.headers.authorization.startsWith("Bearer")) return res.reply(new UnauthorizedReply("Authorization header does not contain Bearer token"))
    let splitHeader = req.headers.authorization.split(" ");
    if (!splitHeader[1]) return res.reply(new UnauthorizedReply("Authorization header does not contain Bearer token"))
    let token = splitHeader[1]
    try {
        let oToken = Token.from(token);
        if (oToken.type !== "access") return res.reply(new UnauthorizedReply("Bearer token is not access token"))

        // Wowie! We made it through all those checks... surely this token is real?
        let dToken = await oToken.isActive(); // This returns either token document or false
        if (!dToken) return res.reply(new UnauthorizedReply("Invalid token"))
        res.locals.user = dToken.user;
        req.user = dToken.user;
        //res.reply(new Reply({response: dToken}))
        next();

    } catch (e : any) {
        if (e.message.startsWith("Invalid token:")) return res.reply(new UnauthorizedReply(e.message))
        console.error(e)
        return res.reply(new ServerErrorReply(e))
    }
}