/// <reference types="node" />
import { Message, MessageHeader, MessageQuestion, MessageRecourceRecord } from "./types";
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
export declare class Request implements Message {
    private sendCallback;
    _header: MessageHeader;
    readonly header: MessageHeader;
    _questions: MessageQuestion[];
    readonly questions: MessageQuestion[];
    answers: RecourceRecord[];
    authorities: RecourceRecord[];
    additionals: RecourceRecord[];
    _packet: Buffer;
    constructor(packet: Buffer, sendCallback: (packet: Buffer) => any);
    send(): void;
    private serialize(truncate?, rcode?);
    private serializeHeader();
    private serializeQuestion(question);
    private serializeResourceRecord(record);
    private serializeName(name);
}
export declare class RecourceRecord implements MessageRecourceRecord {
    NAME: string;
    private _TYPE;
    TYPE: number;
    private _CLASS;
    CLASS: number;
    _TTL: number;
    TTL: number;
    RDATA: Buffer;
    readonly RDLENGTH: number;
}
