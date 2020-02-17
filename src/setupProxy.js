const proxy = require('http-proxy-middleware');
console.log('Proxy 23')

module.exports = function(app) {
  app.use(proxy('/uploads', {
    target: 'https://airettdev.s3-eu-central-1.amazonaws.com',
    changeOrigin: true,
  }));
};
