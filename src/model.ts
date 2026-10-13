export type Message = { id: string; type: 'text' | 'photo' | 'voice' | 'date'; sender: 'me' | 'other'; text: string; time: string; status: 'read' | 'sent' | 'delivered'; image?: string; reply?: string; reaction?: string; duration?: string };
export type Project = { version: 1; title: string; chat: { name: string; status: string; avatar: string; verified: boolean; backCount: string; pinned?: string }; screen: { time: string; battery: number; network: 'wifi' | '5G' | 'LTE'; signal: number; charging: boolean; muted?: boolean; theme: 'light' | 'dark'; wallpaper: 'mint' | 'blue' | 'sand' | 'plain' | 'violet'; island: boolean; height: number }; messages: Message[]; assets: Record<string,string> };
export const uid = () => crypto.randomUUID();
export const sample: Project = { version: 1, title: 'Планы на выходные', chat: { name: 'Александра', status: 'в сети', avatar: '', verified: false, backCount: '12' }, screen: { time: '9:41', battery: 100, network: 'wifi', signal: 4, charging: false, theme: 'light', wallpaper: 'mint', island: true, height: 852 }, assets: {}, messages: [
  { id:'d1', type:'date', sender:'other', text:'13 октября', time:'', status:'read' },
  { id:'m1', type:'text', sender:'other', text:'Привет! Есть планы на выходные? ☀️', time:'10:24', status:'read' },
  { id:'m2', type:'text', sender:'me', text:'Привет! Пока нет. Что предлагаешь?', time:'10:25', status:'read' },
  { id:'m3', type:'text', sender:'other', text:'Давай выберемся за город?\nНашла очень красивое место 🌿', time:'10:25', status:'read' },
  { id:'m4', type:'text', sender:'me', text:'Звучит как идеальный план', time:'10:26', status:'read', reaction:'❤️' },
  { id:'m5', type:'text', sender:'other', text:'Тогда в субботу в 9? Возьму кофе и что-нибудь вкусное ☕️', time:'10:27', status:'read' },
  { id:'m6', type:'text', sender:'me', text:'Договорились! С меня плейлист 🎶', time:'10:28', status:'read' },
  { id:'m7', type:'text', sender:'other', text:'Уже жду 🤍', time:'10:28', status:'read' }
] };
export const example = { version: 1, title: 'Моя переписка', chat: { name: 'Александра', status: 'в сети', avatar: 'avatar.jpg' }, screen: { time: '9:41', battery: 85, network: 'wifi' }, messages: [ {type:'date', text:'13 октября'}, {sender:'other', text:'Привет! Как дела?', time:'10:24'}, {sender:'me', text:'Отлично! Вот фото 🌿', time:'10:25', status:'read'}, {sender:'me', type:'photo', image:'photo.jpg', text:'Наше любимое место', time:'10:26', status:'read'} ] };
const obj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown, fallback = '') => typeof x === 'string' ? x : fallback;
function choice<T extends string>(x: unknown, values: readonly T[], fallback:T): T { if(x === undefined) return fallback; if(!values.includes(x as T)) throw new Error(`Недопустимое значение «${String(x).slice(0,60)}». Допустимо: ${values.join(', ')}.`); return x as T; }
function number(x:unknown, fallback:number,min:number,max:number) { if(x===undefined) return fallback; if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max) throw new Error(`Число должно быть от ${min} до ${max}.`); return Math.round(x); }
export function imageRef(x: unknown): string { const value = str(x); if(value.length>15_000_000) throw new Error('Изображение слишком большое. Максимум 10 МБ.'); if(!value) return ''; if(/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value)) return value; if(value.length<=200 && !/[<>:\\/]/.test(value) && !value.startsWith('.')) return value; throw new Error('Фото: укажите имя файла (photo.jpg) или data URL PNG/JPEG/WebP/GIF. Загрузите сам файл в разделе «Медиа».'); }
export function parseProject(input: unknown): Project {
  const root = Array.isArray(input) ? { messages: input } : input;
  if(!obj(root)) throw new Error('Ожидается объект с массивом messages или массив сообщений.');
  if(root.version!==undefined && root.version!==1) throw new Error('Поддерживается version: 1.');
  if(!Array.isArray(root.messages)) throw new Error('В JSON отсутствует массив messages.');
  if(root.messages.length>1000) throw new Error('В одном проекте может быть не более 1000 сообщений.');
  const chat = obj(root.chat) ? root.chat : {}, screen = obj(root.screen) ? root.screen : {};
  const ids = new Set<string>();
  const messages: Message[] = root.messages.map((raw,i) => {
    try {
      if(!obj(raw)) throw new Error('Сообщение должно быть объектом.');
      const type=choice(raw.type,['text','photo','voice','date'] as const,'text');
      if(raw.text!==undefined && typeof raw.text!=='string') throw new Error('Поле text должно быть строкой.');
      const text=str(raw.text); if(text.length>10000) throw new Error('Текст длиннее 10 000 символов.');
      if((type==='text'||type==='date')&&!text.trim()) throw new Error('Введите text.');
      const image=imageRef(raw.image); if(type==='photo'&&!image) throw new Error('Для фотографии укажите image.');
      const time=str(raw.time,'10:00'); if(type!=='date'&&!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Время должно быть в формате ЧЧ:ММ.');
      const id=str(raw.id)||uid(); if(ids.has(id)) throw new Error(`Повторяющийся id: ${id}.`); ids.add(id);
      return { id,type,text,image,time,sender:choice(raw.sender,['me','other'] as const,'other'), status:choice(raw.status,['read','sent','delivered'] as const,'read'), reply:str(raw.reply).slice(0,1000), reaction:str(raw.reaction).slice(0,20), duration:str(raw.duration,'0:12').slice(0,12) };
    } catch(e) { throw new Error(`Сообщение ${i+1}: ${(e as Error).message}`); }
  });
  const assets: Record<string,string> = {};
  if(obj(root.assets)) for(const [key,val] of Object.entries(root.assets)) { if(['__proto__','constructor','prototype'].includes(key)) throw new Error('Недопустимое имя ресурса.'); const ref=imageRef(val); if(!ref.startsWith('data:')) throw new Error(`Ресурс ${key}: ожидается data URL.`); assets[key]=ref; }
  const time=str(screen.time,'9:41'); if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('screen.time: используйте ЧЧ:ММ.');
  return { version:1, title:str(root.title,'Новая переписка').slice(0,100), chat: { name:str(chat.name,'Собеседник').slice(0,80), status:str(chat.status,'в сети').slice(0,100), avatar:imageRef(chat.avatar), verified:chat.verified===true, backCount:str(chat.backCount,'12').slice(0,5), pinned:str(chat.pinned).slice(0,200) }, screen: {time, battery:number(screen.battery,100,0,100), signal:number(screen.signal,4,0,4), network:choice(screen.network,['wifi','5G','LTE'] as const,'wifi'), charging:screen.charging===true, muted:screen.muted===true, theme:choice(screen.theme,['light','dark'] as const,'light'), wallpaper:choice(screen.wallpaper,['mint','blue','sand','plain','violet'] as const,'mint'), island:screen.island!==false, height:number(screen.height,852,667,932)}, messages, assets };
}
export function parseText(text:string):Project { if(text.length>60_000_000) throw new Error('Размер JSON превышает 60 МБ.'); let data; try{data=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('Не удалось прочитать JSON. Проверьте кавычки, запятые и скобки.');} return parseProject(data); }
export function resolveImage(ref:string|undefined, assets:Project['assets']) { return ref?.startsWith('data:') ? ref : ref && Object.hasOwn(assets,ref) ? assets[ref] : undefined; }
export function missingAssets(p:Project) {return [...new Set([p.chat.avatar,...p.messages.map(m=>m.image)].filter((r):r is string=>!!r&&!resolveImage(r,p.assets)))];}
export const aiPrompt = `Создай JSON переписки для Chat Studio. Верни только валидный JSON без markdown. Формат: ${JSON.stringify(example,null,2)}\nПравила: sender — "me" (мои сообщения справа) или "other" (собеседник слева). type — "text", "photo", "voice" или "date". time — "ЧЧ:ММ". status — "sent", "delivered", "read". reply — текст цитаты, reaction — эмодзи, duration — длительность голосового (например "0:12"). image и chat.avatar — имена файлов, которые я затем загружу отдельно. Для разделителя даты нужны только type:"date" и text. Никаких ссылок на удалённые фотографии.`;

