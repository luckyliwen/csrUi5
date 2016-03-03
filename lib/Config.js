sap.ui.define([], function() {
	"use strict";

	//some basic configure, so HR can change it
	var mCfg = {
		//the marathon project information
		// project: {
		// 	time:  "2016/03/10",
		// 	location: "慕田峪长城",
		// 	maxNumber : 400,
		// 	lastRegisterTime: "2016/03/02"
		// },

		//AttachmentLoaderUrl: "https://csrodatap1941885273trial.hanatrial.ondemand.com/csrodata/Attachment", 
		AttachmentLoaderUrl: "/attachmentUploader", 
		// AttachmentLoaderUrl: "http://localhost:8524/csrodata/Attachment", 
		RelativeAttachmentLoaderUrl: "https://flpportal-p1941885273trial.dispatcher.hanatrial.ondemand.com/sap/fiori/csr/attachmentUploader",
		// RelativeAttachmentLoaderUrl: "http://localhost:8524/csrodata/Attachment", 

		FormDownloadUrl: "https://csrodatap1941885273trial.hanatrial.ondemand.com/csrodata/MarathonFom.zip",
		// FormDownloadUrl: "http://localhost:8524/csrodata/Runner_Form.pdf",
		// FormDownloadUrl: "http://localhost:8524/csrodata/MarathonFom.zip",

		FirstName: {
			required: true
		},
		LastName: {
			required: true
		},
		UserId: {
			required: true,
		},
		Age: {
			required: true,
		},

		RegLastName: {
			required: true,
		},
		RegFirstName: {
			required: true,
		},
		Phone: {
			required: true,
		},


		//性别
		Gender: {
			required: true,
			description: "",
			defaultValue: "Male",
			list: [
				{name: "Male"}, {name: "Femal"}
			]
		},

		//国籍
		Nationality: {
			required: true,
			description: "Please select nationality from list, choose other if not matched",
			defaultValue: "Chinese",
			list: [
				{name: "Chinese"},  {name: "Taiwanese"}, {name: "Hong Kong"}, {name: "German"},
				{name: "Canadian"},  {name: "American"}, {name: "Singaporean"}, {name: "Australian"},
				{name: "Japanese"}, {name: "British"}, {name: "Malaysian"}, {name: "Indian"},
				{name: "French"}, {name: "South African"}, {name: "Dutch"}, {name: "Korean"},
				{name: "New Zealand"}, {name: "Others"}
			]
		},

		//大部门
		Department: {
			required: true,
			description: "",
			defaultValue: "P&I",
			list: [
				{name: "GSS"},  {name: "GCO"}, {name: "P&I"}, {name: "HR"},
				{name: "GFA"}, {name: "IT"}, {name: "oCEO (Marketing, CA, GR, GPO PSD, GPO OEM…)"},
				{name: "Business Network"}, {name: "Others"},
			]
		},

		//称呼
		Title: {
			required: false,
			description: "",
			defaultValue: "Mr",
			list: [
				{name: "Mr"}, {name: "Mrs"}, {name: "Ms"}
			]
		},


		
		Distance: {
			required: true,
			description: "",
			defaultValue: "1 Marathon (42 KM)",
			list: [
				{name: "1 Marathon (42 KM)"},
				{name: "1/2 Marathon (21 KM)"},
				{name: "Fun Run (8.5 KM) SAP team building option"}
			]
		},

		TshirtSize: {
			required: true,
			description: "",
			defaultValue: "L (160m*88A)",
			list: [
				{name: "XXXL"}, 
				{name: "XXL"}, 
				{name: "XL"}, 
				{name: "X"}, 
				{name: "L (160m*88A)"}, 
				{name: "M"}, 
				{name: "S"}, 
				{name: "XS"}
			]
		},

		Club: {
			required: false,
			description: "None",
			defaultValue: "None",
			list: [
				{name: "None"}, {name: "SAP Runner Club - Shanghai"}, 
				{name: "SAP Runner Club - Beijing"}, 
				{name: "Others"}
			]
		},

		Location: {
			required: true,
			description: "",
			defaultValue: "Shang hai",
			list: [
				{name: "Beijing"}, {name: "Shanghai"}, 
				{name: "Dalian"},  {name: "Xi'an"},  {name: "Nanjing"},  {name: "Guangzhou"}, 
				{name: "Shenzhen"}, {name: "Chengdu"}, {name: "HongKong"},{name: "Taipei"}, 
				{name: "Others"}
			]
		},

		//following 3 items just for simple check 
		FileNameId: {
			required: true
		},

		FileNamePhoto: {
			required: true
		},
		FileNameForm: {
			required: true
		},
		FileNameResidence: {
			required: true
		}
	};

	return {
		getModel: function( ) {
		    var oModel = new sap.ui.model.json.JSONModel();
        	oModel.setData( mCfg );
        	return oModel;
		},

		getConfigure: function() {
		    return mCfg;
		},

		isOtherNationality: function( value ) {
			for (var i=0; i < mCfg.Nationality.list.length; i++) {
				if (value == mCfg.Nationality.list[i].name) {
					return false;
				}
			}
		    return true;
		}
	}
});
