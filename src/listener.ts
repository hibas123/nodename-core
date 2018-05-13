import * as net from "net"
import * as dgram from "dgram";
import { Request } from "./request";
import { PassThrough } from "stream";
export default class Listener {
   private udp: dgram.Socket
   private tcp: net.Server
   constructor(type: "udp" | "tcp", onRequest: (request: Request) => any, port: number, host: string = "0.0.0.0") {
      switch (type) {
         case "udp":
            this.udp = dgram.createSocket("udp4")
            this.udp.on("listening", () => {
               console.log(`UDP Server Listening on ${port}`)
            })

            this.udp.on("message", (message, remote) => {
               let request = new Request(message, (data) => {
                  // console.log("sending:", new Request(data, (a) => 0));
                  this.udp.send(data, remote.port, remote.address)
               })
               onRequest(request);
            })

            this.udp.bind(port, host)
            break;
         case "tcp":
            console.log("Not correct implemented")
            this.tcp = net.createServer((socket) => {
               let length: number;
               let got: number = 0;
               let message = undefined;
               socket.on("data", (data) => {
                  let offset = 0;
                  if (!message) {
                     length = data.readUInt16BE(0);
                     if (length > 2048) return socket.destroy(); //Requests with more that 2k are ignored
                     message = Buffer.alloc(length);
                     offset = 2;
                  }

                  let read = (data.length - offset) > (length - got) ? (length - got) : (data.length - offset);
                  data.copy(message, got, offset, read + offset)
                  got += read;
                  //ToDo don't ignore probably following requests
                  if (got >= length) {
                     let request = new Request(message, (data) => {
                        socket.write(data);
                     })
                     got = 0;
                     message = undefined;
                     length = 0;
                     onRequest(request);
                  }
               });
            });
            this.tcp.listen(port, host);
            break;
         default:
            throw new Error("Unknown socket type")
      }
   }

   close() {
      if (this.udp) {
         this.udp.close();
      } else {
         this.tcp.close();
      }
   }
}