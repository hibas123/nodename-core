"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorCodes;
(function (ErrorCodes) {
    /**
     * No error
     */
    ErrorCodes[ErrorCodes["NoError"] = 0] = "NoError";
    /**
     * Format error - unable to interpret query
     */
    ErrorCodes[ErrorCodes["FormatError"] = 1] = "FormatError";
    /**
     * Server failure - internal problem
     */
    ErrorCodes[ErrorCodes["ServerFailure"] = 2] = "ServerFailure";
    /**
     * Name error - Only for authorative name server, domain name of query does not exist
     */
    ErrorCodes[ErrorCodes["NameError"] = 3] = "NameError";
    /**
     * Not implemented - Request not supported
     */
    ErrorCodes[ErrorCodes["NotImplemented"] = 4] = "NotImplemented";
    /**
     * Refused - Nameserver refuses request
     */
    ErrorCodes[ErrorCodes["Refused"] = 5] = "Refused";
})(ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {}));
var QueryTypes;
(function (QueryTypes) {
    /**
     * IPv4 address
     */
    QueryTypes[QueryTypes["A"] = 1] = "A";
    /**
     * Nameserver
     */
    QueryTypes[QueryTypes["NS"] = 2] = "NS";
    /**
     * Obsolete
     */
    QueryTypes[QueryTypes["MD"] = 3] = "MD";
    /**
     * Obsolete
     */
    QueryTypes[QueryTypes["MF"] = 4] = "MF";
    /**
     * Alias
     */
    QueryTypes[QueryTypes["CNAME"] = 5] = "CNAME";
    /**
     * Start of authority
     */
    QueryTypes[QueryTypes["SOA"] = 6] = "SOA";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MB"] = 7] = "MB";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MG"] = 8] = "MG";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MR"] = 9] = "MR";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["NULL"] = 10] = "NULL";
    /**
     * Service description
     */
    QueryTypes[QueryTypes["WKS"] = 11] = "WKS";
    /**
     * Reverse entry (inaddr.arpa)
     */
    QueryTypes[QueryTypes["PTR"] = 12] = "PTR";
    /**
     * Host information
     */
    QueryTypes[QueryTypes["HINFO"] = 13] = "HINFO";
    /**
     * Mailbox / Mail-list information
     */
    QueryTypes[QueryTypes["MINFO"] = 14] = "MINFO";
    /**
     * Mail exchange
     */
    QueryTypes[QueryTypes["MX"] = 15] = "MX";
    /**
     * Text strings
     */
    QueryTypes[QueryTypes["TXT"] = 16] = "TXT";
    /**
     * IPv6 address
     */
    QueryTypes[QueryTypes["AAAA"] = 28] = "AAAA";
    /**
     * SRV records
     */
    QueryTypes[QueryTypes["SRV"] = 33] = "SRV";
    /**
     * Request to transfer entire zone
     */
    QueryTypes[QueryTypes["AXFR"] = 252] = "AXFR";
    /**
     * Request for mailbox related records
     */
    QueryTypes[QueryTypes["MAILA"] = 254] = "MAILA";
    /**
     * Request for mail agend RRs
     */
    QueryTypes[QueryTypes["MAILB"] = 253] = "MAILB";
    /**
     * Any class
     */
    QueryTypes[QueryTypes["ANY"] = 255] = "ANY";
})(QueryTypes = exports.QueryTypes || (exports.QueryTypes = {}));
//# sourceMappingURL=types.js.map