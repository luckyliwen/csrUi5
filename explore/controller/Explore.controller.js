var gf,gc,gm, gsel;
sap.ui.define([
	"csr/lib/BaseController",
	"csr/lib/Enum",
	"csr/lib/Config",
	"csr/lib/Util",
	'sap/ui/model/json/JSONModel',
], function(BaseController, Enum, Config, Util,JSONModel) {
	"use strict";

var ControllerController = BaseController.extend("csr.explore.controller.Explore", {
	onInit:function() {
		BaseController.prototype.onInit.call(this);

		gc = this; 
		this.aTeam = [];
		this.oDataModel = this.getModel();
		this.oDataModel.setUseBatch(false);

		this.oRegTable = this.byId('registrationTable');
		this.oDonationTable = this.byId("donationTable");
		this.oTeamDonationTable = this.byId("teamDonationTable");
		this.oReceivedTable = this.byId("receivedDonationTable");
		this.oGivingTable = this.byId("givingDonationTable");

		Util.setTableColumnsFilterSortProperty(this.oRegTable);
		Util.setTableColumnsFilterSortProperty(this.oDonationTable);
		Util.setTableColumnsFilterSortProperty(this.oReceivedTable);
		Util.setTableColumnsFilterSortProperty(this.oGivingTable);
		Util.setTableColumnsFilterSortProperty(this.oTeamDonationTable);

		this.oVizBox = this.byId("vizBox");
		this.oRegViz = this.byId("registrationViz");
		this.oReceivedViz = this.byId("receivedViz");
		this.oGivingViz = this.byId("givingViz");
		
		
		this.userId = "";
		this.oModel = new JSONModel(); 
		this.oVizBox.setModel( this.oModel);
		this.oTeamDonationTable.setModel(this.oModel);

		this.mSta = {};
		this.loadTeamInfor();
	},

	loadTeamInfor: function( ) {
	    var that = this;

		function onGetTeamInfoSuccess( oData) {
			that.aTeam = oData.results;
			that.initDonationPart();
			that.initVizPart();

			that.oRegTable.bindRows("/Registrations");
		}
		
	    function onGetTeamInfoError(error) {
			Util.showError("Failed to get team information.", error);
		}

	    this.oDataModel.read("/Teams", {
			success: onGetTeamInfoSuccess,
			error: onGetTeamInfoError
		});
	},
	

	initDonationPart: function(  ) {
		var that = this;

		function onGetUserInfoSuccess( oData) {
			if (!that.userId) {
		    	that.userId = oData.UserId;
			} else {
				//just for fresh
				that.oDonationTable.bindRows("/Donations");
			}

		    that.oReceivedTable.bindRows({
		    	path: "/Donations", 
		    	filters: [new sap.ui.model.Filter("DonatoryId", 'EQ', that.userId)],
		    });

		    that.oGivingTable.bindRows({
				path: "/Donations", 
		    	filters: [new sap.ui.model.Filter("DonatorId", 'EQ', that.userId)]
		    });
		}
		
	    function onGetUserInfoError(error) {
			Util.showError("Failed to call GetUserInfo.", error);
		}

		if (!this.userId) {
		    this.oDataModel.callFunction("/GetUserInfo", {
				method: "GET",
				success: onGetUserInfoSuccess,
				error: onGetUserInfoError
			});
		} else {
			//used for auto refresh
			onGetUserInfoSuccess();
		}

	},

	initVizPart: function( evt ) {
		this.setVizPartProp();	    

        //and try to get the result 
        var that = this;

		function onGetStatisticsSuccess(oData) {
			that.byId("vizBox").setBusy(false);
			
			var content = oData.GetStatistics;
			that.mSta  = JSON.parse(content);
			that.oModel.setData( that.mSta);
			// this.oRegViz.setModel(dataModel);
			// 
			var info = "Total amount: " + that.mSta.Donation.Total + " (rmb), donatation count: " 
				+ that.mSta.Donation.Count + " (times)"; 
			that.oDonationTable.setTitle(info);
		}
        

        function onGetStatisticsError(error) {
			that.byId("vizBox").setBusy(false);
			Util.showError("Failed to get my Statistics.", error);
		}

	    this.oDataModel.callFunction("/GetStatistics", {
	    	urlParameters: { Top: "10", '$format': "json"},
			method: "GET",
			success: onGetStatisticsSuccess,
			error: onGetStatisticsError
		});

		that.byId("vizBox").setBusy(false);
	},

	setVizPartProp: function( evt ) {
		if (this.bAlreadySetVizProp)
			return;

	    this.oRegViz.setVizProperties({
                plotArea: {
                    dataLabel: {
                        // formatString:CustomerFormat.FIORI_LABEL_SHORTFORMAT_2,
                        visible: true
                    }
                },
                valueAxis: {
                    // label: {
                    //     formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_10
                    // },
                    title: {
                        visible: true
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                title: {
                    visible: true,
                    text: 'Registratration count by status'
                }
        });

        this.oReceivedViz.setVizProperties({
                plotArea: {
                    dataLabel: {
                        // formatString:CustomerFormat.FIORI_LABEL_SHORTFORMAT_2,
                        visible: true
                    }
                },
                valueAxis: {
                    // label: {
                    //     formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_10
                    // },
                    title: {
                        visible: true
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                title: {
                    visible: true,
                    text: 'Top 10 Most Valuable Runners '
                }
        });

        this.oRegViz.setVizProperties({
                plotArea: {
                    dataLabel: {
                        // formatString:CustomerFormat.FIORI_LABEL_SHORTFORMAT_2,
                        visible: true
                    }
                },
                valueAxis: {
                    // label: {
                    //     formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_10
                    // },
                    title: {
                        visible: true
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                title: {
                    visible: true,
                    text: 'Registratration count by status'
                }
        });

        this.oGivingViz.setVizProperties({
                plotArea: {
                    dataLabel: {
                        // formatString:CustomerFormat.FIORI_LABEL_SHORTFORMAT_2,
                        visible: true
                    }
                },
                valueAxis: {
                    // label: {
                    //     formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_10
                    // },
                    title: {
                        visible: true
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                title: {
                    visible: true,
                    text: 'To 10 Donors'
                }
        });

        this.bAlreadySetVizProp = true;
	},
	
	
	onDonationSegmentSelected: function( evt ) {
	    var id = evt.getSource().getId();
	    var bOverall = id.indexOf('overallSegment')!= -1;
	    var bMyDonation = id.indexOf('mySegment')!= -1;
	    var bTeam = id.indexOf('byTeamSegment')!= -1;

	    this.oDonationTable.setVisible(bOverall);
	    this.byId("myDonationBox").setVisible( bMyDonation);	
	    this.oTeamDonationTable.setVisible(bTeam);
	},
	

	onTconTabBarSelectChanged: function( evt ) {
	    var selKey = evt.getSource().getSelectedKey();
	    var visible = (selKey == "Registrations");
	    this.byId("donateBtn").setVisible( visible );
	    this.byId("emailBtn").setVisible( visible );
	},
	

	onRegistrationTableRowSelectChanged: function( evt ) {
	    var selIdx = this.oRegTable.getSelectedIndices();
	    this.byId("donateBtn").setEnabled( selIdx.length > 0 );
	    this.byId("emailBtn").setEnabled( selIdx.length > 0 );
	},

	onSendEmailPressed_old:function( evt ) {
		var selIdx = this.oRegTable.getSelectedIndices();
		var url = "mailto:";
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oRegTable.getContextByIndex( selIdx[i]);
			var email = context.getProperty("Email");
			if(i>0) {
				url+=";"
			}
			url += email;
		}
		window.open(url, "_parent");
	},

	onSendEmailPressed : function( evt ) {
		if (!this.oSendEmailDialog) {
			this.oSendEmailDialog = sap.ui.xmlfragment(this.getView().getId(), "csr.explore.view.SendEmailDialog", this);
		}

		var selIdx = this.oRegTable.getSelectedIndices();
		var url="";
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oRegTable.getContextByIndex( selIdx[i]);
			var email = context.getProperty("Email");
			if(i>0) {
				url+=";"
			}
			url += email;
		}
		this.byId("emailAddress").setValue(url);
		this.oSendEmailDialog.open();

		var that = this;
		setTimeout(	function( evt ) {
		    that.byId("emailAddress").selectText(0,  url.length);
		}, 0);

	},

	onSendEmailClosePressed: function( evt ) {
	    this.oSendEmailDialog.close();
	},
	


	onDonatePressed: function( evt ) {
	    if (!this.oDonationDialog) {
			this.oDonationDialog = sap.ui.xmlfragment(this.getView().getId(), "csr.explore.view.DonationDialog", this);
		}
		//set the donatory name
		var selIdx = this.oRegTable.getSelectedIndices();
		var list = "";
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oRegTable.getContextByIndex( selIdx[i]);
			var userId = context.getProperty("UserId");
			if (list.length >0) {
				list += ',';
			}
			list += userId;
		}
		this.byId('donatoryTxt').setText(list);

		this.oDonationDialog.open();
	},

 	onDonationCancelPressed: function( evt ) {
 	    this.oDonationDialog.close();
 	},
 	
	onDonationOkPressed	: function( evt ) {
	    this.oDonationDialog.close();

	    var that = this;
	    function onDonateSuccess() {
	        that.getView().setBusy(false);
	        Util.showToast("Donate successful! Information will be auto refresh...");

	        that.initDonationPart();
			that.initVizPart();
	    }
	    
	    function onDonateError(error) {
			that.getView().setBusy(false);
			Util.showError("Donate failed. Reason: " + error);
	    }

	    var amount;
		if ( this.byId("otherAmountBtn").getSelected()) {
			amount = this.byId("otherAmountInput").getValue();
		} else {
			var aId = ["amount50", "amount100", "amount200", "amount500","amount1000"];
			for (var i=0; i < aId.length; i++) {
				var radio = this.byId(aId[i]);
				if (radio.getSelected()) {
					amount = radio.getText();
					break;
				}
			}
		}
		// amount = parseInt(amount);

	    var comment = this.byId("commentInput").getValue().trim();
	    
	    // var url = "/DoDonation?To='" + this.byId('donatoryTxt').getText() +
	    // 	"'&Amount='" + amount + "'&Comment='" + comment+"'";
	    var mParam = {
	    	To: this.byId('donatoryTxt').getText(),
	    	Amount: amount,
	    	Comment: comment
	    };
	    this.oDataModel.callFunction("/DoDonation", {
	    	urlParameters: mParam,
	    	success: onDonateSuccess, 
	    	error:   onDonateError,
	    });

	    this.getView().setBusy(true);
	},
	
	onDelayedRadioChangeFunc: function( evt ) {
	    var otherRadio = this.byId("otherAmountBtn");

   	 	// var sel = evt.getSource().getSelected();
    	var sel = otherRadio.getSelected();
    	this.byId("otherAmountInput").setEnabled(sel);

    	if (sel) {
    		//now need check whether have input the other amount 
    		this.onOtherAmountChanged();
    	} else {
    		this.byId("donationOkBtn").setEnabled( true );	
    	}
    	
	},

	onOtherAmountChanged: function( evt ) {
	    var source = this.byId('otherAmountInput');
	    var val = source.getValue().trim();

	    //??later need check whether is number
	    this.byId("donationOkBtn").setEnabled( !!val );
	},
	
	
	onOtherAmountSelect: function( evt ) {
		var that = this;
		jQuery.sap.delayedCall(0, this, this.onDelayedRadioChangeFunc);
	},


	fmtTeam: function( teamId) {
	    if ( !teamId || teamId == "0") {
	    	return "";
	    }

	    for (var i=0; i < this.aTeam.length; i++) {
	    	var  team = this.aTeam[i];
	    	if (teamId == team.TeamId)
	    		return team.Name;
	    }
	    return "";
	},

	fmtTeamMember: function( teamId) {
	    if ( teamId == null || teamId == undefined ) {
	    	return "";
	    }

	    for (var i=0; i < this.aTeam.length; i++) {
	    	var  team = this.aTeam[i];
	    	if (teamId == team.TeamId)
	    		return team.MemberList;
	    }
	    return "";
	}

});
	
	

	//global data 
	// mRegister:  //the register information
	//oFooterBar	
	//oSubmitBtn, oCancelBtn, oSaveBtn
	//oUploaderId, oUploaderPhoto, oUploaderForm
	return ControllerController;
});