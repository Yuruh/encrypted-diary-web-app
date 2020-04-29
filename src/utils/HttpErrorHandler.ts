export default class HttpErrorHandler {
    messages: Map<number, string> = new Map([
        [400, "Bad Request"],
        [401, "Session Expired"],
        [403, "Forbidden Request"],
        [404, "Resource not found"],
        [409, "Resource Already Exists"],
        [413, "Payload too large"],
        [429, "Too many requests issued"],
        [500, "Internal Server Error"],
        [501, "Feature not implemented yet"],
        [502, "Service Unavailable"],
        [503, "Service Unavailable"],
        [504, "Time out"],
    ]);

    public getErrorMsg(code: number): string {
        if (this.messages.has(code)) {
            return this.messages.get(code) as string;
        } else {
            return "Unhandled Error Code"
        }
    }

    public getErrorCallback() {

    }
}