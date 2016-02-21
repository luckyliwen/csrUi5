var gf,gc,gm, gsel;
sap.ui.define([
	"csr/lib/BaseController",
	"csr/lib/Enum",
	"csr/lib/Config",
	"csr/lib/Util",
], function(BaseController, Enum, Config, Util) {
	"use strict";

var ControllerController = BaseController.extend("csr.register.controller.Register", {
	onInit:function() {
		BaseController.prototype.onInit.call(this);

		this.setModel(Config.getModel(), "cfg");

    	gf = this.byId("registerForm");
		gc = this; 

		this.oDataModel = this.getModel('odata');
		this.oDataModel.setUseBatch(false);

		this.oFooterBar = this.byId('footerBar');

		this.mRegister = {};
		this.getMyResistration();

		this.oSubmitBtn = null;
		this.oCancelBtn = null;
		this.oSaveBtn = null;
		//lastPendingAction  aNeedUploader
		this.oUploader = {};
		for (var key in Enum.AttachmentType) {
			var name = 'oUploader' + key;
			var id = "fileUploader" + key;

			this.oUploader[ key ] = this.byId(id);

			//this[name].setUploadUrl
			// this.oUploader[ key ].attachSelectFile(this.checkButtonStatus, this);
		}
	},
	
	fmtPageTitle: function( status ) {
	    return "My Regisgter : status [ " + status + " ]";
	},
	

	onGetInitialDataFinished: function( evt ) {
	    var oModel = new sap.ui.model.json.JSONModel();
    	oModel.setData( this.mRegister );
    	oModel.setDefaultBindingMode("TwoWay");
    	this.oModel = oModel;
    	this.setModel(oModel);

		this.createOrUpdateFooterButton();
		this.checkButtonStatus();
	},
	
	getMyResistration: function() {
		var that = this;
		function onGetMyRegistrationSuccess(oData) {
			that.getView().setBusy(false);

			delete oData.__metadata;
			delete oData.AttachmentDetails;
			delete oData.DonationDetails;

	    	//also set the defaultValue for the selection for the null part 
	    	var config = Config.getConfigure();
	    	for (var key in config) {
	    		var value = config[key];
	    		if ( key in oData && oData[key] == null && value.defaultValue) {
	    			var selection = that.byId(key);
	    			if (selection instanceof csr.lib.SelectExt) {
	    				oData[key] = value.defaultValue;
	    				selection.setSelectedKey();
	    			}
	    		}
	    	}

	    	//set model two way
			that.mRegister = oData; 
			//by default the initial file name is ""
			that.mRegister.FileNameId = "";
			that.mRegister.FileNamePhoto = "";
			that.mRegister.FileNameForm = "";

			//get the attachments informaiton 
			if (that.mRegister.Status != "New") {
				that.getUploadedAttachmentInfo();
			} else {
				that.onGetInitialDataFinished();
			}
		}

		function onGetMyRegistrationError(error) {
			that.getView().setBusy(false);
			Util.showError("Failed to get my registration.", error);
		}

	    this.oDataModel.callFunction("/GetMyRegistration", {
			method: "GET",
			success: onGetMyRegistrationSuccess,
			error: onGetMyRegistrationError
		});

	    this.getView().setBusy(true);
	},
	
	getUploadedAttachmentInfo: function(  ) {
		var url = Util.getMyAttachmentUrl(this.mRegister.UserId);
		var that = this;

		function onGetUploadAttachmentSuccess(oData) {
			for (var i=0; i < oData.results.length; i++) {
				var  attachment = oData.results[i];

				//by the type set the FileName 
				var name = "FileName" + attachment.Type;

				that.mRegister[ name ] = attachment.FileName;
			}

			that.onGetInitialDataFinished();
		}

		function onGetUploadAttachmentError(error) {
			Util.showError("Failed to get Attachment information.", error);
			that.onGetInitialDataFinished();
		} 

	    this.oDataModel.read(url, {
			success: onGetUploadAttachmentSuccess,
			error:  onGetUploadAttachmentError
		});
	},
	
	createOrUpdateFooterButton: function() {
		this.oSubmitBtn = null;
		this.oCancelBtn = null;
		this.oSaveBtn = null;

		//for simple first just delete old button 
		this.oFooterBar.removeAllContentRight();

		var aActionInfo = Enum.RegisterActionButton[ this.mRegister.Status];
		for (var i=0; i < aActionInfo.length; i++) {
			var  info = aActionInfo[i];
			var button = new sap.m.Button({
				text: info.name,
				press: [this.onResigerActionButtonPressed, this]
			});
			//use the data to know how to handle
			button.data('Action', info.name);
			if (info.type) {
				button.setType(info.type);
			}

			this.oFooterBar.addContentRight( button );

			//also set the button 
			var name = 'o' + info.name + 'Btn';
			this[name] = button;
		}
	},

	checkButtonStatus: function( evt ) {
	    //for the save, cancel always enabled 
	    if (this.oSubmitBtn) {
	    	var status = true;

	    	//check all the necessary input is not null
	    	var config = Config.getConfigure();
	    	for (var key in config) {
	    		var value = config[key];
	    		if (value.required) {
	    			if ( key in this.mRegister) {

	    				var realValue = this.mRegister[key];
	    				if ( value.needQuery) {  //for Birthday
	    					realValue = this.byId(key).getValue();
	    				}

	    				if (!realValue) {
	    					status = false;
	    					break;
	    				}
	    			}
	    		}
	    	}

	    	this.oSubmitBtn.setEnabled(status);
	    }
	},
	
	onInputChanged: function( oEvent ) {
	    this.checkButtonStatus();
	},

	onAttachmentSelectChanged: function( oEvent ) {
		//update the value 
		var source = oEvent.getSource();
		var binding = source.getBinding('fileName');
		var path = binding.getPath();
		path = path.substr(1);
		this.mRegister[path] = oEvent.getParameter('fileName');
		
	    this.checkButtonStatus();
	},
	
	
	//as Save, Cancel, Submit has similar logic, so use same function
	onResigerActionButtonPressed: function( oEvent ) {
		var btn = oEvent.getSource();
		var action = btn.data("Action");
		var oldStatus = this.mRegister.Status;
	    var newStatus  = this.getNewStatus( action );
	    var bCreate = true;
	    if (oldStatus != "New") {
	    	bCreate = false;
	    }

	    this.mRegister.Status = newStatus;

	    
	    //for submit, need upload the attachment 
	    var oldAction = action;
	    var that = this;
	    function onRegActionSuccesss( oData) {
	        //then do update 
	        that.uploadAttachments(btn, oldAction);
	    }
	    
	    function onRegActionError(error) {
	    	that.getView().setBusy(false);
	    	that.onActionError(error, oldAction);
	    }

	    // do real action
	    var mParam = {
	    	success: onRegActionSuccesss,
	    	error: onRegActionError
	    };

	    //as there are some extra data, so here need just get the required data 
	    var mData = jQuery.extend({}, true, this.mRegister);
	    delete mData.FileNameId;
	    delete mData.FileNamePhoto;
	    delete mData.FileNameForm;
		delete mData.SubmittedTime;
	    delete mData.ModifiedTime;
	    delete mData.TeamExt;
	    //for the birthday, only when not empty then need format 
	    var birthday = this.byId("Birthday").getValue(); 
	    if (birthday) {
	    	mData.Birthday = this.fmtDateToODataDate(birthday);
	    } else {
	    	delete mData.Birthday;
	    }

	    if (bCreate) {
			this.oDataModel.create("/Registrations", mData, mParam);
	    } else {
	    	var path = "/Registrations('" + this.mRegister.UserId + "')";
			this.oDataModel.update(path, mData, mParam);
	    }

	    //??also need upload the attachments 
	    this.getView().setBusy(true);
	},

	//if save it at same time, then >HTTP Status 500 - Attempting to execute an operation on a closed EntityManager,
	//so change to only when previos finished then do next 
	uploadAttachments: function( btn, action) {
		this.aNeedUploader = [];
		// this.triggeredBtn = btn;

	    for (var key in Enum.AttachmentType) {
	     	var oUploader = this.oUploader[key];
	     	if (oUploader.getModified()) {

	     		this.aNeedUploader.push( [key, oUploader]);
	     	}
	    }

	    if (this.aNeedUploader.length>0) {
	    	// btn.setEnabled(false);
	    	this.lastPendingAction = action;
	    	this.uploadAttachmentStepByStep();
	    } else {
	    	this.getView().setBusy(false);
	    	this.onActionSuccesss(action);
	    }
	},

	uploadAttachmentStepByStep: function( ) {
		var aInfo = this.aNeedUploader.shift();
		if (aInfo) {
			var key = aInfo[0];
			var oUploader = aInfo[1];

			var url = Util.getAttachmentUploaderUrl( this.mRegister.UserId, key, oUploader.getFileName());
			console.error('!! now for ', url);

 			oUploader.setUploadUrl(url);

 			oUploader.upload();
 			//clear flag 
 			oUploader.setModified(false);	
		} else {
			//all finished, can show toast now
			this.getView().setBusy(false);
			this.onActionSuccesss( this.lastPendingAction);
		}
	},

	onUploadFileFinished: function( evt ) {
	    this.uploadAttachmentStepByStep();
	},

	onUploadFileFailed: function( evt ) {
	    this.uploadAttachmentStepByStep();
	},
	

	onActionSuccesss: function(oldAction ) {
		Util.showToast(oldAction + " successful!");
		
		//update the page title 
		this.byId('registerPage').setTitle( this.fmtPageTitle(this.mRegister.Status));

	    this.createOrUpdateFooterButton();
		this.checkButtonStatus();
	},

	onActionError: function( error, oldAction) {
	    Util.showError(oldAction + " failed. Reason: " + error);
	},
	
	
	getNewStatus: function( action ) {
	    if (action == 'Save') {
	    	return 'Drafted';
	    } else if (action == "Submit"){
	    	return "Submitted"; 
	    } else if (action == "Cancel") {
	    	return "Canceled";
	    }
	},
	
});
	
	

	//global data 
	// mRegister:  //the register information
	//oFooterBar	
	//oSubmitBtn, oCancelBtn, oSaveBtn
	//oUploader: {} 
	return ControllerController;
});