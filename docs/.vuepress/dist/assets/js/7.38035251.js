(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{315:function(e,n,t){"use strict";function a(e,n){var t=[];return function e(n,t,a){for(var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"",i=0;i<t;i++){var l={name:Math.random(0,1),expanded:!1,children:[],id:r+(i+1)};n.push(l),a>0?e(l.children,t,a-1,l.id+"-"):delete l.children}}(t,e,n),t}t.d(n,"a",(function(){return a}))},379:function(e,n,t){"use strict";t.r(n);t(102);var a=t(315),r={data:function(){return{data:Object(a.a)(10,2)}},methods:{normalizer:function(e){return{label:e.name,children:e.children}}}},i=t(2),l=Object(i.a)(r,(function(){var e=this.$createElement,n=this._self._c||e;return n("div",{staticClass:"demo"},[n("fancy-select",{attrs:{"tree-data":this.data,normalizer:this.normalizer,limit:3,"default-expand-level":3}})],1)}),[],!1,null,null,null);n.default=l.exports}}]);