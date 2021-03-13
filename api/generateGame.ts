import { VercelRequest, VercelResponse } from "@vercel/node";
import ReadLine from "readline"
import {Readable} from "stream";
import iconv from "iconv-lite"
import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3"
import { createReadStream } from "node:fs";

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const { tdfId }: { tdfId?: string } = req.query;
    const params = {
        Bucket: "lfstats-scorecard-archive",
        Key: `${tdfId}.tdf`
      };
    console.log(`params are ${JSON.stringify(params)}`)

    const s3Client = new S3Client({ region: "us-east-1" });
    const command = new GetObjectCommand(params)

    s3Client.send(command).then(
        (data) => {
            console.log(data)
            const rl = ReadLine.createInterface(data.Body.pipe().createReadStream())
            res.send("success")
        },
        (error) => {
            console.log("error"+error)
            res.send("error")
        }
    )

    /*const rl = ReadLine.createInterface({
        input: s3Client
          .getObjectCommand(params)
          .createReadStream()
          .pipe(iconv.encodeStream("utf8")),
        terminal: false
      });*/
}