import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addSubscriber,
  getUserByUsername,
  createUser,
} from "./db.js";

const app = express();
const port = 3000;

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "ink-wave-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
  })
);

// expose the logged-in user to every template
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// guard for routes that require authentication
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect("/login");
}

// guard for routes that require ownership of the post (or admin)
function requireOwnerOrAdmin(req, res, next) {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).render("404");

  const user = req.session.user;
  if (!user) return res.redirect("/login");

  const isAdmin = user.role === "admin";
  const isOwner = user.username && post.author && user.username.toLowerCase() === post.author.toLowerCase();

  if (!isAdmin && !isOwner) {
    return res.status(403).render("403", { post });
  }

  req.post = post;
  next();
}

function formatDate() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ----------------------------- READ ----------------------------- */

app.get("/", (req, res) => {
  res.render("index", { posts: getPosts(4) });
});

app.get("/home", (req, res) => {
  res.render("index", { posts: getPosts(4) });
});

app.get("/post", (req, res) => {
  res.render("post-page", { posts: getPosts() });
});

app.get("/post/:id", (req, res) => {
  const post = getPost(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("single-post", { post });
});

/* ---------------------------- CREATE ---------------------------- */

app.get("/write-post", requireAuth, (req, res) => {
  res.render("write-post", { error: null, values: {} });
});

app.post("/compose", requireAuth, (req, res) => {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).render("write-post", {
      error: "Title and body are required.",
      values: { title, body },
    });
  }

  if (title.length > 100) {
    return res.status(400).render("write-post", {
      error: "Title must be 100 characters or fewer.",
      values: { title, body },
    });
  }

  if (body.length > 500) {
    return res.status(400).render("write-post", {
      error: "Body must be 500 characters or fewer.",
      values: { title, body },
    });
  }

  const id = createPost({
    author: req.session.user.username,
    date: formatDate(),
    title,
    body,
  });
  res.redirect(`/post/${id}`);
});

/* ---------------------------- UPDATE ---------------------------- */

app.get("/post/:id/edit", requireAuth, requireOwnerOrAdmin, (req, res) => {
  res.render("edit-post", { post: req.post, error: null });
});

app.post("/post/:id/update", requireAuth, requireOwnerOrAdmin, (req, res) => {
  const post = req.post;

  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).render("edit-post", {
      post: { ...post, title, body },
      error: "Title and body are required.",
    });
  }

  if (title.length > 100) {
    return res.status(400).render("edit-post", {
      post: { ...post, title, body },
      error: "Title must be 100 characters or fewer.",
    });
  }

  if (body.length > 500) {
    return res.status(400).render("edit-post", {
      post: { ...post, title, body },
      error: "Body must be 500 characters or fewer.",
    });
  }

  updatePost(post.id, { title, body, date: formatDate() });
  res.redirect(`/post/${post.id}`);
});

/* ---------------------------- DELETE ---------------------------- */

app.post("/post/:id/delete", requireAuth, requireOwnerOrAdmin, (req, res) => {
  deletePost(req.post.id);
  res.redirect("/home");
});

/* ----------------------------- AUTH ----------------------------- */

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const uid = (req.body.uid || "").trim();
  const password = req.body.password || "";

  if (uid === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = { username: uid, role: "admin" };
    return res.redirect("/home");
  }

  const dbUser = getUserByUsername(uid);
  if (dbUser && bcrypt.compareSync(password, dbUser.password_hash)) {
    req.session.user = { username: dbUser.username, role: "user" };
    return res.redirect("/home");
  }

  res.status(401).render("login", { error: "Invalid username or password." });
});

app.get("/signup", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.render("signup", { error: null, values: {} });
});

app.post("/signup", (req, res) => {
  const uid = (req.body.uid || "").trim();
  const password = req.body.password || "";
  const confirm = req.body.confirm || "";

  const rerender = (error) =>
    res.status(400).render("signup", { error, values: { uid } });

  if (!uid || !password || !confirm) {
    return rerender("All fields are required.");
  }
  if (uid.toLowerCase() === ADMIN_USER.toLowerCase()) {
    return rerender("That username is reserved. Please choose another.");
  }
  if (password.length < 4) {
    return rerender("Password must be at least 4 characters.");
  }
  if (password !== confirm) {
    return rerender("Passwords do not match.");
  }
  if (getUserByUsername(uid)) {
    return rerender("That username is already taken.");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  createUser({ username: uid, passwordHash });

  req.session.user = { username: uid, role: "user" };
  res.redirect("/home");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/home"));
});

/* --------------------------- SUBSCRIBE -------------------------- */

app.post("/subscribe", (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  if (name && email) {
    addSubscriber(name, email);
  }
  res.redirect("/home");
});

/* --------------------------- FALLBACKS -------------------------- */

app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong.");
});

export { app };

if (process.argv[1] && process.argv[1].endsWith("app.js")) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
}