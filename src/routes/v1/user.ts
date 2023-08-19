import express from 'express';
import Reply from "../../classes/Reply/Reply.js";
import Database from "../../db.js";
import RequiredProperties from "../../util/middleware/RequiredProperties.js";
import {checkPassword, encryptPassword} from "../../util/Password.js";
import {emailRegex, safeUser} from "../../schemas/userSchema.js";
import BadRequestReply from "../../classes/Reply/BadRequestReply.js";
import AccessToken from "../../classes/Token/AccessToken.js";
import RefreshToken from "../../classes/Token/RefreshToken.js";
import Auth from "../../util/middleware/Auth.js";
import UnauthorizedReply from "../../classes/Reply/UnauthorizedReply.js";
import Token from "../../classes/Token/Token.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Email from "../../classes/Email/Email.js";
import * as crypto from "crypto";
import ObjectIdToDate from "../../util/ObjectIdToDate.js";
const router = express.Router();
import tr46 from "tr46";
import WCDatabase from "../../wcdb.js";

const database = new Database();

// https://my.lettuce.systems/file/qL8imQ.png
// Two uppercase, one special*, two numbers, three lowercase, eight characters or more
// *The list of special characters could be improved
// Hi! It's future me. I don't know what this dead link was??
export const passwordRegex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$%^&*()\-_+.§½?\\\/])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/

router.put("/login/password", Auth, RequiredProperties([
    {
        property: "password",
        type: "string",
        regex: passwordRegex
    },
    {
        property: "invalidateSessions",
        type: "boolean",
        optional: true
    },
    {
        property: "invalidateThisSession",
        type: "boolean",
        optional: true
    }
]), async (req, res) => {
    let hashes = encryptPassword(req.body.password);
    req.user.hashedPassword = hashes.hashedPassword;
    req.user.salt = hashes.salt;
    await req.user.save();
    if (req.body.invalidateSessions) {
        await database.Token.deleteMany({user: req.user._id, access: {$not: !req.body.invalidateThisSession ? new RegExp(res.locals.dToken.access) : / /}});
    }
    res.reply(new Reply({
        response: {
            message: "Password set."
        }
    }))
})

router.post("/login/password", RequiredProperties([
    {
        property: "email",
        type: "string",
        regex: emailRegex
    },
    {
        property: "password",
        type: "string"
    }
]), async (req, res) => {
    let user = await database.User.findOne({email: req.body.email.trim()})
    if (!user) return res.reply(new BadRequestReply("Invalid email and password combination."))
    if (!user.hashedPassword || !user.salt) return res.reply(new BadRequestReply("Invalid login method, try using email login."))
    if (!checkPassword(req.body.password, user.hashedPassword, user.salt)) return res.reply(new BadRequestReply("Invalid email and password combination."))

    // Congratulations! The password is correct.
    let token = new database.Token({
        access: new AccessToken(new Date(Date.now() + 1000 * 60 * 60 * 8)), // 8 hours
        refresh: new RefreshToken(),
        user: user._id
    })
    await token.save();

    res.reply(new Reply({ response: {
            message: "Logged in",
            accessToken: token.access,
            refreshToken: token.refresh,
            expiresInSec: 28800 // 8 hours in seconds
        }}))
})

router.post("/login/email", RequiredProperties([
    {
        property: "email",
        type: "string",
        regex: emailRegex
    },
    {
        property: "code",
        type: "string",
        minLength: 8,
        maxLength: 8,
        trim: true,
        optional: true
    }
]), async (req, res) => {
    if (req.body.code) {
        let dCode = await database.LoginCode.findOne({code: req.body.code}).populate("user");
        if (!dCode || dCode.user.email !== req.body.email) return res.reply(new UnauthorizedReply("Incorrect code"));
        if (ObjectIdToDate(dCode._id).getTime() + 15*60*1000 < Date.now()) return res.reply(new UnauthorizedReply("Expired code"));

        let token = new database.Token({
            access: new AccessToken(new Date(Date.now() + 1000 * 60 * 60 * 8)), // 8 hours
            refresh: new RefreshToken(),
            user: dCode.user._id
        })
        await token.save();

        res.reply(new Reply({ response: {
                message: "Logged in",
                accessToken: token.access,
                refreshToken: token.refresh,
                expiresInSec: 28800 // 8 hours in seconds
            }}))

        await database.LoginCode.deleteOne({_id: dCode._id});

    } else {
        let user = await database.User.findOne({email: req.body.email})
        if (!user) return res.reply(new UnauthorizedReply("No such user"));
        let code = crypto.randomBytes(4).toString("hex");
        let email = new Email(
            "jumpsca.re login code",
            user.email,
            user.displayName,
            code,
            `<b>${code}</b>`
        )
        let loginCode = new database.LoginCode({
            user: user._id,
            code: code
        })
        await loginCode.save();
        await email.send();
        return res.reply(new Reply({
            response: {
                message: "Email sent",
                expiresInSec: 60*15
            }
        }))
    }
})

router.post("/login/refresh", RequiredProperties([
    {
        property: "accessToken",
        type: "string"
    },
    {
        property: "refreshToken",
        type: "string"
    }
]), async (req, res) => {
    try {
        let accessToken = Token.from(req.body.accessToken);
        let refreshToken = Token.from(req.body.refreshToken);
        if (accessToken.type !== "access") return res.reply(new BadRequestReply("accessToken is not access token"))
        if (refreshToken.type !== "refresh") return res.reply(new BadRequestReply("refreshToken is not refresh token"))

        let dToken = await refreshToken.isActive(); // This returns either token document or false
        if (!dToken) return res.reply(new UnauthorizedReply("Invalid token"))

        if (dToken.refresh !== refreshToken.token) return res.reply(new UnauthorizedReply("Invalid token"))
        if (dToken.access !== accessToken.token) return res.reply(new UnauthorizedReply("Invalid token"))

        dToken.access = new AccessToken(new Date(Date.now() + 1000*60*60*8), accessToken.scope); // Generate a new access token for 8 hours
        await dToken.save();
        return res.reply(new Reply({
            response: {
                message: "Token refreshed",
                accessToken: dToken.access,
                expiresInSec: 28800
            }
        }))

    } catch (e : any) {
        if (e.message.startsWith("Invalid token:")) return res.reply(new BadRequestReply(e.message))
        console.error(e)
        return res.reply(new ServerErrorReply(e))
    }
})

router.get("/me", Auth, async (req, res) => {
    let userAddresses = await database.Address.find({owner: req.user._id})
    let parsed : any[] = []
    res.reply(new Reply({
        response: {
            message: "Successfully authenticated",
            user: safeUser(req.user),
            userAddresses
        }
    }))
})

router.post("/wc", Auth, async (req, res) => {
    let wcDatabase = new WCDatabase();
    let token = new wcDatabase.Token({
        access: new AccessToken(new Date(Date.now() + 1000*60*60*8), "WC"),
        refresh: new RefreshToken("WC"),
        user: req.user._id
    })
    await token.save();
    return res.reply(new Reply({
        responseCode: 201,
        response: {
            message: "Token created",
            accessToken: token.access,
            refreshToken: token.refresh,
            expiresInSec: 28800
        }
    }))
})

/*router.post("/icanhasauth", Auth, async (req, res) => {
    return res.reply(new Reply({response: {
            email: req.user.email,
            email2: res.locals.user.email
        }}))
})*/

/*router.post("/icanhaspassword", async (req, res) => {
    let user = await database.User.findOne({email: req.body.email.trim()})
    let hashes = encryptPassword(req.body.password);
    user.hashedPassword = hashes.hashedPassword;
    user.salt = hashes.salt;
    await user.save();
    return res.reply(new Reply({}))
})
I needed to set a password before it was implemented, lol
*/

export default router;