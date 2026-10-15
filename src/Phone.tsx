import { RoundMessage } from './RoundMessage';
import { isTallPhoto } from './photo';
import { AppleEmoji } from './AppleEmoji';
import { FormattedText } from './FormattedText';
import { forwardRef, useLayoutEffect, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Battery, Signal, TgIcon } from './Icons';
import { resolveImage, type Message, type Project } from './model';
import { wallpaper } from './wallpaper';

export const Phone = forwardRef<HTMLDivElement,{project:Project;selected?:string;onSelect?:(id:string)=>void;full?:boolean}>(function Phone({project:p,selected,onSelect,full},ref){
 const conversation=useRef<HTMLDivElement>(null);
 const [showDown,setShowDown]=useState(false);
 useEffect(()=>{
  const area=conversation.current!;
  const sync=()=>setShowDown(!full&&area.scrollHeight-area.clientHeight-area.scrollTop>60);
  area.addEventListener('scroll',sync,{passive:true});
  const observer=new ResizeObserver(sync);observer.observe(area);if(area.firstElementChild)observer.observe(area.firstElementChild);
  sync();return()=>{area.removeEventListener('scroll',sync);observer.disconnect();};
 },[full]);
 const avatar=resolveImage(p.chat.avatar,p.assets);
 const background=resolveImage(p.screen.wallpaperImage,p.assets);
 return <div ref={ref} className={`phone-screen glass-ui ${p.screen.theme} wallpaper-${p.screen.wallpaper} ${p.chat.pinned?'has-pin':''} ${full?'full-chat':''}`} style={{height:full?'auto':p.screen.height}}>
  <div className="tg-top-blur" aria-hidden="true"/>
  <div className={`ios-status ${p.screen.island?'has-island':''}`}><span className="ios-time">{p.screen.time}{p.screen.muted&&<TgIcon name="mute" size={17}/>}</span>{p.screen.island&&<div className="dynamic-island"/>}<div className="ios-indicators"><Signal level={p.screen.signal}/>{p.screen.network==='wifi'?<TgIcon name="wifi" size={19}/>:<span className="network-label">{p.screen.network}</span>}<Battery value={p.screen.battery} charging={p.screen.charging}/></div></div>
  <div className="tg-header"><div className="tg-back glass-surface"><TgIcon name="back" size={24}/></div><div className="tg-person glass-surface"><div className="tg-name">{p.chat.name}{p.chat.verified&&<TgIcon name="verified" size={16}/>}</div><div className="tg-status">{p.chat.status}</div></div><div className="tg-avatar glass-surface">{avatar?<img src={avatar} alt="Аватар"/>:p.chat.name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('')}</div></div>
  {p.chat.pinned&&<div className="tg-pinned glass-surface"><i/><div><strong>Закреплённое сообщение</strong><span>{p.chat.pinned}</span></div><TgIcon name="pin" size={23}/></div>}
  <div ref={conversation} className="tg-conversation" data-testid="conversation" style={{backgroundImage:background?`url("${background}")`:wallpaper(p.screen),backgroundSize:background?'cover':'280px 280px',backgroundPosition:'center',backgroundRepeat:background?'no-repeat':'repeat',backgroundBlendMode:'normal' }}><div className="message-stack">{p.messages.length===0?<div className="tg-empty">Здесь появится ваша переписка</div>:p.messages.map((m,index)=> {
   const previous=p.messages[index-1], next=p.messages[index+1];
   const joinsPrevious=!!previous&&previous.type!=='date'&&previous.sender===m.sender;
   const joinsNext=!!next&&next.type!=='date'&&next.sender===m.sender;
   return m.type==='date'?<div key={m.id} className="tg-date" onClick={()=>onSelect?.(m.id)}>{m.text}</div>:<Bubble key={m.id} m={m} p={p} joinsPrevious={joinsPrevious} joinsNext={joinsNext} selected={selected===m.id} onSelect={onSelect}/>;
  })}</div></div>
  {showDown&&<button type="button" className="tg-scroll-down glass-surface" aria-label="К последним сообщениям" onClick={()=>conversation.current?.scrollTo({top:conversation.current.scrollHeight,behavior:'smooth'})}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 9 7 7 7-7"/></svg></button>}
  <div className="tg-composer"><div className="tg-compose-action glass-surface"><TgIcon name="clip" size={27}/></div><div className="tg-input glass-surface"><span>{p.screen.composerText??'Сообщение'}</span><TgIcon name="sticker" size={24}/></div><div className="tg-compose-action glass-surface" aria-label="Микрофон"><TgIcon name="mic" size={28}/></div></div><div className="ios-bottom"><div/></div>
 </div>;
});
function Bubble({m,p,selected,onSelect,joinsPrevious,joinsNext}:{m:Message;p:Project;selected:boolean;joinsPrevious:boolean;joinsNext:boolean;onSelect?: (id:string)=>void}){
 const bubble=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  if(m.type!=='text'||m.reply||m.text.includes('>>>'))return;
  const node=bubble.current!;const row=node.parentElement!;let active=true;
  const fit=()=>{
   if(!active)return;
   node.style.width='';
   const content=node.querySelector('.message-content');const meta=node.querySelector<HTMLElement>('.message-meta');
   if(!content||!meta)return;
   node.style.setProperty('--message-time-width',`${meta.offsetWidth+8}px`);
   const scale=node.getBoundingClientRect().width/node.offsetWidth||1;
   const range=document.createRange();range.selectNodeContents(content);
   const lines:{top:number;left:number;right:number}[]=[];
   for(const rect of Array.from(range.getClientRects())){
    if(!rect.width||!rect.height)continue;
    const line=lines.find(l=>Math.abs(l.top-rect.top)<rect.height*.45);
    if(line){line.left=Math.min(line.left,rect.left);line.right=Math.max(line.right,rect.right);}
    else lines.push({top:rect.top,left:rect.left,right:rect.right});
   }
   if(!lines.length)return;
   lines.sort((a,b)=>a.top-b.top);
   const style=getComputedStyle(node);const padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
   const limit=node.clientWidth-padding;
   const longest=Math.max(...lines.map(l=>(l.right-l.left)/scale));
   const last=lines.at(-1)!;const withTime=(last.right-last.left)/scale+meta.offsetWidth+8;
   const width=Math.max(longest,withTime<=limit?withTime:meta.offsetWidth+8);
   node.style.width=`${Math.ceil(Math.min(limit,width)+padding+2)}px`;
  };
  fit();document.fonts.ready.then(fit);
  const observer=new ResizeObserver(fit);observer.observe(row);
  node.addEventListener('load',fit,true);
  return()=>{active=false;observer.disconnect();node.removeEventListener('load',fit,true);};
 },[m.text,m.type,m.time,m.status,m.sender,m.reply]);
 const image=resolveImage(m.image,p.assets);
 const gradient=(m.type==='emoji'||m.type==='round')?undefined:m.sender==='me'?p.screen.outgoingGradient:p.screen.incomingGradient;
 const bubbleStyle=gradient?{'--custom-bubble':`linear-gradient(${gradient.angle}deg,${gradient.start},${gradient.end})`,'--custom-tail':gradient.end,'--custom-text':gradient.text} as CSSProperties:undefined;
 return <div className={`bubble-row ${m.sender} ${joinsPrevious?'joins-previous':'group-start'} ${joinsNext?'joins-next':'group-end'}`}><div ref={bubble} className={`tg-bubble ${m.type} ${gradient?'custom-gradient':''} ${selected?'selected':''}`} style={bubbleStyle} onClick={()=>onSelect?.(m.id)} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault();onSelect?.(m.id);}}} aria-label={onSelect?`Редактировать: ${m.text||m.image||'голосовое сообщение'}`:undefined}>
 {m.reply&&<div className="tg-reply"><strong>{m.sender==='me'?p.chat.name:'Вы'}</strong><span>{m.reply}</span></div>}
 {m.type==='round'&&<RoundMessage message={m} image={image}/>}
 {m.type === 'photo' && (
  image ? (
    <div
     className={`photo-back ${!m.text?.trim() ? 'no-text' : ''}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      <img
        key={image}
        className="message-photo"
        src={image}
        alt={m.text || 'Фотография'}
        onLoad={(e) => {
          e.currentTarget.classList.toggle(
            'is-tall',
            isTallPhoto(e.currentTarget.naturalWidth,e.currentTarget.naturalHeight,e.currentTarget.parentElement!.clientWidth)
          );
        }}
      />
    </div>
  ) : (
    <div className="missing-photo">
      <TgIcon name="clip" size={30} />
      <span>{m.image}</span>
      <small>Загрузите файл в «Медиа»</small>
    </div>
  )
)}
 {m.type==='voice'&&<div className="voice-message"><div className="voice-play"><TgIcon name="play" size={23}/></div><div className="voice-content"><div className="waveform">{Array.from({length:35},(_,i)=><i key={i} style={{height:5+((i*17+13)%26)}}/>)}</div><span>{m.duration||'0:12'}</span></div></div>}

{m.type!=='round'&&(m.type === 'photo' && !m.text ? (
  <span className="message-meta photo-meta">
    {m.time}
    {m.sender === 'me' && (
      <TgIcon
        name={m.status === 'sent' ? 'check' : 'double'}
        size={18}
        style={{ opacity: m.status === 'delivered' ? 0.5 : 1 }}
      />
    )}
  </span>
) : (
  <div className="bubble-text">
    {m.type==='emoji'?<span className="emoji-content"><AppleEmoji text={m.text}/></span>:<span className="message-content"><FormattedText text={m.text}/></span>}
    {m.type==='text'&&<span className="message-time-space" aria-hidden="true"/>}
    <span className="message-meta">
      {m.time}
      {m.sender === 'me' && (
        <TgIcon
          name={m.status === 'sent' ? 'check' : 'double'}
          size={18}
          style={{ opacity: m.status === 'delivered' ? 0.5 : 1 }}
        />
      )}
    </span>
  </div>
))}

 {m.reaction&&<div className="reaction"><AppleEmoji text={m.reaction}/><span>1</span></div>}
 </div></div>;
}
