import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseProject,parseText,missingAssets} from '../src/model';
import {RoundMessage} from '../src/RoundMessage';

test('round photo messages retain the image, duration and delivery status in JSON',()=>{
 const p=parseProject({messages:[{type:'round',image:'frame.jpg',duration:'0:03',time:'09:20',sender:'me',status:'read'}]});
 assert.deepEqual(missingAssets(p),['frame.jpg']);
 p.assets['frame.jpg']='data:image/png;base64,AAAA';
 const restored=parseText(JSON.stringify(p));
 assert.equal(restored.messages[0].type,'round');
 assert.equal(restored.messages[0].duration,'0:03');
 assert.equal(restored.messages[0].time,'09:20');
 assert.equal(restored.messages[0].status,'read');
 assert.equal(restored.assets['frame.jpg'],p.assets['frame.jpg']);
 assert.deepEqual(missingAssets(restored),[]);
 const html=renderToStaticMarkup(createElement(RoundMessage,{message:restored.messages[0],image:restored.assets['frame.jpg']}));
 assert.match(html,/class="round-photo"/);
 assert.match(html,/aria-label="Без звука"/);
 assert.match(html,/class="round-duration">0:03/);
 assert.match(html,/class="round-meta">09:20/);
});
test('round messages require a local image and valid duration',()=>{
 assert.throws(()=>parseProject({messages:[{type:'round',duration:'0:03'}]}),/image/);
 assert.throws(()=>parseProject({messages:[{type:'round',image:'https://example.com/a.png'}]}),/Фото/);
 for(const duration of ['0:60','3','-1:03','abc'])assert.throws(()=>parseProject({messages:[{type:'round',image:'frame.jpg',duration}]}),/Длительность/);
 assert.equal(parseProject({messages:[{type:'round',image:'frame.jpg'}]}).messages[0].duration,'0:12');
});
