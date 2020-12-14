const http = require('http');
const fs = require('fs');
const child_process = require('child_process');
const querystring = require('querystring');

const archiver = require('archiver');

//去github授权认证页面
child_process.exec(`start D:\\Google\\Chrome\\Application\\chrome.exe https://github.com/login/oauth/authorize?client_id=Iv1.22f368ed9c8afc52`);

// 带token发布
http.createServer((req, res) => {
    let token = querystring.parse(req.url.match(/^\/\?([\s\S]*)/)[1]).token;
    console.log(token);
    publish(token, info => {
        res.end(info);
    });
}).listen('8802', () => {console.log(8802)})

function publish(token, cb) {
    let request = http.request(
        {
            port: '8801',
            method: 'POST',
            path: `/publish?token=${token}`,
            headers: {
                'Content-Type': 'application/octet-stream',
            }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk.toString());
            res.on('end', () => cb(body));
    });
    
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    
    archive.directory('./sample/', false);
    archive.pipe(request);
    
    archive.finalize();
}