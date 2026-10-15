import { useEffect,useRef,useState } from 'react';
import { Check,KeyRound,LockKeyhole,ArrowUpRight,Copy } from 'lucide-react';
import plans from '../shared/plans.json';
import { activateKey,api,savedKey,type License } from './billing';
export function Purchase({onActivated}:{onActivated:(license:License)=>void}){
 const [plan,setPlan]=useState(new URLSearchParams(location.search).get('plan')||'single');
 const [key,setKey]=useState(savedKey());const [email,setEmail]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const [config,setConfig]=useState<{paymentsEnabled:boolean;receiptEmail:boolean;test:boolean}|null>(null);
 const requestId=useRef('');const previousPlan=useRef(plan);
 useEffect(()=>{api('/config').then(setConfig).catch(e=>setError(e.message));},[]);
 async function checkPayment(){const id=new URLSearchParams(location.search).get('payment')||localStorage.getItem('chat-studio-order');if(!id){setError('В этом браузере пока нет заказа.');return;}setBusy(true);setError('');try{const result=await api('/orders/'+encodeURIComponent(id));if(result.status==='succeeded'){setKey(result.key);onActivated(await activateKey(result.key));setMessage('Оплата подтверждена. Ключ активирован — сохраните его.');history.replaceState(null,'','/app');}else setMessage(result.status==='canceled'?'Платёж отменён. Можно выбрать тариф и попробовать снова.':'Оплата ещё не подтверждена. Подождите немного и проверьте снова.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 useEffect(()=>{if(new URLSearchParams(location.search).has('payment'))void checkPayment();},[]);
 async function buy(){setBusy(true);setError('');try{
  if(!requestId.current||previousPlan.current!==plan){requestId.current=crypto.randomUUID();previousPlan.current=plan;}
  const result=await api('/checkout',{plan,requestId:requestId.current,email});localStorage.setItem('chat-studio-order',result.orderId);location.assign(result.url);
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <div className="purchase"><div className="purchase-note"><LockKeyhole size={20}/><p>Создавайте и редактируйте бесплатно.<br/><strong>Ключ открывает скачивание PNG, HTML и JSON.</strong></p></div><div className="purchase-plans">{plans.map(p=><button key={p.id} className={plan===p.id?'chosen':''} onClick={()=>setPlan(p.id)} aria-pressed={plan===p.id}><span>{p.label}</span><strong>{p.price.toLocaleString('ru-RU')} ₽</strong>{plan===p.id&&<Check size={15}/>}</button>)}</div><p className="purchase-detail">{plan==='single'?'Один файл в выбранном формате. При ошибке экспорта скачивание сохраняется.':'Без ограничений на число скачиваний. Срок начинается при первой активации ключа.'} Без автопродления.</p>{config?.receiptEmail&&<label className="field"><span>Email для чека</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>}
 {config&&!config.paymentsEnabled&&<div className="inline-tip">Оплата скоро появится. Пока можно бесплатно подготовить переписку в редакторе.</div>}
 {config?.test&&config.paymentsEnabled&&<p className="purchase-detail">Тестовый магазин: реальные деньги не списываются.</p>}
 <button className="btn primary full" disabled={busy||!config?.paymentsEnabled||(config.receiptEmail&&!email)} onClick={buy}>{busy?'Подождите…':'Оплатить через ЮKassa'}<ArrowUpRight size={17}/></button>
 <div className="key-entry"><h3><KeyRound size={18}/>Уже есть ключ?</h3><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{onActivated(await activateKey(key));setMessage('Ключ активирован. Можно скачивать переписку.');}catch(err){setError((err as Error).message);}finally{setBusy(false);}}}><input aria-label="Ключ доступа" placeholder="CS-…" value={key} onChange={e=>setKey(e.target.value)} maxLength={100}/><button className="btn secondary" disabled={busy||!key.trim()}>Активировать</button></form>{key&&<button className="text-button" onClick={()=>navigator.clipboard.writeText(key).then(()=>setMessage('Ключ скопирован')).catch(()=>setError('Выделите и скопируйте ключ вручную.'))}><Copy size={14}/>Скопировать ключ</button>}<button className="text-button" disabled={busy} onClick={checkPayment}>Я оплатил — проверить заказ</button></div>
 {error&&<div className="error-message" role="alert">{error}</div>}{message&&<div className="purchase-success" role="status">{message}</div>}</div>;
}
