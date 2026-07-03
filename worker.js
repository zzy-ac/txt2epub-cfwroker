export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api/qidian-cover') return handleCover(url);
    if (url.pathname === '/favicon.ico') return new Response(favicon, { headers: { 'Content-Type': 'image/svg+xml' } });
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};

async function handleCover(url) {
  const bookname = url.searchParams.get('bookname');
  if (!bookname) return jsonResponse({ error: '缺少书名参数' }, 400);
  try {
    const res = await fetch(`https://m.qidian.com/soushu/${encodeURIComponent(bookname)}.html`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept-Language': 'zh-CN,zh;q=0.9' }
    });
    if (!res.ok) return jsonResponse({ error: `起点请求失败: ${res.status}` }, res.status);
    const html = await res.text();
    const match = html.match(/data-src="([^"]+)"/);
    if (!match) return jsonResponse({ error: '未找到封面' }, 404);
    const coverUrl = 'https:' + match[1].slice(0, -3) + '600';
    return jsonResponse({ coverUrl });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">📖</text></svg>`;

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>TXT转EPUB</title>
<link rel="icon" href="/favicon.ico" type="image/svg+xml">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#f5f7fb;padding:20px}
.container{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;padding:30px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
h1{font-size:28px;margin-bottom:8px}
.subtitle{color:#666;margin-bottom:24px;font-size:14px}
.upload-box{border:2px dashed #ccc;border-radius:12px;padding:30px;text-align:center;cursor:pointer;margin-bottom:20px;transition:all .3s}
.upload-box:hover,.upload-box.dragover{border-color:#3b82f6;background:#eef2ff}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
label{display:block;font-size:13px;font-weight:500;color:#333;margin-bottom:4px}
input[type="text"]{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px}
input[type="text"]:focus{outline:none;border-color:#3b82f6}
.cover-row{display:flex;gap:16px;align-items:center;background:#f9fafb;padding:12px;border-radius:10px;margin-bottom:16px}
.cover-preview{width:60px;height:80px;background:#e5e7eb;border-radius:6px;flex-shrink:0;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-size:24px;color:#9ca3af}
.btn{padding:10px 20px;border:1px solid #d1d5db;border-radius:20px;background:#fff;cursor:pointer;font-size:14px;transition:all .2s}
.btn:hover{background:#f3f4f6}
.btn-primary{background:#1f2937;color:#fff;border:none;width:100%;padding:14px;font-size:16px;font-weight:500}
.btn-primary:hover{background:#374151}
.btn-primary:disabled{background:#9ca3af;cursor:not-allowed}
.btn-sm{padding:6px 14px;font-size:12px}
.cover-tabs{display:flex;gap:4px;margin-bottom:8px}
.cover-tab{padding:4px 12px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#666}
.cover-tab.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
.cover-content{display:none}
.cover-content.active{display:block}
.file-upload-btn{display:inline-block;padding:4px 10px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid #3b82f6;background:#fff;color:#3b82f6}
.chapter-list{background:#f9fafb;border-radius:10px;padding:16px;max-height:300px;overflow-y:auto;margin-bottom:16px;display:none}
.chapter-list h3{font-size:14px;margin-bottom:8px;color:#374151}
.chapter-item{padding:4px 0;font-size:13px;color:#4b5563}
.chapter-item.volume{font-weight:600;color:#1f2937;background:#eef2ff;padding:6px 8px;border-radius:4px;margin:4px 0}
.chapter-item.chapter{padding-left:24px;border-left:2px solid #e5e7eb;margin-left:8px}
.progress-bar{width:100%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;margin:12px 0;display:none}
.progress-fill{height:100%;background:#3b82f6;width:0;transition:width .3s}
.status{font-size:13px;color:#6b7280;min-height:20px}
.status.error{color:#dc2626}
.encoding-badge{display:inline-block;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;font-size:12px;margin-left:8px}
@media(max-width:500px){.container{padding:16px}.form-row{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="container">
<h1>📖 TXT转EPUB</h1>
<p class="subtitle">自动识别卷/章 · 多级标题 · 起点封面/本地上传</p>
<div class="upload-box" id="uploadBox">
<div style="font-size:36px;margin-bottom:8px">📂</div>
<div style="font-weight:500">点击或拖拽上传 TXT 文件</div>
<div style="font-size:12px;color:#999;margin-top:4px">自动检测编码(GBK/UTF-8等) <span class="encoding-badge" id="encBadge" style="display:none">UTF-8</span></div>
<input type="file" id="fileInput" accept=".txt,text/plain" style="display:none">
</div>
<div class="chapter-list" id="chapterList"><h3>📑 识别到的目录结构</h3><div id="chapterItems"></div></div>
<div class="form-row">
<div><label>📘 书名</label><input type="text" id="bookTitle" placeholder="自动从文件名提取"></div>
<div><label>✍️ 作者</label><input type="text" id="bookAuthor" placeholder="自动从文件名提取"></div>
</div>
<div class="cover-row">
<div class="cover-preview" id="coverPreview">📷</div>
<div style="flex:1">
<div class="cover-tabs">
<button class="cover-tab active" data-source="search">🔍 起点搜索</button>
<button class="cover-tab" data-source="upload">📁 本地上传</button>
</div>
<div class="cover-content active" id="coverSearch">
<button class="btn btn-sm" id="fetchCoverBtn">起点搜封面</button>
<button class="btn btn-sm" id="clearCoverBtn">清除</button>
</div>
<div class="cover-content" id="coverUpload">
<label class="file-upload-btn" for="coverFileInput">选择图片</label>
<input type="file" id="coverFileInput" accept="image/*" style="display:none">
<button class="btn btn-sm" id="clearUploadBtn">清除</button>
</div>
<div style="font-size:11px;color:#999;margin-top:6px" id="coverStatus">未获取</div>
</div>
</div>
<button class="btn btn-primary" id="convertBtn">🚀 生成 EPUB 并下载</button>
<div class="progress-bar" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
<div class="status" id="statusMsg"></div>
</div>
<script>
var fc='',fn='',cb=null,pvs={volumes:[]};
var ub=document.getElementById('uploadBox'),fi=document.getElementById('fileInput'),bt=document.getElementById('bookTitle'),ba=document.getElementById('bookAuthor'),
cp=document.getElementById('coverPreview'),cs=document.getElementById('coverStatus'),fcb=document.getElementById('fetchCoverBtn'),ccb=document.getElementById('clearCoverBtn'),
cfi=document.getElementById('coverFileInput'),cub=document.getElementById('clearUploadBtn'),cvb=document.getElementById('convertBtn'),
cl=document.getElementById('chapterList'),ci=document.getElementById('chapterItems'),pb=document.getElementById('progressBar'),pf=document.getElementById('progressFill'),
sm=document.getElementById('statusMsg'),eb=document.getElementById('encBadge');

function ss(m,e){sm.textContent=m;sm.className='status'+(e?' error':'')}
function sp(p){if(p>0){pb.style.display='block';pf.style.width=p+'%'}else{pb.style.display='none';pf.style.width='0%'}}

document.querySelectorAll('.cover-tab').forEach(function(t){t.addEventListener('click',function(){
document.querySelectorAll('.cover-tab').forEach(function(x){x.classList.remove('active')});this.classList.add('active');
document.querySelectorAll('.cover-content').forEach(function(x){x.classList.remove('active')});
document.getElementById('cover'+this.dataset.source.charAt(0).toUpperCase()+this.dataset.source.slice(1)).classList.add('active')})});

cfi.addEventListener('change',function(){if(cfi.files[0]){var f=cfi.files[0];if(!f.type.startsWith('image/')){ss('请选择图片文件',1);return}
var r=new FileReader();r.onload=function(e){cp.style.backgroundImage='url('+e.target.result+')';cp.textContent='';cs.textContent='已上传';cb=f;ss('封面已上传')};r.readAsDataURL(f)}});
cub.addEventListener('click',function(){cb=null;cp.style.backgroundImage='';cp.textContent='📷';cs.textContent='未获取';cfi.value=''});

async function dc(f){var b=await f.arrayBuffer(),u=new Uint8Array(b);
if(u.length>=3&&u[0]===0xEF&&u[1]===0xBB&&u[2]===0xBF){eb.textContent='UTF-8 BOM';eb.style.display='inline-block';return new TextDecoder('utf-8').decode(u.slice(3))}
try{var t=new TextDecoder('utf-8',{fatal:true}).decode(u);eb.textContent='UTF-8';eb.style.display='inline-block';return t}catch(e){}
try{var t=new TextDecoder('gbk',{fatal:true}).decode(u);eb.textContent='GBK';eb.style.display='inline-block';return t}catch(e){}
try{var t=new TextDecoder('big5',{fatal:true}).decode(u);eb.textContent='Big5';eb.style.display='inline-block';return t}catch(e){}
eb.textContent='UTF-8';eb.style.display='inline-block';return new TextDecoder('utf-8').decode(u)}

function pS(t){var ct=t.replace(/\\r\\n/g,'\\n').replace(/\\r/g,'\\n'),ls=ct.split('\\n'),
vp=/^第[零一二三四五六七八九十百千万\\d]+卷\\s+.+$/,cp=/^第[零一二三四五六七八九十百千万\\d]+章\\s+.+$/,sp=/^(楔子|引子|序章|序言|序|前言|后记|尾声|终章|番外|附录|补遗)\\s*.*$/,hs=[];
ls.forEach(function(l,i){var tr=l.trim();if(!tr)return;
if(vp.test(tr))hs.push({title:tr,li:i,lv:1,tp:'volume'});else if(cp.test(tr))hs.push({title:tr,li:i,lv:2,tp:'chapter'});else if(sp.test(tr))hs.push({title:tr,li:i,lv:2,tp:'special'})});
if(!hs.length)return{volumes:[{title:'正文',chapters:[{title:'全文',content:ct.trim()}]}]};
var vs=[],cv=null;
if(hs[0].li>0){var pl=ls.slice(0,hs[0].li),pc=pl.join('\\n').trim();if(pc.length>30){cv={title:'前言',chapters:[{title:'简介',content:pc}]};vs.push(cv);cv=null}}
for(var i=0;i<hs.length;i++){var h=hs[i],ni=i+1<hs.length?hs[i+1].li:ls.length,cl=ls.slice(h.li+1,ni),ct=cl.join('\\n').trim();
if(h.lv===1){cv={title:h.title,chapters:[]};vs.push(cv)}else if(h.lv===2){if(!cv){cv={title:'正文',chapters:[]};vs.push(cv)}cv.chapters.push({title:h.title,content:ct})}}
return{volumes:vs.filter(function(v){return v.chapters.length})}}

function sCP(s){cl.style.display='block';var h='',tc=0;s.volumes.forEach(function(v){h+='<div class="chapter-item volume">📘 '+eH(v.title)+' ('+v.chapters.length+'章)</div>';
v.chapters.slice(0,15).forEach(function(c){h+='<div class="chapter-item chapter">📄 '+eH(c.title)+'</div>';tc++});
if(v.chapters.length>15)h+='<div class="chapter-item chapter" style="color:#999">... 还有 '+(v.chapters.length-15)+' 章</div>'});
if(tc>50)h+='<div style="text-align:center;color:#999;font-size:12px;margin-top:8px">共 '+tc+' 章</div>';ci.innerHTML=h}
function eH(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function eX(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}

async function fC(bn){if(!bn){ss('请先输入书名',1);return}ss('正在搜索封面...');sp(30);fcb.disabled=true;
try{var r=await fetch('/api/qidian-cover?bookname='+encodeURIComponent(bn));if(!r.ok)throw new Error('请求失败:'+r.status);
var d=await r.json();if(!d.coverUrl)throw new Error('未找到封面');sp(60);ss('正在下载封面...');
var ir=await fetch(d.coverUrl);if(!ir.ok)throw new Error('下载失败');var b=await ir.blob();cb=b;
var fr=new FileReader();fr.onload=function(e){cp.style.backgroundImage='url('+e.target.result+')';cp.textContent='';cs.textContent='已获取';ss('封面获取成功');sp(100);setTimeout(function(){sp(0)},800)};fr.readAsDataURL(b)}
catch(e){ss('封面获取失败: '+e.message,1);sp(0)}finally{fcb.disabled=false}}

async function gE(m,s){if(typeof JSZip==='undefined'){await new Promise(function(r,j){var sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';sc.onload=r;sc.onerror=function(){j(new Error('JSZip加载失败'))};document.head.appendChild(sc)})}
var z=new JSZip();z.file('mimetype','application/epub+zip',{compression:'STORE'});
z.folder('META-INF').file('container.xml','<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
var o=z.folder('OEBPS'),co={compression:'DEFLATE',compressionOptions:{level:9}};
o.file('style.css','body{font-family:"Songti SC","Noto Serif CJK SC",serif;line-height:1.8;margin:0;padding:0}h1{text-align:center;font-size:1.5em;margin:2em 0 1em;page-break-before:always}h2{text-align:center;font-size:1.2em;margin:1.5em 0 .8em;page-break-before:always}p{text-indent:2em;margin:.3em 0}img.cover{max-width:100%;height:auto;display:block;margin:0 auto}',co);
var ch='';if(cb){var ext=(cb.type||'image/jpeg').split('/')[1]||'jpg';ch='images/cover.'+ext;o.folder('images').file('cover.'+ext,cb,co)}
var pgs=[],np=[],po=0;
if(ch){o.file('cover.xhtml','<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>封面</title><link rel="stylesheet" href="style.css" type="text/css"/></head><body><div style="text-align:center;padding:2em"><img class="cover" src="'+ch+'" alt="封面"/></div></body></html>',co);pgs.push({id:'cover',href:'cover.xhtml',title:'封面'})}
var th='<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>目录</title><link rel="stylesheet" href="style.css" type="text/css"/></head><body><h2>目录</h2><nav epub:type="toc">';
s.volumes.forEach(function(v,vi){var vid='v'+vi;th+='<p style="text-indent:0;font-weight:bold;margin:.5em 0"><a href="'+vid+'.xhtml">'+eH(v.title)+'</a></p>';
v.chapters.forEach(function(c,ci){var cid='c'+vi+'_'+ci;th+='<p style="text-indent:1.5em;font-size:.9em;margin:.2em 0"><a href="'+cid+'.xhtml">'+eH(c.title)+'</a></p>'})});th+='</nav></body></html>';
o.file('toc.xhtml',th,co);pgs.push({id:'toc',href:'toc.xhtml',title:'目录'});
s.volumes.forEach(function(v,vi){var vid='v'+vi;
o.file(vid+'.xhtml','<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>'+eH(v.title)+'</title><link rel="stylesheet" href="style.css" type="text/css"/></head><body><h1>'+eH(v.title)+'</h1></body></html>',co);pgs.push({id:vid,href:vid+'.xhtml',title:v.title});po++;
np.push('<navPoint id="nav'+vid+'" playOrder="'+po+'"><navLabel><text>'+eX(v.title)+'</text></navLabel><content src="'+vid+'.xhtml"/></navPoint>');
v.chapters.forEach(function(c,ci){var cid='c'+vi+'_'+ci,paras=c.content.split(/\\n+/).filter(function(l){return l.trim()}).map(function(l){return'<p>'+eH(l.trim())+'</p>'}).join('');
o.file(cid+'.xhtml','<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>'+eH(c.title)+'</title><link rel="stylesheet" href="style.css" type="text/css"/></head><body><h2>'+eH(c.title)+'</h2>'+paras+'</body></html>',co);pgs.push({id:cid,href:cid+'.xhtml',title:c.title});po++;
np.push('<navPoint id="nav'+cid+'" playOrder="'+po+'"><navLabel><text>'+eX(v.title)+' - '+eX(c.title)+'</text></navLabel><content src="'+cid+'.xhtml"/></navPoint>')})});
var uid='urn:uuid:'+crypto.randomUUID(),mn='',spn='';pgs.forEach(function(p){mn+='<item id="'+p.id+'" href="'+p.href+'" media-type="application/xhtml+xml"/>';spn+='<itemref idref="'+p.id+'"/>'});
if(ch){mn+='<item id="cover-image" href="'+ch+'" media-type="'+(cb?cb.type:'image/jpeg')+'" properties="cover-image"/>'}mn+='<item id="css" href="style.css" media-type="text/css"/>';
o.file('content.opf','<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>'+eX(m.title)+'</dc:title><dc:creator>'+eX(m.author)+'</dc:creator><dc:language>zh-CN</dc:language><dc:identifier id="book-id">'+uid+'</dc:identifier><meta name="cover" content="cover-image"/></metadata><manifest>'+mn+'</manifest><spine>'+spn+'</spine></package>',co);
o.file('toc.ncx','<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="'+uid+'"/></head><docTitle><text>'+eX(m.title)+'</text></docTitle><navMap>'+np.join('')+'</navMap></ncx>',co);
return await z.generateAsync({type:'blob',mimeType:'application/epub+zip',compression:'DEFLATE',compressionOptions:{level:9,memLevel:9,windowBits:15},streamFiles:true,platform:'UNIX'})}

ub.addEventListener('click',function(){fi.click()});
ub.addEventListener('dragover',function(e){e.preventDefault();ub.classList.add('dragover')});
ub.addEventListener('dragleave',function(){ub.classList.remove('dragover')});
ub.addEventListener('drop',function(e){e.preventDefault();ub.classList.remove('dragover');if(e.dataTransfer.files.length){fi.files=e.dataTransfer.files;hF(e.dataTransfer.files[0])}});
fi.addEventListener('change',function(){if(fi.files.length)hF(fi.files[0])});

async function hF(f){if(!f.name.toLowerCase().endsWith('.txt')){ss('请选择.txt文件',1);return}
var on=f.name.replace(/\\.txt$/i,''),et='',ea='',tm=on.match(/《([^》]+)》/);if(tm)et=tm[1].trim();
var am=on.match(/作者[：:]\\s*([^\\s《]+)/);if(am)ea=am[1].trim();
if(!ea){var bm=on.match(/[bB][yY]\\s+([^\\s《]+)/);if(bm)ea=bm[1].trim()}
if(!ea){var dm=on.match(/[-–]\\s*([^\\s《]+)$/);if(dm&&dm[1].length<10)ea=dm[1].trim()}
if(!et){var cn=on.replace(/作者[：:]\\s*[^\\s《]+/g,'').replace(/[-_【】\\[\\]]/g,' ').replace(/\\s+/g,' ').trim();et=cn||on}
fn=on;bt.value=et;ba.value=ea;
try{ss('正在读取文件...');fc=await dc(f);if(!fc.trim())throw new Error('文件内容为空');pvs=pS(fc);sCP(pvs);
var tc=pvs.volumes.reduce(function(s,v){return s+v.chapters.length},0);ss('已加载: '+f.name+' · '+pvs.volumes.length+'卷 '+tc+'章');cvb.disabled=false}
catch(e){ss('读取失败: '+e.message,1);cl.style.display='none'}}

fcb.addEventListener('click',function(){fC(bt.value.trim())});
ccb.addEventListener('click',function(){cb=null;cp.style.backgroundImage='';cp.textContent='📷';cs.textContent='未获取'});
cvb.addEventListener('click',async function(){if(!fc){ss('请先上传TXT文件',1);return}
var t=bt.value.trim()||fn||'未命名',a=ba.value.trim()||'未知作者';if(!pvs.volumes.length)pvs=pS(fc);
var tc=pvs.volumes.reduce(function(s,v){return s+v.chapters.length},0);ss('正在生成EPUB ('+pvs.volumes.length+'卷 '+tc+'章)...');sp(20);cvb.disabled=true;
try{var eb=await gE({title:t,author:a},pvs);sp(90);var u=URL.createObjectURL(eb),d=document.createElement('a');d.href=u;d.download=t.replace(/[\\\\/:*?"<>|]/g,'_')+'.epub';document.body.appendChild(d);d.click();document.body.removeChild(d);URL.revokeObjectURL(u);sp(100);ss('✅ 生成成功！'+pvs.volumes.length+'卷 '+tc+'章');setTimeout(function(){sp(0)},1500)}
catch(e){ss('生成失败: '+e.message,1);sp(0)}finally{cvb.disabled=false}});
cvb.disabled=true;ss('请上传TXT文件开始');
</script>
</body>
</html>`;
