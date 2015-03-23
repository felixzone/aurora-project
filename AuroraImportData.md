

&lt;uncertain-engine name="hec"&gt;


> 

&lt;packages&gt;


> > 

&lt;package-path classPath="aurora\_plugin\_package/aurora.plugin.dataimport"/&gt;


> > ...
> > 

&lt;/packages&gt;




&lt;/uncertain-engine&gt;




&lt;form name="upload" action="upload.svc" enctype="multipart/form-data" method="post"&gt;



> 

&lt;input name="CONTENT" type="file"/&gt;


> 

&lt;input type="submit"/&gt;




&lt;/form&gt;


<a:service xmlns:a="http://www.aurora-framework.org/application">
> > 

&lt;a:init-procedure outputPath="/parameter"&gt;


> > > 

&lt;a:model-query model="sys.get\_sys\_import\_head\_id" rootPath="header"/&gt;


> > > 

<a:import-excel header\_id="${/model/header/record/@header\_id}"/>



> > 

&lt;/a:init-procedure&gt;




Unknown end tag for &lt;/service&gt;

}}}
 # screen文件,HTML标准的文件上传
 {{{
 }}}          
 # svc文件
 {{{
 }}}
 * === import-excel 标记属性 === 

|| *属性名* || *类型* || *描述* || *必须* || *默认值* ||
|| header_id || in || fnd_interface_headers表中的header_id || true || ||
|| dataSourceName || in || 导入数据库的dataSourceName || fasle || ||
|| user_id || in || 当前用户user_id || false || ${/session/@user_id} ||
|| separator || in || 导入文本类型时的分隔符 || false || , ||
|| job_id || in || 任务id || false || ||
|| attribute1 || in || 扩展字段1 || false || ||
|| attribute2 || in || 扩展字段2 || false || ||
|| attribute3 || in || 扩展字段3 || false || ||
|| attribute4 || in || 扩展字段4 || false || ||
|| attribute5 || in || 扩展字段5 || false || ||```