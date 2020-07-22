import express from 'express';
import fs from 'fs';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { MobileWebServiceVirtualizationServer } from './MobileWebServiceVirtualizationServer.js';

var app = express();
app.use(cookieParser());

dotenv.config();

const contextpath = process.env.contextpath;
const restpath = process.env.restpath;
const configpath = process.env.configpath;
const port = process.env.port;

console.debug("contextpath=" + contextpath);
console.debug("restpath=" + restpath);
console.debug("configpath=" + configpath);

app.use(contextpath, express.static('static'));

var mobileWebServer = new MobileWebServiceVirtualizationServer();

app.post(contextpath + restpath + configpath, (req, res, next) => {
	console.debug("url=" + req.url);
	mobileWebServer.doConfig(req, res);
	res.end();
});

app.post(contextpath + restpath + "*", (req, res, next) => {
	console.debug("url=" + req.url);
	mobileWebServer.doPost(req, res);
	res.end();
});

app.put("*", (req, res, next) => {
	console.debug("url=" + req.url);
	mobileWebServer.doPut(req, res);
	res.end();
});

app.options("*", (req, res, next) => {
	console.debug("url=" + req.url);
	mobileWebServer.doOptions(req, res);
	res.end();
});

app.listen(port, () => {
 console.log("Server running on port " + port);
});