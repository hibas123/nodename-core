import { Parser } from "binary-parser"

const MAX_LABEL_SIZE = 63;

export enum queryTypes {
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

const headerParser = new Parser()
   .endianess("big")
   .uint16("ID")
   .bit1("QR")
   .bit4("OPCODE")
   .bit1("AA")
   .bit1("TC")
   .bit1("RD")
   .bit1("RA")
   .bit1("Z")
   .bit1("AD")
   .bit1("CD")
   .bit4("RCODE")
   .uint16("QDCOUNT")
   .uint16("ANCOUNT")
   .uint16("NSCOUNT")
   .uint16("ARCOUNT")

const labelParser = new Parser()
   .endianess("big")
   .uint8("dataLength")
   .string("name", {
      length: "dataLength",
      encoding: "ascii"
   })

const questionParser = new Parser()
   .endianess("big")
   .array("QNAME", {
      type: labelParser,
      readUntil: (item: any, buffer) => {
         if (item.dataLength <= 0)
            return true;
      },
      formatter: (value: { dataLength: number, name: string }[]) => {
         return value.map(e => e.name).join(".").slice(0, -1);
      }
   })
   .uint16("QTYPE")
   .uint16("QCLASS")

function parseQuestions(count: number, packet: Buffer): MessageQuestion[] {
   return <any>new Parser()
      .endianess("big")
      .array("questions", {
         type: questionParser,
         length: count
      }).parse(packet).questions;
}

export class Request implements Message {
   _header: MessageHeader;
   get header() {
      return Object.assign({}, this._header);
   }

   _questions: MessageQuestion[];
   get questions() {
      return this._questions.map(e => e);
   }

   answers: RecourceRecord[] = [];
   authorities: RecourceRecord[] = [];
   additionals: RecourceRecord[] = [];

   _packet: Buffer;
   constructor(packet: Buffer, private sendCallback: (packet: Buffer) => any) {
      this._packet = packet;
      let headerData = Buffer.alloc(12);
      packet.copy(headerData, 0, 0, 12);
      let bodyData = Buffer.alloc(packet.length - 12);
      packet.copy(bodyData, 0, 12, packet.length);

      this._header = <any>headerParser.parse(headerData);
      this._header.AD = 0;
      this._questions = parseQuestions(this._header.QDCOUNT, bodyData);
   }

   send() {
      this.sendCallback(this.serialize());
   }

   private serialize(truncate: boolean = false, rcode: 0 | 1 | 2 | 3 | 4 | 5 = 0) {
      this._header.AA = 1;
      this._header.ANCOUNT = this.answers.length;
      this._header.ARCOUNT = this.additionals.length;
      this._header.NSCOUNT = this.authorities.length;
      this._header.QR = 1;
      this._header.RCODE = rcode;
      this._header.RA = 0;
      let questions = this.questions.map(this.serializeQuestion, this)
      let answers = this.answers.map(this.serializeResourceRecord, this)
      let authority = this.authorities.map(this.serializeResourceRecord, this)
      let additional = this.additionals.map(this.serializeResourceRecord, this)

      let questionsByteLength = 0;
      questions.forEach(e => questionsByteLength += e.length);

      let answersByteLength = 0;
      answers.forEach(e => answersByteLength += e.length)

      let authorityByteLength = 0;
      authority.forEach(e => authorityByteLength += e.length)

      let additionalByteLength = 0;
      additional.forEach(e => additionalByteLength += e.length)

      let length = 12 + questionsByteLength + answersByteLength + authorityByteLength + additionalByteLength; //Header is always 12 byte large

      if (truncate && length > 512) {
         this._header.TC = 1;

         //Buffer will ignore data that exeeds the max buffer length
         length = 512;
      }

      let header = this.serializeHeader()

      let data = Buffer.alloc(length)
      let offset = 0;

      let append = (buffer: Buffer) => {
         buffer.copy(data, offset, 0, buffer.length)
         offset += buffer.length;
      }

      append(header)
      questions.forEach(append)
      answers.forEach(append)
      authority.forEach(append)
      additional.forEach(append)
      return data;
   }

   private serializeHeader() {
      let header = this.header;
      let data = Buffer.alloc(12);
      data.writeUInt16BE(header.ID, 0);
      var f = 0x0000;
      f = f | (header.QR << 15);
      f = f | (header.OPCODE << 11);
      f = f | (header.AA << 10);
      f = f | (header.TC << 9);
      f = f | (header.RD << 8);
      f = f | (header.RA << 7);
      f = f | (header.Z << 6);
      f = f | (header.AD << 5);
      f = f | (header.CD << 4);
      f = f | header.RCODE;
      data.writeUInt16BE(f, 2);

      data.writeUInt16BE(header.QDCOUNT, 4)
      data.writeUInt16BE(header.ANCOUNT, 6)
      data.writeUInt16BE(header.NSCOUNT, 8)
      data.writeUInt16BE(header.ARCOUNT, 10)
      return data;
   }

   private serializeQuestion(question: MessageQuestion) {
      let qname = this.serializeName(question.QNAME);
      let data = Buffer.alloc(qname.length + 4);
      qname.copy(data, 0, 0, qname.length);
      let offset = qname.length;
      data.writeUInt16BE(question.QTYPE, offset);
      offset += 2;
      data.writeUInt16BE(question.QCLASS, offset);
      return data;
   }

   private serializeResourceRecord(record: MessageRecourceRecord) {
      // TODO: Implement compression
      let name = this.serializeName(record.NAME);
      let data = Buffer.alloc(name.length + 10 + record.RDLENGTH) // For TYPE, CLASS, TTL, RLENGTH
      name.copy(data, 0, 0, name.length);
      let offset = name.length;
      data.writeUInt16BE(record.TYPE, offset)
      offset += 2
      data.writeUInt16BE(record.CLASS, offset)
      offset += 2
      data.writeUInt32BE(record.TTL, offset)
      offset += 4
      data.writeUInt16BE(record.RDLENGTH, offset)
      offset += 2
      record.RDATA.copy(data, offset, 0, record.RDLENGTH)
      return data;
   }

   private serializeName(name: string) {
      let length = 0;
      let parts = name.split(".");
      parts.forEach(e => {
         // Length of part and byte that holds the length information
         if (e.length > MAX_LABEL_SIZE) throw new Error("Label to large");
         length += e.length + 1;
      })

      length += 1; //Adding last 0 length octet
      let data = Buffer.alloc(length);
      let offset = 0;
      parts.forEach(e => {
         console.log(e.length);
         data.writeUInt8(e.length, offset)
         offset++
         data.write(e, offset, e.length)
         offset += e.length
      })
      data.writeUInt8(0, offset);
      console.log("name |", data.toString("hex"), length)
      return data;
   }
}

export class RecourceRecord implements MessageRecourceRecord {
   NAME: string
   private _TYPE: number;
   set TYPE(value) {
      if (value < 0 || value > 65535) throw new TypeError("TYPE Range: 0 - 65.535")
      this._TYPE = value;
   }

   get TYPE() {
      return this._TYPE;
   }

   private _CLASS: number;
   set CLASS(value) {
      if (value < 0 || value > 65535) throw new TypeError("CLASS Range: 0 - 65.535")
      this._CLASS = value;
   }

   get CLASS() {
      return this._CLASS;
   }

   _TTL: number;
   set TTL(value) {
      if (value < 0 || value > 4294967295) throw new TypeError("TTL Range: 0 - 4.294.967.295")
   }

   get TTL() {
      return this._TTL;
   }

   RDATA: Buffer;

   get RDLENGTH() {
      return this.RDATA.length;
   }
}