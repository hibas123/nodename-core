import { Request } from "./request";
export default class Listener {
    private udp;
    private tcp;
    constructor(type: "udp" | "tcp", onRequest: (request: Request) => any, port: number, host?: string);
    close(): void;
}
