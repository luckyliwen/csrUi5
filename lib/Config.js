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

		FirstName: {
			required: true
		},
		LastName: {
			required: true
		},
		UserId: {
			required: true,
		},
		Birthday: {
			required: true,
			//it is strange, need get from the real value 
			needQuery: true
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
				{name: "Chinese"},  {name: "Tai Wan"}, {name: "Germany"} ,{name: "Canada"},
				{name: "Japanese"}, {name: "United State"}, {name: "Belgian"}, {name: "Others"}
			]
		},

		//大部门
		Team: {
			required: true,
			description: "",
			defaultValue: "Labs",
			list: [
				{name: "AGS"},  {name: "GCO"}, {name: "Labs"}, {name: "Others"}
			]
		},

		//称呼
		Title: {
			required: false,
			description: "",
			defaultValue: "Mr.",
			list: [
				{name: "Dr."}, {name: "Mr."}, {name: "Miss"}, {name: "Ms."}
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
			defaultValue: "L",
			list: [
				{name: "XXL"}, {name: "XL"}, {name: "X"}, {name: "L"}, {name: "M"}, {name: "S"}, {name: "XS"}
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

		//following 3 items just for simple check 
		FileNameId: {
			required: true
		},

		FileNamePhoto: {
			required: true
		},
		FileNameForm: {
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
		
	}
});

/*private String firstName;
	private String lastName;
	private String gender;
	private String nationality;
	private String team;
	private String teamExt;
	private String club;
	private String title ; //Mr, Mrs
	private String phone;
	@Column(unique=true)
	private String email;
	private String distance;
	private String tshirtSize;


	: {
			description: "",
			list [
				{name: ""},
				{name: ""}
			}
	},


	*/