const proxy = require("http-proxy-middleware");

module.exports = app => {
    app.use(
        "/",
        proxy({
            target: process.env.REACT_APP_API_HOST,
            changeOrigin: true
        })
    );
};