const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

function checkAndRebuildIfNeeded() {
    try {
        const indexPath = path.join(__dirname, 'index.html');
        if (!fs.existsSync(indexPath)) {
            require('child_process').execSync('node build_html.js', { cwd: __dirname });
            return;
        }
        const indexMtime = fs.statSync(indexPath).mtimeMs;
        const binsDir = path.join(__dirname, 'Assets', 'Bins');
        let needsRebuild = false;

        if (fs.existsSync(binsDir)) {
            const files = fs.readdirSync(binsDir);
            for (const f of files) {
                const mtime = fs.statSync(path.join(binsDir, f)).mtimeMs;
                if (mtime > indexMtime) {
                    needsRebuild = true;
                    break;
                }
            }
        }

        const buildScript = path.join(__dirname, 'build_html.js');
        if (fs.existsSync(buildScript) && fs.statSync(buildScript).mtimeMs > indexMtime) {
            needsRebuild = true;
        }

        if (needsRebuild) {
            console.log('[server] Detected newer assets or script. Rebuilding index.html...');
            require('child_process').execSync('node build_html.js', { cwd: __dirname });
            console.log('[server] Auto-rebuild complete.');
        }
    } catch (e) {
        console.warn('[server] Auto-rebuild error:', e.message);
    }
}

try {
    const binsDir = path.join(__dirname, 'Assets', 'Bins');
    if (fs.existsSync(binsDir)) {
        let timer = null;
        fs.watch(binsDir, () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(checkAndRebuildIfNeeded, 300);
        });
    }
} catch (e) {}

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    if (reqPath === '/index.html') {
        checkAndRebuildIfNeeded();
    }

    const filePath = path.join(__dirname, reqPath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Local game server running at http://localhost:${PORT}/`);
});
