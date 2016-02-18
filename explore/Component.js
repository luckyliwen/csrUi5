sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"csr/lib/Config",
	"csr/lib/UserLink"
], function(UIComponent, Device, Config, UserLink) {
	"use strict";

	//first load some common used controls
	// jQuery.sap.require("sap.m.Label");
	// jQuery.sap.require("sap.m.Text");

	return UIComponent.extend("csr.explore.Component", {

		metadata: {
			manifest: "json"
		},
	
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(Config.getModel(), "cfg");
		}
	});

});