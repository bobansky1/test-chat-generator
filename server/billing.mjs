import { DatabaseSync } from 'node:sqlite';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import plans from '../shared/plans.json' with { type: 'json' };

export const hash=value=>createHash('sha256').update(value).digest('hex');
export class Billing {
 constructor(path,config,request=fetch){
  this.config=config;this.request=request;this.db=new DatabaseSync(path);
  this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, owner TEXT NOT NULL, plan TEXT NOT NULL, amount TEXT NOT NULL, payment TEXT UNIQUE, url TEXT, status TEXT NOT NULL DEFAULT 'pending', created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS licenses(key_hash TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL, activated INTEGER, expires INTEGER, remaining INTEGER, revoked INTEGER DEFAULT 0);
   CREATE TABLE IF NOT EXISTS exports(id TEXT PRIMARY KEY, key_hash TEXT NOT NULL, status TEXT NOT NULL, created INTEGER NOT NULL);`);
 }
 get ready(){return !!(this.config.shopId&&this.config.secret&&this.config.licenseSecret?.length>=32);}
 key(id){return 'CS-'+createHmac('sha256',this.config.licenseSecret).update(id).digest('hex').slice(0,32).toUpperCase();}
 async api(path,method='GET',body,id){
  if(!this.ready)throw Object.assign(new Error('Оплата пока не подключена. Попробуйте позже.'),{status:503});
  const r=await this.request('https://api.yookassa.ru/v3/'+path,{method,signal:AbortSignal.timeout(15000),headers:{Authorization:'Basic '+Buffer.from(this.config.shopId+':'+this.config.secret).toString('base64'),'Content-Type':'application/json',...(id?{'Idempotence-Key':id}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Object.assign(new Error('ЮKassa временно недоступна. Повторите попытку.'),{status:502});
  return r.json();
 }
 async checkout(owner,planId,id,email){
  const plan=plans.find(p=>p.id===planId);if(!plan||!/^[a-f0-9-]{36}$/i.test(id))throw Object.assign(new Error('Некорректный заказ'),{status:400});
  if(!this.ready)throw Object.assign(new Error('Оплата пока не подключена. Попробуйте позже.'),{status:503});
  this.db.prepare('INSERT OR IGNORE INTO orders(id,owner,plan,amount,created) VALUES(?,?,?,?,?)').run(id,owner,plan.id,plan.price.toFixed(2),Date.now());
  const order=this.order(id,owner);if(order.plan!==plan.id)throw Object.assign(new Error('Тариф заказа уже выбран'),{status:409});
  if(order.url)return {orderId:id,url:order.url};
  const body={amount:{value:order.amount,currency:'RUB'},capture:true,confirmation:{type:'redirect',return_url:this.config.origin+'/app?payment='+id},description:'Chat Studio — '+plan.label,metadata:{order_id:id}};
  if(this.config.vatCode){
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||''))throw Object.assign(new Error('Укажите email для чека'),{status:400});
   body.receipt={customer:{email},items:[{description:body.description,quantity:'1.00',amount:body.amount,vat_code:Number(this.config.vatCode),payment_mode:'full_payment',payment_subject:'service'}],...(this.config.taxSystem?{tax_system_code:Number(this.config.taxSystem)}:{})};
  }
  const payment=await this.api('payments','POST',body,id);
  if(!payment.id||!payment.confirmation?.confirmation_url)throw new Error('ЮKassa не вернула ссылку для оплаты');
  this.db.prepare('UPDATE orders SET payment=?,url=? WHERE id=?').run(payment.id,payment.confirmation.confirmation_url,id);
  return {orderId:id,url:payment.confirmation.confirmation_url};
 }
 order(id,owner){const o=this.db.prepare('SELECT * FROM orders WHERE id=? AND owner=?').get(id,owner);if(!o)throw Object.assign(new Error('Заказ не найден в этом браузере'),{status:404});return o;}
 async sync(id){
  const o=this.db.prepare('SELECT * FROM orders WHERE id=?').get(id);if(!o?.payment)return;
  const p=await this.api('payments/'+encodeURIComponent(o.payment));
  if(p.id!==o.payment||p.amount?.value!==o.amount||p.amount?.currency!=='RUB'||p.metadata?.order_id!==o.id||String(p.recipient?.account_id)!==String(this.config.shopId)||Boolean(p.test)!==Boolean(this.config.test))throw new Error('Проверка платежа не пройдена');
  if(p.status==='succeeded'&&p.paid){
   const plan=plans.find(x=>x.id===o.plan);
   this.db.prepare('INSERT OR IGNORE INTO licenses(key_hash,order_id,remaining) VALUES(?,?,?)').run(hash(this.key(o.id)),o.id,plan.downloads);
   this.db.prepare("UPDATE orders SET status='succeeded' WHERE id=?").run(id);
  }else if(p.status==='canceled')this.db.prepare("UPDATE orders SET status='canceled' WHERE id=?").run(id);
 }
 async status(id,owner){const o=this.order(id,owner);if(o.status==='pending')await this.sync(id);const updated=this.order(id,owner);return {status:updated.status,...(updated.status==='succeeded'?{key:this.key(id)}:{})};}
 cleanup(){this.db.prepare("UPDATE exports SET status='expired' WHERE status='reserved' AND created<?").run(Date.now()-600000);}
 license(key,activate=false){
  this.cleanup();const h=hash(key.trim().toUpperCase());let l=this.db.prepare('SELECT l.*,o.plan FROM licenses l JOIN orders o ON o.id=l.order_id WHERE key_hash=?').get(h);
  if(!l||l.revoked)throw Object.assign(new Error('Ключ не найден или отключён'),{status:403});
  const plan=plans.find(p=>p.id===l.plan);
  if(activate&&!l.activated){const now=Date.now();this.db.prepare('UPDATE licenses SET activated=?,expires=? WHERE key_hash=? AND activated IS NULL').run(now,plan.duration?now+plan.duration:null,h);l=this.db.prepare('SELECT l.*,o.plan FROM licenses l JOIN orders o ON o.id=l.order_id WHERE key_hash=?').get(h);}
  if(l.expires&&l.expires<=Date.now())throw Object.assign(new Error('Срок действия ключа закончился'),{status:403});
  return l;
 }
 reserve(key){
  this.db.exec('BEGIN IMMEDIATE');try{
   const l=this.license(key,true);const active=this.db.prepare("SELECT count(*) AS n FROM exports WHERE key_hash=? AND status='reserved'").get(l.key_hash).n;
   if(l.remaining!==null&&l.remaining-active<=0)throw Object.assign(new Error('Скачивание уже использовано или выполняется'),{status:403});
   const id=randomBytes(24).toString('hex');this.db.prepare("INSERT INTO exports VALUES(?,?,'reserved',?)").run(id,l.key_hash,Date.now());this.db.exec('COMMIT');return id;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 finish(key,id,success){
  const h=hash(key.trim().toUpperCase());this.db.exec('BEGIN IMMEDIATE');try{
   const job=this.db.prepare('SELECT * FROM exports WHERE id=? AND key_hash=?').get(id,h);if(!job)throw Object.assign(new Error('Экспорт не найден'),{status:404});
   if(job.status==='reserved'){
    this.db.prepare('UPDATE exports SET status=? WHERE id=?').run(success?'completed':'canceled',id);
    if(success)this.db.prepare('UPDATE licenses SET remaining=remaining-1 WHERE key_hash=? AND remaining IS NOT NULL').run(h);
   }this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async webhook(event){
  if(event.event==='refund.succeeded'){
   const refund=await this.api('refunds/'+encodeURIComponent(event.object?.id||''));
   if(refund.status==='succeeded')this.db.prepare('UPDATE licenses SET revoked=1 WHERE order_id IN (SELECT id FROM orders WHERE payment=?)').run(refund.payment_id);
  }else if(['payment.succeeded','payment.canceled'].includes(event.event)){
   const o=this.db.prepare('SELECT id FROM orders WHERE payment=?').get(event.object?.id||'');if(o)await this.sync(o.id);
  }
 }
}
