((function(){function a(b,c,d){if(b===c)return b!==0||1/b==1/c;if(b==null||c==null)return b===c;b._chain&&(b=b._wrapped),c._chain&&(c=c._wrapped);if(b.isEqual&&v.isFunction(b.isEqual))return b.isEqual(c);if(c.isEqual&&v.isFunction(c.isEqual))return c.isEqual(b);var e=i.call(b);if(e!=i.call(c))return!1;switch(e){case"[object String]":return b==String(c);case"[object Number]":return b!=+b?c!=+c:b==0?1/b==1/c:b==+c;case"[object Date]":case"[object Boolean]":return+b==+c;case"[object RegExp]":return b.source==c.source&&b.global==c.global&&b.multiline==c.multiline&&b.ignoreCase==c.ignoreCase}if(typeof b!="object"||typeof c!="object")return!1;for(var f=d.length;f--;)if(d[f]==b)return!0;d.push(b);var f=0,g=!0;if(e=="[object Array]"){if(f=b.length,g=f==c.length)for(;f--;)if(!(g=f in b==f in c&&a(b[f],c[f],d)))break}else{if("constructor"in b!="constructor"in c||b.constructor!=c.constructor)return!1;for(var h in b)if(v.has(b,h)&&(f++,!(g=v.has(c,h)&&a(b[h],c[h],d))))break;if(g){for(h in c)if(v.has(c,h)&&!(f--))break;g=!f}}return d.pop(),g}var b=this,c=b._,d={},e=Array.prototype,f=Object.prototype,g=e.slice,h=e.unshift,i=f.toString,j=f.hasOwnProperty,k=e.forEach,l=e.map,m=e.reduce,n=e.reduceRight,o=e.filter,p=e.every,q=e.some,r=e.indexOf,s=e.lastIndexOf,f=Array.isArray,t=Object.keys,u=Function.prototype.bind,v=function(a){return new C(a)};typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(exports=module.exports=v),exports._=v):b._=v,v.VERSION="1.3.1";var w=v.each=v.forEach=function(a,b,c){if(a!=null)if(k&&a.forEach===k)a.forEach(b,c);else if(a.length===+a.length){for(var e=0,f=a.length;e<f;e++)if(e in a&&b.call(c,a[e],e,a)===d)break}else for(e in a)if(v.has(a,e)&&b.call(c,a[e],e,a)===d)break};v.map=v.collect=function(a,b,c){var d=[];return a==null?d:l&&a.map===l?a.map(b,c):(w(a,function(a,e,f){d[d.length]=b.call(c,a,e,f)}),a.length===+a.length&&(d.length=a.length),d)},v.reduce=v.foldl=v.inject=function(a,b,c,d){var e=arguments.length>2;a==null&&(a=[]);if(m&&a.reduce===m)return d&&(b=v.bind(b,d)),e?a.reduce(b,c):a.reduce(b);w(a,function(a,f,g){e?c=b.call(d,c,a,f,g):(c=a,e=!0)});if(!e)throw new TypeError("Reduce of empty array with no initial value");return c},v.reduceRight=v.foldr=function(a,b,c,d){var e=arguments.length>2;a==null&&(a=[]);if(n&&a.reduceRight===n)return d&&(b=v.bind(b,d)),e?a.reduceRight(b,c):a.reduceRight(b);var f=v.toArray(a).reverse();return d&&!e&&(b=v.bind(b,d)),e?v.reduce(f,b,c,d):v.reduce(f,b)},v.find=v.detect=function(a,b,c){var d;return x(a,function(a,e,f){if(b.call(c,a,e,f))return d=a,!0}),d},v.filter=v.select=function(a,b,c){var d=[];return a==null?d:o&&a.filter===o?a.filter(b,c):(w(a,function(a,e,f){b.call(c,a,e,f)&&(d[d.length]=a)}),d)},v.reject=function(a,b,c){var d=[];return a==null?d:(w(a,function(a,e,f){b.call(c,a,e,f)||(d[d.length]=a)}),d)},v.every=v.all=function(a,b,c){var e=!0;return a==null?e:p&&a.every===p?a.every(b,c):(w(a,function(a,f,g){if(!(e=e&&b.call(c,a,f,g)))return d}),e)};var x=v.some=v.any=function(a,b,c){b||(b=v.identity);var e=!1;return a==null?e:q&&a.some===q?a.some(b,c):(w(a,function(a,f,g){if(e||(e=b.call(c,a,f,g)))return d}),!!e)};v.include=v.contains=function(a,b){var c=!1;return a==null?c:r&&a.indexOf===r?a.indexOf(b)!=-1:c=x(a,function(a){return a===b})},v.invoke=function(a,b){var c=g.call(arguments,2);return v.map(a,function(a){return(v.isFunction(b)?b||a:a[b]).apply(a,c)})},v.pluck=function(a,b){return v.map(a,function(a){return a[b]})},v.max=function(a,b,c){if(!b&&v.isArray(a))return Math.max.apply(Math,a);if(!b&&v.isEmpty(a))return-Infinity;var d={computed:-Infinity};return w(a,function(a,e,f){e=b?b.call(c,a,e,f):a,e>=d.computed&&(d={value:a,computed:e})}),d.value},v.min=function(a,b,c){if(!b&&v.isArray(a))return Math.min.apply(Math,a);if(!b&&v.isEmpty(a))return Infinity;var d={computed:Infinity};return w(a,function(a,e,f){e=b?b.call(c,a,e,f):a,e<d.computed&&(d={value:a,computed:e})}),d.value},v.shuffle=function(a){var b=[],c;return w(a,function(a,d){d==0?b[0]=a:(c=Math.floor(Math.random()*(d+1)),b[d]=b[c],b[c]=a)}),b},v.sortBy=function(a,b,c){return v.pluck(v.map(a,function(a,d,e){return{value:a,criteria:b.call(c,a,d,e)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")},v.groupBy=function(a,b){var c={},d=v.isFunction(b)?b:function(a){return a[b]};return w(a,function(a,b){var e=d(a,b);(c[e]||(c[e]=[])).push(a)}),c},v.sortedIndex=function(a,b,c){c||(c=v.identity);for(var d=0,e=a.length;d<e;){var f=d+e>>1;c(a[f])<c(b)?d=f+1:e=f}return d},v.toArray=function(a){return a?a.toArray?a.toArray():v.isArray(a)?g.call(a):v.isArguments(a)?g.call(a):v.values(a):[]},v.size=function(a){return v.toArray(a).length},v.first=v.head=function(a,b,c){return b!=null&&!c?g.call(a,0,b):a[0]},v.initial=function(a,b,c){return g.call(a,0,a.length-(b==null||c?1:b))},v.last=function(a,b,c){return b!=null&&!c?g.call(a,Math.max(a.length-b,0)):a[a.length-1]},v.rest=v.tail=function(a,b,c){return g.call(a,b==null||c?1:b)},v.compact=function(a){return v.filter(a,function(a){return!!a})},v.flatten=function(a,b){return v.reduce(a,function(a,c){return v.isArray(c)?a.concat(b?c:v.flatten(c)):(a[a.length]=c,a)},[])},v.without=function(a){return v.difference(a,g.call(arguments,1))},v.uniq=v.unique=function(a,b,c){var c=c?v.map(a,c):a,d=[];return v.reduce(c,function(c,e,f){if(0==f||(b===!0?v.last(c)!=e:!v.include(c,e)))c[c.length]=e,d[d.length]=a[f];return c},[]),d},v.union=function(){return v.uniq(v.flatten(arguments,!0))},v.intersection=v.intersect=function(a){var b=g.call(arguments,1);return v.filter(v.uniq(a),function(a){return v.every(b,function(b){return v.indexOf(b,a)>=0})})},v.difference=function(a){var b=v.flatten(g.call(arguments,1));return v.filter(a,function(a){return!v.include(b,a)})},v.zip=function(){for(var a=g.call(arguments),b=v.max(v.pluck(a,"length")),c=Array(b),d=0;d<b;d++)c[d]=v.pluck(a,""+d);return c},v.indexOf=function(a,b,c){if(a==null)return-1;var d;if(c)return c=v.sortedIndex(a,b),a[c]===b?c:-1;if(r&&a.indexOf===r)return a.indexOf(b);for(c=0,d=a.length;c<d;c++)if(c in a&&a[c]===b)return c;return-1},v.lastIndexOf=function(a,b){if(a==null)return-1;if(s&&a.lastIndexOf===s)return a.lastIndexOf(b);for(var c=a.length;c--;)if(c in a&&a[c]===b)return c;return-1},v.range=function(a,b,c){arguments.length<=1&&(b=a||0,a=0);for(var c=arguments[2]||1,d=Math.max(Math.ceil((b-a)/c),0),e=0,f=Array(d);e<d;)f[e++]=a,a+=c;return f};var y=function(){};v.bind=function(a,b){var c,d;if(a.bind===u&&u)return u.apply(a,g.call(arguments,1));if(!v.isFunction(a))throw new TypeError;return d=g.call(arguments,2),c=function(){if(this instanceof c){y.prototype=a.prototype;var e=new y,f=a.apply(e,d.concat(g.call(arguments)));return Object(f)===f?f:e}return a.apply(b,d.concat(g.call(arguments)))}},v.bindAll=function(a){var b=g.call(arguments,1);return b.length==0&&(b=v.functions(a)),w(b,function(b){a[b]=v.bind(a[b],a)}),a},v.memoize=function(a,b){var c={};return b||(b=v.identity),function(){var d=b.apply(this,arguments);return v.has(c,d)?c[d]:c[d]=a.apply(this,arguments)}},v.delay=function(a,b){var c=g.call(arguments,2);return setTimeout(function(){return a.apply(a,c)},b)},v.defer=function(a){return v.delay.apply(v,[a,1].concat(g.call(arguments,1)))},v.throttle=function(a,b){var c,d,e,f,g,h=v.debounce(function(){g=f=!1},b);return function(){c=this,d=arguments;var i;e||(e=setTimeout(function(){e=null,g&&a.apply(c,d),h()},b)),f?g=!0:a.apply(c,d),h(),f=!0}},v.debounce=function(a,b){var c;return function(){var d=this,e=arguments;clearTimeout(c),c=setTimeout(function(){c=null,a.apply(d,e)},b)}},v.once=function(a){var b=!1,c;return function(){return b?c:(b=!0,c=a.apply(this,arguments))}},v.wrap=function(a,b){return function(){var c=[a].concat(g.call(arguments,0));return b.apply(this,c)}},v.compose=function(){var a=arguments;return function(){for(var b=arguments,c=a.length-1;c>=0;c--)b=[a[c].apply(this,b)];return b[0]}},v.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}},v.keys=t||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],c;for(c in a)v.has(a,c)&&(b[b.length]=c);return b},v.values=function(a){return v.map(a,v.identity)},v.functions=v.methods=function(a){var b=[],c;for(c in a)v.isFunction(a[c])&&b.push(c);return b.sort()},v.extend=function(a){return w(g.call(arguments,1),function(b){for(var c in b)a[c]=b[c]}),a},v.defaults=function(a){return w(g.call(arguments,1),function(b){for(var c in b)a[c]==null&&(a[c]=b[c])}),a},v.clone=function(a){return v.isObject(a)?v.isArray(a)?a.slice():v.extend({},a):a},v.tap=function(a,b){return b(a),a},v.isEqual=function(b,c){return a(b,c,[])},v.isEmpty=function(a){if(v.isArray(a)||v.isString(a))return a.length===0;for(var b in a)if(v.has(a,b))return!1;return!0},v.isElement=function(a){return!!a&&a.nodeType==1},v.isArray=f||function(a){return i.call(a)=="[object Array]"},v.isObject=function(a){return a===Object(a)},v.isArguments=function(a){return i.call(a)=="[object Arguments]"},v.isArguments(arguments)||(v.isArguments=function(a){return!!a&&!!v.has(a,"callee")}),v.isFunction=function(a){return i.call(a)=="[object Function]"},v.isString=function(a){return i.call(a)=="[object String]"},v.isNumber=function(a){return i.call(a)=="[object Number]"},v.isNaN=function(a){return a!==a},v.isBoolean=function(a){return a===!0||a===!1||i.call(a)=="[object Boolean]"},v.isDate=function(a){return i.call(a)=="[object Date]"},v.isRegExp=function(a){return i.call(a)=="[object RegExp]"},v.isNull=function(a){return a===null},v.isUndefined=function(a){return a===void 0},v.has=function(a,b){return j.call(a,b)},v.noConflict=function(){return b._=c,this},v.identity=function(a){return a},v.times=function(a,b,c){for(var d=0;d<a;d++)b.call(c,d)},v.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},v.mixin=function(a){w(v.functions(a),function(b){E(b,v[b]=a[b])})};var z=0;v.uniqueId=function(a){var b=z++;return a?a+b:b},v.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var A=/.^/,B=function(a){return a.replace(/\\\\/g,"\\").replace(/\\'/g,"'")};v.template=function(a,b){var c=v.templateSettings,c="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(c.escape||A,function(a,b){return"',_.escape("+B(b)+"),'"}).replace(c.interpolate||A,function(a,b){return"',"+B(b)+",'"}).replace(c.evaluate||A,function(a,b){return"');"+B(b).replace(/[\r\n\t]/g," ")+";__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",d=new Function("obj","_",c);return b?d(b,v):function(a){return d.call(this,a,v)}},v.chain=function(a){return v(a).chain()};var C=function(a){this._wrapped=a};v.prototype=C.prototype;var D=function(a,b){return b?v(a).chain():a},E=function(a,b){C.prototype[a]=function(){var a=g.call(arguments);return h.call(a,this._wrapped),D(b.apply(v,a),this._chain)}};v.mixin(v),w("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=e[a];C.prototype[a]=function(){var c=this._wrapped;b.apply(c,arguments);var d=c.length;return(a=="shift"||a=="splice")&&d===0&&delete c[0],D(c,this._chain)}}),w(["concat","join","slice"],function(a){var b=e[a];C.prototype[a]=function(){return D(b.apply(this._wrapped,arguments),this._chain)}}),C.prototype.chain=function(){return this._chain=!0,this},C.prototype.value=function(){return this._wrapped}})).call(this)