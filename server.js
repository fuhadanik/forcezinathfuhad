const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
// Enable CORS for all routes
app.use(cors());

// Global logging middleware
app.use((req, res, next) => {
    console.log(`[Server] Received request: ${req.method} ${req.url}`);
    next();
});

// Proxy API requests to Salesforce
app.use('/services/apexrest', createProxyMiddleware({
    target: 'https://micronetbd.my.salesforce-sites.com/services/apexrest',
    changeOrigin: true,
    secure: false, // You might need this if the target uses self-signed certs or similar issues
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy] Response: ${proxyRes.statusCode} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error(`[Proxy] Error: ${err.message}`);
    }
}));

// Serve static files from the 'src' directory
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/', express.static(path.join(__dirname)));

// Fallback to index.html for SPA routing (if needed, though this is an MPA)
// Fallback to index.html for SPA routing (if needed, though this is an MPA)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/src/index.html to view the app`);
});
