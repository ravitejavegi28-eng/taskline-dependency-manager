import mongoose from 'mongoose';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { seedProject } from './seed.js';

const taskSchema = new mongoose.Schema({ id: { type: String, required: true }, title: { type: String, required: true, maxlength: 120 }, description: { type: String, maxlength: 2000 }, owner: { type: String, maxlength: 60 }, priority: { type: String, enum: ['low', 'medium', 'high'] }, status: { type: String, enum: ['todo', 'in_progress', 'completed'] }, dueDate: String, dependencies: [String], createdAt: String }, { _id: false });
const schema = new mongoose.Schema({ id: { type: String, required: true, unique: true }, name: { type: String, required: true }, description: String, revision: { type: Number, default: 0 }, tasks: [taskSchema], activity: [{ _id: false, id: String, text: String, at: String }] }, { versionKey: false });
export const Project = mongoose.model('Project', schema);
let local;
export let databaseMode = 'MongoDB';
export async function connectDatabase() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.VERCEL === '1' || process.env.RENDER === 'true' || process.env.APP_MODE === 'hosted') throw new Error('Hosted mode requires MONGODB_URI.');
    const { MongoMemoryServer } = await import('mongodb-memory-server-core');
    const dbPath = path.resolve('data/mongodb');
    await mkdir(dbPath, { recursive: true });
    process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('data/binaries');
    console.log('Starting local MongoDB. First launch may download the MongoDB binary.');
    local = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger', dbName: 'taskline' }, binary: { version: '7.0.14', downloadDir: path.resolve('data/binaries') } });
    uri = local.getUri('taskline');
    databaseMode = 'Local MongoDB · Mongoose';
  } else databaseMode = 'MongoDB · Mongoose';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  if (!await Project.exists({})) await Project.create(seedProject());
  console.log('MongoDB connected through Mongoose.');
}
export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (local) await local.stop({ doCleanup: false });
}
