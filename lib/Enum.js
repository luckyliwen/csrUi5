sap.ui.define([], function() {
	"use strict";

	//some common value 
	return {
		//status of the resiter
		Status: {
			New:     "New",   //just start to edit
			Drafted: 'Drafted',
			Submitted: "Submitted",
			Approved :  "Approved",
			Rejected:  "Rejected",
			Canceled:  "Canceled"
		},

		AttachmentType: {
			'Id': 'Id',
			'Photo': 'Photo',
			'Form':  'Form',
			"Residence" : "Residence"
		},

		RegisterAction: {
			Save: 'Save',
			Submit: 'Submit',
			Cancel: 'Cancel'
		},

		UpdateFlag: {
			RequestJoin: 'rj',  //request to join team
			New:          'new'  //new registration
		},

		RegisterActionButton: {
			New: [
				{name: "Submit", type: "Accept",  icon: "sap-icon://activate"},
				{name: "Save", icon: "sap-icon://save"},
			],

			Drafted: [
				{name: "Submit", type: "Accept", icon: "sap-icon://activate"},
				{name: "Save", icon: "sap-icon://save"},
			],

			Submitted: [
				{name: "Cancel", type: "Reject",  icon: "sap-icon://sys-cancel"},
			],

			Approved: [
				{name: "Cancel", type: "Reject", icon: "sap-icon://sys-cancel"},
			],

			Rejected: [
				{name: "Submit", type: "Accept", icon: "sap-icon://activate"},
				{name: "Save", icon: "sap-icon://save"},
			],

			Canceled: []
		},

		ProjectName : "marathon2016"
	};
});