'use strict'

const net = require('net');
const images = require('images');
const render = require('./render');
const parser = require('./parser');

class Request {
    constructor (options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.path = options.path || '/';
        this.port = options.port || '80';
        this.headers = options.headers || {};
        this.body = options.body || {};

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;

            // 使用tcp连接传字符串
            if (connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                });
            }

            // 请求成功，处理返回的字符串,关闭连接
            connection.on('data', data => {
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            })
            // 请求失败，关闭连接
            connection.on('error', err => {
                reject(err);
                connection.end();
            })
        })
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r\n${this.bodyText}`;
    }
}

class ResponseParser {
    constructor () {
        this.state = this.Status_line_start;

        this.statusLine = '';
        this.headers = {};
        this.headerValue = '';
        this.headerKey = '';
        this.bodyParser = null;
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 (\d+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.data
        }
    }

    get isFinished() {
        return this.bodyParser || this.bodyParser.isFinished;
    }

    receive(string) {
        for (let i = 0; i < string.length; i ++) {
            this.state(string.charAt(i));
        }
    }

    Status_line_start(char) {
        if (char === '\r') {
            this.state = this.Status_line_end;
        } else {
            this.statusLine += char;
        }
    }

    Status_line_end (char) {
        if (char === '\n') this.state = this.Header_key;
    }

    Header_key (char) {
        if (char === ':') this.state = this.Header_space;
        else if (char === '\r') this.state = this.Block_end;
        else this.headerKey += char;
    }

    Header_space (char) {
        if (char === ' ') this.state = this.Header_value;
    }

    Header_value (char) {
        if (char === '\r') this.state = this.Header_line_end;
        else this.headerValue += char;
    }

    Header_line_end (char) {
        if (char === '\n') {
            this.state = this.Header_key;
            this.headers[this.headerKey] = this.headerValue;
            this.headerKey = '';
            this.headerValue = '';
        }
    }

    Block_end (char) {
        if (char === '\n') {
            this.state = this.Body;
            if (this.headers['Transfer-Encoding'] === 'chunked') {
                this.bodyParser = new ChunkedBodyParser;
            }
        }
    }

    Body (char) {
        this.bodyParser.receive(char);
    }
}

class ChunkedBodyParser {
    constructor () {
        this.state = this.Waiting_length;

        this.data = '';
        this.isFinished = false;
        this.length = 0;
    }

    receive (char) {
        this.state(char);
    }

    Waiting_length (char) {
        if (char === '\r') this.state = this.Waiting_length_end;
        else {
            this.length *= 16;
            this.length += parseInt(char, 16);
        }
    }

    Waiting_length_end (char) {
        if (this.length === 0) this.isFinished = true;
        else if (char === '\n') this.state = this.Read_chunk;
    }

    Read_chunk (char) {
        this.length --;
        this.data += char;
        if (this.length === 0) this.state = this.Waiting_new_line;
    }

    Waiting_new_line (char) {
        if (char === '\r') this.state = this.Waiting_new_line_end;
    }

    Waiting_new_line_end (char) {
        if (char === '\n') this.state = this.Waiting_length;
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        path: '/',
        port: '8000',
        headers: {
            'mark': 'aaa',
            'sign': 'bbb'
        },
        body: {
            name: 'winter',
            name2: 'summer'
        }
    });

    let response = await request.send();
    let dom = parser.HTMLparser(response.body);
    
    let viewport = images(1000, 600);
    render(viewport, dom);
    viewport.save('viewport.jpg');
}();