import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';

const html=readFileSync('dist/index.html','utf8');
const entry=html.match(/<script[^>]+src="([^"]+)"/)[1];
assert.ok(entry.startsWith('./assets/'),'Build entry must work in a subdirectory');
const js=readFileSync(resolve('dist',entry),'utf8');
const assets=[...new Set(Array.from(js.matchAll(/new URL\("([^"]+\.png)",import\.meta\.url\)/g),m=>m[1]))];
assert.ok(assets.length>3000,'Expected the complete Apple emoji set');
const app=express();
app.use('/nested',express.static(resolve('dist')));
app.use(express.static(resolve('dist')));
const server=app.listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
async function check(url,png=false){
 const response=await fetch(url);
 assert.equal(response.status,200,url);
 if(png)assert.match(response.headers.get('content-type'),/^image\/png/,url);
 await response.arrayBuffer();
}
try{
 for(const base of ['/', '/nested/']){
  const documentUrl=origin+base;
  await check(documentUrl);
  const scriptUrl=new URL(entry,documentUrl);
  await check(scriptUrl);
  for(let i=0;i<assets.length;i+=24)await Promise.all(assets.slice(i,i+24).map(asset=>check(new URL(asset,scriptUrl),true)));
  console.log(`OK: ${assets.length} Apple emoji assets over HTTP at ${base}`);
 }
}finally{await new Promise(resolve=>server.close(resolve));}
