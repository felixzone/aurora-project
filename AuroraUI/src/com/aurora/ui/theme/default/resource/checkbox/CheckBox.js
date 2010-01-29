$A.CheckBox = Ext.extend($A.Component,{
	readOnly:false,	
	checkedCss:'item-ckb-c',
	uncheckedCss:'item-ckb-u',
	readonyCheckedCss:'item-ckb-readonly-c',
	readonlyUncheckedCss:'item-ckb-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.CheckBox.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		$A.CheckBox.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		this.el=this.wrap.child('div[atype=checkbox]');
	},
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    },
	initEvents:function(){
		$A.CheckBox.superclass.initEvents.call(this);  	
		this.addEvents('click');    
	},
	destroy : function(){
    	$A.CheckBox.superclass.destroy.call(this);
    	delete this.el;
    },
	onClick: function(event){
		if(!this.readonly){
			this.checked=this.checked?false:true;				
			this.setValue(this.checked);
			this.fireEvent('click',this, this.checked);
		}
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked= v===this.checkedvalue ? true: false;
		}
		this.initStatus();
		var value =this.checked==true?this.checkedvalue:this.uncheckedvalue;		
		$A.CheckBox.superclass.setValue.call(this,value, silent);
	},
	setReadOnly:function(b){
		if(typeof(b)==='boolean'){
			this.readonly=b?true:false;	
			this.initStatus();		
		}		
	},
	initStatus:function(){
		this.el.removeClass(this.checkedCss);
		this.el.removeClass(this.uncheckedCss);
		this.el.removeClass(this.readonyCheckedCss);
		this.el.removeClass(this.readonlyUncheckedCss);
		if (this.readonly) {				
			this.el.addClass(this.checked ? this.readonyCheckedCss : this.readonlyUncheckedCss);			
		}else{
			this.el.addClass(this.checked ? this.checkedCss : this.uncheckedCss);
		}		
	}			
});