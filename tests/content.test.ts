import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import articles from '../content/articles.json';
import {parseText} from '../src/model.ts';
test('article links resolve, headings have unique anchors, and import examples are accepted',()=>{
 const slugs=new Set(articles.map(a=>a.slug));assert.equal(slugs.size,articles.length);
 for(const a of articles){assert.equal(new Set(a.sections.map(s=>s.id)).size,a.sections.length);for(const s of a.sections){if('links' in s&&s.links)for(const link of s.links)assert.ok(slugs.has(link),`${a.slug}: missing ${link}`);if('code' in s&&s.code)assert.doesNotThrow(()=>parseText(s.code));}}
});
test('public SEO build contains article text, one H1, canonical and structured data without JS',()=>{
 if(!existsSync('dist/sitemap.xml'))throw new Error('Run npm run build before checking SEO pages');
 const titles=new Set<string>();
 for(const a of articles){const html=readFileSync(`dist/blog/${a.slug}/index.html`,'utf8');assert.ok(html.includes(a.title));assert.ok(html.includes(a.sections[0].paragraphs[0]));assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);assert.match(html,/rel="canonical"/);assert.match(html,/application\/ld\+json/);assert.ok(html.includes('"@type":"Article"'));const title=html.match(/<title>(.*?)<\/title>/)![1];assert.ok(!titles.has(title));titles.add(title);}
 const home=readFileSync('dist/index.html','utf8');assert.match(home,/Демонстрационный отзыв/);assert.ok(!home.includes('AggregateRating'));assert.match(readFileSync('dist/app/index.html','utf8'),/noindex,follow/);
});
