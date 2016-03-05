sap.ui.define([
	"sap/m/MessageBox", "sap/m/MessageToast",
	"csr/lib/Config",
	], 
	function(MessageBox, MessageToast, Config) {
	"use strict";

/**
 * Get the last part of one string, for sap.m.Button, then it will get Button
 */
String.prototype.sapLastPart = function(sep) {
	if (sep == undefined)
		sep = ".";

	var pos = this.lastIndexOf(sep);
	if (pos == -1)
		return this;
	else {
		return this.substr(pos + 1);
	}
};


var localSaveAs =  localSaveAs||(function(h){"use strict";var r=h.document,l=function(){return h.URL||h.webkitURL||h;},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);return t.dispatchEvent(s);},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s;},0);},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s);}else{s.remove();}}b.length=0;},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t);}catch(u){m(u);}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F;},A=function(){q(v,"writestart progress write writeend".split(" "));},D=function(){if(E||!x){x=s(t);}w.location.href=x;v.readyState=v.DONE;A();},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments);}};},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download";}if(g){x=s(t);n.href=x;n.download=u;if(j(n)){v.readyState=v.DONE;A();return;}}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true;}if(o&&u!=="download"){u+=".download";}if(B===c||o){w=h;}else{w=h.open();}if(!p){D();return;}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K);};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D();}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K];});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE;};v.readyState=v.WRITING;}),D);}),D);};G.getFile(u,{create:false},z(function(I){I.remove();H();}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H();}else{D();}}));}),D);}),D);},d=f.prototype,a=function(s,t){return new f(s,t);};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort");};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a;}(self));
var BlobBuilder=BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||(function(j){"use strict";var c=function(v){return Object.prototype.toString.call(v).match(/^\[object\s(.*)\]$/)[1];},u=function(){this.data=[];},t=function(x,v,w){this.data=x;this.size=x.length;this.type=v;this.encoding=w;},k=u.prototype,s=t.prototype,n=j.FileReaderSync,a=function(v){this.code=this[this.name=v];},l=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),r=l.length,o=j.URL||j.webkitURL||j,p=o.createObjectURL,b=o.revokeObjectURL,e=o,i=j.btoa,f=j.atob,m=false,h=function(v){m=!v;},d=j.ArrayBuffer,g=j.Uint8Array;u.fake=s.fake=true;while(r--){a.prototype[l[r]]=r+1;}try{if(g){h.apply(0,new g(1));}}catch(q){}if(!o.createObjectURL){e=j.URL={};}e.createObjectURL=function(w){var x=w.type,v;if(x===null){x="application/octet-stream";}if(w instanceof t){v="data:"+x;if(w.encoding==="base64"){return v+";base64,"+w.data;}else{if(w.encoding==="URI"){return v+","+decodeURIComponent(w.data);}}if(i){return v+";base64,"+i(w.data);}else{return v+","+encodeURIComponent(w.data);}}else{if(real_create_object_url){return real_create_object_url.call(o,w);}}};e.revokeObjectURL=function(v){if(v.substring(0,5)!=="data:"&&real_revoke_object_url){real_revoke_object_url.call(o,v);}};k.append=function(z){var B=this.data;if(g&&z instanceof d){if(m){B.push(String.fromCharCode.apply(String,new g(z)));}else{var A="",w=new g(z),x=0,y=w.length;for(;x<y;x++){A+=String.fromCharCode(w[x]);}}}else{if(c(z)==="Blob"||c(z)==="File"){if(n){var v=new n;B.push(v.readAsBinaryString(z));}else{throw new a("NOT_READABLE_ERR");}}else{if(z instanceof t){if(z.encoding==="base64"&&f){B.push(f(z.data));}else{if(z.encoding==="URI"){B.push(decodeURIComponent(z.data));}else{if(z.encoding==="raw"){B.push(z.data);}}}}else{if(typeof z!=="string"){z+="";}B.push(unescape(encodeURIComponent(z)));}}}};k.getBlob=function(v){if(!arguments.length){v=null;}return new t(this.data.join(""),v,"raw");};k.toString=function(){return"[object BlobBuilder]";};s.slice=function(y,v,x){var w=arguments.length;if(w<3){x=null;}return new t(this.data.slice(y,w>1?v:this.data.length),x,this.encoding);};s.toString=function(){return"[object Blob]";};return u;}(self));

	return {
		saveToFile : function(str, fileName) {
			var bb = new BlobBuilder();
			bb.append(str);
			localSaveAs(bb.getBlob("text/plain;charset=utf-8"),  fileName);
		},

		showError: function( msg, error ) {
			if (error) {
				var detailMsg = error.message + "\r\nReason: " + error.responseText;
				MessageBox.error(msg, {
					details: detailMsg
				});
			} else {
		    	MessageBox.error(msg);
		    }
		},
		
		showToast : function( msg ) {
		    MessageToast.show(msg);
		},

		getMyAttachmentUrl: function( userId) {
		    // var url = Config.getConfigure().AttachmentUrl;
		    var url = "/Attachments?$filter=UserId eq '" + userId + "'";
		    return url;
		},

		getAttachmentUploaderUrl: function( userId, type, fileName) {
			//??avoid issue,fileName will remove space
			fileName= fileName.trim();
			var url = Config.getConfigure().AttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type + "&FileName=" + fileName;
			return url;
		},

		getAttachmentDownloadUrl: function( userId, type) {
			var url = Config.getConfigure().AttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type ;
			return url;
		},


		getRelativeAttachmentDownloadUrl: function( userId, type) {
			var url = Config.getConfigure().RelativeAttachmentLoaderUrl;
			url += "?UserId=" + userId + "&Type=" + type ;
			return url;
		},


		setTableColumnsFilterSortProperty: function( table ) {
		    var aCol = table.getColumns();
		    for (var i=0; i < aCol.length; i++) {
		    	var  col = aCol[i];

		    	var template = col.getTemplate();
		    	var prop = "text";
		    	if (template instanceof sap.m.ObjectStatus) {
		    		prop = "state";
		    	}

		    	var binding = template.getBindingInfo(prop);

			    if (binding && binding.parts && binding.parts.length ==1) {
			    	var path = binding.parts[0].path;
			 
			    	col.setSortProperty(path);
			    	col.setFilterProperty(path);
			    }
		    }
		}
		

	};
});