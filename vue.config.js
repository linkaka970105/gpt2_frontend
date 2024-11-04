const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// module.exports = {
// 	publicPath: "/",
// 	lintOnSave: true,
// 	productionSourceMap: false,
// 	devServer: {
// 		port: 8080,
// 		open: false,
// 		compress: false,
// 		overlay: {
// 			warnings: false,
// 			errors: true
// 		},

// 		proxy: {
// 			"/api": {
// 				target: "http://119.91.192.119:8089",
// 				changeOrigin: true,
// 				pathRewrite: {
// 					"^/api": "/api"
// 				}
// 			},
// 		}
// 	}
// };