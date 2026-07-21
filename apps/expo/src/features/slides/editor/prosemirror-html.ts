/**
 * Returns the self-contained HTML for the ProseMirror WebView editor.
 *
 * The HTML includes all ProseMirror libraries from CDN and the exact same
 * schema, plugins, commands, and utils as the Web side. This guarantees
 * 1:1 editing fidelity and content interchangeability.
 *
 * In production, this should be replaced with a bundled version that
 * inlines all ProseMirror JS (no CDN dependency) for offline reliability.
 */

let cachedHtml: string | null = null;

export function getProsemirrorHtml(): string {
  if (cachedHtml) return cachedHtml;

  // The HTML is inlined as a string. In development, we use the CDN version.
  // For production builds, this should be a rollup-bundled version with
  // all ProseMirror code inlined (no network dependency).
  cachedHtml = PROSEMIRROR_HTML;
  return cachedHtml;
}

/**
 * Inline HTML template. In a real build pipeline, this would be generated
 * by bundling the HTML file from the assets directory. For now, we construct
 * it here so the WebView can load it without file system access.
 *
 * The template uses CDN script tags for ProseMirror. For offline builds,
 * replace with a rollup-bundled version.
 */
const PROSEMIRROR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:transparent}
#editor{width:100%;height:100%;outline:none;cursor:text;overflow:auto;-webkit-overflow-scrolling:touch}
#editor:focus,#editor:focus-visible{outline:none}
#editor p{margin:0}
#editor ul{list-style:disc outside!important;padding-inline-start:1.5rem!important}
#editor ol{list-style:decimal outside!important;padding-inline-start:1.5rem!important}
#editor li{display:list-item!important}
#editor blockquote{border-left:3px solid #ccc;padding-left:12px;margin:4px 0}
#editor a{color:#4a90d9;text-decoration:underline}
#editor code{background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-family:monospace}
#editor [data-placeholder]::before{content:attr(data-placeholder);color:#aaa;position:absolute;pointer-events:none}
</style>
</head>
<body>
<div id="editor" contenteditable="false"></div>
<script src="https://unpkg.com/prosemirror-model@1.25.4/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-state@1.4.4/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-view@1.41.5/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-transform@1.10.2/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-commands@1.7.1/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-keymap@1.2.3/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-history@1.5.0/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-inputrules@1.5.1/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-schema-basic@1.2.4/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-schema-list@1.5.1/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-dropcursor@1.8.2/dist/index.js"><\/script>
<script src="https://unpkg.com/prosemirror-gapcursor@1.4.0/dist/index.js"><\/script>
<script>
(function(){
var Model=prosemirrorModel,State=prosemirrorState,View=prosemirrorView;
var Schema=Model.Schema,DOMParser=Model.DOMParser,EditorState=State.EditorState,EditorView=View.EditorView;
var history=prosemirrorHistory.history,undo=prosemirrorHistory.undo,redo=prosemirrorHistory.redo;
var cmds=prosemirrorCommands,kmap=prosemirrorKeymap,input=prosemirrorInputrules,list=prosemirrorSchemaList;
var dropC=prosemirrorDropcursor.dropCursor,gapC=prosemirrorGapcursor.gapCursor;
var bn=prosemirrorSchemaBasic.nodes,bm=prosemirrorSchemaBasic.marks;
var orderedList={attrs:{order:{default:1},listStyleType:{default:''},fontsize:{default:''},color:{default:''}},content:'list_item+',group:'block',parseDOM:[{tag:'ol',getAttrs:function(d){var o=(d.hasAttribute('start')?d.getAttribute('start'):1)||1;var a={order:+o};var s=d.style;if(s.listStyleType)a.listStyleType=s.listStyleType;if(s.fontSize)a.fontsize=s.fontSize;if(s.color)a.color=s.color;return a}}],toDOM:function(n){var a=n.attrs,st='';if(a.listStyleType)st+='list-style-type:'+a.listStyleType+';';if(a.fontsize)st+='font-size:'+a.fontsize+';';if(a.color)st+='color:'+a.color+';';var r={style:st};if(a.order!==1)r.start=a.order;return['ol',r,0]}};
var bulletList={attrs:{listStyleType:{default:''},fontsize:{default:''},color:{default:''}},content:'list_item+',group:'block',parseDOM:[{tag:'ul',getAttrs:function(d){var a={};var s=d.style;if(s.listStyleType)a.listStyleType=s.listStyleType;if(s.fontSize)a.fontsize=s.fontSize;if(s.color)a.color=s.color;return a}}],toDOM:function(n){var a=n.attrs,st='';if(a.listStyleType)st+='list-style-type:'+a.listStyleType+';';if(a.fontsize)st+='font-size:'+a.fontsize+';';if(a.color)st+='color:'+a.color+';';return['ul',{style:st},0]}};
var listItem={content:'paragraph block*',group:'block'};
var paragraph={attrs:{align:{default:''},indent:{default:0},textIndent:{default:0}},content:'inline*',group:'block',parseDOM:[{tag:'p',getAttrs:function(d){var al=d.getAttribute('align')||d.style.textAlign||'';al=/(left|right|center|justify)/.test(al)?al:'';var ti=0;if(d.style.textIndent){if(/em/.test(d.style.textIndent))ti=parseInt(d.style.textIndent);else if(/px/.test(d.style.textIndent)){ti=Math.floor(parseInt(d.style.textIndent)/16);if(!ti)ti=1}}var ind=+(d.getAttribute('data-indent')||0);return{align:al,indent:ind,textIndent:ti}}},{tag:'img',ignore:true},{tag:'pre',skip:true}],toDOM:function(n){var a=n.attrs,st='';if(a.align&&a.align!=='left')st+='text-align:'+a.align+';';if(a.textIndent)st+='text-indent:'+a.textIndent+'em;';var r={style:st};if(a.indent)r['data-indent']=a.indent;return['p',r,0]}};
var sn={doc:bn.doc,paragraph:paragraph,blockquote:bn.blockquote,text:bn.text,ordered_list:orderedList,bullet_list:bulletList,list_item:listItem};
var sub={excludes:'subscript',parseDOM:[{tag:'sub'},{style:'vertical-align',getAttrs:function(v){return v==='sub'&&null}}],toDOM:function(){return['sub',0]}};
var sup={excludes:'superscript',parseDOM:[{tag:'sup'},{style:'vertical-align',getAttrs:function(v){return v==='super'&&null}}],toDOM:function(){return['sup',0]}};
var strike={parseDOM:[{tag:'strike'},{style:'text-decoration',getAttrs:function(v){return v==='line-through'&&null}},{style:'text-decoration-line',getAttrs:function(v){return v==='line-through'&&null}}],toDOM:function(){return['span',{style:'text-decoration-line: line-through;'},0]}};
var under={parseDOM:[{tag:'u'},{style:'text-decoration',getAttrs:function(v){return v==='underline'&&null}},{style:'text-decoration-line',getAttrs:function(v){return v==='underline'&&null}}],toDOM:function(){return['span',{style:'text-decoration: underline;'},0]}};
var fc={attrs:{color:{}},inline:true,group:'inline',parseDOM:[{style:'color',getAttrs:function(c){return c?{color:c}:{}}}],toDOM:function(m){return['span',{style:m.attrs.color?'color:'+m.attrs.color+';':''},0]}};
var bc={attrs:{backcolor:{}},inline:true,group:'inline',parseDOM:[{style:'background-color',getAttrs:function(c){return c?{backcolor:c}:{}}}],toDOM:function(m){return['span',{style:m.attrs.backcolor?'background-color:'+m.attrs.backcolor+';':''},0]}};
var fs={attrs:{fontsize:{}},inline:true,group:'inline',parseDOM:[{style:'font-size',getAttrs:function(s){return s?{fontsize:s}:{}}}],toDOM:function(m){return['span',{style:m.attrs.fontsize?'font-size:'+m.attrs.fontsize+';':''},0]}};
var fn={attrs:{fontname:{}},inline:true,group:'inline',parseDOM:[{style:'font-family',getAttrs:function(f){return{fontname:f&&typeof f==='string'?f.replace(/["']/g,''):''}}}],toDOM:function(m){var f=m.attrs.fontname;var st='';if(f&&!/["\\\\]/.test(f))st='font-family:"'+f+'";';return['span',{style:st},0]}};
var lk={attrs:{href:{},title:{default:null},target:{default:'_blank'}},inclusive:false,parseDOM:[{tag:'a[href]',getAttrs:function(d){return{href:d.getAttribute('href'),title:d.getAttribute('title')}}}],toDOM:function(n){return['a',n.attrs,0]}};
var mk={attrs:{index:{default:null}},parseDOM:[{tag:'mark',getAttrs:function(d){return{index:d.dataset.index}}}],toDOM:function(n){return['mark',{'data-index':n.attrs.index},0]}};
var sm={em:bm.em,strong:bm.strong,code:bm.code,fontsize:fs,fontname:fn,forecolor:fc,backcolor:bc,subscript:sub,superscript:sup,strikethrough:strike,underline:under,link:lk,mark:mk};
var schema=new Schema({nodes:sn,marks:sm});
function isList(n,s){return n.type===s.nodes.bullet_list||n.type===s.nodes.ordered_list}
function autoSelAll(v){if(v.state.selection.empty)cmds.selectAll(v.state,v.dispatch)}
function addMk(ev,m,sel){if(sel)ev.dispatch(ev.state.tr.addMark(sel.from,sel.to,m));else{var p=ev.state.selection;ev.dispatch(ev.state.tr.addMark(p.$from.pos,p.$to.pos,m))}}
function findNWSM(doc,from,to,mt){var i=from,f=function(m){return m.type===mt},fm=null,fn=null,tn=null;while(i<=to){var nd=doc.nodeAt(i);if(!nd||!nd.marks)return null;var mk=nd.marks.find(f);if(!mk)return null;if(fm&&mk!==fm)return null;fn=fn||nd;fm=fm||mk;tn=nd;i++}var fp=from,tp=to;i=from-1;while(i>0){var nd=doc.nodeAt(i);var mk=nd&&nd.marks.find(f);if(!mk||mk!==fm)break;fp=i;fn=nd;i--}i=to+1;while(i<doc.nodeSize-2){var nd=doc.nodeAt(i);var mk=nd&&nd.marks.find(f);if(!mk||mk!==fm)break;tp=i;tn=nd;i++}return{mark:fm,from:{node:fn,pos:fp},to:{node:tn,pos:tp}}}
function mActive(st,t){var s=st.selection;if(s.empty)return t.isInSet(st.storedMarks||s.$from.marks());return st.doc.rangeHasMark(s.from,s.to,t)}
function gMA(v){var s=v.state,d=s.doc,n=d.nodeAt(s.selection.from)||d.nodeAt(s.selection.from-1);while(n&&n.type.name!=='text'&&n.lastChild)n=n.lastChild;return n?(n.marks||[]):[]}
function gAV(m,mt,a){for(var i=0;i<m.length;i++){if(m[i].type.name===mt&&m[i].attrs[a])return m[i].attrs[a]}return null}
function iAM(m,t){for(var i=0;i<m.length;i++){if(m[i].type.name===t)return true}return false}
function gAVIS(v,a){var s=v.state,d=s.doc,f=s.selection.from,to=s.selection.to,kc=true,va='';d.nodesBetween(f,to,function(n){if(kc&&n.attrs[a]){kc=false;va=n.attrs[a]}return kc});return va}
function fpNCTP($p,pred){for(var i=$p.depth;i>0;i--){var n=$p.node(i);if(pred(n))return{pos:i>0?$p.before(i):0,start:$p.start(i),depth:i,node:n}}}
function fpN(pred){return function(r){return fpNCTP(r.$from,pred)}}
function fpNOT(nt){return function(s){return fpN(function(n){return Array.isArray(nt)?nt.indexOf(n.type)>-1:n.type===nt})(s)}}
function iAOPNT(nt,st){return!!fpNOT(st.schema.nodes[nt])(st.selection)}
function gTA(v,attrs){var da={color:'#000000',backcolor:'',fontsize:'16px',fontname:'',align:'left'};if(attrs)for(var k in attrs)da[k]=attrs[k];var m=gMA(v);return{bold:iAM(m,'strong'),em:iAM(m,'em'),underline:iAM(m,'underline'),strikethrough:iAM(m,'strikethrough'),superscript:iAM(m,'superscript'),subscript:iAM(m,'subscript'),code:iAM(m,'code'),color:gAV(m,'forecolor','color')||da.color,backcolor:gAV(m,'backcolor','backcolor')||da.backcolor,fontsize:gAV(m,'fontsize','fontsize')||da.fontsize,fontname:gAV(m,'fontname','fontname')||da.fontname,link:gAV(m,'link','href')||'',align:gAVIS(v,'align')||da.align,bulletList:iAOPNT('bullet_list',v.state),orderedList:iAOPNT('ordered_list',v.state),blockquote:iAOPNT('blockquote',v.state)}}
function gFS(v){var m=gMA(v);return parseInt(gAV(m,'fontsize','fontsize')||'16px')}
function aCmd(v,al){var s=v.state,st=s.schema,sl=s.selection,tr=v.state.tr.setSelection(sl);var f=sl.from,to=sl.to,d=tr.doc;if(!sl||!d)return;var at=new Set([st.nodes.blockquote,st.nodes.list_item,st.nodes.paragraph]);var ts=[];d.nodesBetween(f,to,function(nd,pos){var a=nd.attrs.align||'';if(a!==al&&at.has(nd.type))ts.push({node:nd,pos:pos,nodeType:nd.type});return true});if(!ts.length)return;ts.forEach(function(t){var a={...t.node.attrs,align:al||null};tr.setNodeMarkup(t.pos,t.nodeType,a,t.node.marks)});v.dispatch(tr)}
function setI(tr,schema,delta,ik){var sl=tr.selection,d=tr.doc;if(!sl||!d)return tr;var f=sl.from,to=sl.to;d.nodesBetween(f,to,function(nd,pos){if(nd.type.name==='paragraph'||nd.type.name==='blockquote'){var i=(nd.attrs[ik]||0)+delta;i=Math.max(0,Math.min(8,i));if(i!==nd.attrs[ik])tr.setNodeMarkup(pos,nd.type,Object.assign({},nd.attrs,(_a={},_a[ik]=i,_a)),nd.marks);return false}else if(isList(nd,schema))return false;return true});return tr}
function iCmd(v,d){var s=v.state,sc=s.schema,sl=s.selection;var tr=setI(s.state.tr.setSelection(sl),sc,d,'indent');if(tr.docChanged){v.dispatch(tr);return true}return false}
function tiCmd(v,d){var s=v.state,sc=s.schema,sl=s.selection;var tr=setI(s.state.tr.setSelection(sl),sc,d,'textIndent');if(tr.docChanged){v.dispatch(tr);return true}return false}
function sLS(v,style){var s=v.state,sc=s.schema,sl=s.selection,tr=s.state.tr.setSelection(sl),d=tr.doc;if(!d)return;var f=sl.from,to=sl.to;d.nodesBetween(f,to,function(nd,pos){if(isList(nd,sc)){if(f-3<=pos&&to+3>=pos+nd.nodeSize){var styles=Array.isArray(style)?style:[style];for(var i=0;i<styles.length;i++)tr.setNodeAttribute(pos,styles[i].key,styles[i].value)}}return false});v.dispatch(tr)}
function tList(lt,it,lst,ta){return function(state,dispatch){var s=state.schema,sl=state.selection,r=sl.$from.blockRange(sl.$to);if(!r)return false;var pl=fpN(function(n){return isList(n,s)})(sl);if(r.depth>=1&&pl&&r.depth-pl.depth<=1){if(pl.node.type===lt&&!lst)return list.liftListItem(it)(state,dispatch);if(isList(pl.node,s)&&lt.validContent(pl.node.content)){var tr=state.tr;var na={};for(var k in pl.node.attrs)na[k]=pl.node.attrs[k];if(ta)for(var k in ta)na[k]=ta[k];if(lst)na.listStyleType=lst;tr.setNodeMarkup(pl.pos,lt,na);if(dispatch)dispatch(tr);return false}}var na={};if(ta)for(var k in ta)na[k]=ta[k];if(lst)na.listStyleType=lst;return list.wrapInList(lt,na)(state,dispatch)}}
function rText(v,newText){var s=v.state,sc=s.schema,doc=s.doc;var marks=[],nt=sc.nodes.paragraph;if(doc.content.size>2){var fp=doc.resolve(1);marks=[].concat(fp.marks());nt=fp.parent.type}var lines=newText.split('\\n');var nn=lines.map(function(l){if(l.trim()==='')return nt.create();return nt.create(null,sc.text(l,marks))});v.dispatch(s.tr.replaceWith(0,doc.content.size,nn))}
function bIR(s){var rules=[].concat(input.smartQuotes,input.ellipsis,input.emDash);rules.push(input.wrappingInputRule(/^\\s*>\\s$/,s.nodes.blockquote));rules.push(input.wrappingInputRule(/^(\\d+)\\.\\s$/,s.nodes.ordered_list,function(m){return{order:+m[1]}},function(m,node){return node.childCount+node.attrs.order===+m[1]}));rules.push(input.wrappingInputRule(/^\\s*([-+*])\\s$/,s.nodes.bullet_list));rules.push(new input.InputRule(/(?:^|\\s)((?:\`)((?:[^\`]+))(?:\`))$/,function(st,m,start,end){var tr=st.tr.insertText(m[2]+' ',start,end);return tr.addMark(start,start+m[2].length,st.schema.marks.code.create())}));rules.push(new input.InputRule(/(?:https?:\\/\\/)?[\\w-]+(?:\\.[\\w-]+)+\\.?(?:\\d+)?(?:\\/\\S*)?$/,function(st,m,start,end){var tr=st.tr.insertText(m[0],start,end);return tr.addMark(start,start+m[0].length,st.schema.marks.link.create({href:m[0],title:m[0]}))}));return input.inputRules({rules:rules})}
function bKM(s){var keys={};var bind=function(k,c){keys[k]=c};bind('Alt-ArrowUp',cmds.joinUp);bind('Alt-ArrowDown',cmds.joinDown);bind('Mod-z',undo);bind('Mod-y',redo);bind('Backspace',input.undoInputRule);bind('Escape',cmds.selectParentNode);bind('Mod-b',cmds.toggleMark(s.marks.strong));bind('Mod-i',cmds.toggleMark(s.marks.em));bind('Mod-u',cmds.toggleMark(s.marks.underline));bind('Mod-d',cmds.toggleMark(s.marks.strikethrough));bind('Mod-e',cmds.toggleMark(s.marks.code));bind('Mod-;',cmds.toggleMark(s.marks.superscript));bind("Mod-'",cmds.toggleMark(s.marks.subscript));bind('Enter',cmds.chainCommands(list.splitListItem(s.nodes.list_item),cmds.newlineInCode,cmds.createParagraphNear,cmds.liftEmptyBlock,cmds.splitBlockKeepMarks));bind('Mod-[',list.liftListItem(s.nodes.list_item));bind('Mod-]',list.sinkListItem(s.nodes.list_item));bind('Tab',list.sinkListItem(s.nodes.list_item));return keys}
function bP(opts){var ps=[bIR(schema),kmap.keymap(bKM(schema)),kmap.keymap(cmds.baseKeymap),dropC(),gapC(),history()];if(opts&&opts.placeholder){ps.push(new State.Plugin({props:{decorations:function(st){var p=st.selection.$from;var nd=p.parent;if(nd.type.name==='paragraph'&&nd.nodeSize===2){var dc=View.Decoration.node(p.before(),p.after(),{'data-placeholder':opts.placeholder});return View.DecorationSet.create(st.doc,[dc])}return View.DecorationSet.empty}}}));}return ps}
function mkDoc(c){var h='<div>'+c+'</div>';var p=new DOMParser();var el=p.parseFromString(h,'text/html').body.firstElementChild;return DOMParser.fromSchema(schema).parse(el)}
var ev=null,cc='';
function initE(c,ed,ph){var ct=document.getElementById('editor');if(!ct)return;if(ev)ev.destroy();ev=new EditorView(ct,{state:EditorState.create({doc:mkDoc(c||''),plugins:bP(ph?{placeholder:ph}:{})}),handleDOMEvents:{focus:function(){postMsg({type:'focus'});return false},blur:function(){postMsg({type:'blur'});return false},keydown:function(){clearTimeout(window._ct);window._ct=setTimeout(function(){if(!ev)return;var h=ev.dom.innerHTML;if(h!==cc){cc=h;postMsg({type:'change',html:h})}postMsg({type:'attrs',attrs:gTA(ev)})},150);return false},click:function(){clearTimeout(window._ckt);window._ckt=setTimeout(function(){if(ev)postMsg({type:'attrs',attrs:gTA(ev)})},30);return false}},editable:function(){return ed},dispatchTransaction:function(tr){var ns=this.state.apply(tr);this.updateState(ns);if(tr.selectionSet||tr.docChanged||tr.storedMarksSet){postMsg({type:'attrs',attrs:gTA(ev)})}}});cc=ev.dom.innerHTML}
function updateC(c){if(!ev||ev.hasFocus())return;var d=ev.state.doc,tr=ev.state.tr;ev.dispatch(tr.replaceRangeWith(0,d.content.size,mkDoc(c)));cc=ev.dom.innerHTML}
function setEd(ed){if(ev)ev.setProps({editable:function(){return ed}})}
function execC(p){if(!ev)return;var cmd=p.command,val=p.value,v=ev,s=v.state,ms=s.schema.marks;switch(cmd){case'fontname':autoSelAll(v);addMk(v,ms.fontname.create({fontname:val}));break;case'fontsize':autoSelAll(v);addMk(v,ms.fontsize.create({fontsize:val}));sLS(v,{key:'fontsize',value:val});break;case'fontsize-add':{var step=val?+val:2;autoSelAll(v);var fs=gFS(v)+step+'px';addMk(v,ms.fontsize.create({fontsize:fs}));sLS(v,{key:'fontsize',value:fs});break}case'fontsize-reduce':{var step=val?+val:2;autoSelAll(v);var fs=gFS(v)-step;if(fs<12)fs=12;addMk(v,ms.fontsize.create({fontsize:fs+'px'}));sLS(v,{key:'fontsize',value:fs+'px'});break}case'color':autoSelAll(v);addMk(v,ms.forecolor.create({color:val}));sLS(v,{key:'color',value:val});break;case'backcolor':autoSelAll(v);addMk(v,ms.backcolor.create({backcolor:val}));break;case'bold':autoSelAll(v);cmds.toggleMark(ms.strong)(s,v.dispatch);break;case'em':autoSelAll(v);cmds.toggleMark(ms.em)(s,v.dispatch);break;case'underline':autoSelAll(v);cmds.toggleMark(ms.underline)(s,v.dispatch);break;case'strikethrough':autoSelAll(v);cmds.toggleMark(ms.strikethrough)(s,v.dispatch);break;case'subscript':cmds.toggleMark(ms.subscript)(s,v.dispatch);break;case'superscript':cmds.toggleMark(ms.superscript)(s,v.dispatch);break;case'blockquote':if(iAOPNT('blockquote',s))cmds.lift(s,v.dispatch);else cmds.wrapIn(s.schema.nodes.blockquote)(s,v.dispatch);break;case'code':cmds.toggleMark(ms.code)(s,v.dispatch);break;case'align':aCmd(v,val);break;case'indent':iCmd(v,+val);break;case'textIndent':tiCmd(v,+val);break;case'bulletList':var bl=s.schema.nodes.bullet_list,li=s.schema.nodes.list_item;tList(bl,li,val||'',{})(s,v.dispatch);break;case'orderedList':var ol=s.schema.nodes.ordered_list,li=s.schema.nodes.list_item;tList(ol,li,val||'',{})(s,v.dispatch);break;case'clear':autoSelAll(v);var p=v.state.selection;v.dispatch(v.state.tr.removeMark(p.$from.pos,p.$to.pos));sLS(v,[{key:'fontsize',value:''},{key:'color',value:''}]);break;case'link':{var mt=ms.link,sl=s.selection,r=findNWSM(s.doc,sl.from,sl.to,mt);if(r){if(val)addMk(v,ms.link.create({href:val,title:val}),{from:r.from.pos,to:r.to.pos+1});else v.dispatch(v.state.tr.removeMark(r.from.pos,r.to.pos+1,mt))}else if(mActive(s,mt)){if(val)addMk(v,ms.link.create({href:val,title:val}));else cmds.toggleMark(mt)(s,v.dispatch)}else if(val){autoSelAll(v);cmds.toggleMark(mt,{href:val,title:val})(v.state,v.dispatch)}break}case'replace':rText(v,val);break;case'insert':v.dispatch(v.state.tr.insertText(val));break}v.focus();clearTimeout(window._ct);window._ct=setTimeout(function(){if(!ev)return;var h=ev.dom.innerHTML;if(h!==cc){cc=h;postMsg({type:'change',html:h})}postMsg({type:'attrs',attrs:gTA(ev)})},50)}
function postMsg(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m))}
window.addEventListener('message',function(e){var d=e.data;if(!d||!d.type)return;switch(d.type){case'init':initE(d.content||'',d.editable!==false,d.placeholder||'');break;case'update':updateC(d.content||'');break;case'editable':setEd(d.editable);break;case'command':execC(d.payload);break;case'focus':if(ev)ev.focus();break}});
postMsg({type:'ready'});
})();
<\/script>
</body>
</html>`;
