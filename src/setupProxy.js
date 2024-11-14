const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        proxyReq.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      }
    })
  );
};
