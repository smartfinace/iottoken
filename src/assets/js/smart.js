var SmartApp =  (function (jQ, win, doc){
    "use strict";
    var SmartApp =  {AppInfo: {name: "Smart Crypto", package: "1.9.2", version: "1.0.4", author: "vsmart"} },
        components = {docReady: [], docReadyDefer: [], winLoad: [], winLoadDefer: []};

    jQ(doc).ready(docReady);
    jQ(win).on("load", winLoad);

    function docReady(stmt){
        stmt = (typeof stmt === typeof undefined) ? jQ : stmt;
        components.docReady.concat(components.docReadyDefer).forEach(function(component){ component(stmt); });
    }

    function winLoad(stmt){
        stmt = (typeof stmt === "object") ? jQ : stmt;
        components.winLoad.concat(components.winLoadDefer).forEach(function(component){ component(stmt); });
    }
	
    SmartApp.components   = components;
    SmartApp.docReady 	= docReady;
    SmartApp.winLoad    	= winLoad;

    return SmartApp;
}(jQuery, window, document));