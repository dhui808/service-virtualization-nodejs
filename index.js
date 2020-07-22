import express from 'express';
import fs from 'fs';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { MobileWebServiceVirtualizationServer } from './MobileWebServiceVirtualizationServer.js';

var app = express();
app.use(cookieParser());

dotenv.config();

const mockDataHome = process.env.servicevirtualizationdata_home;
const contextpath = process.env.contextpath;
const restpath = process.env.restpath;
const configpath = process.env.configpath;
const uipath = process.env.uipath;
const port = process.env.port;

console.debug("mockDataHome=" + mockDataHome);
console.debug("contextpath=" + contextpath);
console.debug("restpath=" + restpath);
console.debug("configpath=" + configpath);
console.debug("uipath=" + uipath);

app.use(contextpath, express.static(uipath));

var mobileWebServer = new MobileWebServiceVirtualizationServer(mockDataHome);

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
 console.log("MobileWeb Service Virtualization Server running on port " + port);
});