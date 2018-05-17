"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const request_1 = require("./request");
const types_1 = require("./types");
function fromHex(data) {
    return Buffer.from(data.replace(/\s/g, ""), "hex");
}
describe("parser", function () {
    describe("header", function () {
        describe("header parser", function () {
            let should_templ = {
                ID: 0,
                QR: 0,
                OPCODE: 0,
                AA: 0,
                TC: 0,
                RD: 0,
                RA: 0,
                Z: 0,
                AD: 0,
                CD: 0,
                RCODE: 0,
                QDCOUNT: 0,
                ANCOUNT: 0,
                ARCOUNT: 0,
                NSCOUNT: 0
            };
            let tests = [
                {
                    name: "Testing ID field",
                    data: "0001 0000 0000 0000 0000 0000",
                    fields: {
                        ID: 1
                    }
                },
                {
                    name: "Testing ID field with max value",
                    data: "FFFF 0000 0000 0000 0000 0000",
                    fields: {
                        ID: 65535
                    }
                },
                {
                    name: "Testing QR field",
                    data: "0000 8000 0000 0000 0000 0000",
                    fields: {
                        QR: 1
                    }
                },
                {
                    name: "Testing OPCODE field value 2",
                    data: "0000 1000 0000 0000 0000 0000",
                    fields: {
                        OPCODE: 2
                    }
                },
                {
                    name: "Testing OPCODE field value 1",
                    data: "0000 0800 0000 0000 0000 0000",
                    fields: {
                        OPCODE: 1
                    }
                },
                {
                    name: "Testing AA field",
                    data: "0000 0400 0000 0000 0000 0000",
                    fields: {
                        AA: 1
                    }
                },
                {
                    name: "Testing TC field",
                    data: "0000 0200 0000 0000 0000 0000",
                    fields: {
                        TC: 1
                    }
                },
                {
                    name: "Testing RD field",
                    data: "0000 0100 0000 0000 0000 0000",
                    fields: {
                        RD: 1
                    }
                },
                {
                    name: "Testing RCODE field",
                    data: "0000 0002 0000 0000 0000 0000",
                    fields: {
                        RCODE: 2
                    }
                },
                {
                    name: "Testing QDCOUNT field max value",
                    data: "0000 0000 FFFF 0000 0000 0000",
                    fields: {
                        QDCOUNT: 65535
                    }
                },
                {
                    name: "Testing ANCOUNT field max value",
                    data: "0000 0000 0000 FFFF 0000 0000",
                    fields: {
                        ANCOUNT: 65535
                    }
                },
                {
                    name: "Testing NSCOUNT field max value",
                    data: "0000 0000 0000 0000 FFFF 0000",
                    fields: {
                        NSCOUNT: 65535
                    }
                },
                {
                    name: "Testing ARCOUNT field max value",
                    data: "0000 0000 0000 0000 0000 FFFF",
                    fields: {
                        ARCOUNT: 65535
                    }
                },
                {
                    name: "Testing all Flags and Values max",
                    data: "FFFF FFFF FFFF FFFF FFFF FFFF",
                    fields: {
                        ID: 65535,
                        QR: 1,
                        OPCODE: 15,
                        AA: 1,
                        TC: 1,
                        RD: 1,
                        RA: 1,
                        Z: 1,
                        AD: 1,
                        CD: 1,
                        RCODE: 15,
                        QDCOUNT: 65535,
                        ANCOUNT: 65535,
                        NSCOUNT: 65535,
                        ARCOUNT: 65535
                    }
                }
            ];
            tests.forEach(function (e) {
                it(e.name, function () {
                    let testdata = fromHex(e.data);
                    let should = Object.assign({}, should_templ, e.fields); // Build in "clone" function
                    let header = request_1.parseHeader(testdata);
                    chai_1.assert.hasAllKeys(header, Object.keys(should), "Parsed header is missing some fields");
                    chai_1.assert.deepEqual(header, should, "Parsed header has not expected values!");
                });
            });
        });
        describe("header serializer", function () {
            let empty_header = {
                ID: 0,
                QR: 0,
                OPCODE: 0,
                AA: 0,
                TC: 0,
                RD: 0,
                RA: 0,
                Z: 0,
                AD: 0,
                CD: 0,
                RCODE: 0,
                QDCOUNT: 0,
                ANCOUNT: 0,
                ARCOUNT: 0,
                NSCOUNT: 0
            };
            let tests = [
                {
                    name: "Fill header with 0s",
                    result: "0000 0000 0000 0000 0000 0000",
                    values: {}
                },
                {
                    name: "Set header id to 5",
                    result: "0005 0000 0000 0000 0000 0000",
                    values: {
                        ID: 5
                    }
                },
                {
                    name: "Set QR",
                    result: "0000 8000 0000 0000 0000 0000",
                    values: {
                        QR: 1
                    }
                },
                {
                    name: "Set OPCODE",
                    result: "0000 7800 0000 0000 0000 0000",
                    values: {
                        OPCODE: 15
                    }
                },
                {
                    name: "Set AA",
                    result: "0000 0400 0000 0000 0000 0000",
                    values: {
                        AA: 1
                    }
                },
                {
                    name: "Set TC",
                    result: "0000 0200 0000 0000 0000 0000",
                    values: {
                        TC: 1
                    }
                },
                {
                    name: "Set RD",
                    result: "0000 0100 0000 0000 0000 0000",
                    values: {
                        RD: 1
                    }
                },
                {
                    name: "Set RA",
                    result: "0000 0080 0000 0000 0000 0000",
                    values: {
                        RA: 1
                    }
                },
                {
                    name: "Set Z",
                    result: "0000 0040 0000 0000 0000 0000",
                    values: {
                        Z: 1
                    }
                },
                {
                    name: "Set AD",
                    result: "0000 0020 0000 0000 0000 0000",
                    values: {
                        AD: 1
                    }
                },
                {
                    name: "Set CD",
                    result: "0000 0010 0000 0000 0000 0000",
                    values: {
                        CD: 1
                    }
                },
                {
                    name: "Set RCODE",
                    result: "0000 000F 0000 0000 0000 0000",
                    values: {
                        RCODE: 15
                    }
                },
                {
                    name: "Set QDCOUNT",
                    result: "0000 0000 FFFF 0000 0000 0000",
                    values: {
                        QDCOUNT: 65535
                    }
                },
                {
                    name: "Set ANCOUNT",
                    result: "0000 0000 0000 FFFF 0000 0000",
                    values: {
                        ANCOUNT: 65535
                    }
                },
                {
                    name: "Set NSCOUNT",
                    result: "0000 0000 0000 0000 FFFF 0000",
                    values: {
                        NSCOUNT: 65535
                    }
                },
                {
                    name: "Set ARCOUNT",
                    result: "0000 0000 0000 0000 0000 FFFF",
                    values: {
                        ARCOUNT: 65535
                    }
                },
            ];
            tests.forEach(function (e) {
                it(e.name, function () {
                    let header = Object.assign({}, empty_header, e.values);
                    let serialized = new request_1.Header(header).serialize();
                    chai_1.assert.equal(serialized.toString("hex"), e.result.replace(/\s/g, "").toLowerCase(), "Header serialization failed");
                });
            });
        });
    });
    describe("question", function () {
        let questionData = fromHex("0474 6573 7407 6578 616d 706c 6503 636f 6d00 0001 0001");
        let questionObj = {
            QNAME: "test.example.com",
            QTYPE: types_1.QueryTypes.A,
            QCLASS: 1
        };
        it("check question parser with one question", function () {
            let res = request_1.parseQuestions(1, questionData);
            let should = [questionObj];
            chai_1.assert.deepEqual(res, should, "Question parser does not parse input correctly");
        });
        it("check question serialization", function () {
            let res = new request_1.Question(questionObj).serialize();
            chai_1.assert.equal(res.toString("hex"), questionData.toString("hex"), "Query serializer does not serialite correctly");
        });
    });
    it("recource record serialization", function () {
        let should = "07 6578616D706C65 03 636f6D 00 0001 0001 00000640 0004 0A000001";
        let rr = new request_1.RecourceRecord();
        rr.CLASS = 1;
        rr.NAME = "example.com";
        rr.TTL = 1600;
        rr.TYPE = 1;
        rr.RDATA = fromHex("0A 00 00 01");
        let res = rr.serialize().toString("hex");
        chai_1.assert.equal(res, should.replace(/\s/g, "").toLowerCase(), "Serialization not working properly");
    });
    it("full response serialization", function () {
        let reqData = fromHex("E835 0100 0001 0000 0000 0000 07 6578616D706c65 03636F6D 00 0001 0001");
        let should = "E835 8580 0001000100000000 076578616D706C6503636F6D0000010001 07 6578616D706C65 03 636F6D 00 0001 0001 0000 0640 0004 0A000001";
        let request = new request_1.Request(reqData, () => null);
        let rr = new request_1.RecourceRecord();
        rr.CLASS = 1;
        rr.NAME = "example.com";
        rr.TTL = 1600;
        rr.TYPE = 1;
        rr.RDATA = fromHex("0A 00 00 01");
        request.answers.push(rr);
        let data = request.serialize();
        chai_1.assert.equal(data.toString("hex"), should.replace(/\s/g, "").toLowerCase(), "Whole packet serialization failed");
    });
    // it("full response serialization benchmark", function () {
    //    let reqData = fromHex("E835 0100 0001 0000 0000 0000 07 6578616D706c65 03636F6D 00 0001 0001");
    //    for (let i = 0; i < 100; i++) {
    //       let request = new Request(reqData, () => null)
    //       let rr = new RecourceRecord()
    //       rr.CLASS = 1
    //       rr.NAME = "example.com"
    //       rr.TTL = 1600
    //       rr.TYPE = 1
    //       rr.RDATA = fromHex("0A 00 00 01")
    //       request.answers.push(rr)
    //       request.serialize()
    //    }
    // })
});
//# sourceMappingURL=test.js.map