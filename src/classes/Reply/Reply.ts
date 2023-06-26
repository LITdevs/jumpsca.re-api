import ReplyRequest from "./ReplyRequest.js";

interface IReplyOptions {
    responseCode?: number,
    success?: boolean,
    response?: any
}

export default class Reply {
    response: any;
    request: ReplyRequest;

    constructor(options : IReplyOptions) {
        this.request = new ReplyRequest(options.responseCode || 200, typeof options.success === "undefined" ? true : options.success);
        this.response = options.response || { message: "OK" }
    }
}