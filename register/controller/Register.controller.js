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

		//myTeamId,  myTeamName
	},
	
	fmtPageTitle: function( status ) {
	    return "My Registration : status [ " + status + " ]";
	},
	

	onDownloadFormPressed: function( evt ) {
	    window.open(Config.getConfigure().FormDownloadUrl, "_blank");
	},

	onManageTeamPressed: function( evt ) {
		if (!this.oTeamMngDialog) {
			this.oTeamMngDialog = sap.ui.xmlfragment(this.getView().getId(), "csr.register.view.TeamMng", this);
			this.oTeamTable  = this.byId("teamTable");

			//so for the first time it will get the data
			this.oTeamTable.setModel( this.oDataModel );

			this.loadMyTeamInformation();
		}
		this.oTeamMngDialog.open();
	},

	loadMyTeamInformation: function( ) {
		var that = this;

		function onGetMyTeamSuccess(oData) {
			that.oTeamMngDialog.setBusy(false);
			if (oData.results.length >0) {
				that.byId("teamNameInput").setValue( oData.results[0].Name);
				that.byId("changeTeamBtn").setVisible(true);

				that.myTeamId = oData.results[0].TeamId;
			} else {
				that.byId("createTeamBtn").setVisible(true);
			}
		}

		function onGetMyTeamError(error) {
			that.oTeamMngDialog.setBusy(false);
			Util.showError("Failed to get my create team.", error);
		}



		// var url = "/Teams?$filter=OwnerId eq '" + that.mRegister.UserId + "'";
	    this.oDataModel.read("/Teams", {
	    	filters: [new sap.ui.model.Filter("OwnerId", 'EQ', that.mRegister.UserId)],
			success: onGetMyTeamSuccess,
			error: onGetMyTeamError
		});

		that.oTeamMngDialog.setBusy(true);
	},

	onTeamNameChanged : function( evt ) {
		var source = evt.getSource();
	    var val = source.getValue().trim();
	    if ( val.length> 0) {
			this.byId("createTeamBtn").setEnabled(true);
	    }

	    if (this.myTeamName != val) {
	    	this.byId("changeTeamBtn").setEnabled(true);
	    } 
	},
	

	onCreateOrChangeTeamPressed: function( evt ) {
	    var bCreate = true;
	    if (evt.getSource().getId().indexOf("changeTeamBtn")!= -1) {
	    	bCreate = false;
	    }

	    var that = this;
	    function onCreateOrChangeSuccess(oData) {
			that.oTeamMngDialog.setBusy(false);
			if (bCreate) {
				Util.showToast("Create team successful!");

				that.myTeamName = that.byId("teamNameInput").getValue();
				that.byId("changeTeamBtn").setVisible(true);
				that.byId("changeTeamBtn").setEnabled(false);

				that.byId("createTeamBtn").setVisible(false);

				that.myTeamId = oData.TeamId;

				//if already have the rigistration, and team id not set, then set it here
				if ( that.mRegister.TeamId == "0" && that.mRegister.Status != "New") {
					//if is new, then when it create registration, it will create automatically 
					that.onTeamRequestJoinPressed(null, oData.TeamId);
				}
			} else {
				Util.showToast("Change team name successful!");
				that.byId("changeTeamBtn").setEnabled(false);
			}
	    }

	    function onCreateOrChangeError(error) {
	    	that.oTeamMngDialog.setBusy(false);
	    	var action = bCreate ? "Create new team " : " change team name";
	    	Util.showError("Failed to " + action, error);
	    }

	    var mParam = {
	    	success: onCreateOrChangeSuccess,
	    	error: onCreateOrChangeError
	    };

		var mData;
	    if (bCreate) {
	    	mData = {
	    		Name: this.byId("teamNameInput").getValue(),
	    		OwnerId: this.mRegister.UserId
	    	};
	    	this.oDataModel.create("/Teams", mData, mParam);
	    } else {
	    	var url = "/Teams("  + this.myTeamId + "L)";
	    	mData = { Name: this.byId("teamNameInput").getValue() };
	    	this.oDataModel.update(url,  mData, mParam);
	    }
	    this.oTeamMngDialog.setBusy(true);
	},
	
	onTeamMngCancelPressed: function( evt ) {
	    this.oTeamMngDialog.close();
	},
		
	//when press Request to join,  it may have the Registration or not	  
	onTeamRequestJoinPressed: function( evt,  createdTeamId ) {
		//which row it selected
	    var bCreate = true;
		if (this.mRegister.Status != "New") {
	    	bCreate = false;
	    }
		var selTeamId = createdTeamId ?  createdTeamId: this.getSelectedRowTeamId();

	    var that  = this;

	    function onCreateOrChangeRegistSuccess() {
	    	if ( !createdTeamId)
	    		Util.showToast("Request join team successful!");

			that.oTeamMngDialog.setBusy(false);
			that.mRegister.TeamId = selTeamId;
			that.byId("requestJoinBtn").setEnabled( false);

			//after join then the table need refresh
			that.oTeamTable.bindRows('/Teams');
		}

	    function onCreateOrChangeRegistError(error) {
	    	that.oTeamMngDialog.setBusy(false);
	    	Util.showError("Request to join team failed.", error);
	    }
	    var mParam = {
	    	success: onCreateOrChangeRegistSuccess,
	    	error: onCreateOrChangeRegistError
	    };

		var mData = {
			UserId:  this.mRegister.UserId,
			TeamId:  selTeamId
		};

	    if (bCreate) {
	    	mData.Status = 'New';
	    	mData.FirstName = this.mRegister.FirstName;
	    	mData.LastName = this.mRegister.LastName;
	    	
	    	//here it need set the UpdateFlag
	    	mData.UpdateFlag = Enum.UpdateFlag.New;
			this.oDataModel.create("/Registrations", mData, mParam);
	    } else {
	    	var path = "/Registrations('" + this.mRegister.UserId + "')";
	    	mData.UpdateFlag = Enum.UpdateFlag.RequestJoin;
			this.oDataModel.update(path, mData, mParam);
	    }
	    this.oTeamMngDialog.setBusy(true);
	},
	
	getSelectedRowTeamId : function() {
	    var row = this.oTeamTable.getSelectedIndex();
	    if (row == -1)
	    	return -1;

		var context = this.oTeamTable.getContextByIndex(row);
		return context.getProperty("TeamId");
	},

	
	onTeamTableRowSelectChanged: function( evt ) {
	    var selTeamId = this.getSelectedRowTeamId();
	    var flag = false;
	    if (selTeamId != -1) {
	    	flag = selTeamId != this.mRegister.TeamId;
	    }

	    this.byId("requestJoinBtn").setEnabled( flag  );
	},
	

	onNationalityChanged: function( evt ) {
		var  selKey = this.byId("Nationality").getSelectedKey();
		var flag = (selKey == 'Others');
	    var input = this.byId("OtherNationality").setEnabled(flag);

	    this.adjustAttachmentUi();
	},

	adjustAttachmentUi: function( evt ) {
		var bChinese = this.mRegister.Nationality == 'Chinese';
		this.byId("labelUploaderResidence").setVisible( !bChinese );
		this.byId("fileUploaderResidence").setVisible( !bChinese );
	},
	  

	onGetInitialDataFinished: function() {
	    var oModel = new sap.ui.model.json.JSONModel();
    	oModel.setData( this.mRegister );
    	oModel.setDefaultBindingMode("TwoWay");
    	this.oModel = oModel;
    	this.setModel(oModel);

		this.createOrUpdateFooterButton();
		this.onNationalityChanged();

		this.checkButtonStatus();
	},
	
	getMyResistration: function() {
		var that = this;
		function onGetMyRegistrationSuccess(oData) {
			that.byId("mngTeamBtn").setEnabled(true);
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
	    				// selection.setSelectedKey();
	    			}
	    		}
	    	}

	    	//set model two way
			that.mRegister = oData; 
			//by default the initial file name is ""
			that.mRegister.FileNameId = "";
			that.mRegister.FileNamePhoto = "";
			that.mRegister.FileNameForm = "";
			that.mRegister.FileNameResidence = "";
			//db only store nationality, but UI need two variables
			if ( Config.isOtherNationality(  that.mRegister.Nationality) ) {
				that.mRegister.OtherNationality = that.mRegister.Nationality;
				that.mRegister.Nationality = "Others";
			}  else {
				that.mRegister.OtherNationality = "";
			}

			if (that.mRegister.Age === 0) {
	    		delete that.mRegister.Age;
	    	}

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
		// var url = Util.getMyAttachmentUrl(this.mRegister.UserId);
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

	    this.oDataModel.read("/Attachments", {
	    	filters: [new sap.ui.model.Filter("UserId", 'EQ', that.mRegister.UserId)],
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
				icon: info.icon,
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
	    				//for chinese, no need check residence permit
	    				if ( key == "FileNameResidence" && !this.byId("fileUploaderResidence").getVisible()) 
	    					continue;

	    				var realValue = this.mRegister[key];
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
		//for the age, need check ??

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
	    delete mData.FileNameResidence;
		delete mData.SubmittedTime;
	    delete mData.ModifiedTime;
	    delete mData.OtherNationality;
	   
	    //for nationality, need combine value 
	    var  selKey = this.byId("Nationality").getSelectedKey();
		var flag = (selKey == 'Others');
	    if (flag) {
	    	mData.Nationality  = this.byId("OtherNationality").getValue();
	    }

	    //for the null value, need delete 
	    for (var key in mData) {
	    	if ( mData[key] == null) {
	    		delete mData[key];
	    	}
	    }

	    //for the Age, need use the number
	    if (mData.Age) {
	    	mData.Age = parseInt(mData.Age);
	    }

	    if (bCreate) {
	    	//for new Registration, it need backend check whether has the initial team or not
	    	mData.UpdateFlag = Enum.UpdateFlag.RequestJoin;
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
	     	if (oUploader.getVisible() && oUploader.getModified()) {
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
	    Util.showError(oldAction + " failed." + error);
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