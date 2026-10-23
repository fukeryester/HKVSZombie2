import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateRawSync} from 'node:zlib';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=data=>{let crc=0xffffffff;for(const b of data)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;};
const files=[];
function walk(folder){for(const d of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,d.name);if(d.isDirectory())walk(file);else if(d.isFile())files.push(file);}}
const src=path.join(root,'src');walk(src);files.sort();
const chunks=[],central=[];let offset=0;
for(const file of files){
  const name=Buffer.from(path.relative(src,file).split(path.sep).join('/'),'utf8');
  const bytes=fs.readFileSync(file);
  if(/\.(html|js|json|css)$/.test(file)&&/gh_[A-Za-z0-9_-]{25,}/.test(bytes.toString('utf8')))throw new Error('Refusing to package a credential: '+file);
  const compressed=deflateRawSync(bytes,{level:9}),crc=crc32(bytes);
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(bytes.length,22);header.writeUInt16LE(name.length,26);
  chunks.push(header,name,compressed);
  const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(8,10);entry.writeUInt16LE(0x21,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(compressed.length,20);entry.writeUInt32LE(bytes.length,24);entry.writeUInt16LE(name.length,28);entry.writeUInt32LE(offset,42);central.push(entry,name);offset+=header.length+name.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...chunks,directory,end]);fs.writeFileSync(path.join(root,'dist/hkvsz2.zip'),zip);
console.log(`Built dist/hkvsz2.zip (${files.length} files, ${zip.length} bytes; no credentials)`);
