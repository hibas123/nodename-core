import { Request } from "./request";
export default class Listener {
    private udp;
    private tcp;
    constructor(type: "udp" | "tcp", onRequest: (request: Request) => any, host?: string);
    close(): void;
}
