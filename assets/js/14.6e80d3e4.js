(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{395:function(n,t,e){"use strict";e.r(t);e(106);var a={data:function(){return{data:[{id:"1",name:"1",children:null,isParent:!0}]}},methods:{normalizer:function(n){return{label:n.name,children:n.children}},loadOption:function(n){var t=n.action,e=n.parentNode,a=n.callback;"LOAD_CHILDREN_OPTIONS"===t&&"1"===e.id&&setTimeout((function(){e.children=[{id:"1-1",name:"1-1"},{id:"1-2",name:"1-2"}],a()}),1e3)}}},i=e(1),l=Object(i.a)(a,(function(){var n=this.$createElement,t=this._self._c||n;return t("div",{staticClass:"demo"},[t("fancy-select",{attrs:{"tree-data":this.data,normalizer:this.normalizer,limit:3,loadOptions:this.loadOption}})],1)}),[],!1,null,null,null);t.default=l.exports}}]);