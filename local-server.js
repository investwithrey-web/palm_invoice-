// Palm Resort Invoice Builder - Universal Local & Vercel Server
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp/data' : path.join(BASE_DIR, 'data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const USED_NUMBERS_FILE = path.join(DATA_DIR, 'used_numbers.json');

// MIME types table
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Memory fallback cache for core files to ensure 100% 200 OK on Vercel
const MEMORY_CACHE = {};
try {
  const indexHtmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    MEMORY_CACHE['/'] = fs.readFileSync(indexHtmlPath);
    MEMORY_CACHE['/index.html'] = MEMORY_CACHE['/'];
  }
} catch (e) {
  console.warn('Memory cache notice:', e);
}

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const dev in ifaces) {
    for (const details of ifaces[dev]) {
      if ((details.family === 'IPv4' || details.family === 4) && !details.internal) {
        return details.address;
      }
    }
  }
  return 'localhost';
}

function ensureDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(INVOICES_FILE)) {
      const localInvoices = path.join(BASE_DIR, 'data', 'invoices.json');
      if (fs.existsSync(localInvoices)) {
        try { fs.copyFileSync(localInvoices, INVOICES_FILE); } catch {}
      } else {
        fs.writeFileSync(INVOICES_FILE, '[]', 'utf8');
      }
    }
    if (!fs.existsSync(USED_NUMBERS_FILE)) {
      const localNumbers = path.join(BASE_DIR, 'data', 'used_numbers.json');
      if (fs.existsSync(localNumbers)) {
        try { fs.copyFileSync(localNumbers, USED_NUMBERS_FILE); } catch {}
      } else {
        fs.writeFileSync(USED_NUMBERS_FILE, '[]', 'utf8');
      }
    }
  } catch (err) {
    console.warn('ensureDataFiles notice:', err.message);
  }
}

function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function findFile(relPath) {
  const clean = relPath.replace(/^\//, '');
  const target = clean === '' ? 'index.html' : clean;
  const candidates = [
    path.join(__dirname, target),
    path.join(process.cwd(), target),
    path.resolve(target)
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        return c;
      }
    } catch {}
  }
  return null;
}

const requestHandler = (req, res) => {
  ensureDataFiles();
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/status' && req.method === 'GET') {
    const ip = getLocalIP();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      resort: 'Palm Resort',
      ip: ip,
      port: PORT,
      mobileUrl: `http://${ip}:${PORT}`
    }));
    return;
  }

  if (pathname === '/api/network-info' && req.method === 'GET') {
    const ip = getLocalIP();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ip: ip,
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      mobileUrl: `http://${ip}:${PORT}`
    }));
    return;
  }

  if (pathname === '/api/used-numbers' && req.method === 'GET') {
    const used = readJSON(USED_NUMBERS_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ usedNumbers: used }));
    return;
  }

  if (pathname === '/api/invoices' && req.method === 'GET') {
    const invoices = readJSON(INVOICES_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(invoices));
    return;
  }

  if (pathname === '/api/invoices' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const invoice = JSON.parse(body || '{}');
        const num = parseInt(invoice.invoiceNumber, 10);

        if (isNaN(num) || num < 1 || num > 1000) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invoice number must be between 1 and 1000' }));
          return;
        }

        const usedNumbers = readJSON(USED_NUMBERS_FILE, []);
        const invoices = readJSON(INVOICES_FILE, []);
        const existingIdx = invoices.findIndex(inv => parseInt(inv.invoiceNumber, 10) === num);

        if (existingIdx >= 0 && !invoice.overwrite) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Invoice number ${num} is already used.`
          }));
          return;
        }

        invoice.savedAt = new Date().toISOString();
        if (existingIdx >= 0) {
          invoices[existingIdx] = invoice;
        } else {
          invoices.unshift(invoice);
        }

        if (!usedNumbers.includes(num)) {
          usedNumbers.push(num);
          usedNumbers.sort((a, b) => a - b);
        }

        writeJSON(INVOICES_FILE, invoices);
        writeJSON(USED_NUMBERS_FILE, usedNumbers);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, invoice, usedNumbers }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/invoices/') && req.method === 'DELETE') {
    const num = parseInt(pathname.replace('/api/invoices/', ''), 10);
    let invoices = readJSON(INVOICES_FILE, []);
    let usedNumbers = readJSON(USED_NUMBERS_FILE, []);

    invoices = invoices.filter(inv => parseInt(inv.invoiceNumber, 10) !== num);
    usedNumbers = usedNumbers.filter(n => n !== num);

    writeJSON(INVOICES_FILE, invoices);
    writeJSON(USED_NUMBERS_FILE, usedNumbers);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deleted: num }));
    return;
  }

  // Static File Serving
  const targetPath = pathname === '/' ? '/index.html' : pathname;
  const actualFilePath = findFile(targetPath);

  if (actualFilePath) {
    const ext = path.extname(actualFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(actualFilePath).pipe(res);
    return;
  }

  // Memory fallback for index.html
  if ((targetPath === '/index.html' || targetPath === '/') && MEMORY_CACHE['/']) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(MEMORY_CACHE['/']);
    return;
  }

  // SPA fallback: any page without extension serves index.html
  if (!path.extname(targetPath)) {
    const fallbackIndex = findFile('index.html');
    if (fallbackIndex) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(fallbackIndex).pipe(res);
      return;
    }
    if (MEMORY_CACHE['/']) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(MEMORY_CACHE['/']);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
};

const server = http.createServer(requestHandler);

// Only listen locally if run directly and not in Vercel Serverless
if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`=======================================================`);
    console.log(`🌴 Palm Resort Invoice Builder Server is Live!`);
    console.log(`💻 Local (Mac):    http://localhost:${PORT}`);
    console.log(`📱 Mobile (Phone): http://${ip}:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = requestHandler;
