import express from 'express';
import { fileURLToPath } from 'node:url';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));

const app=express();
app.disable('x-powered-by');
app.use(express.static(dist,{setHeaders(res,path){if(path.endsWith('.html'))res.setHeader('Cache-Control','no-cache');}}));
app.get(['/app','/app/'],(req,res)=>res.redirect(302,'/'+(req.originalUrl.includes('?')?req.originalUrl.slice(req.originalUrl.indexOf('?')):'')));
app.get('/{*path}',(_,res)=>res.status(404).send('Страница не найдена'));
app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('Chat Studio: http://127.0.0.1:'+(process.env.PORT||3001)));
