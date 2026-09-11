import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("posts.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const seedPosts = [
  {
    author: "Admin",
    title: "Welcome to Our New Platform",
    body: "We are thrilled to officially launch our new community hub. Our goal is to provide a space where creators and developers can share ideas, collaborate on projects, and stay updated with the latest industry trends. Take a look around and let us know what you think!"
  },
  {
    author: "Sarah Chen",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
  {
    author: "Tech Guru",
    title: "The Future of Web Development",
    body: "As we move further into 2026, the integration of AI-driven components and edge computing is changing how we build for the web. Performance is no longer just about optimizing images; it's about delivering personalized, low-latency experiences to users across the globe."
  },
  {
    author: "Community Manager",
    title: "Upcoming Community Meetup",
    body: "Join us next Friday for our monthly virtual coffee chat! We'll be discussing the roadmap for Q1, answering your questions live, and hosting a small giveaway for our most active contributors. Don't forget to RSVP via the link in our bio."
  }
];

const count = db.prepare("SELECT COUNT(*) AS cnt FROM posts").get();
if (count.cnt === 0) {
  const insert = db.prepare("INSERT INTO posts (id, author, date, title, body) VALUES (?, ?, ?, ?, ?)");
  const insertMany = db.transaction(() => {
    for (const p of seedPosts) {
      insert.run(randomUUID(), p.author, "16 Jan 2026", p.title, p.body);
    }
  });
  insertMany();
}

const stmt = {
  all: db.prepare("SELECT * FROM posts ORDER BY created_at DESC"),
  byId: db.prepare("SELECT * FROM posts WHERE id = ?"),
  insert: db.prepare("INSERT INTO posts (id, author, date, title, body) VALUES (?, ?, ?, ?, ?)"),
  update: db.prepare("UPDATE posts SET title = ?, body = ?, date = ? WHERE id = ?"),
  remove: db.prepare("DELETE FROM posts WHERE id = ?"),
  addSub: db.prepare("INSERT OR IGNORE INTO subscribers (name, email) VALUES (?, ?)"),
  userByUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
  insertUser: db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)"),
};

export function getPosts(limit) {
  return limit ? db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT ?").all(limit) : stmt.all.all();
}

export function getPost(id) {
  return stmt.byId.get(id);
}

export function createPost({ author, date, title, body }) {
  const id = randomUUID();
  stmt.insert.run(id, author, date, title, body);
  return id;
}

export function updatePost(id, { title, body, date }) {
  stmt.update.run(title, body, date, id);
}

export function deletePost(id) {
  stmt.remove.run(id);
}

export function addSubscriber(name, email) {
  stmt.addSub.run(name, email);
}

export function getUserByUsername(username) {
  return stmt.userByUsername.get(username);
}

export function createUser({ username, passwordHash }) {
  const info = stmt.insertUser.run(username, passwordHash);
  return info.lastInsertRowid;
}

export default db;