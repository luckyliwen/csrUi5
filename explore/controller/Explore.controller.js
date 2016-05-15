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
		//default is 100 then dowload have issue
		this.oDataModel.setSizeLimit(1000);

		this.oRegTable = this.byId('registrationTable');
		this.oDonationTable = this.byId("donationTable");
		this.oTeamDonationTable = this.byId("teamDonationTable");
		this.oReceivedTable = this.byId("receivedDonationTable");
		this.oGivingTable = this.byId("givingDonationTable");
		this.oDonnorTable = this.byId("donnorDonationTable");
		this.oRunnerTable = this.byId("byRunnerTable");

		Util.setTableColumnsFilterSortProperty(this.oRegTable);
		Util.setTableColumnsFilterSortProperty(this.oDonationTable);
		Util.setTableColumnsFilterSortProperty(this.oReceivedTable);
		Util.setTableColumnsFilterSortProperty(this.oGivingTable);
		Util.setTableColumnsFilterSortProperty(this.oTeamDonationTable);
		Util.setTableColumnsFilterSortProperty(this.oDonnorTable);
		Util.setTableColumnsFilterSortProperty(this.oRunnerTable);

		this.oVizBox = this.byId("vizBox");
		this.oRegViz = this.byId("registrationViz");
		this.oDonationByDateViz = this.byId("donationByDateViz");
		this.oReceivedViz = this.byId("receivedViz");
		this.oGivingViz = this.byId("givingViz");
		
		
		this.userId = "";
		this.oModel = new JSONModel(); 
		this.oVizBox.setModel( this.oModel);
		this.oDonnorTable.setModel(this.oModel);
		this.oTeamDonationTable.setModel(this.oModel);
		this.oRunnerTable.setModel(this.oModel);	
		

		this.mSta = {};
		this.loadTeamInfor();

		this.MAX_SAP_DONATION_AMOUNT = 87630;
		this.currentSAPDonation = -1; //
	},

	loadTeamInfor: function( ) {
	    var that = this;

		function onGetTeamInfoSuccess( oData) {
			that.aTeam = oData.results;
			that.initDonationPart();
			that.initVizPart();

			var statusCol = that.byId("StatusCol");
			// statusCol.setFilterValue("Approved");
			// statusCol.setFiltered(true);
			statusCol.setSorted(true);

			that.oRegTable.bindRows({
				path: "/Registrations",
				sorter: [new sap.ui.model.Sorter("Status")],
				// filters: [new sap.ui.model.Filter("Status", 'EQ', 'Approved')]
			});
		}
		
	    function onGetTeamInfoError(error) {
			Util.showError("Failed to get team information.", error);
		}

	    this.oDataModel.read("/Teams", {
			success: onGetTeamInfoSuccess,
			error: onGetTeamInfoError
		});
	},
	
	adjustViewByRole: function( bAdmin ) {
	    if (bAdmin) {
	    	this.byId("deleteDonationTable").setVisible(true);
	    	this.byId("updateSAPDonation").setVisible(true);
	    } else {
	    	var cols = ["EmailCol", "PhoneCol", "NationalityCol"];
	    	for (var i=0; i < cols.length; i++) {
	    		var col = this.byId(cols[i]);
	    		this.oRegTable.removeColumn( col );
	    	}
	    }

	    //for some reg table need remove for legal reason
	    //
	},
	
	initDonationPart: function(  ) {
		var that = this;

		function onGetUserInfoSuccess( oData) {
			if (oData) {
				that.adjustViewByRole(oData.Admin);
			}

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

	updateDonationTitle: function( evt ) {
	    var info = "Total amount: " + this.mSta.Donation.Total + " (rmb), ";
	    if (this.currentSAPDonation != -1) {
	    	info += "donated by SAP: " + this.currentSAPDonation + " (rmb), ";
	    }

		var count = this.mSta.Donation.Count - 1;
		info += "donatation count: " + count + " (times)";

		this.byId("doationTableTitle").setText(info);
	},
	
	getSAPDonationInfor: function( evt ) {
		if (  this.currentSAPDonation == -1) {
			var that = this;
		    this.oDataModel.read("/Donations(1720L)", {
		    	success: function( data ) {
		    	    that.currentSAPDonation = data.Amount;
		    	    that.updateDonationTitle();
		    	},
		    	
		    });
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

		//as now it will include the special donation, so for the /Receive and /Giving 
		//we need exclude it if there   "SAP (SAP)"   "SAP Dalian Club (SAPDALIAN)"  "SAP Run Club (SAPRUNCLUB)
			var aDel=[];
			for (var i=0; i < that.mSta.Giving.length; i++) {
				var  user = that.mSta.Giving[i].User;
				//first 3 later is SAP then means it is special 
				if (user.substr(0,3) == "SAP") {
					aDel.push(i);
			
					if ( user == "SAP (SAP)") {
						that.currentSAPDonation = that.mSta.Giving[i].Amount;
					}

					if (aDel.length ==3)
						break;
				}
			}

			//in normal case, the top 3 is the 3 special, but here need check if less than 3 then add from last
			if ( aDel.length < 3) {
				var iPos = 13 - (3 - aDel.length);
				while (true) {
					aDel.push(iPos);
					 iPos ++;
					 if (aDel.length == 3)
					 	break;
				}
			}
			//then del them, need from big to small
			that.mSta.Giving.splice( aDel[2], 1);
			that.mSta.Giving.splice( aDel[1], 1);
			that.mSta.Giving.splice( aDel[0], 1);

		//##then for the Received
			for (i=0; i < that.mSta.Received.length; i++) {
				var  user = that.mSta.Received[i].User;
				if ( user == "China Charity (CHARITY)") {
					break;
				}
			}
			if (i == that.mSta.Received.length) {
				//not found the special giving
				i = that.mSta.Received.length -1;
			}
			that.mSta.Received.splice(i,1);
			//for the received, need remove two, so also remove the last one 
			that.mSta.Received.pop();
			that.mSta.Received.pop();
			
			that.oModel.setData( that.mSta);
			// this.oRegViz.setModel(dataModel);
			// 
			that.updateDonationTitle();

			that.getSAPDonationInfor();
		}

        function onGetStatisticsError(error) {
			that.byId("vizBox").setBusy(false);
			Util.showError("Failed to get my Statistics.", error);
		}

	    this.oDataModel.callFunction("/GetStatistics", {
	    	urlParameters: { Top: "13", '$format': "json"},
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

 		this.oDonationByDateViz.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true
                    }
                },
                valueAxis: {
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
                    text: 'Accumulated donations by Date'
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
                    text: 'Top 10 Runners'
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
                    text: 'Top 10 Donors'
                }
        });

        this.bAlreadySetVizProp = true;
	},
	
	
	onDonationSegmentSelected: function( evt ) {
	    var id = evt.getSource().getId();
	    var bOverall = id.indexOf('overallSegment')!= -1;
	    var bMyDonation = id.indexOf('mySegment')!= -1;
	    var bTeam = id.indexOf('byTeamSegment')!= -1;
	    var byPeople = id.indexOf('byPeopleSegment') != -1;


	    this.oDonationTable.setVisible(bOverall);
	    this.byId("myDonationBox").setVisible( bMyDonation);	
	    this.byId('personDonationBox').setVisible(byPeople);

	    this.oTeamDonationTable.setVisible(bTeam);
	},
	

	onTconTabBarSelectChanged: function( evt ) {
	    var selKey = evt.getSource().getSelectedKey();
	    var visible = (selKey == "Registrations");
	    this.byId("donateBtn").setVisible( visible );
	    this.byId("emailBtn").setVisible( visible );
	},
	

	onRegistrationTableRowSelectChanged: function( evt ) {
	    //only the Approved can donate
	    var selIdx = this.oRegTable.getSelectedIndices();
	    var bHasOneApproved = false;
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oRegTable.getContextByIndex( selIdx[i]);
			var status = context.getProperty("Status");
			if (status == "Approved") {
				bHasOneApproved = true;
				break;
			}
		}
	    this.byId("donateBtn").setEnabled( bHasOneApproved );
	    this.byId("emailBtn").setEnabled( selIdx.length > 0 );
	},

	onSendEmailPressed_old:function( evt ) {
		var selIdx = this.oRegTable.getSelectedIndices();
		var url = "mailto:";
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oRegTable.getContextByIndex( selIdx[i]);
			var email = context.getProperty("Email");
			if(i>0) {
				url+=";" ;
			}
			url += email;
		}
		window.open(url, "_parent");
	},

	onUpdateSAPDonationPressed: function( evt ) {
		if (this.currentSAPDonation >= this.MAX_SAP_DONATION_AMOUNT) {
			alert("The SAP donation already reach the maximun amount " + this.MAX_SAP_DONATION_AMOUNT);
			return;
		}

	    //first get the amount;
	    //then update Donations(1720L) till reach the threshold 87630
	    var that = this;
	    function onGetLatestDonationSuccess(oData) {
	    	var amount = 0;
	    	for (var i=0; i < oData.results.length; i++) {
	    		var entry = oData.results[i];
		    	if (entry.DonatorId != "SAP"  && entry.DonatorId != "SAPDALIAN" 
		    			&& entry.DonatorId != "SAPRUNCLUB") 
		    	{
		    		amount += parseInt(entry.Amount);
		    		if (amount >= that.MAX_SAP_DONATION_AMOUNT) {
		    			amount = that.MAX_SAP_DONATION_AMOUNT;
		    			break;
		    		}
		    	}
	    	}
	    	that.currentSAPDonation = amount;
			that.updateDonationTitle();

	    	var mData = {
	    		Amount: "" + amount
	    	};

	    	//then do the update
	    	that.oDataModel.update("/Donations(1720L)", mData, {
	    		success: function( evt ) {
	    			that.getView().setBusy(false);
	    		    Util.showToast('Successful update the SAP Donation, now amount is ' + amount);
	    		},
	    		
	    		error: function(error) {
					that.getView().setBusy(false);
					Util.showError("Update SAP Donation failed", error);
	    		}
	    	});
	    }

		function onGetLatestDonationError(error) {
			that.getView().setBusy(false);
			Util.showError("Failed to get last two week donation information", error);
		}

	    var url = "/Donations?$filter=ModifiedTime gt datetime'2016-05-09T00:00:00'";
	    var aFilter = [new sap.ui.model.Filter("ModifiedTime", 'GT', "2016-05-09T00:00:00")];
	    this.oDataModel.read("/Donations", {
	    	filters: aFilter,
			success: onGetLatestDonationSuccess,
			error: onGetLatestDonationError
		});
		that.getView().setBusy(true);
	},
	

	onDonationDeletePressed: function( evt ) {
		var selIdx = this.oDonationTable.getSelectedIndices();
		if (selIdx.length ==0) {
			Util.info("Please first select some row then delete.");
			return;
		}

		var bConfirm = confirm("Are you sure to delete the donation ?");
   		if (!bConfirm)
   			return;
	    
		for (var i=0; i < selIdx.length; i++) {
			var context = this.oDonationTable.getContextByIndex( selIdx[i]);
			var id = context.getProperty("DonationId");

			var url = "/Donations(" + id + "L)";
			this.oDataModel.remove(url);
		}
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
				url+=";" ;
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
			//??need check why sometimes the context is null
			if (context != null) {
				var status = context.getProperty("Status");
				if (status == "Approved") {
					var userId = context.getProperty("UserId");
					if (list.length >0) {
						list += ',';
					}
					list += userId;
				}
			}
		}
		this.byId('donatoryTxt').setText(list);

		this.oDonationDialog.open();
	},

 	onDonationCancelPressed: function( evt ) {
 	    this.oDonationDialog.close();
 	},
 	
	onDonationOkPressed	: function( oEvent ) {
	    var that = this;
	    var btn = oEvent.getSource();

	    function onDonateSuccess() {
	    	that.oDonationDialog.close();
	    	btn.setEnabled(true);
	        that.getView().setBusy(false);
	        Util.showToast("Donate successful! Information will be auto refresh...");

	        that.initDonationPart();
			that.initVizPart();
	    }
	    
	    function onDonateError(error) {
	    	that.oDonationDialog.close();
	    	btn.setEnabled(true);
			that.getView().setBusy(false);
			Util.showError("Donate failed." , error);
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
		// need add the confirm dialog in order to prevent user pressed it wrongly 
		var iAmount = parseInt(amount);

	    var comment = this.byId("commentInput").getValue().trim();
	    var toRunner = this.byId('donatoryTxt').getText();
	    var aToRunner = toRunner.split(',');
	    iAmount = iAmount * aToRunner.length;

	    var bConfirm = confirm("Are you sure to donate " + iAmount + " RMB ?");
   		if (!bConfirm)
   			return;

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
	    //disable it in order not press it again
	    btn.setEnabled(false);
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

	    var regexp = /^[1-9]\d*$/;
	    var flag = regexp.test(val);
	    if (flag) {
	    	if (val==0)
	    		flag = false;
	    }

	     if (flag) {
	    	source.setValueState("None");
	    } else {
	    	source.setValueState("Error");
	    	source.setValueStateText("Must be a valid positive number");
	    }

	    //??later need check whether is number
	    this.byId("donationOkBtn").setEnabled( flag );
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
	},

	_exportTeamDonationTable: function( evt ) {
		// "TeamDonation\":[{\"TeamId\":1,\"Amount\":4100},{\"TeamId\":0,\"Amount\":2600}],\"Donation\":{ \"Total\":\"6700\",\"Count\":\"17\"}}"}}
 		var ret = ["Team ID, Team Name, Members, Amount(RMB)"]; 

	    for (var i=0; i < this.mSta.TeamDonation.length; i++) {
	    	var  item = this.mSta.TeamDonation[i];
	    	var teamId = item.TeamId;
	    	var teamName = this.fmtTeam(teamId);

			//to avoid , conflict, add "" to 
  			var vMember = '"' + this.fmtTeamMember(teamId) + '"';

	    // 	//member like:  I068108:Lucky,li;Ixx; 
	    // 	var sMember = this.fmtTeamMember(teamId);
  			// var aMember = aMember.split(";");
  			// for (var idx =0; idx< aMember.length; idx++) {
  			// 	var member = aMember[idx];
  			// 	//like I068108:Lucky,li;
  			// 	vMember+=	
  			// }

  			
	    	ret.push( teamId + "," + teamName + "," + vMember + "," + item.Amount);
	    }
	    var content = ret.join("\r\n");
	    Util.saveToFile(content, "TeamDonation.csv");
	},

	onTableExportPressed: function( evt ) {
		var source = evt.getSource();
		var id = source.getId();
		 // id="ExportBtn-teamDonationTable"
		var pos = id.lastIndexOf("-");
		var tableId = id.substr(pos+1);
		if (tableId == "teamDonationTable") {
			this._exportTeamDonationTable();
			return;
		}

		var table = this.byId(tableId);
	    Util.exportTableContent(table, tableId+".csv");
	},

	onStatisticsExportPressed: function( evt ) {
	    var ret = ["Registration"];
	    ret.push("Status,Count"); 
	    for (var i=0; i < this.mSta.Registration.length; i++) {
	    	var  item = this.mSta.Registration[i];
	    	ret.push( item.Status + "," + item.Count);
	    }

	    //then by date
		ret.push("");
	    ret.push("Donations by Date");
	    ret.push("User,Amount"); 
	    for ( i=0; i < this.mSta.DonationByDate.length; i++) {
	    	item = this.mSta.DonationByDate[i];
			ret.push( item['Date'] + "," + item.Amount);
	    }

	    //then the giving
	    ret.push("");
	    ret.push("To 10 Donors");
	    ret.push("User,Amount"); 
	    for ( i=0; i < this.mSta.Giving.length; i++) {
	    	item = this.mSta.Giving[i];
			ret.push( item.User + "," + item.Amount);
	    }

		//then the recv
	    ret.push("");
	    ret.push("Top 10 Most Valuable Runners");
	    ret.push("User,Amount"); 
	    for ( i=0; i < this.mSta.Received.length; i++) {
	    	item = this.mSta.Received[i];
			ret.push( item.User + "," + item.Amount);
	    }
	    var content = ret.join("\r\n");
	    Util.saveToFile(content, "Statistics.csv");
	}
});
	//global data 
	// mRegister:  //the register information
	//oFooterBar	
	//oSubmitBtn, oCancelBtn, oSaveBtn
	//oUploaderId, oUploaderPhoto, oUploaderForm
	return ControllerController;
});