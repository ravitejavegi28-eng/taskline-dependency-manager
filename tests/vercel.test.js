import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { request as httpRequest } from 'node:http';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { createVercelHandler } from '../server/vercel-handler.js';
import { runtimeConfig } from '../server/config.js';
const env={VERCEL:'1',VERCEL_ENV:'production',VERCEL_PROJECT_PRODUCTION_URL:'demo.vercel.app',MONGODB_URI:'mongodb://example.invalid/taskline',DEMO_PASSWORD:'test-only-shared-password'};
test('Vercel selects hosted configuration and canonical URL',()=>{const config=runtimeConfig(env);assert.equal(config.hosted,true);assert.equal(config.origin,'https://demo.vercel.app');assert.throws(()=>runtimeConfig({...env,MONGODB_URI:''}),/MONGODB_URI/);});
test('serverless errors return JSON and initialization can retry',async()=>{let tries=0;const handler=createVercelHandler({readConfig:()=>({}),connect:async()=>{tries++;throw new Error('private connection details');}});const res={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};await handler({},res);assert.equal(res.code,503);assert.match(res.body.error,/database is unavailable/);assert.ok(!res.body.error.includes('private connection details'));await handler({},res);assert.equal(tries,2);});
test('serverless API initializes once and persists public writes without authorization',async()=>{
 const mongo=await MongoMemoryServer.create({binary:{version:'7.0.14',downloadDir:path.resolve('data/binaries')}});let server;let initializations=0;
 try{
 const handler=createVercelHandler({readConfig:()=>runtimeConfig(env),connect:async()=>{initializations++;await mongoose.connect(mongo.getUri('vercel-adapter-tests'));}});
 const outer=express();outer.use(handler);server=outer.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const auth='Basic '+Buffer.from('evaluator:'+env.DEMO_PASSWORD).toString('base64');
 const send=(route,method='GET',body,authorized=false)=>new Promise((resolve,reject)=>{const req=httpRequest({hostname:'127.0.0.1',port:server.address().port,path:route,method,headers:{Host:'demo.vercel.app','Content-Type':'application/json',Origin:'https://demo.vercel.app',...(authorized?{Authorization:auth}:{})}},res=>{let value='';res.setEncoding('utf8');res.on('data',part=>value+=part);res.on('end',()=>resolve({status:res.statusCode,value}));});req.on('error',reject);req.end(body?JSON.stringify(body):undefined);});
 assert.equal((await send('/api/health')).status,200);assert.equal((await send('/api/projects','GET',null,false)).status,200);
 const created=await send('/api/projects','POST',{name:'Vercel adapter project'});assert.equal(created.status,201);assert.equal(JSON.parse(created.value).name,'Vercel adapter project');
 assert.equal(JSON.parse((await send('/api/projects')).value).length,1);assert.equal(initializations,1);
 }finally{if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();await mongo.stop();}
});

test('Atlas authentication errors identify the credential problem without exposing secrets',async()=>{const handler=createVercelHandler({readConfig:()=>({}),connect:async()=>{throw Object.assign(new Error('auth failed with private connection details'),{name:'MongoServerError',code:18,codeName:'AuthenticationFailed'});}});const res={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};await handler({},res);assert.equal(res.code,503);assert.match(res.body.error,/Atlas rejected/);assert.ok(!res.body.error.includes('private connection details'));});
