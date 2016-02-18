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
			'Form':  'Form'
		},

		RegisterAction: {
			Save: 'Save',
			Submit: 'Submit',
			Cancel: 'Cancel'
		},

		RegisterActionButton: {
			New: [
				{name: "Submit", type: "Accept"},
				{name: "Save"},
			],

			Drafted: [
				{name: "Submit", type: "Accept"},
				{name: "Save"},
			],

			Submitted: [
				{name: "Cancel", type: "Reject"},
			],

			Approved: [
				{name: "Cancel", type: "Reject"},
			],

			Rejected: [
				{name: "Submit", type: "Accept"},
				{name: "Save"},
			],

			Canceled: []
		}
	};
});