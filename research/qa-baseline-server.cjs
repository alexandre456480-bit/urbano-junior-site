const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../dist');
const originals={};
for(const f of ['index.html','script.js'])originals['/'+f]=execFileSync('git',['show',`${process.env.MOBILE_BASELINE_REF || '977aebb'}:dist/${f}`],{encoding:'utf8'});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
http.createServer((req,res)=>{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/')pathname='/index.html';const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}let body=originals[pathname];try{if(body===undefined)body=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404).end();}}).listen(4174,'127.0.0.1');
