import type { CSSProperties } from 'react';
export function TgIcon({name,size=24,style}:{name:string;size?:number;style?:CSSProperties}) {
 const paths:Record<string,React.ReactNode> = {
 back:<path strokeWidth="2" d="m14.5 3.5-8 8.5 8 8.5"/>,
 clip:<path strokeWidth="1.65" d="m15.8 6.7-7.4 7.5a2.8 2.8 0 0 0 4 4l7.5-7.5a5 5 0 0 0-7.1-7.1l-8 8a7 7 0 0 0 9.9 9.9l6.1-6.1"/>,
 sticker:<><circle cx="12" cy="12" r="8.7" strokeWidth="1.8"/><path strokeWidth="1.8" d="M11 3.5c-1.6 7 2.5 11.8 9.4 11.2"/></>,
 camera:<><rect x="2.3" y="2.3" width="19.4" height="19.4" rx="6.5" strokeWidth="1.7"/><circle cx="12" cy="11.5" r="5.4" strokeWidth="1.7"/></>,
 mute:<><path fill="currentColor" stroke="none" d="M18 13V9a6 6 0 0 0-8.5-5.5L18 13ZM5 6.5V13l-2 3v1h13L5 6.5ZM9 19a3 3 0 0 0 6 0"/><path d="m3 2 18 20M6 1l15 17" strokeWidth="1.8"/></>,
 pin:<><path d="M12 3h8l-2 5v3l3 3v1H11v-1l3-3V8l-2-5ZM16 15v7M2 11h7M2 16h7M2 21h10" strokeWidth="1.5"/></>,
 speakerOff:<><path fill="currentColor" stroke="none" d="M3 9h4l5-4v14l-5-4H3z"/><path d="m16 9 6 6m0-6-6 6" strokeWidth="2.4"/></>,
 mic:<><rect x="8.5" y="1.4" width="7" height="14" rx="3.5" strokeWidth="1.65"/><path d="M4.6 10.6v2a7.4 7.4 0 0 0 14.8 0v-2M12 20v3" strokeWidth="1.65"/></>,
 check:<path d="m4 12 5 5L20 6"/>,
 double:<><path d="m1 12 5 5L17 6m-6 10 1 1L23 6"/></>,
 send:<path d="m4 11 8-8 8 8M12 3v18"/>,
 play:<path fill="currentColor" stroke="none" d="M8 4.5c0-1 1-1.5 2-.9l12 7.5a1 1 0 0 1 0 1.8L10 20.4c-1 .6-2 .1-2-.9z"/>,
 wifi:<path fill="currentColor" stroke="none" d="M.4 6.5a18.2 18.2 0 0 1 23.2 0L21 9.3a14.3 14.3 0 0 0-18 0L.4 6.5Zm4.7 5.1a10.8 10.8 0 0 1 13.8 0L16.3 14a6.9 6.9 0 0 0-8.6 0l-2.6-2.4Zm4.6 4.7a3.8 3.8 0 0 1 4.6 0L12 19l-2.3-2.7Z"/>,
 verified:<><path fill="currentColor" stroke="none" d="m12 0 3 2 3.6.4 1.1 3.4L22 9l-.5 3 1 3-2.6 2.3-1.3 3.2-3.6.3L12 23l-3-2.2-3.6-.3-1.3-3.2L1.5 15l1-3L2 9l2.3-3.2 1.1-3.4L9 2z"/><path stroke="white" strokeWidth="2" d="m7 11 3.5 3.5L17 8"/></>,
 plane:<path fill="currentColor" stroke="none" d="M21.8 3.3 18.6 21c-.2 1.2-.9 1.5-1.9.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.2c.4-.4-.1-.6-.6-.3L6.1 14.7l-4.8-1.5c-1-.3-1-1 .2-1.5L20.3 4c.9-.4 1.8-.1 1.5-.7z"/>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{paths[name]||paths.plane}</svg>;
}
export function Signal({level}:{level:number}) {return <svg width="19" height="14" viewBox="0 0 19 14" aria-hidden="true">{[0,1,2,3].map(i=><rect key={i} x={i*5} y={10-i*3} width="3.3" height={4+i*3} rx=".8" fill="currentColor" opacity={i<level?1:.22}/>)}</svg>;}
export function Battery({value,charging}:{value:number;charging:boolean}) {return <svg width="28" height="15" viewBox="0 0 28 15" aria-hidden="true"><rect x=".6" y="1" width="23.5" height="12.5" rx="3.3" fill="none" stroke="currentColor" opacity=".4"/><path d="M25.5 5v4.5c2-.2 2-4.3 0-4.5" fill="currentColor" opacity=".5"/><rect x="2.3" y="2.6" width={20*value/100} height="9.3" rx="1.7" fill={charging?'#32c759':value<=20?'#ff3b30':'currentColor'}/>{charging&&<path d="m13 1-4 7h3l-1 6 5-8h-3l1-5" fill="white"/>}</svg>;}
