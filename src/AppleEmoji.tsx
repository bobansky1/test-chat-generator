import { Fragment } from 'react';
let files:Record<string,string>={};
try{files=import.meta.glob('./assets/apple-emoji/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;}catch{/* Plain text fallback in environments without Vite's asset loader. */}
const images:Record<string,string>={};
for(const [path,url] of Object.entries(files))images[path.split('/').pop()!.replace('.png','')]=url;
const segmenter=new Intl.Segmenter('en',{granularity:'grapheme'});
export function AppleEmoji({text}:{text:string}){
 return <>{Array.from(segmenter.segment(text),({segment},index)=>{
  const code=Array.from(segment).map(c=>c.codePointAt(0)!.toString(16).padStart(4,'0')).join('-');
  const src=images[code]??images[code.replace(/-fe0f/g,'')];
  return <Fragment key={index}>{src?<img className="apple-emoji" src={src} alt={segment} draggable={false}/>:segment}</Fragment>;
 })}</>;
}
