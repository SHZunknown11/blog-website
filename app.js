import express from "express";
import session from "express-session";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addSubscriber,
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

  const id = createPost({
    author: req.session.user,
    date: formatDate(),
    title,
    body,
  });
  res.redirect(`/post/${id}`);
});

/* ---------------------------- UPDATE ---------------------------- */

app.get("/post/:id/edit", requireAuth, (req, res) => {
  const post = getPost(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("edit-post", { post });
});

app.post("/post/:id/update", requireAuth, (req, res) => {
  const post = getPost(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }

  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).render("edit-post", {
      post: { ...post, title, body },
      error: "Title and body are required.",
    });
  }

  updatePost(post.id, { title, body, date: formatDate() });
  res.redirect(`/post/${post.id}`);
});

/* ---------------------------- DELETE ---------------------------- */

app.post("/post/:id/delete", requireAuth, (req, res) => {
  const post = getPost(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }
  deletePost(post.id);
  res.redirect("/home");
});

/* ----------------------------- AUTH ----------------------------- */

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { uid, password } = req.body;
  if (uid === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = uid;
    return res.redirect("/home");
  }
  res.status(401).render("login", { error: "Invalid username or password." });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});