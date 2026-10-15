import { toBlob, toCanvas } from 'html-to-image';
import phoneCss from './phone.css?raw';
import { missingAssets, type Project } from './model';
export function download(data:Blob|string,name:string,type='application/json'){const blob=typeof data==='string'?new Blob([data],{type}):data; const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export function filename(p:Project){return p.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'').trim().slice(0,80)||'chat';}
// SVG foreignObject does not reliably render backdrop-filter. Bake the actual
// pixels behind each glass control, including messages at the current scroll.
async function bakeGlass(node:HTMLElement,height:number){
 const panes=Array.from(node.querySelectorAll<HTMLElement>('.glass-surface, .tg-top-blur'));
 const bounds=node.getBoundingClientRect();
 const areas=panes.map(p=>{const r=p.getBoundingClientRect();return {x:r.left-bounds.left,y:r.top-bounds.top,width:r.width,height:r.height};});
 panes.forEach(p=>p.style.visibility='hidden');
 let background:HTMLCanvasElement;
 try{background=await toCanvas(node,{width:393,height,pixelRatio:1,skipFonts:true});}
 finally{panes.forEach(p=>p.style.visibility='');}
 panes.forEach((pane,i)=>{
  const r=areas[i],pad=32,canvas=document.createElement('canvas');
  canvas.width=Math.ceil(r.width+pad*2);canvas.height=Math.ceil(r.height+pad*2);
  const ctx=canvas.getContext('2d')!;ctx.filter=pane.classList.contains('tg-top-blur')?'blur(9px) saturate(115%)':'blur(20px) saturate(155%)';
  ctx.drawImage(background,pad-r.x,pad-r.y);ctx.filter='none';
  const cropped=document.createElement('canvas');cropped.width=Math.ceil(r.width);cropped.height=Math.ceil(r.height);
  cropped.getContext('2d')!.drawImage(canvas,pad,pad,r.width,r.height,0,0,r.width,r.height);
  const tint=getComputedStyle(pane).getPropertyValue(pane.classList.contains('tg-top-blur')?'--top-blur-tint':'--glass-tint').trim();
  pane.style.backgroundImage=`linear-gradient(${tint},${tint}),url("${cropped.toDataURL()}")`;
  pane.style.backgroundSize='100% 100%';pane.style.backgroundColor='transparent';
  pane.style.backdropFilter='none';pane.style.setProperty('-webkit-backdrop-filter','none');
 });
}
export async function exportPng(node:HTMLElement,project:Project,full:boolean,scale:number){
 if(missingAssets(project).length) throw new Error('Сначала загрузите недостающие фотографии в разделе «Медиа».');
 const clone=node.cloneNode(true) as HTMLElement;clone.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));clone.classList.toggle('full-chat',full);clone.style.height=full?'auto':`${project.screen.height}px`;clone.style.width='393px';clone.style.transform='none';
 const stage=document.createElement('div');stage.style.cssText='position:fixed;top:0;left:0;z-index:-10000;pointer-events:none';stage.appendChild(clone);document.body.appendChild(stage);
 try {await Promise.all(Array.from(clone.querySelectorAll('img')).map(img=>img.decode())); await document.fonts.ready; if(!full) {const original=node.querySelector('.tg-conversation')!; const area=clone.querySelector('.tg-conversation')!; area.scrollTop=original.scrollTop; // html-to-image does not preserve scrollTop: explicitly offset the clipped content.
 const stack=clone.querySelector('.message-stack') as HTMLElement;stack.style.transform=`translateY(-${original.scrollTop}px)`;area.scrollTop=0;}
 const height=clone.scrollHeight; if(height*scale>16000) throw new Error('Переписка слишком длинная для одного PNG. Выберите меньший масштаб, экспорт экрана или HTML.');
 await bakeGlass(clone,height);
 const blob=await toBlob(clone,{pixelRatio:scale, width:393,height,backgroundColor:project.screen.theme==='dark'?'#18222d':'#ffffff',style:{position:'relative',top:'0',left:'0'},skipFonts:true}); if(!blob) throw new Error('Браузер не смог создать PNG. Попробуйте масштаб 1×.');download(blob,`${filename(project)}.png`);
 } finally {stage.remove();}
}
export async function exportHtml(node:HTMLElement,p:Project,full:boolean){
 if(missingAssets(p).length) throw new Error('Сначала загрузите недостающие фотографии в разделе «Медиа».');
 const clone=node.cloneNode(true) as HTMLElement;clone.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));clone.querySelectorAll('[role="button"]:not([data-spoiler])').forEach(el=>{el.removeAttribute('role');el.removeAttribute('tabindex');el.removeAttribute('aria-label');});clone.classList.toggle('full-chat',full);clone.style.height=full?'auto':`${p.screen.height}px`;
 if(!full){const scroll=node.querySelector('.tg-conversation')!.scrollTop;(clone.querySelector('.message-stack') as HTMLElement).style.transform=`translateY(-${scroll}px)`;(clone.querySelector('.tg-conversation') as HTMLElement).style.overflow='hidden';}
 // Embed bundled emoji assets so exported HTML works without the site.
 await Promise.all(Array.from(clone.querySelectorAll<HTMLImageElement>('img.apple-emoji')).map(async img=>{
  if(img.src.startsWith('data:'))return;
  await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  canvas.getContext('2d')!.drawImage(img,0,0);img.src=canvas.toDataURL('image/png');
 }));
 const title=p.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const data=JSON.stringify(p).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
 download(`<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#e9edf1;display:flex;justify-content:center;align-items:flex-start;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}${phoneCss}</style></head><body>${clone.outerHTML}<script type="application/json" id="chat-studio-project">${data}</script><script>document.addEventListener('click',function(e){var s=e.target.closest('[data-spoiler]');if(s){var visible=s.classList.toggle('revealed');s.setAttribute('aria-expanded',String(visible));s.setAttribute('aria-label',visible?'Скрыть текст':'Показать скрытый текст');s.firstElementChild.setAttribute('aria-hidden',String(!visible));}});document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-spoiler]')){e.preventDefault();e.target.click();}});</script></body></html>`,`${filename(p)}.html`,'text/html;charset=utf-8');
}
