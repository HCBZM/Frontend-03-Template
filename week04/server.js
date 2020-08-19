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
        div.flex-container {
            display: flex;
            flexWrap: wrap-reverse;
            flex-wrap: wrap-reverse;
            width: 1000px;
            height: 600px;
            background-color: rgb(255, 192, 203);
        }
        top {
            width: 1000px;
            height: 60px;
            background-color: rgb(190, 60, 50);
        }
        .ordinary {
            width: 200px;
            height: 390px;
            background-color: rgb(255, 165, 0);
        }
        .flex-item {
            flex: 1;
            background-color: rgb(255, 69, 0);
        }
        .flex-item2 {
            background-color: rgb(200, 69, 0);
        }
        bottom {
            width: 1000px;
            height: 30px;
            background-color: rgb(190, 60, 50);
        }
    </style>
</head>
<body>
    <div class="flex-container">
        <top></top>
        <aside class="ordinary"></aside>
        <main class="flex-item"></main>
        <main class="flex-item flex-item2"></main>
        <bottom></bottom>
    </div>
</body>
</html>`);
    });
}).listen(8000);

console.log('server is running at http://127.0.0.1:8000/');