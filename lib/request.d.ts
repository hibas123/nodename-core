/// <reference types="node" />
import { IMessage, IMessageHeader, IMessageQuestion, MessageRecourceRecord, ErrorCodes } from "./types";
export declare function parseHeader(data: Buffer): IMessageHeader;
export declare function parseQuestions(count: number, packet: Buffer): IMessageQuestion[];
export declare function serializeName(name: string): Buffer;
export declare class Request implements IMessage {
    private sendCallback;
    private max_size;
    private _header;
    readonly header: Header;
    private _questions;
    readonly questions: Question[];
    answers: RecourceRecord[];
    authorities: RecourceRecord[];
    additionals: RecourceRecord[];
    constructor(packet: Buffer, sendCallback: (packet: Buffer) => any, max_size?: number);
    error(error: ErrorCodes): void;
    noRecursion(): void;
    send(): void;
    serialize(): Buffer;
}
export declare class Header implements IMessageHeader {
    ID: number;
    QR: 0 | 1;
    OPCODE: number;
    AA: 0 | 1;
    TC: 0 | 1;
    RD: 0 | 1;
    RA: 0 | 1;
    Z: 0 | 1;
    AD: 0 | 1;
    CD: 0 | 1;
    RCODE: ErrorCodes;
    QDCOUNT: number;
    ANCOUNT: number;
    NSCOUNT: number;
    ARCOUNT: number;
    constructor(header: IMessageHeader);
    serialize(): Buffer;
}
export declare class Question implements IMessageQuestion {
    QNAME: string;
    QTYPE: number;
    QCLASS: number;
    constructor(question: IMessageQuestion);
    serialize(): Buffer;
}
export declare class RecourceRecord implements MessageRecourceRecord {
    /**
     * This value can be set to identify if specific record is already set
     */
    Identifier: string;
    NAME: string;
    private _TYPE;
    TYPE: number;
    private _CLASS;
    CLASS: number;
    private _TTL;
    TTL: number;
    RDATA: Buffer;
    readonly RDLENGTH: number;
    serialize(): Buffer;
}
