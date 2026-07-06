const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8081;
const DIST_DIR = path.join(__dirname, 'dist');

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    let urlPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, urlPath);

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) {
            filePath = path.join(filePath, 'manifest.json');
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                console.log(`404 Not Found: ${filePath}`);
                res.writeHead(404);
                res.end('File not found');
            } else {
                let contentType = 'text/plain';
                if (filePath.endsWith('.js')) contentType = 'text/javascript';
                if (filePath.endsWith('.json')) contentType = 'application/json';
                
                console.log(`200 OK: ${filePath}`);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
    
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) return;
            console.log(`Also available on your network at: http://${iface.address}:${PORT}/`);
        });
    });
});
