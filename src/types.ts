export enum ErrorCodes {
   /**
    * No error
    */
   NoError = 0,

   /**
    * Format error - unable to interpret query
    */
   FormatError,

   /**
    * Server failure - internal problem
    */
   ServerFailure,

   /**
    * Name error - Only for authorative name server, domain name of query does not exist
    */
   NameError,

   /**
    * Not implemented - Request not supported
    */
   NotImplemented,

   /**
    * Refused - Nameserver refuses request
    */
   Refused
}

export enum QueryTypes {
   /**
    * IPv4 address
    */
   A = 0x01,

   /**
    * Nameserver
    */
   NS = 0x02,   // nameserver

   /**
    * Obsolete
    */
   MD = 0x03,   // obsolete

   /**
    * Obsolete
    */
   MF = 0x04,   // obsolete

   /**
    * Alias
    */
   CNAME = 0x05,   // alias

   /**
    * Start of authority
    */
   SOA = 0x06,   // start of authority

   /**
    * Experimental
    */
   MB = 0x07,   // experimental

   /**
    * Experimental
    */
   MG = 0x08,   // experimental

   /**
    * Experimental
    */
   MR = 0x09,   // experimental

   /**
    * Experimental
    */
   NULL = 0x0A,   // experimental null RR

   /**
    * Service description
    */
   WKS = 0x0B,   // service description

   /**
    * Reverse entry (inaddr.arpa)
    */
   PTR = 0x0C,   // reverse entry (inaddr.arpa)

   /**
    * Host information
    */
   HINFO = 0x0D,   // host information

   /**
    * Mailbox / Mail-list information
    */
   MINFO = 0x0E,   // mailbox or mail list information

   /**
    * Mail exchange
    */
   MX = 0x0F,   // mail exchange

   /**
    * Text strings
    */
   TXT = 0x10,   // text strings

   /**
    * IPv6 address
    */
   AAAA = 0x1C,   // ipv6 address

   /**
    * SRV records
    */
   SRV = 0x21,   // srv records

   /**
    * Request to transfer entire zone
    */
   AXFR = 0xFC,   // request to transfer entire zone

   /**
    * Request for mailbox related records
    */
   MAILA = 0xFE,   // request for mailbox related records

   /**
    * Request for mail agend RRs
    */
   MAILB = 0xFD,   // request for mail agent RRs

   /**
    * Any class
    */
   ANY = 0xFF,   // any class
}

export interface IMessageHeader {
   /**
    *  A 16 bit identifier assigned by the program that
    *  generates any kind of query.  This identifier is copied
    *  the corresponding reply and can be used by the requester
    *  to match up replies to outstanding queries.
    */
   ID: number;

   /**
    * Defines if query or response
    */
   QR: 0 | 1;

   /**
    * 4 Bit code, that defines type of query.
    * 0 Standard query
    * 1 Inverse query
    * 2 Server status request
    * 3-15 reserved for future use
    */
   OPCODE: number
   /**
    * Authorative Answer - only valid in responses and
    * specifies that the responding name server is an
    * authority for the domain name in question section
    */
   AA: 0 | 1;

   /**
    * Truncation - specifies that his message was truncated doe to
    * length grater than permitted on the transaction channel
    *
    * WARNING: NOT IMPLEMENTED IN THIS APPLICATION
    */
   TC: 0 | 1;

   /**
    * Recursion Desired - set in query and copied to response
    * if is set, directs name server to pursue the query recursively
    *
    * WARNING: NOT IMPLEMENTED IN THIS APPLICATION
    */
   RD: 0 | 1;

   /**
    * Recursion Available - will be cleared in response to
    * show the client that recursion is not available
    */
   RA: 0 | 1;

   /**
    * Reserved for future usage, must be 0 in all queries
    */
   Z: 0 | 1;

   AD: 0 | 1;

   CD: 0 | 1;

   /**
    * Response Code - 4 bit field is part of response
    *
    * 0 No error condition
    * 1 Format error - unable to interpret query
    * 2 Server failure - internal problem
    * 3 Name error - Only for authorative name server, domain name of query does not exist
    * 4 Not implemented - Request not supported
    * 5 Refused - Nameserver refuses request
    * 6-15 Reserved for future usage
    */
   RCODE: ErrorCodes;

   /**
    * Number of entries in question section
    * uint16
    */
   QDCOUNT: number;

   /**
    * Number of entries in answer section
    * uint16
    */
   ANCOUNT: number;

   /**
    * Number of resource records in authority records section
    * uint16
    */
   NSCOUNT: number;

   /**
    * Number of resource records in additional records section
    * uint16
    */
   ARCOUNT: number;
}
export interface IMessageQuestion {
   /**
    * Domain name represented as sequence of labels
    * Each label consists of a length octed followed
    * by that number of octeds
    */
   QNAME: string;

   /**
    * Two octed code wich specifies the type of the query.
    */
   QTYPE: number;

   /**
    * Two octed code that specifies the class of the Query
    * IS for internet
    * WARNING: ONLY IN IS SUPPORTED BY THIS APPLICATION
    */
   QCLASS: number;
}
export interface MessageRecourceRecord {
   /**
    * Domain name to wich resource record pertains
    */
   NAME: string;

   /**
    * Two octets containing TT type code.
    * Specifies meaning of data in RDATA field
    *
    * uint16
    */
   TYPE: number;

   /**
    * Two octets specifying class of RDATA field
    *
    * uint16
    */
   CLASS: number;

   /**
    * Specifies Time Interval (in seconds) that the record
    * may be cached before discarded.
    * Zero values are not cached
    *
    * uint32
    */
   TTL: number;

   /**
    * Length of RDATA field
    *
    * uint16
    */
   RDLENGTH: number;

   /**
    * a variable length string of ectets taht describes
    * the resource. The format is defined by TYPE and CLASS
    * field.
    *
    * If TYPE is A and CLASS is IN, RDATA is a 4 octet
    * ARPA internet address.
    */
   RDATA: Buffer;
}
export interface IMessage {
   header: IMessageHeader;
   questions: IMessageQuestion[];
   answers: MessageRecourceRecord[];
   authorities: MessageRecourceRecord[];
   additionals: MessageRecourceRecord[];
}
