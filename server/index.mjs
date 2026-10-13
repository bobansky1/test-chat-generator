import 'dotenv/config';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Billing, hash } from './billing.mjs';
import plans from '../shared/plans.json' with { type: 'json' };
const origin=process.env.APP_ORIGIN||'http://127.0.0.1:5173';
if(process.env.NODE_ENV==='production'&&!origin.startsWith('https://'))throw new Error('APP_ORIGIN must use HTTPS');
mkdirSync('data',{recursive:true});
const billing=new Billing(process.env.DB_PATH||'data/billing.sqlite',{origin,shopId:process.env.YOOKASSA_SHOP_ID,secret:process.env.YOOKASSA_SECRET_KEY,licenseSecret:process.env.LICENSE_SECRET,test:process.env.YOOKASSA_TEST==='true',vatCode:process.env.YOOKASSA_VAT_CODE,taxSystem:process.env.YOOKASSA_TAX_SYSTEM_CODE});
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));
const limits=new Map();
setInterval(()=>limits.clear(),60000).unref();
app.use('/api',(req,res,next)=>{
 res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
 if(req.path!=='/webhooks/yookassa'){
  const n=(limits.get(req.ip)||0)+1;limits.set(req.ip,n);if(n>90)return res.status(429).json({error:'Слишком много запросов. Подождите минуту.'});
  if(req.method==='POST'&&req.get('origin')!==origin)return res.status(403).json({error:'Недопустимый источник запроса'});
 }
 const token=req.headers.cookie?.match(/(?:^|;\s*)cs_client=([a-f0-9]{64})(?:;|$)/)?.[1]||randomBytes(32).toString('hex');
 res.cookie('cs_client',token,{httpOnly:true,sameSite:'lax',secure:origin.startsWith('https:'),maxAge:31536000000,path:'/'});req.owner=hash(token);next();
});
const key=req=>{const value=req.get('authorization')?.replace(/^Bearer /,'');if(!value||value.length>100)throw Object.assign(new Error('Введите ключ доступа'),{status:403});return value;};
app.get('/api/config',(_,res)=>res.json({plans,paymentsEnabled:billing.ready,receiptEmail:!!process.env.YOOKASSA_VAT_CODE,test:process.env.YOOKASSA_TEST==='true'}));
app.post('/api/checkout',async(req,res)=>res.json(await billing.checkout(req.owner,req.body.plan,req.body.requestId,req.body.email)));
app.get('/api/orders/:id',async(req,res)=>res.json(await billing.status(req.params.id,req.owner)));
app.post('/api/license',(req,res)=>{const l=billing.license(key(req),true);res.json({plan:l.plan,expires:l.expires,remaining:l.remaining});});
app.post('/api/exports/reserve',(req,res)=>res.json({ticket:billing.reserve(key(req))}));
app.post('/api/exports/finish',(req,res)=>{billing.finish(key(req),req.body.ticket,req.body.success===true);res.json({ok:true});});
app.post('/api/webhooks/yookassa',async(req,res)=>{await billing.webhook(req.body);res.json({ok:true});});
app.use('/api',(_,res)=>res.status(404).json({error:'Метод не найден'}));
app.use(express.static(resolve('dist')));
app.get('/app',(_,res)=>res.sendFile(resolve('dist/app/index.html')));
app.get('/{*path}',(_,res)=>res.status(404).sendFile(resolve('dist/404.html')));
app.use((err,req,res,next)=>{res.status(err.status||500).json({error:err.status?err.message:'Не удалось выполнить запрос. Повторите попытку.'});});
app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('Chat Studio API: http://127.0.0.1:'+(process.env.PORT||3001)));
