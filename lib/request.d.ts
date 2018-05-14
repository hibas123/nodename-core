/// <reference types="node" />
import { Message, MessageHeader, MessageQuestion, MessageRecourceRecord, ErrorCodes } from "./types";
export declare enum QueryTypes {
    /**
     * IPv4 address
     */
    A = 1,
    /**
     * Nameserver
     */
    NS = 2,
    /**
     * Obsolete
     */
    MD = 3,
    /**
     * Obsolete
     */
    MF = 4,
    /**
     * Alias
     */
    CNAME = 5,
    /**
     * Start of authority
     */
    SOA = 6,
    /**
     * Experimental
     */
    MB = 7,
    /**
     * Experimental
     */
    MG = 8,
    /**
     * Experimental
     */
    MR = 9,
    /**
     * Experimental
     */
    NULL = 10,
    /**
     * Service description
     */
    WKS = 11,
    /**
     * Reverse entry (inaddr.arpa)
     */
    PTR = 12,
    /**
     * Host information
     */
    HINFO = 13,
    /**
     * Mailbox / Mail-list information
     */
    MINFO = 14,
    /**
     * Mail exchange
     */
    MX = 15,
    /**
     * Text strings
     */
    TXT = 16,
    /**
     * IPv6 address
     */
    AAAA = 28,
    /**
     * SRV records
     */
    SRV = 33,
    /**
     * Request to transfer entire zone
     */
    AXFR = 252,
    /**
     * Request for mailbox related records
     */
    MAILA = 254,
    /**
     * Request for mail agend RRs
     */
    MAILB = 253,
    /**
     * Any class
     */
    ANY = 255,
}
export declare function SerializeName(name: string): Buffer;
export declare class Request implements Message {
    private sendCallback;
    private _header;
    readonly header: MessageHeader;
    private _questions;
    readonly questions: MessageQuestion[];
    answers: RecourceRecord[];
    authorities: RecourceRecord[];
    additionals: RecourceRecord[];
    constructor(packet: Buffer, sendCallback: (packet: Buffer) => any);
    error(error: ErrorCodes): void;
    noRecursion(): void;
    send(): void;
    serialize(truncate?: boolean, rcode?: 0 | 1 | 2 | 3 | 4 | 5): Buffer;
    private serializeHeader();
    private serializeQuestion(question);
    private serializeResourceRecord(record);
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
}
