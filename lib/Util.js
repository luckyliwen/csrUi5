sap.ui.define([
	"sap/m/MessageBox", "sap/m/MessageToast",
	"csr/lib/Config",
	], 
	function(MessageBox, MessageToast, Config) {
	"use strict";

/**
 * Get the last part of one string, for sap.m.Button, then it will get Button
 */
String.prototype.sapLastPart = function(sep) {
	if (sep == undefined)
		sep = ".";

	var pos = this.lastIndexOf(sep);
	if (pos == -1)
		return this;
	else {
		return this.substr(pos + 1);
	}
};

	return {
		showError: function( msg, error ) {
			if (error) {
				var detailMsg = error.message + "\r\nReason: " + error.responseText;
				MessageBox.error(msg, {
					details: detailMsg
				});
			} else {
		    	MessageBox.error(msg);
		    }
		},
		
		showToast : function( msg ) {
		    MessageToast.show(msg);
		},

		getMyAttachmentUrl: function( userId) {
		    // var url = Config.getConfigure().AttachmentUrl;
		    var url = "/Attachments?$filter=UserId eq '" + userId + "'";
		    return url;
		},

		getAttachmentUploaderUrl: function( userId, type, fileName) {
			//??avoid issue,fileName will remove space
			fileName= fileName.trim();
			var url = Config.getConfigure().AttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type + "&FileName=" + fileName;
			return url;
		},

		getAttachmentDownloadUrl: function( userId, type) {
			var url = Config.getConfigure().AttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type ;
			return url;
		},


		getRelativeAttachmentDownloadUrl: function( userId, type) {
			var url = Config.getConfigure().RelativeAttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type ;
			return url;
		},


		setTableColumnsFilterSortProperty: function( table ) {
		    var aCol = table.getColumns();
		    for (var i=0; i < aCol.length; i++) {
		    	var  col = aCol[i];

		    	var template = col.getTemplate();
		    	var prop = "text";
		    	if (template instanceof sap.m.ObjectStatus) {
		    		prop = "state";
		    	}

		    	var binding = template.getBindingInfo(prop);

			    if (binding && binding.parts && binding.parts.length ==1) {
			    	var path = binding.parts[0].path;
			 
			    	col.setSortProperty(path);
			    	col.setFilterProperty(path);
			    }
		    }
		}
		

	};
});