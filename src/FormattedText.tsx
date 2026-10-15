import { AppleEmoji } from './AppleEmoji';
import { Fragment, useState, type ReactNode } from 'react';
function Spoiler({children}:{children:ReactNode}){
 const [revealed,setRevealed]=useState(false);
 return <span className={`tg-spoiler ${revealed?'revealed':''}`} data-spoiler="true" role="button" tabIndex={0} aria-label={revealed?'Скрыть текст':'Показать скрытый текст'} aria-expanded={revealed} onClick={e=>{e.stopPropagation();setRevealed(v=>!v);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();setRevealed(v=>!v);}}}><span className="spoiler-content" aria-hidden={!revealed}>{children}</span></span>;
}
// Formatting is rendered as React elements, never as imported HTML.
export function FormattedText({text}:{text:string}){
 let index=0;
 function parse(stop?:string,depth=0):{parts:ReactNode[];closed:boolean}{
  const parts:ReactNode[]=[];let plain='';
  const flush=()=>{if(plain){parts.push(<AppleEmoji key={`text-${index}`} text={plain}/>);plain='';}};
  while(index<text.length){
   if(stop&&text.startsWith(stop,index)){flush();index+=stop.length;return {parts,closed:true};}
   const mark=depth<12?['>>>','||','`','**','__','~~','*'].find(m=>text.startsWith(m,index)):undefined;
   if(!mark){plain+=text[index++];continue;}
   const start=index;index+=mark.length;
   if(mark==='`'){
    const end=text.indexOf('`',index);
    if(end<0){plain+='`';continue;}
    flush();parts.push(<code key={start}>{text.slice(index,end)}</code>);index=end+1;continue;
   }
   const inner=parse(mark,depth+1);
   if(!inner.closed){plain+=text.slice(start,index);continue;}
   flush();
   if(mark==='||'){parts.push(<Spoiler key={start}>{inner.parts.map((part,i)=><Fragment key={i}>{part}</Fragment>)}</Spoiler>);continue;}
   if(mark==='>>>'){parts.push(<span className="tg-quote" key={start}>{inner.parts.map((part,i)=><Fragment key={i}>{part}</Fragment>)}</span>);continue;}
   const Tag=mark==='**'?'strong':mark==='__'?'u':mark==='~~'?'s':'em';
   parts.push(<Tag key={start}>{inner.parts.map((part,i)=><Fragment key={i}>{part}</Fragment>)}</Tag>);
  }
  flush();return {parts,closed:false};
 }
 return <>{parse().parts.map((part,i)=><Fragment key={i}>{part}</Fragment>)}</>;
}
