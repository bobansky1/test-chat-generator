import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProject, parseText, sample, example, missingAssets, resolveImage } from '../src/model.ts';
test('sample round-trips without losing message content',()=>{const p=parseText(JSON.stringify(sample));assert.equal(p.messages.length,8);assert.equal(p.chat.name,'Александра');assert.equal(p.messages[4].reaction,'❤️');});
test('minimal array supplies defaults and unique IDs',()=>{const p=parseProject([{text:'Привет'},{sender:'me',text:'Пока'}]);assert.equal(p.screen.time,'9:41');assert.notEqual(p.messages[0].id,p.messages[1].id);assert.equal(p.messages[1].sender,'me');});
test('photo filenames are reported as missing and resolve after upload',()=>{const p=parseProject(example);assert.deepEqual(missingAssets(p),['avatar.jpg','photo.jpg']);p.assets['photo.jpg']='data:image/png;base64,AAAA';assert.equal(resolveImage('photo.jpg',p.assets),p.assets['photo.jpg']);assert.deepEqual(missingAssets(p),['avatar.jpg']);});
test('descriptive errors include the offending message',()=>{assert.throws(()=>parseProject({messages:[{text:'OK'},{text:'oops',time:'25:99'}]}),/Сообщение 2.*Время/);assert.throws(()=>parseProject({messages:[{text:'hello',sender:'unknown'}]}),/Сообщение 1/);});
test('invalid JSON, future versions, duplicate IDs and huge imports fail',()=>{assert.throws(()=>parseText('{bad'),/JSON/);assert.throws(()=>parseProject({version:2,messages:[]}),/version/);assert.throws(()=>parseProject({messages:[{id:'x',text:'one'},{id:'x',text:'two'}]}),/Повторяющийся/);assert.throws(()=>parseProject({messages:Array(1001).fill({text:'x'})}),/1000/);});
test('arbitrary image URLs and prototype keys are rejected',()=>{for(const image of ['javascript:alert(1)','https://host/a.png','data:image/svg+xml;base64,AAAA','../../a.png'])assert.throws(()=>parseProject({messages:[{type:'photo',image}]}));assert.throws(()=>parseText('{"messages":[],"assets":{"__proto__":"data:image/png;base64,AAAA"}}'),/Недопустимое/);assert.equal(resolveImage('toString',{}),undefined);});
test('iPhone options and voice/reply metadata survive JSON',()=>{const p=parseProject({screen:{battery:15,network:'5G',signal:2,theme:'dark',charging:true},messages:[{type:'voice',sender:'me',duration:'0:32',reply:'Привет',reaction:'👍'}]});assert.equal(p.screen.battery,15);assert.equal(p.messages[0].duration,'0:32');assert.equal(p.messages[0].reply,'Привет');assert.throws(()=>parseProject({messages:[],screen:{battery:150}}),/0 до 100/);});
test('BOM and markup in text are accepted as text',()=>{const p=parseText('\uFEFF{"messages":[{"text":"<script>alert(1)</script>"}]}');assert.equal(p.messages[0].text,'<script>alert(1)</script>');});
test('glass preset and pinned message survive JSON export and import',()=>{const p=parseProject({chat:{pinned:'Закреплённый текст'},screen:{muted:true,wallpaper:'violet',theme:'dark'},messages:[]});const restored=parseText(JSON.stringify(p));assert.equal(restored.chat.pinned,'Закреплённый текст');assert.equal(restored.screen.muted,true);assert.equal(restored.screen.wallpaper,'violet');});

test('custom wallpaper survives project import and reports a missing image',()=>{
 const p=parseProject({screen:{wallpaperImage:'background.jpg'},messages:[]});
 assert.deepEqual(missingAssets(p),['background.jpg']);
 p.assets['background.jpg']='data:image/png;base64,AAAA';
 const restored=parseText(JSON.stringify(p));
 assert.equal(resolveImage(restored.screen.wallpaperImage,restored.assets),p.assets['background.jpg']);
 assert.deepEqual(missingAssets(restored),[]);
 for(const wallpaperImage of ['https://host/a.png','javascript:alert(1)','data:image/svg+xml;base64,AAAA'])assert.throws(()=>parseProject({screen:{wallpaperImage},messages:[]}));
 assert.equal(parseProject({messages:[]}).screen.wallpaperImage,'');
});

test('bubble gradients and custom composer text survive JSON with validated colors',()=>{
 const outgoingGradient={start:'#8ef0a4',end:'#a9d8e5',text:'#183c32',angle:135};
 const incomingGradient={start:'#ffd5a3',end:'#f7abc9',text:'#58312f',angle:90};
 const p=parseText(JSON.stringify({screen:{composerText:'Mensaje',outgoingGradient,incomingGradient},messages:[]}));
 assert.deepEqual(p.screen.outgoingGradient,outgoingGradient);
 assert.deepEqual(p.screen.incomingGradient,incomingGradient);
 assert.equal(p.screen.composerText,'Mensaje');
 assert.equal(parseProject({messages:[]}).screen.composerText,'Сообщение');
 assert.equal(parseProject({messages:[],screen:{composerText:''}}).screen.composerText,'');
 assert.throws(()=>parseProject({messages:[],screen:{outgoingGradient:{...outgoingGradient,start:'url(https://example.com)'}}}),/Цвет/);
 assert.throws(()=>parseProject({messages:[],screen:{incomingGradient:{...incomingGradient,angle:400}}}),/0 до 360/);
});

test('AI prompt example and downloadable example match the current importer',async()=>{
 const {aiPrompt}=await import('../src/model.ts');
 const {readFileSync}=await import('node:fs');
 const embedded=aiPrompt.split('Пример валидного JSON:\n')[1];
 assert.ok(embedded);
 assert.doesNotThrow(()=>parseText(embedded));
 assert.deepEqual(JSON.parse(embedded),JSON.parse(readFileSync('public/chat-example.json','utf8')));
 const p=parseText(embedded);
 assert.ok(p.messages.some(m=>m.type==='emoji'));
 assert.ok(p.messages.some(m=>m.type==='voice'));
 const round=p.messages.find(m=>m.type==='round');
 assert.equal(round?.image,'photo.jpg');
 assert.equal(round?.duration,'0:03');
 assert.equal(p.screen.composerText,'Message');
 assert.ok(p.screen.outgoingGradient);
 for(const term of ['incomingGradient','wallpaperImage','>>>цитата>>>','||спойлер / скрытый текст||'])assert.ok(aiPrompt.includes(term));
});
