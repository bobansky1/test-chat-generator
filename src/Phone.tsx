import { forwardRef } from 'react';
import { Battery, Signal, TgIcon } from './Icons';
import { resolveImage, type Message, type Project } from './model';
import { wallpaper } from './wallpaper';

export const Phone = forwardRef<HTMLDivElement,{project:Project;selected?:string;onSelect?:(id:string)=>void;full?:boolean}>(function Phone({project:p,selected,onSelect,full},ref){
 const avatar=resolveImage(p.chat.avatar,p.assets);
 return <div ref={ref} className={`phone-screen glass-ui ${p.screen.theme} wallpaper-${p.screen.wallpaper} ${p.chat.pinned?'has-pin':''} ${full?'full-chat':''}`} style={{height:full?'auto':p.screen.height}}>
  <div className="tg-top-blur" aria-hidden="true"/>
  <div className={`ios-status ${p.screen.island?'has-island':''}`}><span className="ios-time">{p.screen.time}{p.screen.muted&&<TgIcon name="mute" size={17}/>}</span>{p.screen.island&&<div className="dynamic-island"/>}<div className="ios-indicators"><Signal level={p.screen.signal}/>{p.screen.network==='wifi'?<TgIcon name="wifi" size={19}/>:<span className="network-label">{p.screen.network}</span>}<Battery value={p.screen.battery} charging={p.screen.charging}/></div></div>
  <div className="tg-header"><div className="tg-back glass-surface"><TgIcon name="back" size={24}/></div><div className="tg-person glass-surface"><div className="tg-name">{p.chat.name}{p.chat.verified&&<TgIcon name="verified" size={16}/>}</div><div className="tg-status">{p.chat.status}</div></div><div className="tg-avatar glass-surface">{avatar?<img src={avatar} alt="Аватар"/>:p.chat.name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('')}</div></div>
  {p.chat.pinned&&<div className="tg-pinned glass-surface"><i/><div><strong>Закреплённое сообщение</strong><span>{p.chat.pinned}</span></div><TgIcon name="pin" size={23}/></div>}
  <div className="tg-conversation" data-testid="conversation" style={{backgroundImage:wallpaper(p.screen),backgroundSize:'280px 280px',backgroundBlendMode:'normal'}}><div className="message-stack">{p.messages.length===0?<div className="tg-empty">Здесь появится ваша переписка</div>:p.messages.map((m,index)=> {
   const previous=p.messages[index-1], next=p.messages[index+1];
   const joinsPrevious=!!previous&&previous.type!=='date'&&previous.sender===m.sender;
   const joinsNext=!!next&&next.type!=='date'&&next.sender===m.sender;
   return m.type==='date'?<div key={m.id} className="tg-date" onClick={()=>onSelect?.(m.id)}>{m.text}</div>:<Bubble key={m.id} m={m} p={p} joinsPrevious={joinsPrevious} joinsNext={joinsNext} selected={selected===m.id} onSelect={onSelect}/>;
  })}</div></div>
  <div className="tg-composer"><div className="tg-compose-action glass-surface"><TgIcon name="clip" size={27}/></div><div className="tg-input glass-surface"><span>Сообщение</span><TgIcon name="sticker" size={24}/></div><div className="tg-compose-action glass-surface"><TgIcon name="camera" size={28}/></div></div><div className="ios-bottom"><div/></div>
 </div>;
});
function Bubble({m,p,selected,onSelect,joinsPrevious,joinsNext}:{m:Message;p:Project;selected:boolean;joinsPrevious:boolean;joinsNext:boolean;onSelect?: (id:string)=>void}){
 const image=resolveImage(m.image,p.assets);
 return <div className={`bubble-row ${m.sender} ${joinsPrevious?'joins-previous':'group-start'} ${joinsNext?'joins-next':'group-end'}`}><div className={`tg-bubble ${m.type} ${selected?'selected':''}`} onClick={()=>onSelect?.(m.id)} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault();onSelect?.(m.id);}}} aria-label={onSelect?`Редактировать: ${m.text||m.image||'голосовое сообщение'}`:undefined}>
 {m.reply&&<div className="tg-reply"><strong>{m.sender==='me'?p.chat.name:'Вы'}</strong><span>{m.reply}</span></div>}
 {m.type==='photo'&&(image?<img className="message-photo" src={image} alt={m.text||'Фотография'}/>:<div className="missing-photo"><TgIcon name="clip" size={30}/><span>{m.image}</span><small>Загрузите файл в «Медиа»</small></div>)}
 {m.type==='voice'&&<div className="voice-message"><div className="voice-play"><TgIcon name="play" size={23}/></div><div className="voice-content"><div className="waveform">{Array.from({length:35},(_,i)=><i key={i} style={{height:5+((i*17+13)%26)}}/>)}</div><span>{m.duration||'0:12'}</span></div></div>}
 <div className="bubble-text">{m.text}<span className="message-meta">{m.time}{m.sender==='me'&&<TgIcon name={m.status==='sent'?'check':'double'} size={18} style={{opacity:m.status==='delivered'?.5:1}}/>}</span></div>
 {m.reaction&&<div className="reaction">{m.reaction}<span>1</span></div>}
 </div></div>;
}
