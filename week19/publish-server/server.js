const http = require('http');
const querystring = require('querystring');
const https = require('https');

const unzipper = require('unzipper');

// 临时码换令牌
function auth(req, res) {
    let query = querystring.parse(req.url.match(/^\/auth\?([\s\S]*)/)[1]);
    getToken(query.code, result => {
        let token = result.access_token;
        res.end(`<a href="http://127.0.0.1:8802/?token=${token}">publish</a>`);
    })
}

function getToken(code, result) {
    let request = https.request({
        host: 'github.com',
        method: 'POST',
        path: `/login/oauth/access_token?code=${code}&client_id=Iv1.22f368ed9c8afc52&client_secret=46bbddfabf295f16eef533abc6a32bdab0107ac0`,
        headers: {
            Accept: 'application/json'
        }
    }, res => {
        let body = '';
        res.on('data', chunk => body += chunk.toString());
        res.on('end', () => result(JSON.parse(body)));
    });
    request.end();
}

// 使用token获取用户信息
function publish(req, res) {
    let token = querystring.parse(req.url.match(/^\/publish\?([\s\S]*)/)[1]).token;
    getuser(token, info => {
        if (info.id != 29832006) return res.end('failure\n');
        req.pipe(unzipper.Extract({ path: '../server/public' }))
        req.on('end', () => {
            res.end('publish success\n');
        })
    });
}

function getuser(token, cb) {
    let request = https.request({
        host: 'api.github.com',
        path: '/user',
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'hcb-oauth'
        }
    }, res => {
        let body = '';
        res.on('data', chunk => body += chunk.toString())
        res.on('end', () => {
            console.log(body);
            cb(JSON.parse(body));
        })
    })
    request.end();
}


// 路由
http.createServer((req, res) => {
    if (req.url.match(/^\/auth\?/)) 
        return auth(req, res);
    if (req.url.match(/^\/publish\?/)) 
        return publish(req, res);
}).listen(8801, () => {console.log('127.0.0.1:8801')});