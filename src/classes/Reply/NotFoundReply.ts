import Reply from "./Reply.js";

export default class NotFoundReply extends Reply {
    // Accept an object or a string
    // If a string is passed, it will be used as the message
    // If an object is passed, it will be used as the response directly
    constructor(response: object|string = "Not Found") {
        let replyResponse : any;
        if (typeof response === "string") replyResponse = { message: response };
        else replyResponse = response;
        super({
            responseCode: 404,
            success: false,
            response: replyResponse
        });
    }
}