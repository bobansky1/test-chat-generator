import articles from '../content/articles.json';
import {faq} from './Editorial';

export const publicPaths=['/','/blog/',...articles.map(a=>`/blog/${a.slug}/`)];
export function pageMeta(path:string,origin:string){
 const clean=path==='/'?'/':path.replace(/\/$/,'');const article=articles.find(a=>clean===`/blog/${a.slug}`);
 const isHome=clean==='/',isBlog=clean==='/blog';const valid=isHome||isBlog||!!article;
 const canonical=origin.replace(/\/$/,'')+(isHome?'/':clean+'/');
 const title=article?article.title+' — Chat Studio':isBlog?'Инструкции по созданию переписки Telegram — Chat Studio':isHome?'Генератор переписки Telegram онлайн — Chat Studio':'Редактор переписки — Chat Studio';
 const description=article?.description||(isBlog?'Практические инструкции: как создать переписку Telegram, импортировать JSON, добавить фото и сохранить скриншот iPhone в PNG или HTML.':'Создайте макет переписки Telegram в стиле iPhone: сообщения, фото, реакции, время и батарея. Импорт JSON, бесплатный редактор, скачивание PNG и HTML по ключу.');
 const schema:unknown[]=isHome?[
  {'@context':'https://schema.org','@type':'WebApplication',name:'Chat Studio',url:canonical,description,applicationCategory:'DesignApplication',operatingSystem:'Web browser',inLanguage:'ru'},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))}
 ]:article?[
  {'@context':'https://schema.org','@type':'Article',headline:article.title,description:article.description,inLanguage:'ru',mainEntityOfPage:canonical,author:{'@type':'Organization',name:'Редакция Chat Studio'},publisher:{'@type':'Organization',name:'Chat Studio',url:origin},articleSection:article.category},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Главная',item:origin+'/'},{'@type':'ListItem',position:2,name:'Инструкции',item:origin+'/blog/'},{'@type':'ListItem',position:3,name:article.title,item:canonical}]}
 ]:isBlog?[{'@context':'https://schema.org','@type':'CollectionPage',name:title,url:canonical,inLanguage:'ru'}]:[];
 return {title,description,canonical,schema,valid};
}
export function applySeo(path:string){
 const origin=import.meta.env.VITE_SITE_URL||location.origin;const meta=pageMeta(path,origin);
 document.title=meta.title;
 function tag(name:string,value:string,property=false){let el=document.head.querySelector<HTMLMetaElement>(`meta[${property?'property':'name'}="${name}"]`);if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.append(el);}el.content=value;}
 const local=['localhost','127.0.0.1'].includes(new URL(origin).hostname);
 tag('description',meta.description);tag('robots',meta.valid&&!local?'index,follow':'noindex,follow');
 tag('og:title',meta.title,true);tag('og:description',meta.description,true);tag('og:url',meta.canonical,true);tag('og:type',path.startsWith('/blog/')&&path!=='/blog/'?'article':'website',true);tag('og:locale','ru_RU',true);
 let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=meta.canonical;
 let schema=document.getElementById('seo-schema') as HTMLScriptElement|null;if(!schema){schema=document.createElement('script');schema.id='seo-schema';schema.type='application/ld+json';document.head.append(schema);}schema.textContent=JSON.stringify(meta.schema);
}
