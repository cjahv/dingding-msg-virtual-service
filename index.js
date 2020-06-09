const http = require("http");
const qs = require("querystring");
const https = require("https");

const access_token = process.env.ACCESS_TOKEN || process.argv[2];

if (!access_token || access_token.length !== 64) {
    throw new Error("请设置access_token，可以设置环境变量ACCESS_TOKEN或使用node index.js <access_token>");
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        let buffers = [];
        stream.on("error", reject);
        stream.on("data", (data) => buffers.push(data));
        stream.on("end", () => resolve(Buffer.concat(buffers)));
    });
}

const server = http.createServer(async function (req, res) {
    if (req.url.startsWith("/send")) {
        try {
            let data;
            if (req.method === "GET") {
                data = qs.parse(req.url.substr(req.url.indexOf("?") + 1));
            } else if (req.method === "POST") {
                data = await streamToBuffer(req);
                data = JSON.parse(data);
            } else {
                console.error("unsupported method");
            }
            const sendData = JSON.stringify({
                msgtype: "text",
                text: {
                    content: data.message,
                },
            });
            console.log(sendData);
            const sendOption = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const result = https.request(`https://oapi.dingtalk.com/robot/send?access_token=${access_token}`, sendOption, function (res1) {
                const resultDataBuffer = [];
                res1.on("data", function (d) {
                    resultDataBuffer.push(d);
                });
                res1.on("end", function () {
                    try {
                        const resultData = JSON.parse(Buffer.concat(resultDataBuffer).toString());
                        if (resultData.errcode === 0) {
                            res.writeHead(200);
                            console.log("send success!");
                            res.end();
                        } else {
                            console.log("send error!", resultData);
                            res.end();
                        }
                    } catch (e) {
                        console.error(e);
                        res.end();
                    }
                });
                res1.on("error", function (e) {
                    console.error(e);
                    res.end();
                });
            });
            result.on("error", function (e) {
                console.error(e);
            });
            result.write(sendData);
            result.end();
        } catch (e) {
            console.error(e);
            res.end();
        }
    } else {
        console.log("no api", req.url);
        res.end();
    }
});

server.listen(6450, function () {
    console.log("server run on", server.address().port);
});
