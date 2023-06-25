export default class ReplyRequest {
    cat: string;
    status_code: number;
    success: boolean;

    constructor(statusCode: number, success: boolean) {
        this.status_code = statusCode;
        this.success = success;
        this.cat = `https://http.cat/${statusCode}`;
    }
}