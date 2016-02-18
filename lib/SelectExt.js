sap.ui.define([
	"sap/m/Select"
], function(Select) {
	"use strict";

	var mySelect = Select.extend("csr.lib.SelectExt", {
    metadata : {
        properties : {
        	'realValue'  : {type:"string", defaultValue: "", bindable : "bindable"},
        },
    },
    
    /*setRealValue: function( value) {
        // this.setSelectedKey(value);
        this.setProperty('realValue', value);
    },*/
    
    //in order for simple binding, the name is same as the value list binding 
    setName: function( name) {
        this.setProperty('name', name);

        var path = "cfg>/" + name + "/list";
        var template = new sap.ui.core.Item({
        	text: "{cfg>name}",
        	key:  "{cfg>name}"
        })
        this.bindItems(path, template);

        //the realValue also set from the name 
        // var bindPath = "/" + name; 
        // this.bindProperty('realValue', bindPath);

        this.attachChange( function(oEvent) {
        	var source = oEvent.getSource();
        	source.setRealValue( source.getSelectedKey() );
        });
    },
    
    renderer : "sap.m.SelectRenderer"
});

	return mySelect;
});