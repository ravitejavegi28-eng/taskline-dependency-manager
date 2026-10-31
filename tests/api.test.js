import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { createApp } from '../server/app.js';
import { Project } from '../server/db.js';

test('API to real MongoDB: saves, validation, revisions and local access', async t => {
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14', downloadDir: path.resolve('data/binaries') } });
  let server;
  try {
    await mongoose.connect(mongo.getUri('taskline-tests'));
    server = createApp().listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async (url, method='GET', body, headers={}) => { const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined}); return { status:r.status, data:await r.json() }; };
    const created = await request('/projects','POST',{name:'Automated test project'});
    assert.equal(created.status,201);
    const id=created.data.id;
    const task=(id,dependencies=[],status='todo')=>({id,title:id,owner:'Tester',description:'',priority:'high',status,dueDate:'2026-12-10',dependencies});
    let tasks=[task('a'),task('b',['a']),task('c',['b'])];
    await t.test('persists task data in MongoDB and derives blocked state',async()=>{const r=await request(`/projects/${id}`,'PUT',{revision:0,tasks});assert.equal(r.status,200);assert.equal(r.data.tasks[1].displayStatus,'blocked');assert.equal((await Project.findOne({id}).lean()).tasks.length,3);});
    await t.test('rejects circular dependency without writing to MongoDB',async()=>{const r=await request(`/projects/${id}`,'PUT',{revision:1,tasks:tasks.map(x=>x.id==='a'?{...x,dependencies:['c']}:x)});assert.equal(r.status,400);assert.match(r.data.error,/Circular/);assert.equal((await Project.findOne({id}).lean()).revision,1);});
    await t.test('rejects invalid calendar dates',async()=>{const r=await request(`/projects/${id}`,'PUT',{revision:1,tasks:tasks.map(x=>({...x,dueDate:'2026-02-31'}))});assert.equal(r.status,400);});
    await t.test('rejects starting blocked task',async()=>{const r=await request(`/projects/${id}`,'PUT',{revision:1,tasks:tasks.map(x=>x.id==='b'?{...x,status:'in_progress'}:x)});assert.equal(r.status,400);});
    await t.test('completion unlocks next task and remains after readback',async()=>{tasks=tasks.map(x=>x.id==='a'?{...x,status:'completed'}:x);const r=await request(`/projects/${id}`,'PUT',{revision:1,tasks});assert.equal(r.status,200);assert.equal(r.data.tasks[1].displayStatus,'ready');const read=await request('/projects');assert.equal(read.data[0].tasks[0].status,'completed');});
    await t.test('rejects stale writes and cross-site writes',async()=>{assert.equal((await request(`/projects/${id}`,'PUT',{revision:1,tasks})).status,409);assert.equal((await request('/projects','POST',{name:'Wrong origin'},{Origin:'https://example.com'})).status,403);});
    await t.test('deleting a task with cleaned edges saves and updates readiness',async()=>{const next=tasks.filter(x=>x.id!=='b').map(x=>({...x,dependencies:x.dependencies.filter(d=>d!=='b')}));const r=await request(`/projects/${id}`,'PUT',{revision:2,tasks:next});assert.equal(r.status,200);assert.equal(r.data.tasks.find(x=>x.id==='c').displayStatus,'ready');});
  } finally { if(server)await new Promise(resolve=>server.close(resolve));await mongoose.disconnect();await mongo.stop(); }
});
