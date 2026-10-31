import { request as httpRequest } from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import { runtimeConfig } from '../server/config.js';
import { createApp } from '../server/app.js';
const env={APP_MODE:'hosted',MONGODB_URI:'mongodb://example.invalid/taskline',DEMO_PASSWORD:'test-only-long-password',PUBLIC_BASE_URL:'https://demo.example.com'};
test('hosting requires a database and HTTPS public URL, without demo credentials',()=>{
  assert.equal(runtimeConfig({}).host,'127.0.0.1');assert.equal(runtimeConfig({...env,DEMO_PASSWORD:undefined}).host,'0.0.0.0');
  assert.throws(()=>runtimeConfig({...env,MONGODB_URI:''}),/MONGODB_URI/);
  assert.throws(()=>runtimeConfig({...env,PUBLIC_BASE_URL:'http://demo.example.com'}),/HTTPS/);
  assert.equal(runtimeConfig({...env,PUBLIC_BASE_URL:undefined,RENDER:'true',RENDER_EXTERNAL_URL:'https://demo.onrender.com'}).origin,'https://demo.onrender.com');
});
test('hosted public access, host guards, health checks and public origin',async()=>{
 const app=createApp(runtimeConfig(env));app.get('/',(req,res)=>res.send('Demo interface'));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}`;const auth='Basic '+Buffer.from('evaluator:'+env.DEMO_PASSWORD).toString('base64');
 const request=(route,options={})=>new Promise((resolve,reject)=>{const req=httpRequest(new URL(base+route),{...options,headers:{Host:'demo.example.com',...options.headers}},res=>{let body='';res.setEncoding('utf8');res.on('data',part=>body+=part);res.on('end',()=>resolve({status:res.statusCode,text:async()=>body}));});req.on('error',reject);req.end(options.body);});
 try{
  assert.equal((await request('/')).status,200);
  assert.equal((await request('/',{headers:{Authorization:'Basic '+Buffer.from('evaluator:wrong').toString('base64')}})).status,200);
  assert.equal(await (await request('/',{headers:{Authorization:auth}})).text(),'Demo interface');
  assert.equal((await request('/',{headers:{Host:'evil.example.com',Authorization:auth}})).status,403);
  assert.equal((await request('/api/health')).status,503);
  const post=origin=>request('/api/projects',{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json',Origin:origin},body:JSON.stringify({name:''})});
  assert.equal((await post('https://evil.example.com')).status,403);
  assert.equal((await post('https://demo.example.com')).status,400);
 }finally{await new Promise(r=>server.close(r));}
});
