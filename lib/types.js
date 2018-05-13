"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 0 No error condition
//    * 1 Format error - unable to interpret query
//       * 2 Server failure - internal problem
//          * 3 Name error - Only for authorative name server, domain name of query does not exist
//             * 4 Not implemented - Request not supported
//                * 5 Refused - Nameserver refuses request
//    * 6 - 15 Reserved for future usage
//       * 
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
//# sourceMappingURL=types.js.map