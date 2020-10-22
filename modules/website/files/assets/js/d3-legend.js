(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})
({1:[function(require,module,exports){
// https://d3js.org/d3-array/ v2.7.1 Copyright 2020 Mike Bostock
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t="undefined"!=typeof globalThis?globalThis:t||self).d3=t.d3||{})}(this,(function(t){"use strict";function n(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function r(t){let r=t,e=t;function o(t,n,r,o){for(null==r&&(r=0),null==o&&(o=t.length);r<o;){const f=r+o>>>1;e(t[f],n)<0?r=f+1:o=f}return r}return 1===t.length&&(r=(n,r)=>t(n)-r,e=function(t){return(r,e)=>n(t(r),e)}(t)),{left:o,center:function(t,n,e,f){null==e&&(e=0),null==f&&(f=t.length);const u=o(t,n,e,f-1);return u>e&&r(t[u-1],n)>-r(t[u],n)?u-1:u},right:function(t,n,r,o){for(null==r&&(r=0),null==o&&(o=t.length);r<o;){const f=r+o>>>1;e(t[f],n)>0?o=f:r=f+1}return r}}}function e(t){return null===t?NaN:+t}const o=r(n),f=o.right,u=o.left,i=r(e).center;function l(t,n){let r=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&++r;else{let e=-1;for(let o of t)null!=(o=n(o,++e,t))&&(o=+o)>=o&&++r}return r}function c(t){return 0|t.length}function a(t){return!(t>0)}function s(t){return"object"!=typeof t||"length"in t?t:Array.from(t)}function h(t,n){let r,e=0,o=0,f=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(r=n-o,o+=r/++e,f+=r*(n-o));else{let u=-1;for(let i of t)null!=(i=n(i,++u,t))&&(i=+i)>=i&&(r=i-o,o+=r/++e,f+=r*(i-o))}if(e>1)return f/(e-1)}function d(t,n){const r=h(t,n);return r?Math.sqrt(r):r}function p(t,n){let r,e;if(void 0===n)for(const n of t)null!=n&&(void 0===r?n>=n&&(r=e=n):(r>n&&(r=n),e<n&&(e=n)));else{let o=-1;for(let f of t)null!=(f=n(f,++o,t))&&(void 0===r?f>=f&&(r=e=f):(r>f&&(r=f),e<f&&(e=f)))}return[r,e]}class g{constructor(){this._partials=new Float64Array(32),this._n=0}add(t){const n=this._partials;let r=0;for(let e=0;e<this._n&&e<32;e++){const o=n[e],f=t+o,u=Math.abs(t)<Math.abs(o)?t-(f-o):o-(f-t);u&&(n[r++]=u),t=f}return n[r]=t,this._n=r+1,this}valueOf(){const t=this._partials;let n,r,e,o=this._n,f=0;if(o>0){for(f=t[--o];o>0&&(n=f,r=t[--o],f=n+r,e=r-(f-n),!e););o>0&&(e<0&&t[o-1]<0||e>0&&t[o-1]>0)&&(r=2*e,n=f+r,r==n-f&&(f=n))}return f}}function v(t){return t}function M(t){if(1!==t.length)throw new Error("duplicate key");return t[0]}function y(t,n,r,e){return function t(o,f){if(f>=e.length)return r(o);const u=new Map,i=e[f++];let l=-1;for(const t of o){const n=i(t,++l,o),r=u.get(n);r?r.push(t):u.set(n,[t])}for(const[n,r]of u)u.set(n,t(r,f));return n(u)}(t,0)}var m=Array.prototype.slice;function A(t){return function(){return t}}var w=Math.sqrt(50),x=Math.sqrt(10),b=Math.sqrt(2);function N(t,n,r){var e,o,f,u,i=-1;if(r=+r,(t=+t)===(n=+n)&&r>0)return[t];if((e=n<t)&&(o=t,t=n,n=o),0===(u=_(t,n,r))||!isFinite(u))return[];if(u>0)for(t=Math.ceil(t/u),n=Math.floor(n/u),f=new Array(o=Math.ceil(n-t+1));++i<o;)f[i]=(t+i)*u;else for(u=-u,t=Math.ceil(t*u),n=Math.floor(n*u),f=new Array(o=Math.ceil(n-t+1));++i<o;)f[i]=(t+i)/u;return e&&f.reverse(),f}function _(t,n,r){var e=(n-t)/Math.max(0,r),o=Math.floor(Math.log(e)/Math.LN10),f=e/Math.pow(10,o);return o>=0?(f>=w?10:f>=x?5:f>=b?2:1)*Math.pow(10,o):-Math.pow(10,-o)/(f>=w?10:f>=x?5:f>=b?2:1)}function q(t){return Math.ceil(Math.log(l(t))/Math.LN2)+1}function k(){var t=v,n=p,r=q;function e(e){Array.isArray(e)||(e=Array.from(e));var o,u,i=e.length,l=new Array(i);for(o=0;o<i;++o)l[o]=t(e[o],o,e);var c=n(l),a=c[0],s=c[1],h=r(l,a,s);Array.isArray(h)||(h=N(a,s,h))[h.length-1]===s&&h.pop();for(var d=h.length;h[0]<=a;)h.shift(),--d;for(;h[d-1]>s;)h.pop(),--d;var p,g=new Array(d+1);for(o=0;o<=d;++o)(p=g[o]=[]).x0=o>0?h[o-1]:a,p.x1=o<d?h[o]:s;for(o=0;o<i;++o)a<=(u=l[o])&&u<=s&&g[f(h,u,0,d)].push(e[o]);return g}return e.value=function(n){return arguments.length?(t="function"==typeof n?n:A(n),e):t},e.domain=function(t){return arguments.length?(n="function"==typeof t?t:A([t[0],t[1]]),e):n},e.thresholds=function(t){return arguments.length?(r="function"==typeof t?t:Array.isArray(t)?A(m.call(t)):A(t),e):r},e}function F(t,n){let r;if(void 0===n)for(const n of t)null!=n&&(r<n||void 0===r&&n>=n)&&(r=n);else{let e=-1;for(let o of t)null!=(o=n(o,++e,t))&&(r<o||void 0===r&&o>=o)&&(r=o)}return r}function I(t,n){let r;if(void 0===n)for(const n of t)null!=n&&(r>n||void 0===r&&n>=n)&&(r=n);else{let e=-1;for(let o of t)null!=(o=n(o,++e,t))&&(r>o||void 0===r&&o>=o)&&(r=o)}return r}function L(t,r,e=0,o=t.length-1,f=n){for(;o>e;){if(o-e>600){const n=o-e+1,u=r-e+1,i=Math.log(n),l=.5*Math.exp(2*i/3),c=.5*Math.sqrt(i*l*(n-l)/n)*(u-n/2<0?-1:1);L(t,r,Math.max(e,Math.floor(r-u*l/n+c)),Math.min(o,Math.floor(r+(n-u)*l/n+c)),f)}const n=t[r];let u=e,i=o;for(S(t,e,r),f(t[o],n)>0&&S(t,e,o);u<i;){for(S(t,u,i),++u,--i;f(t[u],n)<0;)++u;for(;f(t[i],n)>0;)--i}0===f(t[e],n)?S(t,e,i):(++i,S(t,i,o)),i<=r&&(e=i+1),r<=i&&(o=i-1)}return t}function S(t,n,r){const e=t[n];t[n]=t[r],t[r]=e}function j(t,n,r){if(e=(t=Float64Array.from(function*(t,n){if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(yield n);else{let r=-1;for(let e of t)null!=(e=n(e,++r,t))&&(e=+e)>=e&&(yield e)}}(t,r))).length){if((n=+n)<=0||e<2)return I(t);if(n>=1)return F(t);var e,o=(e-1)*n,f=Math.floor(o),u=F(L(t,f).subarray(0,f+1));return u+(I(t.subarray(f+1))-u)*(o-f)}}function O(t,n){let r,e=-1,o=-1;if(void 0===n)for(const n of t)++o,null!=n&&(r<n||void 0===r&&n>=n)&&(r=n,e=o);else for(let f of t)null!=(f=n(f,++o,t))&&(r<f||void 0===r&&f>=f)&&(r=f,e=o);return e}function T(t,n){let r,e=-1,o=-1;if(void 0===n)for(const n of t)++o,null!=n&&(r>n||void 0===r&&n>=n)&&(r=n,e=o);else for(let f of t)null!=(f=n(f,++o,t))&&(r>f||void 0===r&&f>=f)&&(r=f,e=o);return e}function z(t,n){return[t,n]}function C(t,r=n){if(1===r.length)return T(t,r);let e,o=-1,f=-1;for(const n of t)++f,(o<0?0===r(n,n):r(n,e)<0)&&(e=n,o=f);return o}var D=E(Math.random);function E(t){return function(n,r=0,e=n.length){let o=e-(r=+r);for(;o;){const e=t()*o--|0,f=n[o+r];n[o+r]=n[e+r],n[e+r]=f}return n}}function P(t){if(!(o=t.length))return[];for(var n=-1,r=I(t,R),e=new Array(r);++n<r;)for(var o,f=-1,u=e[n]=new Array(o);++f<o;)u[f]=t[f][n];return e}function R(t){return t.length}t.Adder=g,t.ascending=n,t.bin=k,t.bisect=f,t.bisectCenter=i,t.bisectLeft=u,t.bisectRight=f,t.bisector=r,t.count=l,t.cross=function(...t){const n="function"==typeof t[t.length-1]&&function(t){return n=>t(...n)}(t.pop()),r=(t=t.map(s)).map(c),e=t.length-1,o=new Array(e+1).fill(0),f=[];if(e<0||r.some(a))return f;for(;;){f.push(o.map((n,r)=>t[r][n]));let u=e;for(;++o[u]===r[u];){if(0===u)return n?f.map(n):f;o[u--]=0}}},t.cumsum=function(t,n){var r=0,e=0;return Float64Array.from(t,void 0===n?t=>r+=+t||0:o=>r+=+n(o,e++,t)||0)},t.descending=function(t,n){return n<t?-1:n>t?1:n>=t?0:NaN},t.deviation=d,t.extent=p,t.fsum=function(t,n){const r=new g;if(void 0===n)for(let n of t)(n=+n)&&r.add(n);else{let e=-1;for(let o of t)(o=+n(o,++e,t))&&r.add(o)}return+r},t.greatest=function(t,r=n){let e,o=!1;if(1===r.length){let f;for(const u of t){const t=r(u);(o?n(t,f)>0:0===n(t,t))&&(e=u,f=t,o=!0)}}else for(const n of t)(o?r(n,e)>0:0===r(n,n))&&(e=n,o=!0);return e},t.greatestIndex=function(t,r=n){if(1===r.length)return O(t,r);let e,o=-1,f=-1;for(const n of t)++f,(o<0?0===r(n,n):r(n,e)>0)&&(e=n,o=f);return o},t.group=function(t,...n){return y(t,v,v,n)},t.groups=function(t,...n){return y(t,Array.from,v,n)},t.histogram=k,t.index=function(t,...n){return y(t,v,M,n)},t.indexes=function(t,...n){return y(t,Array.from,M,n)},t.least=function(t,r=n){let e,o=!1;if(1===r.length){let f;for(const u of t){const t=r(u);(o?n(t,f)<0:0===n(t,t))&&(e=u,f=t,o=!0)}}else for(const n of t)(o?r(n,e)<0:0===r(n,n))&&(e=n,o=!0);return e},t.leastIndex=C,t.max=F,t.maxIndex=O,t.mean=function(t,n){let r=0,e=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(++r,e+=n);else{let o=-1;for(let f of t)null!=(f=n(f,++o,t))&&(f=+f)>=f&&(++r,e+=f)}if(r)return e/r},t.median=function(t,n){return j(t,.5,n)},t.merge=function(t){return Array.from(function*(t){for(const n of t)yield*n}(t))},t.min=I,t.minIndex=T,t.pairs=function(t,n=z){const r=[];let e,o=!1;for(const f of t)o&&r.push(n(e,f)),e=f,o=!0;return r},t.permute=function(t,n){return Array.from(n,n=>t[n])},t.quantile=j,t.quantileSorted=function(t,n,r=e){if(o=t.length){if((n=+n)<=0||o<2)return+r(t[0],0,t);if(n>=1)return+r(t[o-1],o-1,t);var o,f=(o-1)*n,u=Math.floor(f),i=+r(t[u],u,t);return i+(+r(t[u+1],u+1,t)-i)*(f-u)}},t.quickselect=L,t.range=function(t,n,r){t=+t,n=+n,r=(o=arguments.length)<2?(n=t,t=0,1):o<3?1:+r;for(var e=-1,o=0|Math.max(0,Math.ceil((n-t)/r)),f=new Array(o);++e<o;)f[e]=t+e*r;return f},t.rollup=function(t,n,...r){return y(t,v,n,r)},t.rollups=function(t,n,...r){return y(t,Array.from,n,r)},t.scan=function(t,n){const r=C(t,n);return r<0?void 0:r},t.shuffle=D,t.shuffler=E,t.sum=function(t,n){let r=0;if(void 0===n)for(let n of t)(n=+n)&&(r+=n);else{let e=-1;for(let o of t)(o=+n(o,++e,t))&&(r+=o)}return r},t.thresholdFreedmanDiaconis=function(t,n,r){return Math.ceil((r-n)/(2*(j(t,.75)-j(t,.25))*Math.pow(l(t),-1/3)))},t.thresholdScott=function(t,n,r){return Math.ceil((r-n)/(3.5*d(t)*Math.pow(l(t),-1/3)))},t.thresholdSturges=q,t.tickIncrement=_,t.tickStep=function(t,n,r){var e=Math.abs(n-t)/Math.max(0,r),o=Math.pow(10,Math.floor(Math.log(e)/Math.LN10)),f=e/o;return f>=w?o*=10:f>=x?o*=5:f>=b&&(o*=2),n<t?-o:o},t.ticks=N,t.transpose=P,t.variance=h,t.zip=function(){return P(arguments)},Object.defineProperty(t,"__esModule",{value:!0})}));
},{}],2:[function(require,module,exports){
// https://d3js.org/d3-collection/ v1.0.7 Copyright 2018 Mike Bostock
!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(n.d3=n.d3||{})}(this,function(n){"use strict";function t(){}function e(n,e){var r=new t;if(n instanceof t)n.each(function(n,t){r.set(t,n)});else if(Array.isArray(n)){var i,u=-1,o=n.length;if(null==e)for(;++u<o;)r.set(u,n[u]);else for(;++u<o;)r.set(e(i=n[u],u,n),i)}else if(n)for(var s in n)r.set(s,n[s]);return r}function r(){return{}}function i(n,t,e){n[t]=e}function u(){return e()}function o(n,t,e){n.set(t,e)}function s(){}t.prototype=e.prototype={constructor:t,has:function(n){return"$"+n in this},get:function(n){return this["$"+n]},set:function(n,t){return this["$"+n]=t,this},remove:function(n){var t="$"+n;return t in this&&delete this[t]},clear:function(){for(var n in this)"$"===n[0]&&delete this[n]},keys:function(){var n=[];for(var t in this)"$"===t[0]&&n.push(t.slice(1));return n},values:function(){var n=[];for(var t in this)"$"===t[0]&&n.push(this[t]);return n},entries:function(){var n=[];for(var t in this)"$"===t[0]&&n.push({key:t.slice(1),value:this[t]});return n},size:function(){var n=0;for(var t in this)"$"===t[0]&&++n;return n},empty:function(){for(var n in this)if("$"===n[0])return!1;return!0},each:function(n){for(var t in this)"$"===t[0]&&n(this[t],t.slice(1),this)}};var f=e.prototype;function c(n,t){var e=new s;if(n instanceof s)n.each(function(n){e.add(n)});else if(n){var r=-1,i=n.length;if(null==t)for(;++r<i;)e.add(n[r]);else for(;++r<i;)e.add(t(n[r],r,n))}return e}s.prototype=c.prototype={constructor:s,has:f.has,add:function(n){return this["$"+(n+="")]=n,this},remove:f.remove,clear:f.clear,values:f.keys,size:f.size,empty:f.empty,each:f.each},n.nest=function(){var n,t,s,f=[],c=[];function a(r,i,u,o){if(i>=f.length)return null!=n&&r.sort(n),null!=t?t(r):r;for(var s,c,h,l=-1,v=r.length,p=f[i++],y=e(),d=u();++l<v;)(h=y.get(s=p(c=r[l])+""))?h.push(c):y.set(s,[c]);return y.each(function(n,t){o(d,t,a(n,i,u,o))}),d}return s={object:function(n){return a(n,0,r,i)},map:function(n){return a(n,0,u,o)},entries:function(n){return function n(e,r){if(++r>f.length)return e;var i,u=c[r-1];return null!=t&&r>=f.length?i=e.entries():(i=[],e.each(function(t,e){i.push({key:e,values:n(t,r)})})),null!=u?i.sort(function(n,t){return u(n.key,t.key)}):i}(a(n,0,u,o),0)},key:function(n){return f.push(n),s},sortKeys:function(n){return c[f.length-1]=n,s},sortValues:function(t){return n=t,s},rollup:function(n){return t=n,s}}},n.set=c,n.map=e,n.keys=function(n){var t=[];for(var e in n)t.push(e);return t},n.values=function(n){var t=[];for(var e in n)t.push(n[e]);return t},n.entries=function(n){var t=[];for(var e in n)t.push({key:e,value:n[e]});return t},Object.defineProperty(n,"__esModule",{value:!0})});
},{}],3:[function(require,module,exports){
// https://d3js.org/d3-color/ v2.0.0 Copyright 2020 Mike Bostock
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).d3=t.d3||{})}(this,function(t){"use strict";function e(t,e,n){t.prototype=e.prototype=n,n.constructor=t}function n(t,e){var n=Object.create(t.prototype);for(var i in e)n[i]=e[i];return n}function i(){}var r="\\s*([+-]?\\d+)\\s*",a="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",s="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",o=/^#([0-9a-f]{3,8})$/,h=new RegExp("^rgb\\("+[r,r,r]+"\\)$"),l=new RegExp("^rgb\\("+[s,s,s]+"\\)$"),u=new RegExp("^rgba\\("+[r,r,r,a]+"\\)$"),c=new RegExp("^rgba\\("+[s,s,s,a]+"\\)$"),g=new RegExp("^hsl\\("+[a,s,s]+"\\)$"),f=new RegExp("^hsla\\("+[a,s,s,a]+"\\)$"),d={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function p(){return this.rgb().formatHex()}function b(){return this.rgb().formatRgb()}function y(t){var e,n;return t=(t+"").trim().toLowerCase(),(e=o.exec(t))?(n=e[1].length,e=parseInt(e[1],16),6===n?w(e):3===n?new M(e>>8&15|e>>4&240,e>>4&15|240&e,(15&e)<<4|15&e,1):8===n?m(e>>24&255,e>>16&255,e>>8&255,(255&e)/255):4===n?m(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|240&e,((15&e)<<4|15&e)/255):null):(e=h.exec(t))?new M(e[1],e[2],e[3],1):(e=l.exec(t))?new M(255*e[1]/100,255*e[2]/100,255*e[3]/100,1):(e=u.exec(t))?m(e[1],e[2],e[3],e[4]):(e=c.exec(t))?m(255*e[1]/100,255*e[2]/100,255*e[3]/100,e[4]):(e=g.exec(t))?R(e[1],e[2]/100,e[3]/100,1):(e=f.exec(t))?R(e[1],e[2]/100,e[3]/100,e[4]):d.hasOwnProperty(t)?w(d[t]):"transparent"===t?new M(NaN,NaN,NaN,0):null}function w(t){return new M(t>>16&255,t>>8&255,255&t,1)}function m(t,e,n,i){return i<=0&&(t=e=n=NaN),new M(t,e,n,i)}function N(t){return t instanceof i||(t=y(t)),t?new M((t=t.rgb()).r,t.g,t.b,t.opacity):new M}function k(t,e,n,i){return 1===arguments.length?N(t):new M(t,e,n,null==i?1:i)}function M(t,e,n,i){this.r=+t,this.g=+e,this.b=+n,this.opacity=+i}function v(){return"#"+q(this.r)+q(this.g)+q(this.b)}function x(){var t=this.opacity;return(1===(t=isNaN(t)?1:Math.max(0,Math.min(1,t)))?"rgb(":"rgba(")+Math.max(0,Math.min(255,Math.round(this.r)||0))+", "+Math.max(0,Math.min(255,Math.round(this.g)||0))+", "+Math.max(0,Math.min(255,Math.round(this.b)||0))+(1===t?")":", "+t+")")}function q(t){return((t=Math.max(0,Math.min(255,Math.round(t)||0)))<16?"0":"")+t.toString(16)}function R(t,e,n,i){return i<=0?t=e=n=NaN:n<=0||n>=1?t=e=NaN:e<=0&&(t=NaN),new H(t,e,n,i)}function E(t){if(t instanceof H)return new H(t.h,t.s,t.l,t.opacity);if(t instanceof i||(t=y(t)),!t)return new H;if(t instanceof H)return t;var e=(t=t.rgb()).r/255,n=t.g/255,r=t.b/255,a=Math.min(e,n,r),s=Math.max(e,n,r),o=NaN,h=s-a,l=(s+a)/2;return h?(o=e===s?(n-r)/h+6*(n<r):n===s?(r-e)/h+2:(e-n)/h+4,h/=l<.5?s+a:2-s-a,o*=60):h=l>0&&l<1?0:o,new H(o,h,l,t.opacity)}function $(t,e,n,i){return 1===arguments.length?E(t):new H(t,e,n,null==i?1:i)}function H(t,e,n,i){this.h=+t,this.s=+e,this.l=+n,this.opacity=+i}function j(t,e,n){return 255*(t<60?e+(n-e)*t/60:t<180?n:t<240?e+(n-e)*(240-t)/60:e)}e(i,y,{copy:function(t){return Object.assign(new this.constructor,this,t)},displayable:function(){return this.rgb().displayable()},hex:p,formatHex:p,formatHsl:function(){return E(this).formatHsl()},formatRgb:b,toString:b}),e(M,k,n(i,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new M(this.r*t,this.g*t,this.b*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new M(this.r*t,this.g*t,this.b*t,this.opacity)},rgb:function(){return this},displayable:function(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:v,formatHex:v,formatRgb:x,toString:x})),e(H,$,n(i,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new H(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new H(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=this.h%360+360*(this.h<0),e=isNaN(t)||isNaN(this.s)?0:this.s,n=this.l,i=n+(n<.5?n:1-n)*e,r=2*n-i;return new M(j(t>=240?t-240:t+120,r,i),j(t,r,i),j(t<120?t+240:t-120,r,i),this.opacity)},displayable:function(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl:function(){var t=this.opacity;return(1===(t=isNaN(t)?1:Math.max(0,Math.min(1,t)))?"hsl(":"hsla(")+(this.h||0)+", "+100*(this.s||0)+"%, "+100*(this.l||0)+"%"+(1===t?")":", "+t+")")}}));const O=Math.PI/180,P=180/Math.PI,I=.96422,S=1,_=.82521,z=4/29,C=6/29,L=3*C*C,A=C*C*C;function B(t){if(t instanceof F)return new F(t.l,t.a,t.b,t.opacity);if(t instanceof V)return W(t);t instanceof M||(t=N(t));var e,n,i=Q(t.r),r=Q(t.g),a=Q(t.b),s=G((.2225045*i+.7168786*r+.0606169*a)/S);return i===r&&r===a?e=n=s:(e=G((.4360747*i+.3850649*r+.1430804*a)/I),n=G((.0139322*i+.0971045*r+.7141733*a)/_)),new F(116*s-16,500*(e-s),200*(s-n),t.opacity)}function D(t,e,n,i){return 1===arguments.length?B(t):new F(t,e,n,null==i?1:i)}function F(t,e,n,i){this.l=+t,this.a=+e,this.b=+n,this.opacity=+i}function G(t){return t>A?Math.pow(t,1/3):t/L+z}function J(t){return t>C?t*t*t:L*(t-z)}function K(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function Q(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function T(t){if(t instanceof V)return new V(t.h,t.c,t.l,t.opacity);if(t instanceof F||(t=B(t)),0===t.a&&0===t.b)return new V(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var e=Math.atan2(t.b,t.a)*P;return new V(e<0?e+360:e,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function U(t,e,n,i){return 1===arguments.length?T(t):new V(t,e,n,null==i?1:i)}function V(t,e,n,i){this.h=+t,this.c=+e,this.l=+n,this.opacity=+i}function W(t){if(isNaN(t.h))return new F(t.l,0,0,t.opacity);var e=t.h*O;return new F(t.l,Math.cos(e)*t.c,Math.sin(e)*t.c,t.opacity)}e(F,D,n(i,{brighter:function(t){return new F(this.l+18*(null==t?1:t),this.a,this.b,this.opacity)},darker:function(t){return new F(this.l-18*(null==t?1:t),this.a,this.b,this.opacity)},rgb:function(){var t=(this.l+16)/116,e=isNaN(this.a)?t:t+this.a/500,n=isNaN(this.b)?t:t-this.b/200;return new M(K(3.1338561*(e=I*J(e))-1.6168667*(t=S*J(t))-.4906146*(n=_*J(n))),K(-.9787684*e+1.9161415*t+.033454*n),K(.0719453*e-.2289914*t+1.4052427*n),this.opacity)}})),e(V,U,n(i,{brighter:function(t){return new V(this.h,this.c,this.l+18*(null==t?1:t),this.opacity)},darker:function(t){return new V(this.h,this.c,this.l-18*(null==t?1:t),this.opacity)},rgb:function(){return W(this).rgb()}}));var X=-.14861,Y=1.78277,Z=-.29227,tt=-.90649,et=1.97294,nt=et*tt,it=et*Y,rt=Y*Z-tt*X;function at(t,e,n,i){return 1===arguments.length?function(t){if(t instanceof st)return new st(t.h,t.s,t.l,t.opacity);t instanceof M||(t=N(t));var e=t.r/255,n=t.g/255,i=t.b/255,r=(rt*i+nt*e-it*n)/(rt+nt-it),a=i-r,s=(et*(n-r)-Z*a)/tt,o=Math.sqrt(s*s+a*a)/(et*r*(1-r)),h=o?Math.atan2(s,a)*P-120:NaN;return new st(h<0?h+360:h,o,r,t.opacity)}(t):new st(t,e,n,null==i?1:i)}function st(t,e,n,i){this.h=+t,this.s=+e,this.l=+n,this.opacity=+i}e(st,at,n(i,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new st(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new st(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=isNaN(this.h)?0:(this.h+120)*O,e=+this.l,n=isNaN(this.s)?0:this.s*e*(1-e),i=Math.cos(t),r=Math.sin(t);return new M(255*(e+n*(X*i+Y*r)),255*(e+n*(Z*i+tt*r)),255*(e+n*(et*i)),this.opacity)}})),t.color=y,t.cubehelix=at,t.gray=function(t,e){return new F(t,0,0,null==e?1:e)},t.hcl=U,t.hsl=$,t.lab=D,t.lch=function(t,e,n,i){return 1===arguments.length?T(t):new V(n,e,t,null==i?1:i)},t.rgb=k,Object.defineProperty(t,"__esModule",{value:!0})});
},{}],4:[function(require,module,exports){
// https://d3js.org/d3-dispatch/ v1.0.6 Copyright 2019 Mike Bostock
!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((n=n||self).d3=n.d3||{})}(this,function(n){"use strict";var e={value:function(){}};function t(){for(var n,e=0,t=arguments.length,o={};e<t;++e){if(!(n=arguments[e]+"")||n in o||/[\s.]/.test(n))throw new Error("illegal type: "+n);o[n]=[]}return new r(o)}function r(n){this._=n}function o(n,e){return n.trim().split(/^|\s+/).map(function(n){var t="",r=n.indexOf(".");if(r>=0&&(t=n.slice(r+1),n=n.slice(0,r)),n&&!e.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:t}})}function i(n,e){for(var t,r=0,o=n.length;r<o;++r)if((t=n[r]).name===e)return t.value}function f(n,t,r){for(var o=0,i=n.length;o<i;++o)if(n[o].name===t){n[o]=e,n=n.slice(0,o).concat(n.slice(o+1));break}return null!=r&&n.push({name:t,value:r}),n}r.prototype=t.prototype={constructor:r,on:function(n,e){var t,r=this._,l=o(n+"",r),u=-1,a=l.length;if(!(arguments.length<2)){if(null!=e&&"function"!=typeof e)throw new Error("invalid callback: "+e);for(;++u<a;)if(t=(n=l[u]).type)r[t]=f(r[t],n.name,e);else if(null==e)for(t in r)r[t]=f(r[t],n.name,null);return this}for(;++u<a;)if((t=(n=l[u]).type)&&(t=i(r[t],n.name)))return t},copy:function(){var n={},e=this._;for(var t in e)n[t]=e[t].slice();return new r(n)},call:function(n,e){if((t=arguments.length-2)>0)for(var t,r,o=new Array(t),i=0;i<t;++i)o[i]=arguments[i+2];if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(i=0,t=(r=this._[n]).length;i<t;++i)r[i].value.apply(e,o)},apply:function(n,e,t){if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(var r=this._[n],o=0,i=r.length;o<i;++o)r[o].value.apply(e,t)}},n.dispatch=t,Object.defineProperty(n,"__esModule",{value:!0})});
},{}],5:[function(require,module,exports){
// https://d3js.org/d3-format/ v2.0.0 Copyright 2020 Mike Bostock
!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i((t="undefined"!=typeof globalThis?globalThis:t||self).d3=t.d3||{})}(this,(function(t){"use strict";function i(t,i){if((n=(t=i?t.toExponential(i-1):t.toExponential()).indexOf("e"))<0)return null;var n,r=t.slice(0,n);return[r.length>1?r[0]+r.slice(2):r,+t.slice(n+1)]}function n(t){return(t=i(Math.abs(t)))?t[1]:NaN}var r,e=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function o(t){if(!(i=e.exec(t)))throw new Error("invalid format: "+t);var i;return new a({fill:i[1],align:i[2],sign:i[3],symbol:i[4],zero:i[5],width:i[6],comma:i[7],precision:i[8]&&i[8].slice(1),trim:i[9],type:i[10]})}function a(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function s(t,n){var r=i(t,n);if(!r)return t+"";var e=r[0],o=r[1];return o<0?"0."+new Array(-o).join("0")+e:e.length>o+1?e.slice(0,o+1)+"."+e.slice(o+1):e+new Array(o-e.length+2).join("0")}o.prototype=a.prototype,a.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var c={"%":(t,i)=>(100*t).toFixed(i),b:t=>Math.round(t).toString(2),c:t=>t+"",d:function(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)},e:(t,i)=>t.toExponential(i),f:(t,i)=>t.toFixed(i),g:(t,i)=>t.toPrecision(i),o:t=>Math.round(t).toString(8),p:(t,i)=>s(100*t,i),r:s,s:function(t,n){var e=i(t,n);if(!e)return t+"";var o=e[0],a=e[1],s=a-(r=3*Math.max(-8,Math.min(8,Math.floor(a/3))))+1,c=o.length;return s===c?o:s>c?o+new Array(s-c+1).join("0"):s>0?o.slice(0,s)+"."+o.slice(s):"0."+new Array(1-s).join("0")+i(t,Math.max(0,n+s-1))[0]},X:t=>Math.round(t).toString(16).toUpperCase(),x:t=>Math.round(t).toString(16)};function h(t){return t}var l,u=Array.prototype.map,f=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function d(t){var i,e,a=void 0===t.grouping||void 0===t.thousands?h:(i=u.call(t.grouping,Number),e=t.thousands+"",function(t,n){for(var r=t.length,o=[],a=0,s=i[0],c=0;r>0&&s>0&&(c+s+1>n&&(s=Math.max(1,n-c)),o.push(t.substring(r-=s,r+s)),!((c+=s+1)>n));)s=i[a=(a+1)%i.length];return o.reverse().join(e)}),s=void 0===t.currency?"":t.currency[0]+"",l=void 0===t.currency?"":t.currency[1]+"",d=void 0===t.decimal?".":t.decimal+"",m=void 0===t.numerals?h:function(t){return function(i){return i.replace(/[0-9]/g,(function(i){return t[+i]}))}}(u.call(t.numerals,String)),p=void 0===t.percent?"%":t.percent+"",g=void 0===t.minus?"−":t.minus+"",v=void 0===t.nan?"NaN":t.nan+"";function M(t){var i=(t=o(t)).fill,n=t.align,e=t.sign,h=t.symbol,u=t.zero,M=t.width,y=t.comma,x=t.precision,b=t.trim,w=t.type;"n"===w?(y=!0,w="g"):c[w]||(void 0===x&&(x=12),b=!0,w="g"),(u||"0"===i&&"="===n)&&(u=!0,i="0",n="=");var S="$"===h?s:"#"===h&&/[boxX]/.test(w)?"0"+w.toLowerCase():"",j="$"===h?l:/[%p]/.test(w)?p:"",k=c[w],z=/[defgprs%]/.test(w);function A(t){var o,s,c,h=S,l=j;if("c"===w)l=k(t)+l,t="";else{var p=(t=+t)<0||1/t<0;if(t=isNaN(t)?v:k(Math.abs(t),x),b&&(t=function(t){t:for(var i,n=t.length,r=1,e=-1;r<n;++r)switch(t[r]){case".":e=i=r;break;case"0":0===e&&(e=r),i=r;break;default:if(!+t[r])break t;e>0&&(e=0)}return e>0?t.slice(0,e)+t.slice(i+1):t}(t)),p&&0==+t&&"+"!==e&&(p=!1),h=(p?"("===e?e:g:"-"===e||"("===e?"":e)+h,l=("s"===w?f[8+r/3]:"")+l+(p&&"("===e?")":""),z)for(o=-1,s=t.length;++o<s;)if(48>(c=t.charCodeAt(o))||c>57){l=(46===c?d+t.slice(o+1):t.slice(o))+l,t=t.slice(0,o);break}}y&&!u&&(t=a(t,1/0));var A=h.length+t.length+l.length,N=A<M?new Array(M-A+1).join(i):"";switch(y&&u&&(t=a(N+t,N.length?M-l.length:1/0),N=""),n){case"<":t=h+t+l+N;break;case"=":t=h+N+t+l;break;case"^":t=N.slice(0,A=N.length>>1)+h+t+l+N.slice(A);break;default:t=N+h+t+l}return m(t)}return x=void 0===x?6:/[gprs]/.test(w)?Math.max(1,Math.min(21,x)):Math.max(0,Math.min(20,x)),A.toString=function(){return t+""},A}return{format:M,formatPrefix:function(t,i){var r=M(((t=o(t)).type="f",t)),e=3*Math.max(-8,Math.min(8,Math.floor(n(i)/3))),a=Math.pow(10,-e),s=f[8+e/3];return function(t){return r(a*t)+s}}}}function m(i){return l=d(i),t.format=l.format,t.formatPrefix=l.formatPrefix,l}m({thousands:",",grouping:[3],currency:["$",""]}),t.FormatSpecifier=a,t.formatDefaultLocale=m,t.formatLocale=d,t.formatSpecifier=o,t.precisionFixed=function(t){return Math.max(0,-n(Math.abs(t)))},t.precisionPrefix=function(t,i){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(n(i)/3)))-n(Math.abs(t)))},t.precisionRound=function(t,i){return t=Math.abs(t),i=Math.abs(i)-t,Math.max(0,n(i)-n(t))+1},Object.defineProperty(t,"__esModule",{value:!0})}));
},{}],6:[function(require,module,exports){
// https://d3js.org/d3-interpolate/ v2.0.1 Copyright 2020 Mike Bostock
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports,require("d3-color")):"function"==typeof define&&define.amd?define(["exports","d3-color"],n):n((t=t||self).d3=t.d3||{},t.d3)}(this,function(t,n){"use strict";function r(t,n,r,e,a){var o=t*t,u=o*t;return((1-3*t+3*o-u)*n+(4-6*o+3*u)*r+(1+3*t+3*o-3*u)*e+u*a)/6}function e(t){var n=t.length-1;return function(e){var a=e<=0?e=0:e>=1?(e=1,n-1):Math.floor(e*n),o=t[a],u=t[a+1],i=a>0?t[a-1]:2*o-u,c=a<n-1?t[a+2]:2*u-o;return r((e-a/n)*n,i,o,u,c)}}function a(t){var n=t.length;return function(e){var a=Math.floor(((e%=1)<0?++e:e)*n),o=t[(a+n-1)%n],u=t[a%n],i=t[(a+1)%n],c=t[(a+2)%n];return r((e-a/n)*n,o,u,i,c)}}var o=t=>()=>t;function u(t,n){return function(r){return t+r*n}}function i(t,n){var r=n-t;return r?u(t,r>180||r<-180?r-360*Math.round(r/360):r):o(isNaN(t)?n:t)}function c(t){return 1==(t=+t)?l:function(n,r){return r-n?function(t,n,r){return t=Math.pow(t,r),n=Math.pow(n,r)-t,r=1/r,function(e){return Math.pow(t+e*n,r)}}(n,r,t):o(isNaN(n)?r:n)}}function l(t,n){var r=n-t;return r?u(t,r):o(isNaN(t)?n:t)}var f=function t(r){var e=c(r);function a(t,r){var a=e((t=n.rgb(t)).r,(r=n.rgb(r)).r),o=e(t.g,r.g),u=e(t.b,r.b),i=l(t.opacity,r.opacity);return function(n){return t.r=a(n),t.g=o(n),t.b=u(n),t.opacity=i(n),t+""}}return a.gamma=t,a}(1);function s(t){return function(r){var e,a,o=r.length,u=new Array(o),i=new Array(o),c=new Array(o);for(e=0;e<o;++e)a=n.rgb(r[e]),u[e]=a.r||0,i[e]=a.g||0,c[e]=a.b||0;return u=t(u),i=t(i),c=t(c),a.opacity=1,function(t){return a.r=u(t),a.g=i(t),a.b=c(t),a+""}}}var h=s(e),p=s(a);function v(t,n){n||(n=[]);var r,e=t?Math.min(n.length,t.length):0,a=n.slice();return function(o){for(r=0;r<e;++r)a[r]=t[r]*(1-o)+n[r]*o;return a}}function g(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function M(t,n){var r,e=n?n.length:0,a=t?Math.min(e,t.length):0,o=new Array(a),u=new Array(e);for(r=0;r<a;++r)o[r]=X(t[r],n[r]);for(;r<e;++r)u[r]=n[r];return function(t){for(r=0;r<a;++r)u[r]=o[r](t);return u}}function y(t,n){var r=new Date;return t=+t,n=+n,function(e){return r.setTime(t*(1-e)+n*e),r}}function x(t,n){return t=+t,n=+n,function(r){return t*(1-r)+n*r}}function b(t,n){var r,e={},a={};for(r in null!==t&&"object"==typeof t||(t={}),null!==n&&"object"==typeof n||(n={}),n)r in t?e[r]=X(t[r],n[r]):a[r]=n[r];return function(t){for(r in e)a[r]=e[r](t);return a}}var d=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,w=new RegExp(d.source,"g");function m(t,n){var r,e,a,o=d.lastIndex=w.lastIndex=0,u=-1,i=[],c=[];for(t+="",n+="";(r=d.exec(t))&&(e=w.exec(n));)(a=e.index)>o&&(a=n.slice(o,a),i[u]?i[u]+=a:i[++u]=a),(r=r[0])===(e=e[0])?i[u]?i[u]+=e:i[++u]=e:(i[++u]=null,c.push({i:u,x:x(r,e)})),o=w.lastIndex;return o<n.length&&(a=n.slice(o),i[u]?i[u]+=a:i[++u]=a),i.length<2?c[0]?function(t){return function(n){return t(n)+""}}(c[0].x):function(t){return function(){return t}}(n):(n=c.length,function(t){for(var r,e=0;e<n;++e)i[(r=c[e]).i]=r.x(t);return i.join("")})}function X(t,r){var e,a=typeof r;return null==r||"boolean"===a?o(r):("number"===a?x:"string"===a?(e=n.color(r))?(r=e,f):m:r instanceof n.color?f:r instanceof Date?y:g(r)?v:Array.isArray(r)?M:"function"!=typeof r.valueOf&&"function"!=typeof r.toString||isNaN(r)?b:x)(t,r)}var A,N=180/Math.PI,S={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Y(t,n,r,e,a,o){var u,i,c;return(u=Math.sqrt(t*t+n*n))&&(t/=u,n/=u),(c=t*r+n*e)&&(r-=t*c,e-=n*c),(i=Math.sqrt(r*r+e*e))&&(r/=i,e/=i,c/=i),t*e<n*r&&(t=-t,n=-n,c=-c,u=-u),{translateX:a,translateY:o,rotate:Math.atan2(n,t)*N,skewX:Math.atan(c)*N,scaleX:u,scaleY:i}}function j(t,n,r,e){function a(t){return t.length?t.pop()+" ":""}return function(o,u){var i=[],c=[];return o=t(o),u=t(u),function(t,e,a,o,u,i){if(t!==a||e!==o){var c=u.push("translate(",null,n,null,r);i.push({i:c-4,x:x(t,a)},{i:c-2,x:x(e,o)})}else(a||o)&&u.push("translate("+a+n+o+r)}(o.translateX,o.translateY,u.translateX,u.translateY,i,c),function(t,n,r,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:r.push(a(r)+"rotate(",null,e)-2,x:x(t,n)})):n&&r.push(a(r)+"rotate("+n+e)}(o.rotate,u.rotate,i,c),function(t,n,r,o){t!==n?o.push({i:r.push(a(r)+"skewX(",null,e)-2,x:x(t,n)}):n&&r.push(a(r)+"skewX("+n+e)}(o.skewX,u.skewX,i,c),function(t,n,r,e,o,u){if(t!==r||n!==e){var i=o.push(a(o)+"scale(",null,",",null,")");u.push({i:i-4,x:x(t,r)},{i:i-2,x:x(n,e)})}else 1===r&&1===e||o.push(a(o)+"scale("+r+","+e+")")}(o.scaleX,o.scaleY,u.scaleX,u.scaleY,i,c),o=u=null,function(t){for(var n,r=-1,e=c.length;++r<e;)i[(n=c[r]).i]=n.x(t);return i.join("")}}}var q=j(function(t){const n=new("function"==typeof DOMMatrix?DOMMatrix:WebKitCSSMatrix)(t+"");return n.isIdentity?S:Y(n.a,n.b,n.c,n.d,n.e,n.f)},"px, ","px)","deg)"),D=j(function(t){return null==t?S:(A||(A=document.createElementNS("http://www.w3.org/2000/svg","g")),A.setAttribute("transform",t),(t=A.transform.baseVal.consolidate())?Y((t=t.matrix).a,t.b,t.c,t.d,t.e,t.f):S)},", ",")",")"),R=1e-12;function k(t){return((t=Math.exp(t))+1/t)/2}var C=function t(n,r,e){function a(t,a){var o,u,i=t[0],c=t[1],l=t[2],f=a[0],s=a[1],h=a[2],p=f-i,v=s-c,g=p*p+v*v;if(g<R)u=Math.log(h/l)/n,o=function(t){return[i+t*p,c+t*v,l*Math.exp(n*t*u)]};else{var M=Math.sqrt(g),y=(h*h-l*l+e*g)/(2*l*r*M),x=(h*h-l*l-e*g)/(2*h*r*M),b=Math.log(Math.sqrt(y*y+1)-y),d=Math.log(Math.sqrt(x*x+1)-x);u=(d-b)/n,o=function(t){var e,a=t*u,o=k(b),f=l/(r*M)*(o*(e=n*a+b,((e=Math.exp(2*e))-1)/(e+1))-function(t){return((t=Math.exp(t))-1/t)/2}(b));return[i+f*p,c+f*v,l*o/k(n*a+b)]}}return o.duration=1e3*u*n/Math.SQRT2,o}return a.rho=function(n){var r=Math.max(.001,+n),e=r*r;return t(r,e,e*e)},a}(Math.SQRT2,2,4);function B(t){return function(r,e){var a=t((r=n.hsl(r)).h,(e=n.hsl(e)).h),o=l(r.s,e.s),u=l(r.l,e.l),i=l(r.opacity,e.opacity);return function(t){return r.h=a(t),r.s=o(t),r.l=u(t),r.opacity=i(t),r+""}}}var H=B(i),I=B(l);function O(t){return function(r,e){var a=t((r=n.hcl(r)).h,(e=n.hcl(e)).h),o=l(r.c,e.c),u=l(r.l,e.l),i=l(r.opacity,e.opacity);return function(t){return r.h=a(t),r.c=o(t),r.l=u(t),r.opacity=i(t),r+""}}}var T=O(i),L=O(l);function E(t){return function r(e){function a(r,a){var o=t((r=n.cubehelix(r)).h,(a=n.cubehelix(a)).h),u=l(r.s,a.s),i=l(r.l,a.l),c=l(r.opacity,a.opacity);return function(t){return r.h=o(t),r.s=u(t),r.l=i(Math.pow(t,e)),r.opacity=c(t),r+""}}return e=+e,a.gamma=r,a}(1)}var V=E(i),P=E(l);t.interpolate=X,t.interpolateArray=function(t,n){return(g(n)?v:M)(t,n)},t.interpolateBasis=e,t.interpolateBasisClosed=a,t.interpolateCubehelix=V,t.interpolateCubehelixLong=P,t.interpolateDate=y,t.interpolateDiscrete=function(t){var n=t.length;return function(r){return t[Math.max(0,Math.min(n-1,Math.floor(r*n)))]}},t.interpolateHcl=T,t.interpolateHclLong=L,t.interpolateHsl=H,t.interpolateHslLong=I,t.interpolateHue=function(t,n){var r=i(+t,+n);return function(t){var n=r(t);return n-360*Math.floor(n/360)}},t.interpolateLab=function(t,r){var e=l((t=n.lab(t)).l,(r=n.lab(r)).l),a=l(t.a,r.a),o=l(t.b,r.b),u=l(t.opacity,r.opacity);return function(n){return t.l=e(n),t.a=a(n),t.b=o(n),t.opacity=u(n),t+""}},t.interpolateNumber=x,t.interpolateNumberArray=v,t.interpolateObject=b,t.interpolateRgb=f,t.interpolateRgbBasis=h,t.interpolateRgbBasisClosed=p,t.interpolateRound=function(t,n){return t=+t,n=+n,function(r){return Math.round(t*(1-r)+n*r)}},t.interpolateString=m,t.interpolateTransformCss=q,t.interpolateTransformSvg=D,t.interpolateZoom=C,t.piecewise=function(t,n){void 0===n&&(n=t,t=X);for(var r=0,e=n.length-1,a=n[0],o=new Array(e<0?0:e);r<e;)o[r]=t(a,a=n[++r]);return function(t){var n=Math.max(0,Math.min(e-1,Math.floor(t*=e)));return o[n](t-n)}},t.quantize=function(t,n){for(var r=new Array(n),e=0;e<n;++e)r[e]=t(e/(n-1));return r},Object.defineProperty(t,"__esModule",{value:!0})});
},{"d3-color":3}],7:[function(require,module,exports){
// https://d3js.org/d3-scale/ v3.2.2 Copyright 2020 Mike Bostock
!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("d3-array"),require("d3-interpolate"),require("d3-format"),require("d3-time"),require("d3-time-format")):"function"==typeof define&&define.amd?define(["exports","d3-array","d3-interpolate","d3-format","d3-time","d3-time-format"],t):t((n=n||self).d3=n.d3||{},n.d3,n.d3,n.d3,n.d3,n.d3)}(this,function(n,t,r,e,u,i){"use strict";function o(n,t){switch(arguments.length){case 0:break;case 1:this.range(n);break;default:this.range(t).domain(n)}return this}function a(n,t){switch(arguments.length){case 0:break;case 1:"function"==typeof n?this.interpolator(n):this.range(n);break;default:this.domain(n),"function"==typeof t?this.interpolator(t):this.range(t)}return this}const c=Symbol("implicit");function f(){var n=new Map,t=[],r=[],e=c;function u(u){var i=u+"",o=n.get(i);if(!o){if(e!==c)return e;n.set(i,o=t.push(u))}return r[(o-1)%r.length]}return u.domain=function(r){if(!arguments.length)return t.slice();t=[],n=new Map;for(const e of r){const r=e+"";n.has(r)||n.set(r,t.push(e))}return u},u.range=function(n){return arguments.length?(r=Array.from(n),u):r.slice()},u.unknown=function(n){return arguments.length?(e=n,u):e},u.copy=function(){return f(t,r).unknown(e)},o.apply(u,arguments),u}function l(){var n,r,e=f().unknown(void 0),u=e.domain,i=e.range,a=0,c=1,p=!1,s=0,h=0,g=.5;function m(){var e=u().length,o=c<a,f=o?c:a,l=o?a:c;n=(l-f)/Math.max(1,e-s+2*h),p&&(n=Math.floor(n)),f+=(l-f-n*(e-s))*g,r=n*(1-s),p&&(f=Math.round(f),r=Math.round(r));var m=t.range(e).map(function(t){return f+n*t});return i(o?m.reverse():m)}return delete e.unknown,e.domain=function(n){return arguments.length?(u(n),m()):u()},e.range=function(n){return arguments.length?([a,c]=n,a=+a,c=+c,m()):[a,c]},e.rangeRound=function(n){return[a,c]=n,a=+a,c=+c,p=!0,m()},e.bandwidth=function(){return r},e.step=function(){return n},e.round=function(n){return arguments.length?(p=!!n,m()):p},e.padding=function(n){return arguments.length?(s=Math.min(1,h=+n),m()):s},e.paddingInner=function(n){return arguments.length?(s=Math.min(1,n),m()):s},e.paddingOuter=function(n){return arguments.length?(h=+n,m()):h},e.align=function(n){return arguments.length?(g=Math.max(0,Math.min(1,n)),m()):g},e.copy=function(){return l(u(),[a,c]).round(p).paddingInner(s).paddingOuter(h).align(g)},o.apply(m(),arguments)}function p(n){return+n}var s=[0,1];function h(n){return n}function g(n,t){return(t-=n=+n)?function(r){return(r-n)/t}:(r=isNaN(t)?NaN:.5,function(){return r});var r}function m(n,t,r){var e=n[0],u=n[1],i=t[0],o=t[1];return u<e?(e=g(u,e),i=r(o,i)):(e=g(e,u),i=r(i,o)),function(n){return i(e(n))}}function d(n,r,e){var u=Math.min(n.length,r.length)-1,i=new Array(u),o=new Array(u),a=-1;for(n[u]<n[0]&&(n=n.slice().reverse(),r=r.slice().reverse());++a<u;)i[a]=g(n[a],n[a+1]),o[a]=e(r[a],r[a+1]);return function(r){var e=t.bisect(n,r,1,u)-1;return o[e](i[e](r))}}function y(n,t){return t.domain(n.domain()).range(n.range()).interpolate(n.interpolate()).clamp(n.clamp()).unknown(n.unknown())}function v(){var n,t,e,u,i,o,a=s,c=s,f=r.interpolate,l=h;function g(){var n,t,r,e=Math.min(a.length,c.length);return l!==h&&(n=a[0],t=a[e-1],n>t&&(r=n,n=t,t=r),l=function(r){return Math.max(n,Math.min(t,r))}),u=e>2?d:m,i=o=null,y}function y(t){return isNaN(t=+t)?e:(i||(i=u(a.map(n),c,f)))(n(l(t)))}return y.invert=function(e){return l(t((o||(o=u(c,a.map(n),r.interpolateNumber)))(e)))},y.domain=function(n){return arguments.length?(a=Array.from(n,p),g()):a.slice()},y.range=function(n){return arguments.length?(c=Array.from(n),g()):c.slice()},y.rangeRound=function(n){return c=Array.from(n),f=r.interpolateRound,g()},y.clamp=function(n){return arguments.length?(l=!!n||h,g()):l!==h},y.interpolate=function(n){return arguments.length?(f=n,g()):f},y.unknown=function(n){return arguments.length?(e=n,y):e},function(r,e){return n=r,t=e,g()}}function M(){return v()(h,h)}function k(n,r,u,i){var o,a=t.tickStep(n,r,u);switch((i=e.formatSpecifier(null==i?",f":i)).type){case"s":var c=Math.max(Math.abs(n),Math.abs(r));return null!=i.precision||isNaN(o=e.precisionPrefix(a,c))||(i.precision=o),e.formatPrefix(i,c);case"":case"e":case"g":case"p":case"r":null!=i.precision||isNaN(o=e.precisionRound(a,Math.max(Math.abs(n),Math.abs(r))))||(i.precision=o-("e"===i.type));break;case"f":case"%":null!=i.precision||isNaN(o=e.precisionFixed(a))||(i.precision=o-2*("%"===i.type))}return e.format(i)}function w(n){var r=n.domain;return n.ticks=function(n){var e=r();return t.ticks(e[0],e[e.length-1],null==n?10:n)},n.tickFormat=function(n,t){var e=r();return k(e[0],e[e.length-1],null==n?10:n,t)},n.nice=function(e){null==e&&(e=10);var u,i,o=r(),a=0,c=o.length-1,f=o[a],l=o[c],p=10;for(l<f&&(i=f,f=l,l=i,i=a,a=c,c=i);p-- >0;){if((i=t.tickIncrement(f,l,e))===u)return o[a]=f,o[c]=l,r(o);if(i>0)f=Math.floor(f/i)*i,l=Math.ceil(l/i)*i;else{if(!(i<0))break;f=Math.ceil(f*i)/i,l=Math.floor(l*i)/i}u=i}return n},n}function N(n,t){var r,e=0,u=(n=n.slice()).length-1,i=n[e],o=n[u];return o<i&&(r=e,e=u,u=r,r=i,i=o,o=r),n[e]=t.floor(i),n[u]=t.ceil(o),n}function b(n){return Math.log(n)}function x(n){return Math.exp(n)}function q(n){return-Math.log(-n)}function S(n){return-Math.exp(-n)}function A(n){return isFinite(n)?+("1e"+n):n<0?0:n}function D(n){return function(t){return-n(-t)}}function R(n){var r,u,i=n(b,x),o=i.domain,a=10;function c(){return r=function(n){return n===Math.E?Math.log:10===n&&Math.log10||2===n&&Math.log2||(n=Math.log(n),function(t){return Math.log(t)/n})}(a),u=function(n){return 10===n?A:n===Math.E?Math.exp:function(t){return Math.pow(n,t)}}(a),o()[0]<0?(r=D(r),u=D(u),n(q,S)):n(b,x),i}return i.base=function(n){return arguments.length?(a=+n,c()):a},i.domain=function(n){return arguments.length?(o(n),c()):o()},i.ticks=function(n){var e,i=o(),c=i[0],f=i[i.length-1];(e=f<c)&&(h=c,c=f,f=h);var l,p,s,h=r(c),g=r(f),m=null==n?10:+n,d=[];if(!(a%1)&&g-h<m){if(h=Math.floor(h),g=Math.ceil(g),c>0){for(;h<=g;++h)for(p=1,l=u(h);p<a;++p)if(!((s=l*p)<c)){if(s>f)break;d.push(s)}}else for(;h<=g;++h)for(p=a-1,l=u(h);p>=1;--p)if(!((s=l*p)<c)){if(s>f)break;d.push(s)}2*d.length<m&&(d=t.ticks(c,f,m))}else d=t.ticks(h,g,Math.min(g-h,m)).map(u);return e?d.reverse():d},i.tickFormat=function(n,t){if(null==t&&(t=10===a?".0e":","),"function"!=typeof t&&(t=e.format(t)),n===1/0)return t;null==n&&(n=10);var o=Math.max(1,a*n/i.ticks().length);return function(n){var e=n/u(Math.round(r(n)));return e*a<a-.5&&(e*=a),e<=o?t(n):""}},i.nice=function(){return o(N(o(),{floor:function(n){return u(Math.floor(r(n)))},ceil:function(n){return u(Math.ceil(r(n)))}}))},i}function I(n){return function(t){return Math.sign(t)*Math.log1p(Math.abs(t/n))}}function O(n){return function(t){return Math.sign(t)*Math.expm1(Math.abs(t))*n}}function F(n){var t=1,r=n(I(t),O(t));return r.constant=function(r){return arguments.length?n(I(t=+r),O(t)):t},w(r)}function P(n){return function(t){return t<0?-Math.pow(-t,n):Math.pow(t,n)}}function E(n){return n<0?-Math.sqrt(-n):Math.sqrt(n)}function L(n){return n<0?-n*n:n*n}function T(n){var t=n(h,h),r=1;function e(){return 1===r?n(h,h):.5===r?n(E,L):n(P(r),P(1/r))}return t.exponent=function(n){return arguments.length?(r=+n,e()):r},w(t)}function Q(){var n=T(v());return n.copy=function(){return y(n,Q()).exponent(n.exponent())},o.apply(n,arguments),n}function U(n){return Math.sign(n)*n*n}var Y=1e3,j=60*Y,B=60*j,C=24*B,H=7*C,W=30*C,_=365*C;function z(n){return new Date(n)}function G(n){return n instanceof Date?+n:+new Date(+n)}function J(n,r,e,u,i,o,a,c,f){var l=M(),p=l.invert,s=l.domain,h=f(".%L"),g=f(":%S"),m=f("%I:%M"),d=f("%I %p"),v=f("%a %d"),k=f("%b %d"),w=f("%B"),b=f("%Y"),x=[[a,1,Y],[a,5,5*Y],[a,15,15*Y],[a,30,30*Y],[o,1,j],[o,5,5*j],[o,15,15*j],[o,30,30*j],[i,1,B],[i,3,3*B],[i,6,6*B],[i,12,12*B],[u,1,C],[u,2,2*C],[e,1,H],[r,1,W],[r,3,3*W],[n,1,_]];function q(t){return(a(t)<t?h:o(t)<t?g:i(t)<t?m:u(t)<t?d:r(t)<t?e(t)<t?v:k:n(t)<t?w:b)(t)}function S(r,e,u){if(null==r&&(r=10),"number"==typeof r){var i,o=Math.abs(u-e)/r,a=t.bisector(function(n){return n[2]}).right(x,o);return a===x.length?(i=t.tickStep(e/_,u/_,r),r=n):a?(i=(a=x[o/x[a-1][2]<x[a][2]/o?a-1:a])[1],r=a[0]):(i=Math.max(t.tickStep(e,u,r),1),r=c),r.every(i)}return r}return l.invert=function(n){return new Date(p(n))},l.domain=function(n){return arguments.length?s(Array.from(n,G)):s().map(z)},l.ticks=function(n){var t,r=s(),e=r[0],u=r[r.length-1],i=u<e;return i&&(t=e,e=u,u=t),t=(t=S(n,e,u))?t.range(e,u+1):[],i?t.reverse():t},l.tickFormat=function(n,t){return null==t?q:f(t)},l.nice=function(n){var t=s();return(n=S(n,t[0],t[t.length-1]))?s(N(t,n)):l},l.copy=function(){return y(l,J(n,r,e,u,i,o,a,c,f))},l}function K(){var n,t,e,u,i,o=0,a=1,c=h,f=!1;function l(t){return isNaN(t=+t)?i:c(0===e?.5:(t=(u(t)-n)*e,f?Math.max(0,Math.min(1,t)):t))}function p(n){return function(t){var r,e;return arguments.length?([r,e]=t,c=n(r,e),l):[c(0),c(1)]}}return l.domain=function(r){return arguments.length?([o,a]=r,n=u(o=+o),t=u(a=+a),e=n===t?0:1/(t-n),l):[o,a]},l.clamp=function(n){return arguments.length?(f=!!n,l):f},l.interpolator=function(n){return arguments.length?(c=n,l):c},l.range=p(r.interpolate),l.rangeRound=p(r.interpolateRound),l.unknown=function(n){return arguments.length?(i=n,l):i},function(r){return u=r,n=r(o),t=r(a),e=n===t?0:1/(t-n),l}}function V(n,t){return t.domain(n.domain()).interpolator(n.interpolator()).clamp(n.clamp()).unknown(n.unknown())}function X(){var n=T(K());return n.copy=function(){return V(n,X()).exponent(n.exponent())},a.apply(n,arguments)}function Z(){var n,t,e,u,i,o,a,c=0,f=.5,l=1,p=1,s=h,g=!1;function m(n){return isNaN(n=+n)?a:(n=.5+((n=+o(n))-t)*(p*n<p*t?u:i),s(g?Math.max(0,Math.min(1,n)):n))}function d(n){return function(t){var e,u,i;return arguments.length?([e,u,i]=t,s=r.piecewise(n,[e,u,i]),m):[s(0),s(.5),s(1)]}}return m.domain=function(r){return arguments.length?([c,f,l]=r,n=o(c=+c),t=o(f=+f),e=o(l=+l),u=n===t?0:.5/(t-n),i=t===e?0:.5/(e-t),p=t<n?-1:1,m):[c,f,l]},m.clamp=function(n){return arguments.length?(g=!!n,m):g},m.interpolator=function(n){return arguments.length?(s=n,m):s},m.range=d(r.interpolate),m.rangeRound=d(r.interpolateRound),m.unknown=function(n){return arguments.length?(a=n,m):a},function(r){return o=r,n=r(c),t=r(f),e=r(l),u=n===t?0:.5/(t-n),i=t===e?0:.5/(e-t),p=t<n?-1:1,m}}function $(){var n=T(Z());return n.copy=function(){return V(n,$()).exponent(n.exponent())},a.apply(n,arguments)}n.scaleBand=l,n.scaleDiverging=function n(){var t=w(Z()(h));return t.copy=function(){return V(t,n())},a.apply(t,arguments)},n.scaleDivergingLog=function n(){var t=R(Z()).domain([.1,1,10]);return t.copy=function(){return V(t,n()).base(t.base())},a.apply(t,arguments)},n.scaleDivergingPow=$,n.scaleDivergingSqrt=function(){return $.apply(null,arguments).exponent(.5)},n.scaleDivergingSymlog=function n(){var t=F(Z());return t.copy=function(){return V(t,n()).constant(t.constant())},a.apply(t,arguments)},n.scaleIdentity=function n(t){var r;function e(n){return isNaN(n=+n)?r:n}return e.invert=e,e.domain=e.range=function(n){return arguments.length?(t=Array.from(n,p),e):t.slice()},e.unknown=function(n){return arguments.length?(r=n,e):r},e.copy=function(){return n(t).unknown(r)},t=arguments.length?Array.from(t,p):[0,1],w(e)},n.scaleImplicit=c,n.scaleLinear=function n(){var t=M();return t.copy=function(){return y(t,n())},o.apply(t,arguments),w(t)},n.scaleLog=function n(){var t=R(v()).domain([1,10]);return t.copy=function(){return y(t,n()).base(t.base())},o.apply(t,arguments),t},n.scaleOrdinal=f,n.scalePoint=function(){return function n(t){var r=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return n(r())},t}(l.apply(null,arguments).paddingInner(1))},n.scalePow=Q,n.scaleQuantile=function n(){var r,e=[],u=[],i=[];function a(){var n=0,r=Math.max(1,u.length);for(i=new Array(r-1);++n<r;)i[n-1]=t.quantile(e,n/r);return c}function c(n){return isNaN(n=+n)?r:u[t.bisect(i,n)]}return c.invertExtent=function(n){var t=u.indexOf(n);return t<0?[NaN,NaN]:[t>0?i[t-1]:e[0],t<i.length?i[t]:e[e.length-1]]},c.domain=function(n){if(!arguments.length)return e.slice();e=[];for(let t of n)null==t||isNaN(t=+t)||e.push(t);return e.sort(t.ascending),a()},c.range=function(n){return arguments.length?(u=Array.from(n),a()):u.slice()},c.unknown=function(n){return arguments.length?(r=n,c):r},c.quantiles=function(){return i.slice()},c.copy=function(){return n().domain(e).range(u).unknown(r)},o.apply(c,arguments)},n.scaleQuantize=function n(){var r,e=0,u=1,i=1,a=[.5],c=[0,1];function f(n){return n<=n?c[t.bisect(a,n,0,i)]:r}function l(){var n=-1;for(a=new Array(i);++n<i;)a[n]=((n+1)*u-(n-i)*e)/(i+1);return f}return f.domain=function(n){return arguments.length?([e,u]=n,e=+e,u=+u,l()):[e,u]},f.range=function(n){return arguments.length?(i=(c=Array.from(n)).length-1,l()):c.slice()},f.invertExtent=function(n){var t=c.indexOf(n);return t<0?[NaN,NaN]:t<1?[e,a[0]]:t>=i?[a[i-1],u]:[a[t-1],a[t]]},f.unknown=function(n){return arguments.length?(r=n,f):f},f.thresholds=function(){return a.slice()},f.copy=function(){return n().domain([e,u]).range(c).unknown(r)},o.apply(w(f),arguments)},n.scaleRadial=function n(){var t,r=M(),e=[0,1],u=!1;function i(n){var e=function(n){return Math.sign(n)*Math.sqrt(Math.abs(n))}(r(n));return isNaN(e)?t:u?Math.round(e):e}return i.invert=function(n){return r.invert(U(n))},i.domain=function(n){return arguments.length?(r.domain(n),i):r.domain()},i.range=function(n){return arguments.length?(r.range((e=Array.from(n,p)).map(U)),i):e.slice()},i.rangeRound=function(n){return i.range(n).round(!0)},i.round=function(n){return arguments.length?(u=!!n,i):u},i.clamp=function(n){return arguments.length?(r.clamp(n),i):r.clamp()},i.unknown=function(n){return arguments.length?(t=n,i):t},i.copy=function(){return n(r.domain(),e).round(u).clamp(r.clamp()).unknown(t)},o.apply(i,arguments),w(i)},n.scaleSequential=function n(){var t=w(K()(h));return t.copy=function(){return V(t,n())},a.apply(t,arguments)},n.scaleSequentialLog=function n(){var t=R(K()).domain([1,10]);return t.copy=function(){return V(t,n()).base(t.base())},a.apply(t,arguments)},n.scaleSequentialPow=X,n.scaleSequentialQuantile=function n(){var r=[],e=h;function u(n){if(!isNaN(n=+n))return e((t.bisect(r,n,1)-1)/(r.length-1))}return u.domain=function(n){if(!arguments.length)return r.slice();r=[];for(let t of n)null==t||isNaN(t=+t)||r.push(t);return r.sort(t.ascending),u},u.interpolator=function(n){return arguments.length?(e=n,u):e},u.range=function(){return r.map((n,t)=>e(t/(r.length-1)))},u.quantiles=function(n){return Array.from({length:n+1},(e,u)=>t.quantile(r,u/n))},u.copy=function(){return n(e).domain(r)},a.apply(u,arguments)},n.scaleSequentialSqrt=function(){return X.apply(null,arguments).exponent(.5)},n.scaleSequentialSymlog=function n(){var t=F(K());return t.copy=function(){return V(t,n()).constant(t.constant())},a.apply(t,arguments)},n.scaleSqrt=function(){return Q.apply(null,arguments).exponent(.5)},n.scaleSymlog=function n(){var t=F(v());return t.copy=function(){return y(t,n()).constant(t.constant())},o.apply(t,arguments)},n.scaleThreshold=function n(){var r,e=[.5],u=[0,1],i=1;function a(n){return n<=n?u[t.bisect(e,n,0,i)]:r}return a.domain=function(n){return arguments.length?(e=Array.from(n),i=Math.min(e.length,u.length-1),a):e.slice()},a.range=function(n){return arguments.length?(u=Array.from(n),i=Math.min(e.length,u.length-1),a):u.slice()},a.invertExtent=function(n){var t=u.indexOf(n);return[e[t-1],e[t]]},a.unknown=function(n){return arguments.length?(r=n,a):r},a.copy=function(){return n().domain(e).range(u).unknown(r)},o.apply(a,arguments)},n.scaleTime=function(){return o.apply(J(u.timeYear,u.timeMonth,u.timeWeek,u.timeDay,u.timeHour,u.timeMinute,u.timeSecond,u.timeMillisecond,i.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)},n.scaleUtc=function(){return o.apply(J(u.utcYear,u.utcMonth,u.utcWeek,u.utcDay,u.utcHour,u.utcMinute,u.utcSecond,u.utcMillisecond,i.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)]),arguments)},n.tickFormat=k,Object.defineProperty(n,"__esModule",{value:!0})});
},{"d3-array":1,"d3-collection":2,"d3-color":3,"d3-format":5,"d3-interpolate":6,"d3-time":10,"d3-time-format":9}],8:[function(require,module,exports){
// https://d3js.org/d3-selection/ v2.0.0 Copyright 2020 Mike Bostock
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t=t||self).d3=t.d3||{})}(this,function(t){"use strict";var n="http://www.w3.org/1999/xhtml",e={svg:"http://www.w3.org/2000/svg",xhtml:n,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function r(t){var n=t+="",r=n.indexOf(":");return r>=0&&"xmlns"!==(n=t.slice(0,r))&&(t=t.slice(r+1)),e.hasOwnProperty(n)?{space:e[n],local:t}:t}function i(t){var e=r(t);return(e.local?function(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}:function(t){return function(){var e=this.ownerDocument,r=this.namespaceURI;return r===n&&e.documentElement.namespaceURI===n?e.createElement(t):e.createElementNS(r,t)}})(e)}function o(){}function u(t){return null==t?o:function(){return this.querySelector(t)}}function c(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function s(){return[]}function l(t){return null==t?s:function(){return this.querySelectorAll(t)}}function a(t){return function(){return this.matches(t)}}function f(t){return function(n){return n.matches(t)}}var h=Array.prototype.find;function p(){return this.firstElementChild}var _=Array.prototype.filter;function d(){return this.children}function y(t){return new Array(t.length)}function v(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function m(t,n,e,r,i,o){for(var u,c=0,s=n.length,l=o.length;c<l;++c)(u=n[c])?(u.__data__=o[c],r[c]=u):e[c]=new v(t,o[c]);for(;c<s;++c)(u=n[c])&&(i[c]=u)}function g(t,n,e,r,i,o,u){var c,s,l,a=new Map,f=n.length,h=o.length,p=new Array(f);for(c=0;c<f;++c)(s=n[c])&&(p[c]=l=u.call(s,s.__data__,c,n)+"",a.has(l)?i[c]=s:a.set(l,s));for(c=0;c<h;++c)l=u.call(t,o[c],c,o)+"",(s=a.get(l))?(r[c]=s,s.__data__=o[c],a.delete(l)):e[c]=new v(t,o[c]);for(c=0;c<f;++c)(s=n[c])&&a.get(p[c])===s&&(i[c]=s)}function w(t){return t.__data__}function A(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function x(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function S(t,n){return t.style.getPropertyValue(n)||x(t).getComputedStyle(t,null).getPropertyValue(n)}function b(t){return t.trim().split(/^|\s+/)}function E(t){return t.classList||new N(t)}function N(t){this._node=t,this._names=b(t.getAttribute("class")||"")}function C(t,n){for(var e=E(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function L(t,n){for(var e=E(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function P(){this.textContent=""}function B(){this.innerHTML=""}function M(){this.nextSibling&&this.parentNode.appendChild(this)}function T(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function q(){return null}function D(){var t=this.parentNode;t&&t.removeChild(this)}function O(){var t=this.cloneNode(!1),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function V(){var t=this.cloneNode(!0),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function j(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.options);++i?n.length=i:delete this.__on}}}function R(t,n,e){return function(){var r,i=this.__on,o=function(t){return function(n){t.call(this,n,this.__data__)}}(n);if(i)for(var u=0,c=i.length;u<c;++u)if((r=i[u]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=e),void(r.value=n);this.addEventListener(t.type,o,e),r={type:t.type,name:t.name,value:n,listener:o,options:e},i?i.push(r):this.__on=[r]}}function H(t,n,e){var r=x(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}v.prototype={constructor:v,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},N.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var I=[null];function U(t,n){this._groups=t,this._parents=n}function X(){return new U([[document.documentElement]],I)}function G(t){return"string"==typeof t?new U([[document.querySelector(t)]],[document.documentElement]):new U([[t]],I)}U.prototype=X.prototype={constructor:U,select:function(t){"function"!=typeof t&&(t=u(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,c,s=n[i],l=s.length,a=r[i]=new Array(l),f=0;f<l;++f)(o=s[f])&&(c=t.call(o,o.__data__,f,s))&&("__data__"in o&&(c.__data__=o.__data__),a[f]=c);return new U(r,this._parents)},selectAll:function(t){t="function"==typeof t?function(t){return function(){var n=t.apply(this,arguments);return null==n?[]:c(n)}}(t):l(t);for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var u,s=n[o],a=s.length,f=0;f<a;++f)(u=s[f])&&(r.push(t.call(u,u.__data__,f,s)),i.push(u));return new U(r,i)},selectChild:function(t){return this.select(null==t?p:function(t){return function(){return h.call(this.children,t)}}("function"==typeof t?t:f(t)))},selectChildren:function(t){return this.selectAll(null==t?d:function(t){return function(){return _.call(this.children,t)}}("function"==typeof t?t:f(t)))},filter:function(t){"function"!=typeof t&&(t=a(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],c=u.length,s=r[i]=[],l=0;l<c;++l)(o=u[l])&&t.call(o,o.__data__,l,u)&&s.push(o);return new U(r,this._parents)},data:function(t,n){if(!arguments.length)return Array.from(this,w);var e,r=n?g:m,i=this._parents,o=this._groups;"function"!=typeof t&&(e=t,t=function(){return e});for(var u=o.length,s=new Array(u),l=new Array(u),a=new Array(u),f=0;f<u;++f){var h=i[f],p=o[f],_=p.length,d=c(t.call(h,h&&h.__data__,f,i)),y=d.length,v=l[f]=new Array(y),A=s[f]=new Array(y);r(h,p,v,A,a[f]=new Array(_),d,n);for(var x,S,b=0,E=0;b<y;++b)if(x=v[b]){for(b>=E&&(E=b+1);!(S=A[E])&&++E<y;);x._next=S||null}}return(s=new U(s,i))._enter=l,s._exit=a,s},enter:function(){return new U(this._enter||this._groups.map(y),this._parents)},exit:function(){return new U(this._exit||this._groups.map(y),this._parents)},join:function(t,n,e){var r=this.enter(),i=this,o=this.exit();return r="function"==typeof t?t(r):r.append(t+""),null!=n&&(i=n(i)),null==e?o.remove():e(o),r&&i?r.merge(i).order():i},merge:function(t){if(!(t instanceof U))throw new Error("invalid merge");for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),u=new Array(r),c=0;c<o;++c)for(var s,l=n[c],a=e[c],f=l.length,h=u[c]=new Array(f),p=0;p<f;++p)(s=l[p]||a[p])&&(h[p]=s);for(;c<r;++c)u[c]=n[c];return new U(u,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,u=i[o];--o>=0;)(r=i[o])&&(u&&4^r.compareDocumentPosition(u)&&u.parentNode.insertBefore(r,u),u=r);return this},sort:function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=A);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var u,c=e[o],s=c.length,l=i[o]=new Array(s),a=0;a<s;++a)(u=c[a])&&(l[a]=u);l.sort(n)}return new U(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var u=r[i];if(u)return u}return null},size:function(){let t=0;for(const n of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],u=0,c=o.length;u<c;++u)(i=o[u])&&t.call(i,i.__data__,u,o);return this},attr:function(t,n){var e=r(t);if(arguments.length<2){var i=this.node();return e.local?i.getAttributeNS(e.space,e.local):i.getAttribute(e)}return this.each((null==n?e.local?function(t){return function(){this.removeAttributeNS(t.space,t.local)}}:function(t){return function(){this.removeAttribute(t)}}:"function"==typeof n?e.local?function(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}:function(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}:e.local?function(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}:function(t,n){return function(){this.setAttribute(t,n)}})(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?function(t){return function(){this.style.removeProperty(t)}}:"function"==typeof n?function(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}:function(t,n,e){return function(){this.style.setProperty(t,n,e)}})(t,n,null==e?"":e)):S(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?function(t){return function(){delete this[t]}}:"function"==typeof n?function(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}:function(t,n){return function(){this[t]=n}})(t,n)):this.node()[t]},classed:function(t,n){var e=b(t+"");if(arguments.length<2){for(var r=E(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?function(t,n){return function(){(n.apply(this,arguments)?C:L)(this,t)}}:n?function(t){return function(){C(this,t)}}:function(t){return function(){L(this,t)}})(e,n))},text:function(t){return arguments.length?this.each(null==t?P:("function"==typeof t?function(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}:function(t){return function(){this.textContent=t}})(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?B:("function"==typeof t?function(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}:function(t){return function(){this.innerHTML=t}})(t)):this.node().innerHTML},raise:function(){return this.each(M)},lower:function(){return this.each(T)},append:function(t){var n="function"==typeof t?t:i(t);return this.select(function(){return this.appendChild(n.apply(this,arguments))})},insert:function(t,n){var e="function"==typeof t?t:i(t),r=null==n?q:"function"==typeof n?n:u(n);return this.select(function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)})},remove:function(){return this.each(D)},clone:function(t){return this.select(t?V:O)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=function(t){return t.trim().split(/^|\s+/).map(function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}})}(t+""),u=o.length;if(!(arguments.length<2)){for(c=n?R:j,r=0;r<u;++r)this.each(c(o[r],n,e));return this}var c=this.node().__on;if(c)for(var s,l=0,a=c.length;l<a;++l)for(r=0,s=c[l];r<u;++r)if((i=o[r]).type===s.type&&i.name===s.name)return s.value},dispatch:function(t,n){return this.each(("function"==typeof n?function(t,n){return function(){return H(this,t,n.apply(this,arguments))}}:function(t,n){return function(){return H(this,t,n)}})(t,n))},[Symbol.iterator]:function*(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r,i=t[n],o=0,u=i.length;o<u;++o)(r=i[o])&&(yield r)}};var Y=0;function k(){return new z}function z(){this._="@"+(++Y).toString(36)}function F(t){let n;for(;n=t.sourceEvent;)t=n;return t}function J(t,n){if(t=F(t),void 0===n&&(n=t.currentTarget),n){var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(n.getScreenCTM().inverse())).x,r.y]}if(n.getBoundingClientRect){var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}}return[t.pageX,t.pageY]}z.prototype=k.prototype={constructor:z,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}},t.create=function(t){return G(i(t).call(document.documentElement))},t.creator=i,t.local=k,t.matcher=a,t.namespace=r,t.namespaces=e,t.pointer=J,t.pointers=function(t,n){return t.target&&(t=F(t),void 0===n&&(n=t.currentTarget),t=t.touches||[t]),Array.from(t,t=>J(t,n))},t.select=G,t.selectAll=function(t){return"string"==typeof t?new U([document.querySelectorAll(t)],[document.documentElement]):new U([null==t?[]:c(t)],I)},t.selection=X,t.selector=u,t.selectorAll=l,t.style=S,t.window=x,Object.defineProperty(t,"__esModule",{value:!0})});
},{}],9:[function(require,module,exports){
// https://d3js.org/d3-time-format/ v2.3.0 Copyright 2020 Mike Bostock
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("d3-time")):"function"==typeof define&&define.amd?define(["exports","d3-time"],t):t((e=e||self).d3=e.d3||{},e.d3)}(this,function(e,t){"use strict";function n(e){if(0<=e.y&&e.y<100){var t=new Date(-1,e.m,e.d,e.H,e.M,e.S,e.L);return t.setFullYear(e.y),t}return new Date(e.y,e.m,e.d,e.H,e.M,e.S,e.L)}function r(e){if(0<=e.y&&e.y<100){var t=new Date(Date.UTC(-1,e.m,e.d,e.H,e.M,e.S,e.L));return t.setUTCFullYear(e.y),t}return new Date(Date.UTC(e.y,e.m,e.d,e.H,e.M,e.S,e.L))}function u(e,t,n){return{y:e,m:t,d:n,H:0,M:0,S:0,L:0}}function i(e){var i=e.dateTime,c=e.date,a=e.time,f=e.periods,l=e.days,s=e.shortDays,g=e.months,G=e.shortMonths,ge=y(f),we=d(f),pe=y(l),Se=d(l),Ye=y(s),Fe=d(s),Le=y(g),He=d(g),Ae=y(G),Ze=d(G),be={a:function(e){return s[e.getDay()]},A:function(e){return l[e.getDay()]},b:function(e){return G[e.getMonth()]},B:function(e){return g[e.getMonth()]},c:null,d:V,e:V,f:J,g:R,G:K,H:j,I:P,j:q,L:I,m:O,M:Q,p:function(e){return f[+(e.getHours()>=12)]},q:function(e){return 1+~~(e.getMonth()/3)},Q:Ue,s:xe,S:X,u:N,U:B,V:_,w:$,W:z,x:null,X:null,y:E,Y:k,Z:ee,"%":Ce},We={a:function(e){return s[e.getUTCDay()]},A:function(e){return l[e.getUTCDay()]},b:function(e){return G[e.getUTCMonth()]},B:function(e){return g[e.getUTCMonth()]},c:null,d:te,e:te,f:ce,g:ve,G:Me,H:ne,I:re,j:ue,L:ie,m:oe,M:ae,p:function(e){return f[+(e.getUTCHours()>=12)]},q:function(e){return 1+~~(e.getUTCMonth()/3)},Q:Ue,s:xe,S:fe,u:le,U:se,V:ye,w:de,W:he,x:null,X:null,y:me,Y:Te,Z:De,"%":Ce},Ve={a:function(e,t,n){var r=Ye.exec(t.slice(n));return r?(e.w=Fe[r[0].toLowerCase()],n+r[0].length):-1},A:function(e,t,n){var r=pe.exec(t.slice(n));return r?(e.w=Se[r[0].toLowerCase()],n+r[0].length):-1},b:function(e,t,n){var r=Ae.exec(t.slice(n));return r?(e.m=Ze[r[0].toLowerCase()],n+r[0].length):-1},B:function(e,t,n){var r=Le.exec(t.slice(n));return r?(e.m=He[r[0].toLowerCase()],n+r[0].length):-1},c:function(e,t,n){return qe(e,i,t,n)},d:p,e:p,f:A,g:C,G:D,H:Y,I:Y,j:S,L:H,m:w,M:F,p:function(e,t,n){var r=ge.exec(t.slice(n));return r?(e.p=we[r[0].toLowerCase()],n+r[0].length):-1},q:x,Q:b,s:W,S:L,u:m,U:v,V:T,w:h,W:M,x:function(e,t,n){return qe(e,c,t,n)},X:function(e,t,n){return qe(e,a,t,n)},y:C,Y:D,Z:U,"%":Z};function je(e,t){return function(n){var r,u,i,c=[],a=-1,f=0,l=e.length;for(n instanceof Date||(n=new Date(+n));++a<l;)37===e.charCodeAt(a)&&(c.push(e.slice(f,a)),null!=(u=o[r=e.charAt(++a)])?r=e.charAt(++a):u="e"===r?" ":"0",(i=t[r])&&(r=i(n,u)),c.push(r),f=a+1);return c.push(e.slice(f,a)),c.join("")}}function Pe(e,i){return function(c){var o,a,f=u(1900,void 0,1);if(qe(f,e,c+="",0)!=c.length)return null;if("Q"in f)return new Date(f.Q);if("s"in f)return new Date(1e3*f.s+("L"in f?f.L:0));if(!i||"Z"in f||(f.Z=0),"p"in f&&(f.H=f.H%12+12*f.p),void 0===f.m&&(f.m="q"in f?f.q:0),"V"in f){if(f.V<1||f.V>53)return null;"w"in f||(f.w=1),"Z"in f?(a=(o=r(u(f.y,0,1))).getUTCDay(),o=a>4||0===a?t.utcMonday.ceil(o):t.utcMonday(o),o=t.utcDay.offset(o,7*(f.V-1)),f.y=o.getUTCFullYear(),f.m=o.getUTCMonth(),f.d=o.getUTCDate()+(f.w+6)%7):(a=(o=n(u(f.y,0,1))).getDay(),o=a>4||0===a?t.timeMonday.ceil(o):t.timeMonday(o),o=t.timeDay.offset(o,7*(f.V-1)),f.y=o.getFullYear(),f.m=o.getMonth(),f.d=o.getDate()+(f.w+6)%7)}else("W"in f||"U"in f)&&("w"in f||(f.w="u"in f?f.u%7:"W"in f?1:0),a="Z"in f?r(u(f.y,0,1)).getUTCDay():n(u(f.y,0,1)).getDay(),f.m=0,f.d="W"in f?(f.w+6)%7+7*f.W-(a+5)%7:f.w+7*f.U-(a+6)%7);return"Z"in f?(f.H+=f.Z/100|0,f.M+=f.Z%100,r(f)):n(f)}}function qe(e,t,n,r){for(var u,i,c=0,a=t.length,f=n.length;c<a;){if(r>=f)return-1;if(37===(u=t.charCodeAt(c++))){if(u=t.charAt(c++),!(i=Ve[u in o?t.charAt(c++):u])||(r=i(e,n,r))<0)return-1}else if(u!=n.charCodeAt(r++))return-1}return r}return be.x=je(c,be),be.X=je(a,be),be.c=je(i,be),We.x=je(c,We),We.X=je(a,We),We.c=je(i,We),{format:function(e){var t=je(e+="",be);return t.toString=function(){return e},t},parse:function(e){var t=Pe(e+="",!1);return t.toString=function(){return e},t},utcFormat:function(e){var t=je(e+="",We);return t.toString=function(){return e},t},utcParse:function(e){var t=Pe(e+="",!0);return t.toString=function(){return e},t}}}var c,o={"-":"",_:" ",0:"0"},a=/^\s*\d+/,f=/^%/,l=/[\\^$*+?|[\]().{}]/g;function s(e,t,n){var r=e<0?"-":"",u=(r?-e:e)+"",i=u.length;return r+(i<n?new Array(n-i+1).join(t)+u:u)}function g(e){return e.replace(l,"\\$&")}function y(e){return new RegExp("^(?:"+e.map(g).join("|")+")","i")}function d(e){for(var t={},n=-1,r=e.length;++n<r;)t[e[n].toLowerCase()]=n;return t}function h(e,t,n){var r=a.exec(t.slice(n,n+1));return r?(e.w=+r[0],n+r[0].length):-1}function m(e,t,n){var r=a.exec(t.slice(n,n+1));return r?(e.u=+r[0],n+r[0].length):-1}function v(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.U=+r[0],n+r[0].length):-1}function T(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.V=+r[0],n+r[0].length):-1}function M(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.W=+r[0],n+r[0].length):-1}function D(e,t,n){var r=a.exec(t.slice(n,n+4));return r?(e.y=+r[0],n+r[0].length):-1}function C(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.y=+r[0]+(+r[0]>68?1900:2e3),n+r[0].length):-1}function U(e,t,n){var r=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(n,n+6));return r?(e.Z=r[1]?0:-(r[2]+(r[3]||"00")),n+r[0].length):-1}function x(e,t,n){var r=a.exec(t.slice(n,n+1));return r?(e.q=3*r[0]-3,n+r[0].length):-1}function w(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.m=r[0]-1,n+r[0].length):-1}function p(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.d=+r[0],n+r[0].length):-1}function S(e,t,n){var r=a.exec(t.slice(n,n+3));return r?(e.m=0,e.d=+r[0],n+r[0].length):-1}function Y(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.H=+r[0],n+r[0].length):-1}function F(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.M=+r[0],n+r[0].length):-1}function L(e,t,n){var r=a.exec(t.slice(n,n+2));return r?(e.S=+r[0],n+r[0].length):-1}function H(e,t,n){var r=a.exec(t.slice(n,n+3));return r?(e.L=+r[0],n+r[0].length):-1}function A(e,t,n){var r=a.exec(t.slice(n,n+6));return r?(e.L=Math.floor(r[0]/1e3),n+r[0].length):-1}function Z(e,t,n){var r=f.exec(t.slice(n,n+1));return r?n+r[0].length:-1}function b(e,t,n){var r=a.exec(t.slice(n));return r?(e.Q=+r[0],n+r[0].length):-1}function W(e,t,n){var r=a.exec(t.slice(n));return r?(e.s=+r[0],n+r[0].length):-1}function V(e,t){return s(e.getDate(),t,2)}function j(e,t){return s(e.getHours(),t,2)}function P(e,t){return s(e.getHours()%12||12,t,2)}function q(e,n){return s(1+t.timeDay.count(t.timeYear(e),e),n,3)}function I(e,t){return s(e.getMilliseconds(),t,3)}function J(e,t){return I(e,t)+"000"}function O(e,t){return s(e.getMonth()+1,t,2)}function Q(e,t){return s(e.getMinutes(),t,2)}function X(e,t){return s(e.getSeconds(),t,2)}function N(e){var t=e.getDay();return 0===t?7:t}function B(e,n){return s(t.timeSunday.count(t.timeYear(e)-1,e),n,2)}function G(e){var n=e.getDay();return n>=4||0===n?t.timeThursday(e):t.timeThursday.ceil(e)}function _(e,n){return e=G(e),s(t.timeThursday.count(t.timeYear(e),e)+(4===t.timeYear(e).getDay()),n,2)}function $(e){return e.getDay()}function z(e,n){return s(t.timeMonday.count(t.timeYear(e)-1,e),n,2)}function E(e,t){return s(e.getFullYear()%100,t,2)}function R(e,t){return s((e=G(e)).getFullYear()%100,t,2)}function k(e,t){return s(e.getFullYear()%1e4,t,4)}function K(e,n){var r=e.getDay();return s((e=r>=4||0===r?t.timeThursday(e):t.timeThursday.ceil(e)).getFullYear()%1e4,n,4)}function ee(e){var t=e.getTimezoneOffset();return(t>0?"-":(t*=-1,"+"))+s(t/60|0,"0",2)+s(t%60,"0",2)}function te(e,t){return s(e.getUTCDate(),t,2)}function ne(e,t){return s(e.getUTCHours(),t,2)}function re(e,t){return s(e.getUTCHours()%12||12,t,2)}function ue(e,n){return s(1+t.utcDay.count(t.utcYear(e),e),n,3)}function ie(e,t){return s(e.getUTCMilliseconds(),t,3)}function ce(e,t){return ie(e,t)+"000"}function oe(e,t){return s(e.getUTCMonth()+1,t,2)}function ae(e,t){return s(e.getUTCMinutes(),t,2)}function fe(e,t){return s(e.getUTCSeconds(),t,2)}function le(e){var t=e.getUTCDay();return 0===t?7:t}function se(e,n){return s(t.utcSunday.count(t.utcYear(e)-1,e),n,2)}function ge(e){var n=e.getUTCDay();return n>=4||0===n?t.utcThursday(e):t.utcThursday.ceil(e)}function ye(e,n){return e=ge(e),s(t.utcThursday.count(t.utcYear(e),e)+(4===t.utcYear(e).getUTCDay()),n,2)}function de(e){return e.getUTCDay()}function he(e,n){return s(t.utcMonday.count(t.utcYear(e)-1,e),n,2)}function me(e,t){return s(e.getUTCFullYear()%100,t,2)}function ve(e,t){return s((e=ge(e)).getUTCFullYear()%100,t,2)}function Te(e,t){return s(e.getUTCFullYear()%1e4,t,4)}function Me(e,n){var r=e.getUTCDay();return s((e=r>=4||0===r?t.utcThursday(e):t.utcThursday.ceil(e)).getUTCFullYear()%1e4,n,4)}function De(){return"+0000"}function Ce(){return"%"}function Ue(e){return+e}function xe(e){return Math.floor(+e/1e3)}function we(t){return c=i(t),e.timeFormat=c.format,e.timeParse=c.parse,e.utcFormat=c.utcFormat,e.utcParse=c.utcParse,c}we({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});var pe=Date.prototype.toISOString?function(e){return e.toISOString()}:e.utcFormat("%Y-%m-%dT%H:%M:%S.%LZ");var Se=+new Date("2000-01-01T00:00:00.000Z")?function(e){var t=new Date(e);return isNaN(t)?null:t}:e.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");e.isoFormat=pe,e.isoParse=Se,e.timeFormatDefaultLocale=we,e.timeFormatLocale=i,Object.defineProperty(e,"__esModule",{value:!0})});
},{"d3-time":10}],10:[function(require,module,exports){
// https://d3js.org/d3-time/ v2.0.0 Copyright 2020 Mike Bostock
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).d3=e.d3||{})}(this,function(e){"use strict";var t=new Date,n=new Date;function u(e,r,i,o){function a(t){return e(t=0===arguments.length?new Date:new Date(+t)),t}return a.floor=function(t){return e(t=new Date(+t)),t},a.ceil=function(t){return e(t=new Date(t-1)),r(t,1),e(t),t},a.round=function(e){var t=a(e),n=a.ceil(e);return e-t<n-e?t:n},a.offset=function(e,t){return r(e=new Date(+e),null==t?1:Math.floor(t)),e},a.range=function(t,n,u){var i,o=[];if(t=a.ceil(t),u=null==u?1:Math.floor(u),!(t<n&&u>0))return o;do{o.push(i=new Date(+t)),r(t,u),e(t)}while(i<t&&t<n);return o},a.filter=function(t){return u(function(n){if(n>=n)for(;e(n),!t(n);)n.setTime(n-1)},function(e,n){if(e>=e)if(n<0)for(;++n<=0;)for(;r(e,-1),!t(e););else for(;--n>=0;)for(;r(e,1),!t(e););})},i&&(a.count=function(u,r){return t.setTime(+u),n.setTime(+r),e(t),e(n),Math.floor(i(t,n))},a.every=function(e){return e=Math.floor(e),isFinite(e)&&e>0?e>1?a.filter(o?function(t){return o(t)%e==0}:function(t){return a.count(0,t)%e==0}):a:null}),a}var r=u(function(){},function(e,t){e.setTime(+e+t)},function(e,t){return t-e});r.every=function(e){return e=Math.floor(e),isFinite(e)&&e>0?e>1?u(function(t){t.setTime(Math.floor(t/e)*e)},function(t,n){t.setTime(+t+n*e)},function(t,n){return(n-t)/e}):r:null};var i=r.range,o=6e4,a=6048e5,s=u(function(e){e.setTime(e-e.getMilliseconds())},function(e,t){e.setTime(+e+1e3*t)},function(e,t){return(t-e)/1e3},function(e){return e.getUTCSeconds()}),c=s.range,f=u(function(e){e.setTime(e-e.getMilliseconds()-1e3*e.getSeconds())},function(e,t){e.setTime(+e+t*o)},function(e,t){return(t-e)/o},function(e){return e.getMinutes()}),l=f.range,g=u(function(e){e.setTime(e-e.getMilliseconds()-1e3*e.getSeconds()-e.getMinutes()*o)},function(e,t){e.setTime(+e+36e5*t)},function(e,t){return(t-e)/36e5},function(e){return e.getHours()}),T=g.range,d=u(e=>e.setHours(0,0,0,0),(e,t)=>e.setDate(e.getDate()+t),(e,t)=>(t-e-(t.getTimezoneOffset()-e.getTimezoneOffset())*o)/864e5,e=>e.getDate()-1),m=d.range;function M(e){return u(function(t){t.setDate(t.getDate()-(t.getDay()+7-e)%7),t.setHours(0,0,0,0)},function(e,t){e.setDate(e.getDate()+7*t)},function(e,t){return(t-e-(t.getTimezoneOffset()-e.getTimezoneOffset())*o)/a})}var y=M(0),C=M(1),U=M(2),h=M(3),D=M(4),F=M(5),Y=M(6),H=y.range,S=C.range,v=U.range,w=h.range,p=D.range,W=F.range,O=Y.range,k=u(function(e){e.setDate(1),e.setHours(0,0,0,0)},function(e,t){e.setMonth(e.getMonth()+t)},function(e,t){return t.getMonth()-e.getMonth()+12*(t.getFullYear()-e.getFullYear())},function(e){return e.getMonth()}),z=k.range,x=u(function(e){e.setMonth(0,1),e.setHours(0,0,0,0)},function(e,t){e.setFullYear(e.getFullYear()+t)},function(e,t){return t.getFullYear()-e.getFullYear()},function(e){return e.getFullYear()});x.every=function(e){return isFinite(e=Math.floor(e))&&e>0?u(function(t){t.setFullYear(Math.floor(t.getFullYear()/e)*e),t.setMonth(0,1),t.setHours(0,0,0,0)},function(t,n){t.setFullYear(t.getFullYear()+n*e)}):null};var b=x.range,j=u(function(e){e.setUTCSeconds(0,0)},function(e,t){e.setTime(+e+t*o)},function(e,t){return(t-e)/o},function(e){return e.getUTCMinutes()}),_=j.range,I=u(function(e){e.setUTCMinutes(0,0,0)},function(e,t){e.setTime(+e+36e5*t)},function(e,t){return(t-e)/36e5},function(e){return e.getUTCHours()}),P=I.range,q=u(function(e){e.setUTCHours(0,0,0,0)},function(e,t){e.setUTCDate(e.getUTCDate()+t)},function(e,t){return(t-e)/864e5},function(e){return e.getUTCDate()-1}),A=q.range;function B(e){return u(function(t){t.setUTCDate(t.getUTCDate()-(t.getUTCDay()+7-e)%7),t.setUTCHours(0,0,0,0)},function(e,t){e.setUTCDate(e.getUTCDate()+7*t)},function(e,t){return(t-e)/a})}var E=B(0),G=B(1),J=B(2),K=B(3),L=B(4),N=B(5),Q=B(6),R=E.range,V=G.range,X=J.range,Z=K.range,$=L.range,ee=N.range,te=Q.range,ne=u(function(e){e.setUTCDate(1),e.setUTCHours(0,0,0,0)},function(e,t){e.setUTCMonth(e.getUTCMonth()+t)},function(e,t){return t.getUTCMonth()-e.getUTCMonth()+12*(t.getUTCFullYear()-e.getUTCFullYear())},function(e){return e.getUTCMonth()}),ue=ne.range,re=u(function(e){e.setUTCMonth(0,1),e.setUTCHours(0,0,0,0)},function(e,t){e.setUTCFullYear(e.getUTCFullYear()+t)},function(e,t){return t.getUTCFullYear()-e.getUTCFullYear()},function(e){return e.getUTCFullYear()});re.every=function(e){return isFinite(e=Math.floor(e))&&e>0?u(function(t){t.setUTCFullYear(Math.floor(t.getUTCFullYear()/e)*e),t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCFullYear(t.getUTCFullYear()+n*e)}):null};var ie=re.range;e.timeDay=d,e.timeDays=m,e.timeFriday=F,e.timeFridays=W,e.timeHour=g,e.timeHours=T,e.timeInterval=u,e.timeMillisecond=r,e.timeMilliseconds=i,e.timeMinute=f,e.timeMinutes=l,e.timeMonday=C,e.timeMondays=S,e.timeMonth=k,e.timeMonths=z,e.timeSaturday=Y,e.timeSaturdays=O,e.timeSecond=s,e.timeSeconds=c,e.timeSunday=y,e.timeSundays=H,e.timeThursday=D,e.timeThursdays=p,e.timeTuesday=U,e.timeTuesdays=v,e.timeWednesday=h,e.timeWednesdays=w,e.timeWeek=y,e.timeWeeks=H,e.timeYear=x,e.timeYears=b,e.utcDay=q,e.utcDays=A,e.utcFriday=N,e.utcFridays=ee,e.utcHour=I,e.utcHours=P,e.utcMillisecond=r,e.utcMilliseconds=i,e.utcMinute=j,e.utcMinutes=_,e.utcMonday=G,e.utcMondays=V,e.utcMonth=ne,e.utcMonths=ue,e.utcSaturday=Q,e.utcSaturdays=te,e.utcSecond=s,e.utcSeconds=c,e.utcSunday=E,e.utcSundays=R,e.utcThursday=L,e.utcThursdays=$,e.utcTuesday=J,e.utcTuesdays=X,e.utcWednesday=K,e.utcWednesdays=Z,e.utcWeek=E,e.utcWeeks=R,e.utcYear=re,e.utcYears=ie,Object.defineProperty(e,"__esModule",{value:!0})});
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = color;

var _legend = require("./legend");

var _legend2 = _interopRequireDefault(_legend);

var _d3Dispatch = require("d3-dispatch");

var _d3Scale = require("d3-scale");

var _d3Format = require("d3-format");

var _d3Array = require("d3-array");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function color() {
  var scale = (0, _d3Scale.scaleLinear)(),
      shape = "rect",
      shapeWidth = 15,
      shapeHeight = 15,
      shapeRadius = 10,
      shapePadding = 2,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      useClass = false,
      title = "",
      locale = _legend2.default.d3_defaultLocale,
      specifier = _legend2.default.d3_defaultFormatSpecifier,
      labelOffset = 10,
      labelAlign = "middle",
      labelDelimiter = _legend2.default.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      path = void 0,
      titleWidth = void 0,
      legendDispatcher = (0, _d3Dispatch.dispatch)("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = _legend2.default.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    if (cellFilter) {
      _legend2.default.d3_filterCells(type, cellFilter);
    }

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);

    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch").data(type.data);

    //add event handlers
    _legend2.default.d3_addEvents(cellEnter, legendDispatcher);

    cell.exit().transition().style("opacity", 0).remove();
    shapes.exit().transition().style("opacity", 0).remove();

    shapes = shapes.merge(shapes);

    _legend2.default.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path);
    var text = _legend2.default.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap);

    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    // sets placement
    var textSize = text.nodes().map(function (d) {
      return d.getBBox();
    }),
        shapeSize = shapes.nodes().map(function (d) {
      return d.getBBox();
    });
    //sets scale
    //everything is fill except for line which is stroke,
    if (!useClass) {
      if (shape == "line") {
        shapes.style("stroke", type.feature);
      } else {
        shapes.style("fill", type.feature);
      }
    } else {
      shapes.attr("class", function (d) {
        return classPrefix + "swatch " + type.feature(d);
      });
    }

    var cellTrans = void 0,
        textTrans = void 0,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

    //positions cells and text
    if (orient === "vertical") {
      (function () {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(d.height, shapeSize[i].height);
        });

        cellTrans = function cellTrans(d, i) {
          var height = (0, _d3Array.sum)(cellSize.slice(0, i));
          return "translate(0, " + (height + i * shapePadding) + ")";
        };

        textTrans = function textTrans(d, i) {
          return "translate( " + (shapeSize[i].width + shapeSize[i].x + labelOffset) + ", " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      })();
    } else if (orient === "horizontal") {
      cellTrans = function cellTrans(d, i) {
        return "translate(" + i * (shapeSize[i].width + shapePadding) + ",0)";
      };
      textTrans = function textTrans(d, i) {
        return "translate(" + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n          " + (shapeSize[i].height + shapeSize[i].y + labelOffset + 8) + ")";
      };
    }

    _legend2.default.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
    _legend2.default.d3_title(svg, title, classPrefix, titleWidth);

    cell.transition().style("opacity", 1);
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shape = function (_, d) {
    if (!arguments.length) return shape;
    if (_ == "rect" || _ == "circle" || _ == "line" || _ == "path" && typeof d === "string") {
      shape = _;
      path = d;
    }
    return legend;
  };

  legend.shapeWidth = function (_) {
    if (!arguments.length) return shapeWidth;
    shapeWidth = +_;
    return legend;
  };

  legend.shapeHeight = function (_) {
    if (!arguments.length) return shapeHeight;
    shapeHeight = +_;
    return legend;
  };

  legend.shapeRadius = function (_) {
    if (!arguments.length) return shapeRadius;
    shapeRadius = +_;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = (0, _d3Format.formatLocale)(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = (0, _d3Format.formatSpecifier)(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.useClass = function (_) {
    if (!arguments.length) return useClass;
    if (_ === true || _ === false) {
      useClass = _;
    }
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.textWrap = function (_) {
    if (!arguments.length) return textWrap;
    textWrap = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

},{"./legend":13,"d3-array":1,"d3-dispatch":4,"d3-format":5,"d3-scale":7}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var thresholdLabels = exports.thresholdLabels = function thresholdLabels(_ref) {
  var i = _ref.i,
      genLength = _ref.genLength,
      generatedLabels = _ref.generatedLabels,
      labelDelimiter = _ref.labelDelimiter;

  if (i === 0) {
    var values = generatedLabels[i].split(" " + labelDelimiter + " ");
    return "Less than " + values[1];
  } else if (i === genLength - 1) {
    var _values = generatedLabels[i].split(" " + labelDelimiter + " ");
    return _values[0] + " or more";
  }
  return generatedLabels[i];
};

exports.default = {
  thresholdLabels: thresholdLabels
};

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _d3Selection = require("d3-selection");

var _d3Format = require("d3-format");

var d3_identity = function d3_identity(d) {
  return d;
};

var d3_reverse = function d3_reverse(arr) {
  var mirror = [];
  for (var i = 0, l = arr.length; i < l; i++) {
    mirror[i] = arr[l - i - 1];
  }
  return mirror;
};

//Text wrapping code adapted from Mike Bostock
var d3_textWrapping = function d3_textWrapping(text, width) {
  text.each(function () {
    var text = (0, _d3Selection.select)(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2,
        //ems
    y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("dy", lineHeight + dy + "em").text(word);
      }
    }
  });
};

var d3_mergeLabels = function d3_mergeLabels() {
  var gen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var labels = arguments[1];
  var domain = arguments[2];
  var range = arguments[3];
  var labelDelimiter = arguments[4];

  if ((typeof labels === "undefined" ? "undefined" : _typeof(labels)) === "object") {
    if (labels.length === 0) return gen;

    var i = labels.length;
    for (; i < gen.length; i++) {
      labels.push(gen[i]);
    }
    return labels;
  } else if (typeof labels === "function") {
    var customLabels = [];
    var genLength = gen.length;
    for (var _i = 0; _i < genLength; _i++) {
      customLabels.push(labels({
        i: _i,
        genLength: genLength,
        generatedLabels: gen,
        domain: domain,
        range: range,
        labelDelimiter: labelDelimiter
      }));
    }
    return customLabels;
  }

  return gen;
};

var d3_linearLegend = function d3_linearLegend(scale, cells, labelFormat) {
  var data = [];

  if (cells.length > 1) {
    data = cells;
  } else {
    var domain = scale.domain(),
        increment = (domain[domain.length - 1] - domain[0]) / (cells - 1);
    var i = 0;

    for (; i < cells; i++) {
      data.push(domain[0] + i * increment);
    }
  }

  var labels = data.map(labelFormat);
  return {
    data: data,
    labels: labels,
    feature: function feature(d) {
      return scale(d);
    }
  };
};

var d3_quantLegend = function d3_quantLegend(scale, labelFormat, labelDelimiter) {
  var labels = scale.range().map(function (d) {
    var invert = scale.invertExtent(d);
    return labelFormat(invert[0]) + " " + labelDelimiter + " " + labelFormat(invert[1]);
  });

  return {
    data: scale.range(),
    labels: labels,
    feature: d3_identity
  };
};

var d3_ordinalLegend = function d3_ordinalLegend(scale) {
  return {
    data: scale.domain(),
    labels: scale.domain(),
    feature: function feature(d) {
      return scale(d);
    }
  };
};

var d3_cellOver = function d3_cellOver(cellDispatcher, d, obj) {
  cellDispatcher.call("cellover", obj, d);
};

var d3_cellOut = function d3_cellOut(cellDispatcher, d, obj) {
  cellDispatcher.call("cellout", obj, d);
};

var d3_cellClick = function d3_cellClick(cellDispatcher, d, obj) {
  cellDispatcher.call("cellclick", obj, d);
};

exports.default = {
  d3_drawShapes: function d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path) {
    if (shape === "rect") {
      shapes.attr("height", shapeHeight).attr("width", shapeWidth);
    } else if (shape === "circle") {
      shapes.attr("r", shapeRadius);
    } else if (shape === "line") {
      shapes.attr("x1", 0).attr("x2", shapeWidth).attr("y1", 0).attr("y2", 0);
    } else if (shape === "path") {
      shapes.attr("d", path);
    }
  },

  d3_addText: function d3_addText(svg, enter, labels, classPrefix, labelWidth) {
    enter.append("text").attr("class", classPrefix + "label");
    var text = svg.selectAll("g." + classPrefix + "cell text." + classPrefix + "label").data(labels).text(d3_identity);

    if (labelWidth) {
      svg.selectAll("g." + classPrefix + "cell text." + classPrefix + "label").call(d3_textWrapping, labelWidth);
    }

    return text;
  },

  d3_calcType: function d3_calcType(scale, ascending, cells, labels, labelFormat, labelDelimiter) {
    var type = scale.invertExtent ? d3_quantLegend(scale, labelFormat, labelDelimiter) : scale.ticks ? d3_linearLegend(scale, cells, labelFormat) : d3_ordinalLegend(scale);

    //for d3.scaleSequential that doesn't have a range function
    var range = scale.range && scale.range() || scale.domain();
    type.labels = d3_mergeLabels(type.labels, labels, scale.domain(), range, labelDelimiter);

    if (ascending) {
      type.labels = d3_reverse(type.labels);
      type.data = d3_reverse(type.data);
    }

    return type;
  },

  d3_filterCells: function d3_filterCells(type, cellFilter) {
    var filterCells = type.data.map(function (d, i) {
      return { data: d, label: type.labels[i] };
    }).filter(cellFilter);
    var dataValues = filterCells.map(function (d) {
      return d.data;
    });
    var labelValues = filterCells.map(function (d) {
      return d.label;
    });
    type.data = type.data.filter(function (d) {
      return dataValues.indexOf(d) !== -1;
    });
    type.labels = type.labels.filter(function (d) {
      return labelValues.indexOf(d) !== -1;
    });
    return type;
  },

  d3_placement: function d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign) {
    cell.attr("transform", cellTrans);
    text.attr("transform", textTrans);
    if (orient === "horizontal") {
      text.style("text-anchor", labelAlign);
    }
  },

  d3_addEvents: function d3_addEvents(cells, dispatcher) {
    cells.on("mouseover.legend", function (d) {
      d3_cellOver(dispatcher, d, this);
    }).on("mouseout.legend", function (d) {
      d3_cellOut(dispatcher, d, this);
    }).on("click.legend", function (d) {
      d3_cellClick(dispatcher, d, this);
    });
  },

  d3_title: function d3_title(svg, title, classPrefix, titleWidth) {
    if (title !== "") {
      var titleText = svg.selectAll("text." + classPrefix + "legendTitle");

      titleText.data([title]).enter().append("text").attr("class", classPrefix + "legendTitle");

      svg.selectAll("text." + classPrefix + "legendTitle").text(title);

      if (titleWidth) {
        svg.selectAll("text." + classPrefix + "legendTitle").call(d3_textWrapping, titleWidth);
      }

      var cellsSvg = svg.select("." + classPrefix + "legendCells");
      var yOffset = svg.select("." + classPrefix + "legendTitle").nodes().map(function (d) {
        return d.getBBox().height;
      })[0],
          xOffset = -cellsSvg.nodes().map(function (d) {
        return d.getBBox().x;
      })[0];
      cellsSvg.attr("transform", "translate(" + xOffset + "," + yOffset + ")");
    }
  },

  d3_defaultLocale: {
    format: _d3Format.format,
    formatPrefix: _d3Format.formatPrefix
  },

  d3_defaultFormatSpecifier: ".01f",

  d3_defaultDelimiter: "to"
};

},{"d3-format":5,"d3-selection":8}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = size;

var _legend = require("./legend");

var _legend2 = _interopRequireDefault(_legend);

var _d3Dispatch = require("d3-dispatch");

var _d3Scale = require("d3-scale");

var _d3Format = require("d3-format");

var _d3Array = require("d3-array");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function size() {
  var scale = (0, _d3Scale.scaleLinear)(),
      shape = "rect",
      shapeWidth = 15,
      shapePadding = 2,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      title = "",
      locale = _legend2.default.d3_defaultLocale,
      specifier = _legend2.default.d3_defaultFormatSpecifier,
      labelOffset = 10,
      labelAlign = "middle",
      labelDelimiter = _legend2.default.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      path = void 0,
      titleWidth = void 0,
      legendDispatcher = (0, _d3Dispatch.dispatch)("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = _legend2.default.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      _legend2.default.d3_filterCells(type, cellFilter);
    }

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);
    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch");

    //add event handlers
    _legend2.default.d3_addEvents(cellEnter, legendDispatcher);

    cell.exit().transition().style("opacity", 0).remove();

    shapes.exit().transition().style("opacity", 0).remove();
    shapes = shapes.merge(shapes);

    //creates shape
    if (shape === "line") {
      _legend2.default.d3_drawShapes(shape, shapes, 0, shapeWidth);
      shapes.attr("stroke-width", type.feature);
    } else {
      _legend2.default.d3_drawShapes(shape, shapes, type.feature, type.feature, type.feature, path);
    }

    var text = _legend2.default.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap);

    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    //sets placement

    var textSize = text.nodes().map(function (d) {
      return d.getBBox();
    }),
        shapeSize = shapes.nodes().map(function (d, i) {
      var bbox = d.getBBox();
      var stroke = scale(type.data[i]);

      if (shape === "line" && orient === "horizontal") {
        bbox.height = bbox.height + stroke;
      } else if (shape === "line" && orient === "vertical") {
        bbox.width = bbox.width;
      }
      return bbox;
    });

    var maxH = (0, _d3Array.max)(shapeSize, function (d) {
      return d.height + d.y;
    }),
        maxW = (0, _d3Array.max)(shapeSize, function (d) {
      return d.width + d.x;
    });

    var cellTrans = void 0,
        textTrans = void 0,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

    //positions cells and text
    if (orient === "vertical") {
      (function () {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(d.height, shapeSize[i].height);
        });
        var y = shape == "circle" || shape == "line" ? shapeSize[0].height / 2 : 0;
        cellTrans = function cellTrans(d, i) {
          var height = (0, _d3Array.sum)(cellSize.slice(0, i));

          return "translate(0, " + (y + height + i * shapePadding) + ")";
        };

        textTrans = function textTrans(d, i) {
          return "translate( " + (maxW + labelOffset) + ",\n          " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      })();
    } else if (orient === "horizontal") {
      (function () {
        cellTrans = function cellTrans(d, i) {
          var width = (0, _d3Array.sum)(shapeSize.slice(0, i), function (d) {
            return d.width;
          });
          var y = shape == "circle" || shape == "line" ? maxH / 2 : 0;
          return "translate(" + (width + i * shapePadding) + ", " + y + ")";
        };

        var offset = shape == "line" ? maxH / 2 : maxH;
        textTrans = function textTrans(d, i) {
          return "translate( " + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n              " + (offset + labelOffset) + ")";
        };
      })();
    }

    _legend2.default.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
    _legend2.default.d3_title(svg, title, classPrefix, titleWidth);

    cell.transition().style("opacity", 1);
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shape = function (_, d) {
    if (!arguments.length) return shape;
    if (_ == "rect" || _ == "circle" || _ == "line") {
      shape = _;
      path = d;
    }
    return legend;
  };

  legend.shapeWidth = function (_) {
    if (!arguments.length) return shapeWidth;
    shapeWidth = +_;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = (0, _d3Format.formatLocale)(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = (0, _d3Format.formatSpecifier)(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

},{"./legend":13,"d3-array":1,"d3-dispatch":4,"d3-format":5,"d3-scale":7}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = symbol;

var _legend = require("./legend");

var _legend2 = _interopRequireDefault(_legend);

var _d3Dispatch = require("d3-dispatch");

var _d3Scale = require("d3-scale");

var _d3Format = require("d3-format");

var _d3Array = require("d3-array");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function symbol() {
  var scale = (0, _d3Scale.scaleLinear)(),
      shape = "path",
      shapeWidth = 15,
      shapeHeight = 15,
      shapeRadius = 10,
      shapePadding = 5,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      title = "",
      locale = _legend2.default.d3_defaultLocale,
      specifier = _legend2.default.d3_defaultFormatSpecifier,
      labelAlign = "middle",
      labelOffset = 10,
      labelDelimiter = _legend2.default.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      titleWidth = void 0,
      legendDispatcher = (0, _d3Dispatch.dispatch)("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = _legend2.default.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      _legend2.default.d3_filterCells(type, cellFilter);
    }

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);
    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch");

    //add event handlers
    _legend2.default.d3_addEvents(cellEnter, legendDispatcher);

    //remove old shapes
    cell.exit().transition().style("opacity", 0).remove();
    shapes.exit().transition().style("opacity", 0).remove();
    shapes = shapes.merge(shapes);

    _legend2.default.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, type.feature);
    var text = _legend2.default.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap);

    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    // sets placement
    var textSize = text.nodes().map(function (d) {
      return d.getBBox();
    }),
        shapeSize = shapes.nodes().map(function (d) {
      return d.getBBox();
    });

    var maxH = (0, _d3Array.max)(shapeSize, function (d) {
      return d.height;
    }),
        maxW = (0, _d3Array.max)(shapeSize, function (d) {
      return d.width;
    });

    var cellTrans = void 0,
        textTrans = void 0,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

    //positions cells and text
    if (orient === "vertical") {
      (function () {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(maxH, d.height);
        });

        cellTrans = function cellTrans(d, i) {
          var height = (0, _d3Array.sum)(cellSize.slice(0, i));
          return "translate(0, " + (height + i * shapePadding) + " )";
        };
        textTrans = function textTrans(d, i) {
          return "translate( " + (maxW + labelOffset) + ",\n              " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      })();
    } else if (orient === "horizontal") {
      cellTrans = function cellTrans(d, i) {
        return "translate( " + i * (maxW + shapePadding) + ",0)";
      };
      textTrans = function textTrans(d, i) {
        return "translate( " + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n              " + (maxH + labelOffset) + ")";
      };
    }

    _legend2.default.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
    _legend2.default.d3_title(svg, title, classPrefix, titleWidth);
    cell.transition().style("opacity", 1);
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = (0, _d3Format.formatLocale)(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = (0, _d3Format.formatSpecifier)(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

},{"./legend":13,"d3-array":1,"d3-dispatch":4,"d3-format":5,"d3-scale":7}],16:[function(require,module,exports){
'use strict';

var _color = require('./color');

var _color2 = _interopRequireDefault(_color);

var _size = require('./size');

var _size2 = _interopRequireDefault(_size);

var _symbol = require('./symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

d3.legendColor = _color2.default;
d3.legendSize = _size2.default;
d3.legendSymbol = _symbol2.default;
d3.legendHelpers = _helpers2.default;

},{"./color":11,"./helpers":12,"./size":14,"./symbol":15}]},{},[16])
