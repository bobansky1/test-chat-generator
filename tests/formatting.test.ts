import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FormattedText} from '../src/FormattedText';
import {parseProject,parseText} from '../src/model';

test('formatting supports nested styles, multiline text and literal HTML',()=>{
 const html=renderToStaticMarkup(createElement(FormattedText,{text:'**жирный *курсив*** __линия__ ~~удалён~~ `**код**` <script>alert(1)</script>'}));
 assert.ok(html.includes('<strong>жирный <em>курсив</em></strong>'));
 assert.ok(html.includes('<u>линия</u>'));
 assert.ok(html.includes('<s>удалён</s>'));
 assert.ok(html.includes('<code>**код**</code>'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
 assert.ok(renderToStaticMarkup(createElement(FormattedText,{text:'**один\nдва**'})).includes('<strong>один\nдва</strong>'));
});
test('emoji messages round-trip and validate their content',()=>{
 const p=parseProject({messages:[{type:'emoji',text:'👍🏽 ❤️ 👨‍👩‍👧‍👦 🇷🇺',time:'19:58'}]});
 assert.equal(parseText(JSON.stringify(p)).messages[0].type,'emoji');
 assert.throws(()=>parseProject({messages:[{type:'emoji',text:'hello'}]}),/эмодзи/);
 assert.throws(()=>parseProject({messages:[{type:'emoji',text:''}]}),/text/);
});

test('quotes and spoilers retain nested formatting and hide text by default',()=>{
 const html=renderToStaticMarkup(createElement(FormattedText,{text:'>>>Цитата **важно**>>> Счёт: ||1234 __5678__||'}));
 assert.match(html,/class="tg-quote"/);
 assert.ok(html.includes('<strong>важно</strong>'));
 assert.match(html,/data-spoiler="true"/);
 assert.match(html,/aria-expanded="false"/);
 assert.match(html,/class="spoiler-content" aria-hidden="true"/);
 assert.ok(html.includes('<u>5678</u>'));
 const restored=parseText(JSON.stringify({messages:[{text:'>>>Цитата>>> ||секрет||'}]}));
 assert.equal(restored.messages[0].text,'>>>Цитата>>> ||секрет||');
});
