(function(){var a=this,b=a.Backbone,c=Array.prototype.slice,d=Array.prototype.splice,e;e=typeof exports!="undefined"?exports:a.Backbone={},e.VERSION="0.9.0";var f=a._;!f&&typeof require!="undefined"&&(f=require("underscore"));var g=a.jQuery||a.Zepto||a.ender;e.noConflict=function(){return a.Backbone=b,this},e.emulateHTTP=!1,e.emulateJSON=!1,e.Events={on:function(a,b,c){for(var d,a=a.split(/\s+/),e=this._callbacks||(this._callbacks={});d=a.shift();){d=e[d]||(e[d]={});var f=d.tail||(d.tail=d.next={});f.callback=b,f.context=c,d.tail=f.next={}}return this},off:function(a,b,c){var d,e,f;if(a){if(e=this._callbacks)for(a=a.split(/\s+/);d=a.shift();)if(f=e[d],delete e[d],b&&f)for(;(f=f.next)&&f.next;)(f.callback!==b||!!c&&f.context!==c)&&this.on(d,f.callback,f.context)}else delete this._callbacks;return this},trigger:function(a){var b,d,e,f;if(!(e=this._callbacks))return this;f=e.all;for((a=a.split(/\s+/)).push(null);b=a.shift();)f&&a.push({next:f.next,tail:f.tail,event:b}),(d=e[b])&&a.push({next:d.next,tail:d.tail});for(f=c.call(arguments,1);d=a.pop();){b=d.tail;for(e=d.event?[d.event].concat(f):f;(d=d.next)!==b;)d.callback.apply(d.context||this,e)}return this}},e.Events.bind=e.Events.on,e.Events.unbind=e.Events.off,e.Model=function(a,b){var c;a||(a={}),b&&b.parse&&(a=this.parse(a));if(c=s(this,"defaults"))a=f.extend({},c,a);b&&b.collection&&(this.collection=b.collection),this.attributes={},this._escapedAttributes={},this.cid=f.uniqueId("c"),this._changed={};if(!this.set(a,{silent:!0}))throw Error("Can't create an invalid model");this._changed={},this._previousAttributes=f.clone(this.attributes),this.initialize.apply(this,arguments)},f.extend(e.Model.prototype,e.Events,{idAttribute:"id",initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var b;return(b=this._escapedAttributes[a])?b:(b=this.attributes[a],this._escapedAttributes[a]=f.escape(b==null?"":""+b))},has:function(a){return this.attributes[a]!=null},set:function(a,b,c){var d,g;f.isObject(a)||a==null?(d=a,c=b):(d={},d[a]=b),c||(c={});if(!d)return this;d instanceof e.Model&&(d=d.attributes);if(c.unset)for(g in d)d[g]=void 0;if(this.validate&&!this._performValidation(d,c))return!1;this.idAttribute in d&&(this.id=d[this.idAttribute]);var b=this.attributes,h=this._escapedAttributes,i=this._previousAttributes||{},j=this._changing;this._changing=!0;for(g in d)if(a=d[g],f.isEqual(b[g],a)||delete h[g],c.unset?delete b[g]:b[g]=a,delete this._changed[g],!f.isEqual(i[g],a)||f.has(b,g)!=f.has(i,g))this._changed[g]=a;return j||(!c.silent&&this.hasChanged()&&this.change(c),this._changing=!1),this},unset:function(a,b){return(b||(b={})).unset=!0,this.set(a,null,b)},clear:function(a){return(a||(a={})).unset=!0,this.set(f.clone(this.attributes),a)},fetch:function(a){var a=a?f.clone(a):{},b=this,c=a.success;return a.success=function(d,e,f){if(!b.set(b.parse(d,f),a))return!1;c&&c(b,d)},a.error=e.wrapError(a.error,b,a),(this.sync||e.sync).call(this,"read",this,a)},save:function(a,b,c){var d;f.isObject(a)||a==null?(d=a,c=b):(d={},d[a]=b),c=c?f.clone(c):{};if(d&&!this[c.wait?"_performValidation":"set"](d,c))return!1;var g=this,h=c.success;return c.success=function(a,b,e){b=g.parse(a,e),c.wait&&(b=f.extend(d||{},b));if(!g.set(b,c))return!1;h?h(g,a):g.trigger("sync",g,a,c)},c.error=e.wrapError(c.error,g,c),a=this.isNew()?"create":"update",(this.sync||e.sync).call(this,a,this,c)},destroy:function(a){var a=a?f.clone(a):{},b=this,c=a.success,d=function(){b.trigger("destroy",b,b.collection,a)};if(this.isNew())return d();a.success=function(e){a.wait&&d(),c?c(b,e):b.trigger("sync",b,e,a)},a.error=e.wrapError(a.error,b,a);var g=(this.sync||e.sync).call(this,"delete",this,a);return a.wait||d(),g},url:function(){var a=s(this.collection,"url")||s(this,"urlRoot")||t();return this.isNew()?a:a+(a.charAt(a.length-1)=="/"?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},change:function(a){for(var b in this._changed)this.trigger("change:"+b,this,this._changed[b],a);this.trigger("change",this,a),this._previousAttributes=f.clone(this.attributes),this._changed={}},hasChanged:function(a){return a?f.has(this._changed,a):!f.isEmpty(this._changed)},changedAttributes:function(a){if(!a)return this.hasChanged()?f.clone(this._changed):!1;var b,c=!1,d=this._previousAttributes,e;for(e in a)f.isEqual(d[e],b=a[e])||((c||(c={}))[e]=b);return c},previous:function(a){return!a||!this._previousAttributes?null:this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},_performValidation:function(a,b){var c=this.validate(f.extend({},this.attributes,a),b);return c?(b.error?b.error(this,c,b):this.trigger("error",this,c,b),!1):!0}}),e.Collection=function(a,b){b||(b={}),b.comparator&&(this.comparator=b.comparator),this._reset(),this.initialize.apply(this,arguments),a&&this.reset(a,{silent:!0,parse:b.parse})},f.extend(e.Collection.prototype,e.Events,{model:e.Model,initialize:function(){},toJSON:function(){return this.map(function(a){return a.toJSON()})},add:function(a,b){var c,e,g,h,i,j={},k={};b||(b={}),a=f.isArray(a)?a.slice():[a];for(c=0,e=a.length;c<e;c++){if(!(g=a[c]=this._prepareModel(a[c],b)))throw Error("Can't add an invalid model to a collection");if(j[h=g.cid]||this._byCid[h]||(i=g.id)!=null&&(k[i]||this._byId[i]))throw Error("Can't add the same model to a collection twice");j[h]=k[i]=g}for(c=0;c<e;c++)(g=a[c]).on("all",this._onModelEvent,this),this._byCid[g.cid]=g,g.id!=null&&(this._byId[g.id]=g);this.length+=e,d.apply(this.models,[b.at!=null?b.at:this.models.length,0].concat(a)),this.comparator&&this.sort({silent:!0});if(b.silent)return this;for(c=0,e=this.models.length;c<e;c++)j[(g=this.models[c]).cid]&&(b.index=c,g.trigger("add",g,this,b));return this},remove:function(a,b){var c,d,e,g;b||(b={}),a=f.isArray(a)?a.slice():[a];for(c=0,d=a.length;c<d;c++)if(g=this.getByCid(a[c])||this.get(a[c]))delete this._byId[g.id],delete this._byCid[g.cid],e=this.indexOf(g),this.models.splice(e,1),this.length--,b.silent||(b.index=e,g.trigger("remove",g,this,b)),this._removeReference(g);return this},get:function(a){return a==null?null:this._byId[a.id!=null?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");var b=f.bind(this.comparator,this);return this.comparator.length==1?this.models=this.sortBy(b):this.models.sort(b),a.silent||this.trigger("reset",this,a),this},pluck:function(a){return f.map(this.models,function(b){return b.get(a)})},reset:function(a,b){a||(a=[]),b||(b={});for(var c=0,d=this.models.length;c<d;c++)this._removeReference(this.models[c]);return this._reset(),this.add(a,{silent:!0,parse:b.parse}),b.silent||this.trigger("reset",this,b),this},fetch:function(a){a=a?f.clone(a):{},a.parse===void 0&&(a.parse=!0);var b=this,c=a.success;return a.success=function(d,e,f){b[a.add?"add":"reset"](b.parse(d,f),a),c&&c(b,d)},a.error=e.wrapError(a.error,b,a),(this.sync||e.sync).call(this,"read",this,a)},create:function(a,b){var c=this,b=b?f.clone(b):{},a=this._prepareModel(a,b);if(!a)return!1;b.wait||c.add(a,b);var d=b.success;return b.success=function(e,f){b.wait&&c.add(e,b),d?d(e,f):e.trigger("sync",a,f,b)},a.save(null,b),a},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0,this.models=[],this._byId={},this._byCid={}},_prepareModel:function(a,b){if(a instanceof e.Model)a.collection||(a.collection=this);else{var c;b.collection=this,a=new this.model(a,b),a.validate&&!a._performValidation(a.attributes,b)&&(a=!1)}return a},_removeReference:function(a){this==a.collection&&delete a.collection,a.off("all",this._onModelEvent,this)},_onModelEvent:function(a,b,c,d){(a=="add"||a=="remove")&&c!=this||(a=="destroy"&&this.remove(b,d),b&&a==="change:"+b.idAttribute&&(delete this._byId[b.previous(b.idAttribute)],this._byId[b.id]=b),this.trigger.apply(this,arguments))}}),f.each("forEach,each,map,reduce,reduceRight,find,detect,filter,select,reject,every,all,some,any,include,contains,invoke,max,min,sortBy,sortedIndex,toArray,size,first,initial,rest,last,without,indexOf,shuffle,lastIndexOf,isEmpty,groupBy".split(","),function(a){e.Collection.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}}),e.Router=function(a){a||(a={}),a.routes&&(this.routes=a.routes),this._bindRoutes(),this.initialize.apply(this,arguments)};var h=/:\w+/g,i=/\*\w+/g,j=/[-[\]{}()+?.,\\^$|#\s]/g;f.extend(e.Router.prototype,e.Events,{initialize:function(){},route:function(a,b,c){return e.history||(e.history=new e.History),f.isRegExp(a)||(a=this._routeToRegExp(a)),c||(c=this[b]),e.history.route(a,f.bind(function(d){d=this._extractParameters(a,d),c&&c.apply(this,d),this.trigger.apply(this,["route:"+b].concat(d)),e.history.trigger("route",this,b,d)},this)),this},navigate:function(a,b){e.history.navigate(a,b)},_bindRoutes:function(){if(this.routes){var a=[],b;for(b in this.routes)a.unshift([b,this.routes[b]]);b=0;for(var c=a.length;b<c;b++)this.route(a[b][0],a[b][1],this[a[b][1]])}},_routeToRegExp:function(a){return a=a.replace(j,"\\$&").replace(h,"([^/]+)").replace(i,"(.*?)"),RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}}),e.History=function(){this.handlers=[],f.bindAll(this,"checkUrl")};var k=/^[#\/]/,l=/msie [\w.]+/,m=!1;f.extend(e.History.prototype,e.Events,{interval:50,getFragment:function(a,b){if(a==null)if(this._hasPushState||b){var a=window.location.pathname,c=window.location.search;c&&(a+=c)}else a=window.location.hash;return a=decodeURIComponent(a.replace(k,"")),a.indexOf(this.options.root)||(a=a.substr(this.options.root.length)),a},start:function(a){if(m)throw Error("Backbone.history has already been started");this.options=f.extend({},{root:"/"},this.options,a),this._wantsHashChange=this.options.hashChange!==!1,this._wantsPushState=!!this.options.pushState,this._hasPushState=!(!this.options.pushState||!window.history||!window.history.pushState);var a=this.getFragment(),b=document.documentMode;if(b=l.exec(navigator.userAgent.toLowerCase())&&(!b||b<=7))this.iframe=g('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a);this._hasPushState?g(window).bind("popstate",this.checkUrl):this._wantsHashChange&&"onhashchange"in window&&!b?g(window).bind("hashchange",this.checkUrl):this._wantsHashChange&&(this._checkUrlInterval=setInterval(this.checkUrl,this.interval)),this.fragment=a,m=!0,a=window.location,b=a.pathname==this.options.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!b)return this.fragment=this.getFragment(null,!0),window.location.replace(this.options.root+"#"+this.fragment),!0;this._wantsPushState&&this._hasPushState&&b&&a.hash&&(this.fragment=a.hash.replace(k,""),window.history.replaceState({},document.title,a.protocol+"//"+a.host+this.options.root+this.fragment));if(!this.options.silent)return this.loadUrl()},stop:function(){g(window).unbind("popstate",this.checkUrl).unbind("hashchange",this.checkUrl),clearInterval(this._checkUrlInterval),m=!1},route:function(a,b){this.handlers.unshift({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();a==this.fragment&&this.iframe&&(a=this.getFragment(this.iframe.location.hash));if(a==this.fragment||a==decodeURIComponent(this.fragment))return!1;this.iframe&&this.navigate(a),this.loadUrl()||this.loadUrl(window.location.hash)},loadUrl:function(a){var b=this.fragment=this.getFragment(a);return f.any(this.handlers,function(a){if(a.route.test(b))return a.callback(b),!0})},navigate:function(a,b){if(!m)return!1;if(!b||b===!0)b={trigger:b};var c=(a||"").replace(k,"");this.fragment!=c&&this.fragment!=decodeURIComponent(c)&&(this._hasPushState?(c.indexOf(this.options.root)!=0&&(c=this.options.root+c),this.fragment=c,window.history[b.replace?"replaceState":"pushState"]({},document.title,c)):this._wantsHashChange?(this.fragment=c,this._updateHash(window.location,c,b.replace),this.iframe&&c!=this.getFragment(this.iframe.location.hash)&&(b.replace||this.iframe.document.open().close(),this._updateHash(this.iframe.location,c,b.replace))):window.location.assign(this.options.root+a),b.trigger&&this.loadUrl(a))},_updateHash:function(a,b,c){c?a.replace(a.toString().replace(/(javascript:|#).*$/,"")+"#"+b):a.hash=b}}),e.View=function(a){this.cid=f.uniqueId("view"),this._configure(a||{}),this._ensureElement(),this.initialize.apply(this,arguments),this.delegateEvents()};var n=/^(\S+)\s*(.*)$/,o="model,collection,el,id,attributes,className,tagName".split(",");f.extend(e.View.prototype,e.Events,{tagName:"div",$:function(a){return this.$el.find(a)},initialize:function(){},render:function(){return this},remove:function(){return this.$el.remove(),this},make:function(a,b,c){return a=document.createElement(a),b&&g(a).attr(b),c&&g(a).html(c),a},setElement:function(a,b){this.$el=g(a),this.el=this.$el[0],b!==!1&&this.delegateEvents()},delegateEvents:function(a){if(a||(a=s(this,"events"))){this.undelegateEvents();for(var b in a){var c=a[b];f.isFunction(c)||(c=this[a[b]]);if(!c)throw Error('Event "'+a[b]+'" does not exist');var d=b.match(n),e=d[1],d=d[2],c=f.bind(c,this);e+=".delegateEvents"+this.cid,d===""?this.$el.bind(e,c):this.$el.delegate(d,e,c)}}},undelegateEvents:function(){this.$el.unbind(".delegateEvents"+this.cid)},_configure:function(a){this.options&&(a=f.extend({},this.options,a));for(var b=0,c=o.length;b<c;b++){var d=o[b];a[d]&&(this[d]=a[d])}this.options=a},_ensureElement:function(){if(this.el)this.setElement(this.el,!1);else{var a=s(this,"attributes")||{};this.id&&(a.id=this.id),this.className&&(a["class"]=this.className),this.setElement(this.make(this.tagName,a),!1)}}}),e.Model.extend=e.Collection.extend=e.Router.extend=e.View.extend=function(a,b){var c=r(this,a,b);return c.extend=this.extend,c};var p={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};e.sync=function(a,b,c){var d=p[a],h={type:d,dataType:"json"};return c.url||(h.url=s(b,"url")||t()),!c.data&&b&&(a=="create"||a=="update")&&(h.contentType="application/json",h.data=JSON.stringify(b.toJSON())),e.emulateJSON&&(h.contentType="application/x-www-form-urlencoded",h.data=h.data?{model:h.data}:{}),e.emulateHTTP&&(d==="PUT"||d==="DELETE")&&(e.emulateJSON&&(h.data._method=d),h.type="POST",h.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",d)}),h.type!=="GET"&&!e.emulateJSON&&(h.processData=!1),g.ajax(f.extend(h,c))},e.wrapError=function(a,b,c){return function(d,e){e=d===b?e:d,a?a(d,e,c):b.trigger("error",d,e,c)}};var q=function(){},r=function(a,b,c){var d;return d=b&&b.hasOwnProperty("constructor")?b.constructor:function(){a.apply(this,arguments)},f.extend(d,a),q.prototype=a.prototype,d.prototype=new q,b&&f.extend(d.prototype,b),c&&f.extend(d,c),d.prototype.constructor=d,d.__super__=a.prototype,d},s=function(a,b){return!a||!a[b]?null:f.isFunction(a[b])?a[b]():a[b]},t=function(){throw Error('A "url" property or function must be specified')}}).call(this)