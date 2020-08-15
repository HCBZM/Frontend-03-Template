'use strict'

const http = require('http');

http.createServer((request, response) => {
    let body = [];
    request.on('error', err => {
        console.error(err);
    }).on('data', chunk => {
        body.push(chunk.toString());
    }).on('end', () => {
        // body = Buffer.concat(body).toString();
        console.log('body:', body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(`<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>Document</title>
    <style>
        div img[src=../aaa.jpg] {
            color: yellow;
            background: pink;
            border: 1px solid;
        }
        img[src$=aaa.jpg].123 {
            width: 300px;
            border: 2px solid;
            background: #000;
        }
        div {
            color: yellow;
            background: pink;
        }
        div#pic div.main.pic#main[class~=pic] {
            color: red;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class='div hhh' id="box">hello world!</div>
    <div id="pic">
        <img class="123" src="../aaa.jpg" />
        <div class="main pic" id="main">
            main
        </div>
    </div>
</body>
</html>`);
    });
}).listen(8000);

console.log('server is running at http://127.0.0.1:8000/');