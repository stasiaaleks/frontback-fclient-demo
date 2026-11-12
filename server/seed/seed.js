import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import CONFIG from '../src/constants/config.js';
import { connectDB, closeDB } from '../src/db/connection.js';
import ArticleRepository from '../src/db/articleRepository.js';
import UserRepository from '../src/db/userRepository.js';

const articles = JSON.parse(await readFile(new URL('./articles.json', import.meta.url), 'utf8'));

// two users to try locking from two browsers
const users = [
  { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
  { username: process.env.EDITOR_USERNAME, password: process.env.EDITOR_PASSWORD }
];

if (users.some((user) => !user.username || !user.password)) {
  console.error('Set ADMIN_* and EDITOR_* credentials in .env, see .env.example');
  process.exit(1);
}

const articleRepository = new ArticleRepository();
const userRepository = new UserRepository();

await connectDB();

await articleRepository.deleteAll();
const articleCount = await articleRepository.createMany(
  articles.map((article) => ({
    ...article,
    publishedAt: article.status === CONFIG.STATUS.DRAFT ? null : new Date(),
    lock: null
  }))
);

await userRepository.deleteAll();
await userRepository.ensureIndexes();
const userCount = await userRepository.createMany(
  await Promise.all(users.map(async ({ username, password }) => ({
    username,
    passwordHash: await bcrypt.hash(password, 10)
  })))
);

console.log(`Seeded ${articleCount} articles and ${userCount} users`);
await closeDB();
