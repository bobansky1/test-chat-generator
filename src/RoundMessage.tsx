import { TgIcon } from './Icons';
import type { Message } from './model';
export function RoundMessage({message:m,image}:{message:Message;image?:string}){
 return <div className="round-message"><div className="round-frame">{image?<img className="round-photo" src={image} alt="Кадр видеокружка"/>:<div className="round-missing"><TgIcon name="camera" size={42}/><span>Загрузите фото кружка</span></div>}<span className="round-muted" aria-label="Без звука"><TgIcon name="speakerOff" size={20}/></span></div><span className="round-duration">{m.duration||'0:12'} <i/></span><span className="round-meta">{m.time}{m.sender==='me'&&<TgIcon name={m.status==='sent'?'check':'double'} size={18} style={{opacity:m.status==='delivered'?.5:1}}/>}</span></div>;
}
