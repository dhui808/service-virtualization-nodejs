import MockData from "./lib/MockData.js";
import fs from 'fs';

class AbstractServiceVirtualizationServer {
	
	mockData;
	mockDataHome;
	mockServerName;
	
	constructor(mockServerName) {

		this.mockServerName = mockServerName;
		this.mockDataHome = process.env.servicevirtualizationdata_home;
		this.mockData = new MockData(mockServerName, this.mockDataHome);
	}
	
	doOptions(req,resp) {
		
		this.populateResponseHeader(req, resp);
	}

	// Handle retrieveEntryPageURL, selecting flow/scenario
	// Previously handled by doGet in Servlet-based service
	doConfig(req, resp) {
		
		var retrieveEntryPageURL = Object.keys(req.query)[0];

		// Handles retrieveEntryPageURL request
		if (retrieveEntryPageURL == "retrieveEntryPageURL") {
			this.handleRetrieveEntryPageURL(resp);
			
			return;
		}
		
		// Handle other requests - by default, it is the selecting flow and scenario.
		var isSetFlow = this.addFlowScenarioCookies(req, resp);
//		if (!isSetFlow) {
//			//normal rest GET request
//			var respFilePath = this.findResponseFilePath(req, resp, "_GET");
//
//			this.populateResponse(req, resp, respFilePath);
//		}
	}
	
	handleRetrieveEntryPageURL(resp)  {
		
		resp.setHeader("Content-Type", "application/json");
		resp.setHeader("Charset", "utf-8");
		resp.json({ "entryPageUrl": this.mockData.getEntryPageUrl() });
	}

	doPut(req, resp) {
		
		var respFilePath = this.findResponseFilePath(req, resp, "_PUT");

		this.populateResponse(req, resp, respFilePath);

	}
	
	doPost(req, resp) {
		
		var respFilePath = this.findResponseFilePath(req, resp, "");

		this.populateResponse(req, resp, respFilePath);
	}
	
	getFlowScenarioMap(req) {
		
		var cookies = req.cookies;
		
		var flowScenarioMap = {};
		
		if (null == cookies) return flowScenarioMap;
		
		Object.keys(cookies).forEach(key => {

			if (key == "flow" || key == "scenario") {
				var value = cookies[key];
				flowScenarioMap[key] = value;
			}
		});
		
		return flowScenarioMap;
	}

	populateResponse(req, resp, responseFilePath) {
		
		this.populateResponseHeader(req, resp);
		
		resp.setHeader("Content-Type", this.getContentType());
		
	    var respStr = fs.readFileSync(responseFilePath, 'utf8');
	    
	    resp.json(JSON.parse(respStr));
	    
	    this.handleException(resp, respStr);
	    
	    return respStr;
	}
	
	populateResponseHeader(req, resp) {
		
		resp.setHeader("Allow","GET, PUT, POST, HEAD, TRACE, OPTIONS");
		resp.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);
		resp.setHeader("Access-Control-Allow-Credentials", "true");
		resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
		
		resp.status(200);
	}
	
	addFlowScenarioCookies(req, resp) {

		var flow = req.query.flow;
		var scenario = req.query.scenario;
		
		console.debug(this.mockServerName + " flow:" + flow + " Scenario:" + scenario);
		console.debug("entryPageUrl:" + this.mockData.getEntryPageUrl());
		
		if (null == flow) return false;
		
		this.eraseCookie(req, resp);
		
		let options = {"path": "/"}
		
		resp.cookie('flow', flow, options);
		resp.cookie('scenario', scenario, options);
		
		return true;
	}
	
	eraseCookie(req, resp) {
		
		var cookies = req.cookies;
		
		if(cookies == null) return;
		
		let options = {"path": "/", "maxAge": 0};
		
		Object.keys(cookies).forEach(key => {
			var value = cookies[key];
			resp.cookie(key, value, options);
		});
	}
	
	adjustResponseFile(responseFile, req, resp, method) {
		//By default, the responseFile in the alternateResponseFileMap will alternate with the 2nd version;
		var alternateResponseFiles = this.mockData.getAlternateResponseFiles();
		var filePathNoSuffix = responseFile.substring(0, responseFile.indexOf(".json"));
		var responseFileName = filePathNoSuffix.substring(filePathNoSuffix.lastIndexOf("/") + 1);

		var pathInfo = this.getPathInfo(req);
		
		if((pathInfo + method).includes(alternateResponseFiles)) {
			var sendAlternate = this.changeCountCookie(responseFileName, req, resp);
			if (sendAlternate) {
				responseFile = filePathNoSuffix + "2.json";
			}
		}
		
		return responseFile;
	}
	
	changeCountCookie(responseFileName, req, resp) {
		
		var sendAlternate = false;
		var foundCookie = false;
		var cookies = req.cookies;
		
		if (null == cookies) cookies = {};
		
		let options = {"path": "/"};
		
		var items = Object.keys(cookies).filter(key => key == responseFileName);
		
		if (null != items && items.length > 0) {

			var key = items[0];
			
			//key == responseFileName
			foundCookie = true;
			var count = cookies[key];
			var value;
			
			if ("0" == count) {
				value ="1";
				sendAlternate = true;
			} else {
				value = "0";
			}
			
			resp.cookie(key, value, options);
		}
		
		if (!foundCookie) {
			resp.cookie(responseFileName, "0", options);
		}
		
		return sendAlternate;
	}

	handleException(resp, respStr) {
		//By default, do nothing
	}
	
	getPathInfo(req) {
		return req.url.match('^[^?]*')[0];
	}
	
	getContentType() {}
	
	findResponseFilePath( req, resp, method) {}
	
}

class SoapMockServer extends AbstractServiceVirtualizationServer {

	constructor(mockServerName) {
		super(mockServerName);
	}
	
	getContentType() {
		return "application/xml";
	}

	findResponseFilePath(req, resp, method) {
		
		var flowScenarioMap = this.getFlowScenarioMap(req);
		var flow = flowScenarioMap["flow"];
		var scenario = flowScenarioMap["scenario"];
		var soapActions = req.headers["SOAPAction"];
		var soapAction = soapActions[0];
		
		console.debug("SOAPAction path:" + soapAction);
		
		var path = soapAction.replace("\"", "");
		var responseFile = this.mockData.findFilePath(path, flow, scenario);
		
		return responseFile;
	}
}
	
class RestMockServer extends AbstractServiceVirtualizationServer {

	constructor(mockServerName) {
		super(mockServerName);
	}
	
	getContentType() {
		return "application/json";
	}
	
	//PUT and GET request have the _PUT and _GET suffix being added to pathInfo for matching.
	//The purpose of this approach is to support the scenarios where PUT/GET/POST request have the same 
	//path in the RESTful services. For suffix POST requests, "" suffix is added.
	findResponseFilePath(req, resp, method) {
		
		var flowScenarioMap = this.getFlowScenarioMap(req);
		var flow = flowScenarioMap["flow"];
		var scenario = flowScenarioMap["scenario"];
		var pathInfo = this.getPathInfo(req);
		var responseFile = this.mockData.findFilePath(pathInfo + method, flow, scenario);
		
		responseFile = this.adjustResponseFile(responseFile, req, resp, method);
		
		console.debug("response file after adjustment;" + responseFile);
		
		return responseFile;
	}	
}

export {
	SoapMockServer,
	RestMockServer
}