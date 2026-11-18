var j_=Object.defineProperty;var Y_=(s,e,t)=>e in s?j_(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var lt=(s,e,t)=>Y_(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();function Kd(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var vf={exports:{}},aa={},_f={exports:{}},pt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Fm;function q_(){if(Fm)return pt;Fm=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),i=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),a=Symbol.for("react.provider"),c=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),d=Symbol.for("react.suspense"),h=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),g=Symbol.iterator;function v(F){return F===null||typeof F!="object"?null:(F=g&&F[g]||F["@@iterator"],typeof F=="function"?F:null)}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,w={};function S(F,ie,Ne){this.props=F,this.context=ie,this.refs=w,this.updater=Ne||y}S.prototype.isReactComponent={},S.prototype.setState=function(F,ie){if(typeof F!="object"&&typeof F!="function"&&F!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,F,ie,"setState")},S.prototype.forceUpdate=function(F){this.updater.enqueueForceUpdate(this,F,"forceUpdate")};function x(){}x.prototype=S.prototype;function I(F,ie,Ne){this.props=F,this.context=ie,this.refs=w,this.updater=Ne||y}var C=I.prototype=new x;C.constructor=I,M(C,S.prototype),C.isPureReactComponent=!0;var E=Array.isArray,Z=Object.prototype.hasOwnProperty,D={current:null},O={key:!0,ref:!0,__self:!0,__source:!0};function Y(F,ie,Ne){var J,ue={},we=null,xe=null;if(ie!=null)for(J in ie.ref!==void 0&&(xe=ie.ref),ie.key!==void 0&&(we=""+ie.key),ie)Z.call(ie,J)&&!O.hasOwnProperty(J)&&(ue[J]=ie[J]);var Ce=arguments.length-2;if(Ce===1)ue.children=Ne;else if(1<Ce){for(var Ue=Array(Ce),Qe=0;Qe<Ce;Qe++)Ue[Qe]=arguments[Qe+2];ue.children=Ue}if(F&&F.defaultProps)for(J in Ce=F.defaultProps,Ce)ue[J]===void 0&&(ue[J]=Ce[J]);return{$$typeof:s,type:F,key:we,ref:xe,props:ue,_owner:D.current}}function L(F,ie){return{$$typeof:s,type:F.type,key:ie,ref:F.ref,props:F.props,_owner:F._owner}}function b(F){return typeof F=="object"&&F!==null&&F.$$typeof===s}function V(F){var ie={"=":"=0",":":"=2"};return"$"+F.replace(/[=:]/g,function(Ne){return ie[Ne]})}var ae=/\/+/g;function ne(F,ie){return typeof F=="object"&&F!==null&&F.key!=null?V(""+F.key):ie.toString(36)}function de(F,ie,Ne,J,ue){var we=typeof F;(we==="undefined"||we==="boolean")&&(F=null);var xe=!1;if(F===null)xe=!0;else switch(we){case"string":case"number":xe=!0;break;case"object":switch(F.$$typeof){case s:case e:xe=!0}}if(xe)return xe=F,ue=ue(xe),F=J===""?"."+ne(xe,0):J,E(ue)?(Ne="",F!=null&&(Ne=F.replace(ae,"$&/")+"/"),de(ue,ie,Ne,"",function(Qe){return Qe})):ue!=null&&(b(ue)&&(ue=L(ue,Ne+(!ue.key||xe&&xe.key===ue.key?"":(""+ue.key).replace(ae,"$&/")+"/")+F)),ie.push(ue)),1;if(xe=0,J=J===""?".":J+":",E(F))for(var Ce=0;Ce<F.length;Ce++){we=F[Ce];var Ue=J+ne(we,Ce);xe+=de(we,ie,Ne,Ue,ue)}else if(Ue=v(F),typeof Ue=="function")for(F=Ue.call(F),Ce=0;!(we=F.next()).done;)we=we.value,Ue=J+ne(we,Ce++),xe+=de(we,ie,Ne,Ue,ue);else if(we==="object")throw ie=String(F),Error("Objects are not valid as a React child (found: "+(ie==="[object Object]"?"object with keys {"+Object.keys(F).join(", ")+"}":ie)+"). If you meant to render a collection of children, use an array instead.");return xe}function pe(F,ie,Ne){if(F==null)return F;var J=[],ue=0;return de(F,J,"","",function(we){return ie.call(Ne,we,ue++)}),J}function oe(F){if(F._status===-1){var ie=F._result;ie=ie(),ie.then(function(Ne){(F._status===0||F._status===-1)&&(F._status=1,F._result=Ne)},function(Ne){(F._status===0||F._status===-1)&&(F._status=2,F._result=Ne)}),F._status===-1&&(F._status=0,F._result=ie)}if(F._status===1)return F._result.default;throw F._result}var ce={current:null},B={transition:null},le={ReactCurrentDispatcher:ce,ReactCurrentBatchConfig:B,ReactCurrentOwner:D};function se(){throw Error("act(...) is not supported in production builds of React.")}return pt.Children={map:pe,forEach:function(F,ie,Ne){pe(F,function(){ie.apply(this,arguments)},Ne)},count:function(F){var ie=0;return pe(F,function(){ie++}),ie},toArray:function(F){return pe(F,function(ie){return ie})||[]},only:function(F){if(!b(F))throw Error("React.Children.only expected to receive a single React element child.");return F}},pt.Component=S,pt.Fragment=t,pt.Profiler=o,pt.PureComponent=I,pt.StrictMode=i,pt.Suspense=d,pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=le,pt.act=se,pt.cloneElement=function(F,ie,Ne){if(F==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+F+".");var J=M({},F.props),ue=F.key,we=F.ref,xe=F._owner;if(ie!=null){if(ie.ref!==void 0&&(we=ie.ref,xe=D.current),ie.key!==void 0&&(ue=""+ie.key),F.type&&F.type.defaultProps)var Ce=F.type.defaultProps;for(Ue in ie)Z.call(ie,Ue)&&!O.hasOwnProperty(Ue)&&(J[Ue]=ie[Ue]===void 0&&Ce!==void 0?Ce[Ue]:ie[Ue])}var Ue=arguments.length-2;if(Ue===1)J.children=Ne;else if(1<Ue){Ce=Array(Ue);for(var Qe=0;Qe<Ue;Qe++)Ce[Qe]=arguments[Qe+2];J.children=Ce}return{$$typeof:s,type:F.type,key:ue,ref:we,props:J,_owner:xe}},pt.createContext=function(F){return F={$$typeof:c,_currentValue:F,_currentValue2:F,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},F.Provider={$$typeof:a,_context:F},F.Consumer=F},pt.createElement=Y,pt.createFactory=function(F){var ie=Y.bind(null,F);return ie.type=F,ie},pt.createRef=function(){return{current:null}},pt.forwardRef=function(F){return{$$typeof:u,render:F}},pt.isValidElement=b,pt.lazy=function(F){return{$$typeof:m,_payload:{_status:-1,_result:F},_init:oe}},pt.memo=function(F,ie){return{$$typeof:h,type:F,compare:ie===void 0?null:ie}},pt.startTransition=function(F){var ie=B.transition;B.transition={};try{F()}finally{B.transition=ie}},pt.unstable_act=se,pt.useCallback=function(F,ie){return ce.current.useCallback(F,ie)},pt.useContext=function(F){return ce.current.useContext(F)},pt.useDebugValue=function(){},pt.useDeferredValue=function(F){return ce.current.useDeferredValue(F)},pt.useEffect=function(F,ie){return ce.current.useEffect(F,ie)},pt.useId=function(){return ce.current.useId()},pt.useImperativeHandle=function(F,ie,Ne){return ce.current.useImperativeHandle(F,ie,Ne)},pt.useInsertionEffect=function(F,ie){return ce.current.useInsertionEffect(F,ie)},pt.useLayoutEffect=function(F,ie){return ce.current.useLayoutEffect(F,ie)},pt.useMemo=function(F,ie){return ce.current.useMemo(F,ie)},pt.useReducer=function(F,ie,Ne){return ce.current.useReducer(F,ie,Ne)},pt.useRef=function(F){return ce.current.useRef(F)},pt.useState=function(F){return ce.current.useState(F)},pt.useSyncExternalStore=function(F,ie,Ne){return ce.current.useSyncExternalStore(F,ie,Ne)},pt.useTransition=function(){return ce.current.useTransition()},pt.version="18.3.1",pt}var Om;function Na(){return Om||(Om=1,_f.exports=q_()),_f.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var zm;function Z_(){if(zm)return aa;zm=1;var s=Na(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,o=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function c(u,d,h){var m,g={},v=null,y=null;h!==void 0&&(v=""+h),d.key!==void 0&&(v=""+d.key),d.ref!==void 0&&(y=d.ref);for(m in d)i.call(d,m)&&!a.hasOwnProperty(m)&&(g[m]=d[m]);if(u&&u.defaultProps)for(m in d=u.defaultProps,d)g[m]===void 0&&(g[m]=d[m]);return{$$typeof:e,type:u,key:v,ref:y,props:g,_owner:o.current}}return aa.Fragment=t,aa.jsx=c,aa.jsxs=c,aa}var km;function $_(){return km||(km=1,vf.exports=Z_()),vf.exports}var P=$_(),Yt=Na();const xv=Kd(Yt);var Hl={},xf={exports:{}},Gn={},yf={exports:{}},Sf={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Bm;function K_(){return Bm||(Bm=1,(function(s){function e(B,le){var se=B.length;B.push(le);e:for(;0<se;){var F=se-1>>>1,ie=B[F];if(0<o(ie,le))B[F]=le,B[se]=ie,se=F;else break e}}function t(B){return B.length===0?null:B[0]}function i(B){if(B.length===0)return null;var le=B[0],se=B.pop();if(se!==le){B[0]=se;e:for(var F=0,ie=B.length,Ne=ie>>>1;F<Ne;){var J=2*(F+1)-1,ue=B[J],we=J+1,xe=B[we];if(0>o(ue,se))we<ie&&0>o(xe,ue)?(B[F]=xe,B[we]=se,F=we):(B[F]=ue,B[J]=se,F=J);else if(we<ie&&0>o(xe,se))B[F]=xe,B[we]=se,F=we;else break e}}return le}function o(B,le){var se=B.sortIndex-le.sortIndex;return se!==0?se:B.id-le.id}if(typeof performance=="object"&&typeof performance.now=="function"){var a=performance;s.unstable_now=function(){return a.now()}}else{var c=Date,u=c.now();s.unstable_now=function(){return c.now()-u}}var d=[],h=[],m=1,g=null,v=3,y=!1,M=!1,w=!1,S=typeof setTimeout=="function"?setTimeout:null,x=typeof clearTimeout=="function"?clearTimeout:null,I=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function C(B){for(var le=t(h);le!==null;){if(le.callback===null)i(h);else if(le.startTime<=B)i(h),le.sortIndex=le.expirationTime,e(d,le);else break;le=t(h)}}function E(B){if(w=!1,C(B),!M)if(t(d)!==null)M=!0,oe(Z);else{var le=t(h);le!==null&&ce(E,le.startTime-B)}}function Z(B,le){M=!1,w&&(w=!1,x(Y),Y=-1),y=!0;var se=v;try{for(C(le),g=t(d);g!==null&&(!(g.expirationTime>le)||B&&!V());){var F=g.callback;if(typeof F=="function"){g.callback=null,v=g.priorityLevel;var ie=F(g.expirationTime<=le);le=s.unstable_now(),typeof ie=="function"?g.callback=ie:g===t(d)&&i(d),C(le)}else i(d);g=t(d)}if(g!==null)var Ne=!0;else{var J=t(h);J!==null&&ce(E,J.startTime-le),Ne=!1}return Ne}finally{g=null,v=se,y=!1}}var D=!1,O=null,Y=-1,L=5,b=-1;function V(){return!(s.unstable_now()-b<L)}function ae(){if(O!==null){var B=s.unstable_now();b=B;var le=!0;try{le=O(!0,B)}finally{le?ne():(D=!1,O=null)}}else D=!1}var ne;if(typeof I=="function")ne=function(){I(ae)};else if(typeof MessageChannel<"u"){var de=new MessageChannel,pe=de.port2;de.port1.onmessage=ae,ne=function(){pe.postMessage(null)}}else ne=function(){S(ae,0)};function oe(B){O=B,D||(D=!0,ne())}function ce(B,le){Y=S(function(){B(s.unstable_now())},le)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(B){B.callback=null},s.unstable_continueExecution=function(){M||y||(M=!0,oe(Z))},s.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):L=0<B?Math.floor(1e3/B):5},s.unstable_getCurrentPriorityLevel=function(){return v},s.unstable_getFirstCallbackNode=function(){return t(d)},s.unstable_next=function(B){switch(v){case 1:case 2:case 3:var le=3;break;default:le=v}var se=v;v=le;try{return B()}finally{v=se}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(B,le){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var se=v;v=B;try{return le()}finally{v=se}},s.unstable_scheduleCallback=function(B,le,se){var F=s.unstable_now();switch(typeof se=="object"&&se!==null?(se=se.delay,se=typeof se=="number"&&0<se?F+se:F):se=F,B){case 1:var ie=-1;break;case 2:ie=250;break;case 5:ie=1073741823;break;case 4:ie=1e4;break;default:ie=5e3}return ie=se+ie,B={id:m++,callback:le,priorityLevel:B,startTime:se,expirationTime:ie,sortIndex:-1},se>F?(B.sortIndex=se,e(h,B),t(d)===null&&B===t(h)&&(w?(x(Y),Y=-1):w=!0,ce(E,se-F))):(B.sortIndex=ie,e(d,B),M||y||(M=!0,oe(Z))),B},s.unstable_shouldYield=V,s.unstable_wrapCallback=function(B){var le=v;return function(){var se=v;v=le;try{return B.apply(this,arguments)}finally{v=se}}}})(Sf)),Sf}var Vm;function J_(){return Vm||(Vm=1,yf.exports=K_()),yf.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Hm;function Q_(){if(Hm)return Gn;Hm=1;var s=Na(),e=J_();function t(n){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+n,l=1;l<arguments.length;l++)r+="&args[]="+encodeURIComponent(arguments[l]);return"Minified React error #"+n+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var i=new Set,o={};function a(n,r){c(n,r),c(n+"Capture",r)}function c(n,r){for(o[n]=r,n=0;n<r.length;n++)i.add(r[n])}var u=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),d=Object.prototype.hasOwnProperty,h=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},g={};function v(n){return d.call(g,n)?!0:d.call(m,n)?!1:h.test(n)?g[n]=!0:(m[n]=!0,!1)}function y(n,r,l,f){if(l!==null&&l.type===0)return!1;switch(typeof r){case"function":case"symbol":return!0;case"boolean":return f?!1:l!==null?!l.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,r,l,f){if(r===null||typeof r>"u"||y(n,r,l,f))return!0;if(f)return!1;if(l!==null)switch(l.type){case 3:return!r;case 4:return r===!1;case 5:return isNaN(r);case 6:return isNaN(r)||1>r}return!1}function w(n,r,l,f,p,_,T){this.acceptsBooleans=r===2||r===3||r===4,this.attributeName=f,this.attributeNamespace=p,this.mustUseProperty=l,this.propertyName=n,this.type=r,this.sanitizeURL=_,this.removeEmptyString=T}var S={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){S[n]=new w(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var r=n[0];S[r]=new w(r,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){S[n]=new w(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){S[n]=new w(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){S[n]=new w(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){S[n]=new w(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){S[n]=new w(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){S[n]=new w(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){S[n]=new w(n,5,!1,n.toLowerCase(),null,!1,!1)});var x=/[\-:]([a-z])/g;function I(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var r=n.replace(x,I);S[r]=new w(r,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var r=n.replace(x,I);S[r]=new w(r,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var r=n.replace(x,I);S[r]=new w(r,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){S[n]=new w(n,1,!1,n.toLowerCase(),null,!1,!1)}),S.xlinkHref=new w("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){S[n]=new w(n,1,!1,n.toLowerCase(),null,!0,!0)});function C(n,r,l,f){var p=S.hasOwnProperty(r)?S[r]:null;(p!==null?p.type!==0:f||!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(M(r,l,p,f)&&(l=null),f||p===null?v(r)&&(l===null?n.removeAttribute(r):n.setAttribute(r,""+l)):p.mustUseProperty?n[p.propertyName]=l===null?p.type===3?!1:"":l:(r=p.attributeName,f=p.attributeNamespace,l===null?n.removeAttribute(r):(p=p.type,l=p===3||p===4&&l===!0?"":""+l,f?n.setAttributeNS(f,r,l):n.setAttribute(r,l))))}var E=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Z=Symbol.for("react.element"),D=Symbol.for("react.portal"),O=Symbol.for("react.fragment"),Y=Symbol.for("react.strict_mode"),L=Symbol.for("react.profiler"),b=Symbol.for("react.provider"),V=Symbol.for("react.context"),ae=Symbol.for("react.forward_ref"),ne=Symbol.for("react.suspense"),de=Symbol.for("react.suspense_list"),pe=Symbol.for("react.memo"),oe=Symbol.for("react.lazy"),ce=Symbol.for("react.offscreen"),B=Symbol.iterator;function le(n){return n===null||typeof n!="object"?null:(n=B&&n[B]||n["@@iterator"],typeof n=="function"?n:null)}var se=Object.assign,F;function ie(n){if(F===void 0)try{throw Error()}catch(l){var r=l.stack.trim().match(/\n( *(at )?)/);F=r&&r[1]||""}return`
`+F+n}var Ne=!1;function J(n,r){if(!n||Ne)return"";Ne=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(r)if(r=function(){throw Error()},Object.defineProperty(r.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(r,[])}catch(Q){var f=Q}Reflect.construct(n,[],r)}else{try{r.call()}catch(Q){f=Q}n.call(r.prototype)}else{try{throw Error()}catch(Q){f=Q}n()}}catch(Q){if(Q&&f&&typeof Q.stack=="string"){for(var p=Q.stack.split(`
`),_=f.stack.split(`
`),T=p.length-1,U=_.length-1;1<=T&&0<=U&&p[T]!==_[U];)U--;for(;1<=T&&0<=U;T--,U--)if(p[T]!==_[U]){if(T!==1||U!==1)do if(T--,U--,0>U||p[T]!==_[U]){var z=`
`+p[T].replace(" at new "," at ");return n.displayName&&z.includes("<anonymous>")&&(z=z.replace("<anonymous>",n.displayName)),z}while(1<=T&&0<=U);break}}}finally{Ne=!1,Error.prepareStackTrace=l}return(n=n?n.displayName||n.name:"")?ie(n):""}function ue(n){switch(n.tag){case 5:return ie(n.type);case 16:return ie("Lazy");case 13:return ie("Suspense");case 19:return ie("SuspenseList");case 0:case 2:case 15:return n=J(n.type,!1),n;case 11:return n=J(n.type.render,!1),n;case 1:return n=J(n.type,!0),n;default:return""}}function we(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case O:return"Fragment";case D:return"Portal";case L:return"Profiler";case Y:return"StrictMode";case ne:return"Suspense";case de:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case V:return(n.displayName||"Context")+".Consumer";case b:return(n._context.displayName||"Context")+".Provider";case ae:var r=n.render;return n=n.displayName,n||(n=r.displayName||r.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case pe:return r=n.displayName||null,r!==null?r:we(n.type)||"Memo";case oe:r=n._payload,n=n._init;try{return we(n(r))}catch{}}return null}function xe(n){var r=n.type;switch(n.tag){case 24:return"Cache";case 9:return(r.displayName||"Context")+".Consumer";case 10:return(r._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=r.render,n=n.displayName||n.name||"",r.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return r;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return we(r);case 8:return r===Y?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof r=="function")return r.displayName||r.name||null;if(typeof r=="string")return r}return null}function Ce(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Ue(n){var r=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(r==="checkbox"||r==="radio")}function Qe(n){var r=Ue(n)?"checked":"value",l=Object.getOwnPropertyDescriptor(n.constructor.prototype,r),f=""+n[r];if(!n.hasOwnProperty(r)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var p=l.get,_=l.set;return Object.defineProperty(n,r,{configurable:!0,get:function(){return p.call(this)},set:function(T){f=""+T,_.call(this,T)}}),Object.defineProperty(n,r,{enumerable:l.enumerable}),{getValue:function(){return f},setValue:function(T){f=""+T},stopTracking:function(){n._valueTracker=null,delete n[r]}}}}function Dt(n){n._valueTracker||(n._valueTracker=Qe(n))}function gt(n){if(!n)return!1;var r=n._valueTracker;if(!r)return!0;var l=r.getValue(),f="";return n&&(f=Ue(n)?n.checked?"true":"false":n.value),n=f,n!==l?(r.setValue(n),!0):!1}function Ft(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function j(n,r){var l=r.checked;return se({},r,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:l??n._wrapperState.initialChecked})}function Rn(n,r){var l=r.defaultValue==null?"":r.defaultValue,f=r.checked!=null?r.checked:r.defaultChecked;l=Ce(r.value!=null?r.value:l),n._wrapperState={initialChecked:f,initialValue:l,controlled:r.type==="checkbox"||r.type==="radio"?r.checked!=null:r.value!=null}}function mt(n,r){r=r.checked,r!=null&&C(n,"checked",r,!1)}function dt(n,r){mt(n,r);var l=Ce(r.value),f=r.type;if(l!=null)f==="number"?(l===0&&n.value===""||n.value!=l)&&(n.value=""+l):n.value!==""+l&&(n.value=""+l);else if(f==="submit"||f==="reset"){n.removeAttribute("value");return}r.hasOwnProperty("value")?bt(n,r.type,l):r.hasOwnProperty("defaultValue")&&bt(n,r.type,Ce(r.defaultValue)),r.checked==null&&r.defaultChecked!=null&&(n.defaultChecked=!!r.defaultChecked)}function $e(n,r,l){if(r.hasOwnProperty("value")||r.hasOwnProperty("defaultValue")){var f=r.type;if(!(f!=="submit"&&f!=="reset"||r.value!==void 0&&r.value!==null))return;r=""+n._wrapperState.initialValue,l||r===n.value||(n.value=r),n.defaultValue=r}l=n.name,l!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,l!==""&&(n.name=l)}function bt(n,r,l){(r!=="number"||Ft(n.ownerDocument)!==n)&&(l==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+l&&(n.defaultValue=""+l))}var Ze=Array.isArray;function N(n,r,l,f){if(n=n.options,r){r={};for(var p=0;p<l.length;p++)r["$"+l[p]]=!0;for(l=0;l<n.length;l++)p=r.hasOwnProperty("$"+n[l].value),n[l].selected!==p&&(n[l].selected=p),p&&f&&(n[l].defaultSelected=!0)}else{for(l=""+Ce(l),r=null,p=0;p<n.length;p++){if(n[p].value===l){n[p].selected=!0,f&&(n[p].defaultSelected=!0);return}r!==null||n[p].disabled||(r=n[p])}r!==null&&(r.selected=!0)}}function A(n,r){if(r.dangerouslySetInnerHTML!=null)throw Error(t(91));return se({},r,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function K(n,r){var l=r.value;if(l==null){if(l=r.children,r=r.defaultValue,l!=null){if(r!=null)throw Error(t(92));if(Ze(l)){if(1<l.length)throw Error(t(93));l=l[0]}r=l}r==null&&(r=""),l=r}n._wrapperState={initialValue:Ce(l)}}function me(n,r){var l=Ce(r.value),f=Ce(r.defaultValue);l!=null&&(l=""+l,l!==n.value&&(n.value=l),r.defaultValue==null&&n.defaultValue!==l&&(n.defaultValue=l)),f!=null&&(n.defaultValue=""+f)}function ve(n){var r=n.textContent;r===n._wrapperState.initialValue&&r!==""&&r!==null&&(n.value=r)}function fe(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function We(n,r){return n==null||n==="http://www.w3.org/1999/xhtml"?fe(r):n==="http://www.w3.org/2000/svg"&&r==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Re,Fe=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(r,l,f,p){MSApp.execUnsafeLocalFunction(function(){return n(r,l,f,p)})}:n})(function(n,r){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=r;else{for(Re=Re||document.createElement("div"),Re.innerHTML="<svg>"+r.valueOf().toString()+"</svg>",r=Re.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;r.firstChild;)n.appendChild(r.firstChild)}});function ft(n,r){if(r){var l=n.firstChild;if(l&&l===n.lastChild&&l.nodeType===3){l.nodeValue=r;return}}n.textContent=r}var Me={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ze=["Webkit","ms","Moz","O"];Object.keys(Me).forEach(function(n){ze.forEach(function(r){r=r+n.charAt(0).toUpperCase()+n.substring(1),Me[r]=Me[n]})});function et(n,r,l){return r==null||typeof r=="boolean"||r===""?"":l||typeof r!="number"||r===0||Me.hasOwnProperty(n)&&Me[n]?(""+r).trim():r+"px"}function tt(n,r){n=n.style;for(var l in r)if(r.hasOwnProperty(l)){var f=l.indexOf("--")===0,p=et(l,r[l],f);l==="float"&&(l="cssFloat"),f?n.setProperty(l,p):n[l]=p}}var ke=se({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ht(n,r){if(r){if(ke[n]&&(r.children!=null||r.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(r.dangerouslySetInnerHTML!=null){if(r.children!=null)throw Error(t(60));if(typeof r.dangerouslySetInnerHTML!="object"||!("__html"in r.dangerouslySetInnerHTML))throw Error(t(61))}if(r.style!=null&&typeof r.style!="object")throw Error(t(62))}}function st(n,r){if(n.indexOf("-")===-1)return typeof r.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ct=null;function G(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var be=null,re=null,he=null;function Ie(n){if(n=jo(n)){if(typeof be!="function")throw Error(t(280));var r=n.stateNode;r&&(r=il(r),be(n.stateNode,n.type,r))}}function Le(n){re?he?he.push(n):he=[n]:re=n}function ot(){if(re){var n=re,r=he;if(he=re=null,Ie(n),r)for(n=0;n<r.length;n++)Ie(r[n])}}function zt(n,r){return n(r)}function Qt(){}var xt=!1;function Fn(n,r,l){if(xt)return n(r,l);xt=!0;try{return zt(n,r,l)}finally{xt=!1,(re!==null||he!==null)&&(Qt(),ot())}}function bn(n,r){var l=n.stateNode;if(l===null)return null;var f=il(l);if(f===null)return null;l=f[r];e:switch(r){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(f=!f.disabled)||(n=n.type,f=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!f;break e;default:n=!1}if(n)return null;if(l&&typeof l!="function")throw Error(t(231,r,typeof l));return l}var Ms=!1;if(u)try{var ar={};Object.defineProperty(ar,"passive",{get:function(){Ms=!0}}),window.addEventListener("test",ar,ar),window.removeEventListener("test",ar,ar)}catch{Ms=!1}function ki(n,r,l,f,p,_,T,U,z){var Q=Array.prototype.slice.call(arguments,3);try{r.apply(l,Q)}catch(_e){this.onError(_e)}}var Bi=!1,Hr=null,Gr=!1,lr=null,Oa={onError:function(n){Bi=!0,Hr=n}};function Es(n,r,l,f,p,_,T,U,z){Bi=!1,Hr=null,ki.apply(Oa,arguments)}function za(n,r,l,f,p,_,T,U,z){if(Es.apply(this,arguments),Bi){if(Bi){var Q=Hr;Bi=!1,Hr=null}else throw Error(t(198));Gr||(Gr=!0,lr=Q)}}function Ci(n){var r=n,l=n;if(n.alternate)for(;r.return;)r=r.return;else{n=r;do r=n,(r.flags&4098)!==0&&(l=r.return),n=r.return;while(n)}return r.tag===3?l:null}function ka(n){if(n.tag===13){var r=n.memoizedState;if(r===null&&(n=n.alternate,n!==null&&(r=n.memoizedState)),r!==null)return r.dehydrated}return null}function Ba(n){if(Ci(n)!==n)throw Error(t(188))}function zc(n){var r=n.alternate;if(!r){if(r=Ci(n),r===null)throw Error(t(188));return r!==n?null:n}for(var l=n,f=r;;){var p=l.return;if(p===null)break;var _=p.alternate;if(_===null){if(f=p.return,f!==null){l=f;continue}break}if(p.child===_.child){for(_=p.child;_;){if(_===l)return Ba(p),n;if(_===f)return Ba(p),r;_=_.sibling}throw Error(t(188))}if(l.return!==f.return)l=p,f=_;else{for(var T=!1,U=p.child;U;){if(U===l){T=!0,l=p,f=_;break}if(U===f){T=!0,f=p,l=_;break}U=U.sibling}if(!T){for(U=_.child;U;){if(U===l){T=!0,l=_,f=p;break}if(U===f){T=!0,f=_,l=p;break}U=U.sibling}if(!T)throw Error(t(189))}}if(l.alternate!==f)throw Error(t(190))}if(l.tag!==3)throw Error(t(188));return l.stateNode.current===l?n:r}function R(n){return n=zc(n),n!==null?W(n):null}function W(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var r=W(n);if(r!==null)return r;n=n.sibling}return null}var ee=e.unstable_scheduleCallback,te=e.unstable_cancelCallback,X=e.unstable_shouldYield,Ae=e.unstable_requestPaint,Ee=e.unstable_now,Xe=e.unstable_getCurrentPriorityLevel,He=e.unstable_ImmediatePriority,nt=e.unstable_UserBlockingPriority,rt=e.unstable_NormalPriority,je=e.unstable_LowPriority,_t=e.unstable_IdlePriority,wt=null,vt=null;function vn(n){if(vt&&typeof vt.onCommitFiberRoot=="function")try{vt.onCommitFiberRoot(wt,n,void 0,(n.current.flags&128)===128)}catch{}}var at=Math.clz32?Math.clz32:Mt,qe=Math.log,fi=Math.LN2;function Mt(n){return n>>>=0,n===0?32:31-(qe(n)/fi|0)|0}var _n=64,di=4194304;function en(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ri(n,r){var l=n.pendingLanes;if(l===0)return 0;var f=0,p=n.suspendedLanes,_=n.pingedLanes,T=l&268435455;if(T!==0){var U=T&~p;U!==0?f=en(U):(_&=T,_!==0&&(f=en(_)))}else T=l&~p,T!==0?f=en(T):_!==0&&(f=en(_));if(f===0)return 0;if(r!==0&&r!==f&&(r&p)===0&&(p=f&-f,_=r&-r,p>=_||p===16&&(_&4194240)!==0))return r;if((f&4)!==0&&(f|=l&16),r=n.entangledLanes,r!==0)for(n=n.entanglements,r&=f;0<r;)l=31-at(r),p=1<<l,f|=n[l],r&=~p;return f}function Ut(n,r){switch(n){case 1:case 2:case 4:return r+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return r+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Qn(n,r){for(var l=n.suspendedLanes,f=n.pingedLanes,p=n.expirationTimes,_=n.pendingLanes;0<_;){var T=31-at(_),U=1<<T,z=p[T];z===-1?((U&l)===0||(U&f)!==0)&&(p[T]=Ut(U,r)):z<=r&&(n.expiredLanes|=U),_&=~U}}function Vi(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function Pn(){var n=_n;return _n<<=1,(_n&4194240)===0&&(_n=64),n}function ei(n){for(var r=[],l=0;31>l;l++)r.push(n);return r}function On(n,r,l){n.pendingLanes|=r,r!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,r=31-at(r),n[r]=l}function Va(n,r){var l=n.pendingLanes&~r;n.pendingLanes=r,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=r,n.mutableReadLanes&=r,n.entangledLanes&=r,r=n.entanglements;var f=n.eventTimes;for(n=n.expirationTimes;0<l;){var p=31-at(l),_=1<<p;r[p]=0,f[p]=-1,n[p]=-1,l&=~_}}function kc(n,r){var l=n.entangledLanes|=r;for(n=n.entanglements;l;){var f=31-at(l),p=1<<f;p&r|n[f]&r&&(n[f]|=r),l&=~p}}var Pt=0;function ph(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var mh,Bc,gh,vh,_h,Vc=!1,Ha=[],cr=null,ur=null,fr=null,Po=new Map,Lo=new Map,dr=[],p0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function xh(n,r){switch(n){case"focusin":case"focusout":cr=null;break;case"dragenter":case"dragleave":ur=null;break;case"mouseover":case"mouseout":fr=null;break;case"pointerover":case"pointerout":Po.delete(r.pointerId);break;case"gotpointercapture":case"lostpointercapture":Lo.delete(r.pointerId)}}function Io(n,r,l,f,p,_){return n===null||n.nativeEvent!==_?(n={blockedOn:r,domEventName:l,eventSystemFlags:f,nativeEvent:_,targetContainers:[p]},r!==null&&(r=jo(r),r!==null&&Bc(r)),n):(n.eventSystemFlags|=f,r=n.targetContainers,p!==null&&r.indexOf(p)===-1&&r.push(p),n)}function m0(n,r,l,f,p){switch(r){case"focusin":return cr=Io(cr,n,r,l,f,p),!0;case"dragenter":return ur=Io(ur,n,r,l,f,p),!0;case"mouseover":return fr=Io(fr,n,r,l,f,p),!0;case"pointerover":var _=p.pointerId;return Po.set(_,Io(Po.get(_)||null,n,r,l,f,p)),!0;case"gotpointercapture":return _=p.pointerId,Lo.set(_,Io(Lo.get(_)||null,n,r,l,f,p)),!0}return!1}function yh(n){var r=Wr(n.target);if(r!==null){var l=Ci(r);if(l!==null){if(r=l.tag,r===13){if(r=ka(l),r!==null){n.blockedOn=r,_h(n.priority,function(){gh(l)});return}}else if(r===3&&l.stateNode.current.memoizedState.isDehydrated){n.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Ga(n){if(n.blockedOn!==null)return!1;for(var r=n.targetContainers;0<r.length;){var l=Gc(n.domEventName,n.eventSystemFlags,r[0],n.nativeEvent);if(l===null){l=n.nativeEvent;var f=new l.constructor(l.type,l);Ct=f,l.target.dispatchEvent(f),Ct=null}else return r=jo(l),r!==null&&Bc(r),n.blockedOn=l,!1;r.shift()}return!0}function Sh(n,r,l){Ga(n)&&l.delete(r)}function g0(){Vc=!1,cr!==null&&Ga(cr)&&(cr=null),ur!==null&&Ga(ur)&&(ur=null),fr!==null&&Ga(fr)&&(fr=null),Po.forEach(Sh),Lo.forEach(Sh)}function Do(n,r){n.blockedOn===r&&(n.blockedOn=null,Vc||(Vc=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,g0)))}function No(n){function r(p){return Do(p,n)}if(0<Ha.length){Do(Ha[0],n);for(var l=1;l<Ha.length;l++){var f=Ha[l];f.blockedOn===n&&(f.blockedOn=null)}}for(cr!==null&&Do(cr,n),ur!==null&&Do(ur,n),fr!==null&&Do(fr,n),Po.forEach(r),Lo.forEach(r),l=0;l<dr.length;l++)f=dr[l],f.blockedOn===n&&(f.blockedOn=null);for(;0<dr.length&&(l=dr[0],l.blockedOn===null);)yh(l),l.blockedOn===null&&dr.shift()}var ws=E.ReactCurrentBatchConfig,Wa=!0;function v0(n,r,l,f){var p=Pt,_=ws.transition;ws.transition=null;try{Pt=1,Hc(n,r,l,f)}finally{Pt=p,ws.transition=_}}function _0(n,r,l,f){var p=Pt,_=ws.transition;ws.transition=null;try{Pt=4,Hc(n,r,l,f)}finally{Pt=p,ws.transition=_}}function Hc(n,r,l,f){if(Wa){var p=Gc(n,r,l,f);if(p===null)ou(n,r,f,Xa,l),xh(n,f);else if(m0(p,n,r,l,f))f.stopPropagation();else if(xh(n,f),r&4&&-1<p0.indexOf(n)){for(;p!==null;){var _=jo(p);if(_!==null&&mh(_),_=Gc(n,r,l,f),_===null&&ou(n,r,f,Xa,l),_===p)break;p=_}p!==null&&f.stopPropagation()}else ou(n,r,f,null,l)}}var Xa=null;function Gc(n,r,l,f){if(Xa=null,n=G(f),n=Wr(n),n!==null)if(r=Ci(n),r===null)n=null;else if(l=r.tag,l===13){if(n=ka(r),n!==null)return n;n=null}else if(l===3){if(r.stateNode.current.memoizedState.isDehydrated)return r.tag===3?r.stateNode.containerInfo:null;n=null}else r!==n&&(n=null);return Xa=n,null}function Mh(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Xe()){case He:return 1;case nt:return 4;case rt:case je:return 16;case _t:return 536870912;default:return 16}default:return 16}}var hr=null,Wc=null,ja=null;function Eh(){if(ja)return ja;var n,r=Wc,l=r.length,f,p="value"in hr?hr.value:hr.textContent,_=p.length;for(n=0;n<l&&r[n]===p[n];n++);var T=l-n;for(f=1;f<=T&&r[l-f]===p[_-f];f++);return ja=p.slice(n,1<f?1-f:void 0)}function Ya(n){var r=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&r===13&&(n=13)):n=r,n===10&&(n=13),32<=n||n===13?n:0}function qa(){return!0}function wh(){return!1}function jn(n){function r(l,f,p,_,T){this._reactName=l,this._targetInst=p,this.type=f,this.nativeEvent=_,this.target=T,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(l=n[U],this[U]=l?l(_):_[U]);return this.isDefaultPrevented=(_.defaultPrevented!=null?_.defaultPrevented:_.returnValue===!1)?qa:wh,this.isPropagationStopped=wh,this}return se(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=qa)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=qa)},persist:function(){},isPersistent:qa}),r}var Ts={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Xc=jn(Ts),Uo=se({},Ts,{view:0,detail:0}),x0=jn(Uo),jc,Yc,Fo,Za=se({},Uo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Zc,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Fo&&(Fo&&n.type==="mousemove"?(jc=n.screenX-Fo.screenX,Yc=n.screenY-Fo.screenY):Yc=jc=0,Fo=n),jc)},movementY:function(n){return"movementY"in n?n.movementY:Yc}}),Th=jn(Za),y0=se({},Za,{dataTransfer:0}),S0=jn(y0),M0=se({},Uo,{relatedTarget:0}),qc=jn(M0),E0=se({},Ts,{animationName:0,elapsedTime:0,pseudoElement:0}),w0=jn(E0),T0=se({},Ts,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),A0=jn(T0),C0=se({},Ts,{data:0}),Ah=jn(C0),R0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},b0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},P0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function L0(n){var r=this.nativeEvent;return r.getModifierState?r.getModifierState(n):(n=P0[n])?!!r[n]:!1}function Zc(){return L0}var I0=se({},Uo,{key:function(n){if(n.key){var r=R0[n.key]||n.key;if(r!=="Unidentified")return r}return n.type==="keypress"?(n=Ya(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?b0[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Zc,charCode:function(n){return n.type==="keypress"?Ya(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ya(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),D0=jn(I0),N0=se({},Za,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Ch=jn(N0),U0=se({},Uo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Zc}),F0=jn(U0),O0=se({},Ts,{propertyName:0,elapsedTime:0,pseudoElement:0}),z0=jn(O0),k0=se({},Za,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),B0=jn(k0),V0=[9,13,27,32],$c=u&&"CompositionEvent"in window,Oo=null;u&&"documentMode"in document&&(Oo=document.documentMode);var H0=u&&"TextEvent"in window&&!Oo,Rh=u&&(!$c||Oo&&8<Oo&&11>=Oo),bh=" ",Ph=!1;function Lh(n,r){switch(n){case"keyup":return V0.indexOf(r.keyCode)!==-1;case"keydown":return r.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ih(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var As=!1;function G0(n,r){switch(n){case"compositionend":return Ih(r);case"keypress":return r.which!==32?null:(Ph=!0,bh);case"textInput":return n=r.data,n===bh&&Ph?null:n;default:return null}}function W0(n,r){if(As)return n==="compositionend"||!$c&&Lh(n,r)?(n=Eh(),ja=Wc=hr=null,As=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(r.ctrlKey||r.altKey||r.metaKey)||r.ctrlKey&&r.altKey){if(r.char&&1<r.char.length)return r.char;if(r.which)return String.fromCharCode(r.which)}return null;case"compositionend":return Rh&&r.locale!=="ko"?null:r.data;default:return null}}var X0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Dh(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r==="input"?!!X0[n.type]:r==="textarea"}function Nh(n,r,l,f){Le(f),r=el(r,"onChange"),0<r.length&&(l=new Xc("onChange","change",null,l,f),n.push({event:l,listeners:r}))}var zo=null,ko=null;function j0(n){Jh(n,0)}function $a(n){var r=Ls(n);if(gt(r))return n}function Y0(n,r){if(n==="change")return r}var Uh=!1;if(u){var Kc;if(u){var Jc="oninput"in document;if(!Jc){var Fh=document.createElement("div");Fh.setAttribute("oninput","return;"),Jc=typeof Fh.oninput=="function"}Kc=Jc}else Kc=!1;Uh=Kc&&(!document.documentMode||9<document.documentMode)}function Oh(){zo&&(zo.detachEvent("onpropertychange",zh),ko=zo=null)}function zh(n){if(n.propertyName==="value"&&$a(ko)){var r=[];Nh(r,ko,n,G(n)),Fn(j0,r)}}function q0(n,r,l){n==="focusin"?(Oh(),zo=r,ko=l,zo.attachEvent("onpropertychange",zh)):n==="focusout"&&Oh()}function Z0(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return $a(ko)}function $0(n,r){if(n==="click")return $a(r)}function K0(n,r){if(n==="input"||n==="change")return $a(r)}function J0(n,r){return n===r&&(n!==0||1/n===1/r)||n!==n&&r!==r}var hi=typeof Object.is=="function"?Object.is:J0;function Bo(n,r){if(hi(n,r))return!0;if(typeof n!="object"||n===null||typeof r!="object"||r===null)return!1;var l=Object.keys(n),f=Object.keys(r);if(l.length!==f.length)return!1;for(f=0;f<l.length;f++){var p=l[f];if(!d.call(r,p)||!hi(n[p],r[p]))return!1}return!0}function kh(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function Bh(n,r){var l=kh(n);n=0;for(var f;l;){if(l.nodeType===3){if(f=n+l.textContent.length,n<=r&&f>=r)return{node:l,offset:r-n};n=f}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=kh(l)}}function Vh(n,r){return n&&r?n===r?!0:n&&n.nodeType===3?!1:r&&r.nodeType===3?Vh(n,r.parentNode):"contains"in n?n.contains(r):n.compareDocumentPosition?!!(n.compareDocumentPosition(r)&16):!1:!1}function Hh(){for(var n=window,r=Ft();r instanceof n.HTMLIFrameElement;){try{var l=typeof r.contentWindow.location.href=="string"}catch{l=!1}if(l)n=r.contentWindow;else break;r=Ft(n.document)}return r}function Qc(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r&&(r==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||r==="textarea"||n.contentEditable==="true")}function Q0(n){var r=Hh(),l=n.focusedElem,f=n.selectionRange;if(r!==l&&l&&l.ownerDocument&&Vh(l.ownerDocument.documentElement,l)){if(f!==null&&Qc(l)){if(r=f.start,n=f.end,n===void 0&&(n=r),"selectionStart"in l)l.selectionStart=r,l.selectionEnd=Math.min(n,l.value.length);else if(n=(r=l.ownerDocument||document)&&r.defaultView||window,n.getSelection){n=n.getSelection();var p=l.textContent.length,_=Math.min(f.start,p);f=f.end===void 0?_:Math.min(f.end,p),!n.extend&&_>f&&(p=f,f=_,_=p),p=Bh(l,_);var T=Bh(l,f);p&&T&&(n.rangeCount!==1||n.anchorNode!==p.node||n.anchorOffset!==p.offset||n.focusNode!==T.node||n.focusOffset!==T.offset)&&(r=r.createRange(),r.setStart(p.node,p.offset),n.removeAllRanges(),_>f?(n.addRange(r),n.extend(T.node,T.offset)):(r.setEnd(T.node,T.offset),n.addRange(r)))}}for(r=[],n=l;n=n.parentNode;)n.nodeType===1&&r.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<r.length;l++)n=r[l],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var e_=u&&"documentMode"in document&&11>=document.documentMode,Cs=null,eu=null,Vo=null,tu=!1;function Gh(n,r,l){var f=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;tu||Cs==null||Cs!==Ft(f)||(f=Cs,"selectionStart"in f&&Qc(f)?f={start:f.selectionStart,end:f.selectionEnd}:(f=(f.ownerDocument&&f.ownerDocument.defaultView||window).getSelection(),f={anchorNode:f.anchorNode,anchorOffset:f.anchorOffset,focusNode:f.focusNode,focusOffset:f.focusOffset}),Vo&&Bo(Vo,f)||(Vo=f,f=el(eu,"onSelect"),0<f.length&&(r=new Xc("onSelect","select",null,r,l),n.push({event:r,listeners:f}),r.target=Cs)))}function Ka(n,r){var l={};return l[n.toLowerCase()]=r.toLowerCase(),l["Webkit"+n]="webkit"+r,l["Moz"+n]="moz"+r,l}var Rs={animationend:Ka("Animation","AnimationEnd"),animationiteration:Ka("Animation","AnimationIteration"),animationstart:Ka("Animation","AnimationStart"),transitionend:Ka("Transition","TransitionEnd")},nu={},Wh={};u&&(Wh=document.createElement("div").style,"AnimationEvent"in window||(delete Rs.animationend.animation,delete Rs.animationiteration.animation,delete Rs.animationstart.animation),"TransitionEvent"in window||delete Rs.transitionend.transition);function Ja(n){if(nu[n])return nu[n];if(!Rs[n])return n;var r=Rs[n],l;for(l in r)if(r.hasOwnProperty(l)&&l in Wh)return nu[n]=r[l];return n}var Xh=Ja("animationend"),jh=Ja("animationiteration"),Yh=Ja("animationstart"),qh=Ja("transitionend"),Zh=new Map,$h="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function pr(n,r){Zh.set(n,r),a(r,[n])}for(var iu=0;iu<$h.length;iu++){var ru=$h[iu],t_=ru.toLowerCase(),n_=ru[0].toUpperCase()+ru.slice(1);pr(t_,"on"+n_)}pr(Xh,"onAnimationEnd"),pr(jh,"onAnimationIteration"),pr(Yh,"onAnimationStart"),pr("dblclick","onDoubleClick"),pr("focusin","onFocus"),pr("focusout","onBlur"),pr(qh,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),a("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),a("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),a("onBeforeInput",["compositionend","keypress","textInput","paste"]),a("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ho="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),i_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ho));function Kh(n,r,l){var f=n.type||"unknown-event";n.currentTarget=l,za(f,r,void 0,n),n.currentTarget=null}function Jh(n,r){r=(r&4)!==0;for(var l=0;l<n.length;l++){var f=n[l],p=f.event;f=f.listeners;e:{var _=void 0;if(r)for(var T=f.length-1;0<=T;T--){var U=f[T],z=U.instance,Q=U.currentTarget;if(U=U.listener,z!==_&&p.isPropagationStopped())break e;Kh(p,U,Q),_=z}else for(T=0;T<f.length;T++){if(U=f[T],z=U.instance,Q=U.currentTarget,U=U.listener,z!==_&&p.isPropagationStopped())break e;Kh(p,U,Q),_=z}}}if(Gr)throw n=lr,Gr=!1,lr=null,n}function kt(n,r){var l=r[du];l===void 0&&(l=r[du]=new Set);var f=n+"__bubble";l.has(f)||(Qh(r,n,2,!1),l.add(f))}function su(n,r,l){var f=0;r&&(f|=4),Qh(l,n,f,r)}var Qa="_reactListening"+Math.random().toString(36).slice(2);function Go(n){if(!n[Qa]){n[Qa]=!0,i.forEach(function(l){l!=="selectionchange"&&(i_.has(l)||su(l,!1,n),su(l,!0,n))});var r=n.nodeType===9?n:n.ownerDocument;r===null||r[Qa]||(r[Qa]=!0,su("selectionchange",!1,r))}}function Qh(n,r,l,f){switch(Mh(r)){case 1:var p=v0;break;case 4:p=_0;break;default:p=Hc}l=p.bind(null,r,l,n),p=void 0,!Ms||r!=="touchstart"&&r!=="touchmove"&&r!=="wheel"||(p=!0),f?p!==void 0?n.addEventListener(r,l,{capture:!0,passive:p}):n.addEventListener(r,l,!0):p!==void 0?n.addEventListener(r,l,{passive:p}):n.addEventListener(r,l,!1)}function ou(n,r,l,f,p){var _=f;if((r&1)===0&&(r&2)===0&&f!==null)e:for(;;){if(f===null)return;var T=f.tag;if(T===3||T===4){var U=f.stateNode.containerInfo;if(U===p||U.nodeType===8&&U.parentNode===p)break;if(T===4)for(T=f.return;T!==null;){var z=T.tag;if((z===3||z===4)&&(z=T.stateNode.containerInfo,z===p||z.nodeType===8&&z.parentNode===p))return;T=T.return}for(;U!==null;){if(T=Wr(U),T===null)return;if(z=T.tag,z===5||z===6){f=_=T;continue e}U=U.parentNode}}f=f.return}Fn(function(){var Q=_,_e=G(l),ye=[];e:{var ge=Zh.get(n);if(ge!==void 0){var De=Xc,Ve=n;switch(n){case"keypress":if(Ya(l)===0)break e;case"keydown":case"keyup":De=D0;break;case"focusin":Ve="focus",De=qc;break;case"focusout":Ve="blur",De=qc;break;case"beforeblur":case"afterblur":De=qc;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":De=Th;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":De=S0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":De=F0;break;case Xh:case jh:case Yh:De=w0;break;case qh:De=z0;break;case"scroll":De=x0;break;case"wheel":De=B0;break;case"copy":case"cut":case"paste":De=A0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":De=Ch}var Ge=(r&4)!==0,Zt=!Ge&&n==="scroll",q=Ge?ge!==null?ge+"Capture":null:ge;Ge=[];for(var H=Q,$;H!==null;){$=H;var Te=$.stateNode;if($.tag===5&&Te!==null&&($=Te,q!==null&&(Te=bn(H,q),Te!=null&&Ge.push(Wo(H,Te,$)))),Zt)break;H=H.return}0<Ge.length&&(ge=new De(ge,Ve,null,l,_e),ye.push({event:ge,listeners:Ge}))}}if((r&7)===0){e:{if(ge=n==="mouseover"||n==="pointerover",De=n==="mouseout"||n==="pointerout",ge&&l!==Ct&&(Ve=l.relatedTarget||l.fromElement)&&(Wr(Ve)||Ve[Hi]))break e;if((De||ge)&&(ge=_e.window===_e?_e:(ge=_e.ownerDocument)?ge.defaultView||ge.parentWindow:window,De?(Ve=l.relatedTarget||l.toElement,De=Q,Ve=Ve?Wr(Ve):null,Ve!==null&&(Zt=Ci(Ve),Ve!==Zt||Ve.tag!==5&&Ve.tag!==6)&&(Ve=null)):(De=null,Ve=Q),De!==Ve)){if(Ge=Th,Te="onMouseLeave",q="onMouseEnter",H="mouse",(n==="pointerout"||n==="pointerover")&&(Ge=Ch,Te="onPointerLeave",q="onPointerEnter",H="pointer"),Zt=De==null?ge:Ls(De),$=Ve==null?ge:Ls(Ve),ge=new Ge(Te,H+"leave",De,l,_e),ge.target=Zt,ge.relatedTarget=$,Te=null,Wr(_e)===Q&&(Ge=new Ge(q,H+"enter",Ve,l,_e),Ge.target=$,Ge.relatedTarget=Zt,Te=Ge),Zt=Te,De&&Ve)t:{for(Ge=De,q=Ve,H=0,$=Ge;$;$=bs($))H++;for($=0,Te=q;Te;Te=bs(Te))$++;for(;0<H-$;)Ge=bs(Ge),H--;for(;0<$-H;)q=bs(q),$--;for(;H--;){if(Ge===q||q!==null&&Ge===q.alternate)break t;Ge=bs(Ge),q=bs(q)}Ge=null}else Ge=null;De!==null&&ep(ye,ge,De,Ge,!1),Ve!==null&&Zt!==null&&ep(ye,Zt,Ve,Ge,!0)}}e:{if(ge=Q?Ls(Q):window,De=ge.nodeName&&ge.nodeName.toLowerCase(),De==="select"||De==="input"&&ge.type==="file")var Ye=Y0;else if(Dh(ge))if(Uh)Ye=K0;else{Ye=Z0;var Ke=q0}else(De=ge.nodeName)&&De.toLowerCase()==="input"&&(ge.type==="checkbox"||ge.type==="radio")&&(Ye=$0);if(Ye&&(Ye=Ye(n,Q))){Nh(ye,Ye,l,_e);break e}Ke&&Ke(n,ge,Q),n==="focusout"&&(Ke=ge._wrapperState)&&Ke.controlled&&ge.type==="number"&&bt(ge,"number",ge.value)}switch(Ke=Q?Ls(Q):window,n){case"focusin":(Dh(Ke)||Ke.contentEditable==="true")&&(Cs=Ke,eu=Q,Vo=null);break;case"focusout":Vo=eu=Cs=null;break;case"mousedown":tu=!0;break;case"contextmenu":case"mouseup":case"dragend":tu=!1,Gh(ye,l,_e);break;case"selectionchange":if(e_)break;case"keydown":case"keyup":Gh(ye,l,_e)}var Je;if($c)e:{switch(n){case"compositionstart":var it="onCompositionStart";break e;case"compositionend":it="onCompositionEnd";break e;case"compositionupdate":it="onCompositionUpdate";break e}it=void 0}else As?Lh(n,l)&&(it="onCompositionEnd"):n==="keydown"&&l.keyCode===229&&(it="onCompositionStart");it&&(Rh&&l.locale!=="ko"&&(As||it!=="onCompositionStart"?it==="onCompositionEnd"&&As&&(Je=Eh()):(hr=_e,Wc="value"in hr?hr.value:hr.textContent,As=!0)),Ke=el(Q,it),0<Ke.length&&(it=new Ah(it,n,null,l,_e),ye.push({event:it,listeners:Ke}),Je?it.data=Je:(Je=Ih(l),Je!==null&&(it.data=Je)))),(Je=H0?G0(n,l):W0(n,l))&&(Q=el(Q,"onBeforeInput"),0<Q.length&&(_e=new Ah("onBeforeInput","beforeinput",null,l,_e),ye.push({event:_e,listeners:Q}),_e.data=Je))}Jh(ye,r)})}function Wo(n,r,l){return{instance:n,listener:r,currentTarget:l}}function el(n,r){for(var l=r+"Capture",f=[];n!==null;){var p=n,_=p.stateNode;p.tag===5&&_!==null&&(p=_,_=bn(n,l),_!=null&&f.unshift(Wo(n,_,p)),_=bn(n,r),_!=null&&f.push(Wo(n,_,p))),n=n.return}return f}function bs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function ep(n,r,l,f,p){for(var _=r._reactName,T=[];l!==null&&l!==f;){var U=l,z=U.alternate,Q=U.stateNode;if(z!==null&&z===f)break;U.tag===5&&Q!==null&&(U=Q,p?(z=bn(l,_),z!=null&&T.unshift(Wo(l,z,U))):p||(z=bn(l,_),z!=null&&T.push(Wo(l,z,U)))),l=l.return}T.length!==0&&n.push({event:r,listeners:T})}var r_=/\r\n?/g,s_=/\u0000|\uFFFD/g;function tp(n){return(typeof n=="string"?n:""+n).replace(r_,`
`).replace(s_,"")}function tl(n,r,l){if(r=tp(r),tp(n)!==r&&l)throw Error(t(425))}function nl(){}var au=null,lu=null;function cu(n,r){return n==="textarea"||n==="noscript"||typeof r.children=="string"||typeof r.children=="number"||typeof r.dangerouslySetInnerHTML=="object"&&r.dangerouslySetInnerHTML!==null&&r.dangerouslySetInnerHTML.__html!=null}var uu=typeof setTimeout=="function"?setTimeout:void 0,o_=typeof clearTimeout=="function"?clearTimeout:void 0,np=typeof Promise=="function"?Promise:void 0,a_=typeof queueMicrotask=="function"?queueMicrotask:typeof np<"u"?function(n){return np.resolve(null).then(n).catch(l_)}:uu;function l_(n){setTimeout(function(){throw n})}function fu(n,r){var l=r,f=0;do{var p=l.nextSibling;if(n.removeChild(l),p&&p.nodeType===8)if(l=p.data,l==="/$"){if(f===0){n.removeChild(p),No(r);return}f--}else l!=="$"&&l!=="$?"&&l!=="$!"||f++;l=p}while(l);No(r)}function mr(n){for(;n!=null;n=n.nextSibling){var r=n.nodeType;if(r===1||r===3)break;if(r===8){if(r=n.data,r==="$"||r==="$!"||r==="$?")break;if(r==="/$")return null}}return n}function ip(n){n=n.previousSibling;for(var r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="$"||l==="$!"||l==="$?"){if(r===0)return n;r--}else l==="/$"&&r++}n=n.previousSibling}return null}var Ps=Math.random().toString(36).slice(2),bi="__reactFiber$"+Ps,Xo="__reactProps$"+Ps,Hi="__reactContainer$"+Ps,du="__reactEvents$"+Ps,c_="__reactListeners$"+Ps,u_="__reactHandles$"+Ps;function Wr(n){var r=n[bi];if(r)return r;for(var l=n.parentNode;l;){if(r=l[Hi]||l[bi]){if(l=r.alternate,r.child!==null||l!==null&&l.child!==null)for(n=ip(n);n!==null;){if(l=n[bi])return l;n=ip(n)}return r}n=l,l=n.parentNode}return null}function jo(n){return n=n[bi]||n[Hi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Ls(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function il(n){return n[Xo]||null}var hu=[],Is=-1;function gr(n){return{current:n}}function Bt(n){0>Is||(n.current=hu[Is],hu[Is]=null,Is--)}function Ot(n,r){Is++,hu[Is]=n.current,n.current=r}var vr={},xn=gr(vr),zn=gr(!1),Xr=vr;function Ds(n,r){var l=n.type.contextTypes;if(!l)return vr;var f=n.stateNode;if(f&&f.__reactInternalMemoizedUnmaskedChildContext===r)return f.__reactInternalMemoizedMaskedChildContext;var p={},_;for(_ in l)p[_]=r[_];return f&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=p),p}function kn(n){return n=n.childContextTypes,n!=null}function rl(){Bt(zn),Bt(xn)}function rp(n,r,l){if(xn.current!==vr)throw Error(t(168));Ot(xn,r),Ot(zn,l)}function sp(n,r,l){var f=n.stateNode;if(r=r.childContextTypes,typeof f.getChildContext!="function")return l;f=f.getChildContext();for(var p in f)if(!(p in r))throw Error(t(108,xe(n)||"Unknown",p));return se({},l,f)}function sl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||vr,Xr=xn.current,Ot(xn,n),Ot(zn,zn.current),!0}function op(n,r,l){var f=n.stateNode;if(!f)throw Error(t(169));l?(n=sp(n,r,Xr),f.__reactInternalMemoizedMergedChildContext=n,Bt(zn),Bt(xn),Ot(xn,n)):Bt(zn),Ot(zn,l)}var Gi=null,ol=!1,pu=!1;function ap(n){Gi===null?Gi=[n]:Gi.push(n)}function f_(n){ol=!0,ap(n)}function _r(){if(!pu&&Gi!==null){pu=!0;var n=0,r=Pt;try{var l=Gi;for(Pt=1;n<l.length;n++){var f=l[n];do f=f(!0);while(f!==null)}Gi=null,ol=!1}catch(p){throw Gi!==null&&(Gi=Gi.slice(n+1)),ee(He,_r),p}finally{Pt=r,pu=!1}}return null}var Ns=[],Us=0,al=null,ll=0,ti=[],ni=0,jr=null,Wi=1,Xi="";function Yr(n,r){Ns[Us++]=ll,Ns[Us++]=al,al=n,ll=r}function lp(n,r,l){ti[ni++]=Wi,ti[ni++]=Xi,ti[ni++]=jr,jr=n;var f=Wi;n=Xi;var p=32-at(f)-1;f&=~(1<<p),l+=1;var _=32-at(r)+p;if(30<_){var T=p-p%5;_=(f&(1<<T)-1).toString(32),f>>=T,p-=T,Wi=1<<32-at(r)+p|l<<p|f,Xi=_+n}else Wi=1<<_|l<<p|f,Xi=n}function mu(n){n.return!==null&&(Yr(n,1),lp(n,1,0))}function gu(n){for(;n===al;)al=Ns[--Us],Ns[Us]=null,ll=Ns[--Us],Ns[Us]=null;for(;n===jr;)jr=ti[--ni],ti[ni]=null,Xi=ti[--ni],ti[ni]=null,Wi=ti[--ni],ti[ni]=null}var Yn=null,qn=null,Vt=!1,pi=null;function cp(n,r){var l=oi(5,null,null,0);l.elementType="DELETED",l.stateNode=r,l.return=n,r=n.deletions,r===null?(n.deletions=[l],n.flags|=16):r.push(l)}function up(n,r){switch(n.tag){case 5:var l=n.type;return r=r.nodeType!==1||l.toLowerCase()!==r.nodeName.toLowerCase()?null:r,r!==null?(n.stateNode=r,Yn=n,qn=mr(r.firstChild),!0):!1;case 6:return r=n.pendingProps===""||r.nodeType!==3?null:r,r!==null?(n.stateNode=r,Yn=n,qn=null,!0):!1;case 13:return r=r.nodeType!==8?null:r,r!==null?(l=jr!==null?{id:Wi,overflow:Xi}:null,n.memoizedState={dehydrated:r,treeContext:l,retryLane:1073741824},l=oi(18,null,null,0),l.stateNode=r,l.return=n,n.child=l,Yn=n,qn=null,!0):!1;default:return!1}}function vu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function _u(n){if(Vt){var r=qn;if(r){var l=r;if(!up(n,r)){if(vu(n))throw Error(t(418));r=mr(l.nextSibling);var f=Yn;r&&up(n,r)?cp(f,l):(n.flags=n.flags&-4097|2,Vt=!1,Yn=n)}}else{if(vu(n))throw Error(t(418));n.flags=n.flags&-4097|2,Vt=!1,Yn=n}}}function fp(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Yn=n}function cl(n){if(n!==Yn)return!1;if(!Vt)return fp(n),Vt=!0,!1;var r;if((r=n.tag!==3)&&!(r=n.tag!==5)&&(r=n.type,r=r!=="head"&&r!=="body"&&!cu(n.type,n.memoizedProps)),r&&(r=qn)){if(vu(n))throw dp(),Error(t(418));for(;r;)cp(n,r),r=mr(r.nextSibling)}if(fp(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="/$"){if(r===0){qn=mr(n.nextSibling);break e}r--}else l!=="$"&&l!=="$!"&&l!=="$?"||r++}n=n.nextSibling}qn=null}}else qn=Yn?mr(n.stateNode.nextSibling):null;return!0}function dp(){for(var n=qn;n;)n=mr(n.nextSibling)}function Fs(){qn=Yn=null,Vt=!1}function xu(n){pi===null?pi=[n]:pi.push(n)}var d_=E.ReactCurrentBatchConfig;function Yo(n,r,l){if(n=l.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(l._owner){if(l=l._owner,l){if(l.tag!==1)throw Error(t(309));var f=l.stateNode}if(!f)throw Error(t(147,n));var p=f,_=""+n;return r!==null&&r.ref!==null&&typeof r.ref=="function"&&r.ref._stringRef===_?r.ref:(r=function(T){var U=p.refs;T===null?delete U[_]:U[_]=T},r._stringRef=_,r)}if(typeof n!="string")throw Error(t(284));if(!l._owner)throw Error(t(290,n))}return n}function ul(n,r){throw n=Object.prototype.toString.call(r),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(r).join(", ")+"}":n))}function hp(n){var r=n._init;return r(n._payload)}function pp(n){function r(q,H){if(n){var $=q.deletions;$===null?(q.deletions=[H],q.flags|=16):$.push(H)}}function l(q,H){if(!n)return null;for(;H!==null;)r(q,H),H=H.sibling;return null}function f(q,H){for(q=new Map;H!==null;)H.key!==null?q.set(H.key,H):q.set(H.index,H),H=H.sibling;return q}function p(q,H){return q=Ar(q,H),q.index=0,q.sibling=null,q}function _(q,H,$){return q.index=$,n?($=q.alternate,$!==null?($=$.index,$<H?(q.flags|=2,H):$):(q.flags|=2,H)):(q.flags|=1048576,H)}function T(q){return n&&q.alternate===null&&(q.flags|=2),q}function U(q,H,$,Te){return H===null||H.tag!==6?(H=ff($,q.mode,Te),H.return=q,H):(H=p(H,$),H.return=q,H)}function z(q,H,$,Te){var Ye=$.type;return Ye===O?_e(q,H,$.props.children,Te,$.key):H!==null&&(H.elementType===Ye||typeof Ye=="object"&&Ye!==null&&Ye.$$typeof===oe&&hp(Ye)===H.type)?(Te=p(H,$.props),Te.ref=Yo(q,H,$),Te.return=q,Te):(Te=Nl($.type,$.key,$.props,null,q.mode,Te),Te.ref=Yo(q,H,$),Te.return=q,Te)}function Q(q,H,$,Te){return H===null||H.tag!==4||H.stateNode.containerInfo!==$.containerInfo||H.stateNode.implementation!==$.implementation?(H=df($,q.mode,Te),H.return=q,H):(H=p(H,$.children||[]),H.return=q,H)}function _e(q,H,$,Te,Ye){return H===null||H.tag!==7?(H=ts($,q.mode,Te,Ye),H.return=q,H):(H=p(H,$),H.return=q,H)}function ye(q,H,$){if(typeof H=="string"&&H!==""||typeof H=="number")return H=ff(""+H,q.mode,$),H.return=q,H;if(typeof H=="object"&&H!==null){switch(H.$$typeof){case Z:return $=Nl(H.type,H.key,H.props,null,q.mode,$),$.ref=Yo(q,null,H),$.return=q,$;case D:return H=df(H,q.mode,$),H.return=q,H;case oe:var Te=H._init;return ye(q,Te(H._payload),$)}if(Ze(H)||le(H))return H=ts(H,q.mode,$,null),H.return=q,H;ul(q,H)}return null}function ge(q,H,$,Te){var Ye=H!==null?H.key:null;if(typeof $=="string"&&$!==""||typeof $=="number")return Ye!==null?null:U(q,H,""+$,Te);if(typeof $=="object"&&$!==null){switch($.$$typeof){case Z:return $.key===Ye?z(q,H,$,Te):null;case D:return $.key===Ye?Q(q,H,$,Te):null;case oe:return Ye=$._init,ge(q,H,Ye($._payload),Te)}if(Ze($)||le($))return Ye!==null?null:_e(q,H,$,Te,null);ul(q,$)}return null}function De(q,H,$,Te,Ye){if(typeof Te=="string"&&Te!==""||typeof Te=="number")return q=q.get($)||null,U(H,q,""+Te,Ye);if(typeof Te=="object"&&Te!==null){switch(Te.$$typeof){case Z:return q=q.get(Te.key===null?$:Te.key)||null,z(H,q,Te,Ye);case D:return q=q.get(Te.key===null?$:Te.key)||null,Q(H,q,Te,Ye);case oe:var Ke=Te._init;return De(q,H,$,Ke(Te._payload),Ye)}if(Ze(Te)||le(Te))return q=q.get($)||null,_e(H,q,Te,Ye,null);ul(H,Te)}return null}function Ve(q,H,$,Te){for(var Ye=null,Ke=null,Je=H,it=H=0,ln=null;Je!==null&&it<$.length;it++){Je.index>it?(ln=Je,Je=null):ln=Je.sibling;var Et=ge(q,Je,$[it],Te);if(Et===null){Je===null&&(Je=ln);break}n&&Je&&Et.alternate===null&&r(q,Je),H=_(Et,H,it),Ke===null?Ye=Et:Ke.sibling=Et,Ke=Et,Je=ln}if(it===$.length)return l(q,Je),Vt&&Yr(q,it),Ye;if(Je===null){for(;it<$.length;it++)Je=ye(q,$[it],Te),Je!==null&&(H=_(Je,H,it),Ke===null?Ye=Je:Ke.sibling=Je,Ke=Je);return Vt&&Yr(q,it),Ye}for(Je=f(q,Je);it<$.length;it++)ln=De(Je,q,it,$[it],Te),ln!==null&&(n&&ln.alternate!==null&&Je.delete(ln.key===null?it:ln.key),H=_(ln,H,it),Ke===null?Ye=ln:Ke.sibling=ln,Ke=ln);return n&&Je.forEach(function(Cr){return r(q,Cr)}),Vt&&Yr(q,it),Ye}function Ge(q,H,$,Te){var Ye=le($);if(typeof Ye!="function")throw Error(t(150));if($=Ye.call($),$==null)throw Error(t(151));for(var Ke=Ye=null,Je=H,it=H=0,ln=null,Et=$.next();Je!==null&&!Et.done;it++,Et=$.next()){Je.index>it?(ln=Je,Je=null):ln=Je.sibling;var Cr=ge(q,Je,Et.value,Te);if(Cr===null){Je===null&&(Je=ln);break}n&&Je&&Cr.alternate===null&&r(q,Je),H=_(Cr,H,it),Ke===null?Ye=Cr:Ke.sibling=Cr,Ke=Cr,Je=ln}if(Et.done)return l(q,Je),Vt&&Yr(q,it),Ye;if(Je===null){for(;!Et.done;it++,Et=$.next())Et=ye(q,Et.value,Te),Et!==null&&(H=_(Et,H,it),Ke===null?Ye=Et:Ke.sibling=Et,Ke=Et);return Vt&&Yr(q,it),Ye}for(Je=f(q,Je);!Et.done;it++,Et=$.next())Et=De(Je,q,it,Et.value,Te),Et!==null&&(n&&Et.alternate!==null&&Je.delete(Et.key===null?it:Et.key),H=_(Et,H,it),Ke===null?Ye=Et:Ke.sibling=Et,Ke=Et);return n&&Je.forEach(function(X_){return r(q,X_)}),Vt&&Yr(q,it),Ye}function Zt(q,H,$,Te){if(typeof $=="object"&&$!==null&&$.type===O&&$.key===null&&($=$.props.children),typeof $=="object"&&$!==null){switch($.$$typeof){case Z:e:{for(var Ye=$.key,Ke=H;Ke!==null;){if(Ke.key===Ye){if(Ye=$.type,Ye===O){if(Ke.tag===7){l(q,Ke.sibling),H=p(Ke,$.props.children),H.return=q,q=H;break e}}else if(Ke.elementType===Ye||typeof Ye=="object"&&Ye!==null&&Ye.$$typeof===oe&&hp(Ye)===Ke.type){l(q,Ke.sibling),H=p(Ke,$.props),H.ref=Yo(q,Ke,$),H.return=q,q=H;break e}l(q,Ke);break}else r(q,Ke);Ke=Ke.sibling}$.type===O?(H=ts($.props.children,q.mode,Te,$.key),H.return=q,q=H):(Te=Nl($.type,$.key,$.props,null,q.mode,Te),Te.ref=Yo(q,H,$),Te.return=q,q=Te)}return T(q);case D:e:{for(Ke=$.key;H!==null;){if(H.key===Ke)if(H.tag===4&&H.stateNode.containerInfo===$.containerInfo&&H.stateNode.implementation===$.implementation){l(q,H.sibling),H=p(H,$.children||[]),H.return=q,q=H;break e}else{l(q,H);break}else r(q,H);H=H.sibling}H=df($,q.mode,Te),H.return=q,q=H}return T(q);case oe:return Ke=$._init,Zt(q,H,Ke($._payload),Te)}if(Ze($))return Ve(q,H,$,Te);if(le($))return Ge(q,H,$,Te);ul(q,$)}return typeof $=="string"&&$!==""||typeof $=="number"?($=""+$,H!==null&&H.tag===6?(l(q,H.sibling),H=p(H,$),H.return=q,q=H):(l(q,H),H=ff($,q.mode,Te),H.return=q,q=H),T(q)):l(q,H)}return Zt}var Os=pp(!0),mp=pp(!1),fl=gr(null),dl=null,zs=null,yu=null;function Su(){yu=zs=dl=null}function Mu(n){var r=fl.current;Bt(fl),n._currentValue=r}function Eu(n,r,l){for(;n!==null;){var f=n.alternate;if((n.childLanes&r)!==r?(n.childLanes|=r,f!==null&&(f.childLanes|=r)):f!==null&&(f.childLanes&r)!==r&&(f.childLanes|=r),n===l)break;n=n.return}}function ks(n,r){dl=n,yu=zs=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&r)!==0&&(Bn=!0),n.firstContext=null)}function ii(n){var r=n._currentValue;if(yu!==n)if(n={context:n,memoizedValue:r,next:null},zs===null){if(dl===null)throw Error(t(308));zs=n,dl.dependencies={lanes:0,firstContext:n}}else zs=zs.next=n;return r}var qr=null;function wu(n){qr===null?qr=[n]:qr.push(n)}function gp(n,r,l,f){var p=r.interleaved;return p===null?(l.next=l,wu(r)):(l.next=p.next,p.next=l),r.interleaved=l,ji(n,f)}function ji(n,r){n.lanes|=r;var l=n.alternate;for(l!==null&&(l.lanes|=r),l=n,n=n.return;n!==null;)n.childLanes|=r,l=n.alternate,l!==null&&(l.childLanes|=r),l=n,n=n.return;return l.tag===3?l.stateNode:null}var xr=!1;function Tu(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function vp(n,r){n=n.updateQueue,r.updateQueue===n&&(r.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Yi(n,r){return{eventTime:n,lane:r,tag:0,payload:null,callback:null,next:null}}function yr(n,r,l){var f=n.updateQueue;if(f===null)return null;if(f=f.shared,(yt&2)!==0){var p=f.pending;return p===null?r.next=r:(r.next=p.next,p.next=r),f.pending=r,ji(n,l)}return p=f.interleaved,p===null?(r.next=r,wu(f)):(r.next=p.next,p.next=r),f.interleaved=r,ji(n,l)}function hl(n,r,l){if(r=r.updateQueue,r!==null&&(r=r.shared,(l&4194240)!==0)){var f=r.lanes;f&=n.pendingLanes,l|=f,r.lanes=l,kc(n,l)}}function _p(n,r){var l=n.updateQueue,f=n.alternate;if(f!==null&&(f=f.updateQueue,l===f)){var p=null,_=null;if(l=l.firstBaseUpdate,l!==null){do{var T={eventTime:l.eventTime,lane:l.lane,tag:l.tag,payload:l.payload,callback:l.callback,next:null};_===null?p=_=T:_=_.next=T,l=l.next}while(l!==null);_===null?p=_=r:_=_.next=r}else p=_=r;l={baseState:f.baseState,firstBaseUpdate:p,lastBaseUpdate:_,shared:f.shared,effects:f.effects},n.updateQueue=l;return}n=l.lastBaseUpdate,n===null?l.firstBaseUpdate=r:n.next=r,l.lastBaseUpdate=r}function pl(n,r,l,f){var p=n.updateQueue;xr=!1;var _=p.firstBaseUpdate,T=p.lastBaseUpdate,U=p.shared.pending;if(U!==null){p.shared.pending=null;var z=U,Q=z.next;z.next=null,T===null?_=Q:T.next=Q,T=z;var _e=n.alternate;_e!==null&&(_e=_e.updateQueue,U=_e.lastBaseUpdate,U!==T&&(U===null?_e.firstBaseUpdate=Q:U.next=Q,_e.lastBaseUpdate=z))}if(_!==null){var ye=p.baseState;T=0,_e=Q=z=null,U=_;do{var ge=U.lane,De=U.eventTime;if((f&ge)===ge){_e!==null&&(_e=_e.next={eventTime:De,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var Ve=n,Ge=U;switch(ge=r,De=l,Ge.tag){case 1:if(Ve=Ge.payload,typeof Ve=="function"){ye=Ve.call(De,ye,ge);break e}ye=Ve;break e;case 3:Ve.flags=Ve.flags&-65537|128;case 0:if(Ve=Ge.payload,ge=typeof Ve=="function"?Ve.call(De,ye,ge):Ve,ge==null)break e;ye=se({},ye,ge);break e;case 2:xr=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,ge=p.effects,ge===null?p.effects=[U]:ge.push(U))}else De={eventTime:De,lane:ge,tag:U.tag,payload:U.payload,callback:U.callback,next:null},_e===null?(Q=_e=De,z=ye):_e=_e.next=De,T|=ge;if(U=U.next,U===null){if(U=p.shared.pending,U===null)break;ge=U,U=ge.next,ge.next=null,p.lastBaseUpdate=ge,p.shared.pending=null}}while(!0);if(_e===null&&(z=ye),p.baseState=z,p.firstBaseUpdate=Q,p.lastBaseUpdate=_e,r=p.shared.interleaved,r!==null){p=r;do T|=p.lane,p=p.next;while(p!==r)}else _===null&&(p.shared.lanes=0);Kr|=T,n.lanes=T,n.memoizedState=ye}}function xp(n,r,l){if(n=r.effects,r.effects=null,n!==null)for(r=0;r<n.length;r++){var f=n[r],p=f.callback;if(p!==null){if(f.callback=null,f=l,typeof p!="function")throw Error(t(191,p));p.call(f)}}}var qo={},Pi=gr(qo),Zo=gr(qo),$o=gr(qo);function Zr(n){if(n===qo)throw Error(t(174));return n}function Au(n,r){switch(Ot($o,r),Ot(Zo,n),Ot(Pi,qo),n=r.nodeType,n){case 9:case 11:r=(r=r.documentElement)?r.namespaceURI:We(null,"");break;default:n=n===8?r.parentNode:r,r=n.namespaceURI||null,n=n.tagName,r=We(r,n)}Bt(Pi),Ot(Pi,r)}function Bs(){Bt(Pi),Bt(Zo),Bt($o)}function yp(n){Zr($o.current);var r=Zr(Pi.current),l=We(r,n.type);r!==l&&(Ot(Zo,n),Ot(Pi,l))}function Cu(n){Zo.current===n&&(Bt(Pi),Bt(Zo))}var Ht=gr(0);function ml(n){for(var r=n;r!==null;){if(r.tag===13){var l=r.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||l.data==="$?"||l.data==="$!"))return r}else if(r.tag===19&&r.memoizedProps.revealOrder!==void 0){if((r.flags&128)!==0)return r}else if(r.child!==null){r.child.return=r,r=r.child;continue}if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return null;r=r.return}r.sibling.return=r.return,r=r.sibling}return null}var Ru=[];function bu(){for(var n=0;n<Ru.length;n++)Ru[n]._workInProgressVersionPrimary=null;Ru.length=0}var gl=E.ReactCurrentDispatcher,Pu=E.ReactCurrentBatchConfig,$r=0,Gt=null,tn=null,on=null,vl=!1,Ko=!1,Jo=0,h_=0;function yn(){throw Error(t(321))}function Lu(n,r){if(r===null)return!1;for(var l=0;l<r.length&&l<n.length;l++)if(!hi(n[l],r[l]))return!1;return!0}function Iu(n,r,l,f,p,_){if($r=_,Gt=r,r.memoizedState=null,r.updateQueue=null,r.lanes=0,gl.current=n===null||n.memoizedState===null?v_:__,n=l(f,p),Ko){_=0;do{if(Ko=!1,Jo=0,25<=_)throw Error(t(301));_+=1,on=tn=null,r.updateQueue=null,gl.current=x_,n=l(f,p)}while(Ko)}if(gl.current=yl,r=tn!==null&&tn.next!==null,$r=0,on=tn=Gt=null,vl=!1,r)throw Error(t(300));return n}function Du(){var n=Jo!==0;return Jo=0,n}function Li(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return on===null?Gt.memoizedState=on=n:on=on.next=n,on}function ri(){if(tn===null){var n=Gt.alternate;n=n!==null?n.memoizedState:null}else n=tn.next;var r=on===null?Gt.memoizedState:on.next;if(r!==null)on=r,tn=n;else{if(n===null)throw Error(t(310));tn=n,n={memoizedState:tn.memoizedState,baseState:tn.baseState,baseQueue:tn.baseQueue,queue:tn.queue,next:null},on===null?Gt.memoizedState=on=n:on=on.next=n}return on}function Qo(n,r){return typeof r=="function"?r(n):r}function Nu(n){var r=ri(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var f=tn,p=f.baseQueue,_=l.pending;if(_!==null){if(p!==null){var T=p.next;p.next=_.next,_.next=T}f.baseQueue=p=_,l.pending=null}if(p!==null){_=p.next,f=f.baseState;var U=T=null,z=null,Q=_;do{var _e=Q.lane;if(($r&_e)===_e)z!==null&&(z=z.next={lane:0,action:Q.action,hasEagerState:Q.hasEagerState,eagerState:Q.eagerState,next:null}),f=Q.hasEagerState?Q.eagerState:n(f,Q.action);else{var ye={lane:_e,action:Q.action,hasEagerState:Q.hasEagerState,eagerState:Q.eagerState,next:null};z===null?(U=z=ye,T=f):z=z.next=ye,Gt.lanes|=_e,Kr|=_e}Q=Q.next}while(Q!==null&&Q!==_);z===null?T=f:z.next=U,hi(f,r.memoizedState)||(Bn=!0),r.memoizedState=f,r.baseState=T,r.baseQueue=z,l.lastRenderedState=f}if(n=l.interleaved,n!==null){p=n;do _=p.lane,Gt.lanes|=_,Kr|=_,p=p.next;while(p!==n)}else p===null&&(l.lanes=0);return[r.memoizedState,l.dispatch]}function Uu(n){var r=ri(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var f=l.dispatch,p=l.pending,_=r.memoizedState;if(p!==null){l.pending=null;var T=p=p.next;do _=n(_,T.action),T=T.next;while(T!==p);hi(_,r.memoizedState)||(Bn=!0),r.memoizedState=_,r.baseQueue===null&&(r.baseState=_),l.lastRenderedState=_}return[_,f]}function Sp(){}function Mp(n,r){var l=Gt,f=ri(),p=r(),_=!hi(f.memoizedState,p);if(_&&(f.memoizedState=p,Bn=!0),f=f.queue,Fu(Tp.bind(null,l,f,n),[n]),f.getSnapshot!==r||_||on!==null&&on.memoizedState.tag&1){if(l.flags|=2048,ea(9,wp.bind(null,l,f,p,r),void 0,null),an===null)throw Error(t(349));($r&30)!==0||Ep(l,r,p)}return p}function Ep(n,r,l){n.flags|=16384,n={getSnapshot:r,value:l},r=Gt.updateQueue,r===null?(r={lastEffect:null,stores:null},Gt.updateQueue=r,r.stores=[n]):(l=r.stores,l===null?r.stores=[n]:l.push(n))}function wp(n,r,l,f){r.value=l,r.getSnapshot=f,Ap(r)&&Cp(n)}function Tp(n,r,l){return l(function(){Ap(r)&&Cp(n)})}function Ap(n){var r=n.getSnapshot;n=n.value;try{var l=r();return!hi(n,l)}catch{return!0}}function Cp(n){var r=ji(n,1);r!==null&&_i(r,n,1,-1)}function Rp(n){var r=Li();return typeof n=="function"&&(n=n()),r.memoizedState=r.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Qo,lastRenderedState:n},r.queue=n,n=n.dispatch=g_.bind(null,Gt,n),[r.memoizedState,n]}function ea(n,r,l,f){return n={tag:n,create:r,destroy:l,deps:f,next:null},r=Gt.updateQueue,r===null?(r={lastEffect:null,stores:null},Gt.updateQueue=r,r.lastEffect=n.next=n):(l=r.lastEffect,l===null?r.lastEffect=n.next=n:(f=l.next,l.next=n,n.next=f,r.lastEffect=n)),n}function bp(){return ri().memoizedState}function _l(n,r,l,f){var p=Li();Gt.flags|=n,p.memoizedState=ea(1|r,l,void 0,f===void 0?null:f)}function xl(n,r,l,f){var p=ri();f=f===void 0?null:f;var _=void 0;if(tn!==null){var T=tn.memoizedState;if(_=T.destroy,f!==null&&Lu(f,T.deps)){p.memoizedState=ea(r,l,_,f);return}}Gt.flags|=n,p.memoizedState=ea(1|r,l,_,f)}function Pp(n,r){return _l(8390656,8,n,r)}function Fu(n,r){return xl(2048,8,n,r)}function Lp(n,r){return xl(4,2,n,r)}function Ip(n,r){return xl(4,4,n,r)}function Dp(n,r){if(typeof r=="function")return n=n(),r(n),function(){r(null)};if(r!=null)return n=n(),r.current=n,function(){r.current=null}}function Np(n,r,l){return l=l!=null?l.concat([n]):null,xl(4,4,Dp.bind(null,r,n),l)}function Ou(){}function Up(n,r){var l=ri();r=r===void 0?null:r;var f=l.memoizedState;return f!==null&&r!==null&&Lu(r,f[1])?f[0]:(l.memoizedState=[n,r],n)}function Fp(n,r){var l=ri();r=r===void 0?null:r;var f=l.memoizedState;return f!==null&&r!==null&&Lu(r,f[1])?f[0]:(n=n(),l.memoizedState=[n,r],n)}function Op(n,r,l){return($r&21)===0?(n.baseState&&(n.baseState=!1,Bn=!0),n.memoizedState=l):(hi(l,r)||(l=Pn(),Gt.lanes|=l,Kr|=l,n.baseState=!0),r)}function p_(n,r){var l=Pt;Pt=l!==0&&4>l?l:4,n(!0);var f=Pu.transition;Pu.transition={};try{n(!1),r()}finally{Pt=l,Pu.transition=f}}function zp(){return ri().memoizedState}function m_(n,r,l){var f=wr(n);if(l={lane:f,action:l,hasEagerState:!1,eagerState:null,next:null},kp(n))Bp(r,l);else if(l=gp(n,r,l,f),l!==null){var p=In();_i(l,n,f,p),Vp(l,r,f)}}function g_(n,r,l){var f=wr(n),p={lane:f,action:l,hasEagerState:!1,eagerState:null,next:null};if(kp(n))Bp(r,p);else{var _=n.alternate;if(n.lanes===0&&(_===null||_.lanes===0)&&(_=r.lastRenderedReducer,_!==null))try{var T=r.lastRenderedState,U=_(T,l);if(p.hasEagerState=!0,p.eagerState=U,hi(U,T)){var z=r.interleaved;z===null?(p.next=p,wu(r)):(p.next=z.next,z.next=p),r.interleaved=p;return}}catch{}finally{}l=gp(n,r,p,f),l!==null&&(p=In(),_i(l,n,f,p),Vp(l,r,f))}}function kp(n){var r=n.alternate;return n===Gt||r!==null&&r===Gt}function Bp(n,r){Ko=vl=!0;var l=n.pending;l===null?r.next=r:(r.next=l.next,l.next=r),n.pending=r}function Vp(n,r,l){if((l&4194240)!==0){var f=r.lanes;f&=n.pendingLanes,l|=f,r.lanes=l,kc(n,l)}}var yl={readContext:ii,useCallback:yn,useContext:yn,useEffect:yn,useImperativeHandle:yn,useInsertionEffect:yn,useLayoutEffect:yn,useMemo:yn,useReducer:yn,useRef:yn,useState:yn,useDebugValue:yn,useDeferredValue:yn,useTransition:yn,useMutableSource:yn,useSyncExternalStore:yn,useId:yn,unstable_isNewReconciler:!1},v_={readContext:ii,useCallback:function(n,r){return Li().memoizedState=[n,r===void 0?null:r],n},useContext:ii,useEffect:Pp,useImperativeHandle:function(n,r,l){return l=l!=null?l.concat([n]):null,_l(4194308,4,Dp.bind(null,r,n),l)},useLayoutEffect:function(n,r){return _l(4194308,4,n,r)},useInsertionEffect:function(n,r){return _l(4,2,n,r)},useMemo:function(n,r){var l=Li();return r=r===void 0?null:r,n=n(),l.memoizedState=[n,r],n},useReducer:function(n,r,l){var f=Li();return r=l!==void 0?l(r):r,f.memoizedState=f.baseState=r,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},f.queue=n,n=n.dispatch=m_.bind(null,Gt,n),[f.memoizedState,n]},useRef:function(n){var r=Li();return n={current:n},r.memoizedState=n},useState:Rp,useDebugValue:Ou,useDeferredValue:function(n){return Li().memoizedState=n},useTransition:function(){var n=Rp(!1),r=n[0];return n=p_.bind(null,n[1]),Li().memoizedState=n,[r,n]},useMutableSource:function(){},useSyncExternalStore:function(n,r,l){var f=Gt,p=Li();if(Vt){if(l===void 0)throw Error(t(407));l=l()}else{if(l=r(),an===null)throw Error(t(349));($r&30)!==0||Ep(f,r,l)}p.memoizedState=l;var _={value:l,getSnapshot:r};return p.queue=_,Pp(Tp.bind(null,f,_,n),[n]),f.flags|=2048,ea(9,wp.bind(null,f,_,l,r),void 0,null),l},useId:function(){var n=Li(),r=an.identifierPrefix;if(Vt){var l=Xi,f=Wi;l=(f&~(1<<32-at(f)-1)).toString(32)+l,r=":"+r+"R"+l,l=Jo++,0<l&&(r+="H"+l.toString(32)),r+=":"}else l=h_++,r=":"+r+"r"+l.toString(32)+":";return n.memoizedState=r},unstable_isNewReconciler:!1},__={readContext:ii,useCallback:Up,useContext:ii,useEffect:Fu,useImperativeHandle:Np,useInsertionEffect:Lp,useLayoutEffect:Ip,useMemo:Fp,useReducer:Nu,useRef:bp,useState:function(){return Nu(Qo)},useDebugValue:Ou,useDeferredValue:function(n){var r=ri();return Op(r,tn.memoizedState,n)},useTransition:function(){var n=Nu(Qo)[0],r=ri().memoizedState;return[n,r]},useMutableSource:Sp,useSyncExternalStore:Mp,useId:zp,unstable_isNewReconciler:!1},x_={readContext:ii,useCallback:Up,useContext:ii,useEffect:Fu,useImperativeHandle:Np,useInsertionEffect:Lp,useLayoutEffect:Ip,useMemo:Fp,useReducer:Uu,useRef:bp,useState:function(){return Uu(Qo)},useDebugValue:Ou,useDeferredValue:function(n){var r=ri();return tn===null?r.memoizedState=n:Op(r,tn.memoizedState,n)},useTransition:function(){var n=Uu(Qo)[0],r=ri().memoizedState;return[n,r]},useMutableSource:Sp,useSyncExternalStore:Mp,useId:zp,unstable_isNewReconciler:!1};function mi(n,r){if(n&&n.defaultProps){r=se({},r),n=n.defaultProps;for(var l in n)r[l]===void 0&&(r[l]=n[l]);return r}return r}function zu(n,r,l,f){r=n.memoizedState,l=l(f,r),l=l==null?r:se({},r,l),n.memoizedState=l,n.lanes===0&&(n.updateQueue.baseState=l)}var Sl={isMounted:function(n){return(n=n._reactInternals)?Ci(n)===n:!1},enqueueSetState:function(n,r,l){n=n._reactInternals;var f=In(),p=wr(n),_=Yi(f,p);_.payload=r,l!=null&&(_.callback=l),r=yr(n,_,p),r!==null&&(_i(r,n,p,f),hl(r,n,p))},enqueueReplaceState:function(n,r,l){n=n._reactInternals;var f=In(),p=wr(n),_=Yi(f,p);_.tag=1,_.payload=r,l!=null&&(_.callback=l),r=yr(n,_,p),r!==null&&(_i(r,n,p,f),hl(r,n,p))},enqueueForceUpdate:function(n,r){n=n._reactInternals;var l=In(),f=wr(n),p=Yi(l,f);p.tag=2,r!=null&&(p.callback=r),r=yr(n,p,f),r!==null&&(_i(r,n,f,l),hl(r,n,f))}};function Hp(n,r,l,f,p,_,T){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(f,_,T):r.prototype&&r.prototype.isPureReactComponent?!Bo(l,f)||!Bo(p,_):!0}function Gp(n,r,l){var f=!1,p=vr,_=r.contextType;return typeof _=="object"&&_!==null?_=ii(_):(p=kn(r)?Xr:xn.current,f=r.contextTypes,_=(f=f!=null)?Ds(n,p):vr),r=new r(l,_),n.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Sl,n.stateNode=r,r._reactInternals=n,f&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=p,n.__reactInternalMemoizedMaskedChildContext=_),r}function Wp(n,r,l,f){n=r.state,typeof r.componentWillReceiveProps=="function"&&r.componentWillReceiveProps(l,f),typeof r.UNSAFE_componentWillReceiveProps=="function"&&r.UNSAFE_componentWillReceiveProps(l,f),r.state!==n&&Sl.enqueueReplaceState(r,r.state,null)}function ku(n,r,l,f){var p=n.stateNode;p.props=l,p.state=n.memoizedState,p.refs={},Tu(n);var _=r.contextType;typeof _=="object"&&_!==null?p.context=ii(_):(_=kn(r)?Xr:xn.current,p.context=Ds(n,_)),p.state=n.memoizedState,_=r.getDerivedStateFromProps,typeof _=="function"&&(zu(n,r,_,l),p.state=n.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof p.getSnapshotBeforeUpdate=="function"||typeof p.UNSAFE_componentWillMount!="function"&&typeof p.componentWillMount!="function"||(r=p.state,typeof p.componentWillMount=="function"&&p.componentWillMount(),typeof p.UNSAFE_componentWillMount=="function"&&p.UNSAFE_componentWillMount(),r!==p.state&&Sl.enqueueReplaceState(p,p.state,null),pl(n,l,p,f),p.state=n.memoizedState),typeof p.componentDidMount=="function"&&(n.flags|=4194308)}function Vs(n,r){try{var l="",f=r;do l+=ue(f),f=f.return;while(f);var p=l}catch(_){p=`
Error generating stack: `+_.message+`
`+_.stack}return{value:n,source:r,stack:p,digest:null}}function Bu(n,r,l){return{value:n,source:null,stack:l??null,digest:r??null}}function Vu(n,r){try{console.error(r.value)}catch(l){setTimeout(function(){throw l})}}var y_=typeof WeakMap=="function"?WeakMap:Map;function Xp(n,r,l){l=Yi(-1,l),l.tag=3,l.payload={element:null};var f=r.value;return l.callback=function(){Rl||(Rl=!0,nf=f),Vu(n,r)},l}function jp(n,r,l){l=Yi(-1,l),l.tag=3;var f=n.type.getDerivedStateFromError;if(typeof f=="function"){var p=r.value;l.payload=function(){return f(p)},l.callback=function(){Vu(n,r)}}var _=n.stateNode;return _!==null&&typeof _.componentDidCatch=="function"&&(l.callback=function(){Vu(n,r),typeof f!="function"&&(Mr===null?Mr=new Set([this]):Mr.add(this));var T=r.stack;this.componentDidCatch(r.value,{componentStack:T!==null?T:""})}),l}function Yp(n,r,l){var f=n.pingCache;if(f===null){f=n.pingCache=new y_;var p=new Set;f.set(r,p)}else p=f.get(r),p===void 0&&(p=new Set,f.set(r,p));p.has(l)||(p.add(l),n=N_.bind(null,n,r,l),r.then(n,n))}function qp(n){do{var r;if((r=n.tag===13)&&(r=n.memoizedState,r=r!==null?r.dehydrated!==null:!0),r)return n;n=n.return}while(n!==null);return null}function Zp(n,r,l,f,p){return(n.mode&1)===0?(n===r?n.flags|=65536:(n.flags|=128,l.flags|=131072,l.flags&=-52805,l.tag===1&&(l.alternate===null?l.tag=17:(r=Yi(-1,1),r.tag=2,yr(l,r,1))),l.lanes|=1),n):(n.flags|=65536,n.lanes=p,n)}var S_=E.ReactCurrentOwner,Bn=!1;function Ln(n,r,l,f){r.child=n===null?mp(r,null,l,f):Os(r,n.child,l,f)}function $p(n,r,l,f,p){l=l.render;var _=r.ref;return ks(r,p),f=Iu(n,r,l,f,_,p),l=Du(),n!==null&&!Bn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~p,qi(n,r,p)):(Vt&&l&&mu(r),r.flags|=1,Ln(n,r,f,p),r.child)}function Kp(n,r,l,f,p){if(n===null){var _=l.type;return typeof _=="function"&&!uf(_)&&_.defaultProps===void 0&&l.compare===null&&l.defaultProps===void 0?(r.tag=15,r.type=_,Jp(n,r,_,f,p)):(n=Nl(l.type,null,f,r,r.mode,p),n.ref=r.ref,n.return=r,r.child=n)}if(_=n.child,(n.lanes&p)===0){var T=_.memoizedProps;if(l=l.compare,l=l!==null?l:Bo,l(T,f)&&n.ref===r.ref)return qi(n,r,p)}return r.flags|=1,n=Ar(_,f),n.ref=r.ref,n.return=r,r.child=n}function Jp(n,r,l,f,p){if(n!==null){var _=n.memoizedProps;if(Bo(_,f)&&n.ref===r.ref)if(Bn=!1,r.pendingProps=f=_,(n.lanes&p)!==0)(n.flags&131072)!==0&&(Bn=!0);else return r.lanes=n.lanes,qi(n,r,p)}return Hu(n,r,l,f,p)}function Qp(n,r,l){var f=r.pendingProps,p=f.children,_=n!==null?n.memoizedState:null;if(f.mode==="hidden")if((r.mode&1)===0)r.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ot(Gs,Zn),Zn|=l;else{if((l&1073741824)===0)return n=_!==null?_.baseLanes|l:l,r.lanes=r.childLanes=1073741824,r.memoizedState={baseLanes:n,cachePool:null,transitions:null},r.updateQueue=null,Ot(Gs,Zn),Zn|=n,null;r.memoizedState={baseLanes:0,cachePool:null,transitions:null},f=_!==null?_.baseLanes:l,Ot(Gs,Zn),Zn|=f}else _!==null?(f=_.baseLanes|l,r.memoizedState=null):f=l,Ot(Gs,Zn),Zn|=f;return Ln(n,r,p,l),r.child}function em(n,r){var l=r.ref;(n===null&&l!==null||n!==null&&n.ref!==l)&&(r.flags|=512,r.flags|=2097152)}function Hu(n,r,l,f,p){var _=kn(l)?Xr:xn.current;return _=Ds(r,_),ks(r,p),l=Iu(n,r,l,f,_,p),f=Du(),n!==null&&!Bn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~p,qi(n,r,p)):(Vt&&f&&mu(r),r.flags|=1,Ln(n,r,l,p),r.child)}function tm(n,r,l,f,p){if(kn(l)){var _=!0;sl(r)}else _=!1;if(ks(r,p),r.stateNode===null)El(n,r),Gp(r,l,f),ku(r,l,f,p),f=!0;else if(n===null){var T=r.stateNode,U=r.memoizedProps;T.props=U;var z=T.context,Q=l.contextType;typeof Q=="object"&&Q!==null?Q=ii(Q):(Q=kn(l)?Xr:xn.current,Q=Ds(r,Q));var _e=l.getDerivedStateFromProps,ye=typeof _e=="function"||typeof T.getSnapshotBeforeUpdate=="function";ye||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(U!==f||z!==Q)&&Wp(r,T,f,Q),xr=!1;var ge=r.memoizedState;T.state=ge,pl(r,f,T,p),z=r.memoizedState,U!==f||ge!==z||zn.current||xr?(typeof _e=="function"&&(zu(r,l,_e,f),z=r.memoizedState),(U=xr||Hp(r,l,U,f,ge,z,Q))?(ye||typeof T.UNSAFE_componentWillMount!="function"&&typeof T.componentWillMount!="function"||(typeof T.componentWillMount=="function"&&T.componentWillMount(),typeof T.UNSAFE_componentWillMount=="function"&&T.UNSAFE_componentWillMount()),typeof T.componentDidMount=="function"&&(r.flags|=4194308)):(typeof T.componentDidMount=="function"&&(r.flags|=4194308),r.memoizedProps=f,r.memoizedState=z),T.props=f,T.state=z,T.context=Q,f=U):(typeof T.componentDidMount=="function"&&(r.flags|=4194308),f=!1)}else{T=r.stateNode,vp(n,r),U=r.memoizedProps,Q=r.type===r.elementType?U:mi(r.type,U),T.props=Q,ye=r.pendingProps,ge=T.context,z=l.contextType,typeof z=="object"&&z!==null?z=ii(z):(z=kn(l)?Xr:xn.current,z=Ds(r,z));var De=l.getDerivedStateFromProps;(_e=typeof De=="function"||typeof T.getSnapshotBeforeUpdate=="function")||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(U!==ye||ge!==z)&&Wp(r,T,f,z),xr=!1,ge=r.memoizedState,T.state=ge,pl(r,f,T,p);var Ve=r.memoizedState;U!==ye||ge!==Ve||zn.current||xr?(typeof De=="function"&&(zu(r,l,De,f),Ve=r.memoizedState),(Q=xr||Hp(r,l,Q,f,ge,Ve,z)||!1)?(_e||typeof T.UNSAFE_componentWillUpdate!="function"&&typeof T.componentWillUpdate!="function"||(typeof T.componentWillUpdate=="function"&&T.componentWillUpdate(f,Ve,z),typeof T.UNSAFE_componentWillUpdate=="function"&&T.UNSAFE_componentWillUpdate(f,Ve,z)),typeof T.componentDidUpdate=="function"&&(r.flags|=4),typeof T.getSnapshotBeforeUpdate=="function"&&(r.flags|=1024)):(typeof T.componentDidUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(r.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(r.flags|=1024),r.memoizedProps=f,r.memoizedState=Ve),T.props=f,T.state=Ve,T.context=z,f=Q):(typeof T.componentDidUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(r.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(r.flags|=1024),f=!1)}return Gu(n,r,l,f,_,p)}function Gu(n,r,l,f,p,_){em(n,r);var T=(r.flags&128)!==0;if(!f&&!T)return p&&op(r,l,!1),qi(n,r,_);f=r.stateNode,S_.current=r;var U=T&&typeof l.getDerivedStateFromError!="function"?null:f.render();return r.flags|=1,n!==null&&T?(r.child=Os(r,n.child,null,_),r.child=Os(r,null,U,_)):Ln(n,r,U,_),r.memoizedState=f.state,p&&op(r,l,!0),r.child}function nm(n){var r=n.stateNode;r.pendingContext?rp(n,r.pendingContext,r.pendingContext!==r.context):r.context&&rp(n,r.context,!1),Au(n,r.containerInfo)}function im(n,r,l,f,p){return Fs(),xu(p),r.flags|=256,Ln(n,r,l,f),r.child}var Wu={dehydrated:null,treeContext:null,retryLane:0};function Xu(n){return{baseLanes:n,cachePool:null,transitions:null}}function rm(n,r,l){var f=r.pendingProps,p=Ht.current,_=!1,T=(r.flags&128)!==0,U;if((U=T)||(U=n!==null&&n.memoizedState===null?!1:(p&2)!==0),U?(_=!0,r.flags&=-129):(n===null||n.memoizedState!==null)&&(p|=1),Ot(Ht,p&1),n===null)return _u(r),n=r.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((r.mode&1)===0?r.lanes=1:n.data==="$!"?r.lanes=8:r.lanes=1073741824,null):(T=f.children,n=f.fallback,_?(f=r.mode,_=r.child,T={mode:"hidden",children:T},(f&1)===0&&_!==null?(_.childLanes=0,_.pendingProps=T):_=Ul(T,f,0,null),n=ts(n,f,l,null),_.return=r,n.return=r,_.sibling=n,r.child=_,r.child.memoizedState=Xu(l),r.memoizedState=Wu,n):ju(r,T));if(p=n.memoizedState,p!==null&&(U=p.dehydrated,U!==null))return M_(n,r,T,f,U,p,l);if(_){_=f.fallback,T=r.mode,p=n.child,U=p.sibling;var z={mode:"hidden",children:f.children};return(T&1)===0&&r.child!==p?(f=r.child,f.childLanes=0,f.pendingProps=z,r.deletions=null):(f=Ar(p,z),f.subtreeFlags=p.subtreeFlags&14680064),U!==null?_=Ar(U,_):(_=ts(_,T,l,null),_.flags|=2),_.return=r,f.return=r,f.sibling=_,r.child=f,f=_,_=r.child,T=n.child.memoizedState,T=T===null?Xu(l):{baseLanes:T.baseLanes|l,cachePool:null,transitions:T.transitions},_.memoizedState=T,_.childLanes=n.childLanes&~l,r.memoizedState=Wu,f}return _=n.child,n=_.sibling,f=Ar(_,{mode:"visible",children:f.children}),(r.mode&1)===0&&(f.lanes=l),f.return=r,f.sibling=null,n!==null&&(l=r.deletions,l===null?(r.deletions=[n],r.flags|=16):l.push(n)),r.child=f,r.memoizedState=null,f}function ju(n,r){return r=Ul({mode:"visible",children:r},n.mode,0,null),r.return=n,n.child=r}function Ml(n,r,l,f){return f!==null&&xu(f),Os(r,n.child,null,l),n=ju(r,r.pendingProps.children),n.flags|=2,r.memoizedState=null,n}function M_(n,r,l,f,p,_,T){if(l)return r.flags&256?(r.flags&=-257,f=Bu(Error(t(422))),Ml(n,r,T,f)):r.memoizedState!==null?(r.child=n.child,r.flags|=128,null):(_=f.fallback,p=r.mode,f=Ul({mode:"visible",children:f.children},p,0,null),_=ts(_,p,T,null),_.flags|=2,f.return=r,_.return=r,f.sibling=_,r.child=f,(r.mode&1)!==0&&Os(r,n.child,null,T),r.child.memoizedState=Xu(T),r.memoizedState=Wu,_);if((r.mode&1)===0)return Ml(n,r,T,null);if(p.data==="$!"){if(f=p.nextSibling&&p.nextSibling.dataset,f)var U=f.dgst;return f=U,_=Error(t(419)),f=Bu(_,f,void 0),Ml(n,r,T,f)}if(U=(T&n.childLanes)!==0,Bn||U){if(f=an,f!==null){switch(T&-T){case 4:p=2;break;case 16:p=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:p=32;break;case 536870912:p=268435456;break;default:p=0}p=(p&(f.suspendedLanes|T))!==0?0:p,p!==0&&p!==_.retryLane&&(_.retryLane=p,ji(n,p),_i(f,n,p,-1))}return cf(),f=Bu(Error(t(421))),Ml(n,r,T,f)}return p.data==="$?"?(r.flags|=128,r.child=n.child,r=U_.bind(null,n),p._reactRetry=r,null):(n=_.treeContext,qn=mr(p.nextSibling),Yn=r,Vt=!0,pi=null,n!==null&&(ti[ni++]=Wi,ti[ni++]=Xi,ti[ni++]=jr,Wi=n.id,Xi=n.overflow,jr=r),r=ju(r,f.children),r.flags|=4096,r)}function sm(n,r,l){n.lanes|=r;var f=n.alternate;f!==null&&(f.lanes|=r),Eu(n.return,r,l)}function Yu(n,r,l,f,p){var _=n.memoizedState;_===null?n.memoizedState={isBackwards:r,rendering:null,renderingStartTime:0,last:f,tail:l,tailMode:p}:(_.isBackwards=r,_.rendering=null,_.renderingStartTime=0,_.last=f,_.tail=l,_.tailMode=p)}function om(n,r,l){var f=r.pendingProps,p=f.revealOrder,_=f.tail;if(Ln(n,r,f.children,l),f=Ht.current,(f&2)!==0)f=f&1|2,r.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=r.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&sm(n,l,r);else if(n.tag===19)sm(n,l,r);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===r)break e;for(;n.sibling===null;){if(n.return===null||n.return===r)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}f&=1}if(Ot(Ht,f),(r.mode&1)===0)r.memoizedState=null;else switch(p){case"forwards":for(l=r.child,p=null;l!==null;)n=l.alternate,n!==null&&ml(n)===null&&(p=l),l=l.sibling;l=p,l===null?(p=r.child,r.child=null):(p=l.sibling,l.sibling=null),Yu(r,!1,p,l,_);break;case"backwards":for(l=null,p=r.child,r.child=null;p!==null;){if(n=p.alternate,n!==null&&ml(n)===null){r.child=p;break}n=p.sibling,p.sibling=l,l=p,p=n}Yu(r,!0,l,null,_);break;case"together":Yu(r,!1,null,null,void 0);break;default:r.memoizedState=null}return r.child}function El(n,r){(r.mode&1)===0&&n!==null&&(n.alternate=null,r.alternate=null,r.flags|=2)}function qi(n,r,l){if(n!==null&&(r.dependencies=n.dependencies),Kr|=r.lanes,(l&r.childLanes)===0)return null;if(n!==null&&r.child!==n.child)throw Error(t(153));if(r.child!==null){for(n=r.child,l=Ar(n,n.pendingProps),r.child=l,l.return=r;n.sibling!==null;)n=n.sibling,l=l.sibling=Ar(n,n.pendingProps),l.return=r;l.sibling=null}return r.child}function E_(n,r,l){switch(r.tag){case 3:nm(r),Fs();break;case 5:yp(r);break;case 1:kn(r.type)&&sl(r);break;case 4:Au(r,r.stateNode.containerInfo);break;case 10:var f=r.type._context,p=r.memoizedProps.value;Ot(fl,f._currentValue),f._currentValue=p;break;case 13:if(f=r.memoizedState,f!==null)return f.dehydrated!==null?(Ot(Ht,Ht.current&1),r.flags|=128,null):(l&r.child.childLanes)!==0?rm(n,r,l):(Ot(Ht,Ht.current&1),n=qi(n,r,l),n!==null?n.sibling:null);Ot(Ht,Ht.current&1);break;case 19:if(f=(l&r.childLanes)!==0,(n.flags&128)!==0){if(f)return om(n,r,l);r.flags|=128}if(p=r.memoizedState,p!==null&&(p.rendering=null,p.tail=null,p.lastEffect=null),Ot(Ht,Ht.current),f)break;return null;case 22:case 23:return r.lanes=0,Qp(n,r,l)}return qi(n,r,l)}var am,qu,lm,cm;am=function(n,r){for(var l=r.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===r)break;for(;l.sibling===null;){if(l.return===null||l.return===r)return;l=l.return}l.sibling.return=l.return,l=l.sibling}},qu=function(){},lm=function(n,r,l,f){var p=n.memoizedProps;if(p!==f){n=r.stateNode,Zr(Pi.current);var _=null;switch(l){case"input":p=j(n,p),f=j(n,f),_=[];break;case"select":p=se({},p,{value:void 0}),f=se({},f,{value:void 0}),_=[];break;case"textarea":p=A(n,p),f=A(n,f),_=[];break;default:typeof p.onClick!="function"&&typeof f.onClick=="function"&&(n.onclick=nl)}ht(l,f);var T;l=null;for(Q in p)if(!f.hasOwnProperty(Q)&&p.hasOwnProperty(Q)&&p[Q]!=null)if(Q==="style"){var U=p[Q];for(T in U)U.hasOwnProperty(T)&&(l||(l={}),l[T]="")}else Q!=="dangerouslySetInnerHTML"&&Q!=="children"&&Q!=="suppressContentEditableWarning"&&Q!=="suppressHydrationWarning"&&Q!=="autoFocus"&&(o.hasOwnProperty(Q)?_||(_=[]):(_=_||[]).push(Q,null));for(Q in f){var z=f[Q];if(U=p!=null?p[Q]:void 0,f.hasOwnProperty(Q)&&z!==U&&(z!=null||U!=null))if(Q==="style")if(U){for(T in U)!U.hasOwnProperty(T)||z&&z.hasOwnProperty(T)||(l||(l={}),l[T]="");for(T in z)z.hasOwnProperty(T)&&U[T]!==z[T]&&(l||(l={}),l[T]=z[T])}else l||(_||(_=[]),_.push(Q,l)),l=z;else Q==="dangerouslySetInnerHTML"?(z=z?z.__html:void 0,U=U?U.__html:void 0,z!=null&&U!==z&&(_=_||[]).push(Q,z)):Q==="children"?typeof z!="string"&&typeof z!="number"||(_=_||[]).push(Q,""+z):Q!=="suppressContentEditableWarning"&&Q!=="suppressHydrationWarning"&&(o.hasOwnProperty(Q)?(z!=null&&Q==="onScroll"&&kt("scroll",n),_||U===z||(_=[])):(_=_||[]).push(Q,z))}l&&(_=_||[]).push("style",l);var Q=_;(r.updateQueue=Q)&&(r.flags|=4)}},cm=function(n,r,l,f){l!==f&&(r.flags|=4)};function ta(n,r){if(!Vt)switch(n.tailMode){case"hidden":r=n.tail;for(var l=null;r!==null;)r.alternate!==null&&(l=r),r=r.sibling;l===null?n.tail=null:l.sibling=null;break;case"collapsed":l=n.tail;for(var f=null;l!==null;)l.alternate!==null&&(f=l),l=l.sibling;f===null?r||n.tail===null?n.tail=null:n.tail.sibling=null:f.sibling=null}}function Sn(n){var r=n.alternate!==null&&n.alternate.child===n.child,l=0,f=0;if(r)for(var p=n.child;p!==null;)l|=p.lanes|p.childLanes,f|=p.subtreeFlags&14680064,f|=p.flags&14680064,p.return=n,p=p.sibling;else for(p=n.child;p!==null;)l|=p.lanes|p.childLanes,f|=p.subtreeFlags,f|=p.flags,p.return=n,p=p.sibling;return n.subtreeFlags|=f,n.childLanes=l,r}function w_(n,r,l){var f=r.pendingProps;switch(gu(r),r.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Sn(r),null;case 1:return kn(r.type)&&rl(),Sn(r),null;case 3:return f=r.stateNode,Bs(),Bt(zn),Bt(xn),bu(),f.pendingContext&&(f.context=f.pendingContext,f.pendingContext=null),(n===null||n.child===null)&&(cl(r)?r.flags|=4:n===null||n.memoizedState.isDehydrated&&(r.flags&256)===0||(r.flags|=1024,pi!==null&&(of(pi),pi=null))),qu(n,r),Sn(r),null;case 5:Cu(r);var p=Zr($o.current);if(l=r.type,n!==null&&r.stateNode!=null)lm(n,r,l,f,p),n.ref!==r.ref&&(r.flags|=512,r.flags|=2097152);else{if(!f){if(r.stateNode===null)throw Error(t(166));return Sn(r),null}if(n=Zr(Pi.current),cl(r)){f=r.stateNode,l=r.type;var _=r.memoizedProps;switch(f[bi]=r,f[Xo]=_,n=(r.mode&1)!==0,l){case"dialog":kt("cancel",f),kt("close",f);break;case"iframe":case"object":case"embed":kt("load",f);break;case"video":case"audio":for(p=0;p<Ho.length;p++)kt(Ho[p],f);break;case"source":kt("error",f);break;case"img":case"image":case"link":kt("error",f),kt("load",f);break;case"details":kt("toggle",f);break;case"input":Rn(f,_),kt("invalid",f);break;case"select":f._wrapperState={wasMultiple:!!_.multiple},kt("invalid",f);break;case"textarea":K(f,_),kt("invalid",f)}ht(l,_),p=null;for(var T in _)if(_.hasOwnProperty(T)){var U=_[T];T==="children"?typeof U=="string"?f.textContent!==U&&(_.suppressHydrationWarning!==!0&&tl(f.textContent,U,n),p=["children",U]):typeof U=="number"&&f.textContent!==""+U&&(_.suppressHydrationWarning!==!0&&tl(f.textContent,U,n),p=["children",""+U]):o.hasOwnProperty(T)&&U!=null&&T==="onScroll"&&kt("scroll",f)}switch(l){case"input":Dt(f),$e(f,_,!0);break;case"textarea":Dt(f),ve(f);break;case"select":case"option":break;default:typeof _.onClick=="function"&&(f.onclick=nl)}f=p,r.updateQueue=f,f!==null&&(r.flags|=4)}else{T=p.nodeType===9?p:p.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=fe(l)),n==="http://www.w3.org/1999/xhtml"?l==="script"?(n=T.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof f.is=="string"?n=T.createElement(l,{is:f.is}):(n=T.createElement(l),l==="select"&&(T=n,f.multiple?T.multiple=!0:f.size&&(T.size=f.size))):n=T.createElementNS(n,l),n[bi]=r,n[Xo]=f,am(n,r,!1,!1),r.stateNode=n;e:{switch(T=st(l,f),l){case"dialog":kt("cancel",n),kt("close",n),p=f;break;case"iframe":case"object":case"embed":kt("load",n),p=f;break;case"video":case"audio":for(p=0;p<Ho.length;p++)kt(Ho[p],n);p=f;break;case"source":kt("error",n),p=f;break;case"img":case"image":case"link":kt("error",n),kt("load",n),p=f;break;case"details":kt("toggle",n),p=f;break;case"input":Rn(n,f),p=j(n,f),kt("invalid",n);break;case"option":p=f;break;case"select":n._wrapperState={wasMultiple:!!f.multiple},p=se({},f,{value:void 0}),kt("invalid",n);break;case"textarea":K(n,f),p=A(n,f),kt("invalid",n);break;default:p=f}ht(l,p),U=p;for(_ in U)if(U.hasOwnProperty(_)){var z=U[_];_==="style"?tt(n,z):_==="dangerouslySetInnerHTML"?(z=z?z.__html:void 0,z!=null&&Fe(n,z)):_==="children"?typeof z=="string"?(l!=="textarea"||z!=="")&&ft(n,z):typeof z=="number"&&ft(n,""+z):_!=="suppressContentEditableWarning"&&_!=="suppressHydrationWarning"&&_!=="autoFocus"&&(o.hasOwnProperty(_)?z!=null&&_==="onScroll"&&kt("scroll",n):z!=null&&C(n,_,z,T))}switch(l){case"input":Dt(n),$e(n,f,!1);break;case"textarea":Dt(n),ve(n);break;case"option":f.value!=null&&n.setAttribute("value",""+Ce(f.value));break;case"select":n.multiple=!!f.multiple,_=f.value,_!=null?N(n,!!f.multiple,_,!1):f.defaultValue!=null&&N(n,!!f.multiple,f.defaultValue,!0);break;default:typeof p.onClick=="function"&&(n.onclick=nl)}switch(l){case"button":case"input":case"select":case"textarea":f=!!f.autoFocus;break e;case"img":f=!0;break e;default:f=!1}}f&&(r.flags|=4)}r.ref!==null&&(r.flags|=512,r.flags|=2097152)}return Sn(r),null;case 6:if(n&&r.stateNode!=null)cm(n,r,n.memoizedProps,f);else{if(typeof f!="string"&&r.stateNode===null)throw Error(t(166));if(l=Zr($o.current),Zr(Pi.current),cl(r)){if(f=r.stateNode,l=r.memoizedProps,f[bi]=r,(_=f.nodeValue!==l)&&(n=Yn,n!==null))switch(n.tag){case 3:tl(f.nodeValue,l,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&tl(f.nodeValue,l,(n.mode&1)!==0)}_&&(r.flags|=4)}else f=(l.nodeType===9?l:l.ownerDocument).createTextNode(f),f[bi]=r,r.stateNode=f}return Sn(r),null;case 13:if(Bt(Ht),f=r.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Vt&&qn!==null&&(r.mode&1)!==0&&(r.flags&128)===0)dp(),Fs(),r.flags|=98560,_=!1;else if(_=cl(r),f!==null&&f.dehydrated!==null){if(n===null){if(!_)throw Error(t(318));if(_=r.memoizedState,_=_!==null?_.dehydrated:null,!_)throw Error(t(317));_[bi]=r}else Fs(),(r.flags&128)===0&&(r.memoizedState=null),r.flags|=4;Sn(r),_=!1}else pi!==null&&(of(pi),pi=null),_=!0;if(!_)return r.flags&65536?r:null}return(r.flags&128)!==0?(r.lanes=l,r):(f=f!==null,f!==(n!==null&&n.memoizedState!==null)&&f&&(r.child.flags|=8192,(r.mode&1)!==0&&(n===null||(Ht.current&1)!==0?nn===0&&(nn=3):cf())),r.updateQueue!==null&&(r.flags|=4),Sn(r),null);case 4:return Bs(),qu(n,r),n===null&&Go(r.stateNode.containerInfo),Sn(r),null;case 10:return Mu(r.type._context),Sn(r),null;case 17:return kn(r.type)&&rl(),Sn(r),null;case 19:if(Bt(Ht),_=r.memoizedState,_===null)return Sn(r),null;if(f=(r.flags&128)!==0,T=_.rendering,T===null)if(f)ta(_,!1);else{if(nn!==0||n!==null&&(n.flags&128)!==0)for(n=r.child;n!==null;){if(T=ml(n),T!==null){for(r.flags|=128,ta(_,!1),f=T.updateQueue,f!==null&&(r.updateQueue=f,r.flags|=4),r.subtreeFlags=0,f=l,l=r.child;l!==null;)_=l,n=f,_.flags&=14680066,T=_.alternate,T===null?(_.childLanes=0,_.lanes=n,_.child=null,_.subtreeFlags=0,_.memoizedProps=null,_.memoizedState=null,_.updateQueue=null,_.dependencies=null,_.stateNode=null):(_.childLanes=T.childLanes,_.lanes=T.lanes,_.child=T.child,_.subtreeFlags=0,_.deletions=null,_.memoizedProps=T.memoizedProps,_.memoizedState=T.memoizedState,_.updateQueue=T.updateQueue,_.type=T.type,n=T.dependencies,_.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),l=l.sibling;return Ot(Ht,Ht.current&1|2),r.child}n=n.sibling}_.tail!==null&&Ee()>Ws&&(r.flags|=128,f=!0,ta(_,!1),r.lanes=4194304)}else{if(!f)if(n=ml(T),n!==null){if(r.flags|=128,f=!0,l=n.updateQueue,l!==null&&(r.updateQueue=l,r.flags|=4),ta(_,!0),_.tail===null&&_.tailMode==="hidden"&&!T.alternate&&!Vt)return Sn(r),null}else 2*Ee()-_.renderingStartTime>Ws&&l!==1073741824&&(r.flags|=128,f=!0,ta(_,!1),r.lanes=4194304);_.isBackwards?(T.sibling=r.child,r.child=T):(l=_.last,l!==null?l.sibling=T:r.child=T,_.last=T)}return _.tail!==null?(r=_.tail,_.rendering=r,_.tail=r.sibling,_.renderingStartTime=Ee(),r.sibling=null,l=Ht.current,Ot(Ht,f?l&1|2:l&1),r):(Sn(r),null);case 22:case 23:return lf(),f=r.memoizedState!==null,n!==null&&n.memoizedState!==null!==f&&(r.flags|=8192),f&&(r.mode&1)!==0?(Zn&1073741824)!==0&&(Sn(r),r.subtreeFlags&6&&(r.flags|=8192)):Sn(r),null;case 24:return null;case 25:return null}throw Error(t(156,r.tag))}function T_(n,r){switch(gu(r),r.tag){case 1:return kn(r.type)&&rl(),n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 3:return Bs(),Bt(zn),Bt(xn),bu(),n=r.flags,(n&65536)!==0&&(n&128)===0?(r.flags=n&-65537|128,r):null;case 5:return Cu(r),null;case 13:if(Bt(Ht),n=r.memoizedState,n!==null&&n.dehydrated!==null){if(r.alternate===null)throw Error(t(340));Fs()}return n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 19:return Bt(Ht),null;case 4:return Bs(),null;case 10:return Mu(r.type._context),null;case 22:case 23:return lf(),null;case 24:return null;default:return null}}var wl=!1,Mn=!1,A_=typeof WeakSet=="function"?WeakSet:Set,Oe=null;function Hs(n,r){var l=n.ref;if(l!==null)if(typeof l=="function")try{l(null)}catch(f){jt(n,r,f)}else l.current=null}function Zu(n,r,l){try{l()}catch(f){jt(n,r,f)}}var um=!1;function C_(n,r){if(au=Wa,n=Hh(),Qc(n)){if("selectionStart"in n)var l={start:n.selectionStart,end:n.selectionEnd};else e:{l=(l=n.ownerDocument)&&l.defaultView||window;var f=l.getSelection&&l.getSelection();if(f&&f.rangeCount!==0){l=f.anchorNode;var p=f.anchorOffset,_=f.focusNode;f=f.focusOffset;try{l.nodeType,_.nodeType}catch{l=null;break e}var T=0,U=-1,z=-1,Q=0,_e=0,ye=n,ge=null;t:for(;;){for(var De;ye!==l||p!==0&&ye.nodeType!==3||(U=T+p),ye!==_||f!==0&&ye.nodeType!==3||(z=T+f),ye.nodeType===3&&(T+=ye.nodeValue.length),(De=ye.firstChild)!==null;)ge=ye,ye=De;for(;;){if(ye===n)break t;if(ge===l&&++Q===p&&(U=T),ge===_&&++_e===f&&(z=T),(De=ye.nextSibling)!==null)break;ye=ge,ge=ye.parentNode}ye=De}l=U===-1||z===-1?null:{start:U,end:z}}else l=null}l=l||{start:0,end:0}}else l=null;for(lu={focusedElem:n,selectionRange:l},Wa=!1,Oe=r;Oe!==null;)if(r=Oe,n=r.child,(r.subtreeFlags&1028)!==0&&n!==null)n.return=r,Oe=n;else for(;Oe!==null;){r=Oe;try{var Ve=r.alternate;if((r.flags&1024)!==0)switch(r.tag){case 0:case 11:case 15:break;case 1:if(Ve!==null){var Ge=Ve.memoizedProps,Zt=Ve.memoizedState,q=r.stateNode,H=q.getSnapshotBeforeUpdate(r.elementType===r.type?Ge:mi(r.type,Ge),Zt);q.__reactInternalSnapshotBeforeUpdate=H}break;case 3:var $=r.stateNode.containerInfo;$.nodeType===1?$.textContent="":$.nodeType===9&&$.documentElement&&$.removeChild($.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Te){jt(r,r.return,Te)}if(n=r.sibling,n!==null){n.return=r.return,Oe=n;break}Oe=r.return}return Ve=um,um=!1,Ve}function na(n,r,l){var f=r.updateQueue;if(f=f!==null?f.lastEffect:null,f!==null){var p=f=f.next;do{if((p.tag&n)===n){var _=p.destroy;p.destroy=void 0,_!==void 0&&Zu(r,l,_)}p=p.next}while(p!==f)}}function Tl(n,r){if(r=r.updateQueue,r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&n)===n){var f=l.create;l.destroy=f()}l=l.next}while(l!==r)}}function $u(n){var r=n.ref;if(r!==null){var l=n.stateNode;switch(n.tag){case 5:n=l;break;default:n=l}typeof r=="function"?r(n):r.current=n}}function fm(n){var r=n.alternate;r!==null&&(n.alternate=null,fm(r)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(r=n.stateNode,r!==null&&(delete r[bi],delete r[Xo],delete r[du],delete r[c_],delete r[u_])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function dm(n){return n.tag===5||n.tag===3||n.tag===4}function hm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||dm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Ku(n,r,l){var f=n.tag;if(f===5||f===6)n=n.stateNode,r?l.nodeType===8?l.parentNode.insertBefore(n,r):l.insertBefore(n,r):(l.nodeType===8?(r=l.parentNode,r.insertBefore(n,l)):(r=l,r.appendChild(n)),l=l._reactRootContainer,l!=null||r.onclick!==null||(r.onclick=nl));else if(f!==4&&(n=n.child,n!==null))for(Ku(n,r,l),n=n.sibling;n!==null;)Ku(n,r,l),n=n.sibling}function Ju(n,r,l){var f=n.tag;if(f===5||f===6)n=n.stateNode,r?l.insertBefore(n,r):l.appendChild(n);else if(f!==4&&(n=n.child,n!==null))for(Ju(n,r,l),n=n.sibling;n!==null;)Ju(n,r,l),n=n.sibling}var dn=null,gi=!1;function Sr(n,r,l){for(l=l.child;l!==null;)pm(n,r,l),l=l.sibling}function pm(n,r,l){if(vt&&typeof vt.onCommitFiberUnmount=="function")try{vt.onCommitFiberUnmount(wt,l)}catch{}switch(l.tag){case 5:Mn||Hs(l,r);case 6:var f=dn,p=gi;dn=null,Sr(n,r,l),dn=f,gi=p,dn!==null&&(gi?(n=dn,l=l.stateNode,n.nodeType===8?n.parentNode.removeChild(l):n.removeChild(l)):dn.removeChild(l.stateNode));break;case 18:dn!==null&&(gi?(n=dn,l=l.stateNode,n.nodeType===8?fu(n.parentNode,l):n.nodeType===1&&fu(n,l),No(n)):fu(dn,l.stateNode));break;case 4:f=dn,p=gi,dn=l.stateNode.containerInfo,gi=!0,Sr(n,r,l),dn=f,gi=p;break;case 0:case 11:case 14:case 15:if(!Mn&&(f=l.updateQueue,f!==null&&(f=f.lastEffect,f!==null))){p=f=f.next;do{var _=p,T=_.destroy;_=_.tag,T!==void 0&&((_&2)!==0||(_&4)!==0)&&Zu(l,r,T),p=p.next}while(p!==f)}Sr(n,r,l);break;case 1:if(!Mn&&(Hs(l,r),f=l.stateNode,typeof f.componentWillUnmount=="function"))try{f.props=l.memoizedProps,f.state=l.memoizedState,f.componentWillUnmount()}catch(U){jt(l,r,U)}Sr(n,r,l);break;case 21:Sr(n,r,l);break;case 22:l.mode&1?(Mn=(f=Mn)||l.memoizedState!==null,Sr(n,r,l),Mn=f):Sr(n,r,l);break;default:Sr(n,r,l)}}function mm(n){var r=n.updateQueue;if(r!==null){n.updateQueue=null;var l=n.stateNode;l===null&&(l=n.stateNode=new A_),r.forEach(function(f){var p=F_.bind(null,n,f);l.has(f)||(l.add(f),f.then(p,p))})}}function vi(n,r){var l=r.deletions;if(l!==null)for(var f=0;f<l.length;f++){var p=l[f];try{var _=n,T=r,U=T;e:for(;U!==null;){switch(U.tag){case 5:dn=U.stateNode,gi=!1;break e;case 3:dn=U.stateNode.containerInfo,gi=!0;break e;case 4:dn=U.stateNode.containerInfo,gi=!0;break e}U=U.return}if(dn===null)throw Error(t(160));pm(_,T,p),dn=null,gi=!1;var z=p.alternate;z!==null&&(z.return=null),p.return=null}catch(Q){jt(p,r,Q)}}if(r.subtreeFlags&12854)for(r=r.child;r!==null;)gm(r,n),r=r.sibling}function gm(n,r){var l=n.alternate,f=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(vi(r,n),Ii(n),f&4){try{na(3,n,n.return),Tl(3,n)}catch(Ge){jt(n,n.return,Ge)}try{na(5,n,n.return)}catch(Ge){jt(n,n.return,Ge)}}break;case 1:vi(r,n),Ii(n),f&512&&l!==null&&Hs(l,l.return);break;case 5:if(vi(r,n),Ii(n),f&512&&l!==null&&Hs(l,l.return),n.flags&32){var p=n.stateNode;try{ft(p,"")}catch(Ge){jt(n,n.return,Ge)}}if(f&4&&(p=n.stateNode,p!=null)){var _=n.memoizedProps,T=l!==null?l.memoizedProps:_,U=n.type,z=n.updateQueue;if(n.updateQueue=null,z!==null)try{U==="input"&&_.type==="radio"&&_.name!=null&&mt(p,_),st(U,T);var Q=st(U,_);for(T=0;T<z.length;T+=2){var _e=z[T],ye=z[T+1];_e==="style"?tt(p,ye):_e==="dangerouslySetInnerHTML"?Fe(p,ye):_e==="children"?ft(p,ye):C(p,_e,ye,Q)}switch(U){case"input":dt(p,_);break;case"textarea":me(p,_);break;case"select":var ge=p._wrapperState.wasMultiple;p._wrapperState.wasMultiple=!!_.multiple;var De=_.value;De!=null?N(p,!!_.multiple,De,!1):ge!==!!_.multiple&&(_.defaultValue!=null?N(p,!!_.multiple,_.defaultValue,!0):N(p,!!_.multiple,_.multiple?[]:"",!1))}p[Xo]=_}catch(Ge){jt(n,n.return,Ge)}}break;case 6:if(vi(r,n),Ii(n),f&4){if(n.stateNode===null)throw Error(t(162));p=n.stateNode,_=n.memoizedProps;try{p.nodeValue=_}catch(Ge){jt(n,n.return,Ge)}}break;case 3:if(vi(r,n),Ii(n),f&4&&l!==null&&l.memoizedState.isDehydrated)try{No(r.containerInfo)}catch(Ge){jt(n,n.return,Ge)}break;case 4:vi(r,n),Ii(n);break;case 13:vi(r,n),Ii(n),p=n.child,p.flags&8192&&(_=p.memoizedState!==null,p.stateNode.isHidden=_,!_||p.alternate!==null&&p.alternate.memoizedState!==null||(tf=Ee())),f&4&&mm(n);break;case 22:if(_e=l!==null&&l.memoizedState!==null,n.mode&1?(Mn=(Q=Mn)||_e,vi(r,n),Mn=Q):vi(r,n),Ii(n),f&8192){if(Q=n.memoizedState!==null,(n.stateNode.isHidden=Q)&&!_e&&(n.mode&1)!==0)for(Oe=n,_e=n.child;_e!==null;){for(ye=Oe=_e;Oe!==null;){switch(ge=Oe,De=ge.child,ge.tag){case 0:case 11:case 14:case 15:na(4,ge,ge.return);break;case 1:Hs(ge,ge.return);var Ve=ge.stateNode;if(typeof Ve.componentWillUnmount=="function"){f=ge,l=ge.return;try{r=f,Ve.props=r.memoizedProps,Ve.state=r.memoizedState,Ve.componentWillUnmount()}catch(Ge){jt(f,l,Ge)}}break;case 5:Hs(ge,ge.return);break;case 22:if(ge.memoizedState!==null){xm(ye);continue}}De!==null?(De.return=ge,Oe=De):xm(ye)}_e=_e.sibling}e:for(_e=null,ye=n;;){if(ye.tag===5){if(_e===null){_e=ye;try{p=ye.stateNode,Q?(_=p.style,typeof _.setProperty=="function"?_.setProperty("display","none","important"):_.display="none"):(U=ye.stateNode,z=ye.memoizedProps.style,T=z!=null&&z.hasOwnProperty("display")?z.display:null,U.style.display=et("display",T))}catch(Ge){jt(n,n.return,Ge)}}}else if(ye.tag===6){if(_e===null)try{ye.stateNode.nodeValue=Q?"":ye.memoizedProps}catch(Ge){jt(n,n.return,Ge)}}else if((ye.tag!==22&&ye.tag!==23||ye.memoizedState===null||ye===n)&&ye.child!==null){ye.child.return=ye,ye=ye.child;continue}if(ye===n)break e;for(;ye.sibling===null;){if(ye.return===null||ye.return===n)break e;_e===ye&&(_e=null),ye=ye.return}_e===ye&&(_e=null),ye.sibling.return=ye.return,ye=ye.sibling}}break;case 19:vi(r,n),Ii(n),f&4&&mm(n);break;case 21:break;default:vi(r,n),Ii(n)}}function Ii(n){var r=n.flags;if(r&2){try{e:{for(var l=n.return;l!==null;){if(dm(l)){var f=l;break e}l=l.return}throw Error(t(160))}switch(f.tag){case 5:var p=f.stateNode;f.flags&32&&(ft(p,""),f.flags&=-33);var _=hm(n);Ju(n,_,p);break;case 3:case 4:var T=f.stateNode.containerInfo,U=hm(n);Ku(n,U,T);break;default:throw Error(t(161))}}catch(z){jt(n,n.return,z)}n.flags&=-3}r&4096&&(n.flags&=-4097)}function R_(n,r,l){Oe=n,vm(n)}function vm(n,r,l){for(var f=(n.mode&1)!==0;Oe!==null;){var p=Oe,_=p.child;if(p.tag===22&&f){var T=p.memoizedState!==null||wl;if(!T){var U=p.alternate,z=U!==null&&U.memoizedState!==null||Mn;U=wl;var Q=Mn;if(wl=T,(Mn=z)&&!Q)for(Oe=p;Oe!==null;)T=Oe,z=T.child,T.tag===22&&T.memoizedState!==null?ym(p):z!==null?(z.return=T,Oe=z):ym(p);for(;_!==null;)Oe=_,vm(_),_=_.sibling;Oe=p,wl=U,Mn=Q}_m(n)}else(p.subtreeFlags&8772)!==0&&_!==null?(_.return=p,Oe=_):_m(n)}}function _m(n){for(;Oe!==null;){var r=Oe;if((r.flags&8772)!==0){var l=r.alternate;try{if((r.flags&8772)!==0)switch(r.tag){case 0:case 11:case 15:Mn||Tl(5,r);break;case 1:var f=r.stateNode;if(r.flags&4&&!Mn)if(l===null)f.componentDidMount();else{var p=r.elementType===r.type?l.memoizedProps:mi(r.type,l.memoizedProps);f.componentDidUpdate(p,l.memoizedState,f.__reactInternalSnapshotBeforeUpdate)}var _=r.updateQueue;_!==null&&xp(r,_,f);break;case 3:var T=r.updateQueue;if(T!==null){if(l=null,r.child!==null)switch(r.child.tag){case 5:l=r.child.stateNode;break;case 1:l=r.child.stateNode}xp(r,T,l)}break;case 5:var U=r.stateNode;if(l===null&&r.flags&4){l=U;var z=r.memoizedProps;switch(r.type){case"button":case"input":case"select":case"textarea":z.autoFocus&&l.focus();break;case"img":z.src&&(l.src=z.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(r.memoizedState===null){var Q=r.alternate;if(Q!==null){var _e=Q.memoizedState;if(_e!==null){var ye=_e.dehydrated;ye!==null&&No(ye)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}Mn||r.flags&512&&$u(r)}catch(ge){jt(r,r.return,ge)}}if(r===n){Oe=null;break}if(l=r.sibling,l!==null){l.return=r.return,Oe=l;break}Oe=r.return}}function xm(n){for(;Oe!==null;){var r=Oe;if(r===n){Oe=null;break}var l=r.sibling;if(l!==null){l.return=r.return,Oe=l;break}Oe=r.return}}function ym(n){for(;Oe!==null;){var r=Oe;try{switch(r.tag){case 0:case 11:case 15:var l=r.return;try{Tl(4,r)}catch(z){jt(r,l,z)}break;case 1:var f=r.stateNode;if(typeof f.componentDidMount=="function"){var p=r.return;try{f.componentDidMount()}catch(z){jt(r,p,z)}}var _=r.return;try{$u(r)}catch(z){jt(r,_,z)}break;case 5:var T=r.return;try{$u(r)}catch(z){jt(r,T,z)}}}catch(z){jt(r,r.return,z)}if(r===n){Oe=null;break}var U=r.sibling;if(U!==null){U.return=r.return,Oe=U;break}Oe=r.return}}var b_=Math.ceil,Al=E.ReactCurrentDispatcher,Qu=E.ReactCurrentOwner,si=E.ReactCurrentBatchConfig,yt=0,an=null,Kt=null,hn=0,Zn=0,Gs=gr(0),nn=0,ia=null,Kr=0,Cl=0,ef=0,ra=null,Vn=null,tf=0,Ws=1/0,Zi=null,Rl=!1,nf=null,Mr=null,bl=!1,Er=null,Pl=0,sa=0,rf=null,Ll=-1,Il=0;function In(){return(yt&6)!==0?Ee():Ll!==-1?Ll:Ll=Ee()}function wr(n){return(n.mode&1)===0?1:(yt&2)!==0&&hn!==0?hn&-hn:d_.transition!==null?(Il===0&&(Il=Pn()),Il):(n=Pt,n!==0||(n=window.event,n=n===void 0?16:Mh(n.type)),n)}function _i(n,r,l,f){if(50<sa)throw sa=0,rf=null,Error(t(185));On(n,l,f),((yt&2)===0||n!==an)&&(n===an&&((yt&2)===0&&(Cl|=l),nn===4&&Tr(n,hn)),Hn(n,f),l===1&&yt===0&&(r.mode&1)===0&&(Ws=Ee()+500,ol&&_r()))}function Hn(n,r){var l=n.callbackNode;Qn(n,r);var f=Ri(n,n===an?hn:0);if(f===0)l!==null&&te(l),n.callbackNode=null,n.callbackPriority=0;else if(r=f&-f,n.callbackPriority!==r){if(l!=null&&te(l),r===1)n.tag===0?f_(Mm.bind(null,n)):ap(Mm.bind(null,n)),a_(function(){(yt&6)===0&&_r()}),l=null;else{switch(ph(f)){case 1:l=He;break;case 4:l=nt;break;case 16:l=rt;break;case 536870912:l=_t;break;default:l=rt}l=Pm(l,Sm.bind(null,n))}n.callbackPriority=r,n.callbackNode=l}}function Sm(n,r){if(Ll=-1,Il=0,(yt&6)!==0)throw Error(t(327));var l=n.callbackNode;if(Xs()&&n.callbackNode!==l)return null;var f=Ri(n,n===an?hn:0);if(f===0)return null;if((f&30)!==0||(f&n.expiredLanes)!==0||r)r=Dl(n,f);else{r=f;var p=yt;yt|=2;var _=wm();(an!==n||hn!==r)&&(Zi=null,Ws=Ee()+500,Qr(n,r));do try{I_();break}catch(U){Em(n,U)}while(!0);Su(),Al.current=_,yt=p,Kt!==null?r=0:(an=null,hn=0,r=nn)}if(r!==0){if(r===2&&(p=Vi(n),p!==0&&(f=p,r=sf(n,p))),r===1)throw l=ia,Qr(n,0),Tr(n,f),Hn(n,Ee()),l;if(r===6)Tr(n,f);else{if(p=n.current.alternate,(f&30)===0&&!P_(p)&&(r=Dl(n,f),r===2&&(_=Vi(n),_!==0&&(f=_,r=sf(n,_))),r===1))throw l=ia,Qr(n,0),Tr(n,f),Hn(n,Ee()),l;switch(n.finishedWork=p,n.finishedLanes=f,r){case 0:case 1:throw Error(t(345));case 2:es(n,Vn,Zi);break;case 3:if(Tr(n,f),(f&130023424)===f&&(r=tf+500-Ee(),10<r)){if(Ri(n,0)!==0)break;if(p=n.suspendedLanes,(p&f)!==f){In(),n.pingedLanes|=n.suspendedLanes&p;break}n.timeoutHandle=uu(es.bind(null,n,Vn,Zi),r);break}es(n,Vn,Zi);break;case 4:if(Tr(n,f),(f&4194240)===f)break;for(r=n.eventTimes,p=-1;0<f;){var T=31-at(f);_=1<<T,T=r[T],T>p&&(p=T),f&=~_}if(f=p,f=Ee()-f,f=(120>f?120:480>f?480:1080>f?1080:1920>f?1920:3e3>f?3e3:4320>f?4320:1960*b_(f/1960))-f,10<f){n.timeoutHandle=uu(es.bind(null,n,Vn,Zi),f);break}es(n,Vn,Zi);break;case 5:es(n,Vn,Zi);break;default:throw Error(t(329))}}}return Hn(n,Ee()),n.callbackNode===l?Sm.bind(null,n):null}function sf(n,r){var l=ra;return n.current.memoizedState.isDehydrated&&(Qr(n,r).flags|=256),n=Dl(n,r),n!==2&&(r=Vn,Vn=l,r!==null&&of(r)),n}function of(n){Vn===null?Vn=n:Vn.push.apply(Vn,n)}function P_(n){for(var r=n;;){if(r.flags&16384){var l=r.updateQueue;if(l!==null&&(l=l.stores,l!==null))for(var f=0;f<l.length;f++){var p=l[f],_=p.getSnapshot;p=p.value;try{if(!hi(_(),p))return!1}catch{return!1}}}if(l=r.child,r.subtreeFlags&16384&&l!==null)l.return=r,r=l;else{if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return!0;r=r.return}r.sibling.return=r.return,r=r.sibling}}return!0}function Tr(n,r){for(r&=~ef,r&=~Cl,n.suspendedLanes|=r,n.pingedLanes&=~r,n=n.expirationTimes;0<r;){var l=31-at(r),f=1<<l;n[l]=-1,r&=~f}}function Mm(n){if((yt&6)!==0)throw Error(t(327));Xs();var r=Ri(n,0);if((r&1)===0)return Hn(n,Ee()),null;var l=Dl(n,r);if(n.tag!==0&&l===2){var f=Vi(n);f!==0&&(r=f,l=sf(n,f))}if(l===1)throw l=ia,Qr(n,0),Tr(n,r),Hn(n,Ee()),l;if(l===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=r,es(n,Vn,Zi),Hn(n,Ee()),null}function af(n,r){var l=yt;yt|=1;try{return n(r)}finally{yt=l,yt===0&&(Ws=Ee()+500,ol&&_r())}}function Jr(n){Er!==null&&Er.tag===0&&(yt&6)===0&&Xs();var r=yt;yt|=1;var l=si.transition,f=Pt;try{if(si.transition=null,Pt=1,n)return n()}finally{Pt=f,si.transition=l,yt=r,(yt&6)===0&&_r()}}function lf(){Zn=Gs.current,Bt(Gs)}function Qr(n,r){n.finishedWork=null,n.finishedLanes=0;var l=n.timeoutHandle;if(l!==-1&&(n.timeoutHandle=-1,o_(l)),Kt!==null)for(l=Kt.return;l!==null;){var f=l;switch(gu(f),f.tag){case 1:f=f.type.childContextTypes,f!=null&&rl();break;case 3:Bs(),Bt(zn),Bt(xn),bu();break;case 5:Cu(f);break;case 4:Bs();break;case 13:Bt(Ht);break;case 19:Bt(Ht);break;case 10:Mu(f.type._context);break;case 22:case 23:lf()}l=l.return}if(an=n,Kt=n=Ar(n.current,null),hn=Zn=r,nn=0,ia=null,ef=Cl=Kr=0,Vn=ra=null,qr!==null){for(r=0;r<qr.length;r++)if(l=qr[r],f=l.interleaved,f!==null){l.interleaved=null;var p=f.next,_=l.pending;if(_!==null){var T=_.next;_.next=p,f.next=T}l.pending=f}qr=null}return n}function Em(n,r){do{var l=Kt;try{if(Su(),gl.current=yl,vl){for(var f=Gt.memoizedState;f!==null;){var p=f.queue;p!==null&&(p.pending=null),f=f.next}vl=!1}if($r=0,on=tn=Gt=null,Ko=!1,Jo=0,Qu.current=null,l===null||l.return===null){nn=1,ia=r,Kt=null;break}e:{var _=n,T=l.return,U=l,z=r;if(r=hn,U.flags|=32768,z!==null&&typeof z=="object"&&typeof z.then=="function"){var Q=z,_e=U,ye=_e.tag;if((_e.mode&1)===0&&(ye===0||ye===11||ye===15)){var ge=_e.alternate;ge?(_e.updateQueue=ge.updateQueue,_e.memoizedState=ge.memoizedState,_e.lanes=ge.lanes):(_e.updateQueue=null,_e.memoizedState=null)}var De=qp(T);if(De!==null){De.flags&=-257,Zp(De,T,U,_,r),De.mode&1&&Yp(_,Q,r),r=De,z=Q;var Ve=r.updateQueue;if(Ve===null){var Ge=new Set;Ge.add(z),r.updateQueue=Ge}else Ve.add(z);break e}else{if((r&1)===0){Yp(_,Q,r),cf();break e}z=Error(t(426))}}else if(Vt&&U.mode&1){var Zt=qp(T);if(Zt!==null){(Zt.flags&65536)===0&&(Zt.flags|=256),Zp(Zt,T,U,_,r),xu(Vs(z,U));break e}}_=z=Vs(z,U),nn!==4&&(nn=2),ra===null?ra=[_]:ra.push(_),_=T;do{switch(_.tag){case 3:_.flags|=65536,r&=-r,_.lanes|=r;var q=Xp(_,z,r);_p(_,q);break e;case 1:U=z;var H=_.type,$=_.stateNode;if((_.flags&128)===0&&(typeof H.getDerivedStateFromError=="function"||$!==null&&typeof $.componentDidCatch=="function"&&(Mr===null||!Mr.has($)))){_.flags|=65536,r&=-r,_.lanes|=r;var Te=jp(_,U,r);_p(_,Te);break e}}_=_.return}while(_!==null)}Am(l)}catch(Ye){r=Ye,Kt===l&&l!==null&&(Kt=l=l.return);continue}break}while(!0)}function wm(){var n=Al.current;return Al.current=yl,n===null?yl:n}function cf(){(nn===0||nn===3||nn===2)&&(nn=4),an===null||(Kr&268435455)===0&&(Cl&268435455)===0||Tr(an,hn)}function Dl(n,r){var l=yt;yt|=2;var f=wm();(an!==n||hn!==r)&&(Zi=null,Qr(n,r));do try{L_();break}catch(p){Em(n,p)}while(!0);if(Su(),yt=l,Al.current=f,Kt!==null)throw Error(t(261));return an=null,hn=0,nn}function L_(){for(;Kt!==null;)Tm(Kt)}function I_(){for(;Kt!==null&&!X();)Tm(Kt)}function Tm(n){var r=bm(n.alternate,n,Zn);n.memoizedProps=n.pendingProps,r===null?Am(n):Kt=r,Qu.current=null}function Am(n){var r=n;do{var l=r.alternate;if(n=r.return,(r.flags&32768)===0){if(l=w_(l,r,Zn),l!==null){Kt=l;return}}else{if(l=T_(l,r),l!==null){l.flags&=32767,Kt=l;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{nn=6,Kt=null;return}}if(r=r.sibling,r!==null){Kt=r;return}Kt=r=n}while(r!==null);nn===0&&(nn=5)}function es(n,r,l){var f=Pt,p=si.transition;try{si.transition=null,Pt=1,D_(n,r,l,f)}finally{si.transition=p,Pt=f}return null}function D_(n,r,l,f){do Xs();while(Er!==null);if((yt&6)!==0)throw Error(t(327));l=n.finishedWork;var p=n.finishedLanes;if(l===null)return null;if(n.finishedWork=null,n.finishedLanes=0,l===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var _=l.lanes|l.childLanes;if(Va(n,_),n===an&&(Kt=an=null,hn=0),(l.subtreeFlags&2064)===0&&(l.flags&2064)===0||bl||(bl=!0,Pm(rt,function(){return Xs(),null})),_=(l.flags&15990)!==0,(l.subtreeFlags&15990)!==0||_){_=si.transition,si.transition=null;var T=Pt;Pt=1;var U=yt;yt|=4,Qu.current=null,C_(n,l),gm(l,n),Q0(lu),Wa=!!au,lu=au=null,n.current=l,R_(l),Ae(),yt=U,Pt=T,si.transition=_}else n.current=l;if(bl&&(bl=!1,Er=n,Pl=p),_=n.pendingLanes,_===0&&(Mr=null),vn(l.stateNode),Hn(n,Ee()),r!==null)for(f=n.onRecoverableError,l=0;l<r.length;l++)p=r[l],f(p.value,{componentStack:p.stack,digest:p.digest});if(Rl)throw Rl=!1,n=nf,nf=null,n;return(Pl&1)!==0&&n.tag!==0&&Xs(),_=n.pendingLanes,(_&1)!==0?n===rf?sa++:(sa=0,rf=n):sa=0,_r(),null}function Xs(){if(Er!==null){var n=ph(Pl),r=si.transition,l=Pt;try{if(si.transition=null,Pt=16>n?16:n,Er===null)var f=!1;else{if(n=Er,Er=null,Pl=0,(yt&6)!==0)throw Error(t(331));var p=yt;for(yt|=4,Oe=n.current;Oe!==null;){var _=Oe,T=_.child;if((Oe.flags&16)!==0){var U=_.deletions;if(U!==null){for(var z=0;z<U.length;z++){var Q=U[z];for(Oe=Q;Oe!==null;){var _e=Oe;switch(_e.tag){case 0:case 11:case 15:na(8,_e,_)}var ye=_e.child;if(ye!==null)ye.return=_e,Oe=ye;else for(;Oe!==null;){_e=Oe;var ge=_e.sibling,De=_e.return;if(fm(_e),_e===Q){Oe=null;break}if(ge!==null){ge.return=De,Oe=ge;break}Oe=De}}}var Ve=_.alternate;if(Ve!==null){var Ge=Ve.child;if(Ge!==null){Ve.child=null;do{var Zt=Ge.sibling;Ge.sibling=null,Ge=Zt}while(Ge!==null)}}Oe=_}}if((_.subtreeFlags&2064)!==0&&T!==null)T.return=_,Oe=T;else e:for(;Oe!==null;){if(_=Oe,(_.flags&2048)!==0)switch(_.tag){case 0:case 11:case 15:na(9,_,_.return)}var q=_.sibling;if(q!==null){q.return=_.return,Oe=q;break e}Oe=_.return}}var H=n.current;for(Oe=H;Oe!==null;){T=Oe;var $=T.child;if((T.subtreeFlags&2064)!==0&&$!==null)$.return=T,Oe=$;else e:for(T=H;Oe!==null;){if(U=Oe,(U.flags&2048)!==0)try{switch(U.tag){case 0:case 11:case 15:Tl(9,U)}}catch(Ye){jt(U,U.return,Ye)}if(U===T){Oe=null;break e}var Te=U.sibling;if(Te!==null){Te.return=U.return,Oe=Te;break e}Oe=U.return}}if(yt=p,_r(),vt&&typeof vt.onPostCommitFiberRoot=="function")try{vt.onPostCommitFiberRoot(wt,n)}catch{}f=!0}return f}finally{Pt=l,si.transition=r}}return!1}function Cm(n,r,l){r=Vs(l,r),r=Xp(n,r,1),n=yr(n,r,1),r=In(),n!==null&&(On(n,1,r),Hn(n,r))}function jt(n,r,l){if(n.tag===3)Cm(n,n,l);else for(;r!==null;){if(r.tag===3){Cm(r,n,l);break}else if(r.tag===1){var f=r.stateNode;if(typeof r.type.getDerivedStateFromError=="function"||typeof f.componentDidCatch=="function"&&(Mr===null||!Mr.has(f))){n=Vs(l,n),n=jp(r,n,1),r=yr(r,n,1),n=In(),r!==null&&(On(r,1,n),Hn(r,n));break}}r=r.return}}function N_(n,r,l){var f=n.pingCache;f!==null&&f.delete(r),r=In(),n.pingedLanes|=n.suspendedLanes&l,an===n&&(hn&l)===l&&(nn===4||nn===3&&(hn&130023424)===hn&&500>Ee()-tf?Qr(n,0):ef|=l),Hn(n,r)}function Rm(n,r){r===0&&((n.mode&1)===0?r=1:(r=di,di<<=1,(di&130023424)===0&&(di=4194304)));var l=In();n=ji(n,r),n!==null&&(On(n,r,l),Hn(n,l))}function U_(n){var r=n.memoizedState,l=0;r!==null&&(l=r.retryLane),Rm(n,l)}function F_(n,r){var l=0;switch(n.tag){case 13:var f=n.stateNode,p=n.memoizedState;p!==null&&(l=p.retryLane);break;case 19:f=n.stateNode;break;default:throw Error(t(314))}f!==null&&f.delete(r),Rm(n,l)}var bm;bm=function(n,r,l){if(n!==null)if(n.memoizedProps!==r.pendingProps||zn.current)Bn=!0;else{if((n.lanes&l)===0&&(r.flags&128)===0)return Bn=!1,E_(n,r,l);Bn=(n.flags&131072)!==0}else Bn=!1,Vt&&(r.flags&1048576)!==0&&lp(r,ll,r.index);switch(r.lanes=0,r.tag){case 2:var f=r.type;El(n,r),n=r.pendingProps;var p=Ds(r,xn.current);ks(r,l),p=Iu(null,r,f,n,p,l);var _=Du();return r.flags|=1,typeof p=="object"&&p!==null&&typeof p.render=="function"&&p.$$typeof===void 0?(r.tag=1,r.memoizedState=null,r.updateQueue=null,kn(f)?(_=!0,sl(r)):_=!1,r.memoizedState=p.state!==null&&p.state!==void 0?p.state:null,Tu(r),p.updater=Sl,r.stateNode=p,p._reactInternals=r,ku(r,f,n,l),r=Gu(null,r,f,!0,_,l)):(r.tag=0,Vt&&_&&mu(r),Ln(null,r,p,l),r=r.child),r;case 16:f=r.elementType;e:{switch(El(n,r),n=r.pendingProps,p=f._init,f=p(f._payload),r.type=f,p=r.tag=z_(f),n=mi(f,n),p){case 0:r=Hu(null,r,f,n,l);break e;case 1:r=tm(null,r,f,n,l);break e;case 11:r=$p(null,r,f,n,l);break e;case 14:r=Kp(null,r,f,mi(f.type,n),l);break e}throw Error(t(306,f,""))}return r;case 0:return f=r.type,p=r.pendingProps,p=r.elementType===f?p:mi(f,p),Hu(n,r,f,p,l);case 1:return f=r.type,p=r.pendingProps,p=r.elementType===f?p:mi(f,p),tm(n,r,f,p,l);case 3:e:{if(nm(r),n===null)throw Error(t(387));f=r.pendingProps,_=r.memoizedState,p=_.element,vp(n,r),pl(r,f,null,l);var T=r.memoizedState;if(f=T.element,_.isDehydrated)if(_={element:f,isDehydrated:!1,cache:T.cache,pendingSuspenseBoundaries:T.pendingSuspenseBoundaries,transitions:T.transitions},r.updateQueue.baseState=_,r.memoizedState=_,r.flags&256){p=Vs(Error(t(423)),r),r=im(n,r,f,l,p);break e}else if(f!==p){p=Vs(Error(t(424)),r),r=im(n,r,f,l,p);break e}else for(qn=mr(r.stateNode.containerInfo.firstChild),Yn=r,Vt=!0,pi=null,l=mp(r,null,f,l),r.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling;else{if(Fs(),f===p){r=qi(n,r,l);break e}Ln(n,r,f,l)}r=r.child}return r;case 5:return yp(r),n===null&&_u(r),f=r.type,p=r.pendingProps,_=n!==null?n.memoizedProps:null,T=p.children,cu(f,p)?T=null:_!==null&&cu(f,_)&&(r.flags|=32),em(n,r),Ln(n,r,T,l),r.child;case 6:return n===null&&_u(r),null;case 13:return rm(n,r,l);case 4:return Au(r,r.stateNode.containerInfo),f=r.pendingProps,n===null?r.child=Os(r,null,f,l):Ln(n,r,f,l),r.child;case 11:return f=r.type,p=r.pendingProps,p=r.elementType===f?p:mi(f,p),$p(n,r,f,p,l);case 7:return Ln(n,r,r.pendingProps,l),r.child;case 8:return Ln(n,r,r.pendingProps.children,l),r.child;case 12:return Ln(n,r,r.pendingProps.children,l),r.child;case 10:e:{if(f=r.type._context,p=r.pendingProps,_=r.memoizedProps,T=p.value,Ot(fl,f._currentValue),f._currentValue=T,_!==null)if(hi(_.value,T)){if(_.children===p.children&&!zn.current){r=qi(n,r,l);break e}}else for(_=r.child,_!==null&&(_.return=r);_!==null;){var U=_.dependencies;if(U!==null){T=_.child;for(var z=U.firstContext;z!==null;){if(z.context===f){if(_.tag===1){z=Yi(-1,l&-l),z.tag=2;var Q=_.updateQueue;if(Q!==null){Q=Q.shared;var _e=Q.pending;_e===null?z.next=z:(z.next=_e.next,_e.next=z),Q.pending=z}}_.lanes|=l,z=_.alternate,z!==null&&(z.lanes|=l),Eu(_.return,l,r),U.lanes|=l;break}z=z.next}}else if(_.tag===10)T=_.type===r.type?null:_.child;else if(_.tag===18){if(T=_.return,T===null)throw Error(t(341));T.lanes|=l,U=T.alternate,U!==null&&(U.lanes|=l),Eu(T,l,r),T=_.sibling}else T=_.child;if(T!==null)T.return=_;else for(T=_;T!==null;){if(T===r){T=null;break}if(_=T.sibling,_!==null){_.return=T.return,T=_;break}T=T.return}_=T}Ln(n,r,p.children,l),r=r.child}return r;case 9:return p=r.type,f=r.pendingProps.children,ks(r,l),p=ii(p),f=f(p),r.flags|=1,Ln(n,r,f,l),r.child;case 14:return f=r.type,p=mi(f,r.pendingProps),p=mi(f.type,p),Kp(n,r,f,p,l);case 15:return Jp(n,r,r.type,r.pendingProps,l);case 17:return f=r.type,p=r.pendingProps,p=r.elementType===f?p:mi(f,p),El(n,r),r.tag=1,kn(f)?(n=!0,sl(r)):n=!1,ks(r,l),Gp(r,f,p),ku(r,f,p,l),Gu(null,r,f,!0,n,l);case 19:return om(n,r,l);case 22:return Qp(n,r,l)}throw Error(t(156,r.tag))};function Pm(n,r){return ee(n,r)}function O_(n,r,l,f){this.tag=n,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=r,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=f,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function oi(n,r,l,f){return new O_(n,r,l,f)}function uf(n){return n=n.prototype,!(!n||!n.isReactComponent)}function z_(n){if(typeof n=="function")return uf(n)?1:0;if(n!=null){if(n=n.$$typeof,n===ae)return 11;if(n===pe)return 14}return 2}function Ar(n,r){var l=n.alternate;return l===null?(l=oi(n.tag,r,n.key,n.mode),l.elementType=n.elementType,l.type=n.type,l.stateNode=n.stateNode,l.alternate=n,n.alternate=l):(l.pendingProps=r,l.type=n.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=n.flags&14680064,l.childLanes=n.childLanes,l.lanes=n.lanes,l.child=n.child,l.memoizedProps=n.memoizedProps,l.memoizedState=n.memoizedState,l.updateQueue=n.updateQueue,r=n.dependencies,l.dependencies=r===null?null:{lanes:r.lanes,firstContext:r.firstContext},l.sibling=n.sibling,l.index=n.index,l.ref=n.ref,l}function Nl(n,r,l,f,p,_){var T=2;if(f=n,typeof n=="function")uf(n)&&(T=1);else if(typeof n=="string")T=5;else e:switch(n){case O:return ts(l.children,p,_,r);case Y:T=8,p|=8;break;case L:return n=oi(12,l,r,p|2),n.elementType=L,n.lanes=_,n;case ne:return n=oi(13,l,r,p),n.elementType=ne,n.lanes=_,n;case de:return n=oi(19,l,r,p),n.elementType=de,n.lanes=_,n;case ce:return Ul(l,p,_,r);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case b:T=10;break e;case V:T=9;break e;case ae:T=11;break e;case pe:T=14;break e;case oe:T=16,f=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return r=oi(T,l,r,p),r.elementType=n,r.type=f,r.lanes=_,r}function ts(n,r,l,f){return n=oi(7,n,f,r),n.lanes=l,n}function Ul(n,r,l,f){return n=oi(22,n,f,r),n.elementType=ce,n.lanes=l,n.stateNode={isHidden:!1},n}function ff(n,r,l){return n=oi(6,n,null,r),n.lanes=l,n}function df(n,r,l){return r=oi(4,n.children!==null?n.children:[],n.key,r),r.lanes=l,r.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},r}function k_(n,r,l,f,p){this.tag=r,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ei(0),this.expirationTimes=ei(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ei(0),this.identifierPrefix=f,this.onRecoverableError=p,this.mutableSourceEagerHydrationData=null}function hf(n,r,l,f,p,_,T,U,z){return n=new k_(n,r,l,U,z),r===1?(r=1,_===!0&&(r|=8)):r=0,_=oi(3,null,null,r),n.current=_,_.stateNode=n,_.memoizedState={element:f,isDehydrated:l,cache:null,transitions:null,pendingSuspenseBoundaries:null},Tu(_),n}function B_(n,r,l){var f=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:D,key:f==null?null:""+f,children:n,containerInfo:r,implementation:l}}function Lm(n){if(!n)return vr;n=n._reactInternals;e:{if(Ci(n)!==n||n.tag!==1)throw Error(t(170));var r=n;do{switch(r.tag){case 3:r=r.stateNode.context;break e;case 1:if(kn(r.type)){r=r.stateNode.__reactInternalMemoizedMergedChildContext;break e}}r=r.return}while(r!==null);throw Error(t(171))}if(n.tag===1){var l=n.type;if(kn(l))return sp(n,l,r)}return r}function Im(n,r,l,f,p,_,T,U,z){return n=hf(l,f,!0,n,p,_,T,U,z),n.context=Lm(null),l=n.current,f=In(),p=wr(l),_=Yi(f,p),_.callback=r??null,yr(l,_,p),n.current.lanes=p,On(n,p,f),Hn(n,f),n}function Fl(n,r,l,f){var p=r.current,_=In(),T=wr(p);return l=Lm(l),r.context===null?r.context=l:r.pendingContext=l,r=Yi(_,T),r.payload={element:n},f=f===void 0?null:f,f!==null&&(r.callback=f),n=yr(p,r,T),n!==null&&(_i(n,p,T,_),hl(n,p,T)),T}function Ol(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Dm(n,r){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var l=n.retryLane;n.retryLane=l!==0&&l<r?l:r}}function pf(n,r){Dm(n,r),(n=n.alternate)&&Dm(n,r)}function V_(){return null}var Nm=typeof reportError=="function"?reportError:function(n){console.error(n)};function mf(n){this._internalRoot=n}zl.prototype.render=mf.prototype.render=function(n){var r=this._internalRoot;if(r===null)throw Error(t(409));Fl(n,r,null,null)},zl.prototype.unmount=mf.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var r=n.containerInfo;Jr(function(){Fl(null,n,null,null)}),r[Hi]=null}};function zl(n){this._internalRoot=n}zl.prototype.unstable_scheduleHydration=function(n){if(n){var r=vh();n={blockedOn:null,target:n,priority:r};for(var l=0;l<dr.length&&r!==0&&r<dr[l].priority;l++);dr.splice(l,0,n),l===0&&yh(n)}};function gf(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function kl(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Um(){}function H_(n,r,l,f,p){if(p){if(typeof f=="function"){var _=f;f=function(){var Q=Ol(T);_.call(Q)}}var T=Im(r,f,n,0,null,!1,!1,"",Um);return n._reactRootContainer=T,n[Hi]=T.current,Go(n.nodeType===8?n.parentNode:n),Jr(),T}for(;p=n.lastChild;)n.removeChild(p);if(typeof f=="function"){var U=f;f=function(){var Q=Ol(z);U.call(Q)}}var z=hf(n,0,!1,null,null,!1,!1,"",Um);return n._reactRootContainer=z,n[Hi]=z.current,Go(n.nodeType===8?n.parentNode:n),Jr(function(){Fl(r,z,l,f)}),z}function Bl(n,r,l,f,p){var _=l._reactRootContainer;if(_){var T=_;if(typeof p=="function"){var U=p;p=function(){var z=Ol(T);U.call(z)}}Fl(r,T,n,p)}else T=H_(l,r,n,p,f);return Ol(T)}mh=function(n){switch(n.tag){case 3:var r=n.stateNode;if(r.current.memoizedState.isDehydrated){var l=en(r.pendingLanes);l!==0&&(kc(r,l|1),Hn(r,Ee()),(yt&6)===0&&(Ws=Ee()+500,_r()))}break;case 13:Jr(function(){var f=ji(n,1);if(f!==null){var p=In();_i(f,n,1,p)}}),pf(n,1)}},Bc=function(n){if(n.tag===13){var r=ji(n,134217728);if(r!==null){var l=In();_i(r,n,134217728,l)}pf(n,134217728)}},gh=function(n){if(n.tag===13){var r=wr(n),l=ji(n,r);if(l!==null){var f=In();_i(l,n,r,f)}pf(n,r)}},vh=function(){return Pt},_h=function(n,r){var l=Pt;try{return Pt=n,r()}finally{Pt=l}},be=function(n,r,l){switch(r){case"input":if(dt(n,l),r=l.name,l.type==="radio"&&r!=null){for(l=n;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll("input[name="+JSON.stringify(""+r)+'][type="radio"]'),r=0;r<l.length;r++){var f=l[r];if(f!==n&&f.form===n.form){var p=il(f);if(!p)throw Error(t(90));gt(f),dt(f,p)}}}break;case"textarea":me(n,l);break;case"select":r=l.value,r!=null&&N(n,!!l.multiple,r,!1)}},zt=af,Qt=Jr;var G_={usingClientEntryPoint:!1,Events:[jo,Ls,il,Le,ot,af]},oa={findFiberByHostInstance:Wr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},W_={bundleType:oa.bundleType,version:oa.version,rendererPackageName:oa.rendererPackageName,rendererConfig:oa.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:E.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=R(n),n===null?null:n.stateNode},findFiberByHostInstance:oa.findFiberByHostInstance||V_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Vl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Vl.isDisabled&&Vl.supportsFiber)try{wt=Vl.inject(W_),vt=Vl}catch{}}return Gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=G_,Gn.createPortal=function(n,r){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!gf(r))throw Error(t(200));return B_(n,r,null,l)},Gn.createRoot=function(n,r){if(!gf(n))throw Error(t(299));var l=!1,f="",p=Nm;return r!=null&&(r.unstable_strictMode===!0&&(l=!0),r.identifierPrefix!==void 0&&(f=r.identifierPrefix),r.onRecoverableError!==void 0&&(p=r.onRecoverableError)),r=hf(n,1,!1,null,null,l,!1,f,p),n[Hi]=r.current,Go(n.nodeType===8?n.parentNode:n),new mf(r)},Gn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var r=n._reactInternals;if(r===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=R(r),n=n===null?null:n.stateNode,n},Gn.flushSync=function(n){return Jr(n)},Gn.hydrate=function(n,r,l){if(!kl(r))throw Error(t(200));return Bl(null,n,r,!0,l)},Gn.hydrateRoot=function(n,r,l){if(!gf(n))throw Error(t(405));var f=l!=null&&l.hydratedSources||null,p=!1,_="",T=Nm;if(l!=null&&(l.unstable_strictMode===!0&&(p=!0),l.identifierPrefix!==void 0&&(_=l.identifierPrefix),l.onRecoverableError!==void 0&&(T=l.onRecoverableError)),r=Im(r,null,n,1,l??null,p,!1,_,T),n[Hi]=r.current,Go(n),f)for(n=0;n<f.length;n++)l=f[n],p=l._getVersion,p=p(l._source),r.mutableSourceEagerHydrationData==null?r.mutableSourceEagerHydrationData=[l,p]:r.mutableSourceEagerHydrationData.push(l,p);return new zl(r)},Gn.render=function(n,r,l){if(!kl(r))throw Error(t(200));return Bl(null,n,r,!1,l)},Gn.unmountComponentAtNode=function(n){if(!kl(n))throw Error(t(40));return n._reactRootContainer?(Jr(function(){Bl(null,null,n,!1,function(){n._reactRootContainer=null,n[Hi]=null})}),!0):!1},Gn.unstable_batchedUpdates=af,Gn.unstable_renderSubtreeIntoContainer=function(n,r,l,f){if(!kl(l))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Bl(n,r,l,!1,f)},Gn.version="18.3.1-next-f1338f8080-20240426",Gn}var Gm;function ex(){if(Gm)return xf.exports;Gm=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),xf.exports=Q_(),xf.exports}var Wm;function tx(){if(Wm)return Hl;Wm=1;var s=ex();return Hl.createRoot=s.createRoot,Hl.hydrateRoot=s.hydrateRoot,Hl}var nx=tx();const ix=Kd(nx),rx={},Xm=s=>{let e;const t=new Set,i=(m,g)=>{const v=typeof m=="function"?m(e):m;if(!Object.is(v,e)){const y=e;e=g??(typeof v!="object"||v===null)?v:Object.assign({},e,v),t.forEach(M=>M(e,y))}},o=()=>e,d={setState:i,getState:o,getInitialState:()=>h,subscribe:m=>(t.add(m),()=>t.delete(m)),destroy:()=>{(rx?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),t.clear()}},h=e=s(i,o,d);return d},sx=s=>s?Xm(s):Xm;var Mf={exports:{}},Ef={},wf={exports:{}},Tf={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var jm;function ox(){if(jm)return Tf;jm=1;var s=Na();function e(g,v){return g===v&&(g!==0||1/g===1/v)||g!==g&&v!==v}var t=typeof Object.is=="function"?Object.is:e,i=s.useState,o=s.useEffect,a=s.useLayoutEffect,c=s.useDebugValue;function u(g,v){var y=v(),M=i({inst:{value:y,getSnapshot:v}}),w=M[0].inst,S=M[1];return a(function(){w.value=y,w.getSnapshot=v,d(w)&&S({inst:w})},[g,y,v]),o(function(){return d(w)&&S({inst:w}),g(function(){d(w)&&S({inst:w})})},[g]),c(y),y}function d(g){var v=g.getSnapshot;g=g.value;try{var y=v();return!t(g,y)}catch{return!0}}function h(g,v){return v()}var m=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?h:u;return Tf.useSyncExternalStore=s.useSyncExternalStore!==void 0?s.useSyncExternalStore:m,Tf}var Ym;function ax(){return Ym||(Ym=1,wf.exports=ox()),wf.exports}/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var qm;function lx(){if(qm)return Ef;qm=1;var s=Na(),e=ax();function t(h,m){return h===m&&(h!==0||1/h===1/m)||h!==h&&m!==m}var i=typeof Object.is=="function"?Object.is:t,o=e.useSyncExternalStore,a=s.useRef,c=s.useEffect,u=s.useMemo,d=s.useDebugValue;return Ef.useSyncExternalStoreWithSelector=function(h,m,g,v,y){var M=a(null);if(M.current===null){var w={hasValue:!1,value:null};M.current=w}else w=M.current;M=u(function(){function x(D){if(!I){if(I=!0,C=D,D=v(D),y!==void 0&&w.hasValue){var O=w.value;if(y(O,D))return E=O}return E=D}if(O=E,i(C,D))return O;var Y=v(D);return y!==void 0&&y(O,Y)?(C=D,O):(C=D,E=Y)}var I=!1,C,E,Z=g===void 0?null:g;return[function(){return x(m())},Z===null?void 0:function(){return x(Z())}]},[m,g,v,y]);var S=o(h,M[0],M[1]);return c(function(){w.hasValue=!0,w.value=S},[S]),d(S),S},Ef}var Zm;function cx(){return Zm||(Zm=1,Mf.exports=lx()),Mf.exports}var ux=cx();const fx=Kd(ux),yv={},{useDebugValue:dx}=xv,{useSyncExternalStoreWithSelector:hx}=fx;let $m=!1;const px=s=>s;function mx(s,e=px,t){(yv?"production":void 0)!=="production"&&t&&!$m&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),$m=!0);const i=hx(s.subscribe,s.getState,s.getServerState||s.getInitialState,e,t);return dx(i),i}const Km=s=>{(yv?"production":void 0)!=="production"&&typeof s!="function"&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");const e=typeof s=="function"?sx(s):s,t=(i,o)=>mx(e,i,o);return Object.assign(t,e),t},gx=s=>s?Km(s):Km,Tt={minX:-150,maxX:150,minZ:-110,maxZ:110,depth:220},ui=20,Rt=[{name:"倒车入库区",x0:-140,z0:-95,x1:-20,z1:-25},{name:"侧方停车区",x0:-10,z0:-95,x1:140,z1:-25},{name:"曲线行驶区",x0:-140,z0:-15,x1:-30,z1:45},{name:"直角转弯区",x0:-20,z0:-15,x1:60,z1:45},{name:"坡道定点区",x0:70,z0:-15,x1:140,z1:45},{name:"综合训练道",x0:-140,z0:55,x1:140,z1:100}];function vx(s){return function(){let e=s+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}const Sv=vx(20261119),Tn=(s,e)=>s+Sv()*(e-s),fn=s=>s[Math.floor(Sv()*s.length)],Mv=[],sd=new Map,Ev={base:0,lane:0,pile:0,sign:0,device:0},_x={base:"BASE",lane:"LANE",pile:"PILE",sign:"SIGN",device:"DEV"};function xx(s,e){return`${s}_${e}`}function yx(s){let e,t,i,o;if(s.geom.type==="point")e=t=s.geom.x,i=o=s.geom.z;else{const h=s.geom.points.map(g=>g[0]),m=s.geom.points.map(g=>g[1]);e=Math.min(...h),t=Math.max(...h),i=Math.min(...m),o=Math.max(...m)}const a=Math.floor(e/ui),c=Math.floor(t/ui),u=Math.floor(i/ui),d=Math.floor(o/ui);for(let h=a;h<=c;h++)for(let m=u;m<=d;m++){const g=xx(h,m);let v=sd.get(g);v||(v={cx:h,cz:m,featureIds:[]},sd.set(g,v)),v.featureIds.push(s.id)}}function un(s,e,t,i,o="",a={}){const c=++Ev[s],u=`${_x[s]}-${String(c).padStart(5,"0")}`,d={id:u,layer:s,kind:e,name:t,geom:i,label:o,visible:null,attrs:{编号:u,状态:"在用",...a}};return Mv.push(d),yx(d),d}const Ui=s=>Math.max(Tt.minX+2,Math.min(Tt.maxX-2,s)),Fi=s=>Math.max(Tt.minZ+2,Math.min(Tt.maxZ-2,s));function Wn(s){return{x:Tn(s.x0,s.x1),z:Tn(s.z0,s.z1)}}function Sx(){for(let t=Tt.minX;t<Tt.maxX;t+=ui)for(let i=Tt.minZ;i<Tt.maxZ;i+=ui){const o=Math.min(t+ui,Tt.maxX),a=Math.min(i+ui,Tt.maxZ);un("base","pavement","训练场地坪",{type:"area",kind:"pavement",points:[[t,i],[o,i],[o,a],[t,a]]})}const s=20;for(let t=Tt.minX;t<Tt.maxX;t+=s){const i=Math.min(s,Tt.maxX-t);un("base","wall","围墙",{type:"area",kind:"wall",points:[[t,Tt.minZ],[t+i,Tt.minZ],[t+i,Tt.minZ+1.2],[t,Tt.minZ+1.2]]}),un("base","wall","围墙",{type:"area",kind:"wall",points:[[t,Tt.maxZ-1.2],[t+i,Tt.maxZ-1.2],[t+i,Tt.maxZ],[t,Tt.maxZ]]})}const e=[["综合教学楼",-130,88,36,18],["室内训练馆",-70,88,30,16],["维修车库",20,88,28,14],["配电设备房",118,90,18,12]];for(const[t,i,o,a,c]of e)un("base","building",t,{type:"area",kind:"building",points:[[i,o],[i+a,o],[i+a,o+c],[i,o+c]]},t);for(let t=0;t<90;t++){const i=Tn(3,10),o=Tn(2,6),a=Wn(fn(Rt));un("base","green","绿化带",{type:"area",kind:"green",points:[[a.x,a.z],[a.x+i,a.z],[a.x+i,a.z+o],[a.x,a.z+o]]})}for(const t of[Rt[0],Rt[1]])for(let i=t.x0+6;i<t.x1-10;i+=9)for(let o=t.z0+6;o<t.z1-10;o+=8)un("base","bay","库位地坪",{type:"area",kind:"bay",points:[[i,o],[i+2.5,o],[i+2.5,o+5],[i,o+5]]});for(let t=0;t<120;t++){const i=Wn(fn(Rt)),o=Tn(4,12),a=Tn(4,10);un("base","pavement","硬化地面",{type:"area",kind:"pavement",points:[[i.x,i.z],[i.x+o,i.z],[i.x+o,i.z+a],[i.x,i.z+a]]})}}function pn(s,e,t,i,o,a,c={}){un("lane",o,a,{type:"line",points:[[Ui(s),Fi(e)],[Ui(t),Fi(i)]]},"",c)}function Mx(){for(const i of[Rt[0],Rt[1]])for(let o=i.x0+6;o<i.x1-10;o+=9)for(let a=i.z0+6;a<i.z1-10;a+=8)pn(o,a,o,a+5,"solid","库位边线",{所属科目:i.name}),pn(o+2.5,a,o+2.5,a+5,"solid","库位中线",{所属科目:i.name}),pn(o,a,o+2.5,a,"solid","库位底线",{所属科目:i.name}),pn(o,a+5,o+1,a+5,"dashed","库位口虚线",{所属科目:i.name}),pn(o+1.5,a+5,o+2.5,a+5,"dashed","库位口虚线",{所属科目:i.name});for(let i=0;i<12;i++){const o=Rt[2],a=o.x0+4+i%4*26,c=o.z0+6+Math.floor(i/4)*18,u=22;let d=null;for(let h=0;h<=48;h++){const m=a+h/48*u,g=c+Math.sin(h/48*Math.PI*2)*3.2;d&&pn(d[0],d[1],m,g,"solid","曲线路缘线",{所属科目:"曲线行驶区"}),d=[m,g]}}for(let i=0;i<18;i++){const o=Rt[3],a=o.x0+4+i%5*15,c=o.z0+5+Math.floor(i/5)*14;pn(a,c,a+9,c,"edge","直角转弯边线"),pn(a+9,c,a+9,c+8,"edge","直角转弯边线"),pn(a,c+3.5,a+9,c+3.5,"dashed","通道引导虚线")}const s=Rt[5];for(let i=s.z0+8;i<s.z1-4;i+=9){pn(s.x0+4,i,s.x1-4,i,"edge","车道边缘线");for(let o=s.x0+6;o<s.x1-8;o+=4)pn(o,i+3.2,o+2,i+3.2,"dashed","车道中心虚线")}const e=Rt[4];for(let i=e.x0+6;i<e.x1-8;i+=12)for(let o=e.z0+6;o<e.z1-8;o+=14)pn(i,o,i+8,o,"stop","定点停止线"),pn(i,o-4,i,o+6,"edge","坡道边线"),pn(i+8,o-4,i+8,o+6,"edge","坡道边线");for(let i=0;i<44;i++){const o=Wn(fn([Rt[5],Rt[3],Rt[4]]));for(let a=0;a<8;a++)pn(o.x+a*.6,o.z,o.x+a*.6,o.z+4,"solid","斑马线条纹")}const t=["直行箭头","左转箭头","右转箭头","掉头箭头"];for(let i=0;i<420;i++){const o=Wn(fn(Rt)),a=fn(t);un("lane","guide",a,{type:"line",points:[[o.x,o.z-1.6],[o.x,o.z+1.6],[o.x-.9,o.z+.7],[o.x,o.z+1.6],[o.x+.9,o.z+.7]]},"",{所属科目:fn(Rt).name})}for(let i=0;i<1500;i++){const o=Wn(fn([Rt[0],Rt[1]]));pn(o.x,o.z,o.x+.8,o.z,"solid","地面编号刻线")}for(let i=0;i<900;i++){const o=Wn(fn([Rt[5],Rt[3],Rt[4]]));pn(o.x,o.z,o.x+Tn(.5,1.4),o.z+Tn(-.3,.3),"dashed","车道分界短线")}}function Ex(){const s=["Φ75mm 钢管桩","Φ110mm 感应桩","橡胶限位桩"],e=[Rt[0],Rt[1],Rt[3],Rt[4]];for(let t=0;t<2e3;t++){const i=fn(e),o=Wn(i);un("pile","pole","训练标杆",{type:"point",x:Ui(o.x),z:Fi(o.z),rot:Tn(0,360),size:Tn(.8,1.2)},"",{规格:s[0],所属科目:i.name})}for(let t=0;t<900;t++){const i=fn(Rt),o=Wn(i),a=un("pile","sensor","感应桩",{type:"point",x:Ui(o.x),z:Fi(o.z),rot:Tn(0,360),size:1.1},"",{规格:s[1],所属科目:i.name});t%8===0&&(a.label=a.id)}for(let t=0;t<500;t++){const i=fn(e),o=Wn(i),a=un("pile","limit","限位桩",{type:"point",x:Ui(o.x),z:Fi(o.z),rot:0,size:1},"",{规格:s[2],所属科目:i.name});t%10===0&&(a.label=a.id)}}function wx(){const s=["限速标志","限宽标志","注意行人","弯道警告","坡道警告","学校区域"],e=["停车让行","减速让行","禁止鸣笛","直行指令","掉头指令"];for(let t=0;t<550;t++){const i=Wn(fn(Rt)),o=fn(s),a=un("sign","signWarn",o,{type:"point",x:Ui(i.x),z:Fi(i.z),rot:Tn(0,360),size:1.2},o,{板面规格:"△900mm"});a.label=o}for(let t=0;t<550;t++){const i=Wn(fn(Rt)),o=fn(e);un("sign","signOrder",o,{type:"point",x:Ui(i.x),z:Fi(i.z),rot:Tn(0,360),size:1.1},o,{板面规格:"Φ800mm"})}for(let t=0;t<300;t++){const i=fn(Rt),o=Wn(i),a=`${i.name}告示牌`;un("sign","signBoard",a,{type:"point",x:Ui(o.x),z:Fi(o.z),rot:Tn(0,360),size:1.6},a,{板面规格:"1200×800mm",所属科目:i.name})}}function Tx(){let s=0;for(let e=Tt.minX+15;e<Tt.maxX-10;e+=24)for(const t of[Tt.minZ+8,Tt.maxZ-8]){const i=un("device","lamp","照明杆",{type:"point",x:e,z:t,size:1.8},"",{规格:"12m 双臂路灯",功率:"2×150W LED"});s++%2===0&&(i.label=i.id)}for(let e=0;e<160;e++){const t=fn(Rt),i=Wn(t),o=un("device","camera","监控摄像头",{type:"point",x:Ui(i.x),z:Fi(i.z),rot:Tn(0,360),size:1.4},"",{型号:"球型云台摄像机",覆盖区域:t.name});o.label=o.id}for(let e=0;e<80;e++){const t=Wn(fn(Rt));un("device","signal","信号设备",{type:"point",x:Ui(t.x),z:Fi(t.z),rot:Tn(0,360),size:1.2},"",{型号:"地感信号机"})}}function Ax(){Sx(),Mx(),Ex(),wx(),Tx();const s=["张伟","王芳","李娜","刘洋","陈静","杨磊","赵敏","黄强","周婷","吴昊","徐丽","孙鹏"].map((e,t)=>({id:`STU-${String(t+1).padStart(3,"0")}`,name:e,classNo:`C2-${2601+t%3}`}));return{features:Mv,grid:sd,layerCounts:{...Ev},students:s}}function Cx(s){return s<=.15?100:s<=.3?90:s<=.5?75:s<=1?55:Math.max(0,Math.round(100-(s-.5)*50))}function Jm(s,e,t){const i=[],o=[];for(const a of s){const c=e.get(a.featureId);if(!c)continue;const u=t.get(a.featureId);if(!u){o.push(a.featureId),i.push({featureId:a.featureId,name:c.name,layer:c.layer,deviation:1/0,autoScore:0,finalScore:null,comment:"未摆放,系统记 0 分"});continue}const d=c.geom,h=d.type==="point"?d.x:0,m=d.type==="point"?d.z:0,g=d.type==="point"?Math.hypot(u.x-h,u.z-m):Rx(c,u);i.push({featureId:a.featureId,name:c.name,layer:c.layer,deviation:Math.round(g*1e3)/1e3,autoScore:Cx(g),finalScore:null,comment:bx(g)})}return{items:i,missing:o}}function Rx(s,e){if(s.geom.type==="point")return Math.hypot(e.x-s.geom.x,e.z-s.geom.z);const t=s.geom.points;let i=1/0;for(let o=0;o<t.length-1;o++){const[a,c]=t[o],[u,d]=t[o+1],h=u-a,m=d-c,g=h*h+m*m||1e-9;let v=((e.x-a)*h+(e.z-c)*m)/g;v=Math.max(0,Math.min(1,v));const y=a+v*h,M=c+v*m;i=Math.min(i,Math.hypot(e.x-y,e.z-M))}return i}function bx(s){return s<=.15?"偏差合格,点位准确":s<=.3?"轻微偏差,基本到位":s<=.5?"偏差偏大,注意参照点位":s<=1?"偏差过大,需重新练习":"严重偏离,建议重学该点位"}function wv(s,e,t){const i=new Map(e.map(h=>[h.featureId,h])),o=Jm(s.pileIds.map(h=>({featureId:h})),t,i),a=Jm(s.laneIds.map(h=>({featureId:h})),t,i),c=[...o.items,...a.items],u=h=>h.length?h.reduce((m,g)=>m+g.autoScore,0)/h.length:0,d=Math.round(u(o.items)*.6+u(a.items)*.4);return{items:c,total:d,missing:[...o.missing,...a.missing]}}function Tv(s){return[...s.pileScores,...s.laneScores].filter(e=>e.deviation>.3||e.autoScore===0).sort((e,t)=>t.deviation-e.deviation)}function Px(s){return s.finalScore??s.autoScore}function Ic(s){return s.reviewed&&s.finalTotal!==null?s.finalTotal:s.autoTotal}const Ur=Ax(),la=new Map(Ur.features.map(s=>[s.id,s])),Jd="dsfm-state-v1";function Lx(){try{const s=localStorage.getItem(Jd);return s?JSON.parse(s):{}}catch{return{}}}function ya(s){const e=s(),t={overrides:e.overrides,tasks:e.tasks,submissions:e.submissions,role:e.role,currentStudentId:e.currentStudentId};try{localStorage.setItem(Jd,JSON.stringify(t))}catch{}}function Rr(s,e,t){s(t),ya(e)}function Ix(s,e,t){const i=e[s.id],o=(i==null?void 0:i.layer)??s.layer,a=(i==null?void 0:i.visible)??s.visible,c=t[o]&&(a===null?!0:a);return{layer:o,visible:c}}function ds(s,e){return Ix(s,e.overrides,e.layerVisible)}const ca=Lx(),Se=gx((s,e)=>({features:Ur.features,featureMap:la,grid:Ur.grid,layerCounts:Ur.layerCounts,students:Ur.students,layerVisible:{base:!0,lane:!0,pile:!0,sign:!0,device:!0},overrides:ca.overrides??{},selectedIds:[],hoverId:null,blinkId:null,blinkNonce:0,focusNonce:0,focusTargetId:null,viewStats:{lod:1,zoom:1,visibleCells:0,visibleFeatures:0,totalCells:0},role:ca.role??"coach",currentStudentId:ca.currentStudentId??Ur.students[0].id,tasks:ca.tasks??[],taskDraft:null,submissions:ca.submissions??[],placementMode:!1,workingPlacements:[],activeSubmissionId:null,sceneVersion:0,toggleLayer:t=>{Rr(s,e,i=>({layerVisible:{...i.layerVisible,[t]:!i.layerVisible[t]}}))},setLayerVisible:(t,i)=>{Rr(s,e,o=>({layerVisible:{...o.layerVisible,[t]:i}}))},setSelected:t=>s({selectedIds:t}),setHover:t=>s({hoverId:t}),batchSetLayer:(t,i)=>Rr(s,e,o=>{const a={...o.overrides};for(const c of t)la.get(c)&&(a[c]={...a[c],layer:i});return{overrides:a,sceneVersion:o.sceneVersion+1}}),batchSetVisible:(t,i)=>Rr(s,e,o=>{const a={...o.overrides};for(const c of t)a[c]={...a[c],visible:i};return{overrides:a,sceneVersion:o.sceneVersion+1}}),resetOverrides:t=>Rr(s,e,i=>{const o={...i.overrides};for(const a of t)delete o[a];return{overrides:o,sceneVersion:i.sceneVersion+1}}),searchAndLocate:t=>{const i=t.trim().toUpperCase();if(!i)return null;let o=la.get(i);return o||(o=Ur.features.find(a=>a.id.toUpperCase().startsWith(i))),o||(o=Ur.features.find(a=>a.label&&a.label.includes(t.trim()))),o?(s(a=>({blinkId:o.id,blinkNonce:a.blinkNonce+1,focusTargetId:o.id,focusNonce:a.focusNonce+1,selectedIds:[o.id]})),o):null},setViewStats:t=>s({viewStats:t}),setRole:t=>{s({role:t,placementMode:!1}),ya(e)},setCurrentStudent:t=>{s({currentStudentId:t,workingPlacements:[],placementMode:!1}),ya(e)},startTaskDraft:()=>s({taskDraft:{pileIds:[],laneIds:[]}}),cancelTaskDraft:()=>s({taskDraft:null}),addDraftRefs:t=>s(i=>{if(!i.taskDraft)return{};const o={pileIds:[...i.taskDraft.pileIds],laneIds:[...i.taskDraft.laneIds]};for(const a of t){const c=la.get(a);c&&(c.layer==="pile"&&!o.pileIds.includes(a)&&o.pileIds.push(a),c.layer==="lane"&&!o.laneIds.includes(a)&&o.laneIds.push(a))}return{taskDraft:o}}),removeDraftRef:t=>s(i=>i.taskDraft?{taskDraft:{pileIds:i.taskDraft.pileIds.filter(o=>o!==t),laneIds:i.taskDraft.laneIds.filter(o=>o!==t)}}:{}),createTask:(t,i,o)=>{const a=e();if(!a.taskDraft||!a.taskDraft.pileIds.length&&!a.taskDraft.laneIds.length)return null;const c={id:`TASK-${String(a.tasks.length+1).padStart(4,"0")}`,title:t,subject:i,requirement:o,pileIds:a.taskDraft.pileIds,laneIds:a.taskDraft.laneIds,createdAt:Date.now(),creator:"李教练"};return s(u=>({tasks:[...u.tasks,c],taskDraft:null})),ya(e),c},deleteTask:t=>Rr(s,e,i=>({tasks:i.tasks.filter(o=>o.id!==t)})),setPlacementMode:t=>s({placementMode:t}),upsertPlacement:t=>s(i=>({workingPlacements:[...i.workingPlacements.filter(a=>a.featureId!==t.featureId),t]})),removePlacement:t=>s(i=>({workingPlacements:i.workingPlacements.filter(o=>o.featureId!==t)})),clearPlacements:()=>s({workingPlacements:[]}),submitForTask:t=>{const i=e(),o=i.tasks.find(d=>d.id===t);if(!o)return null;const a=wv(o,i.workingPlacements,la),c=new Set(o.pileIds),u={id:`SUB-${Date.now()}`,taskId:t,student:i.currentStudentId,placements:i.workingPlacements.map(d=>({...d})),pileScores:a.items.filter(d=>c.has(d.featureId)),laneScores:a.items.filter(d=>!c.has(d.featureId)),autoTotal:a.total,finalTotal:null,reviewed:!1,reviewComment:"",submittedAt:Date.now()};return s(d=>({submissions:[...d.submissions,u],workingPlacements:[],placementMode:!1,activeSubmissionId:u.id})),ya(e),u},setActiveSubmission:t=>s({activeSubmissionId:t}),setItemScore:(t,i,o,a)=>Rr(s,e,c=>({submissions:c.submissions.map(u=>{if(u.id!==t)return u;const d=h=>h.map(m=>m.featureId===i?{...m,finalScore:o,comment:a||m.comment}:m);return{...u,pileScores:d(u.pileScores),laneScores:d(u.laneScores)}})})),finishReview:(t,i)=>Rr(s,e,o=>({submissions:o.submissions.map(a=>{if(a.id!==t)return a;const c=d=>d.length?d.reduce((h,m)=>h+(m.finalScore??m.autoScore),0)/d.length:0,u=Math.round(c(a.pileScores)*.6+c(a.laneScores)*.4);return{...a,reviewed:!0,finalTotal:u,reviewComment:i}})})),resetDemo:()=>{localStorage.removeItem(Jd),location.reload()}})),od=[{id:"base",name:"底图",color:7041664,z:0,description:"建筑、硬化地面、绿化与围墙轮廓"},{id:"lane",name:"车道",color:16119284,z:.05,description:"车道线、库位线、导向箭头等线划要素"},{id:"pile",name:"桩位",color:16347926,z:.12,description:"科二训练用标杆、感应桩与限位桩"},{id:"sign",name:"标志",color:3718648,z:.14,description:"标志牌、指示牌与科目告示牌"},{id:"device",name:"设备",color:10980346,z:.16,description:"照明杆、监控摄像头与信号设备"}],yc=Object.fromEntries(od.map(s=>[s.id,s]));/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Qd="170",Dx=0,Qm=1,Nx=2,Av=1,Ux=2,tr=3,Br=0,Xn=1,Ei=2,zr=0,po=1,eg=2,tg=3,ng=4,Fx=5,hs=100,Ox=101,zx=102,kx=103,Bx=104,Vx=200,Hx=201,Gx=202,Wx=203,ad=204,ld=205,Xx=206,jx=207,Yx=208,qx=209,Zx=210,$x=211,Kx=212,Jx=213,Qx=214,cd=0,ud=1,fd=2,vo=3,dd=4,hd=5,pd=6,md=7,Cv=0,ey=1,ty=2,kr=0,ny=1,iy=2,ry=3,sy=4,oy=5,ay=6,ly=7,Rv=300,_o=301,xo=302,gd=303,vd=304,Dc=306,_d=1e3,ms=1001,xd=1002,Jn=1003,cy=1004,Gl=1005,Ti=1006,Af=1007,gs=1008,sr=1009,bv=1010,Pv=1011,ba=1012,eh=1013,vs=1014,Ni=1015,Ua=1016,th=1017,nh=1018,yo=1020,Lv=35902,Iv=1021,Dv=1022,Ai=1023,Nv=1024,Uv=1025,mo=1026,So=1027,ih=1028,rh=1029,Fv=1030,sh=1031,oh=1033,Sc=33776,Mc=33777,Ec=33778,wc=33779,yd=35840,Sd=35841,Md=35842,Ed=35843,wd=36196,Td=37492,Ad=37496,Cd=37808,Rd=37809,bd=37810,Pd=37811,Ld=37812,Id=37813,Dd=37814,Nd=37815,Ud=37816,Fd=37817,Od=37818,zd=37819,kd=37820,Bd=37821,Tc=36492,Vd=36494,Hd=36495,Ov=36283,Gd=36284,Wd=36285,Xd=36286,uy=3200,fy=3201,dy=0,hy=1,Fr="",li="srgb",To="srgb-linear",Nc="linear",Nt="srgb",js=7680,ig=519,py=512,my=513,gy=514,zv=515,vy=516,_y=517,xy=518,yy=519,jd=35044,rg="300 es",ir=2e3,Cc=2001;class Ao{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const o=this._listeners[e];if(o!==void 0){const a=o.indexOf(t);a!==-1&&o.splice(a,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const o=i.slice(0);for(let a=0,c=o.length;a<c;a++)o[a].call(this,e);e.target=null}}}const En=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let sg=1234567;const wa=Math.PI/180,Pa=180/Math.PI;function Oi(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(En[s&255]+En[s>>8&255]+En[s>>16&255]+En[s>>24&255]+"-"+En[e&255]+En[e>>8&255]+"-"+En[e>>16&15|64]+En[e>>24&255]+"-"+En[t&63|128]+En[t>>8&255]+"-"+En[t>>16&255]+En[t>>24&255]+En[i&255]+En[i>>8&255]+En[i>>16&255]+En[i>>24&255]).toLowerCase()}function mn(s,e,t){return Math.max(e,Math.min(t,s))}function ah(s,e){return(s%e+e)%e}function Sy(s,e,t,i,o){return i+(s-e)*(o-i)/(t-e)}function My(s,e,t){return s!==e?(t-s)/(e-s):0}function Ta(s,e,t){return(1-t)*s+t*e}function Ey(s,e,t,i){return Ta(s,e,1-Math.exp(-t*i))}function wy(s,e=1){return e-Math.abs(ah(s,e*2)-e)}function Ty(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Ay(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Cy(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Ry(s,e){return s+Math.random()*(e-s)}function by(s){return s*(.5-Math.random())}function Py(s){s!==void 0&&(sg=s);let e=sg+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Ly(s){return s*wa}function Iy(s){return s*Pa}function Dy(s){return(s&s-1)===0&&s!==0}function Ny(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Uy(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Fy(s,e,t,i,o){const a=Math.cos,c=Math.sin,u=a(t/2),d=c(t/2),h=a((e+i)/2),m=c((e+i)/2),g=a((e-i)/2),v=c((e-i)/2),y=a((i-e)/2),M=c((i-e)/2);switch(o){case"XYX":s.set(u*m,d*g,d*v,u*h);break;case"YZY":s.set(d*v,u*m,d*g,u*h);break;case"ZXZ":s.set(d*g,d*v,u*m,u*h);break;case"XZX":s.set(u*m,d*M,d*y,u*h);break;case"YXY":s.set(d*y,u*m,d*M,u*h);break;case"ZYZ":s.set(d*M,d*y,u*m,u*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function wi(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Lt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Oy={DEG2RAD:wa,RAD2DEG:Pa,generateUUID:Oi,clamp:mn,euclideanModulo:ah,mapLinear:Sy,inverseLerp:My,lerp:Ta,damp:Ey,pingpong:wy,smoothstep:Ty,smootherstep:Ay,randInt:Cy,randFloat:Ry,randFloatSpread:by,seededRandom:Py,degToRad:Ly,radToDeg:Iy,isPowerOfTwo:Dy,ceilPowerOfTwo:Ny,floorPowerOfTwo:Uy,setQuaternionFromProperEuler:Fy,normalize:Lt,denormalize:wi};class Be{constructor(e=0,t=0){Be.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6],this.y=o[1]*t+o[4]*i+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(mn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),o=Math.sin(t),a=this.x-e.x,c=this.y-e.y;return this.x=a*i-c*o+e.x,this.y=a*o+c*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ct{constructor(e,t,i,o,a,c,u,d,h){ct.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,o,a,c,u,d,h)}set(e,t,i,o,a,c,u,d,h){const m=this.elements;return m[0]=e,m[1]=o,m[2]=u,m[3]=t,m[4]=a,m[5]=d,m[6]=i,m[7]=c,m[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,o=t.elements,a=this.elements,c=i[0],u=i[3],d=i[6],h=i[1],m=i[4],g=i[7],v=i[2],y=i[5],M=i[8],w=o[0],S=o[3],x=o[6],I=o[1],C=o[4],E=o[7],Z=o[2],D=o[5],O=o[8];return a[0]=c*w+u*I+d*Z,a[3]=c*S+u*C+d*D,a[6]=c*x+u*E+d*O,a[1]=h*w+m*I+g*Z,a[4]=h*S+m*C+g*D,a[7]=h*x+m*E+g*O,a[2]=v*w+y*I+M*Z,a[5]=v*S+y*C+M*D,a[8]=v*x+y*E+M*O,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],o=e[2],a=e[3],c=e[4],u=e[5],d=e[6],h=e[7],m=e[8];return t*c*m-t*u*h-i*a*m+i*u*d+o*a*h-o*c*d}invert(){const e=this.elements,t=e[0],i=e[1],o=e[2],a=e[3],c=e[4],u=e[5],d=e[6],h=e[7],m=e[8],g=m*c-u*h,v=u*d-m*a,y=h*a-c*d,M=t*g+i*v+o*y;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const w=1/M;return e[0]=g*w,e[1]=(o*h-m*i)*w,e[2]=(u*i-o*c)*w,e[3]=v*w,e[4]=(m*t-o*d)*w,e[5]=(o*a-u*t)*w,e[6]=y*w,e[7]=(i*d-h*t)*w,e[8]=(c*t-i*a)*w,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,o,a,c,u){const d=Math.cos(a),h=Math.sin(a);return this.set(i*d,i*h,-i*(d*c+h*u)+c+e,-o*h,o*d,-o*(-h*c+d*u)+u+t,0,0,1),this}scale(e,t){return this.premultiply(Cf.makeScale(e,t)),this}rotate(e){return this.premultiply(Cf.makeRotation(-e)),this}translate(e,t){return this.premultiply(Cf.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let o=0;o<9;o++)if(t[o]!==i[o])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Cf=new ct;function kv(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Rc(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function zy(){const s=Rc("canvas");return s.style.display="block",s}const og={};function Sa(s){s in og||(og[s]=!0,console.warn(s))}function ky(s,e,t){return new Promise(function(i,o){function a(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:o();break;case s.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:i()}}setTimeout(a,t)})}function By(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Vy(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const St={enabled:!0,workingColorSpace:To,spaces:{},convert:function(s,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Nt&&(s.r=rr(s.r),s.g=rr(s.g),s.b=rr(s.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(s.applyMatrix3(this.spaces[e].toXYZ),s.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Nt&&(s.r=go(s.r),s.g=go(s.g),s.b=go(s.b))),s},fromWorkingColorSpace:function(s,e){return this.convert(s,this.workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Fr?Nc:this.spaces[s].transfer},getLuminanceCoefficients:function(s,e=this.workingColorSpace){return s.fromArray(this.spaces[e].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,e,t){return s.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function rr(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function go(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const ag=[.64,.33,.3,.6,.15,.06],lg=[.2126,.7152,.0722],cg=[.3127,.329],ug=new ct().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fg=new ct().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);St.define({[To]:{primaries:ag,whitePoint:cg,transfer:Nc,toXYZ:ug,fromXYZ:fg,luminanceCoefficients:lg,workingColorSpaceConfig:{unpackColorSpace:li},outputColorSpaceConfig:{drawingBufferColorSpace:li}},[li]:{primaries:ag,whitePoint:cg,transfer:Nt,toXYZ:ug,fromXYZ:fg,luminanceCoefficients:lg,outputColorSpaceConfig:{drawingBufferColorSpace:li}}});let Ys;class Hy{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ys===void 0&&(Ys=Rc("canvas")),Ys.width=e.width,Ys.height=e.height;const i=Ys.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Ys}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Rc("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const o=i.getImageData(0,0,e.width,e.height),a=o.data;for(let c=0;c<a.length;c++)a[c]=rr(a[c]/255)*255;return i.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(rr(t[i]/255)*255):t[i]=rr(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Gy=0;class Bv{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Gy++}),this.uuid=Oi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},o=this.data;if(o!==null){let a;if(Array.isArray(o)){a=[];for(let c=0,u=o.length;c<u;c++)o[c].isDataTexture?a.push(Rf(o[c].image)):a.push(Rf(o[c]))}else a=Rf(o);i.url=a}return t||(e.images[this.uuid]=i),i}}function Rf(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Hy.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Wy=0;class An extends Ao{constructor(e=An.DEFAULT_IMAGE,t=An.DEFAULT_MAPPING,i=ms,o=ms,a=Ti,c=gs,u=Ai,d=sr,h=An.DEFAULT_ANISOTROPY,m=Fr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wy++}),this.uuid=Oi(),this.name="",this.source=new Bv(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=o,this.magFilter=a,this.minFilter=c,this.anisotropy=h,this.format=u,this.internalFormat=null,this.type=d,this.offset=new Be(0,0),this.repeat=new Be(1,1),this.center=new Be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Rv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case _d:e.x=e.x-Math.floor(e.x);break;case ms:e.x=e.x<0?0:1;break;case xd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case _d:e.y=e.y-Math.floor(e.y);break;case ms:e.y=e.y<0?0:1;break;case xd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}An.DEFAULT_IMAGE=null;An.DEFAULT_MAPPING=Rv;An.DEFAULT_ANISOTROPY=1;class $t{constructor(e=0,t=0,i=0,o=1){$t.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,o){return this.x=e,this.y=t,this.z=i,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,o=this.z,a=this.w,c=e.elements;return this.x=c[0]*t+c[4]*i+c[8]*o+c[12]*a,this.y=c[1]*t+c[5]*i+c[9]*o+c[13]*a,this.z=c[2]*t+c[6]*i+c[10]*o+c[14]*a,this.w=c[3]*t+c[7]*i+c[11]*o+c[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,o,a;const d=e.elements,h=d[0],m=d[4],g=d[8],v=d[1],y=d[5],M=d[9],w=d[2],S=d[6],x=d[10];if(Math.abs(m-v)<.01&&Math.abs(g-w)<.01&&Math.abs(M-S)<.01){if(Math.abs(m+v)<.1&&Math.abs(g+w)<.1&&Math.abs(M+S)<.1&&Math.abs(h+y+x-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const C=(h+1)/2,E=(y+1)/2,Z=(x+1)/2,D=(m+v)/4,O=(g+w)/4,Y=(M+S)/4;return C>E&&C>Z?C<.01?(i=0,o=.707106781,a=.707106781):(i=Math.sqrt(C),o=D/i,a=O/i):E>Z?E<.01?(i=.707106781,o=0,a=.707106781):(o=Math.sqrt(E),i=D/o,a=Y/o):Z<.01?(i=.707106781,o=.707106781,a=0):(a=Math.sqrt(Z),i=O/a,o=Y/a),this.set(i,o,a,t),this}let I=Math.sqrt((S-M)*(S-M)+(g-w)*(g-w)+(v-m)*(v-m));return Math.abs(I)<.001&&(I=1),this.x=(S-M)/I,this.y=(g-w)/I,this.z=(v-m)/I,this.w=Math.acos((h+y+x-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xy extends Ao{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new $t(0,0,e,t),this.scissorTest=!1,this.viewport=new $t(0,0,e,t);const o={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ti,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const a=new An(o,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);a.flipY=!1,a.generateMipmaps=i.generateMipmaps,a.internalFormat=i.internalFormat,this.textures=[];const c=i.count;for(let u=0;u<c;u++)this.textures[u]=a.clone(),this.textures[u].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let o=0,a=this.textures.length;o<a;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,o=e.textures.length;i<o;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Bv(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class _s extends Xy{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Vv extends An{constructor(e=null,t=1,i=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:o},this.magFilter=Jn,this.minFilter=Jn,this.wrapR=ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class jy extends An{constructor(e=null,t=1,i=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:o},this.magFilter=Jn,this.minFilter=Jn,this.wrapR=ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class xs{constructor(e=0,t=0,i=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=o}static slerpFlat(e,t,i,o,a,c,u){let d=i[o+0],h=i[o+1],m=i[o+2],g=i[o+3];const v=a[c+0],y=a[c+1],M=a[c+2],w=a[c+3];if(u===0){e[t+0]=d,e[t+1]=h,e[t+2]=m,e[t+3]=g;return}if(u===1){e[t+0]=v,e[t+1]=y,e[t+2]=M,e[t+3]=w;return}if(g!==w||d!==v||h!==y||m!==M){let S=1-u;const x=d*v+h*y+m*M+g*w,I=x>=0?1:-1,C=1-x*x;if(C>Number.EPSILON){const Z=Math.sqrt(C),D=Math.atan2(Z,x*I);S=Math.sin(S*D)/Z,u=Math.sin(u*D)/Z}const E=u*I;if(d=d*S+v*E,h=h*S+y*E,m=m*S+M*E,g=g*S+w*E,S===1-u){const Z=1/Math.sqrt(d*d+h*h+m*m+g*g);d*=Z,h*=Z,m*=Z,g*=Z}}e[t]=d,e[t+1]=h,e[t+2]=m,e[t+3]=g}static multiplyQuaternionsFlat(e,t,i,o,a,c){const u=i[o],d=i[o+1],h=i[o+2],m=i[o+3],g=a[c],v=a[c+1],y=a[c+2],M=a[c+3];return e[t]=u*M+m*g+d*y-h*v,e[t+1]=d*M+m*v+h*g-u*y,e[t+2]=h*M+m*y+u*v-d*g,e[t+3]=m*M-u*g-d*v-h*y,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,o){return this._x=e,this._y=t,this._z=i,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,o=e._y,a=e._z,c=e._order,u=Math.cos,d=Math.sin,h=u(i/2),m=u(o/2),g=u(a/2),v=d(i/2),y=d(o/2),M=d(a/2);switch(c){case"XYZ":this._x=v*m*g+h*y*M,this._y=h*y*g-v*m*M,this._z=h*m*M+v*y*g,this._w=h*m*g-v*y*M;break;case"YXZ":this._x=v*m*g+h*y*M,this._y=h*y*g-v*m*M,this._z=h*m*M-v*y*g,this._w=h*m*g+v*y*M;break;case"ZXY":this._x=v*m*g-h*y*M,this._y=h*y*g+v*m*M,this._z=h*m*M+v*y*g,this._w=h*m*g-v*y*M;break;case"ZYX":this._x=v*m*g-h*y*M,this._y=h*y*g+v*m*M,this._z=h*m*M-v*y*g,this._w=h*m*g+v*y*M;break;case"YZX":this._x=v*m*g+h*y*M,this._y=h*y*g+v*m*M,this._z=h*m*M-v*y*g,this._w=h*m*g-v*y*M;break;case"XZY":this._x=v*m*g-h*y*M,this._y=h*y*g-v*m*M,this._z=h*m*M+v*y*g,this._w=h*m*g+v*y*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,o=Math.sin(i);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],o=t[4],a=t[8],c=t[1],u=t[5],d=t[9],h=t[2],m=t[6],g=t[10],v=i+u+g;if(v>0){const y=.5/Math.sqrt(v+1);this._w=.25/y,this._x=(m-d)*y,this._y=(a-h)*y,this._z=(c-o)*y}else if(i>u&&i>g){const y=2*Math.sqrt(1+i-u-g);this._w=(m-d)/y,this._x=.25*y,this._y=(o+c)/y,this._z=(a+h)/y}else if(u>g){const y=2*Math.sqrt(1+u-i-g);this._w=(a-h)/y,this._x=(o+c)/y,this._y=.25*y,this._z=(d+m)/y}else{const y=2*Math.sqrt(1+g-i-u);this._w=(c-o)/y,this._x=(a+h)/y,this._y=(d+m)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(mn(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const o=Math.min(1,t/i);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,o=e._y,a=e._z,c=e._w,u=t._x,d=t._y,h=t._z,m=t._w;return this._x=i*m+c*u+o*h-a*d,this._y=o*m+c*d+a*u-i*h,this._z=a*m+c*h+i*d-o*u,this._w=c*m-i*u-o*d-a*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,o=this._y,a=this._z,c=this._w;let u=c*e._w+i*e._x+o*e._y+a*e._z;if(u<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,u=-u):this.copy(e),u>=1)return this._w=c,this._x=i,this._y=o,this._z=a,this;const d=1-u*u;if(d<=Number.EPSILON){const y=1-t;return this._w=y*c+t*this._w,this._x=y*i+t*this._x,this._y=y*o+t*this._y,this._z=y*a+t*this._z,this.normalize(),this}const h=Math.sqrt(d),m=Math.atan2(h,u),g=Math.sin((1-t)*m)/h,v=Math.sin(t*m)/h;return this._w=c*g+this._w*v,this._x=i*g+this._x*v,this._y=o*g+this._y*v,this._z=a*g+this._z*v,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),o=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(o*Math.sin(e),o*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class k{constructor(e=0,t=0,i=0){k.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(dg.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(dg.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,o=this.z,a=e.elements;return this.x=a[0]*t+a[3]*i+a[6]*o,this.y=a[1]*t+a[4]*i+a[7]*o,this.z=a[2]*t+a[5]*i+a[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,o=this.z,a=e.elements,c=1/(a[3]*t+a[7]*i+a[11]*o+a[15]);return this.x=(a[0]*t+a[4]*i+a[8]*o+a[12])*c,this.y=(a[1]*t+a[5]*i+a[9]*o+a[13])*c,this.z=(a[2]*t+a[6]*i+a[10]*o+a[14])*c,this}applyQuaternion(e){const t=this.x,i=this.y,o=this.z,a=e.x,c=e.y,u=e.z,d=e.w,h=2*(c*o-u*i),m=2*(u*t-a*o),g=2*(a*i-c*t);return this.x=t+d*h+c*g-u*m,this.y=i+d*m+u*h-a*g,this.z=o+d*g+a*m-c*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,o=this.z,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*o,this.y=a[1]*t+a[5]*i+a[9]*o,this.z=a[2]*t+a[6]*i+a[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,o=e.y,a=e.z,c=t.x,u=t.y,d=t.z;return this.x=o*d-a*u,this.y=a*c-i*d,this.z=i*u-o*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return bf.copy(this).projectOnVector(e),this.sub(bf)}reflect(e){return this.sub(bf.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(mn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,o=this.z-e.z;return t*t+i*i+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const o=Math.sin(t)*e;return this.x=o*Math.sin(i),this.y=Math.cos(t)*e,this.z=o*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const bf=new k,dg=new xs;class Ss{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(xi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(xi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=xi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const a=i.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let c=0,u=a.count;c<u;c++)e.isMesh===!0?e.getVertexPosition(c,xi):xi.fromBufferAttribute(a,c),xi.applyMatrix4(e.matrixWorld),this.expandByPoint(xi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wl.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wl.copy(i.boundingBox)),Wl.applyMatrix4(e.matrixWorld),this.union(Wl)}const o=e.children;for(let a=0,c=o.length;a<c;a++)this.expandByObject(o[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xi),xi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ua),Xl.subVectors(this.max,ua),qs.subVectors(e.a,ua),Zs.subVectors(e.b,ua),$s.subVectors(e.c,ua),br.subVectors(Zs,qs),Pr.subVectors($s,Zs),ns.subVectors(qs,$s);let t=[0,-br.z,br.y,0,-Pr.z,Pr.y,0,-ns.z,ns.y,br.z,0,-br.x,Pr.z,0,-Pr.x,ns.z,0,-ns.x,-br.y,br.x,0,-Pr.y,Pr.x,0,-ns.y,ns.x,0];return!Pf(t,qs,Zs,$s,Xl)||(t=[1,0,0,0,1,0,0,0,1],!Pf(t,qs,Zs,$s,Xl))?!1:(jl.crossVectors(br,Pr),t=[jl.x,jl.y,jl.z],Pf(t,qs,Zs,$s,Xl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:($i[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),$i[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),$i[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),$i[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),$i[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),$i[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),$i[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),$i[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints($i),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const $i=[new k,new k,new k,new k,new k,new k,new k,new k],xi=new k,Wl=new Ss,qs=new k,Zs=new k,$s=new k,br=new k,Pr=new k,ns=new k,ua=new k,Xl=new k,jl=new k,is=new k;function Pf(s,e,t,i,o){for(let a=0,c=s.length-3;a<=c;a+=3){is.fromArray(s,a);const u=o.x*Math.abs(is.x)+o.y*Math.abs(is.y)+o.z*Math.abs(is.z),d=e.dot(is),h=t.dot(is),m=i.dot(is);if(Math.max(-Math.max(d,h,m),Math.min(d,h,m))>u)return!1}return!0}const Yy=new Ss,fa=new k,Lf=new k;class Co{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Yy.setFromPoints(e).getCenter(i);let o=0;for(let a=0,c=e.length;a<c;a++)o=Math.max(o,i.distanceToSquared(e[a]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fa.subVectors(e,this.center);const t=fa.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),o=(i-this.radius)*.5;this.center.addScaledVector(fa,o/i),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Lf.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fa.copy(e.center).add(Lf)),this.expandByPoint(fa.copy(e.center).sub(Lf))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ki=new k,If=new k,Yl=new k,Lr=new k,Df=new k,ql=new k,Nf=new k;class lh{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ki)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ki.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ki.copy(this.origin).addScaledVector(this.direction,t),Ki.distanceToSquared(e))}distanceSqToSegment(e,t,i,o){If.copy(e).add(t).multiplyScalar(.5),Yl.copy(t).sub(e).normalize(),Lr.copy(this.origin).sub(If);const a=e.distanceTo(t)*.5,c=-this.direction.dot(Yl),u=Lr.dot(this.direction),d=-Lr.dot(Yl),h=Lr.lengthSq(),m=Math.abs(1-c*c);let g,v,y,M;if(m>0)if(g=c*d-u,v=c*u-d,M=a*m,g>=0)if(v>=-M)if(v<=M){const w=1/m;g*=w,v*=w,y=g*(g+c*v+2*u)+v*(c*g+v+2*d)+h}else v=a,g=Math.max(0,-(c*v+u)),y=-g*g+v*(v+2*d)+h;else v=-a,g=Math.max(0,-(c*v+u)),y=-g*g+v*(v+2*d)+h;else v<=-M?(g=Math.max(0,-(-c*a+u)),v=g>0?-a:Math.min(Math.max(-a,-d),a),y=-g*g+v*(v+2*d)+h):v<=M?(g=0,v=Math.min(Math.max(-a,-d),a),y=v*(v+2*d)+h):(g=Math.max(0,-(c*a+u)),v=g>0?a:Math.min(Math.max(-a,-d),a),y=-g*g+v*(v+2*d)+h);else v=c>0?-a:a,g=Math.max(0,-(c*v+u)),y=-g*g+v*(v+2*d)+h;return i&&i.copy(this.origin).addScaledVector(this.direction,g),o&&o.copy(If).addScaledVector(Yl,v),y}intersectSphere(e,t){Ki.subVectors(e.center,this.origin);const i=Ki.dot(this.direction),o=Ki.dot(Ki)-i*i,a=e.radius*e.radius;if(o>a)return null;const c=Math.sqrt(a-o),u=i-c,d=i+c;return d<0?null:u<0?this.at(d,t):this.at(u,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,o,a,c,u,d;const h=1/this.direction.x,m=1/this.direction.y,g=1/this.direction.z,v=this.origin;return h>=0?(i=(e.min.x-v.x)*h,o=(e.max.x-v.x)*h):(i=(e.max.x-v.x)*h,o=(e.min.x-v.x)*h),m>=0?(a=(e.min.y-v.y)*m,c=(e.max.y-v.y)*m):(a=(e.max.y-v.y)*m,c=(e.min.y-v.y)*m),i>c||a>o||((a>i||isNaN(i))&&(i=a),(c<o||isNaN(o))&&(o=c),g>=0?(u=(e.min.z-v.z)*g,d=(e.max.z-v.z)*g):(u=(e.max.z-v.z)*g,d=(e.min.z-v.z)*g),i>d||u>o)||((u>i||i!==i)&&(i=u),(d<o||o!==o)&&(o=d),o<0)?null:this.at(i>=0?i:o,t)}intersectsBox(e){return this.intersectBox(e,Ki)!==null}intersectTriangle(e,t,i,o,a){Df.subVectors(t,e),ql.subVectors(i,e),Nf.crossVectors(Df,ql);let c=this.direction.dot(Nf),u;if(c>0){if(o)return null;u=1}else if(c<0)u=-1,c=-c;else return null;Lr.subVectors(this.origin,e);const d=u*this.direction.dot(ql.crossVectors(Lr,ql));if(d<0)return null;const h=u*this.direction.dot(Df.cross(Lr));if(h<0||d+h>c)return null;const m=-u*Lr.dot(Nf);return m<0?null:this.at(m/c,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class It{constructor(e,t,i,o,a,c,u,d,h,m,g,v,y,M,w,S){It.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,o,a,c,u,d,h,m,g,v,y,M,w,S)}set(e,t,i,o,a,c,u,d,h,m,g,v,y,M,w,S){const x=this.elements;return x[0]=e,x[4]=t,x[8]=i,x[12]=o,x[1]=a,x[5]=c,x[9]=u,x[13]=d,x[2]=h,x[6]=m,x[10]=g,x[14]=v,x[3]=y,x[7]=M,x[11]=w,x[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new It().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,o=1/Ks.setFromMatrixColumn(e,0).length(),a=1/Ks.setFromMatrixColumn(e,1).length(),c=1/Ks.setFromMatrixColumn(e,2).length();return t[0]=i[0]*o,t[1]=i[1]*o,t[2]=i[2]*o,t[3]=0,t[4]=i[4]*a,t[5]=i[5]*a,t[6]=i[6]*a,t[7]=0,t[8]=i[8]*c,t[9]=i[9]*c,t[10]=i[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,o=e.y,a=e.z,c=Math.cos(i),u=Math.sin(i),d=Math.cos(o),h=Math.sin(o),m=Math.cos(a),g=Math.sin(a);if(e.order==="XYZ"){const v=c*m,y=c*g,M=u*m,w=u*g;t[0]=d*m,t[4]=-d*g,t[8]=h,t[1]=y+M*h,t[5]=v-w*h,t[9]=-u*d,t[2]=w-v*h,t[6]=M+y*h,t[10]=c*d}else if(e.order==="YXZ"){const v=d*m,y=d*g,M=h*m,w=h*g;t[0]=v+w*u,t[4]=M*u-y,t[8]=c*h,t[1]=c*g,t[5]=c*m,t[9]=-u,t[2]=y*u-M,t[6]=w+v*u,t[10]=c*d}else if(e.order==="ZXY"){const v=d*m,y=d*g,M=h*m,w=h*g;t[0]=v-w*u,t[4]=-c*g,t[8]=M+y*u,t[1]=y+M*u,t[5]=c*m,t[9]=w-v*u,t[2]=-c*h,t[6]=u,t[10]=c*d}else if(e.order==="ZYX"){const v=c*m,y=c*g,M=u*m,w=u*g;t[0]=d*m,t[4]=M*h-y,t[8]=v*h+w,t[1]=d*g,t[5]=w*h+v,t[9]=y*h-M,t[2]=-h,t[6]=u*d,t[10]=c*d}else if(e.order==="YZX"){const v=c*d,y=c*h,M=u*d,w=u*h;t[0]=d*m,t[4]=w-v*g,t[8]=M*g+y,t[1]=g,t[5]=c*m,t[9]=-u*m,t[2]=-h*m,t[6]=y*g+M,t[10]=v-w*g}else if(e.order==="XZY"){const v=c*d,y=c*h,M=u*d,w=u*h;t[0]=d*m,t[4]=-g,t[8]=h*m,t[1]=v*g+w,t[5]=c*m,t[9]=y*g-M,t[2]=M*g-y,t[6]=u*m,t[10]=w*g+v}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qy,e,Zy)}lookAt(e,t,i){const o=this.elements;return $n.subVectors(e,t),$n.lengthSq()===0&&($n.z=1),$n.normalize(),Ir.crossVectors(i,$n),Ir.lengthSq()===0&&(Math.abs(i.z)===1?$n.x+=1e-4:$n.z+=1e-4,$n.normalize(),Ir.crossVectors(i,$n)),Ir.normalize(),Zl.crossVectors($n,Ir),o[0]=Ir.x,o[4]=Zl.x,o[8]=$n.x,o[1]=Ir.y,o[5]=Zl.y,o[9]=$n.y,o[2]=Ir.z,o[6]=Zl.z,o[10]=$n.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,o=t.elements,a=this.elements,c=i[0],u=i[4],d=i[8],h=i[12],m=i[1],g=i[5],v=i[9],y=i[13],M=i[2],w=i[6],S=i[10],x=i[14],I=i[3],C=i[7],E=i[11],Z=i[15],D=o[0],O=o[4],Y=o[8],L=o[12],b=o[1],V=o[5],ae=o[9],ne=o[13],de=o[2],pe=o[6],oe=o[10],ce=o[14],B=o[3],le=o[7],se=o[11],F=o[15];return a[0]=c*D+u*b+d*de+h*B,a[4]=c*O+u*V+d*pe+h*le,a[8]=c*Y+u*ae+d*oe+h*se,a[12]=c*L+u*ne+d*ce+h*F,a[1]=m*D+g*b+v*de+y*B,a[5]=m*O+g*V+v*pe+y*le,a[9]=m*Y+g*ae+v*oe+y*se,a[13]=m*L+g*ne+v*ce+y*F,a[2]=M*D+w*b+S*de+x*B,a[6]=M*O+w*V+S*pe+x*le,a[10]=M*Y+w*ae+S*oe+x*se,a[14]=M*L+w*ne+S*ce+x*F,a[3]=I*D+C*b+E*de+Z*B,a[7]=I*O+C*V+E*pe+Z*le,a[11]=I*Y+C*ae+E*oe+Z*se,a[15]=I*L+C*ne+E*ce+Z*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],o=e[8],a=e[12],c=e[1],u=e[5],d=e[9],h=e[13],m=e[2],g=e[6],v=e[10],y=e[14],M=e[3],w=e[7],S=e[11],x=e[15];return M*(+a*d*g-o*h*g-a*u*v+i*h*v+o*u*y-i*d*y)+w*(+t*d*y-t*h*v+a*c*v-o*c*y+o*h*m-a*d*m)+S*(+t*h*g-t*u*y-a*c*g+i*c*y+a*u*m-i*h*m)+x*(-o*u*m-t*d*g+t*u*v+o*c*g-i*c*v+i*d*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],o=e[2],a=e[3],c=e[4],u=e[5],d=e[6],h=e[7],m=e[8],g=e[9],v=e[10],y=e[11],M=e[12],w=e[13],S=e[14],x=e[15],I=g*S*h-w*v*h+w*d*y-u*S*y-g*d*x+u*v*x,C=M*v*h-m*S*h-M*d*y+c*S*y+m*d*x-c*v*x,E=m*w*h-M*g*h+M*u*y-c*w*y-m*u*x+c*g*x,Z=M*g*d-m*w*d-M*u*v+c*w*v+m*u*S-c*g*S,D=t*I+i*C+o*E+a*Z;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/D;return e[0]=I*O,e[1]=(w*v*a-g*S*a-w*o*y+i*S*y+g*o*x-i*v*x)*O,e[2]=(u*S*a-w*d*a+w*o*h-i*S*h-u*o*x+i*d*x)*O,e[3]=(g*d*a-u*v*a-g*o*h+i*v*h+u*o*y-i*d*y)*O,e[4]=C*O,e[5]=(m*S*a-M*v*a+M*o*y-t*S*y-m*o*x+t*v*x)*O,e[6]=(M*d*a-c*S*a-M*o*h+t*S*h+c*o*x-t*d*x)*O,e[7]=(c*v*a-m*d*a+m*o*h-t*v*h-c*o*y+t*d*y)*O,e[8]=E*O,e[9]=(M*g*a-m*w*a-M*i*y+t*w*y+m*i*x-t*g*x)*O,e[10]=(c*w*a-M*u*a+M*i*h-t*w*h-c*i*x+t*u*x)*O,e[11]=(m*u*a-c*g*a-m*i*h+t*g*h+c*i*y-t*u*y)*O,e[12]=Z*O,e[13]=(m*w*o-M*g*o+M*i*v-t*w*v-m*i*S+t*g*S)*O,e[14]=(M*u*o-c*w*o-M*i*d+t*w*d+c*i*S-t*u*S)*O,e[15]=(c*g*o-m*u*o+m*i*d-t*g*d-c*i*v+t*u*v)*O,this}scale(e){const t=this.elements,i=e.x,o=e.y,a=e.z;return t[0]*=i,t[4]*=o,t[8]*=a,t[1]*=i,t[5]*=o,t[9]*=a,t[2]*=i,t[6]*=o,t[10]*=a,t[3]*=i,t[7]*=o,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,o))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),o=Math.sin(t),a=1-i,c=e.x,u=e.y,d=e.z,h=a*c,m=a*u;return this.set(h*c+i,h*u-o*d,h*d+o*u,0,h*u+o*d,m*u+i,m*d-o*c,0,h*d-o*u,m*d+o*c,a*d*d+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,o,a,c){return this.set(1,i,a,0,e,1,c,0,t,o,1,0,0,0,0,1),this}compose(e,t,i){const o=this.elements,a=t._x,c=t._y,u=t._z,d=t._w,h=a+a,m=c+c,g=u+u,v=a*h,y=a*m,M=a*g,w=c*m,S=c*g,x=u*g,I=d*h,C=d*m,E=d*g,Z=i.x,D=i.y,O=i.z;return o[0]=(1-(w+x))*Z,o[1]=(y+E)*Z,o[2]=(M-C)*Z,o[3]=0,o[4]=(y-E)*D,o[5]=(1-(v+x))*D,o[6]=(S+I)*D,o[7]=0,o[8]=(M+C)*O,o[9]=(S-I)*O,o[10]=(1-(v+w))*O,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,i){const o=this.elements;let a=Ks.set(o[0],o[1],o[2]).length();const c=Ks.set(o[4],o[5],o[6]).length(),u=Ks.set(o[8],o[9],o[10]).length();this.determinant()<0&&(a=-a),e.x=o[12],e.y=o[13],e.z=o[14],yi.copy(this);const h=1/a,m=1/c,g=1/u;return yi.elements[0]*=h,yi.elements[1]*=h,yi.elements[2]*=h,yi.elements[4]*=m,yi.elements[5]*=m,yi.elements[6]*=m,yi.elements[8]*=g,yi.elements[9]*=g,yi.elements[10]*=g,t.setFromRotationMatrix(yi),i.x=a,i.y=c,i.z=u,this}makePerspective(e,t,i,o,a,c,u=ir){const d=this.elements,h=2*a/(t-e),m=2*a/(i-o),g=(t+e)/(t-e),v=(i+o)/(i-o);let y,M;if(u===ir)y=-(c+a)/(c-a),M=-2*c*a/(c-a);else if(u===Cc)y=-c/(c-a),M=-c*a/(c-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return d[0]=h,d[4]=0,d[8]=g,d[12]=0,d[1]=0,d[5]=m,d[9]=v,d[13]=0,d[2]=0,d[6]=0,d[10]=y,d[14]=M,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(e,t,i,o,a,c,u=ir){const d=this.elements,h=1/(t-e),m=1/(i-o),g=1/(c-a),v=(t+e)*h,y=(i+o)*m;let M,w;if(u===ir)M=(c+a)*g,w=-2*g;else if(u===Cc)M=a*g,w=-1*g;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return d[0]=2*h,d[4]=0,d[8]=0,d[12]=-v,d[1]=0,d[5]=2*m,d[9]=0,d[13]=-y,d[2]=0,d[6]=0,d[10]=w,d[14]=-M,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let o=0;o<16;o++)if(t[o]!==i[o])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Ks=new k,yi=new It,qy=new k(0,0,0),Zy=new k(1,1,1),Ir=new k,Zl=new k,$n=new k,hg=new It,pg=new xs;class or{constructor(e=0,t=0,i=0,o=or.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,o=this._order){return this._x=e,this._y=t,this._z=i,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const o=e.elements,a=o[0],c=o[4],u=o[8],d=o[1],h=o[5],m=o[9],g=o[2],v=o[6],y=o[10];switch(t){case"XYZ":this._y=Math.asin(mn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-m,y),this._z=Math.atan2(-c,a)):(this._x=Math.atan2(v,h),this._z=0);break;case"YXZ":this._x=Math.asin(-mn(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(u,y),this._z=Math.atan2(d,h)):(this._y=Math.atan2(-g,a),this._z=0);break;case"ZXY":this._x=Math.asin(mn(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-g,y),this._z=Math.atan2(-c,h)):(this._y=0,this._z=Math.atan2(d,a));break;case"ZYX":this._y=Math.asin(-mn(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(v,y),this._z=Math.atan2(d,a)):(this._x=0,this._z=Math.atan2(-c,h));break;case"YZX":this._z=Math.asin(mn(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-m,h),this._y=Math.atan2(-g,a)):(this._x=0,this._y=Math.atan2(u,y));break;case"XZY":this._z=Math.asin(-mn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(v,h),this._y=Math.atan2(u,a)):(this._x=Math.atan2(-m,y),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return hg.makeRotationFromQuaternion(e),this.setFromRotationMatrix(hg,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return pg.setFromEuler(this),this.setFromQuaternion(pg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}or.DEFAULT_ORDER="XYZ";class ch{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let $y=0;const mg=new k,Js=new xs,Ji=new It,$l=new k,da=new k,Ky=new k,Jy=new xs,gg=new k(1,0,0),vg=new k(0,1,0),_g=new k(0,0,1),xg={type:"added"},Qy={type:"removed"},Qs={type:"childadded",child:null},Uf={type:"childremoved",child:null};class Un extends Ao{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$y++}),this.uuid=Oi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Un.DEFAULT_UP.clone();const e=new k,t=new or,i=new xs,o=new k(1,1,1);function a(){i.setFromEuler(t,!1)}function c(){t.setFromQuaternion(i,void 0,!1)}t._onChange(a),i._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new It},normalMatrix:{value:new ct}}),this.matrix=new It,this.matrixWorld=new It,this.matrixAutoUpdate=Un.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Un.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ch,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Js.setFromAxisAngle(e,t),this.quaternion.multiply(Js),this}rotateOnWorldAxis(e,t){return Js.setFromAxisAngle(e,t),this.quaternion.premultiply(Js),this}rotateX(e){return this.rotateOnAxis(gg,e)}rotateY(e){return this.rotateOnAxis(vg,e)}rotateZ(e){return this.rotateOnAxis(_g,e)}translateOnAxis(e,t){return mg.copy(e).applyQuaternion(this.quaternion),this.position.add(mg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gg,e)}translateY(e){return this.translateOnAxis(vg,e)}translateZ(e){return this.translateOnAxis(_g,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ji.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?$l.copy(e):$l.set(e,t,i);const o=this.parent;this.updateWorldMatrix(!0,!1),da.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ji.lookAt(da,$l,this.up):Ji.lookAt($l,da,this.up),this.quaternion.setFromRotationMatrix(Ji),o&&(Ji.extractRotation(o.matrixWorld),Js.setFromRotationMatrix(Ji),this.quaternion.premultiply(Js.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xg),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Qy),Uf.child=e,this.dispatchEvent(Uf),Uf.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ji.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ji.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ji),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xg),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,o=this.children.length;i<o;i++){const c=this.children[i].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const o=this.children;for(let a=0,c=o.length;a<c;a++)o[a].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(da,e,Ky),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(da,Jy,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const o=this.children;for(let a=0,c=o.length;a<c;a++)o[a].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(u=>({boxInitialized:u.boxInitialized,boxMin:u.box.min.toArray(),boxMax:u.box.max.toArray(),sphereInitialized:u.sphereInitialized,sphereRadius:u.sphere.radius,sphereCenter:u.sphere.center.toArray()})),o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function a(u,d){return u[d.uuid]===void 0&&(u[d.uuid]=d.toJSON(e)),d.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=a(e.geometries,this.geometry);const u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){const d=u.shapes;if(Array.isArray(d))for(let h=0,m=d.length;h<m;h++){const g=d[h];a(e.shapes,g)}else a(e.shapes,d)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const u=[];for(let d=0,h=this.material.length;d<h;d++)u.push(a(e.materials,this.material[d]));o.material=u}else o.material=a(e.materials,this.material);if(this.children.length>0){o.children=[];for(let u=0;u<this.children.length;u++)o.children.push(this.children[u].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let u=0;u<this.animations.length;u++){const d=this.animations[u];o.animations.push(a(e.animations,d))}}if(t){const u=c(e.geometries),d=c(e.materials),h=c(e.textures),m=c(e.images),g=c(e.shapes),v=c(e.skeletons),y=c(e.animations),M=c(e.nodes);u.length>0&&(i.geometries=u),d.length>0&&(i.materials=d),h.length>0&&(i.textures=h),m.length>0&&(i.images=m),g.length>0&&(i.shapes=g),v.length>0&&(i.skeletons=v),y.length>0&&(i.animations=y),M.length>0&&(i.nodes=M)}return i.object=o,i;function c(u){const d=[];for(const h in u){const m=u[h];delete m.metadata,d.push(m)}return d}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const o=e.children[i];this.add(o.clone())}return this}}Un.DEFAULT_UP=new k(0,1,0);Un.DEFAULT_MATRIX_AUTO_UPDATE=!0;Un.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Si=new k,Qi=new k,Ff=new k,er=new k,eo=new k,to=new k,yg=new k,Of=new k,zf=new k,kf=new k,Bf=new $t,Vf=new $t,Hf=new $t;class ci{constructor(e=new k,t=new k,i=new k){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,o){o.subVectors(i,t),Si.subVectors(e,t),o.cross(Si);const a=o.lengthSq();return a>0?o.multiplyScalar(1/Math.sqrt(a)):o.set(0,0,0)}static getBarycoord(e,t,i,o,a){Si.subVectors(o,t),Qi.subVectors(i,t),Ff.subVectors(e,t);const c=Si.dot(Si),u=Si.dot(Qi),d=Si.dot(Ff),h=Qi.dot(Qi),m=Qi.dot(Ff),g=c*h-u*u;if(g===0)return a.set(0,0,0),null;const v=1/g,y=(h*d-u*m)*v,M=(c*m-u*d)*v;return a.set(1-y-M,M,y)}static containsPoint(e,t,i,o){return this.getBarycoord(e,t,i,o,er)===null?!1:er.x>=0&&er.y>=0&&er.x+er.y<=1}static getInterpolation(e,t,i,o,a,c,u,d){return this.getBarycoord(e,t,i,o,er)===null?(d.x=0,d.y=0,"z"in d&&(d.z=0),"w"in d&&(d.w=0),null):(d.setScalar(0),d.addScaledVector(a,er.x),d.addScaledVector(c,er.y),d.addScaledVector(u,er.z),d)}static getInterpolatedAttribute(e,t,i,o,a,c){return Bf.setScalar(0),Vf.setScalar(0),Hf.setScalar(0),Bf.fromBufferAttribute(e,t),Vf.fromBufferAttribute(e,i),Hf.fromBufferAttribute(e,o),c.setScalar(0),c.addScaledVector(Bf,a.x),c.addScaledVector(Vf,a.y),c.addScaledVector(Hf,a.z),c}static isFrontFacing(e,t,i,o){return Si.subVectors(i,t),Qi.subVectors(e,t),Si.cross(Qi).dot(o)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,o){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,i,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Si.subVectors(this.c,this.b),Qi.subVectors(this.a,this.b),Si.cross(Qi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ci.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ci.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,o,a){return ci.getInterpolation(e,this.a,this.b,this.c,t,i,o,a)}containsPoint(e){return ci.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ci.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,o=this.b,a=this.c;let c,u;eo.subVectors(o,i),to.subVectors(a,i),Of.subVectors(e,i);const d=eo.dot(Of),h=to.dot(Of);if(d<=0&&h<=0)return t.copy(i);zf.subVectors(e,o);const m=eo.dot(zf),g=to.dot(zf);if(m>=0&&g<=m)return t.copy(o);const v=d*g-m*h;if(v<=0&&d>=0&&m<=0)return c=d/(d-m),t.copy(i).addScaledVector(eo,c);kf.subVectors(e,a);const y=eo.dot(kf),M=to.dot(kf);if(M>=0&&y<=M)return t.copy(a);const w=y*h-d*M;if(w<=0&&h>=0&&M<=0)return u=h/(h-M),t.copy(i).addScaledVector(to,u);const S=m*M-y*g;if(S<=0&&g-m>=0&&y-M>=0)return yg.subVectors(a,o),u=(g-m)/(g-m+(y-M)),t.copy(o).addScaledVector(yg,u);const x=1/(S+w+v);return c=w*x,u=v*x,t.copy(i).addScaledVector(eo,c).addScaledVector(to,u)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Hv={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dr={h:0,s:0,l:0},Kl={h:0,s:0,l:0};function Gf(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class At{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=li){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,St.toWorkingColorSpace(this,t),this}setRGB(e,t,i,o=St.workingColorSpace){return this.r=e,this.g=t,this.b=i,St.toWorkingColorSpace(this,o),this}setHSL(e,t,i,o=St.workingColorSpace){if(e=ah(e,1),t=mn(t,0,1),i=mn(i,0,1),t===0)this.r=this.g=this.b=i;else{const a=i<=.5?i*(1+t):i+t-i*t,c=2*i-a;this.r=Gf(c,a,e+1/3),this.g=Gf(c,a,e),this.b=Gf(c,a,e-1/3)}return St.toWorkingColorSpace(this,o),this}setStyle(e,t=li){function i(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const c=o[1],u=o[2];switch(c){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=o[1],c=a.length;if(c===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(a,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=li){const i=Hv[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=rr(e.r),this.g=rr(e.g),this.b=rr(e.b),this}copyLinearToSRGB(e){return this.r=go(e.r),this.g=go(e.g),this.b=go(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=li){return St.fromWorkingColorSpace(wn.copy(this),e),Math.round(mn(wn.r*255,0,255))*65536+Math.round(mn(wn.g*255,0,255))*256+Math.round(mn(wn.b*255,0,255))}getHexString(e=li){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=St.workingColorSpace){St.fromWorkingColorSpace(wn.copy(this),t);const i=wn.r,o=wn.g,a=wn.b,c=Math.max(i,o,a),u=Math.min(i,o,a);let d,h;const m=(u+c)/2;if(u===c)d=0,h=0;else{const g=c-u;switch(h=m<=.5?g/(c+u):g/(2-c-u),c){case i:d=(o-a)/g+(o<a?6:0);break;case o:d=(a-i)/g+2;break;case a:d=(i-o)/g+4;break}d/=6}return e.h=d,e.s=h,e.l=m,e}getRGB(e,t=St.workingColorSpace){return St.fromWorkingColorSpace(wn.copy(this),t),e.r=wn.r,e.g=wn.g,e.b=wn.b,e}getStyle(e=li){St.fromWorkingColorSpace(wn.copy(this),e);const t=wn.r,i=wn.g,o=wn.b;return e!==li?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(o*255)})`}offsetHSL(e,t,i){return this.getHSL(Dr),this.setHSL(Dr.h+e,Dr.s+t,Dr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Dr),e.getHSL(Kl);const i=Ta(Dr.h,Kl.h,t),o=Ta(Dr.s,Kl.s,t),a=Ta(Dr.l,Kl.l,t);return this.setHSL(i,o,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,o=this.b,a=e.elements;return this.r=a[0]*t+a[3]*i+a[6]*o,this.g=a[1]*t+a[4]*i+a[7]*o,this.b=a[2]*t+a[5]*i+a[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const wn=new At;At.NAMES=Hv;let eS=0;class Ro extends Ao{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:eS++}),this.uuid=Oi(),this.name="",this.blending=po,this.side=Br,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ad,this.blendDst=ld,this.blendEquation=hs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new At(0,0,0),this.blendAlpha=0,this.depthFunc=vo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ig,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=js,this.stencilZFail=js,this.stencilZPass=js,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(i):o&&o.isVector3&&i&&i.isVector3?o.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==po&&(i.blending=this.blending),this.side!==Br&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ad&&(i.blendSrc=this.blendSrc),this.blendDst!==ld&&(i.blendDst=this.blendDst),this.blendEquation!==hs&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==vo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ig&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==js&&(i.stencilFail=this.stencilFail),this.stencilZFail!==js&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==js&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function o(a){const c=[];for(const u in a){const d=a[u];delete d.metadata,c.push(d)}return c}if(t){const a=o(e.textures),c=o(e.images);a.length>0&&(i.textures=a),c.length>0&&(i.images=c)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const o=t.length;i=new Array(o);for(let a=0;a!==o;++a)i[a]=t[a].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class nr extends Ro{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new or,this.combine=Cv,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Jt=new k,Jl=new Be;class Cn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=jd,this.updateRanges=[],this.gpuType=Ni,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let o=0,a=this.itemSize;o<a;o++)this.array[e+o]=t.array[i+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Jl.fromBufferAttribute(this,t),Jl.applyMatrix3(e),this.setXY(t,Jl.x,Jl.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Jt.fromBufferAttribute(this,t),Jt.applyMatrix3(e),this.setXYZ(t,Jt.x,Jt.y,Jt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Jt.fromBufferAttribute(this,t),Jt.applyMatrix4(e),this.setXYZ(t,Jt.x,Jt.y,Jt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Jt.fromBufferAttribute(this,t),Jt.applyNormalMatrix(e),this.setXYZ(t,Jt.x,Jt.y,Jt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Jt.fromBufferAttribute(this,t),Jt.transformDirection(e),this.setXYZ(t,Jt.x,Jt.y,Jt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=wi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,o){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=o,this}setXYZW(e,t,i,o,a){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array),a=Lt(a,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=o,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==jd&&(e.usage=this.usage),e}}class Gv extends Cn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Wv extends Cn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class qt extends Cn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let tS=0;const ai=new It,Wf=new Un,no=new k,Kn=new Ss,ha=new Ss,cn=new k;class Wt extends Ao{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tS++}),this.uuid=Oi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(kv(e)?Wv:Gv)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const a=new ct().getNormalMatrix(e);i.applyNormalMatrix(a),i.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return Wf.lookAt(e),Wf.updateMatrix(),this.applyMatrix4(Wf.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(no).negate(),this.translate(no.x,no.y,no.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let o=0,a=e.length;o<a;o++){const c=e[o];i.push(c.x,c.y,c.z||0)}this.setAttribute("position",new qt(i,3))}else{for(let i=0,o=t.count;i<o;i++){const a=e[i];t.setXYZ(i,a.x,a.y,a.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ss);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,o=t.length;i<o;i++){const a=t[i];Kn.setFromBufferAttribute(a),this.morphTargetsRelative?(cn.addVectors(this.boundingBox.min,Kn.min),this.boundingBox.expandByPoint(cn),cn.addVectors(this.boundingBox.max,Kn.max),this.boundingBox.expandByPoint(cn)):(this.boundingBox.expandByPoint(Kn.min),this.boundingBox.expandByPoint(Kn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Co);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){const i=this.boundingSphere.center;if(Kn.setFromBufferAttribute(e),t)for(let a=0,c=t.length;a<c;a++){const u=t[a];ha.setFromBufferAttribute(u),this.morphTargetsRelative?(cn.addVectors(Kn.min,ha.min),Kn.expandByPoint(cn),cn.addVectors(Kn.max,ha.max),Kn.expandByPoint(cn)):(Kn.expandByPoint(ha.min),Kn.expandByPoint(ha.max))}Kn.getCenter(i);let o=0;for(let a=0,c=e.count;a<c;a++)cn.fromBufferAttribute(e,a),o=Math.max(o,i.distanceToSquared(cn));if(t)for(let a=0,c=t.length;a<c;a++){const u=t[a],d=this.morphTargetsRelative;for(let h=0,m=u.count;h<m;h++)cn.fromBufferAttribute(u,h),d&&(no.fromBufferAttribute(e,h),cn.add(no)),o=Math.max(o,i.distanceToSquared(cn))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,o=t.normal,a=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Cn(new Float32Array(4*i.count),4));const c=this.getAttribute("tangent"),u=[],d=[];for(let Y=0;Y<i.count;Y++)u[Y]=new k,d[Y]=new k;const h=new k,m=new k,g=new k,v=new Be,y=new Be,M=new Be,w=new k,S=new k;function x(Y,L,b){h.fromBufferAttribute(i,Y),m.fromBufferAttribute(i,L),g.fromBufferAttribute(i,b),v.fromBufferAttribute(a,Y),y.fromBufferAttribute(a,L),M.fromBufferAttribute(a,b),m.sub(h),g.sub(h),y.sub(v),M.sub(v);const V=1/(y.x*M.y-M.x*y.y);isFinite(V)&&(w.copy(m).multiplyScalar(M.y).addScaledVector(g,-y.y).multiplyScalar(V),S.copy(g).multiplyScalar(y.x).addScaledVector(m,-M.x).multiplyScalar(V),u[Y].add(w),u[L].add(w),u[b].add(w),d[Y].add(S),d[L].add(S),d[b].add(S))}let I=this.groups;I.length===0&&(I=[{start:0,count:e.count}]);for(let Y=0,L=I.length;Y<L;++Y){const b=I[Y],V=b.start,ae=b.count;for(let ne=V,de=V+ae;ne<de;ne+=3)x(e.getX(ne+0),e.getX(ne+1),e.getX(ne+2))}const C=new k,E=new k,Z=new k,D=new k;function O(Y){Z.fromBufferAttribute(o,Y),D.copy(Z);const L=u[Y];C.copy(L),C.sub(Z.multiplyScalar(Z.dot(L))).normalize(),E.crossVectors(D,L);const V=E.dot(d[Y])<0?-1:1;c.setXYZW(Y,C.x,C.y,C.z,V)}for(let Y=0,L=I.length;Y<L;++Y){const b=I[Y],V=b.start,ae=b.count;for(let ne=V,de=V+ae;ne<de;ne+=3)O(e.getX(ne+0)),O(e.getX(ne+1)),O(e.getX(ne+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Cn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let v=0,y=i.count;v<y;v++)i.setXYZ(v,0,0,0);const o=new k,a=new k,c=new k,u=new k,d=new k,h=new k,m=new k,g=new k;if(e)for(let v=0,y=e.count;v<y;v+=3){const M=e.getX(v+0),w=e.getX(v+1),S=e.getX(v+2);o.fromBufferAttribute(t,M),a.fromBufferAttribute(t,w),c.fromBufferAttribute(t,S),m.subVectors(c,a),g.subVectors(o,a),m.cross(g),u.fromBufferAttribute(i,M),d.fromBufferAttribute(i,w),h.fromBufferAttribute(i,S),u.add(m),d.add(m),h.add(m),i.setXYZ(M,u.x,u.y,u.z),i.setXYZ(w,d.x,d.y,d.z),i.setXYZ(S,h.x,h.y,h.z)}else for(let v=0,y=t.count;v<y;v+=3)o.fromBufferAttribute(t,v+0),a.fromBufferAttribute(t,v+1),c.fromBufferAttribute(t,v+2),m.subVectors(c,a),g.subVectors(o,a),m.cross(g),i.setXYZ(v+0,m.x,m.y,m.z),i.setXYZ(v+1,m.x,m.y,m.z),i.setXYZ(v+2,m.x,m.y,m.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)cn.fromBufferAttribute(e,t),cn.normalize(),e.setXYZ(t,cn.x,cn.y,cn.z)}toNonIndexed(){function e(u,d){const h=u.array,m=u.itemSize,g=u.normalized,v=new h.constructor(d.length*m);let y=0,M=0;for(let w=0,S=d.length;w<S;w++){u.isInterleavedBufferAttribute?y=d[w]*u.data.stride+u.offset:y=d[w]*m;for(let x=0;x<m;x++)v[M++]=h[y++]}return new Cn(v,m,g)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Wt,i=this.index.array,o=this.attributes;for(const u in o){const d=o[u],h=e(d,i);t.setAttribute(u,h)}const a=this.morphAttributes;for(const u in a){const d=[],h=a[u];for(let m=0,g=h.length;m<g;m++){const v=h[m],y=e(v,i);d.push(y)}t.morphAttributes[u]=d}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let u=0,d=c.length;u<d;u++){const h=c[u];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const d=this.parameters;for(const h in d)d[h]!==void 0&&(e[h]=d[h]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const d in i){const h=i[d];e.data.attributes[d]=h.toJSON(e.data)}const o={};let a=!1;for(const d in this.morphAttributes){const h=this.morphAttributes[d],m=[];for(let g=0,v=h.length;g<v;g++){const y=h[g];m.push(y.toJSON(e.data))}m.length>0&&(o[d]=m,a=!0)}a&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const u=this.boundingSphere;return u!==null&&(e.data.boundingSphere={center:u.center.toArray(),radius:u.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const o=e.attributes;for(const h in o){const m=o[h];this.setAttribute(h,m.clone(t))}const a=e.morphAttributes;for(const h in a){const m=[],g=a[h];for(let v=0,y=g.length;v<y;v++)m.push(g[v].clone(t));this.morphAttributes[h]=m}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let h=0,m=c.length;h<m;h++){const g=c[h];this.addGroup(g.start,g.count,g.materialIndex)}const u=e.boundingBox;u!==null&&(this.boundingBox=u.clone());const d=e.boundingSphere;return d!==null&&(this.boundingSphere=d.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Sg=new It,rs=new lh,Ql=new Co,Mg=new k,ec=new k,tc=new k,nc=new k,Xf=new k,ic=new k,Eg=new k,rc=new k;class gn extends Un{constructor(e=new Wt,t=new nr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const o=t[i[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=o.length;a<c;a++){const u=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=a}}}}getVertexPosition(e,t){const i=this.geometry,o=i.attributes.position,a=i.morphAttributes.position,c=i.morphTargetsRelative;t.fromBufferAttribute(o,e);const u=this.morphTargetInfluences;if(a&&u){ic.set(0,0,0);for(let d=0,h=a.length;d<h;d++){const m=u[d],g=a[d];m!==0&&(Xf.fromBufferAttribute(g,e),c?ic.addScaledVector(Xf,m):ic.addScaledVector(Xf.sub(t),m))}t.add(ic)}return t}raycast(e,t){const i=this.geometry,o=this.material,a=this.matrixWorld;o!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ql.copy(i.boundingSphere),Ql.applyMatrix4(a),rs.copy(e.ray).recast(e.near),!(Ql.containsPoint(rs.origin)===!1&&(rs.intersectSphere(Ql,Mg)===null||rs.origin.distanceToSquared(Mg)>(e.far-e.near)**2))&&(Sg.copy(a).invert(),rs.copy(e.ray).applyMatrix4(Sg),!(i.boundingBox!==null&&rs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,rs)))}_computeIntersections(e,t,i){let o;const a=this.geometry,c=this.material,u=a.index,d=a.attributes.position,h=a.attributes.uv,m=a.attributes.uv1,g=a.attributes.normal,v=a.groups,y=a.drawRange;if(u!==null)if(Array.isArray(c))for(let M=0,w=v.length;M<w;M++){const S=v[M],x=c[S.materialIndex],I=Math.max(S.start,y.start),C=Math.min(u.count,Math.min(S.start+S.count,y.start+y.count));for(let E=I,Z=C;E<Z;E+=3){const D=u.getX(E),O=u.getX(E+1),Y=u.getX(E+2);o=sc(this,x,e,i,h,m,g,D,O,Y),o&&(o.faceIndex=Math.floor(E/3),o.face.materialIndex=S.materialIndex,t.push(o))}}else{const M=Math.max(0,y.start),w=Math.min(u.count,y.start+y.count);for(let S=M,x=w;S<x;S+=3){const I=u.getX(S),C=u.getX(S+1),E=u.getX(S+2);o=sc(this,c,e,i,h,m,g,I,C,E),o&&(o.faceIndex=Math.floor(S/3),t.push(o))}}else if(d!==void 0)if(Array.isArray(c))for(let M=0,w=v.length;M<w;M++){const S=v[M],x=c[S.materialIndex],I=Math.max(S.start,y.start),C=Math.min(d.count,Math.min(S.start+S.count,y.start+y.count));for(let E=I,Z=C;E<Z;E+=3){const D=E,O=E+1,Y=E+2;o=sc(this,x,e,i,h,m,g,D,O,Y),o&&(o.faceIndex=Math.floor(E/3),o.face.materialIndex=S.materialIndex,t.push(o))}}else{const M=Math.max(0,y.start),w=Math.min(d.count,y.start+y.count);for(let S=M,x=w;S<x;S+=3){const I=S,C=S+1,E=S+2;o=sc(this,c,e,i,h,m,g,I,C,E),o&&(o.faceIndex=Math.floor(S/3),t.push(o))}}}}function nS(s,e,t,i,o,a,c,u){let d;if(e.side===Xn?d=i.intersectTriangle(c,a,o,!0,u):d=i.intersectTriangle(o,a,c,e.side===Br,u),d===null)return null;rc.copy(u),rc.applyMatrix4(s.matrixWorld);const h=t.ray.origin.distanceTo(rc);return h<t.near||h>t.far?null:{distance:h,point:rc.clone(),object:s}}function sc(s,e,t,i,o,a,c,u,d,h){s.getVertexPosition(u,ec),s.getVertexPosition(d,tc),s.getVertexPosition(h,nc);const m=nS(s,e,t,i,ec,tc,nc,Eg);if(m){const g=new k;ci.getBarycoord(Eg,ec,tc,nc,g),o&&(m.uv=ci.getInterpolatedAttribute(o,u,d,h,g,new Be)),a&&(m.uv1=ci.getInterpolatedAttribute(a,u,d,h,g,new Be)),c&&(m.normal=ci.getInterpolatedAttribute(c,u,d,h,g,new k),m.normal.dot(i.direction)>0&&m.normal.multiplyScalar(-1));const v={a:u,b:d,c:h,normal:new k,materialIndex:0};ci.getNormal(ec,tc,nc,v.normal),m.face=v,m.barycoord=g}return m}class Fa extends Wt{constructor(e=1,t=1,i=1,o=1,a=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:o,heightSegments:a,depthSegments:c};const u=this;o=Math.floor(o),a=Math.floor(a),c=Math.floor(c);const d=[],h=[],m=[],g=[];let v=0,y=0;M("z","y","x",-1,-1,i,t,e,c,a,0),M("z","y","x",1,-1,i,t,-e,c,a,1),M("x","z","y",1,1,e,i,t,o,c,2),M("x","z","y",1,-1,e,i,-t,o,c,3),M("x","y","z",1,-1,e,t,i,o,a,4),M("x","y","z",-1,-1,e,t,-i,o,a,5),this.setIndex(d),this.setAttribute("position",new qt(h,3)),this.setAttribute("normal",new qt(m,3)),this.setAttribute("uv",new qt(g,2));function M(w,S,x,I,C,E,Z,D,O,Y,L){const b=E/O,V=Z/Y,ae=E/2,ne=Z/2,de=D/2,pe=O+1,oe=Y+1;let ce=0,B=0;const le=new k;for(let se=0;se<oe;se++){const F=se*V-ne;for(let ie=0;ie<pe;ie++){const Ne=ie*b-ae;le[w]=Ne*I,le[S]=F*C,le[x]=de,h.push(le.x,le.y,le.z),le[w]=0,le[S]=0,le[x]=D>0?1:-1,m.push(le.x,le.y,le.z),g.push(ie/O),g.push(1-se/Y),ce+=1}}for(let se=0;se<Y;se++)for(let F=0;F<O;F++){const ie=v+F+pe*se,Ne=v+F+pe*(se+1),J=v+(F+1)+pe*(se+1),ue=v+(F+1)+pe*se;d.push(ie,Ne,ue),d.push(Ne,J,ue),B+=6}u.addGroup(y,B,L),y+=B,v+=ce}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Mo(s){const e={};for(const t in s){e[t]={};for(const i in s[t]){const o=s[t][i];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=o.clone():Array.isArray(o)?e[t][i]=o.slice():e[t][i]=o}}return e}function Nn(s){const e={};for(let t=0;t<s.length;t++){const i=Mo(s[t]);for(const o in i)e[o]=i[o]}return e}function iS(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Xv(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:St.workingColorSpace}const rS={clone:Mo,merge:Nn};var sS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,oS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Vr extends Ro{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sS,this.fragmentShader=oS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mo(e.uniforms),this.uniformsGroups=iS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const c=this.uniforms[o].value;c&&c.isTexture?t.uniforms[o]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[o]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[o]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[o]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[o]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[o]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[o]={type:"m4",value:c.toArray()}:t.uniforms[o]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const o in this.extensions)this.extensions[o]===!0&&(i[o]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class jv extends Un{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new It,this.projectionMatrix=new It,this.projectionMatrixInverse=new It,this.coordinateSystem=ir}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Nr=new k,wg=new Be,Tg=new Be;class Mi extends jv{constructor(e=50,t=1,i=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Pa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(wa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Pa*2*Math.atan(Math.tan(wa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Nr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Nr.x,Nr.y).multiplyScalar(-e/Nr.z),Nr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Nr.x,Nr.y).multiplyScalar(-e/Nr.z)}getViewSize(e,t){return this.getViewBounds(e,wg,Tg),t.subVectors(Tg,wg)}setViewOffset(e,t,i,o,a,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=o,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(wa*.5*this.fov)/this.zoom,i=2*t,o=this.aspect*i,a=-.5*o;const c=this.view;if(this.view!==null&&this.view.enabled){const d=c.fullWidth,h=c.fullHeight;a+=c.offsetX*o/d,t-=c.offsetY*i/h,o*=c.width/d,i*=c.height/h}const u=this.filmOffset;u!==0&&(a+=e*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+o,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const io=-90,ro=1;class aS extends Un{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new Mi(io,ro,e,t);o.layers=this.layers,this.add(o);const a=new Mi(io,ro,e,t);a.layers=this.layers,this.add(a);const c=new Mi(io,ro,e,t);c.layers=this.layers,this.add(c);const u=new Mi(io,ro,e,t);u.layers=this.layers,this.add(u);const d=new Mi(io,ro,e,t);d.layers=this.layers,this.add(d);const h=new Mi(io,ro,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,o,a,c,u,d]=t;for(const h of t)this.remove(h);if(e===ir)i.up.set(0,1,0),i.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),d.up.set(0,1,0),d.lookAt(0,0,-1);else if(e===Cc)i.up.set(0,-1,0),i.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),d.up.set(0,-1,0),d.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,c,u,d,h,m]=this.children,g=e.getRenderTarget(),v=e.getActiveCubeFace(),y=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const w=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,o),e.render(t,a),e.setRenderTarget(i,1,o),e.render(t,c),e.setRenderTarget(i,2,o),e.render(t,u),e.setRenderTarget(i,3,o),e.render(t,d),e.setRenderTarget(i,4,o),e.render(t,h),i.texture.generateMipmaps=w,e.setRenderTarget(i,5,o),e.render(t,m),e.setRenderTarget(g,v,y),e.xr.enabled=M,i.texture.needsPMREMUpdate=!0}}class Yv extends An{constructor(e,t,i,o,a,c,u,d,h,m){e=e!==void 0?e:[],t=t!==void 0?t:_o,super(e,t,i,o,a,c,u,d,h,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class lS extends _s{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},o=[i,i,i,i,i,i];this.texture=new Yv(o,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ti}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new Fa(5,5,5),a=new Vr({name:"CubemapFromEquirect",uniforms:Mo(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Xn,blending:zr});a.uniforms.tEquirect.value=t;const c=new gn(o,a),u=t.minFilter;return t.minFilter===gs&&(t.minFilter=Ti),new aS(1,10,this).update(e,c),t.minFilter=u,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,i,o){const a=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,i,o);e.setRenderTarget(a)}}const jf=new k,cS=new k,uS=new ct;class cs{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,o){return this.normal.set(e,t,i),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const o=jf.subVectors(i,t).cross(cS.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(jf),o=this.normal.dot(i);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/o;return a<0||a>1?null:t.copy(e.start).addScaledVector(i,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||uS.getNormalMatrix(e),o=this.coplanarPoint(jf).applyMatrix4(e),a=this.normal.applyMatrix3(i).normalize();return this.constant=-o.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ss=new Co,oc=new k;class qv{constructor(e=new cs,t=new cs,i=new cs,o=new cs,a=new cs,c=new cs){this.planes=[e,t,i,o,a,c]}set(e,t,i,o,a,c){const u=this.planes;return u[0].copy(e),u[1].copy(t),u[2].copy(i),u[3].copy(o),u[4].copy(a),u[5].copy(c),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ir){const i=this.planes,o=e.elements,a=o[0],c=o[1],u=o[2],d=o[3],h=o[4],m=o[5],g=o[6],v=o[7],y=o[8],M=o[9],w=o[10],S=o[11],x=o[12],I=o[13],C=o[14],E=o[15];if(i[0].setComponents(d-a,v-h,S-y,E-x).normalize(),i[1].setComponents(d+a,v+h,S+y,E+x).normalize(),i[2].setComponents(d+c,v+m,S+M,E+I).normalize(),i[3].setComponents(d-c,v-m,S-M,E-I).normalize(),i[4].setComponents(d-u,v-g,S-w,E-C).normalize(),t===ir)i[5].setComponents(d+u,v+g,S+w,E+C).normalize();else if(t===Cc)i[5].setComponents(u,g,w,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ss.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ss.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ss)}intersectsSprite(e){return ss.center.set(0,0,0),ss.radius=.7071067811865476,ss.applyMatrix4(e.matrixWorld),this.intersectsSphere(ss)}intersectsSphere(e){const t=this.planes,i=e.center,o=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(i)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const o=t[i];if(oc.x=o.normal.x>0?e.max.x:e.min.x,oc.y=o.normal.y>0?e.max.y:e.min.y,oc.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(oc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Zv(){let s=null,e=!1,t=null,i=null;function o(a,c){t(a,c),i=s.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&(i=s.requestAnimationFrame(o),e=!0)},stop:function(){s.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){s=a}}}function fS(s){const e=new WeakMap;function t(u,d){const h=u.array,m=u.usage,g=h.byteLength,v=s.createBuffer();s.bindBuffer(d,v),s.bufferData(d,h,m),u.onUploadCallback();let y;if(h instanceof Float32Array)y=s.FLOAT;else if(h instanceof Uint16Array)u.isFloat16BufferAttribute?y=s.HALF_FLOAT:y=s.UNSIGNED_SHORT;else if(h instanceof Int16Array)y=s.SHORT;else if(h instanceof Uint32Array)y=s.UNSIGNED_INT;else if(h instanceof Int32Array)y=s.INT;else if(h instanceof Int8Array)y=s.BYTE;else if(h instanceof Uint8Array)y=s.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)y=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:v,type:y,bytesPerElement:h.BYTES_PER_ELEMENT,version:u.version,size:g}}function i(u,d,h){const m=d.array,g=d.updateRanges;if(s.bindBuffer(h,u),g.length===0)s.bufferSubData(h,0,m);else{g.sort((y,M)=>y.start-M.start);let v=0;for(let y=1;y<g.length;y++){const M=g[v],w=g[y];w.start<=M.start+M.count+1?M.count=Math.max(M.count,w.start+w.count-M.start):(++v,g[v]=w)}g.length=v+1;for(let y=0,M=g.length;y<M;y++){const w=g[y];s.bufferSubData(h,w.start*m.BYTES_PER_ELEMENT,m,w.start,w.count)}d.clearUpdateRanges()}d.onUploadCallback()}function o(u){return u.isInterleavedBufferAttribute&&(u=u.data),e.get(u)}function a(u){u.isInterleavedBufferAttribute&&(u=u.data);const d=e.get(u);d&&(s.deleteBuffer(d.buffer),e.delete(u))}function c(u,d){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){const m=e.get(u);(!m||m.version<u.version)&&e.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}const h=e.get(u);if(h===void 0)e.set(u,t(u,d));else if(h.version<u.version){if(h.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(h.buffer,u,d),h.version=u.version}}return{get:o,remove:a,update:c}}class Uc extends Wt{constructor(e=1,t=1,i=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:o};const a=e/2,c=t/2,u=Math.floor(i),d=Math.floor(o),h=u+1,m=d+1,g=e/u,v=t/d,y=[],M=[],w=[],S=[];for(let x=0;x<m;x++){const I=x*v-c;for(let C=0;C<h;C++){const E=C*g-a;M.push(E,-I,0),w.push(0,0,1),S.push(C/u),S.push(1-x/d)}}for(let x=0;x<d;x++)for(let I=0;I<u;I++){const C=I+h*x,E=I+h*(x+1),Z=I+1+h*(x+1),D=I+1+h*x;y.push(C,E,D),y.push(E,Z,D)}this.setIndex(y),this.setAttribute("position",new qt(M,3)),this.setAttribute("normal",new qt(w,3)),this.setAttribute("uv",new qt(S,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Uc(e.width,e.height,e.widthSegments,e.heightSegments)}}var dS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,pS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_S=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,xS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yS=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,SS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,MS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ES=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,TS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,AS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,CS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,RS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,PS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,LS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,IS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,DS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,NS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,US=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,FS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,OS=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,kS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,BS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,VS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,HS="gl_FragColor = linearToOutputTexel( gl_FragColor );",GS=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,WS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,XS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,jS=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,YS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ZS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$S=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,KS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,JS=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,QS=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,eM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,tM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,iM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,rM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,sM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,oM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,aM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lM=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cM=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,uM=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,fM=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,dM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,hM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pM=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,mM=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gM=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vM=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,_M=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,yM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,SM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,MM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,EM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,TM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,AM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,CM=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,RM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,PM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,LM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,IM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,DM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,NM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,UM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,FM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,OM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,kM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,BM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,VM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,HM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,GM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,WM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,XM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,jM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,YM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,qM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ZM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,$M=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,KM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,JM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,QM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,eE=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,tE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,nE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,iE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,rE=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,sE=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,oE=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,aE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,cE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,uE=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const fE=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,dE=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pE=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gE=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,_E=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xE=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,yE=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,SE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ME=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,EE=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wE=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,TE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,AE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CE=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,RE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,PE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,LE=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,IE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,DE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,NE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,UE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,FE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,OE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kE=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,BE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,VE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,HE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,GE=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,WE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ut={alphahash_fragment:dS,alphahash_pars_fragment:hS,alphamap_fragment:pS,alphamap_pars_fragment:mS,alphatest_fragment:gS,alphatest_pars_fragment:vS,aomap_fragment:_S,aomap_pars_fragment:xS,batching_pars_vertex:yS,batching_vertex:SS,begin_vertex:MS,beginnormal_vertex:ES,bsdfs:wS,iridescence_fragment:TS,bumpmap_pars_fragment:AS,clipping_planes_fragment:CS,clipping_planes_pars_fragment:RS,clipping_planes_pars_vertex:bS,clipping_planes_vertex:PS,color_fragment:LS,color_pars_fragment:IS,color_pars_vertex:DS,color_vertex:NS,common:US,cube_uv_reflection_fragment:FS,defaultnormal_vertex:OS,displacementmap_pars_vertex:zS,displacementmap_vertex:kS,emissivemap_fragment:BS,emissivemap_pars_fragment:VS,colorspace_fragment:HS,colorspace_pars_fragment:GS,envmap_fragment:WS,envmap_common_pars_fragment:XS,envmap_pars_fragment:jS,envmap_pars_vertex:YS,envmap_physical_pars_fragment:rM,envmap_vertex:qS,fog_vertex:ZS,fog_pars_vertex:$S,fog_fragment:KS,fog_pars_fragment:JS,gradientmap_pars_fragment:QS,lightmap_pars_fragment:eM,lights_lambert_fragment:tM,lights_lambert_pars_fragment:nM,lights_pars_begin:iM,lights_toon_fragment:sM,lights_toon_pars_fragment:oM,lights_phong_fragment:aM,lights_phong_pars_fragment:lM,lights_physical_fragment:cM,lights_physical_pars_fragment:uM,lights_fragment_begin:fM,lights_fragment_maps:dM,lights_fragment_end:hM,logdepthbuf_fragment:pM,logdepthbuf_pars_fragment:mM,logdepthbuf_pars_vertex:gM,logdepthbuf_vertex:vM,map_fragment:_M,map_pars_fragment:xM,map_particle_fragment:yM,map_particle_pars_fragment:SM,metalnessmap_fragment:MM,metalnessmap_pars_fragment:EM,morphinstance_vertex:wM,morphcolor_vertex:TM,morphnormal_vertex:AM,morphtarget_pars_vertex:CM,morphtarget_vertex:RM,normal_fragment_begin:bM,normal_fragment_maps:PM,normal_pars_fragment:LM,normal_pars_vertex:IM,normal_vertex:DM,normalmap_pars_fragment:NM,clearcoat_normal_fragment_begin:UM,clearcoat_normal_fragment_maps:FM,clearcoat_pars_fragment:OM,iridescence_pars_fragment:zM,opaque_fragment:kM,packing:BM,premultiplied_alpha_fragment:VM,project_vertex:HM,dithering_fragment:GM,dithering_pars_fragment:WM,roughnessmap_fragment:XM,roughnessmap_pars_fragment:jM,shadowmap_pars_fragment:YM,shadowmap_pars_vertex:qM,shadowmap_vertex:ZM,shadowmask_pars_fragment:$M,skinbase_vertex:KM,skinning_pars_vertex:JM,skinning_vertex:QM,skinnormal_vertex:eE,specularmap_fragment:tE,specularmap_pars_fragment:nE,tonemapping_fragment:iE,tonemapping_pars_fragment:rE,transmission_fragment:sE,transmission_pars_fragment:oE,uv_pars_fragment:aE,uv_pars_vertex:lE,uv_vertex:cE,worldpos_vertex:uE,background_vert:fE,background_frag:dE,backgroundCube_vert:hE,backgroundCube_frag:pE,cube_vert:mE,cube_frag:gE,depth_vert:vE,depth_frag:_E,distanceRGBA_vert:xE,distanceRGBA_frag:yE,equirect_vert:SE,equirect_frag:ME,linedashed_vert:EE,linedashed_frag:wE,meshbasic_vert:TE,meshbasic_frag:AE,meshlambert_vert:CE,meshlambert_frag:RE,meshmatcap_vert:bE,meshmatcap_frag:PE,meshnormal_vert:LE,meshnormal_frag:IE,meshphong_vert:DE,meshphong_frag:NE,meshphysical_vert:UE,meshphysical_frag:FE,meshtoon_vert:OE,meshtoon_frag:zE,points_vert:kE,points_frag:BE,shadow_vert:VE,shadow_frag:HE,sprite_vert:GE,sprite_frag:WE},Pe={common:{diffuse:{value:new At(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ct}},envmap:{envMap:{value:null},envMapRotation:{value:new ct},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ct},normalScale:{value:new Be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new At(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new At(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0},uvTransform:{value:new ct}},sprite:{diffuse:{value:new At(16777215)},opacity:{value:1},center:{value:new Be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}}},Di={basic:{uniforms:Nn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.fog]),vertexShader:ut.meshbasic_vert,fragmentShader:ut.meshbasic_frag},lambert:{uniforms:Nn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new At(0)}}]),vertexShader:ut.meshlambert_vert,fragmentShader:ut.meshlambert_frag},phong:{uniforms:Nn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new At(0)},specular:{value:new At(1118481)},shininess:{value:30}}]),vertexShader:ut.meshphong_vert,fragmentShader:ut.meshphong_frag},standard:{uniforms:Nn([Pe.common,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.roughnessmap,Pe.metalnessmap,Pe.fog,Pe.lights,{emissive:{value:new At(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ut.meshphysical_vert,fragmentShader:ut.meshphysical_frag},toon:{uniforms:Nn([Pe.common,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.gradientmap,Pe.fog,Pe.lights,{emissive:{value:new At(0)}}]),vertexShader:ut.meshtoon_vert,fragmentShader:ut.meshtoon_frag},matcap:{uniforms:Nn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,{matcap:{value:null}}]),vertexShader:ut.meshmatcap_vert,fragmentShader:ut.meshmatcap_frag},points:{uniforms:Nn([Pe.points,Pe.fog]),vertexShader:ut.points_vert,fragmentShader:ut.points_frag},dashed:{uniforms:Nn([Pe.common,Pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ut.linedashed_vert,fragmentShader:ut.linedashed_frag},depth:{uniforms:Nn([Pe.common,Pe.displacementmap]),vertexShader:ut.depth_vert,fragmentShader:ut.depth_frag},normal:{uniforms:Nn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,{opacity:{value:1}}]),vertexShader:ut.meshnormal_vert,fragmentShader:ut.meshnormal_frag},sprite:{uniforms:Nn([Pe.sprite,Pe.fog]),vertexShader:ut.sprite_vert,fragmentShader:ut.sprite_frag},background:{uniforms:{uvTransform:{value:new ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ut.background_vert,fragmentShader:ut.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ct}},vertexShader:ut.backgroundCube_vert,fragmentShader:ut.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ut.cube_vert,fragmentShader:ut.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ut.equirect_vert,fragmentShader:ut.equirect_frag},distanceRGBA:{uniforms:Nn([Pe.common,Pe.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ut.distanceRGBA_vert,fragmentShader:ut.distanceRGBA_frag},shadow:{uniforms:Nn([Pe.lights,Pe.fog,{color:{value:new At(0)},opacity:{value:1}}]),vertexShader:ut.shadow_vert,fragmentShader:ut.shadow_frag}};Di.physical={uniforms:Nn([Di.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ct},clearcoatNormalScale:{value:new Be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ct},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ct},sheen:{value:0},sheenColor:{value:new At(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ct},transmissionSamplerSize:{value:new Be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ct},attenuationDistance:{value:0},attenuationColor:{value:new At(0)},specularColor:{value:new At(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ct},anisotropyVector:{value:new Be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ct}}]),vertexShader:ut.meshphysical_vert,fragmentShader:ut.meshphysical_frag};const ac={r:0,b:0,g:0},os=new or,XE=new It;function jE(s,e,t,i,o,a,c){const u=new At(0);let d=a===!0?0:1,h,m,g=null,v=0,y=null;function M(I){let C=I.isScene===!0?I.background:null;return C&&C.isTexture&&(C=(I.backgroundBlurriness>0?t:e).get(C)),C}function w(I){let C=!1;const E=M(I);E===null?x(u,d):E&&E.isColor&&(x(E,1),C=!0);const Z=s.xr.getEnvironmentBlendMode();Z==="additive"?i.buffers.color.setClear(0,0,0,1,c):Z==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,c),(s.autoClear||C)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function S(I,C){const E=M(C);E&&(E.isCubeTexture||E.mapping===Dc)?(m===void 0&&(m=new gn(new Fa(1,1,1),new Vr({name:"BackgroundCubeMaterial",uniforms:Mo(Di.backgroundCube.uniforms),vertexShader:Di.backgroundCube.vertexShader,fragmentShader:Di.backgroundCube.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(Z,D,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(m)),os.copy(C.backgroundRotation),os.x*=-1,os.y*=-1,os.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(os.y*=-1,os.z*=-1),m.material.uniforms.envMap.value=E,m.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=C.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(XE.makeRotationFromEuler(os)),m.material.toneMapped=St.getTransfer(E.colorSpace)!==Nt,(g!==E||v!==E.version||y!==s.toneMapping)&&(m.material.needsUpdate=!0,g=E,v=E.version,y=s.toneMapping),m.layers.enableAll(),I.unshift(m,m.geometry,m.material,0,0,null)):E&&E.isTexture&&(h===void 0&&(h=new gn(new Uc(2,2),new Vr({name:"BackgroundMaterial",uniforms:Mo(Di.background.uniforms),vertexShader:Di.background.vertexShader,fragmentShader:Di.background.fragmentShader,side:Br,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(h)),h.material.uniforms.t2D.value=E,h.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,h.material.toneMapped=St.getTransfer(E.colorSpace)!==Nt,E.matrixAutoUpdate===!0&&E.updateMatrix(),h.material.uniforms.uvTransform.value.copy(E.matrix),(g!==E||v!==E.version||y!==s.toneMapping)&&(h.material.needsUpdate=!0,g=E,v=E.version,y=s.toneMapping),h.layers.enableAll(),I.unshift(h,h.geometry,h.material,0,0,null))}function x(I,C){I.getRGB(ac,Xv(s)),i.buffers.color.setClear(ac.r,ac.g,ac.b,C,c)}return{getClearColor:function(){return u},setClearColor:function(I,C=1){u.set(I),d=C,x(u,d)},getClearAlpha:function(){return d},setClearAlpha:function(I){d=I,x(u,d)},render:w,addToRenderList:S}}function YE(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},o=v(null);let a=o,c=!1;function u(b,V,ae,ne,de){let pe=!1;const oe=g(ne,ae,V);a!==oe&&(a=oe,h(a.object)),pe=y(b,ne,ae,de),pe&&M(b,ne,ae,de),de!==null&&e.update(de,s.ELEMENT_ARRAY_BUFFER),(pe||c)&&(c=!1,E(b,V,ae,ne),de!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(de).buffer))}function d(){return s.createVertexArray()}function h(b){return s.bindVertexArray(b)}function m(b){return s.deleteVertexArray(b)}function g(b,V,ae){const ne=ae.wireframe===!0;let de=i[b.id];de===void 0&&(de={},i[b.id]=de);let pe=de[V.id];pe===void 0&&(pe={},de[V.id]=pe);let oe=pe[ne];return oe===void 0&&(oe=v(d()),pe[ne]=oe),oe}function v(b){const V=[],ae=[],ne=[];for(let de=0;de<t;de++)V[de]=0,ae[de]=0,ne[de]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:ae,attributeDivisors:ne,object:b,attributes:{},index:null}}function y(b,V,ae,ne){const de=a.attributes,pe=V.attributes;let oe=0;const ce=ae.getAttributes();for(const B in ce)if(ce[B].location>=0){const se=de[B];let F=pe[B];if(F===void 0&&(B==="instanceMatrix"&&b.instanceMatrix&&(F=b.instanceMatrix),B==="instanceColor"&&b.instanceColor&&(F=b.instanceColor)),se===void 0||se.attribute!==F||F&&se.data!==F.data)return!0;oe++}return a.attributesNum!==oe||a.index!==ne}function M(b,V,ae,ne){const de={},pe=V.attributes;let oe=0;const ce=ae.getAttributes();for(const B in ce)if(ce[B].location>=0){let se=pe[B];se===void 0&&(B==="instanceMatrix"&&b.instanceMatrix&&(se=b.instanceMatrix),B==="instanceColor"&&b.instanceColor&&(se=b.instanceColor));const F={};F.attribute=se,se&&se.data&&(F.data=se.data),de[B]=F,oe++}a.attributes=de,a.attributesNum=oe,a.index=ne}function w(){const b=a.newAttributes;for(let V=0,ae=b.length;V<ae;V++)b[V]=0}function S(b){x(b,0)}function x(b,V){const ae=a.newAttributes,ne=a.enabledAttributes,de=a.attributeDivisors;ae[b]=1,ne[b]===0&&(s.enableVertexAttribArray(b),ne[b]=1),de[b]!==V&&(s.vertexAttribDivisor(b,V),de[b]=V)}function I(){const b=a.newAttributes,V=a.enabledAttributes;for(let ae=0,ne=V.length;ae<ne;ae++)V[ae]!==b[ae]&&(s.disableVertexAttribArray(ae),V[ae]=0)}function C(b,V,ae,ne,de,pe,oe){oe===!0?s.vertexAttribIPointer(b,V,ae,de,pe):s.vertexAttribPointer(b,V,ae,ne,de,pe)}function E(b,V,ae,ne){w();const de=ne.attributes,pe=ae.getAttributes(),oe=V.defaultAttributeValues;for(const ce in pe){const B=pe[ce];if(B.location>=0){let le=de[ce];if(le===void 0&&(ce==="instanceMatrix"&&b.instanceMatrix&&(le=b.instanceMatrix),ce==="instanceColor"&&b.instanceColor&&(le=b.instanceColor)),le!==void 0){const se=le.normalized,F=le.itemSize,ie=e.get(le);if(ie===void 0)continue;const Ne=ie.buffer,J=ie.type,ue=ie.bytesPerElement,we=J===s.INT||J===s.UNSIGNED_INT||le.gpuType===eh;if(le.isInterleavedBufferAttribute){const xe=le.data,Ce=xe.stride,Ue=le.offset;if(xe.isInstancedInterleavedBuffer){for(let Qe=0;Qe<B.locationSize;Qe++)x(B.location+Qe,xe.meshPerAttribute);b.isInstancedMesh!==!0&&ne._maxInstanceCount===void 0&&(ne._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let Qe=0;Qe<B.locationSize;Qe++)S(B.location+Qe);s.bindBuffer(s.ARRAY_BUFFER,Ne);for(let Qe=0;Qe<B.locationSize;Qe++)C(B.location+Qe,F/B.locationSize,J,se,Ce*ue,(Ue+F/B.locationSize*Qe)*ue,we)}else{if(le.isInstancedBufferAttribute){for(let xe=0;xe<B.locationSize;xe++)x(B.location+xe,le.meshPerAttribute);b.isInstancedMesh!==!0&&ne._maxInstanceCount===void 0&&(ne._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let xe=0;xe<B.locationSize;xe++)S(B.location+xe);s.bindBuffer(s.ARRAY_BUFFER,Ne);for(let xe=0;xe<B.locationSize;xe++)C(B.location+xe,F/B.locationSize,J,se,F*ue,F/B.locationSize*xe*ue,we)}}else if(oe!==void 0){const se=oe[ce];if(se!==void 0)switch(se.length){case 2:s.vertexAttrib2fv(B.location,se);break;case 3:s.vertexAttrib3fv(B.location,se);break;case 4:s.vertexAttrib4fv(B.location,se);break;default:s.vertexAttrib1fv(B.location,se)}}}}I()}function Z(){Y();for(const b in i){const V=i[b];for(const ae in V){const ne=V[ae];for(const de in ne)m(ne[de].object),delete ne[de];delete V[ae]}delete i[b]}}function D(b){if(i[b.id]===void 0)return;const V=i[b.id];for(const ae in V){const ne=V[ae];for(const de in ne)m(ne[de].object),delete ne[de];delete V[ae]}delete i[b.id]}function O(b){for(const V in i){const ae=i[V];if(ae[b.id]===void 0)continue;const ne=ae[b.id];for(const de in ne)m(ne[de].object),delete ne[de];delete ae[b.id]}}function Y(){L(),c=!0,a!==o&&(a=o,h(a.object))}function L(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:u,reset:Y,resetDefaultState:L,dispose:Z,releaseStatesOfGeometry:D,releaseStatesOfProgram:O,initAttributes:w,enableAttribute:S,disableUnusedAttributes:I}}function qE(s,e,t){let i;function o(h){i=h}function a(h,m){s.drawArrays(i,h,m),t.update(m,i,1)}function c(h,m,g){g!==0&&(s.drawArraysInstanced(i,h,m,g),t.update(m,i,g))}function u(h,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,h,0,m,0,g);let y=0;for(let M=0;M<g;M++)y+=m[M];t.update(y,i,1)}function d(h,m,g,v){if(g===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let M=0;M<h.length;M++)c(h[M],m[M],v[M]);else{y.multiDrawArraysInstancedWEBGL(i,h,0,m,0,v,0,g);let M=0;for(let w=0;w<g;w++)M+=m[w]*v[w];t.update(M,i,1)}}this.setMode=o,this.render=a,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function ZE(s,e,t,i){let o;function a(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const O=e.get("EXT_texture_filter_anisotropic");o=s.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function c(O){return!(O!==Ai&&i.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(O){const Y=O===Ua&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==sr&&i.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==Ni&&!Y)}function d(O){if(O==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=t.precision!==void 0?t.precision:"highp";const m=d(h);m!==h&&(console.warn("THREE.WebGLRenderer:",h,"not supported, using",m,"instead."),h=m);const g=t.logarithmicDepthBuffer===!0,v=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),y=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),M=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=s.getParameter(s.MAX_TEXTURE_SIZE),S=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),x=s.getParameter(s.MAX_VERTEX_ATTRIBS),I=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),C=s.getParameter(s.MAX_VARYING_VECTORS),E=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),Z=M>0,D=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:d,textureFormatReadable:c,textureTypeReadable:u,precision:h,logarithmicDepthBuffer:g,reverseDepthBuffer:v,maxTextures:y,maxVertexTextures:M,maxTextureSize:w,maxCubemapSize:S,maxAttributes:x,maxVertexUniforms:I,maxVaryings:C,maxFragmentUniforms:E,vertexTextures:Z,maxSamples:D}}function $E(s){const e=this;let t=null,i=0,o=!1,a=!1;const c=new cs,u=new ct,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(g,v){const y=g.length!==0||v||i!==0||o;return o=v,i=g.length,y},this.beginShadows=function(){a=!0,m(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(g,v){t=m(g,v,0)},this.setState=function(g,v,y){const M=g.clippingPlanes,w=g.clipIntersection,S=g.clipShadows,x=s.get(g);if(!o||M===null||M.length===0||a&&!S)a?m(null):h();else{const I=a?0:i,C=I*4;let E=x.clippingState||null;d.value=E,E=m(M,v,C,y);for(let Z=0;Z!==C;++Z)E[Z]=t[Z];x.clippingState=E,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=I}};function h(){d.value!==t&&(d.value=t,d.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function m(g,v,y,M){const w=g!==null?g.length:0;let S=null;if(w!==0){if(S=d.value,M!==!0||S===null){const x=y+w*4,I=v.matrixWorldInverse;u.getNormalMatrix(I),(S===null||S.length<x)&&(S=new Float32Array(x));for(let C=0,E=y;C!==w;++C,E+=4)c.copy(g[C]).applyMatrix4(I,u),c.normal.toArray(S,E),S[E+3]=c.constant}d.value=S,d.needsUpdate=!0}return e.numPlanes=w,e.numIntersection=0,S}}function KE(s){let e=new WeakMap;function t(c,u){return u===gd?c.mapping=_o:u===vd&&(c.mapping=xo),c}function i(c){if(c&&c.isTexture){const u=c.mapping;if(u===gd||u===vd)if(e.has(c)){const d=e.get(c).texture;return t(d,c.mapping)}else{const d=c.image;if(d&&d.height>0){const h=new lS(d.height);return h.fromEquirectangularTexture(s,c),e.set(c,h),c.addEventListener("dispose",o),t(h.texture,c.mapping)}else return null}}return c}function o(c){const u=c.target;u.removeEventListener("dispose",o);const d=e.get(u);d!==void 0&&(e.delete(u),d.dispose())}function a(){e=new WeakMap}return{get:i,dispose:a}}class $v extends jv{constructor(e=-1,t=1,i=1,o=-1,a=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=o,this.near=a,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,o,a,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=o,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let a=i-e,c=i+e,u=o+t,d=o-t;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=h*this.view.offsetX,c=a+h*this.view.width,u-=m*this.view.offsetY,d=u-m*this.view.height}this.projectionMatrix.makeOrthographic(a,c,u,d,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const fo=4,Ag=[.125,.215,.35,.446,.526,.582],ps=20,Yf=new $v,Cg=new At;let qf=null,Zf=0,$f=0,Kf=!1;const us=(1+Math.sqrt(5))/2,so=1/us,Rg=[new k(-us,so,0),new k(us,so,0),new k(-so,0,us),new k(so,0,us),new k(0,us,-so),new k(0,us,so),new k(-1,1,-1),new k(1,1,-1),new k(-1,1,1),new k(1,1,1)];class bg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,o=100){qf=this._renderer.getRenderTarget(),Zf=this._renderer.getActiveCubeFace(),$f=this._renderer.getActiveMipmapLevel(),Kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const a=this._allocateTargets();return a.depthBuffer=!0,this._sceneToCubeUV(e,i,o,a),t>0&&this._blur(a,0,0,t),this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ig(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Lg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(qf,Zf,$f),this._renderer.xr.enabled=Kf,e.scissorTest=!1,lc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_o||e.mapping===xo?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),qf=this._renderer.getRenderTarget(),Zf=this._renderer.getActiveCubeFace(),$f=this._renderer.getActiveMipmapLevel(),Kf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ti,minFilter:Ti,generateMipmaps:!1,type:Ua,format:Ai,colorSpace:To,depthBuffer:!1},o=Pg(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Pg(e,t,i);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=JE(a)),this._blurMaterial=QE(a,e,t)}return o}_compileMaterial(e){const t=new gn(this._lodPlanes[0],e);this._renderer.compile(t,Yf)}_sceneToCubeUV(e,t,i,o){const u=new Mi(90,1,t,i),d=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],m=this._renderer,g=m.autoClear,v=m.toneMapping;m.getClearColor(Cg),m.toneMapping=kr,m.autoClear=!1;const y=new nr({name:"PMREM.Background",side:Xn,depthWrite:!1,depthTest:!1}),M=new gn(new Fa,y);let w=!1;const S=e.background;S?S.isColor&&(y.color.copy(S),e.background=null,w=!0):(y.color.copy(Cg),w=!0);for(let x=0;x<6;x++){const I=x%3;I===0?(u.up.set(0,d[x],0),u.lookAt(h[x],0,0)):I===1?(u.up.set(0,0,d[x]),u.lookAt(0,h[x],0)):(u.up.set(0,d[x],0),u.lookAt(0,0,h[x]));const C=this._cubeSize;lc(o,I*C,x>2?C:0,C,C),m.setRenderTarget(o),w&&m.render(M,u),m.render(e,u)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=v,m.autoClear=g,e.background=S}_textureToCubeUV(e,t){const i=this._renderer,o=e.mapping===_o||e.mapping===xo;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ig()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Lg());const a=o?this._cubemapMaterial:this._equirectMaterial,c=new gn(this._lodPlanes[0],a),u=a.uniforms;u.envMap.value=e;const d=this._cubeSize;lc(t,0,0,3*d,2*d),i.setRenderTarget(t),i.render(c,Yf)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const o=this._lodPlanes.length;for(let a=1;a<o;a++){const c=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),u=Rg[(o-a-1)%Rg.length];this._blur(e,a-1,a,c,u)}t.autoClear=i}_blur(e,t,i,o,a){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,i,o,"latitudinal",a),this._halfBlur(c,e,i,i,o,"longitudinal",a)}_halfBlur(e,t,i,o,a,c,u){const d=this._renderer,h=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,g=new gn(this._lodPlanes[o],h),v=h.uniforms,y=this._sizeLods[i]-1,M=isFinite(a)?Math.PI/(2*y):2*Math.PI/(2*ps-1),w=a/M,S=isFinite(a)?1+Math.floor(m*w):ps;S>ps&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${ps}`);const x=[];let I=0;for(let O=0;O<ps;++O){const Y=O/w,L=Math.exp(-Y*Y/2);x.push(L),O===0?I+=L:O<S&&(I+=2*L)}for(let O=0;O<x.length;O++)x[O]=x[O]/I;v.envMap.value=e.texture,v.samples.value=S,v.weights.value=x,v.latitudinal.value=c==="latitudinal",u&&(v.poleAxis.value=u);const{_lodMax:C}=this;v.dTheta.value=M,v.mipInt.value=C-i;const E=this._sizeLods[o],Z=3*E*(o>C-fo?o-C+fo:0),D=4*(this._cubeSize-E);lc(t,Z,D,3*E,2*E),d.setRenderTarget(t),d.render(g,Yf)}}function JE(s){const e=[],t=[],i=[];let o=s;const a=s-fo+1+Ag.length;for(let c=0;c<a;c++){const u=Math.pow(2,o);t.push(u);let d=1/u;c>s-fo?d=Ag[c-s+fo-1]:c===0&&(d=0),i.push(d);const h=1/(u-2),m=-h,g=1+h,v=[m,m,g,m,g,g,m,m,g,g,m,g],y=6,M=6,w=3,S=2,x=1,I=new Float32Array(w*M*y),C=new Float32Array(S*M*y),E=new Float32Array(x*M*y);for(let D=0;D<y;D++){const O=D%3*2/3-1,Y=D>2?0:-1,L=[O,Y,0,O+2/3,Y,0,O+2/3,Y+1,0,O,Y,0,O+2/3,Y+1,0,O,Y+1,0];I.set(L,w*M*D),C.set(v,S*M*D);const b=[D,D,D,D,D,D];E.set(b,x*M*D)}const Z=new Wt;Z.setAttribute("position",new Cn(I,w)),Z.setAttribute("uv",new Cn(C,S)),Z.setAttribute("faceIndex",new Cn(E,x)),e.push(Z),o>fo&&o--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Pg(s,e,t){const i=new _s(s,e,t);return i.texture.mapping=Dc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function lc(s,e,t,i,o){s.viewport.set(e,t,i,o),s.scissor.set(e,t,i,o)}function QE(s,e,t){const i=new Float32Array(ps),o=new k(0,1,0);return new Vr({name:"SphericalGaussianBlur",defines:{n:ps,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:uh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:zr,depthTest:!1,depthWrite:!1})}function Lg(){return new Vr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:uh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:zr,depthTest:!1,depthWrite:!1})}function Ig(){return new Vr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:uh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:zr,depthTest:!1,depthWrite:!1})}function uh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function e1(s){let e=new WeakMap,t=null;function i(u){if(u&&u.isTexture){const d=u.mapping,h=d===gd||d===vd,m=d===_o||d===xo;if(h||m){let g=e.get(u);const v=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==v)return t===null&&(t=new bg(s)),g=h?t.fromEquirectangular(u,g):t.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),g.texture;if(g!==void 0)return g.texture;{const y=u.image;return h&&y&&y.height>0||m&&y&&o(y)?(t===null&&(t=new bg(s)),g=h?t.fromEquirectangular(u):t.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),u.addEventListener("dispose",a),g.texture):null}}}return u}function o(u){let d=0;const h=6;for(let m=0;m<h;m++)u[m]!==void 0&&d++;return d===h}function a(u){const d=u.target;d.removeEventListener("dispose",a);const h=e.get(d);h!==void 0&&(e.delete(d),h.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:c}}function t1(s){const e={};function t(i){if(e[i]!==void 0)return e[i];let o;switch(i){case"WEBGL_depth_texture":o=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=s.getExtension(i)}return e[i]=o,o}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const o=t(i);return o===null&&Sa("THREE.WebGLRenderer: "+i+" extension not supported."),o}}}function n1(s,e,t,i){const o={},a=new WeakMap;function c(g){const v=g.target;v.index!==null&&e.remove(v.index);for(const M in v.attributes)e.remove(v.attributes[M]);for(const M in v.morphAttributes){const w=v.morphAttributes[M];for(let S=0,x=w.length;S<x;S++)e.remove(w[S])}v.removeEventListener("dispose",c),delete o[v.id];const y=a.get(v);y&&(e.remove(y),a.delete(v)),i.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function u(g,v){return o[v.id]===!0||(v.addEventListener("dispose",c),o[v.id]=!0,t.memory.geometries++),v}function d(g){const v=g.attributes;for(const M in v)e.update(v[M],s.ARRAY_BUFFER);const y=g.morphAttributes;for(const M in y){const w=y[M];for(let S=0,x=w.length;S<x;S++)e.update(w[S],s.ARRAY_BUFFER)}}function h(g){const v=[],y=g.index,M=g.attributes.position;let w=0;if(y!==null){const I=y.array;w=y.version;for(let C=0,E=I.length;C<E;C+=3){const Z=I[C+0],D=I[C+1],O=I[C+2];v.push(Z,D,D,O,O,Z)}}else if(M!==void 0){const I=M.array;w=M.version;for(let C=0,E=I.length/3-1;C<E;C+=3){const Z=C+0,D=C+1,O=C+2;v.push(Z,D,D,O,O,Z)}}else return;const S=new(kv(v)?Wv:Gv)(v,1);S.version=w;const x=a.get(g);x&&e.remove(x),a.set(g,S)}function m(g){const v=a.get(g);if(v){const y=g.index;y!==null&&v.version<y.version&&h(g)}else h(g);return a.get(g)}return{get:u,update:d,getWireframeAttribute:m}}function i1(s,e,t){let i;function o(v){i=v}let a,c;function u(v){a=v.type,c=v.bytesPerElement}function d(v,y){s.drawElements(i,y,a,v*c),t.update(y,i,1)}function h(v,y,M){M!==0&&(s.drawElementsInstanced(i,y,a,v*c,M),t.update(y,i,M))}function m(v,y,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,y,0,a,v,0,M);let S=0;for(let x=0;x<M;x++)S+=y[x];t.update(S,i,1)}function g(v,y,M,w){if(M===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let x=0;x<v.length;x++)h(v[x]/c,y[x],w[x]);else{S.multiDrawElementsInstancedWEBGL(i,y,0,a,v,0,w,0,M);let x=0;for(let I=0;I<M;I++)x+=y[I]*w[I];t.update(x,i,1)}}this.setMode=o,this.setIndex=u,this.render=d,this.renderInstances=h,this.renderMultiDraw=m,this.renderMultiDrawInstances=g}function r1(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,c,u){switch(t.calls++,c){case s.TRIANGLES:t.triangles+=u*(a/3);break;case s.LINES:t.lines+=u*(a/2);break;case s.LINE_STRIP:t.lines+=u*(a-1);break;case s.LINE_LOOP:t.lines+=u*a;break;case s.POINTS:t.points+=u*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:i}}function s1(s,e,t){const i=new WeakMap,o=new $t;function a(c,u,d){const h=c.morphTargetInfluences,m=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=m!==void 0?m.length:0;let v=i.get(u);if(v===void 0||v.count!==g){let b=function(){Y.dispose(),i.delete(u),u.removeEventListener("dispose",b)};var y=b;v!==void 0&&v.texture.dispose();const M=u.morphAttributes.position!==void 0,w=u.morphAttributes.normal!==void 0,S=u.morphAttributes.color!==void 0,x=u.morphAttributes.position||[],I=u.morphAttributes.normal||[],C=u.morphAttributes.color||[];let E=0;M===!0&&(E=1),w===!0&&(E=2),S===!0&&(E=3);let Z=u.attributes.position.count*E,D=1;Z>e.maxTextureSize&&(D=Math.ceil(Z/e.maxTextureSize),Z=e.maxTextureSize);const O=new Float32Array(Z*D*4*g),Y=new Vv(O,Z,D,g);Y.type=Ni,Y.needsUpdate=!0;const L=E*4;for(let V=0;V<g;V++){const ae=x[V],ne=I[V],de=C[V],pe=Z*D*4*V;for(let oe=0;oe<ae.count;oe++){const ce=oe*L;M===!0&&(o.fromBufferAttribute(ae,oe),O[pe+ce+0]=o.x,O[pe+ce+1]=o.y,O[pe+ce+2]=o.z,O[pe+ce+3]=0),w===!0&&(o.fromBufferAttribute(ne,oe),O[pe+ce+4]=o.x,O[pe+ce+5]=o.y,O[pe+ce+6]=o.z,O[pe+ce+7]=0),S===!0&&(o.fromBufferAttribute(de,oe),O[pe+ce+8]=o.x,O[pe+ce+9]=o.y,O[pe+ce+10]=o.z,O[pe+ce+11]=de.itemSize===4?o.w:1)}}v={count:g,texture:Y,size:new Be(Z,D)},i.set(u,v),u.addEventListener("dispose",b)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)d.getUniforms().setValue(s,"morphTexture",c.morphTexture,t);else{let M=0;for(let S=0;S<h.length;S++)M+=h[S];const w=u.morphTargetsRelative?1:1-M;d.getUniforms().setValue(s,"morphTargetBaseInfluence",w),d.getUniforms().setValue(s,"morphTargetInfluences",h)}d.getUniforms().setValue(s,"morphTargetsTexture",v.texture,t),d.getUniforms().setValue(s,"morphTargetsTextureSize",v.size)}return{update:a}}function o1(s,e,t,i){let o=new WeakMap;function a(d){const h=i.render.frame,m=d.geometry,g=e.get(d,m);if(o.get(g)!==h&&(e.update(g),o.set(g,h)),d.isInstancedMesh&&(d.hasEventListener("dispose",u)===!1&&d.addEventListener("dispose",u),o.get(d)!==h&&(t.update(d.instanceMatrix,s.ARRAY_BUFFER),d.instanceColor!==null&&t.update(d.instanceColor,s.ARRAY_BUFFER),o.set(d,h))),d.isSkinnedMesh){const v=d.skeleton;o.get(v)!==h&&(v.update(),o.set(v,h))}return g}function c(){o=new WeakMap}function u(d){const h=d.target;h.removeEventListener("dispose",u),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:c}}class Kv extends An{constructor(e,t,i,o,a,c,u,d,h,m=mo){if(m!==mo&&m!==So)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&m===mo&&(i=vs),i===void 0&&m===So&&(i=yo),super(null,o,a,c,u,d,m,i,h),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=u!==void 0?u:Jn,this.minFilter=d!==void 0?d:Jn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Jv=new An,Dg=new Kv(1,1),Qv=new Vv,e0=new jy,t0=new Yv,Ng=[],Ug=[],Fg=new Float32Array(16),Og=new Float32Array(9),zg=new Float32Array(4);function bo(s,e,t){const i=s[0];if(i<=0||i>0)return s;const o=e*t;let a=Ng[o];if(a===void 0&&(a=new Float32Array(o),Ng[o]=a),e!==0){i.toArray(a,0);for(let c=1,u=0;c!==e;++c)u+=t,s[c].toArray(a,u)}return a}function rn(s,e){if(s.length!==e.length)return!1;for(let t=0,i=s.length;t<i;t++)if(s[t]!==e[t])return!1;return!0}function sn(s,e){for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}function Fc(s,e){let t=Ug[e];t===void 0&&(t=new Int32Array(e),Ug[e]=t);for(let i=0;i!==e;++i)t[i]=s.allocateTextureUnit();return t}function a1(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function l1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;s.uniform2fv(this.addr,e),sn(t,e)}}function c1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(rn(t,e))return;s.uniform3fv(this.addr,e),sn(t,e)}}function u1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;s.uniform4fv(this.addr,e),sn(t,e)}}function f1(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(rn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,i))return;zg.set(i),s.uniformMatrix2fv(this.addr,!1,zg),sn(t,i)}}function d1(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(rn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,i))return;Og.set(i),s.uniformMatrix3fv(this.addr,!1,Og),sn(t,i)}}function h1(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(rn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,i))return;Fg.set(i),s.uniformMatrix4fv(this.addr,!1,Fg),sn(t,i)}}function p1(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function m1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;s.uniform2iv(this.addr,e),sn(t,e)}}function g1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;s.uniform3iv(this.addr,e),sn(t,e)}}function v1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;s.uniform4iv(this.addr,e),sn(t,e)}}function _1(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function x1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;s.uniform2uiv(this.addr,e),sn(t,e)}}function y1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;s.uniform3uiv(this.addr,e),sn(t,e)}}function S1(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;s.uniform4uiv(this.addr,e),sn(t,e)}}function M1(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o);let a;this.type===s.SAMPLER_2D_SHADOW?(Dg.compareFunction=zv,a=Dg):a=Jv,t.setTexture2D(e||a,o)}function E1(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTexture3D(e||e0,o)}function w1(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTextureCube(e||t0,o)}function T1(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTexture2DArray(e||Qv,o)}function A1(s){switch(s){case 5126:return a1;case 35664:return l1;case 35665:return c1;case 35666:return u1;case 35674:return f1;case 35675:return d1;case 35676:return h1;case 5124:case 35670:return p1;case 35667:case 35671:return m1;case 35668:case 35672:return g1;case 35669:case 35673:return v1;case 5125:return _1;case 36294:return x1;case 36295:return y1;case 36296:return S1;case 35678:case 36198:case 36298:case 36306:case 35682:return M1;case 35679:case 36299:case 36307:return E1;case 35680:case 36300:case 36308:case 36293:return w1;case 36289:case 36303:case 36311:case 36292:return T1}}function C1(s,e){s.uniform1fv(this.addr,e)}function R1(s,e){const t=bo(e,this.size,2);s.uniform2fv(this.addr,t)}function b1(s,e){const t=bo(e,this.size,3);s.uniform3fv(this.addr,t)}function P1(s,e){const t=bo(e,this.size,4);s.uniform4fv(this.addr,t)}function L1(s,e){const t=bo(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function I1(s,e){const t=bo(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function D1(s,e){const t=bo(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function N1(s,e){s.uniform1iv(this.addr,e)}function U1(s,e){s.uniform2iv(this.addr,e)}function F1(s,e){s.uniform3iv(this.addr,e)}function O1(s,e){s.uniform4iv(this.addr,e)}function z1(s,e){s.uniform1uiv(this.addr,e)}function k1(s,e){s.uniform2uiv(this.addr,e)}function B1(s,e){s.uniform3uiv(this.addr,e)}function V1(s,e){s.uniform4uiv(this.addr,e)}function H1(s,e,t){const i=this.cache,o=e.length,a=Fc(t,o);rn(i,a)||(s.uniform1iv(this.addr,a),sn(i,a));for(let c=0;c!==o;++c)t.setTexture2D(e[c]||Jv,a[c])}function G1(s,e,t){const i=this.cache,o=e.length,a=Fc(t,o);rn(i,a)||(s.uniform1iv(this.addr,a),sn(i,a));for(let c=0;c!==o;++c)t.setTexture3D(e[c]||e0,a[c])}function W1(s,e,t){const i=this.cache,o=e.length,a=Fc(t,o);rn(i,a)||(s.uniform1iv(this.addr,a),sn(i,a));for(let c=0;c!==o;++c)t.setTextureCube(e[c]||t0,a[c])}function X1(s,e,t){const i=this.cache,o=e.length,a=Fc(t,o);rn(i,a)||(s.uniform1iv(this.addr,a),sn(i,a));for(let c=0;c!==o;++c)t.setTexture2DArray(e[c]||Qv,a[c])}function j1(s){switch(s){case 5126:return C1;case 35664:return R1;case 35665:return b1;case 35666:return P1;case 35674:return L1;case 35675:return I1;case 35676:return D1;case 5124:case 35670:return N1;case 35667:case 35671:return U1;case 35668:case 35672:return F1;case 35669:case 35673:return O1;case 5125:return z1;case 36294:return k1;case 36295:return B1;case 36296:return V1;case 35678:case 36198:case 36298:case 36306:case 35682:return H1;case 35679:case 36299:case 36307:return G1;case 35680:case 36300:case 36308:case 36293:return W1;case 36289:case 36303:case 36311:case 36292:return X1}}class Y1{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=A1(t.type)}}class q1{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=j1(t.type)}}class Z1{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const o=this.seq;for(let a=0,c=o.length;a!==c;++a){const u=o[a];u.setValue(e,t[u.id],i)}}}const Jf=/(\w+)(\])?(\[|\.)?/g;function kg(s,e){s.seq.push(e),s.map[e.id]=e}function $1(s,e,t){const i=s.name,o=i.length;for(Jf.lastIndex=0;;){const a=Jf.exec(i),c=Jf.lastIndex;let u=a[1];const d=a[2]==="]",h=a[3];if(d&&(u=u|0),h===void 0||h==="["&&c+2===o){kg(t,h===void 0?new Y1(u,s,e):new q1(u,s,e));break}else{let g=t.map[u];g===void 0&&(g=new Z1(u),kg(t,g)),t=g}}}class Ac{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);$1(a,c,this)}}setValue(e,t,i,o){const a=this.map[t];a!==void 0&&a.setValue(e,i,o)}setOptional(e,t,i){const o=t[i];o!==void 0&&this.setValue(e,i,o)}static upload(e,t,i,o){for(let a=0,c=t.length;a!==c;++a){const u=t[a],d=i[u.id];d.needsUpdate!==!1&&u.setValue(e,d.value,o)}}static seqWithValue(e,t){const i=[];for(let o=0,a=e.length;o!==a;++o){const c=e[o];c.id in t&&i.push(c)}return i}}function Bg(s,e,t){const i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),i}const K1=37297;let J1=0;function Q1(s,e){const t=s.split(`
`),i=[],o=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let c=o;c<a;c++){const u=c+1;i.push(`${u===e?">":" "} ${u}: ${t[c]}`)}return i.join(`
`)}const Vg=new ct;function ew(s){St._getMatrix(Vg,St.workingColorSpace,s);const e=`mat3( ${Vg.elements.map(t=>t.toFixed(4))} )`;switch(St.getTransfer(s)){case Nc:return[e,"LinearTransferOETF"];case Nt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Hg(s,e,t){const i=s.getShaderParameter(e,s.COMPILE_STATUS),o=s.getShaderInfoLog(e).trim();if(i&&o==="")return"";const a=/ERROR: 0:(\d+)/.exec(o);if(a){const c=parseInt(a[1]);return t.toUpperCase()+`

`+o+`

`+Q1(s.getShaderSource(e),c)}else return o}function tw(s,e){const t=ew(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function nw(s,e){let t;switch(e){case ny:t="Linear";break;case iy:t="Reinhard";break;case ry:t="Cineon";break;case sy:t="ACESFilmic";break;case ay:t="AgX";break;case ly:t="Neutral";break;case oy:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const cc=new k;function iw(){St.getLuminanceCoefficients(cc);const s=cc.x.toFixed(4),e=cc.y.toFixed(4),t=cc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function rw(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ma).join(`
`)}function sw(s){const e=[];for(const t in s){const i=s[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function ow(s,e){const t={},i=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let o=0;o<i;o++){const a=s.getActiveAttrib(e,o),c=a.name;let u=1;a.type===s.FLOAT_MAT2&&(u=2),a.type===s.FLOAT_MAT3&&(u=3),a.type===s.FLOAT_MAT4&&(u=4),t[c]={type:a.type,location:s.getAttribLocation(e,c),locationSize:u}}return t}function Ma(s){return s!==""}function Gg(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Wg(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const aw=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yd(s){return s.replace(aw,cw)}const lw=new Map;function cw(s,e){let t=ut[e];if(t===void 0){const i=lw.get(e);if(i!==void 0)t=ut[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Yd(t)}const uw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xg(s){return s.replace(uw,fw)}function fw(s,e,t,i){let o="";for(let a=parseInt(e);a<parseInt(t);a++)o+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return o}function jg(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function dw(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Av?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Ux?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===tr&&(e="SHADOWMAP_TYPE_VSM"),e}function hw(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case _o:case xo:e="ENVMAP_TYPE_CUBE";break;case Dc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function pw(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case xo:e="ENVMAP_MODE_REFRACTION";break}return e}function mw(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Cv:e="ENVMAP_BLENDING_MULTIPLY";break;case ey:e="ENVMAP_BLENDING_MIX";break;case ty:e="ENVMAP_BLENDING_ADD";break}return e}function gw(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function vw(s,e,t,i){const o=s.getContext(),a=t.defines;let c=t.vertexShader,u=t.fragmentShader;const d=dw(t),h=hw(t),m=pw(t),g=mw(t),v=gw(t),y=rw(t),M=sw(a),w=o.createProgram();let S,x,I=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(S=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Ma).join(`
`),S.length>0&&(S+=`
`),x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Ma).join(`
`),x.length>0&&(x+=`
`)):(S=[jg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ma).join(`
`),x=[jg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+m:"",t.envMap?"#define "+g:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kr?"#define TONE_MAPPING":"",t.toneMapping!==kr?ut.tonemapping_pars_fragment:"",t.toneMapping!==kr?nw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ut.colorspace_pars_fragment,tw("linearToOutputTexel",t.outputColorSpace),iw(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ma).join(`
`)),c=Yd(c),c=Gg(c,t),c=Wg(c,t),u=Yd(u),u=Gg(u,t),u=Wg(u,t),c=Xg(c),u=Xg(u),t.isRawShaderMaterial!==!0&&(I=`#version 300 es
`,S=[y,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,x=["#define varying in",t.glslVersion===rg?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===rg?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+x);const C=I+S+c,E=I+x+u,Z=Bg(o,o.VERTEX_SHADER,C),D=Bg(o,o.FRAGMENT_SHADER,E);o.attachShader(w,Z),o.attachShader(w,D),t.index0AttributeName!==void 0?o.bindAttribLocation(w,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(w,0,"position"),o.linkProgram(w);function O(V){if(s.debug.checkShaderErrors){const ae=o.getProgramInfoLog(w).trim(),ne=o.getShaderInfoLog(Z).trim(),de=o.getShaderInfoLog(D).trim();let pe=!0,oe=!0;if(o.getProgramParameter(w,o.LINK_STATUS)===!1)if(pe=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(o,w,Z,D);else{const ce=Hg(o,Z,"vertex"),B=Hg(o,D,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(w,o.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+ae+`
`+ce+`
`+B)}else ae!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ae):(ne===""||de==="")&&(oe=!1);oe&&(V.diagnostics={runnable:pe,programLog:ae,vertexShader:{log:ne,prefix:S},fragmentShader:{log:de,prefix:x}})}o.deleteShader(Z),o.deleteShader(D),Y=new Ac(o,w),L=ow(o,w)}let Y;this.getUniforms=function(){return Y===void 0&&O(this),Y};let L;this.getAttributes=function(){return L===void 0&&O(this),L};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=o.getProgramParameter(w,K1)),b},this.destroy=function(){i.releaseStatesOfProgram(this),o.deleteProgram(w),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=J1++,this.cacheKey=e,this.usedTimes=1,this.program=w,this.vertexShader=Z,this.fragmentShader=D,this}let _w=0;class xw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,o=this._getShaderStage(t),a=this._getShaderStage(i),c=this._getShaderCacheForMaterial(e);return c.has(o)===!1&&(c.add(o),o.usedTimes++),c.has(a)===!1&&(c.add(a),a.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new yw(e),t.set(e,i)),i}}class yw{constructor(e){this.id=_w++,this.code=e,this.usedTimes=0}}function Sw(s,e,t,i,o,a,c){const u=new ch,d=new xw,h=new Set,m=[],g=o.logarithmicDepthBuffer,v=o.vertexTextures;let y=o.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(L){return h.add(L),L===0?"uv":`uv${L}`}function S(L,b,V,ae,ne){const de=ae.fog,pe=ne.geometry,oe=L.isMeshStandardMaterial?ae.environment:null,ce=(L.isMeshStandardMaterial?t:e).get(L.envMap||oe),B=ce&&ce.mapping===Dc?ce.image.height:null,le=M[L.type];L.precision!==null&&(y=o.getMaxPrecision(L.precision),y!==L.precision&&console.warn("THREE.WebGLProgram.getParameters:",L.precision,"not supported, using",y,"instead."));const se=pe.morphAttributes.position||pe.morphAttributes.normal||pe.morphAttributes.color,F=se!==void 0?se.length:0;let ie=0;pe.morphAttributes.position!==void 0&&(ie=1),pe.morphAttributes.normal!==void 0&&(ie=2),pe.morphAttributes.color!==void 0&&(ie=3);let Ne,J,ue,we;if(le){const xt=Di[le];Ne=xt.vertexShader,J=xt.fragmentShader}else Ne=L.vertexShader,J=L.fragmentShader,d.update(L),ue=d.getVertexShaderID(L),we=d.getFragmentShaderID(L);const xe=s.getRenderTarget(),Ce=s.state.buffers.depth.getReversed(),Ue=ne.isInstancedMesh===!0,Qe=ne.isBatchedMesh===!0,Dt=!!L.map,gt=!!L.matcap,Ft=!!ce,j=!!L.aoMap,Rn=!!L.lightMap,mt=!!L.bumpMap,dt=!!L.normalMap,$e=!!L.displacementMap,bt=!!L.emissiveMap,Ze=!!L.metalnessMap,N=!!L.roughnessMap,A=L.anisotropy>0,K=L.clearcoat>0,me=L.dispersion>0,ve=L.iridescence>0,fe=L.sheen>0,We=L.transmission>0,Re=A&&!!L.anisotropyMap,Fe=K&&!!L.clearcoatMap,ft=K&&!!L.clearcoatNormalMap,Me=K&&!!L.clearcoatRoughnessMap,ze=ve&&!!L.iridescenceMap,et=ve&&!!L.iridescenceThicknessMap,tt=fe&&!!L.sheenColorMap,ke=fe&&!!L.sheenRoughnessMap,ht=!!L.specularMap,st=!!L.specularColorMap,Ct=!!L.specularIntensityMap,G=We&&!!L.transmissionMap,be=We&&!!L.thicknessMap,re=!!L.gradientMap,he=!!L.alphaMap,Ie=L.alphaTest>0,Le=!!L.alphaHash,ot=!!L.extensions;let zt=kr;L.toneMapped&&(xe===null||xe.isXRRenderTarget===!0)&&(zt=s.toneMapping);const Qt={shaderID:le,shaderType:L.type,shaderName:L.name,vertexShader:Ne,fragmentShader:J,defines:L.defines,customVertexShaderID:ue,customFragmentShaderID:we,isRawShaderMaterial:L.isRawShaderMaterial===!0,glslVersion:L.glslVersion,precision:y,batching:Qe,batchingColor:Qe&&ne._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&ne.instanceColor!==null,instancingMorph:Ue&&ne.morphTexture!==null,supportsVertexTextures:v,outputColorSpace:xe===null?s.outputColorSpace:xe.isXRRenderTarget===!0?xe.texture.colorSpace:To,alphaToCoverage:!!L.alphaToCoverage,map:Dt,matcap:gt,envMap:Ft,envMapMode:Ft&&ce.mapping,envMapCubeUVHeight:B,aoMap:j,lightMap:Rn,bumpMap:mt,normalMap:dt,displacementMap:v&&$e,emissiveMap:bt,normalMapObjectSpace:dt&&L.normalMapType===hy,normalMapTangentSpace:dt&&L.normalMapType===dy,metalnessMap:Ze,roughnessMap:N,anisotropy:A,anisotropyMap:Re,clearcoat:K,clearcoatMap:Fe,clearcoatNormalMap:ft,clearcoatRoughnessMap:Me,dispersion:me,iridescence:ve,iridescenceMap:ze,iridescenceThicknessMap:et,sheen:fe,sheenColorMap:tt,sheenRoughnessMap:ke,specularMap:ht,specularColorMap:st,specularIntensityMap:Ct,transmission:We,transmissionMap:G,thicknessMap:be,gradientMap:re,opaque:L.transparent===!1&&L.blending===po&&L.alphaToCoverage===!1,alphaMap:he,alphaTest:Ie,alphaHash:Le,combine:L.combine,mapUv:Dt&&w(L.map.channel),aoMapUv:j&&w(L.aoMap.channel),lightMapUv:Rn&&w(L.lightMap.channel),bumpMapUv:mt&&w(L.bumpMap.channel),normalMapUv:dt&&w(L.normalMap.channel),displacementMapUv:$e&&w(L.displacementMap.channel),emissiveMapUv:bt&&w(L.emissiveMap.channel),metalnessMapUv:Ze&&w(L.metalnessMap.channel),roughnessMapUv:N&&w(L.roughnessMap.channel),anisotropyMapUv:Re&&w(L.anisotropyMap.channel),clearcoatMapUv:Fe&&w(L.clearcoatMap.channel),clearcoatNormalMapUv:ft&&w(L.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Me&&w(L.clearcoatRoughnessMap.channel),iridescenceMapUv:ze&&w(L.iridescenceMap.channel),iridescenceThicknessMapUv:et&&w(L.iridescenceThicknessMap.channel),sheenColorMapUv:tt&&w(L.sheenColorMap.channel),sheenRoughnessMapUv:ke&&w(L.sheenRoughnessMap.channel),specularMapUv:ht&&w(L.specularMap.channel),specularColorMapUv:st&&w(L.specularColorMap.channel),specularIntensityMapUv:Ct&&w(L.specularIntensityMap.channel),transmissionMapUv:G&&w(L.transmissionMap.channel),thicknessMapUv:be&&w(L.thicknessMap.channel),alphaMapUv:he&&w(L.alphaMap.channel),vertexTangents:!!pe.attributes.tangent&&(dt||A),vertexColors:L.vertexColors,vertexAlphas:L.vertexColors===!0&&!!pe.attributes.color&&pe.attributes.color.itemSize===4,pointsUvs:ne.isPoints===!0&&!!pe.attributes.uv&&(Dt||he),fog:!!de,useFog:L.fog===!0,fogExp2:!!de&&de.isFogExp2,flatShading:L.flatShading===!0,sizeAttenuation:L.sizeAttenuation===!0,logarithmicDepthBuffer:g,reverseDepthBuffer:Ce,skinning:ne.isSkinnedMesh===!0,morphTargets:pe.morphAttributes.position!==void 0,morphNormals:pe.morphAttributes.normal!==void 0,morphColors:pe.morphAttributes.color!==void 0,morphTargetsCount:F,morphTextureStride:ie,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:L.dithering,shadowMapEnabled:s.shadowMap.enabled&&V.length>0,shadowMapType:s.shadowMap.type,toneMapping:zt,decodeVideoTexture:Dt&&L.map.isVideoTexture===!0&&St.getTransfer(L.map.colorSpace)===Nt,decodeVideoTextureEmissive:bt&&L.emissiveMap.isVideoTexture===!0&&St.getTransfer(L.emissiveMap.colorSpace)===Nt,premultipliedAlpha:L.premultipliedAlpha,doubleSided:L.side===Ei,flipSided:L.side===Xn,useDepthPacking:L.depthPacking>=0,depthPacking:L.depthPacking||0,index0AttributeName:L.index0AttributeName,extensionClipCullDistance:ot&&L.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ot&&L.extensions.multiDraw===!0||Qe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:L.customProgramCacheKey()};return Qt.vertexUv1s=h.has(1),Qt.vertexUv2s=h.has(2),Qt.vertexUv3s=h.has(3),h.clear(),Qt}function x(L){const b=[];if(L.shaderID?b.push(L.shaderID):(b.push(L.customVertexShaderID),b.push(L.customFragmentShaderID)),L.defines!==void 0)for(const V in L.defines)b.push(V),b.push(L.defines[V]);return L.isRawShaderMaterial===!1&&(I(b,L),C(b,L),b.push(s.outputColorSpace)),b.push(L.customProgramCacheKey),b.join()}function I(L,b){L.push(b.precision),L.push(b.outputColorSpace),L.push(b.envMapMode),L.push(b.envMapCubeUVHeight),L.push(b.mapUv),L.push(b.alphaMapUv),L.push(b.lightMapUv),L.push(b.aoMapUv),L.push(b.bumpMapUv),L.push(b.normalMapUv),L.push(b.displacementMapUv),L.push(b.emissiveMapUv),L.push(b.metalnessMapUv),L.push(b.roughnessMapUv),L.push(b.anisotropyMapUv),L.push(b.clearcoatMapUv),L.push(b.clearcoatNormalMapUv),L.push(b.clearcoatRoughnessMapUv),L.push(b.iridescenceMapUv),L.push(b.iridescenceThicknessMapUv),L.push(b.sheenColorMapUv),L.push(b.sheenRoughnessMapUv),L.push(b.specularMapUv),L.push(b.specularColorMapUv),L.push(b.specularIntensityMapUv),L.push(b.transmissionMapUv),L.push(b.thicknessMapUv),L.push(b.combine),L.push(b.fogExp2),L.push(b.sizeAttenuation),L.push(b.morphTargetsCount),L.push(b.morphAttributeCount),L.push(b.numDirLights),L.push(b.numPointLights),L.push(b.numSpotLights),L.push(b.numSpotLightMaps),L.push(b.numHemiLights),L.push(b.numRectAreaLights),L.push(b.numDirLightShadows),L.push(b.numPointLightShadows),L.push(b.numSpotLightShadows),L.push(b.numSpotLightShadowsWithMaps),L.push(b.numLightProbes),L.push(b.shadowMapType),L.push(b.toneMapping),L.push(b.numClippingPlanes),L.push(b.numClipIntersection),L.push(b.depthPacking)}function C(L,b){u.disableAll(),b.supportsVertexTextures&&u.enable(0),b.instancing&&u.enable(1),b.instancingColor&&u.enable(2),b.instancingMorph&&u.enable(3),b.matcap&&u.enable(4),b.envMap&&u.enable(5),b.normalMapObjectSpace&&u.enable(6),b.normalMapTangentSpace&&u.enable(7),b.clearcoat&&u.enable(8),b.iridescence&&u.enable(9),b.alphaTest&&u.enable(10),b.vertexColors&&u.enable(11),b.vertexAlphas&&u.enable(12),b.vertexUv1s&&u.enable(13),b.vertexUv2s&&u.enable(14),b.vertexUv3s&&u.enable(15),b.vertexTangents&&u.enable(16),b.anisotropy&&u.enable(17),b.alphaHash&&u.enable(18),b.batching&&u.enable(19),b.dispersion&&u.enable(20),b.batchingColor&&u.enable(21),L.push(u.mask),u.disableAll(),b.fog&&u.enable(0),b.useFog&&u.enable(1),b.flatShading&&u.enable(2),b.logarithmicDepthBuffer&&u.enable(3),b.reverseDepthBuffer&&u.enable(4),b.skinning&&u.enable(5),b.morphTargets&&u.enable(6),b.morphNormals&&u.enable(7),b.morphColors&&u.enable(8),b.premultipliedAlpha&&u.enable(9),b.shadowMapEnabled&&u.enable(10),b.doubleSided&&u.enable(11),b.flipSided&&u.enable(12),b.useDepthPacking&&u.enable(13),b.dithering&&u.enable(14),b.transmission&&u.enable(15),b.sheen&&u.enable(16),b.opaque&&u.enable(17),b.pointsUvs&&u.enable(18),b.decodeVideoTexture&&u.enable(19),b.decodeVideoTextureEmissive&&u.enable(20),b.alphaToCoverage&&u.enable(21),L.push(u.mask)}function E(L){const b=M[L.type];let V;if(b){const ae=Di[b];V=rS.clone(ae.uniforms)}else V=L.uniforms;return V}function Z(L,b){let V;for(let ae=0,ne=m.length;ae<ne;ae++){const de=m[ae];if(de.cacheKey===b){V=de,++V.usedTimes;break}}return V===void 0&&(V=new vw(s,b,L,a),m.push(V)),V}function D(L){if(--L.usedTimes===0){const b=m.indexOf(L);m[b]=m[m.length-1],m.pop(),L.destroy()}}function O(L){d.remove(L)}function Y(){d.dispose()}return{getParameters:S,getProgramCacheKey:x,getUniforms:E,acquireProgram:Z,releaseProgram:D,releaseShaderCache:O,programs:m,dispose:Y}}function Mw(){let s=new WeakMap;function e(c){return s.has(c)}function t(c){let u=s.get(c);return u===void 0&&(u={},s.set(c,u)),u}function i(c){s.delete(c)}function o(c,u,d){s.get(c)[u]=d}function a(){s=new WeakMap}return{has:e,get:t,remove:i,update:o,dispose:a}}function Ew(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Yg(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function qg(){const s=[];let e=0;const t=[],i=[],o=[];function a(){e=0,t.length=0,i.length=0,o.length=0}function c(g,v,y,M,w,S){let x=s[e];return x===void 0?(x={id:g.id,object:g,geometry:v,material:y,groupOrder:M,renderOrder:g.renderOrder,z:w,group:S},s[e]=x):(x.id=g.id,x.object=g,x.geometry=v,x.material=y,x.groupOrder=M,x.renderOrder=g.renderOrder,x.z=w,x.group=S),e++,x}function u(g,v,y,M,w,S){const x=c(g,v,y,M,w,S);y.transmission>0?i.push(x):y.transparent===!0?o.push(x):t.push(x)}function d(g,v,y,M,w,S){const x=c(g,v,y,M,w,S);y.transmission>0?i.unshift(x):y.transparent===!0?o.unshift(x):t.unshift(x)}function h(g,v){t.length>1&&t.sort(g||Ew),i.length>1&&i.sort(v||Yg),o.length>1&&o.sort(v||Yg)}function m(){for(let g=e,v=s.length;g<v;g++){const y=s[g];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:t,transmissive:i,transparent:o,init:a,push:u,unshift:d,finish:m,sort:h}}function ww(){let s=new WeakMap;function e(i,o){const a=s.get(i);let c;return a===void 0?(c=new qg,s.set(i,[c])):o>=a.length?(c=new qg,a.push(c)):c=a[o],c}function t(){s=new WeakMap}return{get:e,dispose:t}}function Tw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new k,color:new At};break;case"SpotLight":t={position:new k,direction:new k,color:new At,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new At,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new At,groundColor:new At};break;case"RectAreaLight":t={color:new At,position:new k,halfWidth:new k,halfHeight:new k};break}return s[e.id]=t,t}}}function Aw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let Cw=0;function Rw(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function bw(s){const e=new Tw,t=Aw(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)i.probe.push(new k);const o=new k,a=new It,c=new It;function u(h){let m=0,g=0,v=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let y=0,M=0,w=0,S=0,x=0,I=0,C=0,E=0,Z=0,D=0,O=0;h.sort(Rw);for(let L=0,b=h.length;L<b;L++){const V=h[L],ae=V.color,ne=V.intensity,de=V.distance,pe=V.shadow&&V.shadow.map?V.shadow.map.texture:null;if(V.isAmbientLight)m+=ae.r*ne,g+=ae.g*ne,v+=ae.b*ne;else if(V.isLightProbe){for(let oe=0;oe<9;oe++)i.probe[oe].addScaledVector(V.sh.coefficients[oe],ne);O++}else if(V.isDirectionalLight){const oe=e.get(V);if(oe.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){const ce=V.shadow,B=t.get(V);B.shadowIntensity=ce.intensity,B.shadowBias=ce.bias,B.shadowNormalBias=ce.normalBias,B.shadowRadius=ce.radius,B.shadowMapSize=ce.mapSize,i.directionalShadow[y]=B,i.directionalShadowMap[y]=pe,i.directionalShadowMatrix[y]=V.shadow.matrix,I++}i.directional[y]=oe,y++}else if(V.isSpotLight){const oe=e.get(V);oe.position.setFromMatrixPosition(V.matrixWorld),oe.color.copy(ae).multiplyScalar(ne),oe.distance=de,oe.coneCos=Math.cos(V.angle),oe.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),oe.decay=V.decay,i.spot[w]=oe;const ce=V.shadow;if(V.map&&(i.spotLightMap[Z]=V.map,Z++,ce.updateMatrices(V),V.castShadow&&D++),i.spotLightMatrix[w]=ce.matrix,V.castShadow){const B=t.get(V);B.shadowIntensity=ce.intensity,B.shadowBias=ce.bias,B.shadowNormalBias=ce.normalBias,B.shadowRadius=ce.radius,B.shadowMapSize=ce.mapSize,i.spotShadow[w]=B,i.spotShadowMap[w]=pe,E++}w++}else if(V.isRectAreaLight){const oe=e.get(V);oe.color.copy(ae).multiplyScalar(ne),oe.halfWidth.set(V.width*.5,0,0),oe.halfHeight.set(0,V.height*.5,0),i.rectArea[S]=oe,S++}else if(V.isPointLight){const oe=e.get(V);if(oe.color.copy(V.color).multiplyScalar(V.intensity),oe.distance=V.distance,oe.decay=V.decay,V.castShadow){const ce=V.shadow,B=t.get(V);B.shadowIntensity=ce.intensity,B.shadowBias=ce.bias,B.shadowNormalBias=ce.normalBias,B.shadowRadius=ce.radius,B.shadowMapSize=ce.mapSize,B.shadowCameraNear=ce.camera.near,B.shadowCameraFar=ce.camera.far,i.pointShadow[M]=B,i.pointShadowMap[M]=pe,i.pointShadowMatrix[M]=V.shadow.matrix,C++}i.point[M]=oe,M++}else if(V.isHemisphereLight){const oe=e.get(V);oe.skyColor.copy(V.color).multiplyScalar(ne),oe.groundColor.copy(V.groundColor).multiplyScalar(ne),i.hemi[x]=oe,x++}}S>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Pe.LTC_FLOAT_1,i.rectAreaLTC2=Pe.LTC_FLOAT_2):(i.rectAreaLTC1=Pe.LTC_HALF_1,i.rectAreaLTC2=Pe.LTC_HALF_2)),i.ambient[0]=m,i.ambient[1]=g,i.ambient[2]=v;const Y=i.hash;(Y.directionalLength!==y||Y.pointLength!==M||Y.spotLength!==w||Y.rectAreaLength!==S||Y.hemiLength!==x||Y.numDirectionalShadows!==I||Y.numPointShadows!==C||Y.numSpotShadows!==E||Y.numSpotMaps!==Z||Y.numLightProbes!==O)&&(i.directional.length=y,i.spot.length=w,i.rectArea.length=S,i.point.length=M,i.hemi.length=x,i.directionalShadow.length=I,i.directionalShadowMap.length=I,i.pointShadow.length=C,i.pointShadowMap.length=C,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=I,i.pointShadowMatrix.length=C,i.spotLightMatrix.length=E+Z-D,i.spotLightMap.length=Z,i.numSpotLightShadowsWithMaps=D,i.numLightProbes=O,Y.directionalLength=y,Y.pointLength=M,Y.spotLength=w,Y.rectAreaLength=S,Y.hemiLength=x,Y.numDirectionalShadows=I,Y.numPointShadows=C,Y.numSpotShadows=E,Y.numSpotMaps=Z,Y.numLightProbes=O,i.version=Cw++)}function d(h,m){let g=0,v=0,y=0,M=0,w=0;const S=m.matrixWorldInverse;for(let x=0,I=h.length;x<I;x++){const C=h[x];if(C.isDirectionalLight){const E=i.directional[g];E.direction.setFromMatrixPosition(C.matrixWorld),o.setFromMatrixPosition(C.target.matrixWorld),E.direction.sub(o),E.direction.transformDirection(S),g++}else if(C.isSpotLight){const E=i.spot[y];E.position.setFromMatrixPosition(C.matrixWorld),E.position.applyMatrix4(S),E.direction.setFromMatrixPosition(C.matrixWorld),o.setFromMatrixPosition(C.target.matrixWorld),E.direction.sub(o),E.direction.transformDirection(S),y++}else if(C.isRectAreaLight){const E=i.rectArea[M];E.position.setFromMatrixPosition(C.matrixWorld),E.position.applyMatrix4(S),c.identity(),a.copy(C.matrixWorld),a.premultiply(S),c.extractRotation(a),E.halfWidth.set(C.width*.5,0,0),E.halfHeight.set(0,C.height*.5,0),E.halfWidth.applyMatrix4(c),E.halfHeight.applyMatrix4(c),M++}else if(C.isPointLight){const E=i.point[v];E.position.setFromMatrixPosition(C.matrixWorld),E.position.applyMatrix4(S),v++}else if(C.isHemisphereLight){const E=i.hemi[w];E.direction.setFromMatrixPosition(C.matrixWorld),E.direction.transformDirection(S),w++}}}return{setup:u,setupView:d,state:i}}function Zg(s){const e=new bw(s),t=[],i=[];function o(m){h.camera=m,t.length=0,i.length=0}function a(m){t.push(m)}function c(m){i.push(m)}function u(){e.setup(t)}function d(m){e.setupView(t,m)}const h={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:o,state:h,setupLights:u,setupLightsView:d,pushLight:a,pushShadow:c}}function Pw(s){let e=new WeakMap;function t(o,a=0){const c=e.get(o);let u;return c===void 0?(u=new Zg(s),e.set(o,[u])):a>=c.length?(u=new Zg(s),c.push(u)):u=c[a],u}function i(){e=new WeakMap}return{get:t,dispose:i}}class Lw extends Ro{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=uy,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Iw extends Ro{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Dw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Nw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Uw(s,e,t){let i=new qv;const o=new Be,a=new Be,c=new $t,u=new Lw({depthPacking:fy}),d=new Iw,h={},m=t.maxTextureSize,g={[Br]:Xn,[Xn]:Br,[Ei]:Ei},v=new Vr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Be},radius:{value:4}},vertexShader:Dw,fragmentShader:Nw}),y=v.clone();y.defines.HORIZONTAL_PASS=1;const M=new Wt;M.setAttribute("position",new Cn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const w=new gn(M,v),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Av;let x=this.type;this.render=function(D,O,Y){if(S.enabled===!1||S.autoUpdate===!1&&S.needsUpdate===!1||D.length===0)return;const L=s.getRenderTarget(),b=s.getActiveCubeFace(),V=s.getActiveMipmapLevel(),ae=s.state;ae.setBlending(zr),ae.buffers.color.setClear(1,1,1,1),ae.buffers.depth.setTest(!0),ae.setScissorTest(!1);const ne=x!==tr&&this.type===tr,de=x===tr&&this.type!==tr;for(let pe=0,oe=D.length;pe<oe;pe++){const ce=D[pe],B=ce.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",ce,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;o.copy(B.mapSize);const le=B.getFrameExtents();if(o.multiply(le),a.copy(B.mapSize),(o.x>m||o.y>m)&&(o.x>m&&(a.x=Math.floor(m/le.x),o.x=a.x*le.x,B.mapSize.x=a.x),o.y>m&&(a.y=Math.floor(m/le.y),o.y=a.y*le.y,B.mapSize.y=a.y)),B.map===null||ne===!0||de===!0){const F=this.type!==tr?{minFilter:Jn,magFilter:Jn}:{};B.map!==null&&B.map.dispose(),B.map=new _s(o.x,o.y,F),B.map.texture.name=ce.name+".shadowMap",B.camera.updateProjectionMatrix()}s.setRenderTarget(B.map),s.clear();const se=B.getViewportCount();for(let F=0;F<se;F++){const ie=B.getViewport(F);c.set(a.x*ie.x,a.y*ie.y,a.x*ie.z,a.y*ie.w),ae.viewport(c),B.updateMatrices(ce,F),i=B.getFrustum(),E(O,Y,B.camera,ce,this.type)}B.isPointLightShadow!==!0&&this.type===tr&&I(B,Y),B.needsUpdate=!1}x=this.type,S.needsUpdate=!1,s.setRenderTarget(L,b,V)};function I(D,O){const Y=e.update(w);v.defines.VSM_SAMPLES!==D.blurSamples&&(v.defines.VSM_SAMPLES=D.blurSamples,y.defines.VSM_SAMPLES=D.blurSamples,v.needsUpdate=!0,y.needsUpdate=!0),D.mapPass===null&&(D.mapPass=new _s(o.x,o.y)),v.uniforms.shadow_pass.value=D.map.texture,v.uniforms.resolution.value=D.mapSize,v.uniforms.radius.value=D.radius,s.setRenderTarget(D.mapPass),s.clear(),s.renderBufferDirect(O,null,Y,v,w,null),y.uniforms.shadow_pass.value=D.mapPass.texture,y.uniforms.resolution.value=D.mapSize,y.uniforms.radius.value=D.radius,s.setRenderTarget(D.map),s.clear(),s.renderBufferDirect(O,null,Y,y,w,null)}function C(D,O,Y,L){let b=null;const V=Y.isPointLight===!0?D.customDistanceMaterial:D.customDepthMaterial;if(V!==void 0)b=V;else if(b=Y.isPointLight===!0?d:u,s.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0){const ae=b.uuid,ne=O.uuid;let de=h[ae];de===void 0&&(de={},h[ae]=de);let pe=de[ne];pe===void 0&&(pe=b.clone(),de[ne]=pe,O.addEventListener("dispose",Z)),b=pe}if(b.visible=O.visible,b.wireframe=O.wireframe,L===tr?b.side=O.shadowSide!==null?O.shadowSide:O.side:b.side=O.shadowSide!==null?O.shadowSide:g[O.side],b.alphaMap=O.alphaMap,b.alphaTest=O.alphaTest,b.map=O.map,b.clipShadows=O.clipShadows,b.clippingPlanes=O.clippingPlanes,b.clipIntersection=O.clipIntersection,b.displacementMap=O.displacementMap,b.displacementScale=O.displacementScale,b.displacementBias=O.displacementBias,b.wireframeLinewidth=O.wireframeLinewidth,b.linewidth=O.linewidth,Y.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const ae=s.properties.get(b);ae.light=Y}return b}function E(D,O,Y,L,b){if(D.visible===!1)return;if(D.layers.test(O.layers)&&(D.isMesh||D.isLine||D.isPoints)&&(D.castShadow||D.receiveShadow&&b===tr)&&(!D.frustumCulled||i.intersectsObject(D))){D.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,D.matrixWorld);const ne=e.update(D),de=D.material;if(Array.isArray(de)){const pe=ne.groups;for(let oe=0,ce=pe.length;oe<ce;oe++){const B=pe[oe],le=de[B.materialIndex];if(le&&le.visible){const se=C(D,le,L,b);D.onBeforeShadow(s,D,O,Y,ne,se,B),s.renderBufferDirect(Y,null,ne,se,D,B),D.onAfterShadow(s,D,O,Y,ne,se,B)}}}else if(de.visible){const pe=C(D,de,L,b);D.onBeforeShadow(s,D,O,Y,ne,pe,null),s.renderBufferDirect(Y,null,ne,pe,D,null),D.onAfterShadow(s,D,O,Y,ne,pe,null)}}const ae=D.children;for(let ne=0,de=ae.length;ne<de;ne++)E(ae[ne],O,Y,L,b)}function Z(D){D.target.removeEventListener("dispose",Z);for(const Y in h){const L=h[Y],b=D.target.uuid;b in L&&(L[b].dispose(),delete L[b])}}}const Fw={[cd]:ud,[fd]:pd,[dd]:md,[vo]:hd,[ud]:cd,[pd]:fd,[md]:dd,[hd]:vo};function Ow(s,e){function t(){let G=!1;const be=new $t;let re=null;const he=new $t(0,0,0,0);return{setMask:function(Ie){re!==Ie&&!G&&(s.colorMask(Ie,Ie,Ie,Ie),re=Ie)},setLocked:function(Ie){G=Ie},setClear:function(Ie,Le,ot,zt,Qt){Qt===!0&&(Ie*=zt,Le*=zt,ot*=zt),be.set(Ie,Le,ot,zt),he.equals(be)===!1&&(s.clearColor(Ie,Le,ot,zt),he.copy(be))},reset:function(){G=!1,re=null,he.set(-1,0,0,0)}}}function i(){let G=!1,be=!1,re=null,he=null,Ie=null;return{setReversed:function(Le){if(be!==Le){const ot=e.get("EXT_clip_control");be?ot.clipControlEXT(ot.LOWER_LEFT_EXT,ot.ZERO_TO_ONE_EXT):ot.clipControlEXT(ot.LOWER_LEFT_EXT,ot.NEGATIVE_ONE_TO_ONE_EXT);const zt=Ie;Ie=null,this.setClear(zt)}be=Le},getReversed:function(){return be},setTest:function(Le){Le?xe(s.DEPTH_TEST):Ce(s.DEPTH_TEST)},setMask:function(Le){re!==Le&&!G&&(s.depthMask(Le),re=Le)},setFunc:function(Le){if(be&&(Le=Fw[Le]),he!==Le){switch(Le){case cd:s.depthFunc(s.NEVER);break;case ud:s.depthFunc(s.ALWAYS);break;case fd:s.depthFunc(s.LESS);break;case vo:s.depthFunc(s.LEQUAL);break;case dd:s.depthFunc(s.EQUAL);break;case hd:s.depthFunc(s.GEQUAL);break;case pd:s.depthFunc(s.GREATER);break;case md:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}he=Le}},setLocked:function(Le){G=Le},setClear:function(Le){Ie!==Le&&(be&&(Le=1-Le),s.clearDepth(Le),Ie=Le)},reset:function(){G=!1,re=null,he=null,Ie=null,be=!1}}}function o(){let G=!1,be=null,re=null,he=null,Ie=null,Le=null,ot=null,zt=null,Qt=null;return{setTest:function(xt){G||(xt?xe(s.STENCIL_TEST):Ce(s.STENCIL_TEST))},setMask:function(xt){be!==xt&&!G&&(s.stencilMask(xt),be=xt)},setFunc:function(xt,Fn,bn){(re!==xt||he!==Fn||Ie!==bn)&&(s.stencilFunc(xt,Fn,bn),re=xt,he=Fn,Ie=bn)},setOp:function(xt,Fn,bn){(Le!==xt||ot!==Fn||zt!==bn)&&(s.stencilOp(xt,Fn,bn),Le=xt,ot=Fn,zt=bn)},setLocked:function(xt){G=xt},setClear:function(xt){Qt!==xt&&(s.clearStencil(xt),Qt=xt)},reset:function(){G=!1,be=null,re=null,he=null,Ie=null,Le=null,ot=null,zt=null,Qt=null}}}const a=new t,c=new i,u=new o,d=new WeakMap,h=new WeakMap;let m={},g={},v=new WeakMap,y=[],M=null,w=!1,S=null,x=null,I=null,C=null,E=null,Z=null,D=null,O=new At(0,0,0),Y=0,L=!1,b=null,V=null,ae=null,ne=null,de=null;const pe=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let oe=!1,ce=0;const B=s.getParameter(s.VERSION);B.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(B)[1]),oe=ce>=1):B.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),oe=ce>=2);let le=null,se={};const F=s.getParameter(s.SCISSOR_BOX),ie=s.getParameter(s.VIEWPORT),Ne=new $t().fromArray(F),J=new $t().fromArray(ie);function ue(G,be,re,he){const Ie=new Uint8Array(4),Le=s.createTexture();s.bindTexture(G,Le),s.texParameteri(G,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(G,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ot=0;ot<re;ot++)G===s.TEXTURE_3D||G===s.TEXTURE_2D_ARRAY?s.texImage3D(be,0,s.RGBA,1,1,he,0,s.RGBA,s.UNSIGNED_BYTE,Ie):s.texImage2D(be+ot,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Ie);return Le}const we={};we[s.TEXTURE_2D]=ue(s.TEXTURE_2D,s.TEXTURE_2D,1),we[s.TEXTURE_CUBE_MAP]=ue(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),we[s.TEXTURE_2D_ARRAY]=ue(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),we[s.TEXTURE_3D]=ue(s.TEXTURE_3D,s.TEXTURE_3D,1,1),a.setClear(0,0,0,1),c.setClear(1),u.setClear(0),xe(s.DEPTH_TEST),c.setFunc(vo),mt(!1),dt(Qm),xe(s.CULL_FACE),j(zr);function xe(G){m[G]!==!0&&(s.enable(G),m[G]=!0)}function Ce(G){m[G]!==!1&&(s.disable(G),m[G]=!1)}function Ue(G,be){return g[G]!==be?(s.bindFramebuffer(G,be),g[G]=be,G===s.DRAW_FRAMEBUFFER&&(g[s.FRAMEBUFFER]=be),G===s.FRAMEBUFFER&&(g[s.DRAW_FRAMEBUFFER]=be),!0):!1}function Qe(G,be){let re=y,he=!1;if(G){re=v.get(be),re===void 0&&(re=[],v.set(be,re));const Ie=G.textures;if(re.length!==Ie.length||re[0]!==s.COLOR_ATTACHMENT0){for(let Le=0,ot=Ie.length;Le<ot;Le++)re[Le]=s.COLOR_ATTACHMENT0+Le;re.length=Ie.length,he=!0}}else re[0]!==s.BACK&&(re[0]=s.BACK,he=!0);he&&s.drawBuffers(re)}function Dt(G){return M!==G?(s.useProgram(G),M=G,!0):!1}const gt={[hs]:s.FUNC_ADD,[Ox]:s.FUNC_SUBTRACT,[zx]:s.FUNC_REVERSE_SUBTRACT};gt[kx]=s.MIN,gt[Bx]=s.MAX;const Ft={[Vx]:s.ZERO,[Hx]:s.ONE,[Gx]:s.SRC_COLOR,[ad]:s.SRC_ALPHA,[Zx]:s.SRC_ALPHA_SATURATE,[Yx]:s.DST_COLOR,[Xx]:s.DST_ALPHA,[Wx]:s.ONE_MINUS_SRC_COLOR,[ld]:s.ONE_MINUS_SRC_ALPHA,[qx]:s.ONE_MINUS_DST_COLOR,[jx]:s.ONE_MINUS_DST_ALPHA,[$x]:s.CONSTANT_COLOR,[Kx]:s.ONE_MINUS_CONSTANT_COLOR,[Jx]:s.CONSTANT_ALPHA,[Qx]:s.ONE_MINUS_CONSTANT_ALPHA};function j(G,be,re,he,Ie,Le,ot,zt,Qt,xt){if(G===zr){w===!0&&(Ce(s.BLEND),w=!1);return}if(w===!1&&(xe(s.BLEND),w=!0),G!==Fx){if(G!==S||xt!==L){if((x!==hs||E!==hs)&&(s.blendEquation(s.FUNC_ADD),x=hs,E=hs),xt)switch(G){case po:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case eg:s.blendFunc(s.ONE,s.ONE);break;case tg:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case ng:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}else switch(G){case po:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case eg:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case tg:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case ng:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}I=null,C=null,Z=null,D=null,O.set(0,0,0),Y=0,S=G,L=xt}return}Ie=Ie||be,Le=Le||re,ot=ot||he,(be!==x||Ie!==E)&&(s.blendEquationSeparate(gt[be],gt[Ie]),x=be,E=Ie),(re!==I||he!==C||Le!==Z||ot!==D)&&(s.blendFuncSeparate(Ft[re],Ft[he],Ft[Le],Ft[ot]),I=re,C=he,Z=Le,D=ot),(zt.equals(O)===!1||Qt!==Y)&&(s.blendColor(zt.r,zt.g,zt.b,Qt),O.copy(zt),Y=Qt),S=G,L=!1}function Rn(G,be){G.side===Ei?Ce(s.CULL_FACE):xe(s.CULL_FACE);let re=G.side===Xn;be&&(re=!re),mt(re),G.blending===po&&G.transparent===!1?j(zr):j(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),c.setFunc(G.depthFunc),c.setTest(G.depthTest),c.setMask(G.depthWrite),a.setMask(G.colorWrite);const he=G.stencilWrite;u.setTest(he),he&&(u.setMask(G.stencilWriteMask),u.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),u.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),bt(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?xe(s.SAMPLE_ALPHA_TO_COVERAGE):Ce(s.SAMPLE_ALPHA_TO_COVERAGE)}function mt(G){b!==G&&(G?s.frontFace(s.CW):s.frontFace(s.CCW),b=G)}function dt(G){G!==Dx?(xe(s.CULL_FACE),G!==V&&(G===Qm?s.cullFace(s.BACK):G===Nx?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Ce(s.CULL_FACE),V=G}function $e(G){G!==ae&&(oe&&s.lineWidth(G),ae=G)}function bt(G,be,re){G?(xe(s.POLYGON_OFFSET_FILL),(ne!==be||de!==re)&&(s.polygonOffset(be,re),ne=be,de=re)):Ce(s.POLYGON_OFFSET_FILL)}function Ze(G){G?xe(s.SCISSOR_TEST):Ce(s.SCISSOR_TEST)}function N(G){G===void 0&&(G=s.TEXTURE0+pe-1),le!==G&&(s.activeTexture(G),le=G)}function A(G,be,re){re===void 0&&(le===null?re=s.TEXTURE0+pe-1:re=le);let he=se[re];he===void 0&&(he={type:void 0,texture:void 0},se[re]=he),(he.type!==G||he.texture!==be)&&(le!==re&&(s.activeTexture(re),le=re),s.bindTexture(G,be||we[G]),he.type=G,he.texture=be)}function K(){const G=se[le];G!==void 0&&G.type!==void 0&&(s.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function me(){try{s.compressedTexImage2D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function ve(){try{s.compressedTexImage3D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function fe(){try{s.texSubImage2D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function We(){try{s.texSubImage3D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Re(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Fe(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function ft(){try{s.texStorage2D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Me(){try{s.texStorage3D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function ze(){try{s.texImage2D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function et(){try{s.texImage3D.apply(s,arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function tt(G){Ne.equals(G)===!1&&(s.scissor(G.x,G.y,G.z,G.w),Ne.copy(G))}function ke(G){J.equals(G)===!1&&(s.viewport(G.x,G.y,G.z,G.w),J.copy(G))}function ht(G,be){let re=h.get(be);re===void 0&&(re=new WeakMap,h.set(be,re));let he=re.get(G);he===void 0&&(he=s.getUniformBlockIndex(be,G.name),re.set(G,he))}function st(G,be){const he=h.get(be).get(G);d.get(be)!==he&&(s.uniformBlockBinding(be,he,G.__bindingPointIndex),d.set(be,he))}function Ct(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),c.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),m={},le=null,se={},g={},v=new WeakMap,y=[],M=null,w=!1,S=null,x=null,I=null,C=null,E=null,Z=null,D=null,O=new At(0,0,0),Y=0,L=!1,b=null,V=null,ae=null,ne=null,de=null,Ne.set(0,0,s.canvas.width,s.canvas.height),J.set(0,0,s.canvas.width,s.canvas.height),a.reset(),c.reset(),u.reset()}return{buffers:{color:a,depth:c,stencil:u},enable:xe,disable:Ce,bindFramebuffer:Ue,drawBuffers:Qe,useProgram:Dt,setBlending:j,setMaterial:Rn,setFlipSided:mt,setCullFace:dt,setLineWidth:$e,setPolygonOffset:bt,setScissorTest:Ze,activeTexture:N,bindTexture:A,unbindTexture:K,compressedTexImage2D:me,compressedTexImage3D:ve,texImage2D:ze,texImage3D:et,updateUBOMapping:ht,uniformBlockBinding:st,texStorage2D:ft,texStorage3D:Me,texSubImage2D:fe,texSubImage3D:We,compressedTexSubImage2D:Re,compressedTexSubImage3D:Fe,scissor:tt,viewport:ke,reset:Ct}}function $g(s,e,t,i){const o=zw(i);switch(t){case Iv:return s*e;case Nv:return s*e;case Uv:return s*e*2;case ih:return s*e/o.components*o.byteLength;case rh:return s*e/o.components*o.byteLength;case Fv:return s*e*2/o.components*o.byteLength;case sh:return s*e*2/o.components*o.byteLength;case Dv:return s*e*3/o.components*o.byteLength;case Ai:return s*e*4/o.components*o.byteLength;case oh:return s*e*4/o.components*o.byteLength;case Sc:case Mc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ec:case wc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Sd:case Ed:return Math.max(s,16)*Math.max(e,8)/4;case yd:case Md:return Math.max(s,8)*Math.max(e,8)/2;case wd:case Td:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ad:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Cd:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Rd:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case bd:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Pd:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Ld:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Id:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Dd:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Nd:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Ud:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Fd:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Od:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case zd:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case kd:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Bd:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Tc:case Vd:case Hd:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Ov:case Gd:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Wd:case Xd:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function zw(s){switch(s){case sr:case bv:return{byteLength:1,components:1};case ba:case Pv:case Ua:return{byteLength:2,components:1};case th:case nh:return{byteLength:2,components:4};case vs:case eh:case Ni:return{byteLength:4,components:1};case Lv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function kw(s,e,t,i,o,a,c){const u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new Be,m=new WeakMap;let g;const v=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(N,A){return y?new OffscreenCanvas(N,A):Rc("canvas")}function w(N,A,K){let me=1;const ve=Ze(N);if((ve.width>K||ve.height>K)&&(me=K/Math.max(ve.width,ve.height)),me<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){const fe=Math.floor(me*ve.width),We=Math.floor(me*ve.height);g===void 0&&(g=M(fe,We));const Re=A?M(fe,We):g;return Re.width=fe,Re.height=We,Re.getContext("2d").drawImage(N,0,0,fe,We),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ve.width+"x"+ve.height+") to ("+fe+"x"+We+")."),Re}else return"data"in N&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ve.width+"x"+ve.height+")."),N;return N}function S(N){return N.generateMipmaps}function x(N){s.generateMipmap(N)}function I(N){return N.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?s.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function C(N,A,K,me,ve=!1){if(N!==null){if(s[N]!==void 0)return s[N];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let fe=A;if(A===s.RED&&(K===s.FLOAT&&(fe=s.R32F),K===s.HALF_FLOAT&&(fe=s.R16F),K===s.UNSIGNED_BYTE&&(fe=s.R8)),A===s.RED_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.R8UI),K===s.UNSIGNED_SHORT&&(fe=s.R16UI),K===s.UNSIGNED_INT&&(fe=s.R32UI),K===s.BYTE&&(fe=s.R8I),K===s.SHORT&&(fe=s.R16I),K===s.INT&&(fe=s.R32I)),A===s.RG&&(K===s.FLOAT&&(fe=s.RG32F),K===s.HALF_FLOAT&&(fe=s.RG16F),K===s.UNSIGNED_BYTE&&(fe=s.RG8)),A===s.RG_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RG8UI),K===s.UNSIGNED_SHORT&&(fe=s.RG16UI),K===s.UNSIGNED_INT&&(fe=s.RG32UI),K===s.BYTE&&(fe=s.RG8I),K===s.SHORT&&(fe=s.RG16I),K===s.INT&&(fe=s.RG32I)),A===s.RGB_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RGB8UI),K===s.UNSIGNED_SHORT&&(fe=s.RGB16UI),K===s.UNSIGNED_INT&&(fe=s.RGB32UI),K===s.BYTE&&(fe=s.RGB8I),K===s.SHORT&&(fe=s.RGB16I),K===s.INT&&(fe=s.RGB32I)),A===s.RGBA_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RGBA8UI),K===s.UNSIGNED_SHORT&&(fe=s.RGBA16UI),K===s.UNSIGNED_INT&&(fe=s.RGBA32UI),K===s.BYTE&&(fe=s.RGBA8I),K===s.SHORT&&(fe=s.RGBA16I),K===s.INT&&(fe=s.RGBA32I)),A===s.RGB&&K===s.UNSIGNED_INT_5_9_9_9_REV&&(fe=s.RGB9_E5),A===s.RGBA){const We=ve?Nc:St.getTransfer(me);K===s.FLOAT&&(fe=s.RGBA32F),K===s.HALF_FLOAT&&(fe=s.RGBA16F),K===s.UNSIGNED_BYTE&&(fe=We===Nt?s.SRGB8_ALPHA8:s.RGBA8),K===s.UNSIGNED_SHORT_4_4_4_4&&(fe=s.RGBA4),K===s.UNSIGNED_SHORT_5_5_5_1&&(fe=s.RGB5_A1)}return(fe===s.R16F||fe===s.R32F||fe===s.RG16F||fe===s.RG32F||fe===s.RGBA16F||fe===s.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function E(N,A){let K;return N?A===null||A===vs||A===yo?K=s.DEPTH24_STENCIL8:A===Ni?K=s.DEPTH32F_STENCIL8:A===ba&&(K=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===vs||A===yo?K=s.DEPTH_COMPONENT24:A===Ni?K=s.DEPTH_COMPONENT32F:A===ba&&(K=s.DEPTH_COMPONENT16),K}function Z(N,A){return S(N)===!0||N.isFramebufferTexture&&N.minFilter!==Jn&&N.minFilter!==Ti?Math.log2(Math.max(A.width,A.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?A.mipmaps.length:1}function D(N){const A=N.target;A.removeEventListener("dispose",D),Y(A),A.isVideoTexture&&m.delete(A)}function O(N){const A=N.target;A.removeEventListener("dispose",O),b(A)}function Y(N){const A=i.get(N);if(A.__webglInit===void 0)return;const K=N.source,me=v.get(K);if(me){const ve=me[A.__cacheKey];ve.usedTimes--,ve.usedTimes===0&&L(N),Object.keys(me).length===0&&v.delete(K)}i.remove(N)}function L(N){const A=i.get(N);s.deleteTexture(A.__webglTexture);const K=N.source,me=v.get(K);delete me[A.__cacheKey],c.memory.textures--}function b(N){const A=i.get(N);if(N.depthTexture&&(N.depthTexture.dispose(),i.remove(N.depthTexture)),N.isWebGLCubeRenderTarget)for(let me=0;me<6;me++){if(Array.isArray(A.__webglFramebuffer[me]))for(let ve=0;ve<A.__webglFramebuffer[me].length;ve++)s.deleteFramebuffer(A.__webglFramebuffer[me][ve]);else s.deleteFramebuffer(A.__webglFramebuffer[me]);A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer[me])}else{if(Array.isArray(A.__webglFramebuffer))for(let me=0;me<A.__webglFramebuffer.length;me++)s.deleteFramebuffer(A.__webglFramebuffer[me]);else s.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer),A.__webglMultisampledFramebuffer&&s.deleteFramebuffer(A.__webglMultisampledFramebuffer),A.__webglColorRenderbuffer)for(let me=0;me<A.__webglColorRenderbuffer.length;me++)A.__webglColorRenderbuffer[me]&&s.deleteRenderbuffer(A.__webglColorRenderbuffer[me]);A.__webglDepthRenderbuffer&&s.deleteRenderbuffer(A.__webglDepthRenderbuffer)}const K=N.textures;for(let me=0,ve=K.length;me<ve;me++){const fe=i.get(K[me]);fe.__webglTexture&&(s.deleteTexture(fe.__webglTexture),c.memory.textures--),i.remove(K[me])}i.remove(N)}let V=0;function ae(){V=0}function ne(){const N=V;return N>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+N+" texture units while this GPU supports only "+o.maxTextures),V+=1,N}function de(N){const A=[];return A.push(N.wrapS),A.push(N.wrapT),A.push(N.wrapR||0),A.push(N.magFilter),A.push(N.minFilter),A.push(N.anisotropy),A.push(N.internalFormat),A.push(N.format),A.push(N.type),A.push(N.generateMipmaps),A.push(N.premultiplyAlpha),A.push(N.flipY),A.push(N.unpackAlignment),A.push(N.colorSpace),A.join()}function pe(N,A){const K=i.get(N);if(N.isVideoTexture&&$e(N),N.isRenderTargetTexture===!1&&N.version>0&&K.__version!==N.version){const me=N.image;if(me===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(me.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(K,N,A);return}}t.bindTexture(s.TEXTURE_2D,K.__webglTexture,s.TEXTURE0+A)}function oe(N,A){const K=i.get(N);if(N.version>0&&K.__version!==N.version){J(K,N,A);return}t.bindTexture(s.TEXTURE_2D_ARRAY,K.__webglTexture,s.TEXTURE0+A)}function ce(N,A){const K=i.get(N);if(N.version>0&&K.__version!==N.version){J(K,N,A);return}t.bindTexture(s.TEXTURE_3D,K.__webglTexture,s.TEXTURE0+A)}function B(N,A){const K=i.get(N);if(N.version>0&&K.__version!==N.version){ue(K,N,A);return}t.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture,s.TEXTURE0+A)}const le={[_d]:s.REPEAT,[ms]:s.CLAMP_TO_EDGE,[xd]:s.MIRRORED_REPEAT},se={[Jn]:s.NEAREST,[cy]:s.NEAREST_MIPMAP_NEAREST,[Gl]:s.NEAREST_MIPMAP_LINEAR,[Ti]:s.LINEAR,[Af]:s.LINEAR_MIPMAP_NEAREST,[gs]:s.LINEAR_MIPMAP_LINEAR},F={[py]:s.NEVER,[yy]:s.ALWAYS,[my]:s.LESS,[zv]:s.LEQUAL,[gy]:s.EQUAL,[xy]:s.GEQUAL,[vy]:s.GREATER,[_y]:s.NOTEQUAL};function ie(N,A){if(A.type===Ni&&e.has("OES_texture_float_linear")===!1&&(A.magFilter===Ti||A.magFilter===Af||A.magFilter===Gl||A.magFilter===gs||A.minFilter===Ti||A.minFilter===Af||A.minFilter===Gl||A.minFilter===gs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(N,s.TEXTURE_WRAP_S,le[A.wrapS]),s.texParameteri(N,s.TEXTURE_WRAP_T,le[A.wrapT]),(N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY)&&s.texParameteri(N,s.TEXTURE_WRAP_R,le[A.wrapR]),s.texParameteri(N,s.TEXTURE_MAG_FILTER,se[A.magFilter]),s.texParameteri(N,s.TEXTURE_MIN_FILTER,se[A.minFilter]),A.compareFunction&&(s.texParameteri(N,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(N,s.TEXTURE_COMPARE_FUNC,F[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===Jn||A.minFilter!==Gl&&A.minFilter!==gs||A.type===Ni&&e.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||i.get(A).__currentAnisotropy){const K=e.get("EXT_texture_filter_anisotropic");s.texParameterf(N,K.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,o.getMaxAnisotropy())),i.get(A).__currentAnisotropy=A.anisotropy}}}function Ne(N,A){let K=!1;N.__webglInit===void 0&&(N.__webglInit=!0,A.addEventListener("dispose",D));const me=A.source;let ve=v.get(me);ve===void 0&&(ve={},v.set(me,ve));const fe=de(A);if(fe!==N.__cacheKey){ve[fe]===void 0&&(ve[fe]={texture:s.createTexture(),usedTimes:0},c.memory.textures++,K=!0),ve[fe].usedTimes++;const We=ve[N.__cacheKey];We!==void 0&&(ve[N.__cacheKey].usedTimes--,We.usedTimes===0&&L(A)),N.__cacheKey=fe,N.__webglTexture=ve[fe].texture}return K}function J(N,A,K){let me=s.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(me=s.TEXTURE_2D_ARRAY),A.isData3DTexture&&(me=s.TEXTURE_3D);const ve=Ne(N,A),fe=A.source;t.bindTexture(me,N.__webglTexture,s.TEXTURE0+K);const We=i.get(fe);if(fe.version!==We.__version||ve===!0){t.activeTexture(s.TEXTURE0+K);const Re=St.getPrimaries(St.workingColorSpace),Fe=A.colorSpace===Fr?null:St.getPrimaries(A.colorSpace),ft=A.colorSpace===Fr||Re===Fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ft);let Me=w(A.image,!1,o.maxTextureSize);Me=bt(A,Me);const ze=a.convert(A.format,A.colorSpace),et=a.convert(A.type);let tt=C(A.internalFormat,ze,et,A.colorSpace,A.isVideoTexture);ie(me,A);let ke;const ht=A.mipmaps,st=A.isVideoTexture!==!0,Ct=We.__version===void 0||ve===!0,G=fe.dataReady,be=Z(A,Me);if(A.isDepthTexture)tt=E(A.format===So,A.type),Ct&&(st?t.texStorage2D(s.TEXTURE_2D,1,tt,Me.width,Me.height):t.texImage2D(s.TEXTURE_2D,0,tt,Me.width,Me.height,0,ze,et,null));else if(A.isDataTexture)if(ht.length>0){st&&Ct&&t.texStorage2D(s.TEXTURE_2D,be,tt,ht[0].width,ht[0].height);for(let re=0,he=ht.length;re<he;re++)ke=ht[re],st?G&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ke.width,ke.height,ze,et,ke.data):t.texImage2D(s.TEXTURE_2D,re,tt,ke.width,ke.height,0,ze,et,ke.data);A.generateMipmaps=!1}else st?(Ct&&t.texStorage2D(s.TEXTURE_2D,be,tt,Me.width,Me.height),G&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Me.width,Me.height,ze,et,Me.data)):t.texImage2D(s.TEXTURE_2D,0,tt,Me.width,Me.height,0,ze,et,Me.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){st&&Ct&&t.texStorage3D(s.TEXTURE_2D_ARRAY,be,tt,ht[0].width,ht[0].height,Me.depth);for(let re=0,he=ht.length;re<he;re++)if(ke=ht[re],A.format!==Ai)if(ze!==null)if(st){if(G)if(A.layerUpdates.size>0){const Ie=$g(ke.width,ke.height,A.format,A.type);for(const Le of A.layerUpdates){const ot=ke.data.subarray(Le*Ie/ke.data.BYTES_PER_ELEMENT,(Le+1)*Ie/ke.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,Le,ke.width,ke.height,1,ze,ot)}A.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,ke.width,ke.height,Me.depth,ze,ke.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,re,tt,ke.width,ke.height,Me.depth,0,ke.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else st?G&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,ke.width,ke.height,Me.depth,ze,et,ke.data):t.texImage3D(s.TEXTURE_2D_ARRAY,re,tt,ke.width,ke.height,Me.depth,0,ze,et,ke.data)}else{st&&Ct&&t.texStorage2D(s.TEXTURE_2D,be,tt,ht[0].width,ht[0].height);for(let re=0,he=ht.length;re<he;re++)ke=ht[re],A.format!==Ai?ze!==null?st?G&&t.compressedTexSubImage2D(s.TEXTURE_2D,re,0,0,ke.width,ke.height,ze,ke.data):t.compressedTexImage2D(s.TEXTURE_2D,re,tt,ke.width,ke.height,0,ke.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?G&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ke.width,ke.height,ze,et,ke.data):t.texImage2D(s.TEXTURE_2D,re,tt,ke.width,ke.height,0,ze,et,ke.data)}else if(A.isDataArrayTexture)if(st){if(Ct&&t.texStorage3D(s.TEXTURE_2D_ARRAY,be,tt,Me.width,Me.height,Me.depth),G)if(A.layerUpdates.size>0){const re=$g(Me.width,Me.height,A.format,A.type);for(const he of A.layerUpdates){const Ie=Me.data.subarray(he*re/Me.data.BYTES_PER_ELEMENT,(he+1)*re/Me.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,he,Me.width,Me.height,1,ze,et,Ie)}A.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Me.width,Me.height,Me.depth,ze,et,Me.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,tt,Me.width,Me.height,Me.depth,0,ze,et,Me.data);else if(A.isData3DTexture)st?(Ct&&t.texStorage3D(s.TEXTURE_3D,be,tt,Me.width,Me.height,Me.depth),G&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Me.width,Me.height,Me.depth,ze,et,Me.data)):t.texImage3D(s.TEXTURE_3D,0,tt,Me.width,Me.height,Me.depth,0,ze,et,Me.data);else if(A.isFramebufferTexture){if(Ct)if(st)t.texStorage2D(s.TEXTURE_2D,be,tt,Me.width,Me.height);else{let re=Me.width,he=Me.height;for(let Ie=0;Ie<be;Ie++)t.texImage2D(s.TEXTURE_2D,Ie,tt,re,he,0,ze,et,null),re>>=1,he>>=1}}else if(ht.length>0){if(st&&Ct){const re=Ze(ht[0]);t.texStorage2D(s.TEXTURE_2D,be,tt,re.width,re.height)}for(let re=0,he=ht.length;re<he;re++)ke=ht[re],st?G&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ze,et,ke):t.texImage2D(s.TEXTURE_2D,re,tt,ze,et,ke);A.generateMipmaps=!1}else if(st){if(Ct){const re=Ze(Me);t.texStorage2D(s.TEXTURE_2D,be,tt,re.width,re.height)}G&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ze,et,Me)}else t.texImage2D(s.TEXTURE_2D,0,tt,ze,et,Me);S(A)&&x(me),We.__version=fe.version,A.onUpdate&&A.onUpdate(A)}N.__version=A.version}function ue(N,A,K){if(A.image.length!==6)return;const me=Ne(N,A),ve=A.source;t.bindTexture(s.TEXTURE_CUBE_MAP,N.__webglTexture,s.TEXTURE0+K);const fe=i.get(ve);if(ve.version!==fe.__version||me===!0){t.activeTexture(s.TEXTURE0+K);const We=St.getPrimaries(St.workingColorSpace),Re=A.colorSpace===Fr?null:St.getPrimaries(A.colorSpace),Fe=A.colorSpace===Fr||We===Re?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Fe);const ft=A.isCompressedTexture||A.image[0].isCompressedTexture,Me=A.image[0]&&A.image[0].isDataTexture,ze=[];for(let he=0;he<6;he++)!ft&&!Me?ze[he]=w(A.image[he],!0,o.maxCubemapSize):ze[he]=Me?A.image[he].image:A.image[he],ze[he]=bt(A,ze[he]);const et=ze[0],tt=a.convert(A.format,A.colorSpace),ke=a.convert(A.type),ht=C(A.internalFormat,tt,ke,A.colorSpace),st=A.isVideoTexture!==!0,Ct=fe.__version===void 0||me===!0,G=ve.dataReady;let be=Z(A,et);ie(s.TEXTURE_CUBE_MAP,A);let re;if(ft){st&&Ct&&t.texStorage2D(s.TEXTURE_CUBE_MAP,be,ht,et.width,et.height);for(let he=0;he<6;he++){re=ze[he].mipmaps;for(let Ie=0;Ie<re.length;Ie++){const Le=re[Ie];A.format!==Ai?tt!==null?st?G&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie,0,0,Le.width,Le.height,tt,Le.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie,ht,Le.width,Le.height,0,Le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):st?G&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie,0,0,Le.width,Le.height,tt,ke,Le.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie,ht,Le.width,Le.height,0,tt,ke,Le.data)}}}else{if(re=A.mipmaps,st&&Ct){re.length>0&&be++;const he=Ze(ze[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,be,ht,he.width,he.height)}for(let he=0;he<6;he++)if(Me){st?G&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,ze[he].width,ze[he].height,tt,ke,ze[he].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,ht,ze[he].width,ze[he].height,0,tt,ke,ze[he].data);for(let Ie=0;Ie<re.length;Ie++){const ot=re[Ie].image[he].image;st?G&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie+1,0,0,ot.width,ot.height,tt,ke,ot.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie+1,ht,ot.width,ot.height,0,tt,ke,ot.data)}}else{st?G&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,tt,ke,ze[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,ht,tt,ke,ze[he]);for(let Ie=0;Ie<re.length;Ie++){const Le=re[Ie];st?G&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie+1,0,0,tt,ke,Le.image[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ie+1,ht,tt,ke,Le.image[he])}}}S(A)&&x(s.TEXTURE_CUBE_MAP),fe.__version=ve.version,A.onUpdate&&A.onUpdate(A)}N.__version=A.version}function we(N,A,K,me,ve,fe){const We=a.convert(K.format,K.colorSpace),Re=a.convert(K.type),Fe=C(K.internalFormat,We,Re,K.colorSpace),ft=i.get(A),Me=i.get(K);if(Me.__renderTarget=A,!ft.__hasExternalTextures){const ze=Math.max(1,A.width>>fe),et=Math.max(1,A.height>>fe);ve===s.TEXTURE_3D||ve===s.TEXTURE_2D_ARRAY?t.texImage3D(ve,fe,Fe,ze,et,A.depth,0,We,Re,null):t.texImage2D(ve,fe,Fe,ze,et,0,We,Re,null)}t.bindFramebuffer(s.FRAMEBUFFER,N),dt(A)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,me,ve,Me.__webglTexture,0,mt(A)):(ve===s.TEXTURE_2D||ve>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ve<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,me,ve,Me.__webglTexture,fe),t.bindFramebuffer(s.FRAMEBUFFER,null)}function xe(N,A,K){if(s.bindRenderbuffer(s.RENDERBUFFER,N),A.depthBuffer){const me=A.depthTexture,ve=me&&me.isDepthTexture?me.type:null,fe=E(A.stencilBuffer,ve),We=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Re=mt(A);dt(A)?u.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Re,fe,A.width,A.height):K?s.renderbufferStorageMultisample(s.RENDERBUFFER,Re,fe,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,fe,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,We,s.RENDERBUFFER,N)}else{const me=A.textures;for(let ve=0;ve<me.length;ve++){const fe=me[ve],We=a.convert(fe.format,fe.colorSpace),Re=a.convert(fe.type),Fe=C(fe.internalFormat,We,Re,fe.colorSpace),ft=mt(A);K&&dt(A)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ft,Fe,A.width,A.height):dt(A)?u.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ft,Fe,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,Fe,A.width,A.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Ce(N,A){if(A&&A.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,N),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const me=i.get(A.depthTexture);me.__renderTarget=A,(!me.__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)&&(A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0),pe(A.depthTexture,0);const ve=me.__webglTexture,fe=mt(A);if(A.depthTexture.format===mo)dt(A)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ve,0,fe):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ve,0);else if(A.depthTexture.format===So)dt(A)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ve,0,fe):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ve,0);else throw new Error("Unknown depthTexture format")}function Ue(N){const A=i.get(N),K=N.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==N.depthTexture){const me=N.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),me){const ve=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,me.removeEventListener("dispose",ve)};me.addEventListener("dispose",ve),A.__depthDisposeCallback=ve}A.__boundDepthTexture=me}if(N.depthTexture&&!A.__autoAllocateDepthBuffer){if(K)throw new Error("target.depthTexture not supported in Cube render targets");Ce(A.__webglFramebuffer,N)}else if(K){A.__webglDepthbuffer=[];for(let me=0;me<6;me++)if(t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer[me]),A.__webglDepthbuffer[me]===void 0)A.__webglDepthbuffer[me]=s.createRenderbuffer(),xe(A.__webglDepthbuffer[me],N,!1);else{const ve=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,fe=A.__webglDepthbuffer[me];s.bindRenderbuffer(s.RENDERBUFFER,fe),s.framebufferRenderbuffer(s.FRAMEBUFFER,ve,s.RENDERBUFFER,fe)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=s.createRenderbuffer(),xe(A.__webglDepthbuffer,N,!1);else{const me=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ve=A.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ve),s.framebufferRenderbuffer(s.FRAMEBUFFER,me,s.RENDERBUFFER,ve)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Qe(N,A,K){const me=i.get(N);A!==void 0&&we(me.__webglFramebuffer,N,N.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),K!==void 0&&Ue(N)}function Dt(N){const A=N.texture,K=i.get(N),me=i.get(A);N.addEventListener("dispose",O);const ve=N.textures,fe=N.isWebGLCubeRenderTarget===!0,We=ve.length>1;if(We||(me.__webglTexture===void 0&&(me.__webglTexture=s.createTexture()),me.__version=A.version,c.memory.textures++),fe){K.__webglFramebuffer=[];for(let Re=0;Re<6;Re++)if(A.mipmaps&&A.mipmaps.length>0){K.__webglFramebuffer[Re]=[];for(let Fe=0;Fe<A.mipmaps.length;Fe++)K.__webglFramebuffer[Re][Fe]=s.createFramebuffer()}else K.__webglFramebuffer[Re]=s.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){K.__webglFramebuffer=[];for(let Re=0;Re<A.mipmaps.length;Re++)K.__webglFramebuffer[Re]=s.createFramebuffer()}else K.__webglFramebuffer=s.createFramebuffer();if(We)for(let Re=0,Fe=ve.length;Re<Fe;Re++){const ft=i.get(ve[Re]);ft.__webglTexture===void 0&&(ft.__webglTexture=s.createTexture(),c.memory.textures++)}if(N.samples>0&&dt(N)===!1){K.__webglMultisampledFramebuffer=s.createFramebuffer(),K.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,K.__webglMultisampledFramebuffer);for(let Re=0;Re<ve.length;Re++){const Fe=ve[Re];K.__webglColorRenderbuffer[Re]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,K.__webglColorRenderbuffer[Re]);const ft=a.convert(Fe.format,Fe.colorSpace),Me=a.convert(Fe.type),ze=C(Fe.internalFormat,ft,Me,Fe.colorSpace,N.isXRRenderTarget===!0),et=mt(N);s.renderbufferStorageMultisample(s.RENDERBUFFER,et,ze,N.width,N.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Re,s.RENDERBUFFER,K.__webglColorRenderbuffer[Re])}s.bindRenderbuffer(s.RENDERBUFFER,null),N.depthBuffer&&(K.__webglDepthRenderbuffer=s.createRenderbuffer(),xe(K.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(fe){t.bindTexture(s.TEXTURE_CUBE_MAP,me.__webglTexture),ie(s.TEXTURE_CUBE_MAP,A);for(let Re=0;Re<6;Re++)if(A.mipmaps&&A.mipmaps.length>0)for(let Fe=0;Fe<A.mipmaps.length;Fe++)we(K.__webglFramebuffer[Re][Fe],N,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Re,Fe);else we(K.__webglFramebuffer[Re],N,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Re,0);S(A)&&x(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(We){for(let Re=0,Fe=ve.length;Re<Fe;Re++){const ft=ve[Re],Me=i.get(ft);t.bindTexture(s.TEXTURE_2D,Me.__webglTexture),ie(s.TEXTURE_2D,ft),we(K.__webglFramebuffer,N,ft,s.COLOR_ATTACHMENT0+Re,s.TEXTURE_2D,0),S(ft)&&x(s.TEXTURE_2D)}t.unbindTexture()}else{let Re=s.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(Re=N.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Re,me.__webglTexture),ie(Re,A),A.mipmaps&&A.mipmaps.length>0)for(let Fe=0;Fe<A.mipmaps.length;Fe++)we(K.__webglFramebuffer[Fe],N,A,s.COLOR_ATTACHMENT0,Re,Fe);else we(K.__webglFramebuffer,N,A,s.COLOR_ATTACHMENT0,Re,0);S(A)&&x(Re),t.unbindTexture()}N.depthBuffer&&Ue(N)}function gt(N){const A=N.textures;for(let K=0,me=A.length;K<me;K++){const ve=A[K];if(S(ve)){const fe=I(N),We=i.get(ve).__webglTexture;t.bindTexture(fe,We),x(fe),t.unbindTexture()}}}const Ft=[],j=[];function Rn(N){if(N.samples>0){if(dt(N)===!1){const A=N.textures,K=N.width,me=N.height;let ve=s.COLOR_BUFFER_BIT;const fe=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,We=i.get(N),Re=A.length>1;if(Re)for(let Fe=0;Fe<A.length;Fe++)t.bindFramebuffer(s.FRAMEBUFFER,We.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Fe,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,We.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Fe,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,We.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,We.__webglFramebuffer);for(let Fe=0;Fe<A.length;Fe++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(ve|=s.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(ve|=s.STENCIL_BUFFER_BIT)),Re){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,We.__webglColorRenderbuffer[Fe]);const ft=i.get(A[Fe]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ft,0)}s.blitFramebuffer(0,0,K,me,0,0,K,me,ve,s.NEAREST),d===!0&&(Ft.length=0,j.length=0,Ft.push(s.COLOR_ATTACHMENT0+Fe),N.depthBuffer&&N.resolveDepthBuffer===!1&&(Ft.push(fe),j.push(fe),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,j)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Ft))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Re)for(let Fe=0;Fe<A.length;Fe++){t.bindFramebuffer(s.FRAMEBUFFER,We.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Fe,s.RENDERBUFFER,We.__webglColorRenderbuffer[Fe]);const ft=i.get(A[Fe]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,We.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Fe,s.TEXTURE_2D,ft,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,We.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.resolveDepthBuffer===!1&&d){const A=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[A])}}}function mt(N){return Math.min(o.maxSamples,N.samples)}function dt(N){const A=i.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function $e(N){const A=c.render.frame;m.get(N)!==A&&(m.set(N,A),N.update())}function bt(N,A){const K=N.colorSpace,me=N.format,ve=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||K!==To&&K!==Fr&&(St.getTransfer(K)===Nt?(me!==Ai||ve!==sr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",K)),A}function Ze(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(h.width=N.naturalWidth||N.width,h.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(h.width=N.displayWidth,h.height=N.displayHeight):(h.width=N.width,h.height=N.height),h}this.allocateTextureUnit=ne,this.resetTextureUnits=ae,this.setTexture2D=pe,this.setTexture2DArray=oe,this.setTexture3D=ce,this.setTextureCube=B,this.rebindTextures=Qe,this.setupRenderTarget=Dt,this.updateRenderTargetMipmap=gt,this.updateMultisampleRenderTarget=Rn,this.setupDepthRenderbuffer=Ue,this.setupFrameBufferTexture=we,this.useMultisampledRTT=dt}function Bw(s,e){function t(i,o=Fr){let a;const c=St.getTransfer(o);if(i===sr)return s.UNSIGNED_BYTE;if(i===th)return s.UNSIGNED_SHORT_4_4_4_4;if(i===nh)return s.UNSIGNED_SHORT_5_5_5_1;if(i===Lv)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===bv)return s.BYTE;if(i===Pv)return s.SHORT;if(i===ba)return s.UNSIGNED_SHORT;if(i===eh)return s.INT;if(i===vs)return s.UNSIGNED_INT;if(i===Ni)return s.FLOAT;if(i===Ua)return s.HALF_FLOAT;if(i===Iv)return s.ALPHA;if(i===Dv)return s.RGB;if(i===Ai)return s.RGBA;if(i===Nv)return s.LUMINANCE;if(i===Uv)return s.LUMINANCE_ALPHA;if(i===mo)return s.DEPTH_COMPONENT;if(i===So)return s.DEPTH_STENCIL;if(i===ih)return s.RED;if(i===rh)return s.RED_INTEGER;if(i===Fv)return s.RG;if(i===sh)return s.RG_INTEGER;if(i===oh)return s.RGBA_INTEGER;if(i===Sc||i===Mc||i===Ec||i===wc)if(c===Nt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Sc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Mc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ec)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===wc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Sc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Mc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ec)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===wc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===yd||i===Sd||i===Md||i===Ed)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===yd)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Sd)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Md)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ed)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===wd||i===Td||i===Ad)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(i===wd||i===Td)return c===Nt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Ad)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Cd||i===Rd||i===bd||i===Pd||i===Ld||i===Id||i===Dd||i===Nd||i===Ud||i===Fd||i===Od||i===zd||i===kd||i===Bd)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(i===Cd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Rd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===bd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Pd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ld)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Id)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Dd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Nd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ud)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Fd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Od)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===zd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===kd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Bd)return c===Nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Tc||i===Vd||i===Hd)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(i===Tc)return c===Nt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Vd)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Hd)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ov||i===Gd||i===Wd||i===Xd)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(i===Tc)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Gd)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Wd)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Xd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===yo?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:t}}class Vw extends Mi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Or extends Un{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Hw={type:"move"};class Qf{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Or,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Or,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Or,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let o=null,a=null,c=null;const u=this._targetRay,d=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){c=!0;for(const w of e.hand.values()){const S=t.getJointPose(w,i),x=this._getHandJoint(h,w);S!==null&&(x.matrix.fromArray(S.transform.matrix),x.matrix.decompose(x.position,x.rotation,x.scale),x.matrixWorldNeedsUpdate=!0,x.jointRadius=S.radius),x.visible=S!==null}const m=h.joints["index-finger-tip"],g=h.joints["thumb-tip"],v=m.position.distanceTo(g.position),y=.02,M=.005;h.inputState.pinching&&v>y+M?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&v<=y-M&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else d!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,i),a!==null&&(d.matrix.fromArray(a.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,a.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(a.linearVelocity)):d.hasLinearVelocity=!1,a.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(a.angularVelocity)):d.hasAngularVelocity=!1));u!==null&&(o=t.getPose(e.targetRaySpace,i),o===null&&a!==null&&(o=a),o!==null&&(u.matrix.fromArray(o.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,o.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(o.linearVelocity)):u.hasLinearVelocity=!1,o.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(o.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(Hw)))}return u!==null&&(u.visible=o!==null),d!==null&&(d.visible=a!==null),h!==null&&(h.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Or;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Gw=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ww=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Xw{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const o=new An,a=e.properties.get(o);a.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=o}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Vr({vertexShader:Gw,fragmentShader:Ww,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gn(new Uc(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class jw extends Ao{constructor(e,t){super();const i=this;let o=null,a=1,c=null,u="local-floor",d=1,h=null,m=null,g=null,v=null,y=null,M=null;const w=new Xw,S=t.getContextAttributes();let x=null,I=null;const C=[],E=[],Z=new Be;let D=null;const O=new Mi;O.viewport=new $t;const Y=new Mi;Y.viewport=new $t;const L=[O,Y],b=new Vw;let V=null,ae=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ue=C[J];return ue===void 0&&(ue=new Qf,C[J]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(J){let ue=C[J];return ue===void 0&&(ue=new Qf,C[J]=ue),ue.getGripSpace()},this.getHand=function(J){let ue=C[J];return ue===void 0&&(ue=new Qf,C[J]=ue),ue.getHandSpace()};function ne(J){const ue=E.indexOf(J.inputSource);if(ue===-1)return;const we=C[ue];we!==void 0&&(we.update(J.inputSource,J.frame,h||c),we.dispatchEvent({type:J.type,data:J.inputSource}))}function de(){o.removeEventListener("select",ne),o.removeEventListener("selectstart",ne),o.removeEventListener("selectend",ne),o.removeEventListener("squeeze",ne),o.removeEventListener("squeezestart",ne),o.removeEventListener("squeezeend",ne),o.removeEventListener("end",de),o.removeEventListener("inputsourceschange",pe);for(let J=0;J<C.length;J++){const ue=E[J];ue!==null&&(E[J]=null,C[J].disconnect(ue))}V=null,ae=null,w.reset(),e.setRenderTarget(x),y=null,v=null,g=null,o=null,I=null,Ne.stop(),i.isPresenting=!1,e.setPixelRatio(D),e.setSize(Z.width,Z.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){a=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){u=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||c},this.setReferenceSpace=function(J){h=J},this.getBaseLayer=function(){return v!==null?v:y},this.getBinding=function(){return g},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(J){if(o=J,o!==null){if(x=e.getRenderTarget(),o.addEventListener("select",ne),o.addEventListener("selectstart",ne),o.addEventListener("selectend",ne),o.addEventListener("squeeze",ne),o.addEventListener("squeezestart",ne),o.addEventListener("squeezeend",ne),o.addEventListener("end",de),o.addEventListener("inputsourceschange",pe),S.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(Z),o.renderState.layers===void 0){const ue={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:a};y=new XRWebGLLayer(o,t,ue),o.updateRenderState({baseLayer:y}),e.setPixelRatio(1),e.setSize(y.framebufferWidth,y.framebufferHeight,!1),I=new _s(y.framebufferWidth,y.framebufferHeight,{format:Ai,type:sr,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil})}else{let ue=null,we=null,xe=null;S.depth&&(xe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ue=S.stencil?So:mo,we=S.stencil?yo:vs);const Ce={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:a};g=new XRWebGLBinding(o,t),v=g.createProjectionLayer(Ce),o.updateRenderState({layers:[v]}),e.setPixelRatio(1),e.setSize(v.textureWidth,v.textureHeight,!1),I=new _s(v.textureWidth,v.textureHeight,{format:Ai,type:sr,depthTexture:new Kv(v.textureWidth,v.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1})}I.isXRRenderTarget=!0,this.setFoveation(d),h=null,c=await o.requestReferenceSpace(u),Ne.setContext(o),Ne.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return w.getDepthTexture()};function pe(J){for(let ue=0;ue<J.removed.length;ue++){const we=J.removed[ue],xe=E.indexOf(we);xe>=0&&(E[xe]=null,C[xe].disconnect(we))}for(let ue=0;ue<J.added.length;ue++){const we=J.added[ue];let xe=E.indexOf(we);if(xe===-1){for(let Ue=0;Ue<C.length;Ue++)if(Ue>=E.length){E.push(we),xe=Ue;break}else if(E[Ue]===null){E[Ue]=we,xe=Ue;break}if(xe===-1)break}const Ce=C[xe];Ce&&Ce.connect(we)}}const oe=new k,ce=new k;function B(J,ue,we){oe.setFromMatrixPosition(ue.matrixWorld),ce.setFromMatrixPosition(we.matrixWorld);const xe=oe.distanceTo(ce),Ce=ue.projectionMatrix.elements,Ue=we.projectionMatrix.elements,Qe=Ce[14]/(Ce[10]-1),Dt=Ce[14]/(Ce[10]+1),gt=(Ce[9]+1)/Ce[5],Ft=(Ce[9]-1)/Ce[5],j=(Ce[8]-1)/Ce[0],Rn=(Ue[8]+1)/Ue[0],mt=Qe*j,dt=Qe*Rn,$e=xe/(-j+Rn),bt=$e*-j;if(ue.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(bt),J.translateZ($e),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ce[10]===-1)J.projectionMatrix.copy(ue.projectionMatrix),J.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{const Ze=Qe+$e,N=Dt+$e,A=mt-bt,K=dt+(xe-bt),me=gt*Dt/N*Ze,ve=Ft*Dt/N*Ze;J.projectionMatrix.makePerspective(A,K,me,ve,Ze,N),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function le(J,ue){ue===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ue.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(o===null)return;let ue=J.near,we=J.far;w.texture!==null&&(w.depthNear>0&&(ue=w.depthNear),w.depthFar>0&&(we=w.depthFar)),b.near=Y.near=O.near=ue,b.far=Y.far=O.far=we,(V!==b.near||ae!==b.far)&&(o.updateRenderState({depthNear:b.near,depthFar:b.far}),V=b.near,ae=b.far),O.layers.mask=J.layers.mask|2,Y.layers.mask=J.layers.mask|4,b.layers.mask=O.layers.mask|Y.layers.mask;const xe=J.parent,Ce=b.cameras;le(b,xe);for(let Ue=0;Ue<Ce.length;Ue++)le(Ce[Ue],xe);Ce.length===2?B(b,O,Y):b.projectionMatrix.copy(O.projectionMatrix),se(J,b,xe)};function se(J,ue,we){we===null?J.matrix.copy(ue.matrixWorld):(J.matrix.copy(we.matrixWorld),J.matrix.invert(),J.matrix.multiply(ue.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ue.projectionMatrix),J.projectionMatrixInverse.copy(ue.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Pa*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(v===null&&y===null))return d},this.setFoveation=function(J){d=J,v!==null&&(v.fixedFoveation=J),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=J)},this.hasDepthSensing=function(){return w.texture!==null},this.getDepthSensingMesh=function(){return w.getMesh(b)};let F=null;function ie(J,ue){if(m=ue.getViewerPose(h||c),M=ue,m!==null){const we=m.views;y!==null&&(e.setRenderTargetFramebuffer(I,y.framebuffer),e.setRenderTarget(I));let xe=!1;we.length!==b.cameras.length&&(b.cameras.length=0,xe=!0);for(let Ue=0;Ue<we.length;Ue++){const Qe=we[Ue];let Dt=null;if(y!==null)Dt=y.getViewport(Qe);else{const Ft=g.getViewSubImage(v,Qe);Dt=Ft.viewport,Ue===0&&(e.setRenderTargetTextures(I,Ft.colorTexture,v.ignoreDepthValues?void 0:Ft.depthStencilTexture),e.setRenderTarget(I))}let gt=L[Ue];gt===void 0&&(gt=new Mi,gt.layers.enable(Ue),gt.viewport=new $t,L[Ue]=gt),gt.matrix.fromArray(Qe.transform.matrix),gt.matrix.decompose(gt.position,gt.quaternion,gt.scale),gt.projectionMatrix.fromArray(Qe.projectionMatrix),gt.projectionMatrixInverse.copy(gt.projectionMatrix).invert(),gt.viewport.set(Dt.x,Dt.y,Dt.width,Dt.height),Ue===0&&(b.matrix.copy(gt.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),xe===!0&&b.cameras.push(gt)}const Ce=o.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const Ue=g.getDepthInformation(we[0]);Ue&&Ue.isValid&&Ue.texture&&w.init(e,Ue,o.renderState)}}for(let we=0;we<C.length;we++){const xe=E[we],Ce=C[we];xe!==null&&Ce!==void 0&&Ce.update(xe,ue,h||c)}F&&F(J,ue),ue.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ue}),M=null}const Ne=new Zv;Ne.setAnimationLoop(ie),this.setAnimationLoop=function(J){F=J},this.dispose=function(){}}}const as=new or,Yw=new It;function qw(s,e){function t(S,x){S.matrixAutoUpdate===!0&&S.updateMatrix(),x.value.copy(S.matrix)}function i(S,x){x.color.getRGB(S.fogColor.value,Xv(s)),x.isFog?(S.fogNear.value=x.near,S.fogFar.value=x.far):x.isFogExp2&&(S.fogDensity.value=x.density)}function o(S,x,I,C,E){x.isMeshBasicMaterial||x.isMeshLambertMaterial?a(S,x):x.isMeshToonMaterial?(a(S,x),g(S,x)):x.isMeshPhongMaterial?(a(S,x),m(S,x)):x.isMeshStandardMaterial?(a(S,x),v(S,x),x.isMeshPhysicalMaterial&&y(S,x,E)):x.isMeshMatcapMaterial?(a(S,x),M(S,x)):x.isMeshDepthMaterial?a(S,x):x.isMeshDistanceMaterial?(a(S,x),w(S,x)):x.isMeshNormalMaterial?a(S,x):x.isLineBasicMaterial?(c(S,x),x.isLineDashedMaterial&&u(S,x)):x.isPointsMaterial?d(S,x,I,C):x.isSpriteMaterial?h(S,x):x.isShadowMaterial?(S.color.value.copy(x.color),S.opacity.value=x.opacity):x.isShaderMaterial&&(x.uniformsNeedUpdate=!1)}function a(S,x){S.opacity.value=x.opacity,x.color&&S.diffuse.value.copy(x.color),x.emissive&&S.emissive.value.copy(x.emissive).multiplyScalar(x.emissiveIntensity),x.map&&(S.map.value=x.map,t(x.map,S.mapTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.bumpMap&&(S.bumpMap.value=x.bumpMap,t(x.bumpMap,S.bumpMapTransform),S.bumpScale.value=x.bumpScale,x.side===Xn&&(S.bumpScale.value*=-1)),x.normalMap&&(S.normalMap.value=x.normalMap,t(x.normalMap,S.normalMapTransform),S.normalScale.value.copy(x.normalScale),x.side===Xn&&S.normalScale.value.negate()),x.displacementMap&&(S.displacementMap.value=x.displacementMap,t(x.displacementMap,S.displacementMapTransform),S.displacementScale.value=x.displacementScale,S.displacementBias.value=x.displacementBias),x.emissiveMap&&(S.emissiveMap.value=x.emissiveMap,t(x.emissiveMap,S.emissiveMapTransform)),x.specularMap&&(S.specularMap.value=x.specularMap,t(x.specularMap,S.specularMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest);const I=e.get(x),C=I.envMap,E=I.envMapRotation;C&&(S.envMap.value=C,as.copy(E),as.x*=-1,as.y*=-1,as.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(as.y*=-1,as.z*=-1),S.envMapRotation.value.setFromMatrix4(Yw.makeRotationFromEuler(as)),S.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,S.reflectivity.value=x.reflectivity,S.ior.value=x.ior,S.refractionRatio.value=x.refractionRatio),x.lightMap&&(S.lightMap.value=x.lightMap,S.lightMapIntensity.value=x.lightMapIntensity,t(x.lightMap,S.lightMapTransform)),x.aoMap&&(S.aoMap.value=x.aoMap,S.aoMapIntensity.value=x.aoMapIntensity,t(x.aoMap,S.aoMapTransform))}function c(S,x){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,x.map&&(S.map.value=x.map,t(x.map,S.mapTransform))}function u(S,x){S.dashSize.value=x.dashSize,S.totalSize.value=x.dashSize+x.gapSize,S.scale.value=x.scale}function d(S,x,I,C){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,S.size.value=x.size*I,S.scale.value=C*.5,x.map&&(S.map.value=x.map,t(x.map,S.uvTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest)}function h(S,x){S.diffuse.value.copy(x.color),S.opacity.value=x.opacity,S.rotation.value=x.rotation,x.map&&(S.map.value=x.map,t(x.map,S.mapTransform)),x.alphaMap&&(S.alphaMap.value=x.alphaMap,t(x.alphaMap,S.alphaMapTransform)),x.alphaTest>0&&(S.alphaTest.value=x.alphaTest)}function m(S,x){S.specular.value.copy(x.specular),S.shininess.value=Math.max(x.shininess,1e-4)}function g(S,x){x.gradientMap&&(S.gradientMap.value=x.gradientMap)}function v(S,x){S.metalness.value=x.metalness,x.metalnessMap&&(S.metalnessMap.value=x.metalnessMap,t(x.metalnessMap,S.metalnessMapTransform)),S.roughness.value=x.roughness,x.roughnessMap&&(S.roughnessMap.value=x.roughnessMap,t(x.roughnessMap,S.roughnessMapTransform)),x.envMap&&(S.envMapIntensity.value=x.envMapIntensity)}function y(S,x,I){S.ior.value=x.ior,x.sheen>0&&(S.sheenColor.value.copy(x.sheenColor).multiplyScalar(x.sheen),S.sheenRoughness.value=x.sheenRoughness,x.sheenColorMap&&(S.sheenColorMap.value=x.sheenColorMap,t(x.sheenColorMap,S.sheenColorMapTransform)),x.sheenRoughnessMap&&(S.sheenRoughnessMap.value=x.sheenRoughnessMap,t(x.sheenRoughnessMap,S.sheenRoughnessMapTransform))),x.clearcoat>0&&(S.clearcoat.value=x.clearcoat,S.clearcoatRoughness.value=x.clearcoatRoughness,x.clearcoatMap&&(S.clearcoatMap.value=x.clearcoatMap,t(x.clearcoatMap,S.clearcoatMapTransform)),x.clearcoatRoughnessMap&&(S.clearcoatRoughnessMap.value=x.clearcoatRoughnessMap,t(x.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform)),x.clearcoatNormalMap&&(S.clearcoatNormalMap.value=x.clearcoatNormalMap,t(x.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(x.clearcoatNormalScale),x.side===Xn&&S.clearcoatNormalScale.value.negate())),x.dispersion>0&&(S.dispersion.value=x.dispersion),x.iridescence>0&&(S.iridescence.value=x.iridescence,S.iridescenceIOR.value=x.iridescenceIOR,S.iridescenceThicknessMinimum.value=x.iridescenceThicknessRange[0],S.iridescenceThicknessMaximum.value=x.iridescenceThicknessRange[1],x.iridescenceMap&&(S.iridescenceMap.value=x.iridescenceMap,t(x.iridescenceMap,S.iridescenceMapTransform)),x.iridescenceThicknessMap&&(S.iridescenceThicknessMap.value=x.iridescenceThicknessMap,t(x.iridescenceThicknessMap,S.iridescenceThicknessMapTransform))),x.transmission>0&&(S.transmission.value=x.transmission,S.transmissionSamplerMap.value=I.texture,S.transmissionSamplerSize.value.set(I.width,I.height),x.transmissionMap&&(S.transmissionMap.value=x.transmissionMap,t(x.transmissionMap,S.transmissionMapTransform)),S.thickness.value=x.thickness,x.thicknessMap&&(S.thicknessMap.value=x.thicknessMap,t(x.thicknessMap,S.thicknessMapTransform)),S.attenuationDistance.value=x.attenuationDistance,S.attenuationColor.value.copy(x.attenuationColor)),x.anisotropy>0&&(S.anisotropyVector.value.set(x.anisotropy*Math.cos(x.anisotropyRotation),x.anisotropy*Math.sin(x.anisotropyRotation)),x.anisotropyMap&&(S.anisotropyMap.value=x.anisotropyMap,t(x.anisotropyMap,S.anisotropyMapTransform))),S.specularIntensity.value=x.specularIntensity,S.specularColor.value.copy(x.specularColor),x.specularColorMap&&(S.specularColorMap.value=x.specularColorMap,t(x.specularColorMap,S.specularColorMapTransform)),x.specularIntensityMap&&(S.specularIntensityMap.value=x.specularIntensityMap,t(x.specularIntensityMap,S.specularIntensityMapTransform))}function M(S,x){x.matcap&&(S.matcap.value=x.matcap)}function w(S,x){const I=e.get(x).light;S.referencePosition.value.setFromMatrixPosition(I.matrixWorld),S.nearDistance.value=I.shadow.camera.near,S.farDistance.value=I.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:o}}function Zw(s,e,t,i){let o={},a={},c=[];const u=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function d(I,C){const E=C.program;i.uniformBlockBinding(I,E)}function h(I,C){let E=o[I.id];E===void 0&&(M(I),E=m(I),o[I.id]=E,I.addEventListener("dispose",S));const Z=C.program;i.updateUBOMapping(I,Z);const D=e.render.frame;a[I.id]!==D&&(v(I),a[I.id]=D)}function m(I){const C=g();I.__bindingPointIndex=C;const E=s.createBuffer(),Z=I.__size,D=I.usage;return s.bindBuffer(s.UNIFORM_BUFFER,E),s.bufferData(s.UNIFORM_BUFFER,Z,D),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,C,E),E}function g(){for(let I=0;I<u;I++)if(c.indexOf(I)===-1)return c.push(I),I;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(I){const C=o[I.id],E=I.uniforms,Z=I.__cache;s.bindBuffer(s.UNIFORM_BUFFER,C);for(let D=0,O=E.length;D<O;D++){const Y=Array.isArray(E[D])?E[D]:[E[D]];for(let L=0,b=Y.length;L<b;L++){const V=Y[L];if(y(V,D,L,Z)===!0){const ae=V.__offset,ne=Array.isArray(V.value)?V.value:[V.value];let de=0;for(let pe=0;pe<ne.length;pe++){const oe=ne[pe],ce=w(oe);typeof oe=="number"||typeof oe=="boolean"?(V.__data[0]=oe,s.bufferSubData(s.UNIFORM_BUFFER,ae+de,V.__data)):oe.isMatrix3?(V.__data[0]=oe.elements[0],V.__data[1]=oe.elements[1],V.__data[2]=oe.elements[2],V.__data[3]=0,V.__data[4]=oe.elements[3],V.__data[5]=oe.elements[4],V.__data[6]=oe.elements[5],V.__data[7]=0,V.__data[8]=oe.elements[6],V.__data[9]=oe.elements[7],V.__data[10]=oe.elements[8],V.__data[11]=0):(oe.toArray(V.__data,de),de+=ce.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,ae,V.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function y(I,C,E,Z){const D=I.value,O=C+"_"+E;if(Z[O]===void 0)return typeof D=="number"||typeof D=="boolean"?Z[O]=D:Z[O]=D.clone(),!0;{const Y=Z[O];if(typeof D=="number"||typeof D=="boolean"){if(Y!==D)return Z[O]=D,!0}else if(Y.equals(D)===!1)return Y.copy(D),!0}return!1}function M(I){const C=I.uniforms;let E=0;const Z=16;for(let O=0,Y=C.length;O<Y;O++){const L=Array.isArray(C[O])?C[O]:[C[O]];for(let b=0,V=L.length;b<V;b++){const ae=L[b],ne=Array.isArray(ae.value)?ae.value:[ae.value];for(let de=0,pe=ne.length;de<pe;de++){const oe=ne[de],ce=w(oe),B=E%Z,le=B%ce.boundary,se=B+le;E+=le,se!==0&&Z-se<ce.storage&&(E+=Z-se),ae.__data=new Float32Array(ce.storage/Float32Array.BYTES_PER_ELEMENT),ae.__offset=E,E+=ce.storage}}}const D=E%Z;return D>0&&(E+=Z-D),I.__size=E,I.__cache={},this}function w(I){const C={boundary:0,storage:0};return typeof I=="number"||typeof I=="boolean"?(C.boundary=4,C.storage=4):I.isVector2?(C.boundary=8,C.storage=8):I.isVector3||I.isColor?(C.boundary=16,C.storage=12):I.isVector4?(C.boundary=16,C.storage=16):I.isMatrix3?(C.boundary=48,C.storage=48):I.isMatrix4?(C.boundary=64,C.storage=64):I.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",I),C}function S(I){const C=I.target;C.removeEventListener("dispose",S);const E=c.indexOf(C.__bindingPointIndex);c.splice(E,1),s.deleteBuffer(o[C.id]),delete o[C.id],delete a[C.id]}function x(){for(const I in o)s.deleteBuffer(o[I]);c=[],o={},a={}}return{bind:d,update:h,dispose:x}}class $w{constructor(e={}){const{canvas:t=zy(),context:i=null,depth:o=!0,stencil:a=!1,alpha:c=!1,antialias:u=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:h=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:g=!1,reverseDepthBuffer:v=!1}=e;this.isWebGLRenderer=!0;let y;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");y=i.getContextAttributes().alpha}else y=c;const M=new Uint32Array(4),w=new Int32Array(4);let S=null,x=null;const I=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=li,this.toneMapping=kr,this.toneMappingExposure=1;const E=this;let Z=!1,D=0,O=0,Y=null,L=-1,b=null;const V=new $t,ae=new $t;let ne=null;const de=new At(0);let pe=0,oe=t.width,ce=t.height,B=1,le=null,se=null;const F=new $t(0,0,oe,ce),ie=new $t(0,0,oe,ce);let Ne=!1;const J=new qv;let ue=!1,we=!1;const xe=new It,Ce=new It,Ue=new k,Qe=new $t,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let gt=!1;function Ft(){return Y===null?B:1}let j=i;function Rn(R,W){return t.getContext(R,W)}try{const R={alpha:!0,depth:o,stencil:a,antialias:u,premultipliedAlpha:d,preserveDrawingBuffer:h,powerPreference:m,failIfMajorPerformanceCaveat:g};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Qd}`),t.addEventListener("webglcontextlost",he,!1),t.addEventListener("webglcontextrestored",Ie,!1),t.addEventListener("webglcontextcreationerror",Le,!1),j===null){const W="webgl2";if(j=Rn(W,R),j===null)throw Rn(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let mt,dt,$e,bt,Ze,N,A,K,me,ve,fe,We,Re,Fe,ft,Me,ze,et,tt,ke,ht,st,Ct,G;function be(){mt=new t1(j),mt.init(),st=new Bw(j,mt),dt=new ZE(j,mt,e,st),$e=new Ow(j,mt),dt.reverseDepthBuffer&&v&&$e.buffers.depth.setReversed(!0),bt=new r1(j),Ze=new Mw,N=new kw(j,mt,$e,Ze,dt,st,bt),A=new KE(E),K=new e1(E),me=new fS(j),Ct=new YE(j,me),ve=new n1(j,me,bt,Ct),fe=new o1(j,ve,me,bt),tt=new s1(j,dt,N),Me=new $E(Ze),We=new Sw(E,A,K,mt,dt,Ct,Me),Re=new qw(E,Ze),Fe=new ww,ft=new Pw(mt),et=new jE(E,A,K,$e,fe,y,d),ze=new Uw(E,fe,dt),G=new Zw(j,bt,dt,$e),ke=new qE(j,mt,bt),ht=new i1(j,mt,bt),bt.programs=We.programs,E.capabilities=dt,E.extensions=mt,E.properties=Ze,E.renderLists=Fe,E.shadowMap=ze,E.state=$e,E.info=bt}be();const re=new jw(E,j);this.xr=re,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){const R=mt.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=mt.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(R){R!==void 0&&(B=R,this.setSize(oe,ce,!1))},this.getSize=function(R){return R.set(oe,ce)},this.setSize=function(R,W,ee=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}oe=R,ce=W,t.width=Math.floor(R*B),t.height=Math.floor(W*B),ee===!0&&(t.style.width=R+"px",t.style.height=W+"px"),this.setViewport(0,0,R,W)},this.getDrawingBufferSize=function(R){return R.set(oe*B,ce*B).floor()},this.setDrawingBufferSize=function(R,W,ee){oe=R,ce=W,B=ee,t.width=Math.floor(R*ee),t.height=Math.floor(W*ee),this.setViewport(0,0,R,W)},this.getCurrentViewport=function(R){return R.copy(V)},this.getViewport=function(R){return R.copy(F)},this.setViewport=function(R,W,ee,te){R.isVector4?F.set(R.x,R.y,R.z,R.w):F.set(R,W,ee,te),$e.viewport(V.copy(F).multiplyScalar(B).round())},this.getScissor=function(R){return R.copy(ie)},this.setScissor=function(R,W,ee,te){R.isVector4?ie.set(R.x,R.y,R.z,R.w):ie.set(R,W,ee,te),$e.scissor(ae.copy(ie).multiplyScalar(B).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(R){$e.setScissorTest(Ne=R)},this.setOpaqueSort=function(R){le=R},this.setTransparentSort=function(R){se=R},this.getClearColor=function(R){return R.copy(et.getClearColor())},this.setClearColor=function(){et.setClearColor.apply(et,arguments)},this.getClearAlpha=function(){return et.getClearAlpha()},this.setClearAlpha=function(){et.setClearAlpha.apply(et,arguments)},this.clear=function(R=!0,W=!0,ee=!0){let te=0;if(R){let X=!1;if(Y!==null){const Ae=Y.texture.format;X=Ae===oh||Ae===sh||Ae===rh}if(X){const Ae=Y.texture.type,Ee=Ae===sr||Ae===vs||Ae===ba||Ae===yo||Ae===th||Ae===nh,Xe=et.getClearColor(),He=et.getClearAlpha(),nt=Xe.r,rt=Xe.g,je=Xe.b;Ee?(M[0]=nt,M[1]=rt,M[2]=je,M[3]=He,j.clearBufferuiv(j.COLOR,0,M)):(w[0]=nt,w[1]=rt,w[2]=je,w[3]=He,j.clearBufferiv(j.COLOR,0,w))}else te|=j.COLOR_BUFFER_BIT}W&&(te|=j.DEPTH_BUFFER_BIT),ee&&(te|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j.clear(te)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",he,!1),t.removeEventListener("webglcontextrestored",Ie,!1),t.removeEventListener("webglcontextcreationerror",Le,!1),Fe.dispose(),ft.dispose(),Ze.dispose(),A.dispose(),K.dispose(),fe.dispose(),Ct.dispose(),G.dispose(),We.dispose(),re.dispose(),re.removeEventListener("sessionstart",Ms),re.removeEventListener("sessionend",ar),ki.stop()};function he(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),Z=!0}function Ie(){console.log("THREE.WebGLRenderer: Context Restored."),Z=!1;const R=bt.autoReset,W=ze.enabled,ee=ze.autoUpdate,te=ze.needsUpdate,X=ze.type;be(),bt.autoReset=R,ze.enabled=W,ze.autoUpdate=ee,ze.needsUpdate=te,ze.type=X}function Le(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function ot(R){const W=R.target;W.removeEventListener("dispose",ot),zt(W)}function zt(R){Qt(R),Ze.remove(R)}function Qt(R){const W=Ze.get(R).programs;W!==void 0&&(W.forEach(function(ee){We.releaseProgram(ee)}),R.isShaderMaterial&&We.releaseShaderCache(R))}this.renderBufferDirect=function(R,W,ee,te,X,Ae){W===null&&(W=Dt);const Ee=X.isMesh&&X.matrixWorld.determinant()<0,Xe=ka(R,W,ee,te,X);$e.setMaterial(te,Ee);let He=ee.index,nt=1;if(te.wireframe===!0){if(He=ve.getWireframeAttribute(ee),He===void 0)return;nt=2}const rt=ee.drawRange,je=ee.attributes.position;let _t=rt.start*nt,wt=(rt.start+rt.count)*nt;Ae!==null&&(_t=Math.max(_t,Ae.start*nt),wt=Math.min(wt,(Ae.start+Ae.count)*nt)),He!==null?(_t=Math.max(_t,0),wt=Math.min(wt,He.count)):je!=null&&(_t=Math.max(_t,0),wt=Math.min(wt,je.count));const vt=wt-_t;if(vt<0||vt===1/0)return;Ct.setup(X,te,Xe,ee,He);let vn,at=ke;if(He!==null&&(vn=me.get(He),at=ht,at.setIndex(vn)),X.isMesh)te.wireframe===!0?($e.setLineWidth(te.wireframeLinewidth*Ft()),at.setMode(j.LINES)):at.setMode(j.TRIANGLES);else if(X.isLine){let qe=te.linewidth;qe===void 0&&(qe=1),$e.setLineWidth(qe*Ft()),X.isLineSegments?at.setMode(j.LINES):X.isLineLoop?at.setMode(j.LINE_LOOP):at.setMode(j.LINE_STRIP)}else X.isPoints?at.setMode(j.POINTS):X.isSprite&&at.setMode(j.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)at.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(mt.get("WEBGL_multi_draw"))at.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const qe=X._multiDrawStarts,fi=X._multiDrawCounts,Mt=X._multiDrawCount,_n=He?me.get(He).bytesPerElement:1,di=Ze.get(te).currentProgram.getUniforms();for(let en=0;en<Mt;en++)di.setValue(j,"_gl_DrawID",en),at.render(qe[en]/_n,fi[en])}else if(X.isInstancedMesh)at.renderInstances(_t,vt,X.count);else if(ee.isInstancedBufferGeometry){const qe=ee._maxInstanceCount!==void 0?ee._maxInstanceCount:1/0,fi=Math.min(ee.instanceCount,qe);at.renderInstances(_t,vt,fi)}else at.render(_t,vt)};function xt(R,W,ee){R.transparent===!0&&R.side===Ei&&R.forceSinglePass===!1?(R.side=Xn,R.needsUpdate=!0,Es(R,W,ee),R.side=Br,R.needsUpdate=!0,Es(R,W,ee),R.side=Ei):Es(R,W,ee)}this.compile=function(R,W,ee=null){ee===null&&(ee=R),x=ft.get(ee),x.init(W),C.push(x),ee.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(x.pushLight(X),X.castShadow&&x.pushShadow(X))}),R!==ee&&R.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(x.pushLight(X),X.castShadow&&x.pushShadow(X))}),x.setupLights();const te=new Set;return R.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Ae=X.material;if(Ae)if(Array.isArray(Ae))for(let Ee=0;Ee<Ae.length;Ee++){const Xe=Ae[Ee];xt(Xe,ee,X),te.add(Xe)}else xt(Ae,ee,X),te.add(Ae)}),C.pop(),x=null,te},this.compileAsync=function(R,W,ee=null){const te=this.compile(R,W,ee);return new Promise(X=>{function Ae(){if(te.forEach(function(Ee){Ze.get(Ee).currentProgram.isReady()&&te.delete(Ee)}),te.size===0){X(R);return}setTimeout(Ae,10)}mt.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let Fn=null;function bn(R){Fn&&Fn(R)}function Ms(){ki.stop()}function ar(){ki.start()}const ki=new Zv;ki.setAnimationLoop(bn),typeof self<"u"&&ki.setContext(self),this.setAnimationLoop=function(R){Fn=R,re.setAnimationLoop(R),R===null?ki.stop():ki.start()},re.addEventListener("sessionstart",Ms),re.addEventListener("sessionend",ar),this.render=function(R,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(Z===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(W),W=re.getCamera()),R.isScene===!0&&R.onBeforeRender(E,R,W,Y),x=ft.get(R,C.length),x.init(W),C.push(x),Ce.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),J.setFromProjectionMatrix(Ce),we=this.localClippingEnabled,ue=Me.init(this.clippingPlanes,we),S=Fe.get(R,I.length),S.init(),I.push(S),re.enabled===!0&&re.isPresenting===!0){const Ae=E.xr.getDepthSensingMesh();Ae!==null&&Bi(Ae,W,-1/0,E.sortObjects)}Bi(R,W,0,E.sortObjects),S.finish(),E.sortObjects===!0&&S.sort(le,se),gt=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,gt&&et.addToRenderList(S,R),this.info.render.frame++,ue===!0&&Me.beginShadows();const ee=x.state.shadowsArray;ze.render(ee,R,W),ue===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset();const te=S.opaque,X=S.transmissive;if(x.setupLights(),W.isArrayCamera){const Ae=W.cameras;if(X.length>0)for(let Ee=0,Xe=Ae.length;Ee<Xe;Ee++){const He=Ae[Ee];Gr(te,X,R,He)}gt&&et.render(R);for(let Ee=0,Xe=Ae.length;Ee<Xe;Ee++){const He=Ae[Ee];Hr(S,R,He,He.viewport)}}else X.length>0&&Gr(te,X,R,W),gt&&et.render(R),Hr(S,R,W);Y!==null&&(N.updateMultisampleRenderTarget(Y),N.updateRenderTargetMipmap(Y)),R.isScene===!0&&R.onAfterRender(E,R,W),Ct.resetDefaultState(),L=-1,b=null,C.pop(),C.length>0?(x=C[C.length-1],ue===!0&&Me.setGlobalState(E.clippingPlanes,x.state.camera)):x=null,I.pop(),I.length>0?S=I[I.length-1]:S=null};function Bi(R,W,ee,te){if(R.visible===!1)return;if(R.layers.test(W.layers)){if(R.isGroup)ee=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(W);else if(R.isLight)x.pushLight(R),R.castShadow&&x.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||J.intersectsSprite(R)){te&&Qe.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Ce);const Ee=fe.update(R),Xe=R.material;Xe.visible&&S.push(R,Ee,Xe,ee,Qe.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||J.intersectsObject(R))){const Ee=fe.update(R),Xe=R.material;if(te&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Qe.copy(R.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Qe.copy(Ee.boundingSphere.center)),Qe.applyMatrix4(R.matrixWorld).applyMatrix4(Ce)),Array.isArray(Xe)){const He=Ee.groups;for(let nt=0,rt=He.length;nt<rt;nt++){const je=He[nt],_t=Xe[je.materialIndex];_t&&_t.visible&&S.push(R,Ee,_t,ee,Qe.z,je)}}else Xe.visible&&S.push(R,Ee,Xe,ee,Qe.z,null)}}const Ae=R.children;for(let Ee=0,Xe=Ae.length;Ee<Xe;Ee++)Bi(Ae[Ee],W,ee,te)}function Hr(R,W,ee,te){const X=R.opaque,Ae=R.transmissive,Ee=R.transparent;x.setupLightsView(ee),ue===!0&&Me.setGlobalState(E.clippingPlanes,ee),te&&$e.viewport(V.copy(te)),X.length>0&&lr(X,W,ee),Ae.length>0&&lr(Ae,W,ee),Ee.length>0&&lr(Ee,W,ee),$e.buffers.depth.setTest(!0),$e.buffers.depth.setMask(!0),$e.buffers.color.setMask(!0),$e.setPolygonOffset(!1)}function Gr(R,W,ee,te){if((ee.isScene===!0?ee.overrideMaterial:null)!==null)return;x.state.transmissionRenderTarget[te.id]===void 0&&(x.state.transmissionRenderTarget[te.id]=new _s(1,1,{generateMipmaps:!0,type:mt.has("EXT_color_buffer_half_float")||mt.has("EXT_color_buffer_float")?Ua:sr,minFilter:gs,samples:4,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:St.workingColorSpace}));const Ae=x.state.transmissionRenderTarget[te.id],Ee=te.viewport||V;Ae.setSize(Ee.z,Ee.w);const Xe=E.getRenderTarget();E.setRenderTarget(Ae),E.getClearColor(de),pe=E.getClearAlpha(),pe<1&&E.setClearColor(16777215,.5),E.clear(),gt&&et.render(ee);const He=E.toneMapping;E.toneMapping=kr;const nt=te.viewport;if(te.viewport!==void 0&&(te.viewport=void 0),x.setupLightsView(te),ue===!0&&Me.setGlobalState(E.clippingPlanes,te),lr(R,ee,te),N.updateMultisampleRenderTarget(Ae),N.updateRenderTargetMipmap(Ae),mt.has("WEBGL_multisampled_render_to_texture")===!1){let rt=!1;for(let je=0,_t=W.length;je<_t;je++){const wt=W[je],vt=wt.object,vn=wt.geometry,at=wt.material,qe=wt.group;if(at.side===Ei&&vt.layers.test(te.layers)){const fi=at.side;at.side=Xn,at.needsUpdate=!0,Oa(vt,ee,te,vn,at,qe),at.side=fi,at.needsUpdate=!0,rt=!0}}rt===!0&&(N.updateMultisampleRenderTarget(Ae),N.updateRenderTargetMipmap(Ae))}E.setRenderTarget(Xe),E.setClearColor(de,pe),nt!==void 0&&(te.viewport=nt),E.toneMapping=He}function lr(R,W,ee){const te=W.isScene===!0?W.overrideMaterial:null;for(let X=0,Ae=R.length;X<Ae;X++){const Ee=R[X],Xe=Ee.object,He=Ee.geometry,nt=te===null?Ee.material:te,rt=Ee.group;Xe.layers.test(ee.layers)&&Oa(Xe,W,ee,He,nt,rt)}}function Oa(R,W,ee,te,X,Ae){R.onBeforeRender(E,W,ee,te,X,Ae),R.modelViewMatrix.multiplyMatrices(ee.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),X.onBeforeRender(E,W,ee,te,R,Ae),X.transparent===!0&&X.side===Ei&&X.forceSinglePass===!1?(X.side=Xn,X.needsUpdate=!0,E.renderBufferDirect(ee,W,te,X,R,Ae),X.side=Br,X.needsUpdate=!0,E.renderBufferDirect(ee,W,te,X,R,Ae),X.side=Ei):E.renderBufferDirect(ee,W,te,X,R,Ae),R.onAfterRender(E,W,ee,te,X,Ae)}function Es(R,W,ee){W.isScene!==!0&&(W=Dt);const te=Ze.get(R),X=x.state.lights,Ae=x.state.shadowsArray,Ee=X.state.version,Xe=We.getParameters(R,X.state,Ae,W,ee),He=We.getProgramCacheKey(Xe);let nt=te.programs;te.environment=R.isMeshStandardMaterial?W.environment:null,te.fog=W.fog,te.envMap=(R.isMeshStandardMaterial?K:A).get(R.envMap||te.environment),te.envMapRotation=te.environment!==null&&R.envMap===null?W.environmentRotation:R.envMapRotation,nt===void 0&&(R.addEventListener("dispose",ot),nt=new Map,te.programs=nt);let rt=nt.get(He);if(rt!==void 0){if(te.currentProgram===rt&&te.lightsStateVersion===Ee)return Ci(R,Xe),rt}else Xe.uniforms=We.getUniforms(R),R.onBeforeCompile(Xe,E),rt=We.acquireProgram(Xe,He),nt.set(He,rt),te.uniforms=Xe.uniforms;const je=te.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(je.clippingPlanes=Me.uniform),Ci(R,Xe),te.needsLights=zc(R),te.lightsStateVersion=Ee,te.needsLights&&(je.ambientLightColor.value=X.state.ambient,je.lightProbe.value=X.state.probe,je.directionalLights.value=X.state.directional,je.directionalLightShadows.value=X.state.directionalShadow,je.spotLights.value=X.state.spot,je.spotLightShadows.value=X.state.spotShadow,je.rectAreaLights.value=X.state.rectArea,je.ltc_1.value=X.state.rectAreaLTC1,je.ltc_2.value=X.state.rectAreaLTC2,je.pointLights.value=X.state.point,je.pointLightShadows.value=X.state.pointShadow,je.hemisphereLights.value=X.state.hemi,je.directionalShadowMap.value=X.state.directionalShadowMap,je.directionalShadowMatrix.value=X.state.directionalShadowMatrix,je.spotShadowMap.value=X.state.spotShadowMap,je.spotLightMatrix.value=X.state.spotLightMatrix,je.spotLightMap.value=X.state.spotLightMap,je.pointShadowMap.value=X.state.pointShadowMap,je.pointShadowMatrix.value=X.state.pointShadowMatrix),te.currentProgram=rt,te.uniformsList=null,rt}function za(R){if(R.uniformsList===null){const W=R.currentProgram.getUniforms();R.uniformsList=Ac.seqWithValue(W.seq,R.uniforms)}return R.uniformsList}function Ci(R,W){const ee=Ze.get(R);ee.outputColorSpace=W.outputColorSpace,ee.batching=W.batching,ee.batchingColor=W.batchingColor,ee.instancing=W.instancing,ee.instancingColor=W.instancingColor,ee.instancingMorph=W.instancingMorph,ee.skinning=W.skinning,ee.morphTargets=W.morphTargets,ee.morphNormals=W.morphNormals,ee.morphColors=W.morphColors,ee.morphTargetsCount=W.morphTargetsCount,ee.numClippingPlanes=W.numClippingPlanes,ee.numIntersection=W.numClipIntersection,ee.vertexAlphas=W.vertexAlphas,ee.vertexTangents=W.vertexTangents,ee.toneMapping=W.toneMapping}function ka(R,W,ee,te,X){W.isScene!==!0&&(W=Dt),N.resetTextureUnits();const Ae=W.fog,Ee=te.isMeshStandardMaterial?W.environment:null,Xe=Y===null?E.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:To,He=(te.isMeshStandardMaterial?K:A).get(te.envMap||Ee),nt=te.vertexColors===!0&&!!ee.attributes.color&&ee.attributes.color.itemSize===4,rt=!!ee.attributes.tangent&&(!!te.normalMap||te.anisotropy>0),je=!!ee.morphAttributes.position,_t=!!ee.morphAttributes.normal,wt=!!ee.morphAttributes.color;let vt=kr;te.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(vt=E.toneMapping);const vn=ee.morphAttributes.position||ee.morphAttributes.normal||ee.morphAttributes.color,at=vn!==void 0?vn.length:0,qe=Ze.get(te),fi=x.state.lights;if(ue===!0&&(we===!0||R!==b)){const Pn=R===b&&te.id===L;Me.setState(te,R,Pn)}let Mt=!1;te.version===qe.__version?(qe.needsLights&&qe.lightsStateVersion!==fi.state.version||qe.outputColorSpace!==Xe||X.isBatchedMesh&&qe.batching===!1||!X.isBatchedMesh&&qe.batching===!0||X.isBatchedMesh&&qe.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&qe.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&qe.instancing===!1||!X.isInstancedMesh&&qe.instancing===!0||X.isSkinnedMesh&&qe.skinning===!1||!X.isSkinnedMesh&&qe.skinning===!0||X.isInstancedMesh&&qe.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&qe.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&qe.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&qe.instancingMorph===!1&&X.morphTexture!==null||qe.envMap!==He||te.fog===!0&&qe.fog!==Ae||qe.numClippingPlanes!==void 0&&(qe.numClippingPlanes!==Me.numPlanes||qe.numIntersection!==Me.numIntersection)||qe.vertexAlphas!==nt||qe.vertexTangents!==rt||qe.morphTargets!==je||qe.morphNormals!==_t||qe.morphColors!==wt||qe.toneMapping!==vt||qe.morphTargetsCount!==at)&&(Mt=!0):(Mt=!0,qe.__version=te.version);let _n=qe.currentProgram;Mt===!0&&(_n=Es(te,W,X));let di=!1,en=!1,Ri=!1;const Ut=_n.getUniforms(),Qn=qe.uniforms;if($e.useProgram(_n.program)&&(di=!0,en=!0,Ri=!0),te.id!==L&&(L=te.id,en=!0),di||b!==R){$e.buffers.depth.getReversed()?(xe.copy(R.projectionMatrix),By(xe),Vy(xe),Ut.setValue(j,"projectionMatrix",xe)):Ut.setValue(j,"projectionMatrix",R.projectionMatrix),Ut.setValue(j,"viewMatrix",R.matrixWorldInverse);const ei=Ut.map.cameraPosition;ei!==void 0&&ei.setValue(j,Ue.setFromMatrixPosition(R.matrixWorld)),dt.logarithmicDepthBuffer&&Ut.setValue(j,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(te.isMeshPhongMaterial||te.isMeshToonMaterial||te.isMeshLambertMaterial||te.isMeshBasicMaterial||te.isMeshStandardMaterial||te.isShaderMaterial)&&Ut.setValue(j,"isOrthographic",R.isOrthographicCamera===!0),b!==R&&(b=R,en=!0,Ri=!0)}if(X.isSkinnedMesh){Ut.setOptional(j,X,"bindMatrix"),Ut.setOptional(j,X,"bindMatrixInverse");const Pn=X.skeleton;Pn&&(Pn.boneTexture===null&&Pn.computeBoneTexture(),Ut.setValue(j,"boneTexture",Pn.boneTexture,N))}X.isBatchedMesh&&(Ut.setOptional(j,X,"batchingTexture"),Ut.setValue(j,"batchingTexture",X._matricesTexture,N),Ut.setOptional(j,X,"batchingIdTexture"),Ut.setValue(j,"batchingIdTexture",X._indirectTexture,N),Ut.setOptional(j,X,"batchingColorTexture"),X._colorsTexture!==null&&Ut.setValue(j,"batchingColorTexture",X._colorsTexture,N));const Vi=ee.morphAttributes;if((Vi.position!==void 0||Vi.normal!==void 0||Vi.color!==void 0)&&tt.update(X,ee,_n),(en||qe.receiveShadow!==X.receiveShadow)&&(qe.receiveShadow=X.receiveShadow,Ut.setValue(j,"receiveShadow",X.receiveShadow)),te.isMeshGouraudMaterial&&te.envMap!==null&&(Qn.envMap.value=He,Qn.flipEnvMap.value=He.isCubeTexture&&He.isRenderTargetTexture===!1?-1:1),te.isMeshStandardMaterial&&te.envMap===null&&W.environment!==null&&(Qn.envMapIntensity.value=W.environmentIntensity),en&&(Ut.setValue(j,"toneMappingExposure",E.toneMappingExposure),qe.needsLights&&Ba(Qn,Ri),Ae&&te.fog===!0&&Re.refreshFogUniforms(Qn,Ae),Re.refreshMaterialUniforms(Qn,te,B,ce,x.state.transmissionRenderTarget[R.id]),Ac.upload(j,za(qe),Qn,N)),te.isShaderMaterial&&te.uniformsNeedUpdate===!0&&(Ac.upload(j,za(qe),Qn,N),te.uniformsNeedUpdate=!1),te.isSpriteMaterial&&Ut.setValue(j,"center",X.center),Ut.setValue(j,"modelViewMatrix",X.modelViewMatrix),Ut.setValue(j,"normalMatrix",X.normalMatrix),Ut.setValue(j,"modelMatrix",X.matrixWorld),te.isShaderMaterial||te.isRawShaderMaterial){const Pn=te.uniformsGroups;for(let ei=0,On=Pn.length;ei<On;ei++){const Va=Pn[ei];G.update(Va,_n),G.bind(Va,_n)}}return _n}function Ba(R,W){R.ambientLightColor.needsUpdate=W,R.lightProbe.needsUpdate=W,R.directionalLights.needsUpdate=W,R.directionalLightShadows.needsUpdate=W,R.pointLights.needsUpdate=W,R.pointLightShadows.needsUpdate=W,R.spotLights.needsUpdate=W,R.spotLightShadows.needsUpdate=W,R.rectAreaLights.needsUpdate=W,R.hemisphereLights.needsUpdate=W}function zc(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return Y},this.setRenderTargetTextures=function(R,W,ee){Ze.get(R.texture).__webglTexture=W,Ze.get(R.depthTexture).__webglTexture=ee;const te=Ze.get(R);te.__hasExternalTextures=!0,te.__autoAllocateDepthBuffer=ee===void 0,te.__autoAllocateDepthBuffer||mt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),te.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,W){const ee=Ze.get(R);ee.__webglFramebuffer=W,ee.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(R,W=0,ee=0){Y=R,D=W,O=ee;let te=!0,X=null,Ae=!1,Ee=!1;if(R){const He=Ze.get(R);if(He.__useDefaultFramebuffer!==void 0)$e.bindFramebuffer(j.FRAMEBUFFER,null),te=!1;else if(He.__webglFramebuffer===void 0)N.setupRenderTarget(R);else if(He.__hasExternalTextures)N.rebindTextures(R,Ze.get(R.texture).__webglTexture,Ze.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const je=R.depthTexture;if(He.__boundDepthTexture!==je){if(je!==null&&Ze.has(je)&&(R.width!==je.image.width||R.height!==je.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");N.setupDepthRenderbuffer(R)}}const nt=R.texture;(nt.isData3DTexture||nt.isDataArrayTexture||nt.isCompressedArrayTexture)&&(Ee=!0);const rt=Ze.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(rt[W])?X=rt[W][ee]:X=rt[W],Ae=!0):R.samples>0&&N.useMultisampledRTT(R)===!1?X=Ze.get(R).__webglMultisampledFramebuffer:Array.isArray(rt)?X=rt[ee]:X=rt,V.copy(R.viewport),ae.copy(R.scissor),ne=R.scissorTest}else V.copy(F).multiplyScalar(B).floor(),ae.copy(ie).multiplyScalar(B).floor(),ne=Ne;if($e.bindFramebuffer(j.FRAMEBUFFER,X)&&te&&$e.drawBuffers(R,X),$e.viewport(V),$e.scissor(ae),$e.setScissorTest(ne),Ae){const He=Ze.get(R.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+W,He.__webglTexture,ee)}else if(Ee){const He=Ze.get(R.texture),nt=W||0;j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,He.__webglTexture,ee||0,nt)}L=-1},this.readRenderTargetPixels=function(R,W,ee,te,X,Ae,Ee){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Xe=Ze.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ee!==void 0&&(Xe=Xe[Ee]),Xe){$e.bindFramebuffer(j.FRAMEBUFFER,Xe);try{const He=R.texture,nt=He.format,rt=He.type;if(!dt.textureFormatReadable(nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!dt.textureTypeReadable(rt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=R.width-te&&ee>=0&&ee<=R.height-X&&j.readPixels(W,ee,te,X,st.convert(nt),st.convert(rt),Ae)}finally{const He=Y!==null?Ze.get(Y).__webglFramebuffer:null;$e.bindFramebuffer(j.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(R,W,ee,te,X,Ae,Ee){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Xe=Ze.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ee!==void 0&&(Xe=Xe[Ee]),Xe){const He=R.texture,nt=He.format,rt=He.type;if(!dt.textureFormatReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!dt.textureTypeReadable(rt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=R.width-te&&ee>=0&&ee<=R.height-X){$e.bindFramebuffer(j.FRAMEBUFFER,Xe);const je=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,je),j.bufferData(j.PIXEL_PACK_BUFFER,Ae.byteLength,j.STREAM_READ),j.readPixels(W,ee,te,X,st.convert(nt),st.convert(rt),0);const _t=Y!==null?Ze.get(Y).__webglFramebuffer:null;$e.bindFramebuffer(j.FRAMEBUFFER,_t);const wt=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await ky(j,wt,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,je),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,Ae),j.deleteBuffer(je),j.deleteSync(wt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,W=null,ee=0){R.isTexture!==!0&&(Sa("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,R=arguments[1]);const te=Math.pow(2,-ee),X=Math.floor(R.image.width*te),Ae=Math.floor(R.image.height*te),Ee=W!==null?W.x:0,Xe=W!==null?W.y:0;N.setTexture2D(R,0),j.copyTexSubImage2D(j.TEXTURE_2D,ee,0,0,Ee,Xe,X,Ae),$e.unbindTexture()},this.copyTextureToTexture=function(R,W,ee=null,te=null,X=0){R.isTexture!==!0&&(Sa("WebGLRenderer: copyTextureToTexture function signature has changed."),te=arguments[0]||null,R=arguments[1],W=arguments[2],X=arguments[3]||0,ee=null);let Ae,Ee,Xe,He,nt,rt,je,_t,wt;const vt=R.isCompressedTexture?R.mipmaps[X]:R.image;ee!==null?(Ae=ee.max.x-ee.min.x,Ee=ee.max.y-ee.min.y,Xe=ee.isBox3?ee.max.z-ee.min.z:1,He=ee.min.x,nt=ee.min.y,rt=ee.isBox3?ee.min.z:0):(Ae=vt.width,Ee=vt.height,Xe=vt.depth||1,He=0,nt=0,rt=0),te!==null?(je=te.x,_t=te.y,wt=te.z):(je=0,_t=0,wt=0);const vn=st.convert(W.format),at=st.convert(W.type);let qe;W.isData3DTexture?(N.setTexture3D(W,0),qe=j.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(N.setTexture2DArray(W,0),qe=j.TEXTURE_2D_ARRAY):(N.setTexture2D(W,0),qe=j.TEXTURE_2D),j.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,W.flipY),j.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),j.pixelStorei(j.UNPACK_ALIGNMENT,W.unpackAlignment);const fi=j.getParameter(j.UNPACK_ROW_LENGTH),Mt=j.getParameter(j.UNPACK_IMAGE_HEIGHT),_n=j.getParameter(j.UNPACK_SKIP_PIXELS),di=j.getParameter(j.UNPACK_SKIP_ROWS),en=j.getParameter(j.UNPACK_SKIP_IMAGES);j.pixelStorei(j.UNPACK_ROW_LENGTH,vt.width),j.pixelStorei(j.UNPACK_IMAGE_HEIGHT,vt.height),j.pixelStorei(j.UNPACK_SKIP_PIXELS,He),j.pixelStorei(j.UNPACK_SKIP_ROWS,nt),j.pixelStorei(j.UNPACK_SKIP_IMAGES,rt);const Ri=R.isDataArrayTexture||R.isData3DTexture,Ut=W.isDataArrayTexture||W.isData3DTexture;if(R.isRenderTargetTexture||R.isDepthTexture){const Qn=Ze.get(R),Vi=Ze.get(W),Pn=Ze.get(Qn.__renderTarget),ei=Ze.get(Vi.__renderTarget);$e.bindFramebuffer(j.READ_FRAMEBUFFER,Pn.__webglFramebuffer),$e.bindFramebuffer(j.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let On=0;On<Xe;On++)Ri&&j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Ze.get(R).__webglTexture,X,rt+On),R.isDepthTexture?(Ut&&j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Ze.get(W).__webglTexture,X,wt+On),j.blitFramebuffer(He,nt,Ae,Ee,je,_t,Ae,Ee,j.DEPTH_BUFFER_BIT,j.NEAREST)):Ut?j.copyTexSubImage3D(qe,X,je,_t,wt+On,He,nt,Ae,Ee):j.copyTexSubImage2D(qe,X,je,_t,wt+On,He,nt,Ae,Ee);$e.bindFramebuffer(j.READ_FRAMEBUFFER,null),$e.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else Ut?R.isDataTexture||R.isData3DTexture?j.texSubImage3D(qe,X,je,_t,wt,Ae,Ee,Xe,vn,at,vt.data):W.isCompressedArrayTexture?j.compressedTexSubImage3D(qe,X,je,_t,wt,Ae,Ee,Xe,vn,vt.data):j.texSubImage3D(qe,X,je,_t,wt,Ae,Ee,Xe,vn,at,vt):R.isDataTexture?j.texSubImage2D(j.TEXTURE_2D,X,je,_t,Ae,Ee,vn,at,vt.data):R.isCompressedTexture?j.compressedTexSubImage2D(j.TEXTURE_2D,X,je,_t,vt.width,vt.height,vn,vt.data):j.texSubImage2D(j.TEXTURE_2D,X,je,_t,Ae,Ee,vn,at,vt);j.pixelStorei(j.UNPACK_ROW_LENGTH,fi),j.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Mt),j.pixelStorei(j.UNPACK_SKIP_PIXELS,_n),j.pixelStorei(j.UNPACK_SKIP_ROWS,di),j.pixelStorei(j.UNPACK_SKIP_IMAGES,en),X===0&&W.generateMipmaps&&j.generateMipmap(qe),$e.unbindTexture()},this.copyTextureToTexture3D=function(R,W,ee=null,te=null,X=0){return R.isTexture!==!0&&(Sa("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ee=arguments[0]||null,te=arguments[1]||null,R=arguments[2],W=arguments[3],X=arguments[4]||0),Sa('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(R,W,ee,te,X)},this.initRenderTarget=function(R){Ze.get(R).__webglFramebuffer===void 0&&N.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?N.setTextureCube(R,0):R.isData3DTexture?N.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?N.setTexture2DArray(R,0):N.setTexture2D(R,0),$e.unbindTexture()},this.resetState=function(){D=0,O=0,Y=null,$e.reset(),Ct.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ir}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=St._getDrawingBufferColorSpace(e),t.unpackColorSpace=St._getUnpackColorSpace()}}class Kw extends Un{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new or,this.environmentIntensity=1,this.environmentRotation=new or,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Jw{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=jd,this.updateRanges=[],this.version=0,this.uuid=Oi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let o=0,a=this.stride;o<a;o++)this.array[e+o]=t.array[i+o];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Dn=new k;class bc{constructor(e,t,i,o=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=o}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Dn.fromBufferAttribute(this,t),Dn.applyMatrix4(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Dn.fromBufferAttribute(this,t),Dn.applyNormalMatrix(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Dn.fromBufferAttribute(this,t),Dn.transformDirection(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=wi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Lt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=wi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=wi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=wi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=wi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=o,this}setXYZW(e,t,i,o,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array),a=Lt(a,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=o,this.data.array[e+3]=a,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const o=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)t.push(this.data.array[o+a])}return new Cn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new bc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const o=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)t.push(this.data.array[o+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class n0 extends Ro{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new At(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let oo;const pa=new k,ao=new k,lo=new k,co=new Be,ma=new Be,i0=new It,uc=new k,ga=new k,fc=new k,Kg=new Be,ed=new Be,Jg=new Be;class Qw extends Un{constructor(e=new n0){if(super(),this.isSprite=!0,this.type="Sprite",oo===void 0){oo=new Wt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Jw(t,5);oo.setIndex([0,1,2,0,2,3]),oo.setAttribute("position",new bc(i,3,0,!1)),oo.setAttribute("uv",new bc(i,2,3,!1))}this.geometry=oo,this.material=e,this.center=new Be(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ao.setFromMatrixScale(this.matrixWorld),i0.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),lo.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ao.multiplyScalar(-lo.z);const i=this.material.rotation;let o,a;i!==0&&(a=Math.cos(i),o=Math.sin(i));const c=this.center;dc(uc.set(-.5,-.5,0),lo,c,ao,o,a),dc(ga.set(.5,-.5,0),lo,c,ao,o,a),dc(fc.set(.5,.5,0),lo,c,ao,o,a),Kg.set(0,0),ed.set(1,0),Jg.set(1,1);let u=e.ray.intersectTriangle(uc,ga,fc,!1,pa);if(u===null&&(dc(ga.set(-.5,.5,0),lo,c,ao,o,a),ed.set(0,1),u=e.ray.intersectTriangle(uc,fc,ga,!1,pa),u===null))return;const d=e.ray.origin.distanceTo(pa);d<e.near||d>e.far||t.push({distance:d,point:pa.clone(),uv:ci.getInterpolation(pa,uc,ga,fc,Kg,ed,Jg,new Be),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function dc(s,e,t,i,o,a){co.subVectors(s,t).addScalar(.5).multiply(i),o!==void 0?(ma.x=a*co.x-o*co.y,ma.y=o*co.x+a*co.y):ma.copy(co),s.copy(e),s.x+=ma.x,s.y+=ma.y,s.applyMatrix4(i0)}class eT extends An{constructor(e=null,t=1,i=1,o,a,c,u,d,h=Jn,m=Jn,g,v){super(null,c,u,d,h,m,o,a,g,v),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Qg extends Cn{constructor(e,t,i,o=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=o}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const uo=new It,ev=new It,hc=[],tv=new Ss,tT=new It,va=new gn,_a=new Co;class nv extends gn{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Qg(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let o=0;o<i;o++)this.setMatrixAt(o,tT)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ss),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,uo),tv.copy(e.boundingBox).applyMatrix4(uo),this.boundingBox.union(tv)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Co),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,uo),_a.copy(e.boundingSphere).applyMatrix4(uo),this.boundingSphere.union(_a)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,o=this.morphTexture.source.data.data,a=i.length+1,c=e*a+1;for(let u=0;u<i.length;u++)i[u]=o[c+u]}raycast(e,t){const i=this.matrixWorld,o=this.count;if(va.geometry=this.geometry,va.material=this.material,va.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_a.copy(this.boundingSphere),_a.applyMatrix4(i),e.ray.intersectsSphere(_a)!==!1))for(let a=0;a<o;a++){this.getMatrixAt(a,uo),ev.multiplyMatrices(i,uo),va.matrixWorld=ev,va.raycast(e,hc);for(let c=0,u=hc.length;c<u;c++){const d=hc[c];d.instanceId=a,d.object=this,t.push(d)}hc.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Qg(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,o=i.length+1;this.morphTexture===null&&(this.morphTexture=new eT(new Float32Array(o*this.count),o,this.count,ih,Ni));const a=this.morphTexture.source.data.data;let c=0;for(let h=0;h<i.length;h++)c+=i[h];const u=this.geometry.morphTargetsRelative?1:1-c,d=o*e;a[d]=u,a.set(i,d+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class fs extends Ro{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new At(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Pc=new k,Lc=new k,iv=new It,xa=new lh,pc=new Co,td=new k,rv=new k;class Ea extends Un{constructor(e=new Wt,t=new fs){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let o=1,a=t.count;o<a;o++)Pc.fromBufferAttribute(t,o-1),Lc.fromBufferAttribute(t,o),i[o]=i[o-1],i[o]+=Pc.distanceTo(Lc);e.setAttribute("lineDistance",new qt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,o=this.matrixWorld,a=e.params.Line.threshold,c=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),pc.copy(i.boundingSphere),pc.applyMatrix4(o),pc.radius+=a,e.ray.intersectsSphere(pc)===!1)return;iv.copy(o).invert(),xa.copy(e.ray).applyMatrix4(iv);const u=a/((this.scale.x+this.scale.y+this.scale.z)/3),d=u*u,h=this.isLineSegments?2:1,m=i.index,v=i.attributes.position;if(m!==null){const y=Math.max(0,c.start),M=Math.min(m.count,c.start+c.count);for(let w=y,S=M-1;w<S;w+=h){const x=m.getX(w),I=m.getX(w+1),C=mc(this,e,xa,d,x,I);C&&t.push(C)}if(this.isLineLoop){const w=m.getX(M-1),S=m.getX(y),x=mc(this,e,xa,d,w,S);x&&t.push(x)}}else{const y=Math.max(0,c.start),M=Math.min(v.count,c.start+c.count);for(let w=y,S=M-1;w<S;w+=h){const x=mc(this,e,xa,d,w,w+1);x&&t.push(x)}if(this.isLineLoop){const w=mc(this,e,xa,d,M-1,y);w&&t.push(w)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const o=t[i[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=o.length;a<c;a++){const u=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=a}}}}}function mc(s,e,t,i,o,a){const c=s.geometry.attributes.position;if(Pc.fromBufferAttribute(c,o),Lc.fromBufferAttribute(c,a),t.distanceSqToSegment(Pc,Lc,td,rv)>i)return;td.applyMatrix4(s.matrixWorld);const d=e.ray.origin.distanceTo(td);if(!(d<e.near||d>e.far))return{distance:d,point:rv.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const sv=new k,ov=new k;class gc extends Ea{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let o=0,a=t.count;o<a;o+=2)sv.fromBufferAttribute(t,o),ov.fromBufferAttribute(t,o+1),i[o]=o===0?0:i[o-1],i[o+1]=i[o]+sv.distanceTo(ov);e.setAttribute("lineDistance",new qt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class nT extends An{constructor(e,t,i,o,a,c,u,d,h){super(e,t,i,o,a,c,u,d,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class zi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,o=this.getPoint(0),a=0;t.push(0);for(let c=1;c<=e;c++)i=this.getPoint(c/e),a+=i.distanceTo(o),t.push(a),o=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let o=0;const a=i.length;let c;t?c=t:c=e*i[a-1];let u=0,d=a-1,h;for(;u<=d;)if(o=Math.floor(u+(d-u)/2),h=i[o]-c,h<0)u=o+1;else if(h>0)d=o-1;else{d=o;break}if(o=d,i[o]===c)return o/(a-1);const m=i[o],v=i[o+1]-m,y=(c-m)/v;return(o+y)/(a-1)}getTangent(e,t){let o=e-1e-4,a=e+1e-4;o<0&&(o=0),a>1&&(a=1);const c=this.getPoint(o),u=this.getPoint(a),d=t||(c.isVector2?new Be:new k);return d.copy(u).sub(c).normalize(),d}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new k,o=[],a=[],c=[],u=new k,d=new It;for(let y=0;y<=e;y++){const M=y/e;o[y]=this.getTangentAt(M,new k)}a[0]=new k,c[0]=new k;let h=Number.MAX_VALUE;const m=Math.abs(o[0].x),g=Math.abs(o[0].y),v=Math.abs(o[0].z);m<=h&&(h=m,i.set(1,0,0)),g<=h&&(h=g,i.set(0,1,0)),v<=h&&i.set(0,0,1),u.crossVectors(o[0],i).normalize(),a[0].crossVectors(o[0],u),c[0].crossVectors(o[0],a[0]);for(let y=1;y<=e;y++){if(a[y]=a[y-1].clone(),c[y]=c[y-1].clone(),u.crossVectors(o[y-1],o[y]),u.length()>Number.EPSILON){u.normalize();const M=Math.acos(mn(o[y-1].dot(o[y]),-1,1));a[y].applyMatrix4(d.makeRotationAxis(u,M))}c[y].crossVectors(o[y],a[y])}if(t===!0){let y=Math.acos(mn(a[0].dot(a[e]),-1,1));y/=e,o[0].dot(u.crossVectors(a[0],a[e]))>0&&(y=-y);for(let M=1;M<=e;M++)a[M].applyMatrix4(d.makeRotationAxis(o[M],y*M)),c[M].crossVectors(o[M],a[M])}return{tangents:o,normals:a,binormals:c}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class fh extends zi{constructor(e=0,t=0,i=1,o=1,a=0,c=Math.PI*2,u=!1,d=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=o,this.aStartAngle=a,this.aEndAngle=c,this.aClockwise=u,this.aRotation=d}getPoint(e,t=new Be){const i=t,o=Math.PI*2;let a=this.aEndAngle-this.aStartAngle;const c=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=o;for(;a>o;)a-=o;a<Number.EPSILON&&(c?a=0:a=o),this.aClockwise===!0&&!c&&(a===o?a=-o:a=a-o);const u=this.aStartAngle+e*a;let d=this.aX+this.xRadius*Math.cos(u),h=this.aY+this.yRadius*Math.sin(u);if(this.aRotation!==0){const m=Math.cos(this.aRotation),g=Math.sin(this.aRotation),v=d-this.aX,y=h-this.aY;d=v*m-y*g+this.aX,h=v*g+y*m+this.aY}return i.set(d,h)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class iT extends fh{constructor(e,t,i,o,a,c){super(e,t,i,i,o,a,c),this.isArcCurve=!0,this.type="ArcCurve"}}function dh(){let s=0,e=0,t=0,i=0;function o(a,c,u,d){s=a,e=u,t=-3*a+3*c-2*u-d,i=2*a-2*c+u+d}return{initCatmullRom:function(a,c,u,d,h){o(c,u,h*(u-a),h*(d-c))},initNonuniformCatmullRom:function(a,c,u,d,h,m,g){let v=(c-a)/h-(u-a)/(h+m)+(u-c)/m,y=(u-c)/m-(d-c)/(m+g)+(d-u)/g;v*=m,y*=m,o(c,u,v,y)},calc:function(a){const c=a*a,u=c*a;return s+e*a+t*c+i*u}}}const vc=new k,nd=new dh,id=new dh,rd=new dh;class rT extends zi{constructor(e=[],t=!1,i="centripetal",o=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=o}getPoint(e,t=new k){const i=t,o=this.points,a=o.length,c=(a-(this.closed?0:1))*e;let u=Math.floor(c),d=c-u;this.closed?u+=u>0?0:(Math.floor(Math.abs(u)/a)+1)*a:d===0&&u===a-1&&(u=a-2,d=1);let h,m;this.closed||u>0?h=o[(u-1)%a]:(vc.subVectors(o[0],o[1]).add(o[0]),h=vc);const g=o[u%a],v=o[(u+1)%a];if(this.closed||u+2<a?m=o[(u+2)%a]:(vc.subVectors(o[a-1],o[a-2]).add(o[a-1]),m=vc),this.curveType==="centripetal"||this.curveType==="chordal"){const y=this.curveType==="chordal"?.5:.25;let M=Math.pow(h.distanceToSquared(g),y),w=Math.pow(g.distanceToSquared(v),y),S=Math.pow(v.distanceToSquared(m),y);w<1e-4&&(w=1),M<1e-4&&(M=w),S<1e-4&&(S=w),nd.initNonuniformCatmullRom(h.x,g.x,v.x,m.x,M,w,S),id.initNonuniformCatmullRom(h.y,g.y,v.y,m.y,M,w,S),rd.initNonuniformCatmullRom(h.z,g.z,v.z,m.z,M,w,S)}else this.curveType==="catmullrom"&&(nd.initCatmullRom(h.x,g.x,v.x,m.x,this.tension),id.initCatmullRom(h.y,g.y,v.y,m.y,this.tension),rd.initCatmullRom(h.z,g.z,v.z,m.z,this.tension));return i.set(nd.calc(d),id.calc(d),rd.calc(d)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(o.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const o=this.points[t];e.points.push(o.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(new k().fromArray(o))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function av(s,e,t,i,o){const a=(i-e)*.5,c=(o-t)*.5,u=s*s,d=s*u;return(2*t-2*i+a+c)*d+(-3*t+3*i-2*a-c)*u+a*s+t}function sT(s,e){const t=1-s;return t*t*e}function oT(s,e){return 2*(1-s)*s*e}function aT(s,e){return s*s*e}function Aa(s,e,t,i){return sT(s,e)+oT(s,t)+aT(s,i)}function lT(s,e){const t=1-s;return t*t*t*e}function cT(s,e){const t=1-s;return 3*t*t*s*e}function uT(s,e){return 3*(1-s)*s*s*e}function fT(s,e){return s*s*s*e}function Ca(s,e,t,i,o){return lT(s,e)+cT(s,t)+uT(s,i)+fT(s,o)}class r0 extends zi{constructor(e=new Be,t=new Be,i=new Be,o=new Be){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=o}getPoint(e,t=new Be){const i=t,o=this.v0,a=this.v1,c=this.v2,u=this.v3;return i.set(Ca(e,o.x,a.x,c.x,u.x),Ca(e,o.y,a.y,c.y,u.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class dT extends zi{constructor(e=new k,t=new k,i=new k,o=new k){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=o}getPoint(e,t=new k){const i=t,o=this.v0,a=this.v1,c=this.v2,u=this.v3;return i.set(Ca(e,o.x,a.x,c.x,u.x),Ca(e,o.y,a.y,c.y,u.y),Ca(e,o.z,a.z,c.z,u.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class s0 extends zi{constructor(e=new Be,t=new Be){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Be){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Be){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class hT extends zi{constructor(e=new k,t=new k){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new k){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new k){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class o0 extends zi{constructor(e=new Be,t=new Be,i=new Be){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Be){const i=t,o=this.v0,a=this.v1,c=this.v2;return i.set(Aa(e,o.x,a.x,c.x),Aa(e,o.y,a.y,c.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class pT extends zi{constructor(e=new k,t=new k,i=new k){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new k){const i=t,o=this.v0,a=this.v1,c=this.v2;return i.set(Aa(e,o.x,a.x,c.x),Aa(e,o.y,a.y,c.y),Aa(e,o.z,a.z,c.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class a0 extends zi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Be){const i=t,o=this.points,a=(o.length-1)*e,c=Math.floor(a),u=a-c,d=o[c===0?c:c-1],h=o[c],m=o[c>o.length-2?o.length-1:c+1],g=o[c>o.length-3?o.length-1:c+2];return i.set(av(u,d.x,h.x,m.x,g.x),av(u,d.y,h.y,m.y,g.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const o=this.points[t];e.points.push(o.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(new Be().fromArray(o))}return this}}var lv=Object.freeze({__proto__:null,ArcCurve:iT,CatmullRomCurve3:rT,CubicBezierCurve:r0,CubicBezierCurve3:dT,EllipseCurve:fh,LineCurve:s0,LineCurve3:hT,QuadraticBezierCurve:o0,QuadraticBezierCurve3:pT,SplineCurve:a0});class mT extends zi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new lv[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),o=this.getCurveLengths();let a=0;for(;a<o.length;){if(o[a]>=i){const c=o[a]-i,u=this.curves[a],d=u.getLength(),h=d===0?0:1-c/d;return u.getPointAt(h,t)}a++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,o=this.curves.length;i<o;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let o=0,a=this.curves;o<a.length;o++){const c=a[o],u=c.isEllipseCurve?e*2:c.isLineCurve||c.isLineCurve3?1:c.isSplineCurve?e*c.points.length:e,d=c.getPoints(u);for(let h=0;h<d.length;h++){const m=d[h];i&&i.equals(m)||(t.push(m),i=m)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const o=e.curves[t];this.curves.push(o.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const o=this.curves[t];e.curves.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const o=e.curves[t];this.curves.push(new lv[o.type]().fromJSON(o))}return this}}class cv extends mT{constructor(e){super(),this.type="Path",this.currentPoint=new Be,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new s0(this.currentPoint.clone(),new Be(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,o){const a=new o0(this.currentPoint.clone(),new Be(e,t),new Be(i,o));return this.curves.push(a),this.currentPoint.set(i,o),this}bezierCurveTo(e,t,i,o,a,c){const u=new r0(this.currentPoint.clone(),new Be(e,t),new Be(i,o),new Be(a,c));return this.curves.push(u),this.currentPoint.set(a,c),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new a0(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,o,a,c){const u=this.currentPoint.x,d=this.currentPoint.y;return this.absarc(e+u,t+d,i,o,a,c),this}absarc(e,t,i,o,a,c){return this.absellipse(e,t,i,i,o,a,c),this}ellipse(e,t,i,o,a,c,u,d){const h=this.currentPoint.x,m=this.currentPoint.y;return this.absellipse(e+h,t+m,i,o,a,c,u,d),this}absellipse(e,t,i,o,a,c,u,d){const h=new fh(e,t,i,o,a,c,u,d);if(this.curves.length>0){const g=h.getPoint(0);g.equals(this.currentPoint)||this.lineTo(g.x,g.y)}this.curves.push(h);const m=h.getPoint(1);return this.currentPoint.copy(m),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Eo extends Wt{constructor(e=1,t=32,i=0,o=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:o},t=Math.max(3,t);const a=[],c=[],u=[],d=[],h=new k,m=new Be;c.push(0,0,0),u.push(0,0,1),d.push(.5,.5);for(let g=0,v=3;g<=t;g++,v+=3){const y=i+g/t*o;h.x=e*Math.cos(y),h.y=e*Math.sin(y),c.push(h.x,h.y,h.z),u.push(0,0,1),m.x=(c[v]/e+1)/2,m.y=(c[v+1]/e+1)/2,d.push(m.x,m.y)}for(let g=1;g<=t;g++)a.push(g,g+1,0);this.setIndex(a),this.setAttribute("position",new qt(c,3)),this.setAttribute("normal",new qt(u,3)),this.setAttribute("uv",new qt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Eo(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class l0 extends cv{constructor(e){super(e),this.uuid=Oi(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,o=this.holes.length;i<o;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const o=e.holes[t];this.holes.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const o=this.holes[t];e.holes.push(o.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const o=e.holes[t];this.holes.push(new cv().fromJSON(o))}return this}}const gT={triangulate:function(s,e,t=2){const i=e&&e.length,o=i?e[0]*t:s.length;let a=c0(s,0,o,t,!0);const c=[];if(!a||a.next===a.prev)return c;let u,d,h,m,g,v,y;if(i&&(a=ST(s,e,a,t)),s.length>80*t){u=h=s[0],d=m=s[1];for(let M=t;M<o;M+=t)g=s[M],v=s[M+1],g<u&&(u=g),v<d&&(d=v),g>h&&(h=g),v>m&&(m=v);y=Math.max(h-u,m-d),y=y!==0?32767/y:0}return La(a,c,t,u,d,y,0),c}};function c0(s,e,t,i,o){let a,c;if(o===IT(s,e,t,i)>0)for(a=e;a<t;a+=i)c=uv(a,s[a],s[a+1],c);else for(a=t-i;a>=e;a-=i)c=uv(a,s[a],s[a+1],c);return c&&Oc(c,c.next)&&(Da(c),c=c.next),c}function ys(s,e){if(!s)return s;e||(e=s);let t=s,i;do if(i=!1,!t.steiner&&(Oc(t,t.next)||Xt(t.prev,t,t.next)===0)){if(Da(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function La(s,e,t,i,o,a,c){if(!s)return;!c&&a&&AT(s,i,o,a);let u=s,d,h;for(;s.prev!==s.next;){if(d=s.prev,h=s.next,a?_T(s,i,o,a):vT(s)){e.push(d.i/t|0),e.push(s.i/t|0),e.push(h.i/t|0),Da(s),s=h.next,u=h.next;continue}if(s=h,s===u){c?c===1?(s=xT(ys(s),e,t),La(s,e,t,i,o,a,2)):c===2&&yT(s,e,t,i,o,a):La(ys(s),e,t,i,o,a,1);break}}}function vT(s){const e=s.prev,t=s,i=s.next;if(Xt(e,t,i)>=0)return!1;const o=e.x,a=t.x,c=i.x,u=e.y,d=t.y,h=i.y,m=o<a?o<c?o:c:a<c?a:c,g=u<d?u<h?u:h:d<h?d:h,v=o>a?o>c?o:c:a>c?a:c,y=u>d?u>h?u:h:d>h?d:h;let M=i.next;for(;M!==e;){if(M.x>=m&&M.x<=v&&M.y>=g&&M.y<=y&&ho(o,u,a,d,c,h,M.x,M.y)&&Xt(M.prev,M,M.next)>=0)return!1;M=M.next}return!0}function _T(s,e,t,i){const o=s.prev,a=s,c=s.next;if(Xt(o,a,c)>=0)return!1;const u=o.x,d=a.x,h=c.x,m=o.y,g=a.y,v=c.y,y=u<d?u<h?u:h:d<h?d:h,M=m<g?m<v?m:v:g<v?g:v,w=u>d?u>h?u:h:d>h?d:h,S=m>g?m>v?m:v:g>v?g:v,x=qd(y,M,e,t,i),I=qd(w,S,e,t,i);let C=s.prevZ,E=s.nextZ;for(;C&&C.z>=x&&E&&E.z<=I;){if(C.x>=y&&C.x<=w&&C.y>=M&&C.y<=S&&C!==o&&C!==c&&ho(u,m,d,g,h,v,C.x,C.y)&&Xt(C.prev,C,C.next)>=0||(C=C.prevZ,E.x>=y&&E.x<=w&&E.y>=M&&E.y<=S&&E!==o&&E!==c&&ho(u,m,d,g,h,v,E.x,E.y)&&Xt(E.prev,E,E.next)>=0))return!1;E=E.nextZ}for(;C&&C.z>=x;){if(C.x>=y&&C.x<=w&&C.y>=M&&C.y<=S&&C!==o&&C!==c&&ho(u,m,d,g,h,v,C.x,C.y)&&Xt(C.prev,C,C.next)>=0)return!1;C=C.prevZ}for(;E&&E.z<=I;){if(E.x>=y&&E.x<=w&&E.y>=M&&E.y<=S&&E!==o&&E!==c&&ho(u,m,d,g,h,v,E.x,E.y)&&Xt(E.prev,E,E.next)>=0)return!1;E=E.nextZ}return!0}function xT(s,e,t){let i=s;do{const o=i.prev,a=i.next.next;!Oc(o,a)&&u0(o,i,i.next,a)&&Ia(o,a)&&Ia(a,o)&&(e.push(o.i/t|0),e.push(i.i/t|0),e.push(a.i/t|0),Da(i),Da(i.next),i=s=a),i=i.next}while(i!==s);return ys(i)}function yT(s,e,t,i,o,a){let c=s;do{let u=c.next.next;for(;u!==c.prev;){if(c.i!==u.i&&bT(c,u)){let d=f0(c,u);c=ys(c,c.next),d=ys(d,d.next),La(c,e,t,i,o,a,0),La(d,e,t,i,o,a,0);return}u=u.next}c=c.next}while(c!==s)}function ST(s,e,t,i){const o=[];let a,c,u,d,h;for(a=0,c=e.length;a<c;a++)u=e[a]*i,d=a<c-1?e[a+1]*i:s.length,h=c0(s,u,d,i,!1),h===h.next&&(h.steiner=!0),o.push(RT(h));for(o.sort(MT),a=0;a<o.length;a++)t=ET(o[a],t);return t}function MT(s,e){return s.x-e.x}function ET(s,e){const t=wT(s,e);if(!t)return e;const i=f0(t,s);return ys(i,i.next),ys(t,t.next)}function wT(s,e){let t=e,i=-1/0,o;const a=s.x,c=s.y;do{if(c<=t.y&&c>=t.next.y&&t.next.y!==t.y){const v=t.x+(c-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(v<=a&&v>i&&(i=v,o=t.x<t.next.x?t:t.next,v===a))return o}t=t.next}while(t!==e);if(!o)return null;const u=o,d=o.x,h=o.y;let m=1/0,g;t=o;do a>=t.x&&t.x>=d&&a!==t.x&&ho(c<h?a:i,c,d,h,c<h?i:a,c,t.x,t.y)&&(g=Math.abs(c-t.y)/(a-t.x),Ia(t,s)&&(g<m||g===m&&(t.x>o.x||t.x===o.x&&TT(o,t)))&&(o=t,m=g)),t=t.next;while(t!==u);return o}function TT(s,e){return Xt(s.prev,s,e.prev)<0&&Xt(e.next,s,s.next)<0}function AT(s,e,t,i){let o=s;do o.z===0&&(o.z=qd(o.x,o.y,e,t,i)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next;while(o!==s);o.prevZ.nextZ=null,o.prevZ=null,CT(o)}function CT(s){let e,t,i,o,a,c,u,d,h=1;do{for(t=s,s=null,a=null,c=0;t;){for(c++,i=t,u=0,e=0;e<h&&(u++,i=i.nextZ,!!i);e++);for(d=h;u>0||d>0&&i;)u!==0&&(d===0||!i||t.z<=i.z)?(o=t,t=t.nextZ,u--):(o=i,i=i.nextZ,d--),a?a.nextZ=o:s=o,o.prevZ=a,a=o;t=i}a.nextZ=null,h*=2}while(c>1);return s}function qd(s,e,t,i,o){return s=(s-t)*o|0,e=(e-i)*o|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function RT(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function ho(s,e,t,i,o,a,c,u){return(o-c)*(e-u)>=(s-c)*(a-u)&&(s-c)*(i-u)>=(t-c)*(e-u)&&(t-c)*(a-u)>=(o-c)*(i-u)}function bT(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!PT(s,e)&&(Ia(s,e)&&Ia(e,s)&&LT(s,e)&&(Xt(s.prev,s,e.prev)||Xt(s,e.prev,e))||Oc(s,e)&&Xt(s.prev,s,s.next)>0&&Xt(e.prev,e,e.next)>0)}function Xt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Oc(s,e){return s.x===e.x&&s.y===e.y}function u0(s,e,t,i){const o=xc(Xt(s,e,t)),a=xc(Xt(s,e,i)),c=xc(Xt(t,i,s)),u=xc(Xt(t,i,e));return!!(o!==a&&c!==u||o===0&&_c(s,t,e)||a===0&&_c(s,i,e)||c===0&&_c(t,s,i)||u===0&&_c(t,e,i))}function _c(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function xc(s){return s>0?1:s<0?-1:0}function PT(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&u0(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Ia(s,e){return Xt(s.prev,s,s.next)<0?Xt(s,e,s.next)>=0&&Xt(s,s.prev,e)>=0:Xt(s,e,s.prev)<0||Xt(s,s.next,e)<0}function LT(s,e){let t=s,i=!1;const o=(s.x+e.x)/2,a=(s.y+e.y)/2;do t.y>a!=t.next.y>a&&t.next.y!==t.y&&o<(t.next.x-t.x)*(a-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==s);return i}function f0(s,e){const t=new Zd(s.i,s.x,s.y),i=new Zd(e.i,e.x,e.y),o=s.next,a=e.prev;return s.next=e,e.prev=s,t.next=o,o.prev=t,i.next=t,t.prev=i,a.next=i,i.prev=a,i}function uv(s,e,t,i){const o=new Zd(s,e,t);return i?(o.next=i.next,o.prev=i,i.next.prev=o,i.next=o):(o.prev=o,o.next=o),o}function Da(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Zd(s,e,t){this.i=s,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function IT(s,e,t,i){let o=0;for(let a=e,c=t-i;a<t;a+=i)o+=(s[c]-s[a])*(s[a+1]+s[c+1]),c=a;return o}class Ra{static area(e){const t=e.length;let i=0;for(let o=t-1,a=0;a<t;o=a++)i+=e[o].x*e[a].y-e[a].x*e[o].y;return i*.5}static isClockWise(e){return Ra.area(e)<0}static triangulateShape(e,t){const i=[],o=[],a=[];fv(e),dv(i,e);let c=e.length;t.forEach(fv);for(let d=0;d<t.length;d++)o.push(c),c+=t[d].length,dv(i,t[d]);const u=gT.triangulate(i,o);for(let d=0;d<u.length;d+=3)a.push(u.slice(d,d+3));return a}}function fv(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function dv(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class wo extends Wt{constructor(e=.5,t=1,i=32,o=1,a=0,c=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:o,thetaStart:a,thetaLength:c},i=Math.max(3,i),o=Math.max(1,o);const u=[],d=[],h=[],m=[];let g=e;const v=(t-e)/o,y=new k,M=new Be;for(let w=0;w<=o;w++){for(let S=0;S<=i;S++){const x=a+S/i*c;y.x=g*Math.cos(x),y.y=g*Math.sin(x),d.push(y.x,y.y,y.z),h.push(0,0,1),M.x=(y.x/t+1)/2,M.y=(y.y/t+1)/2,m.push(M.x,M.y)}g+=v}for(let w=0;w<o;w++){const S=w*(i+1);for(let x=0;x<i;x++){const I=x+S,C=I,E=I+i+1,Z=I+i+2,D=I+1;u.push(C,E,D),u.push(E,Z,D)}}this.setIndex(u),this.setAttribute("position",new qt(d,3)),this.setAttribute("normal",new qt(h,3)),this.setAttribute("uv",new qt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wo(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class hh extends Wt{constructor(e=new l0([new Be(0,.5),new Be(-.5,-.5),new Be(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],o=[],a=[],c=[];let u=0,d=0;if(Array.isArray(e)===!1)h(e);else for(let m=0;m<e.length;m++)h(e[m]),this.addGroup(u,d,m),u+=d,d=0;this.setIndex(i),this.setAttribute("position",new qt(o,3)),this.setAttribute("normal",new qt(a,3)),this.setAttribute("uv",new qt(c,2));function h(m){const g=o.length/3,v=m.extractPoints(t);let y=v.shape;const M=v.holes;Ra.isClockWise(y)===!1&&(y=y.reverse());for(let S=0,x=M.length;S<x;S++){const I=M[S];Ra.isClockWise(I)===!0&&(M[S]=I.reverse())}const w=Ra.triangulateShape(y,M);for(let S=0,x=M.length;S<x;S++){const I=M[S];y=y.concat(I)}for(let S=0,x=y.length;S<x;S++){const I=y[S];o.push(I.x,I.y,0),a.push(0,0,1),c.push(I.x,I.y)}for(let S=0,x=w.length;S<x;S++){const I=w[S],C=I[0]+g,E=I[1]+g,Z=I[2]+g;i.push(C,E,Z),d+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return DT(t,e)}static fromJSON(e,t){const i=[];for(let o=0,a=e.shapes.length;o<a;o++){const c=t[e.shapes[o]];i.push(c)}return new hh(i,e.curveSegments)}}function DT(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,i=s.length;t<i;t++){const o=s[t];e.shapes.push(o.uuid)}else e.shapes.push(s.uuid);return e}const hv=new It;class NT{constructor(e,t,i=0,o=1/0){this.ray=new lh(e,t),this.near=i,this.far=o,this.camera=null,this.layers=new ch,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return hv.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(hv),this}intersectObject(e,t=!0,i=[]){return $d(e,this,i,t),i.sort(pv),i}intersectObjects(e,t=!0,i=[]){for(let o=0,a=e.length;o<a;o++)$d(e[o],this,i,t);return i.sort(pv),i}}function pv(s,e){return s.distance-e.distance}function $d(s,e,t,i){let o=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(o=!1),o===!0&&i===!0){const a=s.children;for(let c=0,u=a.length;c<u;c++)$d(a[c],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Qd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Qd);const UT={pole:16347926,sensor:15680580,limit:15381256,signWarn:16436245,signOrder:3718648,signBoard:2282478,lamp:12891645,camera:10980346,signal:16020150},FT={pole:"#f97316",sensor:"#ef4444",limit:"#eab308",signWarn:"#facc15",signOrder:"#38bdf8",signBoard:"#22d3ee",lamp:"#c4b5fd",camera:"#a78bfa",signal:"#f472b6"},OT={pile:16486972,sign:3718648,device:10980346};function zT(s){switch(s){case"pole":case"sensor":return new Eo(.5*1,20);case"limit":return new wo(.28*1,.5*1,24);case"signWarn":return kT(.62*1);case"signOrder":return new Eo(.5*1,28);case"signBoard":return mv(1.1*1,.72*1);case"lamp":return BT(.55*1,.24*1,8);case"camera":return mv(.7*1,.5*1);case"signal":return new wo(.3*1,.5*1,6)}}function kT(s){const e=new Wt,t=new Float32Array([0,s,0,-s*.866,-s*.5,0,s*.866,-s*.5,0]);return e.setAttribute("position",new Cn(t,3)),e.setIndex([0,1,2]),e.computeVertexNormals(),e}function mv(s,e){const t=new Wt,i=s/2,o=e/2,a=new Float32Array([-i,-o,0,i,-o,0,i,o,0,-i,o,0]);return t.setAttribute("position",new Cn(a,3)),t.setIndex([0,1,2,0,2,3]),t.computeVertexNormals(),t}function BT(s,e,t){const i=new Wt,o=[0,0,0];for(let c=0;c<t*2;c++){const u=c%2===0?s:e,d=c/(t*2)*Math.PI*2-Math.PI/2;o.push(Math.cos(d)*u,Math.sin(d)*u,0)}const a=[];for(let c=1;c<=t*2;c++)a.push(0,c,c===t*2?1:c+1);return i.setAttribute("position",new qt(o,3)),i.setIndex(a),i.computeVertexNormals(),i}function VT(s){let t=null;return s==="signWarn"?t=[new k(0,.62,0),new k(-.62*.866,-.62*.5,0),new k(.62*.866,-.62*.5,0)]:s==="signBoard"?t=[new k(-1.1/2,-.72/2,0),new k(1.1/2,-.72/2,0),new k(1.1/2,.72/2,0),new k(-1.1/2,.72/2,0)]:s==="camera"&&(t=[new k(-.7/2,-.5/2,0),new k(.7/2,-.5/2,0),new k(.7/2,.5/2,0),new k(-.7/2,.5/2,0)]),t?new Wt().setFromPoints([...t,t[0]]):null}const HT={base:"#9ca3af",lane:"#f5f5f4",pile:"#f97316",sign:"#38bdf8",device:"#a78bfa"};function GT(){const s=Se(D=>D.layerVisible),e=Se(D=>D.toggleLayer),t=Se(D=>D.setLayerVisible),i=Se(D=>D.layerCounts),o=Se(D=>D.overrides),a=Se(D=>D.features),c=Se(D=>D.selectedIds),u=Se(D=>D.setSelected),d=Se(D=>D.batchSetLayer),h=Se(D=>D.batchSetVisible),m=Se(D=>D.resetOverrides),g=Se(D=>D.searchAndLocate),v=Se(D=>D.role),[y,M]=Yt.useState(""),[w,S]=Yt.useState(""),[x,I]=Yt.useState("pile"),C=Yt.useMemo(()=>{const D={base:0,lane:0,pile:0,sign:0,device:0};for(const O of a)D[ds(O,{overrides:o,layerVisible:s}).layer]++;return D},[a,o,s]),E=Yt.useMemo(()=>c.map(D=>Se.getState().featureMap.get(D)).filter(Boolean),[c]),Z=()=>{if(!y.trim())return;const D=g(y);S(D?`已定位:${D.id} · ${D.name}`:`未找到与「${y}」匹配的要素,请输入完整编号或前缀(如 PILE-00123)`)};return P.jsxs("div",{className:"panel left",children:[P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["图层控制 ",P.jsx("span",{className:"count",children:"即时生效"})]}),od.map(D=>P.jsxs("div",{children:[P.jsxs("div",{className:"layer-row",children:[P.jsx("input",{type:"checkbox",checked:s[D.id],onChange:()=>e(D.id)}),P.jsx("span",{className:"swatch",style:{background:HT[D.id]}}),P.jsx("span",{className:"name",children:D.name}),P.jsxs("span",{className:"num",children:[C[D.id]," 条"]}),P.jsx("button",{style:{padding:"2px 7px"},onClick:()=>t(D.id,!s[D.id]),children:s[D.id]?"隐":"显"})]}),P.jsx("div",{className:"layer-desc",children:D.description})]},D.id)),P.jsxs("div",{className:"hint",children:["原始数据量:底图 ",i.base," / 车道 ",i.lane," / 桩位 ",i.pile," / 标志 ",i.sign," / 设备 ",i.device]})]}),P.jsxs("div",{className:"section",children:[P.jsx("h3",{children:"编号搜索定位"}),P.jsxs("div",{className:"search-box",children:[P.jsx("input",{value:y,placeholder:"输入编号,如 PILE-00123 / CAM",onChange:D=>M(D.target.value),onKeyDown:D=>D.key==="Enter"&&Z()}),P.jsx("button",{className:"primary",onClick:Z,children:"定位"})]}),w&&P.jsx("div",{className:"hint",style:{color:w.startsWith("已")?"var(--ok)":"var(--warn)"},children:w}),P.jsx("div",{className:"hint",children:"定位后相机自动飞至要素并黄色闪烁 3 秒,同时在右侧弹出属性。"})]}),P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["批量操作 ",P.jsxs("span",{className:"count",children:["已选 ",c.length," 个"]})]}),c.length===0?P.jsx("div",{className:"empty",children:"在地图上左键框选、Shift 套索或单击点选要素"}):P.jsxs(P.Fragment,{children:[P.jsxs("div",{className:"sel-list",children:[E.slice(0,50).map(D=>P.jsxs("div",{className:"item",children:[P.jsx("span",{children:D.id}),P.jsx("span",{className:"muted",children:D.name})]},D.id)),E.length>50&&P.jsxs("div",{className:"item muted",children:["…其余 ",E.length-50," 个略"]})]}),v==="coach"&&P.jsxs(P.Fragment,{children:[P.jsxs("div",{className:"batch-bar",children:[P.jsx("select",{value:x,onChange:D=>I(D.target.value),children:od.map(D=>P.jsxs("option",{value:D.id,children:["移动到:",D.name]},D.id))}),P.jsx("button",{onClick:()=>d(c,x),children:"批量改图层"})]}),P.jsxs("div",{className:"batch-bar",children:[P.jsx("button",{onClick:()=>h(c,!0),children:"批量显示"}),P.jsx("button",{onClick:()=>h(c,!1),children:"批量隐藏"}),P.jsx("button",{className:"danger",onClick:()=>m(c),children:"清除覆盖"})]})]}),P.jsx("div",{className:"batch-bar",children:P.jsx("button",{onClick:()=>u([]),children:"清空选择"})})]})]}),P.jsxs("div",{className:"section",children:[P.jsx("h3",{children:"符号图例"}),Object.entries(FT).map(([D,O])=>P.jsxs("div",{className:"legend-row",children:[P.jsx("span",{className:"dot",style:{background:O}}),WT(D)]},D))]})]})}function WT(s){return{pole:"训练标杆(实心圆)",sensor:"感应桩(红色实心圆)",limit:"限位桩(圆环)",signWarn:"警告标志(三角)",signOrder:"指示/禁令标志(圆)",signBoard:"科目告示牌(矩形)",lamp:"照明杆(星形)",camera:"监控点(矩形)",signal:"信号设备(六边形环)"}[s]??s}function XT(s){if(s.geom.type==="point")return`X = ${s.geom.x.toFixed(2)} m,Z = ${s.geom.z.toFixed(2)} m`;const e=(()=>{let t=1/0,i=-1/0,o=1/0,a=1/0;for(const[c,u]of s.geom.points)t=Math.min(t,c),i=Math.max(i,c),o=Math.min(o,u),a=Math.max(a,u);return{minX:t,maxX:i,minZ:o,maxZ:a}})();return`外接框 X[${e.minX.toFixed(1)}, ${e.maxX.toFixed(1)}] Z[${e.minZ.toFixed(1)}, ${e.maxZ.toFixed(1)}] m`}function jT(){const s=Se(C=>C.selectedIds),e=Se(C=>C.featureMap),t=Se(C=>C.overrides),i=Se(C=>C.layerVisible),o=Se(C=>C.searchAndLocate),a=Se(C=>C.batchSetVisible),c=Se(C=>C.resetOverrides),u=Se(C=>C.role),d=Se(C=>C.placementMode),h=Se(C=>C.setPlacementMode),m=Se(C=>C.workingPlacements),g=Se(C=>C.removePlacement),v=Se(C=>C.clearPlacements),y=Se(C=>C.tasks);if(s.length===0)return P.jsxs("div",{className:"section",children:[P.jsx("h3",{children:"要素属性"}),P.jsx("div",{className:"empty",children:"未选中要素。单击点选、左键拖框框选或 Shift 套索圈选。"})]});if(s.length>1)return P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["要素属性 ",P.jsxs("span",{className:"count",children:[s.length," 个"]})]}),P.jsx("div",{className:"hint",children:"已多选,批量改图层与可见性请使用左侧「批量操作」。"}),P.jsx("div",{className:"sel-list",style:{maxHeight:320,marginTop:8},children:s.map(C=>{const E=e.get(C);return E?P.jsxs("div",{className:"item",children:[P.jsx("span",{children:E.id}),P.jsxs("span",{className:"muted",children:[yc[E.layer].name," · ",E.name]})]},C):null})})]});const M=e.get(s[0]);if(!M)return null;const w=ds(M,{overrides:t,layerVisible:i}),S=t[M.id],x=m.find(C=>C.featureId===M.id),I=y.some(C=>C.pileIds.includes(M.id)||C.laneIds.includes(M.id));return P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["要素属性",P.jsx("button",{style:{padding:"2px 8px"},onClick:()=>o(M.id),children:"闪烁定位"})]}),P.jsxs("dl",{className:"kv",children:[P.jsx("dt",{children:"编号"}),P.jsx("dd",{children:M.id}),P.jsx("dt",{children:"名称"}),P.jsx("dd",{children:M.name}),P.jsx("dt",{children:"类型"}),P.jsx("dd",{children:M.kind}),P.jsx("dt",{children:"所属图层"}),P.jsxs("dd",{children:[P.jsx("span",{className:"tag",style:{background:"#1e3a5f"},children:yc[w.layer].name}),(S==null?void 0:S.layer)&&P.jsxs("span",{className:"tag bad",children:["原:",yc[M.layer].name]})]}),P.jsx("dt",{children:"坐标"}),P.jsx("dd",{children:XT(M)}),P.jsx("dt",{children:"可见性"}),P.jsxs("dd",{children:[w.visible?P.jsx("span",{className:"tag ok",children:"可见"}):P.jsx("span",{className:"tag bad",children:"隐藏"}),(S==null?void 0:S.visible)!==void 0&&P.jsx("span",{className:"tag wait",children:"已被单独覆盖"})]}),P.jsx("dt",{children:"标注"}),P.jsx("dd",{children:M.label||"—"})]}),P.jsxs("div",{style:{marginTop:10},children:[P.jsx("div",{className:"muted",style:{marginBottom:4},children:"业务属性"}),P.jsx("dl",{className:"kv",children:Object.entries(M.attrs).map(([C,E])=>P.jsxs(Yt.Fragment,{children:[P.jsx("dt",{children:C}),P.jsx("dd",{children:E})]},C))})]}),u==="coach"&&P.jsxs("div",{className:"batch-bar",children:[P.jsx("button",{onClick:()=>a([M.id],!w.visible),children:w.visible?"单独隐藏":"单独显示"}),S&&P.jsx("button",{className:"danger",onClick:()=>c([M.id]),children:"清除覆盖项"})]}),u==="student"&&P.jsxs("div",{style:{marginTop:12},children:[P.jsxs("div",{className:"muted",style:{marginBottom:6},children:["学员摆放",!I&&"(提示:该要素尚未被任何任务引用)"]}),d?P.jsx("button",{onClick:()=>h(!1),children:"退出摆放模式"}):P.jsx("button",{className:"primary",onClick:()=>h(!0),children:"进入摆放模式"}),x&&P.jsxs("div",{className:"card",style:{marginTop:8},children:[P.jsxs("div",{className:"meta",children:["已摆放:X ",x.x.toFixed(2)," / Z ",x.z.toFixed(2)]}),P.jsx("button",{className:"danger",onClick:()=>g(M.id),children:"撤销该点"})]}),m.length>0&&P.jsx("div",{className:"batch-bar",children:P.jsxs("button",{className:"danger",onClick:v,children:["清空全部摆放(",m.length,")"]})})]})]})}const gv=["倒车入库","侧方停车","曲线行驶","直角转弯","坡道定点停车与起步","综合训练"];function YT(){const s=Se(E=>E.role),e=Se(E=>E.tasks),t=Se(E=>E.taskDraft),i=Se(E=>E.startTaskDraft),o=Se(E=>E.cancelTaskDraft),a=Se(E=>E.removeDraftRef),c=Se(E=>E.createTask),u=Se(E=>E.deleteTask),d=Se(E=>E.featureMap),h=Se(E=>E.setSelected),m=Se(E=>E.searchAndLocate),[g,v]=Yt.useState(""),[y,M]=Yt.useState(gv[0]),[w,S]=Yt.useState(""),[x,I]=Yt.useState("");if(s!=="coach")return P.jsxs("div",{className:"section",children:[P.jsx("h3",{children:"科目任务"}),P.jsx("div",{className:"empty",children:"任务发布为教练功能,请在顶栏切换到教练角色。"})]});const C=()=>{if(!g.trim()){I("请填写任务标题");return}if(!c(g.trim(),y,w.trim()||"按图示点位完成摆放,偏差不超过 0.3m。")){I("请先用 Shift 套索圈选至少一个桩位或车道要素");return}I(""),v(""),S("")};return P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["科目任务 ",P.jsxs("span",{className:"count",children:["已发布 ",e.length," 个"]})]}),t?P.jsxs("div",{className:"card",children:[P.jsx("div",{className:"title",children:"任务圈选进行中"}),P.jsx("div",{className:"meta",children:"在地图上按住 Shift 拖动鼠标套索圈选;也可框选后点「加入任务」"}),P.jsxs("div",{className:"ref-chips",children:[P.jsxs("span",{className:"tag pile",children:["桩位 ",t.pileIds.length]}),P.jsxs("span",{className:"tag lane",children:["车道 ",t.laneIds.length]})]}),P.jsx("div",{className:"sel-list",style:{maxHeight:180},children:[...t.pileIds,...t.laneIds].map(E=>{var Z;return P.jsxs("div",{className:"item",children:[P.jsx("span",{children:E}),P.jsxs("span",{children:[P.jsx("span",{className:"muted",children:(Z=d.get(E))==null?void 0:Z.name}),P.jsx("button",{style:{marginLeft:6},onClick:()=>a(E),children:"✕"})]})]},E)})}),P.jsxs("div",{className:"form-row",style:{marginTop:8},children:[P.jsx("label",{children:"任务标题"}),P.jsx("input",{value:g,onChange:E=>v(E.target.value),placeholder:"例:第 3 训练区倒车入库点位摆放"})]}),P.jsxs("div",{className:"form-row",children:[P.jsx("label",{children:"科目"}),P.jsx("select",{value:y,onChange:E=>M(E.target.value),children:gv.map(E=>P.jsx("option",{children:E},E))})]}),P.jsxs("div",{className:"form-row",children:[P.jsx("label",{children:"教学要求"}),P.jsx("textarea",{value:w,onChange:E=>S(E.target.value),placeholder:"填写点位精度、完成时限、操作要点等要求"})]}),x&&P.jsx("div",{className:"hint",style:{color:"var(--warn)"},children:x}),P.jsxs("div",{className:"btn-row",style:{marginTop:8},children:[P.jsx("button",{className:"primary",onClick:C,children:"发布任务"}),P.jsx("button",{onClick:o,children:"取消"})]})]}):P.jsx("button",{className:"primary",onClick:i,children:"＋ 新建任务(圈选桩位与车道)"}),P.jsxs("div",{style:{marginTop:12},children:[e.length===0&&P.jsx("div",{className:"empty",children:"暂无任务"}),e.map(E=>P.jsxs("div",{className:"card",children:[P.jsx("div",{className:"title",children:E.title}),P.jsxs("div",{className:"meta",children:[E.id," · ",E.subject," · ",E.creator," · ",new Date(E.createdAt).toLocaleString("zh-CN")]}),P.jsx("div",{className:"req",children:E.requirement}),P.jsxs("div",{className:"ref-chips",children:[P.jsxs("span",{className:"tag pile",children:["桩位 ",E.pileIds.length]}),P.jsxs("span",{className:"tag lane",children:["车道 ",E.laneIds.length]})]}),P.jsxs("div",{className:"btn-row",children:[P.jsx("button",{onClick:()=>{h([...E.pileIds,...E.laneIds]);const Z=E.pileIds[0]??E.laneIds[0];Z&&m(Z)},children:"在图上定位"}),P.jsx("button",{className:"danger",onClick:()=>u(E.id),children:"删除"})]})]},E.id))]})]})}function qT(s){const e=String(s);return/[",\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function d0(s,e){const t="\uFEFF"+e.map(c=>c.map(qT).join(",")).join(`\r
`),i=new Blob([t],{type:"text/csv;charset=utf-8"}),o=URL.createObjectURL(i),a=document.createElement("a");a.href=o,a.download=s,a.click(),URL.revokeObjectURL(o)}function h0(s){const e=new Date(s),t=i=>String(i).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())} ${t(e.getHours())}:${t(e.getMinutes())}`}function ZT(s,e,t){const i=new Map(t.map(a=>[a.id,a])),o=[["学员编号","姓名","班级","任务编号","任务名称","科目","提交时间","状态","系统初步分","复核总分","最终成绩"]];for(const a of s){const c=e.filter(u=>u.student===a.id).sort((u,d)=>u.submittedAt-d.submittedAt);if(c.length===0){o.push([a.id,a.name,a.classNo,"","","","","未提交","","",""]);continue}for(const u of c){const d=i.get(u.taskId);o.push([a.id,a.name,a.classNo,(d==null?void 0:d.id)??u.taskId,(d==null?void 0:d.title)??"",(d==null?void 0:d.subject)??"",h0(u.submittedAt),u.reviewed?"已复核":"待复核",u.autoTotal,u.finalTotal??"",Ic(u)])}}d0(`成绩单汇总_${Date.now()}.csv`,o)}function $T(s,e,t,i){const o=new Map(t.map(c=>[c.id,c])),a=[];a.push(["学员成绩单与错题清单"]),a.push(["学员编号",s.id,"姓名",s.name,"班级",s.classNo]),a.push([]),a.push(["一、成绩单"]),a.push(["任务编号","任务名称","科目","提交时间","状态","系统初步分","复核总分","最终成绩","教练评语"]);for(const c of e){const u=o.get(c.taskId);a.push([(u==null?void 0:u.id)??c.taskId,(u==null?void 0:u.title)??"",(u==null?void 0:u.subject)??"",h0(c.submittedAt),c.reviewed?"已复核":"待复核",c.autoTotal,c.finalTotal??"",Ic(c),c.reviewComment])}a.push([]),a.push(["二、错题清单(偏差 > 0.3m 或缺项)"]),a.push(["任务名称","要素编号","要素名称","所属图层","偏差(m)","系统得分","复核得分","问题说明"]);for(const c of e){const u=o.get(c.taskId);for(const d of Tv(c)){const h=i.get(d.featureId);a.push([(u==null?void 0:u.title)??c.taskId,d.featureId,d.name,yc[(h==null?void 0:h.layer)??d.layer].name,Number.isFinite(d.deviation)?d.deviation:"缺项",d.autoScore,d.finalScore??"",d.comment])}}d0(`${s.name}_成绩单与错题清单_${Date.now()}.csv`,a)}function KT(){return Se(e=>e.role)==="coach"?P.jsx(eA,{}):P.jsx(JT,{})}function JT(){const s=Se(E=>E.tasks),e=Se(E=>E.students),t=Se(E=>E.currentStudentId),i=Se(E=>E.submissions),o=Se(E=>E.workingPlacements),a=Se(E=>E.placementMode),c=Se(E=>E.setPlacementMode),u=Se(E=>E.submitForTask),d=Se(E=>E.setActiveSubmission),h=Se(E=>E.activeSubmissionId),m=Se(E=>E.clearPlacements),[g,v]=Yt.useState(""),[y,M]=Yt.useState(""),w=e.find(E=>E.id===t),S=i.filter(E=>E.student===t),x=s.find(E=>E.id===g),I=Yt.useMemo(()=>!x||o.length===0?null:wv(x,o,Se.getState().featureMap),[x,o]),C=()=>{if(!x){M("请先选择要完成的任务");return}const E=u(x.id);E&&(M(`已提交,系统初步评分 ${E.autoTotal} 分,等待教练复核`),d(E.id))};return P.jsxs("div",{className:"section",children:[P.jsxs("h3",{children:["我的作业 ",P.jsxs("span",{className:"count",children:[w.name," · ",w.classNo]})]}),P.jsxs("div",{className:"form-row",children:[P.jsx("label",{children:"选择任务"}),P.jsxs("select",{value:g,onChange:E=>{v(E.target.value),M("")},children:[P.jsx("option",{value:"",children:"— 请选择 —"}),s.map(E=>P.jsxs("option",{value:E.id,children:[E.title,"(",E.subject,")"]},E.id))]})]}),x&&P.jsxs("div",{className:"card",children:[P.jsx("div",{className:"title",children:x.title}),P.jsx("div",{className:"req",children:x.requirement}),P.jsxs("div",{className:"ref-chips",children:[P.jsxs("span",{className:"tag pile",children:["目标桩位 ",x.pileIds.length]}),P.jsxs("span",{className:"tag lane",children:["目标车道 ",x.laneIds.length]})]}),P.jsxs("div",{className:"btn-row",children:[a?P.jsx("button",{onClick:()=>c(!1),children:"暂停摆放"}):P.jsx("button",{className:"primary",onClick:()=>c(!0),children:"开始摆放"}),P.jsx("button",{onClick:m,children:"清空"}),P.jsx("button",{className:"primary",onClick:C,children:"提交作业"})]}),P.jsxs("div",{className:"hint",children:["摆放方式:在右侧「属性」页选中目标要素 → 进入摆放模式 → 在地图上点击目标位置。 已摆放 ",o.length," / ",x.pileIds.length+x.laneIds.length," 项"]}),I&&P.jsxs("div",{style:{marginTop:8},children:[P.jsx("div",{className:"muted",children:"提交前实时预估"}),P.jsxs("div",{className:"score-big auto",children:[I.total," 分"]}),P.jsxs("div",{className:"muted",children:["缺项 ",I.missing.length," 个 · 偏差超 0.3m 的错题 ",QT(I)," 个"]})]})]}),y&&P.jsx("div",{className:"hint",style:{color:"var(--ok)"},children:y}),P.jsx("h3",{style:{marginTop:16},children:"我的提交记录"}),S.length===0&&P.jsx("div",{className:"empty",children:"还没有提交记录"}),S.map(E=>{const Z=s.find(D=>D.id===E.taskId);return P.jsxs("div",{className:"card",style:{cursor:"pointer",outline:h===E.id?"1px solid var(--accent)":void 0},onClick:()=>d(h===E.id?null:E.id),children:[P.jsx("div",{className:"title",children:(Z==null?void 0:Z.title)??E.taskId}),P.jsx("div",{className:"meta",children:new Date(E.submittedAt).toLocaleString("zh-CN")}),P.jsxs("div",{children:[P.jsx("span",{className:E.reviewed?"tag ok":"tag wait",children:E.reviewed?"已复核":"待复核"}),P.jsxs("span",{className:"muted",children:["系统 ",E.autoTotal," 分",E.reviewed?` · 最终 ${Ic(E)} 分`:""]})]}),E.reviewed&&E.reviewComment&&P.jsxs("div",{className:"req",children:["教练评语:",E.reviewComment]})]},E.id)})]})}function QT(s){return s.items.filter(e=>e.deviation>.3||e.autoScore===0).length}function eA(){const s=Se(M=>M.submissions),e=Se(M=>M.students),t=Se(M=>M.tasks),i=Se(M=>M.featureMap),o=Se(M=>M.activeSubmissionId),a=Se(M=>M.setActiveSubmission),c=Se(M=>M.setItemScore),u=Se(M=>M.finishReview),[d,h]=Yt.useState(""),m=s.find(M=>M.id===o)??null,g=m?e.find(M=>M.id===m.student):null,v=m?t.find(M=>M.id===m.taskId):null,y=m?[...m.pileScores,...m.laneScores]:[];return P.jsxs("div",{className:"section",children:[P.jsx("h3",{children:"作业复核与成绩"}),P.jsx("div",{className:"btn-row",style:{marginBottom:10},children:P.jsx("button",{onClick:()=>ZT(e,s,t),children:"导出全员成绩单"})}),s.length===0&&P.jsx("div",{className:"empty",children:"暂无学员提交"}),P.jsx("div",{className:"sel-list",style:{maxHeight:200,marginBottom:10},children:s.map(M=>{const w=e.find(x=>x.id===M.student),S=t.find(x=>x.id===M.taskId);return P.jsxs("div",{className:"item",style:{cursor:"pointer",background:o===M.id?"#1e3a5f":void 0},onClick:()=>{a(M.id),h(M.reviewComment)},children:[P.jsxs("span",{children:[w==null?void 0:w.name," · ",(S==null?void 0:S.title)??M.taskId]}),P.jsxs("span",{children:[P.jsx("span",{className:M.reviewed?"tag ok":"tag wait",children:M.reviewed?"已复核":"待复核"}),P.jsxs("span",{className:"muted",children:[Ic(M)," 分"]})]})]},M.id)})}),m&&P.jsxs(P.Fragment,{children:[P.jsxs("div",{className:"card",children:[P.jsxs("div",{className:"title",children:[g==null?void 0:g.name,"(",g==null?void 0:g.classNo,") — ",v==null?void 0:v.title]}),P.jsxs("div",{className:"meta",children:["提交时间 ",new Date(m.submittedAt).toLocaleString("zh-CN")," · 摆放 ",m.placements.length," 项 · 错题 ",Tv(m).length," 个"]}),P.jsxs("div",{style:{display:"flex",gap:18,alignItems:"baseline",margin:"6px 0"},children:[P.jsxs("div",{children:[P.jsx("div",{className:"muted",children:"系统初步分"}),P.jsx("div",{className:"score-big auto",children:m.autoTotal})]}),P.jsxs("div",{children:[P.jsx("div",{className:"muted",children:"复核总分"}),P.jsx("div",{className:"score-big final",children:m.finalTotal??"—"})]})]})]}),P.jsx(vv,{title:"桩位评分(权重 60%)",items:m.pileScores,disabled:m.reviewed,onSet:(M,w,S)=>c(m.id,M,w,S)}),P.jsx(vv,{title:"车道评分(权重 40%)",items:m.laneScores,disabled:m.reviewed,onSet:(M,w,S)=>c(m.id,M,w,S)}),P.jsxs("div",{className:"form-row",style:{marginTop:10},children:[P.jsx("label",{children:"复核评语"}),P.jsx("textarea",{value:d,disabled:m.reviewed,onChange:M=>h(M.target.value)})]}),m.reviewed?P.jsx("div",{className:"btn-row",children:P.jsxs("button",{onClick:()=>$T(g,s.filter(M=>M.student===m.student),t,i),children:["导出 ",g==null?void 0:g.name," 的成绩单与错题清单"]})}):P.jsx("div",{className:"btn-row",children:P.jsx("button",{className:"primary",onClick:()=>u(m.id,d||"已完成复核,注意错题清单中的偏差点位。"),children:"确认复核并出分"})}),P.jsxs("div",{className:"hint",style:{marginTop:8},children:["评分规则:偏差 ≤0.15m 满分;≤0.3m 得 90;≤0.5m 得 75;≤1.0m 得 55;更大偏差继续扣分;缺项记 0。 复核时可直接改分,留空则采用系统分。共 ",y.length," 个评分点。"]})]})]})}function vv(s){const[e,t]=Yt.useState({});return P.jsxs("div",{style:{marginBottom:12},children:[P.jsx("div",{className:"muted",style:{margin:"8px 0 4px"},children:s.title}),P.jsxs("table",{className:"score",children:[P.jsx("thead",{children:P.jsxs("tr",{children:[P.jsx("th",{children:"编号"}),P.jsx("th",{children:"要素"}),P.jsx("th",{children:"偏差(m)"}),P.jsx("th",{children:"系统分"}),P.jsx("th",{children:"复核分"}),P.jsx("th",{children:"当前"})]})}),P.jsx("tbody",{children:s.items.map(i=>P.jsxs("tr",{children:[P.jsx("td",{children:i.featureId}),P.jsx("td",{className:"name",title:i.name,children:i.name}),P.jsx("td",{style:{color:i.deviation>.3?"var(--bad)":i.deviation>.15?"var(--warn)":"var(--ok)"},children:Number.isFinite(i.deviation)?i.deviation.toFixed(2):"缺项"}),P.jsx("td",{children:i.autoScore}),P.jsx("td",{children:P.jsx("input",{disabled:s.disabled,value:e[i.featureId]??i.finalScore??"",onChange:o=>{const a=o.target.value.replace(/[^0-9]/g,"");t(u=>({...u,[i.featureId]:a}));const c=a===""?null:Math.max(0,Math.min(100,Number(a)));s.onSet(i.featureId,c,c===null?i.comment:c>=i.autoScore?"复核加分":"复核扣分,需加强练习")}})}),P.jsx("td",{style:{color:"var(--accent)",fontWeight:600},children:Px(i)})]},i.featureId))})]})]})}function tA(){const[s,e]=Yt.useState("attr");return P.jsxs("div",{className:"panel right",children:[P.jsxs("div",{className:"tabs",children:[P.jsx("button",{className:s==="attr"?"active":"",onClick:()=>e("attr"),children:"要素属性"}),P.jsx("button",{className:s==="task"?"active":"",onClick:()=>e("task"),children:"科目任务"}),P.jsx("button",{className:s==="grade"?"active":"",onClick:()=>e("grade"),children:"作业成绩"})]}),s==="attr"&&P.jsx(jT,{}),s==="task"&&P.jsx(YT,{}),s==="grade"&&P.jsx(KT,{})]})}function nA(s){if(s.geom.type==="point")return{minX:s.geom.x,maxX:s.geom.x,minZ:s.geom.z,maxZ:s.geom.z};let e=1/0,t=-1/0,i=1/0,o=-1/0;for(const[a,c]of s.geom.points)a<e&&(e=a),a>t&&(t=a),c<i&&(i=c),c>o&&(o=c);return{minX:e,maxX:t,minZ:i,maxZ:o}}const _v=new Map;function ls(s){let e=_v.get(s.id);return e||(e=nA(s),_v.set(s.id,e)),e}const iA=120,rA=30,sA=28,oA=9,aA=8,lA={solid:16777215,dashed:14078929,edge:16498468,stop:15680580,guide:8246268},cA={building:10265519,pavement:4145479,green:5078031,wall:7893356,bay:5395035},uA={base:0,lane:.06,pile:.14,sign:.18,device:.22};function fA(s,e,t,i,o,a){s.beginPath(),s.moveTo(e+a,t),s.arcTo(e+i,t,e+i,t+o,a),s.arcTo(e+i,t+o,e,t+o,a),s.arcTo(e,t+o,e,t,a),s.arcTo(e,t,e+i,t,a),s.closePath()}class dA{constructor(e,t){lt(this,"container");lt(this,"cb");lt(this,"renderer");lt(this,"scene",new Kw);lt(this,"camera");lt(this,"raycaster",new NT);lt(this,"cells",new Map);lt(this,"root",new Or);lt(this,"labelGroup",new Or);lt(this,"highlight");lt(this,"blinkRing");lt(this,"selectionRect");lt(this,"lassoLine");lt(this,"labels",[]);lt(this,"labelTextureCache",new Map);lt(this,"labelPool",[]);lt(this,"overlayGroup",new Or);lt(this,"overlayMatWork",new nr({color:2282478}));lt(this,"overlayMatSubmit",new nr({color:3462041}));lt(this,"overlayLineMat",new fs({color:16281969,transparent:!0,opacity:.8}));lt(this,"resizeObs");lt(this,"raf",0);lt(this,"disposed",!1);lt(this,"viewH",Tt.depth);lt(this,"zoom",1);lt(this,"panStart",null);lt(this,"dragMode","none");lt(this,"dragStartPx",null);lt(this,"lassoPts",[]);lt(this,"blinkId",null);lt(this,"blinkNonce",-1);lt(this,"blinkUntil",0);lt(this,"sceneVersion",-1);lt(this,"lastStore","");lt(this,"rebuildQueued",!1);lt(this,"lastStatsEmit",0);lt(this,"onPointerDown",e=>{const t=Se.getState();this.renderer.domElement.setPointerCapture(e.pointerId);const i={x:e.offsetX,y:e.offsetY};if(this.dragStartPx=i,t.placementMode&&e.button===0){const o=this.toWorld(e.offsetX,e.offsetY);this.cb.onPlace(o.x,o.z),this.dragMode="none";return}e.button===2||e.button===1?(this.dragMode="pan",this.panStart={x:e.offsetX,y:e.offsetY,cx:this.camera.position.x,cz:this.camera.position.z}):e.shiftKey?(this.dragMode="lasso",this.lassoPts=[],this.lassoLine.visible=!0):this.dragMode="box"});lt(this,"onPointerMove",e=>{if(this.dragMode==="pan"&&this.panStart){const i=e.offsetX-this.panStart.x,o=e.offsetY-this.panStart.y,a=this.viewH/this.container.clientHeight;this.camera.position.x=this.panStart.cx-i*a,this.camera.position.z=this.panStart.cz- -o*a,this.camera.updateMatrixWorld(),this.updateVisibility();return}if(this.dragMode==="box"&&this.dragStartPx){const i=this.toWorld(this.dragStartPx.x,this.dragStartPx.y),o=this.toWorld(e.offsetX,e.offsetY);this.updateSelectionRect(i,o);return}if(this.dragMode==="lasso"){const i=this.toWorld(e.offsetX,e.offsetY);this.lassoPts.push([i.x,i.z]),this.lassoLine.geometry.setFromPoints(this.lassoPts.map(([o,a])=>new k(o,.5,a)));return}const t=this.pickAt(e.offsetX,e.offsetY);Se.getState().setHover(t),this.renderer.domElement.style.cursor=t?"pointer":"default"});lt(this,"onPointerUp",e=>{const t=this.dragMode;if(this.dragMode="none",this.panStart=null,t==="box"&&this.dragStartPx){const i=Math.hypot(e.offsetX-this.dragStartPx.x,e.offsetY-this.dragStartPx.y);if(this.selectionRect.visible=!1,i>5){const o=this.toWorld(this.dragStartPx.x,this.dragStartPx.y),a=this.toWorld(e.offsetX,e.offsetY),c={minX:Math.min(o.x,a.x),maxX:Math.max(o.x,a.x),minZ:Math.min(o.z,a.z),maxZ:Math.max(o.z,a.z)},u=this.featuresInRect(c);this.cb.onBoxSelect(u)}else this.cb.onPick(this.pickAt(e.offsetX,e.offsetY))}else t==="lasso"&&(this.lassoLine.visible=!1,this.lassoPts.length>=3&&this.cb.onLassoSelect(this.featuresInLasso(this.lassoPts)),this.lassoPts=[]);this.dragStartPx=null});lt(this,"onWheel",e=>{e.preventDefault();const t=this.toWorld(e.offsetX,e.offsetY),i=e.deltaY>0?1.12:1/1.12;this.viewH=Oy.clamp(this.viewH*i,8,Tt.depth*1.4),this.applyFrustum();const o=this.toWorld(e.offsetX,e.offsetY);this.camera.position.x+=t.x-o.x,this.camera.position.z+=t.z-o.z,this.camera.updateMatrixWorld(),this.updateVisibility()});this.container=e,this.cb=t;const i=e.clientWidth,o=e.clientHeight;this.renderer=new $w({antialias:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setSize(i,o),this.renderer.setClearColor(2303275),e.appendChild(this.renderer.domElement);const a=i/o;this.camera=new $v(-220*a/2,Tt.depth*a/2,Tt.depth/2,-220/2,.1,1e3),this.camera.position.set(0,200,0),this.camera.up.set(0,0,-1),this.camera.lookAt(0,0,0),this.scene.add(this.root),this.scene.add(this.labelGroup),this.overlayGroup.renderOrder=60,this.scene.add(this.overlayGroup),this.buildCells(),this.buildHelpers(),this.bindEvents(),this.fitAll(),this.resizeObs=new ResizeObserver(()=>this.onResize()),this.resizeObs.observe(e);const c=()=>{this.disposed||(this.raf=requestAnimationFrame(c),this.tick())};c()}buildCells(){const e=Se.getState(),{grid:t,featureMap:i}=e;for(const[o,a]of t){const c=a.cx*ui,u=a.cz*ui,d={minX:c,minZ:u,maxX:c+ui,maxZ:u+ui},h={key:o,cx:a.cx,cz:a.cz,bounds:d,layers:{},outline:this.buildOutline(d),pickMeshes:[],featureIds:a.featureIds},m=new Map,g=[];for(const v of a.featureIds){const y=i.get(v);if(!y)continue;const M=ds(y,e),w=m.get(M.layer)??[];w.push(y),m.set(M.layer,w),y.geom.type==="area"&&y.layer==="base"&&g.push(y)}g.length&&this.appendAreaOutlines(h.outline,g);for(const[v,y]of m){const M=this.buildLayerObject(v,y,h);h.layers[v]=M,this.root.add(M)}this.root.add(h.outline),this.cells.set(o,h)}}buildOutline(e){const t=new Wt().setFromPoints([new k(e.minX,.02,e.minZ),new k(e.maxX,.02,e.minZ),new k(e.maxX,.02,e.minZ),new k(e.maxX,.02,e.maxZ),new k(e.maxX,.02,e.maxZ),new k(e.minX,.02,e.maxZ),new k(e.minX,.02,e.maxZ),new k(e.minX,.02,e.minZ)]),i=new fs({color:9145234,transparent:!0,opacity:.85}),o=new gc(t,i);return o.visible=!1,o}appendAreaOutlines(e,t){const i=[];for(const c of t){if(c.geom.type!=="area")continue;const u=c.geom.points;for(let d=0;d<u.length;d++){const h=u[d],m=u[(d+1)%u.length];i.push(new k(h[0],.03,h[1]),new k(m[0],.03,m[1]))}}const o=e.geometry.attributes.position,a=new Float32Array(o.count*3+i.length*3);a.set(o.array),i.forEach((c,u)=>{a[(o.count+u)*3]=c.x,a[(o.count+u)*3+1]=c.y,a[(o.count+u)*3+2]=c.z}),e.geometry.dispose(),e.geometry=new Wt,e.geometry.setAttribute("position",new Cn(a,3))}buildLayerObject(e,t,i){const o=new Or;o.name=e;const a=uA[e];if(e==="base")for(const c of t){if(c.geom.type!=="area")continue;const u=new l0(c.geom.points.map(([v,y])=>new Be(v,-y))),d=new hh(u);d.rotateX(-Math.PI/2);const h=cA[c.geom.kind]??4937059,m=new nr({color:h,transparent:!0,opacity:.92}),g=new gn(d,m);g.position.y=a,g.userData.featureId=c.id,o.add(g),i.pickMeshes.push(g)}else if(e==="lane")o.add(this.buildLineSegments(t,a));else{const c=this.buildDots(t,e,a);c&&(i.dots=c,o.add(c));const u=new Map,d=new Map,h=new Map;for(const m of t){if(m.geom.type!=="point")continue;const g=m.kind,v=h.get(g)??[];v.push(m),h.set(g,v)}for(const[m,g]of h){const v=this.buildSymbols(m,g,a);u.set(m,v),o.add(v);const y=this.buildSymbolOutlines(m,g,a);y&&(d.set(m,y),o.add(y))}i.symbols=u,i.symbolOutlines=d}return o.visible=!1,o}buildLineSegments(e,t){const i=[],o=[],a=new At,c=e.filter(m=>m.geom.type==="line");for(const m of c){if(m.geom.type!=="line")continue;const g=lA[m.kind]??16777215;a.set(g);const v=m.geom.points;for(let y=0;y<v.length-1;y++)i.push(v[y][0],t,v[y][1],v[y+1][0],t,v[y+1][1]),o.push(a.r,a.g,a.b,a.r,a.g,a.b)}const u=new Wt;u.setAttribute("position",new qt(i,3)),u.setAttribute("color",new qt(o,3));const d=new fs({vertexColors:!0}),h=new gc(u,d);return h.userData.features=c,h}buildDots(e,t,i){const o=e.filter(m=>m.geom.type==="point");if(!o.length)return;const a=new Eo(.55,10);a.rotateX(-Math.PI/2);const c=new nr({color:OT[t]??16777215}),u=new nv(a,c,o.length),d=new It,h=new xs;return o.forEach((m,g)=>{m.geom.type==="point"&&(d.compose(new k(m.geom.x,i,m.geom.z),h,new k(1,1,1)),u.setMatrixAt(g,d))}),u.instanceMatrix.needsUpdate=!0,u.userData.features=o,u}buildSymbols(e,t,i){const o=zT(e);o.rotateX(-Math.PI/2);const a=new nr({color:UT[e]}),c=new nv(o,a,t.length),u=new It,d=new xs;return t.forEach((h,m)=>{if(h.geom.type!=="point")return;const g=(h.geom.size??1)*1.05;u.compose(new k(h.geom.x,i+.01,h.geom.z),d,new k(g,g,g)),c.setMatrixAt(m,u)}),c.instanceMatrix.needsUpdate=!0,c.userData.features=t,c}buildSymbolOutlines(e,t,i){const o=VT(e);if(!o)return null;o.rotateX(-Math.PI/2);const a=[],c=o.attributes.position,u=new k;for(const m of t){if(m.geom.type!=="point")continue;const g=(m.geom.size??1)*1.05;for(let v=0;v<c.count;v++)u.fromBufferAttribute(c,v),a.push(m.geom.x+u.x*g,i+.02,m.geom.z+u.z*g)}const d=new Wt;d.setAttribute("position",new qt(a,3));const h=new fs({color:1841431});return new gc(d,h)}buildHelpers(){const e=new wo(.78,1,36);e.rotateX(-Math.PI/2),this.highlight=new gn(e,new nr({color:2282478,transparent:!0,opacity:.95,side:Ei})),this.highlight.visible=!1,this.scene.add(this.highlight);const t=new wo(1.05,1.3,40);t.rotateX(-Math.PI/2),this.blinkRing=new gn(t,new nr({color:16638023,transparent:!0,opacity:.9,side:Ei})),this.blinkRing.visible=!1,this.scene.add(this.blinkRing);const i=new Wt;i.setAttribute("position",new Cn(new Float32Array(12),3)),this.selectionRect=new Ea(i,new fs({color:2282478,transparent:!0,opacity:.9})),this.selectionRect.visible=!1,this.scene.add(this.selectionRect);const o=new Wt;this.lassoLine=new Ea(o,new fs({color:16020150,transparent:!0,opacity:.95})),this.lassoLine.visible=!1,this.scene.add(this.lassoLine)}bindEvents(){const e=this.renderer.domElement;e.addEventListener("contextmenu",t=>t.preventDefault()),e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp),e.addEventListener("wheel",this.onWheel,{passive:!1})}applyFrustum(){const e=this.container.clientWidth/this.container.clientHeight,t=this.viewH;this.camera.top=t/2,this.camera.bottom=-t/2,this.camera.left=-t*e/2,this.camera.right=t*e/2,this.camera.updateProjectionMatrix(),this.zoom=Tt.depth/t}fitAll(){this.viewH=Tt.depth,this.camera.position.set(0,200,0),this.applyFrustum(),this.updateVisibility()}focusOn(e,t){this.camera.position.set(e,200,t),this.viewH>26&&(this.viewH=22,this.applyFrustum()),this.camera.updateMatrixWorld(),this.updateVisibility()}onResize(){const e=this.container.clientWidth,t=this.container.clientHeight;!e||!t||(this.renderer.setSize(e,t),this.applyFrustum(),this.updateVisibility())}toWorld(e,t){const i=new Be(e/this.container.clientWidth*2-1,-(t/this.container.clientHeight)*2+1);this.raycaster.setFromCamera(i,this.camera);const o=(200-this.camera.position.y)/(this.raycaster.ray.direction.y||-1);return this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction,o)}currentLod(){return this.viewH>=iA?0:this.viewH<=rA?2:1}pickAt(e,t){const i=Se.getState(),o=this.toWorld(e,t),a=aA/this.container.clientHeight*this.viewH;let c=null;const u={minX:o.x-a,maxX:o.x+a,minZ:o.z-a,maxZ:o.z+a};for(const d of this.cells.values())if(this.cellInView(d))for(const h of d.featureIds){const m=i.featureMap.get(h);if(!m||!ds(m,i).visible)continue;const v=ls(m);if(v.maxX<u.minX||v.minX>u.maxX||v.maxZ<u.minZ||v.minZ>u.maxZ)continue;let y=1/0;m.geom.type==="point"?y=Math.hypot(m.geom.x-o.x,m.geom.z-o.z):m.geom.type==="line"?y=this.distToLine(o.x,o.z,m.geom.points):y=this.distToArea(o.x,o.z,m.geom.points),y<=a&&(!c||y<c.d)&&(c={id:h,d:y})}return(c==null?void 0:c.id)??null}distToLine(e,t,i){let o=1/0;for(let a=0;a<i.length-1;a++){const[c,u]=i[a],[d,h]=i[a+1],m=d-c,g=h-u,v=m*m+g*g||1e-9;let y=((e-c)*m+(t-u)*g)/v;y=Math.max(0,Math.min(1,y)),o=Math.min(o,Math.hypot(e-(c+y*m),t-(u+y*g)))}return o}distToArea(e,t,i){let o=!1;for(let a=0,c=i.length-1;a<i.length;c=a++){const[u,d]=i[a],[h,m]=i[c];d>t!=m>t&&e<(h-u)*(t-d)/(m-d)+u&&(o=!o)}return o?0:this.distToLine(e,t,[...i,i[0]])}featuresInRect(e){const t=Se.getState(),i=new Set;for(const o of this.cells.values())if(!(o.bounds.maxX<e.minX||o.bounds.minX>e.maxX)&&!(o.bounds.maxZ<e.minZ||o.bounds.minZ>e.maxZ))for(const a of o.featureIds){const c=t.featureMap.get(a);if(!c||!ds(c,t).visible)continue;const d=ls(c);d.maxX<e.minX||d.minX>e.maxX||d.maxZ<e.minZ||d.minZ>e.maxZ||(c.geom.type==="point"?c.geom.x>=e.minX&&c.geom.x<=e.maxX&&c.geom.z>=e.minZ&&c.geom.z<=e.maxZ&&i.add(a):i.add(a))}return[...i]}featuresInLasso(e){const t=Se.getState(),i=(a,c)=>{let u=!1;for(let d=0,h=e.length-1;d<e.length;h=d++){const[m,g]=e[d],[v,y]=e[h];g>c!=y>c&&a<(v-m)*(c-g)/(y-g)+m&&(u=!u)}return u},o=[];for(const a of this.cells.values())for(const c of a.featureIds){const u=t.featureMap.get(c);if(!(!u||!ds(u,t).visible))if(u.geom.type==="point")i(u.geom.x,u.geom.z)&&o.push(c);else{const h=ls(u);i((h.minX+h.maxX)/2,(h.minZ+h.maxZ)/2)&&o.push(c)}}return[...new Set(o)]}updateSelectionRect(e,t){const o=this.selectionRect.geometry.attributes.position,a=[e.x,.4,e.z,t.x,.4,e.z,t.x,.4,e.z,t.x,.4,t.z,t.x,.4,t.z,e.x,.4,t.z,e.x,.4,t.z,e.x,.4,e.z];for(let c=0;c<a.length;c+=3)o.setXYZ(c/3,a[c],a[c+1],a[c+2]);o.needsUpdate=!0,this.selectionRect.visible=!0}cellInView(e){const t=e.bounds,i=this.viewRect();return!(t.maxX<i.minX||t.minX>i.maxX||t.maxZ<i.minZ||t.minZ>i.maxZ)}viewRect(){const e=this.viewH,t=this.container.clientWidth/this.container.clientHeight,i=e*t;return{minX:this.camera.position.x-i/2,maxX:this.camera.position.x+i/2,minZ:this.camera.position.z-e/2,maxZ:this.camera.position.z+e/2}}updateVisibility(){const e=Se.getState(),t=this.currentLod();let i=0;for(const o of this.cells.values()){if(!this.cellInView(o)){o.outline.visible=!1;for(const c of Object.values(o.layers))c.visible=!1;continue}i+=o.featureIds.length;for(const[c,u]of Object.entries(o.layers)){if(!e.layerVisible[c]){u.visible=!1;continue}if(t===0)u.visible=!1;else{if(u.visible=!0,o.dots&&(o.dots.visible=t===1),o.symbols)for(const h of o.symbols.values())h.visible=t===2;if(o.symbolOutlines)for(const h of o.symbolOutlines.values())h.visible=t===2}}o.outline.visible=t===0}this.updateLabels(t)}emitStats(){const e=this.currentLod();let t=0,i=0;for(const o of this.cells.values())this.cellInView(o)&&(t++,i+=o.featureIds.length);this.cb.onStats(e,this.zoom,t,i)}makeLabelTexture(e){const t=this.labelTextureCache.get(e);if(t)return t;const i=document.createElement("canvas"),o=i.getContext("2d"),a=22;o.font=`600 ${a}px "Microsoft YaHei", sans-serif`;const c=Math.ceil(o.measureText(e).width)+12;i.width=c,i.height=30;const u=i.getContext("2d");u.font=`600 ${a}px "Microsoft YaHei", sans-serif`,u.fillStyle="rgba(17,20,26,0.82)",fA(u,0,0,c,30,6),u.fill(),u.strokeStyle="rgba(255,255,255,0.35)",u.stroke(),u.fillStyle="#f8fafc",u.textBaseline="middle",u.fillText(e,6,16);const d=new nT(i);return d.minFilter=Ti,this.labelTextureCache.set(e,d),d}acquireSprite(){const e=this.labelPool.pop();if(e)return e.visible=!0,e;const t=new n0({transparent:!0,depthTest:!1}),i=new Qw(t);return i.renderOrder=50,this.labelGroup.add(i),this.labels.push(i),i}updateLabels(e){for(const m of this.labels)m.visible=!1;if(this.labelPool.push(...this.labels),e!==2)return;const t=Se.getState(),i=this.viewRect(),o=new Set,a=[];let c=0;const u=new Set([...t.selectedIds,t.blinkId].filter(Boolean)),d=m=>u.has(m.id)?0:m.layer==="sign"?1:m.layer==="device"?2:3,h=[];for(const m of this.cells.values())if(this.cellInView(m))for(const g of m.featureIds){const v=t.featureMap.get(g);!v||!v.label||v.geom.type!=="point"||!ds(v,t).visible||!u.has(g)&&(v.geom.x<i.minX||v.geom.x>i.maxX||v.geom.z<i.minZ||v.geom.z>i.maxZ)||h.push(v)}h.sort((m,g)=>d(m)-d(g));for(const m of h){if(c>=sA)break;if(o.has(m.label)||m.geom.type!=="point")continue;const g=m.geom.x,v=m.geom.z;if(a.some(([I,C])=>Math.hypot(I-g,C-v)<oA)&&!u.has(m.id))continue;o.add(m.label),a.push([g,v]);const M=this.acquireSprite(),w=this.makeLabelTexture(m.label);M.material.map=w,M.material.needsUpdate=!0;const S=1.15,x=w.image.width/w.image.height;M.scale.set(S*x,S,1),M.position.set(g,1.2,v-1.4),c++}}setOverlayData(e){this.clearOverlayGroup();const t=new Eo(.9,16);t.rotateX(-Math.PI/2);for(const i of e){const o=new gn(t,i.kind==="work"?this.overlayMatWork:this.overlayMatSubmit);if(o.position.set(i.x,1,i.z),o.renderOrder=61,this.overlayGroup.add(o),i.kind==="submit"&&i.tx!==void 0&&i.tz!==void 0){const a=new Wt().setFromPoints([new k(i.x,.9,i.z),new k(i.tx,.9,i.tz)]);this.overlayGroup.add(new Ea(a,this.overlayLineMat))}}}clearOverlayGroup(){for(const e of[...this.overlayGroup.children])this.overlayGroup.remove(e),e instanceof gn&&e.geometry.dispose(),e instanceof Ea&&e.geometry.dispose()}queueRebuild(){this.rebuildQueued||(this.rebuildQueued=!0,requestAnimationFrame(()=>{this.rebuildQueued=!1,this.rebuild()}))}rebuild(){for(const e of this.cells.values()){for(const t of Object.values(e.layers))this.root.remove(t),t.traverse(i=>{(i instanceof gn||i instanceof gc)&&(i.geometry.dispose(),Array.isArray(i.material)?i.material.forEach(o=>o.dispose()):i.material.dispose())});this.root.remove(e.outline),e.outline.geometry.dispose(),e.outline.material.dispose()}this.cells.clear(),this.buildCells(),this.updateVisibility()}updateHighlight(){const e=Se.getState(),t=e.selectedIds[0]??null;if(!t){this.highlight.visible=!1;return}const i=e.featureMap.get(t);if(!i||i.geom.type!=="point"){this.highlight.visible=!1;return}this.highlight.visible=!0,this.highlight.position.set(i.geom.x,.6,i.geom.z);const o=(i.geom.size??1)*1.05*.55+.55;this.highlight.scale.setScalar(o)}triggerBlink(e){this.blinkId=e,this.blinkUntil=performance.now()+3200;const t=Se.getState().featureMap.get(e);t&&this.focusOn(t.geom.type==="point"?t.geom.x:(ls(t).minX+ls(t).maxX)/2,t.geom.type==="point"?t.geom.z:(ls(t).minZ+ls(t).maxZ)/2)}tick(){const e=Se.getState(),t=performance.now(),i=`${e.sceneVersion}|${Object.values(e.layerVisible).join("")}|${Object.keys(e.overrides).length}`;if(i!==this.lastStore){const o=e.sceneVersion!==this.sceneVersion;this.lastStore=i,this.sceneVersion=e.sceneVersion,o?this.queueRebuild():this.updateVisibility()}if(t-this.lastStatsEmit>250&&(this.lastStatsEmit=t,this.emitStats()),e.blinkId&&e.blinkNonce!==this.blinkNonce&&(this.blinkNonce=e.blinkNonce,this.triggerBlink(e.blinkId)),this.updateHighlight(),this.blinkId&&performance.now()<this.blinkUntil){const o=e.featureMap.get(this.blinkId);if(o&&o.geom.type==="point"){this.blinkRing.visible=!0;const a=1+.3*Math.sin(performance.now()/130),c=(o.geom.size??1)*1.05*.55+.7;this.blinkRing.position.set(o.geom.x,.8,o.geom.z),this.blinkRing.scale.setScalar(c*a),this.blinkRing.material.opacity=.45+.45*Math.abs(Math.sin(performance.now()/200))}}else this.blinkRing.visible=!1,this.blinkId=null;this.renderer.render(this.scene,this.camera)}dispose(){this.disposed=!0,cancelAnimationFrame(this.raf),this.resizeObs.disconnect();const e=this.renderer.domElement;e.removeEventListener("pointerdown",this.onPointerDown),e.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp),e.removeEventListener("wheel",this.onWheel),this.renderer.dispose(),e.remove()}}function hA(){const s=Yt.useRef(null),e=Yt.useRef(null);Yt.useEffect(()=>{if(!s.current)return;const M=new dA(s.current,{onPick:w=>Se.getState().setSelected(w?[w]:[]),onBoxSelect:w=>Se.getState().setSelected(w),onLassoSelect:w=>{const S=Se.getState();S.taskDraft?S.addDraftRefs(w):S.setSelected(w)},onPlace:(w,S)=>{const x=Se.getState(),I=x.selectedIds[0];if(!I){window.alert("请先在右侧要素列表或图上选中一个要摆放的目标要素");return}const C=x.featureMap.get(I);C&&x.upsertPlacement({featureId:I,layer:C.layer,x:w,z:S})},onStats:(w,S,x,I)=>{Se.getState().setViewStats({lod:w,zoom:S,visibleCells:x,visibleFeatures:I,totalCells:Se.getState().grid.size})}});return e.current=M,()=>{M.dispose(),e.current=null}},[]);const t=Se(M=>M.focusNonce),i=Se(M=>M.focusTargetId),o=Se(M=>M.featureMap);Yt.useEffect(()=>{if(!i||!e.current)return;const M=o.get(i);!M||M.geom.type!=="point"||e.current.focusOn(M.geom.x,M.geom.z)},[t,i,o]);const a=Se(M=>M.placementMode),c=Se(M=>M.workingPlacements),u=Se(M=>M.activeSubmissionId),d=Se(M=>M.submissions);Yt.useEffect(()=>{const M=e.current;if(!M)return;if(a){M.setOverlayData(c.map(S=>({x:S.x,z:S.z,kind:"work"})));return}const w=d.find(S=>S.id===u);w?M.setOverlayData(w.placements.map(S=>{const x=o.get(S.featureId),I=(x==null?void 0:x.geom.type)==="point"?x.geom.x:S.x,C=(x==null?void 0:x.geom.type)==="point"?x.geom.z:S.z;return{x:S.x,z:S.z,kind:"submit",tx:I,tz:C}})):M.setOverlayData([])},[a,c,u,d,o]);const h=Se(M=>M.viewStats),m=Se(M=>M.taskDraft),g=Se(M=>M.features.length),v=["轮廓块 LOD0","简化符号 LOD1","完整符号+标注 LOD2"][h.lod],y=M=>{var w;return(w=s.current)==null?void 0:w.dispatchEvent(new WheelEvent("wheel",{deltaY:M,bubbles:!0,cancelable:!0}))};return P.jsxs("div",{className:"map-wrap",ref:s,children:[P.jsxs("div",{className:"map-tools",children:[P.jsx("button",{title:"全幅显示",onClick:()=>{var M;return(M=e.current)==null?void 0:M.fitAll()},children:"⛶"}),P.jsx("button",{title:"放大",onClick:()=>y(-120),children:"＋"}),P.jsx("button",{title:"缩小",onClick:()=>y(120),children:"－"})]}),a&&P.jsxs("div",{className:"map-mode-banner",children:["摆放模式:先选中目标要素,再在图上点击位置摆放 · 已摆放 ",c.length," 处"]}),m&&P.jsxs("div",{className:"map-mode-banner",style:{background:"rgba(157,23,77,0.92)",borderColor:"#f472b6"},children:["圈任务模式:按住 Shift 拖鼠标套索圈选桩位/车道 · 已圈 ",m.pileIds.length+m.laneIds.length," 个要素"]}),P.jsxs("div",{className:"map-status",children:[P.jsxs("span",{className:"chip",children:["层级 ",P.jsx("b",{children:v})]}),P.jsxs("span",{className:"chip",children:["缩放 ",P.jsxs("b",{children:[h.zoom.toFixed(2),"×"]})]}),P.jsxs("span",{className:"chip",children:["视口网格 ",P.jsx("b",{children:h.visibleCells}),"/",h.totalCells]}),P.jsxs("span",{className:"chip",children:["视口要素 ",P.jsx("b",{children:h.visibleFeatures}),"/",g]}),P.jsx("span",{className:"chip",children:"左键框选 · Shift+左键套索 · 右键平移 · 滚轮缩放"})]})]})}function pA(){const s=Se(u=>u.role),e=Se(u=>u.setRole),t=Se(u=>u.students),i=Se(u=>u.currentStudentId),o=Se(u=>u.setCurrentStudent),a=Se(u=>u.resetDemo),c=Se(u=>u.features.length);return P.jsxs("div",{className:"app",children:[P.jsxs("header",{className:"topbar",children:[P.jsx("h1",{children:"驾校训练场分层平面图与科目教学系统"}),P.jsxs("span",{className:"chip",children:["要素总量 ",P.jsx("b",{children:c.toLocaleString()})," 条 · 五层管理 · 网格视口渲染"]}),P.jsx("div",{className:"spacer"}),s==="student"&&P.jsx("select",{value:i,onChange:u=>o(u.target.value),children:t.map(u=>P.jsxs("option",{value:u.id,children:[u.name,"(",u.classNo,")"]},u.id))}),P.jsxs("div",{className:"role-switch",children:[P.jsx("button",{className:s==="coach"?"active":"",onClick:()=>e("coach"),children:"教练端"}),P.jsx("button",{className:s==="student"?"active":"",onClick:()=>e("student"),children:"学员端"})]}),P.jsx("button",{className:"danger",onClick:()=>{window.confirm("确认重置全部演示数据(任务、提交、覆盖项)?")&&a()},children:"重置数据"})]}),P.jsxs("div",{className:"main",children:[P.jsx(GT,{}),P.jsx(hA,{}),P.jsx(tA,{})]})]})}window.__store=Se;ix.createRoot(document.getElementById("root")).render(P.jsx(xv.StrictMode,{children:P.jsx(pA,{})}));
