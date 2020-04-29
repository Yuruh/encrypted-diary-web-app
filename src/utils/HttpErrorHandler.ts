export default class HttpErrorHandler {
    messages: Map<number, string> = new Map([
        [400, "Bad Request"],
        [401, "Unauthorized"],
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

    actions: Map<number, () => void> = new Map([
        [401, () => console.log("redirect to login")]
    ]);

    public getErrorMsg(code: number): string {
        if (this.messages.has(code)) {
            return this.messages.get(code) as string;
        }
        return "Unhandled Error Code";

    }

    public getErrorCallback(code: number): (() => void) | undefined {
        if (this.actions.has(code)) {
            return this.actions.get(code) as (() => void)
        }
        return undefined
    }
}