import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isTallPhoto} from '../src/photo';

test('photo width depends on displayed height rather than source pixel count',()=>{
 assert.equal(isTallPhoto(1200,500,280),false);
 assert.equal(isTallPhoto(1200,1800,280),true);
 assert.equal(isTallPhoto(600,900,280),true);
 assert.equal(isTallPhoto(1200,1800,200),false);
 assert.equal(isTallPhoto(280,400,280),false);
 assert.equal(isTallPhoto(280,401,280),true);
});
