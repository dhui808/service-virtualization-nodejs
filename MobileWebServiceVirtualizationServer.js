import {RestMockServer} from "./AbstractServiceVirtualizationServer.js";

class MobileWebServiceVirtualizationServer extends RestMockServer {

	constructor(mockDataHome) {
		super("mobilewebmockserver", mockDataHome);
	}
	
	handleException(resp, respStr) {
		if ("exception" in JSON.parse(respStr)) {
	    	console.debug("There is exception item in response string.");
	    }
	}
}

export {MobileWebServiceVirtualizationServer}