import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname)); } catch {res.writeHead(400).end(); return;}
  if(file === root) file = path.join(root,'index.html');
  if(!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  fs.readFile(file,(error,body) => {res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(error?'Not found':body);});
}).listen(Number(process.env.PORT || 4174),'127.0.0.1',() => console.log('香港大战僵尸2 http://127.0.0.1:' + (process.env.PORT || 4174)));
