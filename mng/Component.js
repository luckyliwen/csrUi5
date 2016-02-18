sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"csr/lib/Config",
	"csr/lib/SelectExt",
	"csr/lib/Attachment",
], function(UIComponent, Device, Config,SelectExt,Attachment) {
	"use strict";

	return UIComponent.extend("csr.mng.Component", {

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