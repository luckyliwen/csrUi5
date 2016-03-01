var gf,gc,gm, gsel;
sap.ui.define([
	"csr/lib/BaseController",
	"csr/lib/Enum",
	"csr/lib/Config",
	"csr/lib/Util",
], function(BaseController, Enum, Config, Util) {
	"use strict";

var ControllerController = BaseController.extend("csr.mng.controller.Main", {
	onInit:function() {
		BaseController.prototype.onInit.call(this);

    	gf = this.byId("detailForm");
		gc = this; 

		this.oDataModel = this.getModel();
		this.oDataModel.setUseBatch(false);

		this.oList = this.byId('registrationList');
		this.oPage = this.byId("detailPage");
		this.oForm = this.byId('detailForm');
		this.oPanel = this.byId('attachmentPanel');
		this.currentUserId = "";
		this.currentBindingpath = "";

		this.byId("deleteBtn").setEnabled(false);
		this.byId("approveBtn").setEnabled(false);
		this.byId("rejectBtn").setEnabled(false);

		var oModel = new sap.ui.model.json.JSONModel();
		this.mAttachment = {};
    	oModel.setData( this.mAttachment );
    	this.oPanel.setModel(oModel);

    	//oListItemTemplate
    	this.createListTemplate();
    	this.bindList();

    	this.oDataModel.attachRequestCompleted(this.onODataRequestCompleted, this);
	},

	onDownloadExcelPressed: function( evt ) {
	    alert("Coming Soon!");
	},
	

	onNormalVipSegmentSelected: function( evt ) {
	    this.bindList();
	},
	

	onODataRequestCompleted: function( oData ) {
	    console.error(oData);
	},
	
	bindList: function( ) {
		var aFilter = [new sap.ui.model.Filter("Status", 'EQ', 'Submitted')];
		var key = this.byId("segmentBtn").getSelectedButton();
		if (!key) 
			key = "";

		var bVip = (key.indexOf("vipSegment") != -1);

		if (bVip) {
			aFilter.push( new sap.ui.model.Filter("Vip", 'EQ', true));
		} else {
			aFilter.push( new sap.ui.model.Filter("Vip", 'EQ', false));
		}

	    this.oList.bindItems({
	    	path: "/Registrations",
	    	sorter: new sap.ui.model.Sorter("SubmittedTime"),
	    	filters: aFilter,
	    	template: this.oListItemTemplate,

	    	/*events: {
				dataReceived: [this.onListDataReceived, this]
			}*/
	    });

	    jQuery.sap.delayedCall(0, this, this.attachDataReceivedEvent);
	},

	attachDataReceivedEvent: function(  ) {
	    var binding = this.oList.getBinding('items');
	    if (binding) {
	    	binding.attachDataReceived(this.onListDataReceived, this);
	    }
	},
	
	
	onListDataReceived: function( oEvent ) {
	    var items = this.oList.getItems();
	    if (items && items.length>0) {
	    	this.oList.setSelectedItem( items[0]);
			this.onListSelectionChanged();
	    }
	},
	
	createListTemplate: function(  ) {
	    var item = new sap.m.ObjectListItem({
	    	title: "{UserId}",
	    	number: "{LastName}, {FirstName}",
	    	firstStatus: new sap.m.ObjectStatus({
	    			text: "{Status}",
	    			state:  {
	    				path: 'Status', 
	    				formatter: this.fmtStatus
	    			}
	    		}),
	    	
	    	attributes: new sap.m.ObjectAttribute({
					text: "{Team}"
				})
	    });
	    this.oListItemTemplate = item;
	},

	onListSelectionChanged: function( oEvent ) {
	    var selItem = this.oList.getSelectedItem();
	    if (!selItem) {
	    	this.oPage.unbindElement();
	    	this.currentUserId = "";
	    	this.currentBindingpath = "";
	    } else {
	    	var binding = selItem.getBindingContext();

	    	this.getUploadedAttachmentInfo(binding);
	    	this.currentUserId = binding.getProperty("UserId");
	    	this.currentBindingpath = binding.getPath();

			this.oPage.bindElement( binding.getPath());
	    }
	},
	
	getUploadedAttachmentInfo: function( binding ) {
		var userId = binding.getProperty("UserId");
		var bindPath = "/" + userId;

		var nationality = binding.getProperty("Nationality");
		var residenceFlag = (nationality != "Chinese"); 
		this.byId("residenceAttachmentBox").setVisible(residenceFlag);

		if ( userId in this.mAttachment) {
			this.oPanel.bindElement(bindPath);
			return ;
		}

		// var url = Util.getMyAttachmentUrl( userId );
		var that = this;

		function onGetUploadAttachmentSuccess(oData) {
			that.oPanel.setBusy(false);
			var mData = {};

			for (var i=0; i < oData.results.length; i++) {
				var  attachment = oData.results[i];
				var type = attachment.Type;
				attachment.src = Util.getAttachmentDownloadUrl(userId, type);

				mData[ type ] = attachment;
			}

			that.mAttachment[userId] = mData;

			//??need check whether has switched 
			if (userId == that.currentUserId) {
				that.oPanel.bindElement(bindPath);
			}
		}

		function onGetUploadAttachmentError(error) {
			that.oPanel.setBusy(false);
			Util.showError("Failed to get Attachment information for ." + userId, error);
		} 

		//by default the initial file name is ""
		this.oPanel.setBusy(true);

	    this.oDataModel.read("/Attachments", {
	    	filters: [new sap.ui.model.Filter("UserId", 'EQ', userId )],
			success: onGetUploadAttachmentSuccess,
			error:  onGetUploadAttachmentError
		});
	},
	

	onDeletePressed: function( oEvent ) {
		var that = this;
	    function onDeleteSuccess( evt ) {
	        that.getView().setBusy(false);
	        Util.showToast("Delete registration successful!");
	        that.bindList();
	    }
	    
	    function onDeleteError(error) {
			that.getView().setBusy(false);
			Util.showError("Delete registration failed. Reason: " + error);
	    }

	    this.oDataModel.remove(this.currentBindingpath, {
	    	success: onDeleteSuccess, 
	    	error:   onDeleteError,
	    });

	    this.getView().setBusy(true);
	},
	

	openRejectDialog: function( fnCallback ) {
	    if (!this.oRejectDialog) {
			this.oRejectDialog = sap.ui.xmlfragment(this.getView().getId(), "csr.mng.view.RejectDialog", this);
		}
		this.oRejectDialog.open();
	},
	
	onDialogCancelPressed: function( evt ) {
	    this.oRejectDialog.close();
	},
	
	onDialogRejectPressed: function( evt ) {
	    this.oRejectDialog.close();
	    var reason = this.byId("reasonTextArea").getValue().trim();
	    this.onApproveRejectPressed(null, reason);
	},
	
	onDialogClearPressed: function() {
	    this.byId("reasonTextArea").setValue("");
	},

	onRejectReasonChanged: function() {
	    var reason = this.byId("reasonTextArea").getValue().trim();
	    this.byId("rejectDialogBtn").setEnabled( !! reason);
	},

	onApproveRejectPressed: function( oEvent, reason) {
		var mData = {};
		var that = this;

		if (reason) {
			mData.Status = Enum.Status.Rejected;
	    	mData.RejectReason = reason;
		} else {
			var id = oEvent.getSource().getId();
			var bApprove = (id.indexOf("approve") != -1);
		    if (bApprove) {
		    	mData.Status = Enum.Status.Approved;
		    } else {
				this.openRejectDialog();
		    	return;
		    } 
		}

	    function onApproveRejectSuccess() {
	        that.getView().setBusy(false);
	        var action = bApprove ? "Approve" : "Reject";
	        Util.showToast(action + " successful!");
	        //move to next item
	    }
	    
	    function onApproveRejectError(error) {
			that.getView().setBusy(false);
			var action = bApprove ? "Approve" : "Reject";
			Util.showError(action + " failed. Reason: " + error);
	    }

	    this.oDataModel.update(this.currentBindingpath, mData, {
	    	success: onApproveRejectSuccess, 
	    	error:   onApproveRejectError,
	    });

	    this.getView().setBusy(true);
	},	

	fmtApproveEnableStatus: function( status ) {

	    if (status == Enum.Status.Submitted) {
	     	return true;
	    } else {
	     	return false;
	    }
	},

	fmtAttachmentLink: function( fileName, type ) {
	    return "Picture for " + type;
	},

	fmtAttachmentSrc: function( attachment ) {
	    if (attachment) {
	    	this.setMine(attachment.Mine);
	    	return attachment.src;
	    } else {
	    	return "";
	    }
	},
	

});

	//global data 

	return ControllerController;
});