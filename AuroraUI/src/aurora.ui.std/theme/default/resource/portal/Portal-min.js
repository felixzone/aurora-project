(function(b){var h,f,o,c="margin-right",n="div.portal-proxy",d="table.portal-item-wrap",j="portal-item-btn-over",p="portal-item-btn-down",q="mousemove",g="mousedown",e="mouseup",k="beforeclose",i="close",m="itemclose",a="drag",l="drop";b.Portal=Ext.extend(b.Component,{portals:[],initComponent:function(r){b.Portal.superclass.initComponent.call(this,r);var t=this,s=t.wrap;t.proxy=s.child(n);s.select(d).each(function(u,v,w,x){t.createPortalItem(Ext.get(u.dom).id,t.items[w])})},initEvents:function(){b.Portal.superclass.initEvents.call(this);this.addEvents(m)},createPortalItem:function(u,s){var t=this,r=t.portals;r.push(new b.PortalItem(Ext.apply(s||{},{id:u,closeable:true,proxy:t.proxy,listeners:{close:function(w){var v=r.indexOf(w);r.splice(v,1);t.fireEvent(m,t,w,v)},drop:function(w,v){r.splice(r.indexOf(w),1);r.splice(v,0,w)}}})))},destroy:function(){var s=this,r=s.wrap;b.Portal.superclass.destroy.call(s);Ext.each(s.portals,function(t){t.destroy()})}});b.PortalItem=Ext.extend(b.Component,{constructor:function(r){b.Portal.superclass.constructor.call(this,r)},initComponent:function(r){b.PortalItem.superclass.initComponent.call(this,r);var t=this,s=t.wrap;t.cellspacing=parseFloat(s.getStyle(c));t.head=s.child("td.portal-item-caption-label");t.body=s.child("div.portal-item-content");t.closeBtn=t.wrap.child("div.portal-item-close")},processListener:function(r){var s=this;b.PortalItem.superclass.processListener.call(s,r);if(s.closeable){s.closeBtn[r]("click",s.onCloseClick,s)[r]("mouseover",s.onCloseOver,s)[r]("mouseout",s.onCloseOut,s)[r](g,s.onCloseDown,s)}s.head[r](g,s.onMouseDown,s)},initEvents:function(){b.PortalItem.superclass.initEvents.call(this);this.addEvents(a,l,k,i)},close:function(){var r=this;if(r.fireEvent(k,r)){r.fireEvent(i,r);r.destroy()}},onMouseDown:function(u){var s=this,v=u.xy,r=s.wrap,t=r.getXY();r.setStyle({margin:""}).setOpacity(0.9).position("absolute",null,t[0],t[1]);s.body.hide();h=v[0]-t[0];f=v[1]-t[1];s.proxy.insertBefore(r).setStyle({display:""});o=r.parent().query(d);Ext.fly(document).on(q,s.onMouseMove,s).on(e,s.onMouseUp,s);s.fireEvent(a,s,o.indexOf(r.dom))},onMouseMove:function(v){var u=this,A=v.xy,r=A[0],z=A[1],t=u.wrap,w=u.cellspacing/2,s=o.indexOf(t.dom);t.moveTo(r-h,z-f);Ext.each(o,function(y,B){if(y!=t.dom){y=Ext.fly(y);var D=y.getXY(),C=y.getWidth(),x=y.getHeight();if(r>D[0]-w&&r<D[0]+C+w&&z>D[1]-w&&z<D[1]+x+w){if(y.prev(n)){if(s>B){B+=1}u.proxy.insertAfter(y)}else{u.proxy.insertBefore(y);if(s<B){B-=1}}u.proxy.index=B;return false}}})},onMouseUp:function(s){var r=this,t=r.cellspacing;r.wrap.setXY(r.proxy.getXY(),{callback:function(){r.wrap.insertBefore(r.proxy.setStyle({display:"none"})).clearPositioning().clearOpacity().setStyle({margin:t+"px "+t+"px 0 0"});r.body.show();Ext.fly(document).un(q,r.onMouseMove,r).un(e,r.onMouseUp,r);r.fireEvent(l,r,r.proxy.index);o=null;r.proxy.index=null},duration:0.15})},onCloseClick:function(r){r.stopEvent();this.close()},onCloseOver:function(r){this.closeBtn.addClass(j)},onCloseOut:function(r){this.closeBtn.removeClass(j)},onCloseDown:function(s){var r=this;r.closeBtn.removeClass(j).addClass(p);Ext.get(document.documentElement).on(e,r.onCloseUp,r)},onCloseUp:function(s){var r=this;r.closeBtn.removeClass(p);Ext.get(document.documentElement).un(e,r.onCloseUp,r)},clearBody:function(){Ext.iterate(this.body.cmps,function(r,s){if(s.destroy){try{s.destroy()}catch(t){alert("销毁portal出错: "+t)}}})},destroy:function(){var s=this,r=s.wrap;b.PortalItem.superclass.destroy.call(s);s.clearBody();r.setOpacity(0,{callback:function(){r.setStyle(c,0);r.setWidth(3,{callback:function(){r.remove()}})}})}})})($A);