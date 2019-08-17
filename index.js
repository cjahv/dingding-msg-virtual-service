const http = require('http');
const https = require('https');

const server = http.createServer(function (req, res) {
    if (req.url === '/send') {
        const data = [];
        req.on('data', function (d) {
            data.push(d);
        });
        req.on('end', function () {
            const message = Buffer.concat(data).toString();
            try {
                const data = JSON.parse(message);
                const sendData = JSON.stringify({
                    msgtype: "text",
                    text: {
                        content: data.message
                    }
                });
                const result = https.request(`https://oapi.dingtalk.com/robot/send?access_token=${data.api_id}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, function (res1) {
                    const resultDataBuffer = [];
                    res1.on("data", function (d) {
                        resultDataBuffer.push(d);
                    });
                    res1.on("end", function () {
                        try {
                            const resultData = JSON.parse(Buffer.concat(resultDataBuffer).toString());
                            if (resultData.errcode === 0) {
                                res.writeHead(200);
                                res.end();
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    });
                    res1.on("error", function (e) {
                        console.error(e);
                    });
                });
                result.on('error', function (e) {
                    console.error(e);
                });
                result.write(sendData);
                result.end();
            } catch (e) {
                console.error(e);
            }
        });
        req.on('error', function (e) {
            console.error(e);
        })
    }
});

server.listen(6450);
