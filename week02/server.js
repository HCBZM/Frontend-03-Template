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
        response.end('Hello, World!');
    });
}).listen(8000);

console.log('server is running at http://127.0.0.1:8000/');