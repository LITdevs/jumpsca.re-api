import ForbiddenReply from "../../classes/Reply/ForbiddenReply.js";

export default function FeatureFlag (flagName : string) {
    return function (req, res, next) {
        switch (flagName) {
            case "JU-API-Payment":
                res.reply(new ForbiddenReply("You are not permitted to access this endpoint"))
                return;
            default:
                return next();
        }
    }
}