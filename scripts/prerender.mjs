import 'dotenv/config';
import {createServer} from 'vite';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const origin=(process.env.SITE_URL||process.env.VITE_SITE_URL||'http://127.0.0.1:5173').replace(/\/$/,'');
const url=new URL(origin);if(!['http:','https:'].includes(url.protocol)||url.pathname!=='/')throw new Error('SITE_URL must be the absolute site origin');
const configured=!['localhost','127.0.0.1'].includes(url.hostname);
const vite=await createServer({server:{middlewareMode:true},ssr:{noExternal:['gsap']},appType:'custom'});
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
try{
 const {render,pageMeta,publicPaths}=await vite.ssrLoadModule('/src/seo-entry.tsx');
 const template=await readFile('dist/index.html','utf8');
 for(const path of publicPaths){
  const meta=pageMeta(path,origin);
  const head=`<link rel="canonical" href="${escape(meta.canonical)}"><meta name="robots" content="${configured?'index,follow':'noindex,follow'}"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(meta.canonical)}"><meta property="og:type" content="${path.startsWith('/blog/')&&path!=='/blog/'?'article':'website'}"><meta property="og:locale" content="ru_RU"><meta name="twitter:card" content="summary"><script id="seo-schema" type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g,'\\u003c')}</script>`;
  const html=template.replace(/<title>.*?<\/title>/,`<title>${escape(meta.title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/,`<meta name="description" content="${escape(meta.description)}">`).replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${render(path)}</div>`);
  const directory=resolve('dist','.'+path);await mkdir(directory,{recursive:true});await writeFile(resolve(directory,'index.html'),html);
 }
 // The editor uses a separate empty shell, never the pre-rendered landing page.
 await mkdir('dist/app',{recursive:true});await writeFile('dist/app/index.html',template.replace('</head>','<meta name="robots" content="noindex,follow"></head>'));
 await writeFile('dist/404.html',template.replace('<title>Chat Studio — редактор переписки</title>','<title>Страница не найдена — Chat Studio</title>').replace('</head>','<meta name="robots" content="noindex,follow"></head>').replace('<div id="root"></div>',`<div id="root">${render('/404')}</div>`));
 await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPaths.map(p=>`<url><loc>${escape(origin+p)}</loc></url>`).join('')}</urlset>`);
 await writeFile('dist/robots.txt',configured?`User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
 console.log(`Pre-rendered ${publicPaths.length} public pages; ${configured?'indexing enabled for '+origin:'set SITE_URL to your public domain before publishing'}.`);
}finally{await vite.close();}
