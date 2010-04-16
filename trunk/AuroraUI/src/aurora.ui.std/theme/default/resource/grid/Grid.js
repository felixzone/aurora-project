$A.Grid = Ext.extend($A.Component,{
	bgc:'background-color',
	scor:'#dfeaf5',//'#d9e7ed',
	ocor:'#ffe3a8',
	cecls:'cell-editor',
	constructor: function(config){
		this.overId = null;
		this.selectedId = null;
		this.lockWidth = 0;
		$A.Grid.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		$A.Grid.superclass.initComponent.call(this, config);
		this.uc = this.wrap.child('div[atype=grid.uc]');
		this.uh = this.wrap.child('div[atype=grid.uh]');
    	this.ub = this.wrap.child('div[atype=grid.ub]'); 
		this.uht = this.wrap.child('table[atype=grid.uht]'); 
		
		this.lc = this.wrap.child('div[atype=grid.lc]'); 
		this.lh = this.wrap.child('div[atype=grid.lh]');
		this.lb = this.wrap.child('div[atype=grid.lb]');
		this.lht = this.wrap.child('table[atype=grid.lht]'); 

		this.sp = this.wrap.child('div[atype=grid.spliter]');
		Ext.getBody().insertFirst(this.sp)
		this.fs = this.wrap.child('a[atype=grid.focus]');
		
		var lock =[],unlock = [],columns=[];
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.lock == true){
				lock.add(c);
			}else{
				unlock.add(c);
			}
		}
		this.columns = lock.concat(unlock);
    	this.initTemplate();
	},
	processListener: function(ou){
		$A.Grid.superclass.initComponent.call(this, ou);
		this.wrap[ou]('click',this.focus,this);
		this.fs[ou](Ext.isOpera ? "keypress" : "keydown", this.handleKeyDown,  this);
		this.ub[ou]('scroll',this.syncScroll, this);
		this.ub[ou]('click',this.onClick, this);
		this.ub[ou]('dblclick',this.onDblclick, this);
		this.uht[ou]('mousemove',this.onUnLockHeadMove, this);
		this.uh[ou]('mousedown', this.onHeadMouseDown,this);
		this.uh[ou]('click', this.onHeadClick,this);
		if(this.lb){
			this.lb[ou]('click',this.onClick, this);
			this.lb[ou]('dblclick',this.onDblclick, this);
		}
		if(this.lht) this.lht[ou]('mousemove',this.onLockHeadMove, this);
		if(this.lh) this.lh[ou]('mousedown', this.onHeadMouseDown,this);
		if(this.lh) this.lh[ou]('click', this.onHeadClick,this);
	},
	initEvents:function(){
		$A.Grid.superclass.initEvents.call(this);
	},
	syncScroll : function(){
		this.hideEditor();
		this.uh.dom.scrollLeft = this.ub.dom.scrollLeft;
		if(this.lb) this.lb.dom.scrollTop = this.ub.dom.scrollTop;
	},
	handleKeyDown : function(e){
		e.stopEvent();
		var key = e.getKey();
		if(e.ctrlKey&&e.keyCode == 86){
			var text = window.clipboardData.getData('text');
			if(text){
				var columns = this.columns;
				var rows = text.split('\n');
				for(var i=0,l=rows.length;i<l;i++){
					var row = rows[i];
					var values = row.split('\t');
					if(values=='')continue;
					var data = {}; 
					for(var j=0,v=0,k=this.columns.length;j<k;j++){
						var c = this.columns[j];
						if(this.isFunctionCol(c)) continue;
						if(c.hidden != true) {
							data[c.dataindex] = values[v];
							v++
						}
					}
					this.dataset.create(data);
				}
			}
		}else{
			if(key == 38 || key == 40 || key == 33 || key == 34) {
				if(this.dataset.loading == true) return;
				var row;
				switch(e.getKey()){
					case 33:
						this.dataset.prePage();
						break;
					case 34:
						this.dataset.nextPage();
						break;
					case 38:
						this.dataset.pre();
						break;
					case 40:
						this.dataset.next();
						break;
				}
			}
		}
		this.fireEvent('keydown', this, e)
	},
	processDataSetLiestener: function(ou){
		var ds = this.dataset;
		if(ds){
			ds[ou]('metachange', this.onRefresh, this);
			ds[ou]('update', this.onUpdate, this);
	    	ds[ou]('add', this.onAdd, this);
	    	ds[ou]('load', this.onLoad, this);
	    	ds[ou]('valid', this.onValid, this);
	    	ds[ou]('remove', this.onRemove, this);
	    	ds[ou]('clear', this.onLoad, this);
	    	ds[ou]('refresh',this.onRefresh,this);
	    	ds[ou]('fieldchange', this.onFieldChange, this);
	    	ds[ou]('indexchange', this.onIndexChange, this);
	    	ds[ou]('select', this.onSelect, this);
	    	ds[ou]('unselect', this.onUnSelect, this);
		}
	},
	bind : function(ds){
		if(typeof(ds)==='string'){
			ds = $(ds);
			if(!ds) return;
		}
		this.dataset = ds;
		this.processDataSetLiestener('on');
    	this.onLoad();
	},
	initTemplate : function(){
		this.rowTdTpl = new Ext.Template('<TD atype="{atype}" class="grid-rowbox" recordid="{recordid}">');
		this.tdTpl = new Ext.Template('<TD style="visibility:{visibility};text-align:{align}" dataindex="{dataindex}" atype="grid-cell" recordid="{recordid}">');
		this.cellTpl = new Ext.Template('<div class="grid-cell {cellcls}" id="'+this.id+'_{dataindex}_{recordid}">{text}</div>');		
		this.cbTpl = new Ext.Template('<center><div class="{cellcls}" id="'+this.id+'_{dataindex}_{recordid}"></div></center>');
	},
	getCheckBoxStatus: function(record, dataIndex) {
		var field = this.dataset.getField(dataIndex)
		var cv = field.getPropertity('checkedvalue');
		var uv = field.getPropertity('uncheckedvalue');
		var value = record.data[dataIndex];
		return (value && value.trim() == cv.trim()) ? 'item-ckb-c' : 'item-ckb-u';
	},
	createCell : function(col,record,includTd){
		var field = record.getMeta().getField(col.dataindex);
		var data = {
			width:col.width,
			recordid:record.id,
			visibility: col.hidden == true ? 'hidden' : 'visible',
			dataindex:col.dataindex
		}
		var cellTpl;
		var tdTpl = this.tdTpl;
		if(col.type == 'rowcheck'){
			tdTpl = this.rowTdTpl;
			data = Ext.apply(data,{
				align:'center',
				atype:'grid.rowcheck',
				cellcls: 'grid-ckb item-ckb-u'
			})
			cellTpl =  this.cbTpl;
		}else if(col.type == 'rowradio'){
			tdTpl = this.rowTdTpl;
			data = Ext.apply(data,{
				align:'center',
				atype:'grid.rowradio',
				cellcls: 'grid-radio item-radio-img-u'
			})
			cellTpl =  this.cbTpl;
		}else if(col.type == 'cellcheck'){
			data = Ext.apply(data,{
				align:'center',
				cellcls: 'grid-ckb ' + this.getCheckBoxStatus(record, col.dataindex)
			})
			cellTpl =  this.cbTpl;
		}else{
			var cls = col.editor ? this.cecls : '';
			if(Ext.isEmpty(record.data[col.dataindex]) && record.isNew == true && field.get('required') == true){
				cls = cls + ' item-notBlank'
			}
			data = Ext.apply(data,{
				align:col.align||'left',
				cellcls: cls,
				text:this.renderText(record,col,record.data[col.dataindex])
			})
			cellTpl =  this.cellTpl;
		}
		var sb = [];
		if(includTd)sb.add(tdTpl.applyTemplate(data));
		sb.add(cellTpl.applyTemplate(data));
		if(includTd)sb.add('</TD>')
		return sb.join('');
	},
	createRow : function(type, row, cols, item){
		var sb = [];
		sb.add('<TR id="'+this.id+'$'+type+'-'+item.id+'" class="'+(row % 2==0 ? '' : 'row-alt')+'">');
		for(var i=0,l=cols.length;i<l;i++){
			var c = cols[i];
			sb.add(this.createCell(c,item, true))			
		}
		sb.add('</TR>');
		return sb.join('');
	},
	renderText : function(record,col,value){
		var renderer = col.renderer
		if(renderer&&!Ext.isEmpty(value)){
			var rder;
			if(renderer.indexOf('Aurora.') != -1){
				rder = $A[renderer.substr(7,renderer.length)]
			}else{
				rder = window[renderer];
			}
			if(rder == null){
				alert("未找到"+renderer+"方法!")
				return value;
			}
			value = rder.call(window,value,record, col.dataindex);
			return value == null ? '' : value;
		}
		return value == null ? '' : value;
	},
	createTH : function(cols){
		var sb = [];
		sb.add('<TR class="grid-hl">');
		for(var i=0,l=cols.length;i<l;i++){
			var w = cols[i].width;
			if(cols[i].hidden == true) w = 0;
			sb.add('<TH dataindex="'+cols[i].dataindex+'" style="height:0px;width:'+w+'px"></TH>');
		}
		sb.add('</TR>');
		return sb.join('');
	},
	onLoad : function(focus){
		var cb = Ext.fly(this.wrap).child('div[atype=grid.headcheck]');
		if(this.selectable && this.selectionmodel=='multiple')this.setCheckBoxStatus(cb,false);
		if(this.lb)
		this.renderLockArea();
		this.renderUnLockAread();
		if(focus !== false) this.focus.defer(10,this)
	},
	focus: function(){
		this.fs.focus();
	},
	renderLockArea : function(){
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			if(columns[i].lock === true){
				cols.add(columns[i]);
				if(columns[i].hidden !== true) v += columns[i].width;
			}
		}
		this.lockWidth = v;
		sb.add('<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  width="'+v+'"><TBODY>');
		sb.add(this.createTH(cols));
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			sb.add(this.createRow('l', i, cols, this.dataset.getAt(i)));
		}
		sb.add('</TBODY></TABLE>');
		sb.add('<DIV style="height:17px"></DIV>');
		this.lb.update(sb.join(''));
		this.lbt = this.lb.child('table[atype=grid.lbt]'); 
	},
	renderUnLockAread : function(){
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			if(columns[i].lock !== true){
				cols.add(columns[i]);
				if(columns[i].hidden !== true) v += columns[i].width;
			}
		}
		sb.add('<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" width="'+v+'"><TBODY>');
		sb.add(this.createTH(cols));
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			sb.add(this.createRow('u', i, cols, this.dataset.getAt(i)));
		}
		sb.add('</TBODY></TABLE>');
		this.ub.update(sb.join(''));
		this.ubt = this.ub.child('table[atype=grid.ubt]'); 
	},
    isOverSplitLine : function(x){
		var v = 0;		
		var isOver = false;
		this.overColIndex = -1;
		var columns = this.columns;
		for(var i=0,l=columns.length;i<l;i++){
			var c = columns[i];
			if(c.hidden !== true) v += c.width;
			if(x < v+3 && x > v-3 && c.resizable == true){
				isOver = true;
				this.overColIndex = i;
				break;
			}
		}
		return isOver;
	},
	onRefresh : function(){
		this.onLoad(false)
	},
	onIndexChange:function(ds, r){
		var index = this.getDataIndex(r.id);
		if(index == -1)return;
		if(r != this.selectRecord){
			this.selectRow(index, false);
		}
	},
	isFunctionCol: function(c){
		return c.type == 'rowcheck' || c.type == 'rowradio'
	},
	onAdd : function(ds,record,index){
		if(this.lb)
		var sb = [];var cols = [];
		var v = 0;
		var columns = this.columns;
		var row = this.dataset.data.length-1;
		if(this.lbt){
			var ltr = document.createElement("TR");
			ltr.id=this.id+'$l'+'-'+record.id;
			ltr.className=(row % 2==0 ? '' : 'row-alt');
			for(var i=0,l=columns.length;i<l;i++){
				var col = columns[i];
				if(col.lock == true){
					var td = document.createElement("TD");
					td.recordid=''+record.id;
					if(col.type == 'rowcheck') {
						td.atype = 'grid.rowcheck';
						td.className = 'grid-rowbox';
					}else{
						td.style.visibility=col.hidden == true ? 'hidden' : 'visible';
						td.style.textAlign=col.align||'left';
						if(!this.isFunctionCol(col)) td.dataindex=col.dataindex;
						td.atype='grid-cell';					
					}
					var cell = this.createCell(col,record, false);
					td.innerHTML = cell;
					ltr.appendChild(td);
				}
			}
			this.lbt.dom.tBodies[0].appendChild(ltr);
		}
		
		var utr = document.createElement("TR");
		utr.id=this.id+'$u'+'-'+record.id;
		utr.className=(row % 2==0 ? '' : 'row-alt');
		for(var i=0,l=columns.length;i<l;i++){
			var col = columns[i];
			if(col.lock !== true){
				var td = document.createElement("TD");
				td.style.visibility=col.hidden == true ? 'hidden' : 'visible';
				td.style.textAlign=col.align||'left';
				td.dataindex=col.dataindex;
				td.recordid=record.id;
				td.atype='grid-cell';
				var cell = this.createCell(col,record,false);
				td.innerHTML = cell;
				utr.appendChild(td);
			}
		}
		this.ubt.dom.tBodies[0].appendChild(utr);
	},
	onUpdate : function(ds,record, name, value){
		var div = Ext.get(this.id+'_'+name+'_'+record.id);
		if(div){
			var c = this.findColByDataIndex(name);
			if(c&&c.type=='cellcheck'){
				div.removeClass('item-ckb-c');
				div.removeClass('item-ckb-u')
				var cls = this.getCheckBoxStatus(record, name);
				div.addClass(cls)
			}else{
				var text =  this.renderText(record,c, value);
				div.update(text);
			}
		}		
	},
	onValid : function(ds, record, name, valid){
		var c = this.findColByDataIndex(name);
		if(c&&c.editor){
			var div = Ext.get(this.id+'_'+name+'_'+record.id);
			if(div) {
				if(valid == false){
					div.addClass('item-invalid');
				}else{
					div.removeClass('item-invalid');
					div.removeClass('item-notBlank');
				}
			}
		}
	},
	onRemove : function(ds,record,index){
		var lrow = Ext.get(this.id+'$l-'+record.id);
		if(lrow)lrow.remove();
		
		var urow = Ext.get(this.id+'$u-'+record.id);
		if(urow)urow.remove();
	},
	onClear : function(){
		
	},
	onFieldChange : function(){
		
	},
//	onRowMouseOver : function(e){
//		if(Ext.fly(e.target).hasClass('grid-cell')){
//			var rid = Ext.fly(e.target).getAttributeNS("","recordid");
//			var row = this.getDataIndex(rid);
//			if(row == -1)return;
//			if(rid != this.overId)
//			if(this.overlockTr) this.overlockTr.setStyle(this.bgc, this.selectedId ==this.overId ? '#ffe3a8' : '');
//			if(this.overUnlockTr)  this.overUnlockTr.setStyle(this.bgc,this.selectedId ==this.overId ? '#ffe3a8' : '');
//			this.overId = rid;
//			this.overlockTr = Ext.get(document.getElementById(this.id+'$l-'+rid));
//			if(this.overlockTr)this.overlockTr.setStyle(this.bgc,'#d9e7ed');
//			this.overUnlockTr = Ext.get(document.getElementById(this.id+'$u-'+rid));
//			this.overUnlockTr.setStyle(this.bgc,'#d9e7ed');
//		}
//	},
	getDataIndex : function(rid){
		var index = -1;
		for(var i=0,l=this.dataset.data.length;i<l;i++){
			var item = this.dataset.getAt(i);
			if(item.id == rid){
				index = i;
				break;
			}
		}
		return index;
	},
	onSelect : function(ds,record){
		var cb = Ext.get(this.id+'__'+record.id);
		if(cb && this.selectable && this.selectionmodel=='multiple') {
			this.setCheckBoxStatus(cb, true);
		}else{
			this.setRadioStatus(cb,true);
		}
	},
	onUnSelect : function(ds,record){
		var cb = Ext.get(this.id+'__'+record.id);
		if(cb && this.selectable && this.selectionmodel=='multiple') {
			this.setCheckBoxStatus(cb, false);
		}else{
			this.setRadioStatus(cb,false);
		}
	},
	onDblclick : function(e){
		var target = Ext.fly(e.target).findParent('td[atype=grid-cell]');
		if(target){
			var rid = Ext.fly(target).getAttributeNS("","recordid");
			var record = this.dataset.findById(rid);
			var row = this.dataset.indexOf(record);
			var dataindex = Ext.fly(target).getAttributeNS("","dataindex");
			this.fireEvent('dblclick', this, record, row, dataindex)
		}
	},
	onClick : function(e) {
		var target = Ext.fly(e.target).findParent('td');
		if(target){
			var atype = Ext.fly(target).getAttributeNS("","atype");
			var rid = Ext.fly(target).getAttributeNS("","recordid");
			if(atype=='grid-cell'){
				var record = this.dataset.findById(rid);
				var row = this.dataset.indexOf(record);
				var dataindex = Ext.fly(target).getAttributeNS("","dataindex");
				this.fireEvent('cellclick', this, row, dataindex, record);
				this.showEditor(row,dataindex);
				this.fireEvent('rowclick', this, row, record);
			}else if(atype=='grid.rowcheck'){				
				var cb = Ext.get(this.id+'__'+rid);
				var checked = cb.hasClass('item-ckb-c');
				(checked) ? this.dataset.unSelect(rid) : this.dataset.select(rid);
			}else if(atype=='grid.rowradio'){
				this.dataset.select(rid);
			}
		}
	},
	setEditor: function(dataindex,editor){
		var col = this.findColByDataIndex(dataindex);
		col.editor = editor;
		var div = Ext.get(this.id+'_'+dataindex+'_'+this.selectRecord.id)
		if(editor == ''){
			div.removeClass(this.cecls)
		}else{
			if(!div.hasClass(this.cecls))Ext.fly(div).addClass(this.cecls)
		}
	},
	showEditor : function(row, dataindex){		
		if(row == -1)return;
		var col = this.findColByDataIndex(dataindex);
		if(!col)return;
		var record = this.dataset.getAt(row);
		if(!record)return;
		if(record.id != this.selectedId);
		this.selectRow(row);
		this.focusColumn(dataindex);
		
		if(col.editorfunction) {
			var ef = window[col.editorfunction];
			if(ef==null) {
				alert("未找到"+col.editorfunction+"方法!") ;
				return;
			}
			var editor = ef.call(window,record)
			this.setEditor(dataindex, editor);
		}
		var editor = col.editor;
		if(col.type == 'cellcheck'){
			var field = this.dataset.getField(dataindex)
			var cv = field.getPropertity('checkedvalue');
			var uv = field.getPropertity('uncheckedvalue');
			var v = record.get(dataindex);
			record.set(dataindex, v == cv ? uv : cv);
		} else if(editor){
			var dom = document.getElementById(this.id+'_'+dataindex+'_'+record.id);
			var xy = Ext.fly(dom).getXY();
			var sf = this;
			setTimeout(function(){
				var v = record.get(dataindex)
				sf.currentEditor = {
					record:record,
					ov:v,
					dataindex:dataindex,
					editor:$(editor)
				};
				var ed = sf.currentEditor.editor;
				if(ed){
					ed.setHeight(Ext.fly(dom.parentNode).getHeight()-5)
					ed.setWidth(Ext.fly(dom.parentNode).getWidth()-7);
					ed.isFireEvent = true;
					ed.isHidden = false;
					ed.move(xy[0],xy[1])
					ed.bind(sf.dataset, dataindex);
					ed.rerender(record);
					ed.focus();
					Ext.get(document.documentElement).on("mousedown", sf.onEditorBlur, sf);
				}
			},1)
		}			
	},
	focusRow : function(row){
		var r = 25;
		var stop = this.ub.getScroll().top;
		if(row*r<stop){
			this.ub.scrollTo('top',row*r-1)
		}
		if((row+1)*r>(stop+this.ub.getHeight())){
			this.ub.scrollTo('top',(row+1)*r-this.ub.getHeight())
		}
		this.focus();
	},
	focusColumn: function(dataIndex){
		var r = 25;
		var sleft = this.ub.getScroll().left;
		var ll = lr = lw = tw = 0;
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.dataindex && c.dataindex == dataIndex) {
//			if(c.dataindex && c.dataindex.toLowerCase() == dataIndex.toLowerCase()) {
				tw = c.width;
			}
			if(c.hidden !== true){
				if(c.lock === true){
					lw += c.width;
				}else{
					if(tw==0) ll += c.width;
				}
			}
		}
		lr = ll + tw;
		if(ll<sleft){
			this.ub.scrollTo('left',ll)
		}
		if((lr-sleft)>(this.width-lw)){
			this.ub.scrollTo('left',lr  - this.width + lw)
		}
		this.focus();
	},
	hideEditor : function(){
		if(this.currentEditor && this.currentEditor.editor){
			var ed = this.currentEditor.editor;
			var needHide = true;
			if(ed.canHide){
				needHide = ed.canHide();
			}
			if(needHide) {
				Ext.get(document.documentElement).un("mousedown", this.onEditorBlur, this);
				var ed = this.currentEditor.editor;
				ed.move(-10000,-10000);
				ed.isFireEvent = false;
				ed.isHidden = true;
			}
		}
	},
	onEditorBlur : function(e){
		if(this.currentEditor && !this.currentEditor.editor.isEventFromComponent(e.target)) {			
			this.hideEditor();
		}
	},
	onLockHeadMove : function(e){
//		if(this.draging)return;
		this.hmx = e.xy[0] - this.lht.getXY()[0];
		if(this.isOverSplitLine(this.hmx)){
			this.lh.setStyle('cursor',"w-resize");			
		}else{
			this.lh.setStyle('cursor',"default");			
		}
	},
	onUnLockHeadMove : function(e){
//		if(this.draging)return;
		var lw = 0;
		if(this.uht){
			lw = this.uht.getXY()[0] + this.uht.getScroll().left;
		}
		this.hmx = e.xy[0] - lw + this.lockWidth;
		if(this.isOverSplitLine(this.hmx)){
			this.uh.setStyle('cursor',"w-resize");			
		}else{
			this.uh.setStyle('cursor',"default");
		}		
	},
	onHeadMouseDown : function(e){
		this.dragWidth = -1;
		if(this.overColIndex == undefined || this.overColIndex == -1) return;
		this.dragIndex = this.overColIndex;
		this.dragStart = e.getXY()[0];
		this.sp.setHeight(this.height);
		this.sp.setVisible(true);
		this.sp.setStyle("top", this.wrap.getXY()[1]+"px")
		this.sp.setStyle("left", e.xy[0]+"px")
		Ext.get(document.documentElement).on("mousemove", this.onHeadMouseMove, this);
    	Ext.get(document.documentElement).on("mouseup", this.onHeadMouseUp, this);
	},
	onHeadClick : function(e){
		var target = Ext.fly(e.target).findParent('td');
		var atype;
		if(target) atype = Ext.fly(target).getAttributeNS("","atype");
		if(atype=='grid-cell'){
			//TODO:sort?
		}else if(atype=='grid.rowcheck'){
			var cb = Ext.fly(target).child('div[atype=grid.headcheck]');
			var checked = cb.hasClass('item-ckb-c');
			this.setCheckBoxStatus(cb,!checked);
			if(!checked){
				this.dataset.selectAll();
			}else{
				this.dataset.unSelectAll();
			}
		}
	},
	setRadioStatus: function(el, checked){
		if(!checked){
			el.removeClass('item-radio-img-c');
			el.addClass('item-radio-img-u');
		}else{
			el.addClass('item-radio-img-c');
			el.removeClass('item-radio-img-u');
		}
	},
	setCheckBoxStatus: function(el, checked){
		if(!checked){
			el.removeClass('item-ckb-c');
			el.addClass('item-ckb-u');
		}else{
			el.addClass('item-ckb-c');
			el.removeClass('item-ckb-u');
		}
	},
	onHeadMouseMove: function(e){
//		this.draging = true
		e.stopEvent();
		this.dragEnd = e.getXY()[0];
		var move = this.dragEnd - this.dragStart;
		var c = this.columns[this.dragIndex];
		var w = c.width + move;
		if(w > 30 && w < this.width) {
			this.dragWidth = w;
			this.sp.setStyle("left", e.xy[0]+"px")
		}
	},
	onHeadMouseUp: function(e){
//		this.draging = false;
		Ext.get(document.documentElement).un("mousemove", this.onHeadMouseMove, this);
    	Ext.get(document.documentElement).un("mouseup", this.onHeadMouseUp, this);		
		this.sp.setVisible(false);
		if(this.dragWidth != -1)
		this.setColumnSize(this.columns[this.dragIndex].dataindex, this.dragWidth);
		
	},
	findColByDataIndex : function(dataindex){
		var col;
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.dataindex && c.dataindex == dataindex){
//			if(c.dataindex && c.dataindex.toLowerCase() === dataindex.toLowerCase()){
				col = c;
				break;
			}
		}
		return col;
	},
	/** API ���� **/
	selectRow : function(row, locate){
		var record = this.dataset.getAt(row) 
		this.selectedId = record.id;
		if(this.selectlockTr) this.selectlockTr.setStyle(this.bgc,'');
		//if(this.selectUnlockTr) this.selectUnlockTr.setStyle(this.bgc,'');
		if(this.selectUnlockTr) this.selectUnlockTr.removeClass('row-selected');
		this.selectUnlockTr = Ext.get(this.id+'$u-'+record.id);
		if(this.selectUnlockTr)this.selectUnlockTr.addClass('row-selected');
		//if(this.selectUnlockTr)this.selectUnlockTr.setStyle(this.bgc,this.scor);
		
		this.selectlockTr = Ext.get(this.id+'$l-'+record.id);
		if(this.selectlockTr)this.selectlockTr.setStyle(this.bgc,this.scor);
		this.focusRow(row)
		
		var r = (this.dataset.currentPage-1)*this.dataset.pageSize + row+1;
		this.selectRecord = record
		if(locate!==false && r != null) {
//			this.dataset.locate(r);
			this.dataset.locate.defer(5, this.dataset,[r,false]);
		}
	},
	setColumnSize : function(dataindex, size){
		var columns = this.columns;
		var hth,bth,lw=0,uw=0;
		for(var i=0,l=columns.length;i<l;i++){
			var c = columns[i];
			if(c.dataindex && c.dataindex === dataindex){
				if(c.hidden == true) return;
				c.width = size;
				if(c.lock !== true){					
					hth = this.uh.child('TH[dataindex='+dataindex+']');
					bth = this.ub.child('TH[dataindex='+dataindex+']');					
				}else{							
					if(this.lh) hth = this.lh.child('TH[dataindex='+dataindex+']');
					if(this.lb) bth = this.lb.child('TH[dataindex='+dataindex+']');
					
				}
			}
			c.lock != true ? (uw += c.width) : (lw += c.width);
		}
		this.lockWidth = lw;
		if(hth) hth.setStyle("width", size+"px");
		if(bth) bth.setStyle("width", size+"px");
		if(this.lc){
			var lcw = Math.max(lw-1,0);
			this.lc.setStyle("width",lcw+"px");
			this.lc.setStyle('display',lcw==0 ? 'none' : '');
		}
		if(this.lht)this.lht.setStyle("width",lw+"px");
		if(this.lbt)this.lbt.setStyle("width",lw+"px");
		this.uc.setStyle("width", Math.max(this.width - lw,0)+"px");
		this.uh.setStyle("width",Math.max(this.width - lw,0)+"px");
		this.ub.setStyle("width",Math.max(this.width - lw,0)+"px");
		this.uht.setStyle("width",uw+"px");
		this.ubt.setStyle("width",uw+"px");
		this.syncSize();
	},
	syncSize : function(){
		var lw = 0;
		for(var i=0,l=this.columns.length;i<l;i++){
			var c = this.columns[i];
			if(c.hidden !== true){
				if(c.lock === true){
					lw += c.width;
				}
			}
		}
		if(lw !=0){
			var us = this.width -lw;
			this.uc.setWidth(us);
			this.uh.setWidth(us);
			this.ub.setWidth(us);
		}
	},
	showColumn : function(dataindex){
		var col = this.findColByDataIndex(dataindex);
		if(col){
			if(col.hidden === true){
				delete col.hidden;
				this.setColumnSize(dataindex, col.hiddenWidth);
				delete col.hiddenWidth;
				if(!Ext.isIE){
					var tds = Ext.DomQuery.select('TD[dataindex='+dataindex+']',this.wrap.dom);
					for(var i=0,l=tds.length;i<l;i++){
						var td = tds[i];
						Ext.fly(td).show();
					}
				}
			}
		}	
	},
	hideColumn : function(dataindex){
		var col = this.findColByDataIndex(dataindex);
		if(col){
			if(col.hidden !== true){
				col.hiddenWidth = col.width;
				this.setColumnSize(dataindex, 0, false);
				if(!Ext.isIE){
					var tds = Ext.DomQuery.select('TD[dataindex='+dataindex+']',this.wrap.dom);
					for(var i=0,l=tds.length;i<l;i++){
						var td = tds[i];
						Ext.fly(td).hide();
					}
				}
				col.hidden = true;
			}
		}		
	},
	deleteRow: function(win){
		var selected = this.dataset.getSelected();
		if(selected.length >0){
			for(var i=0;i<selected.length;i++){
				var r = selected[i];
				this.dataset.remove(r);
			}
		}
		$(win).close();
	},
	remove: function(){
		var selected = this.dataset.getSelected();
		if(selected.length >0) $A.showComfirm('确认删除选择记录?',"$('"+this.id+"').deleteRow");		
	},
	destroy: function(){
		$A.Grid.superclass.destroy.call(this);
		this.processDataSetLiestener('un');
		this.sp.remove();
		delete this.sp;
	}
});