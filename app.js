import express from "express";
import { randomUUID } from "crypto";
const app = express();
const port = 3000;

const posts = [
  {
    author: "Admin",
    date: "16 Jan 2026",
    title: "Welcome to Our New Platform",
    body: "We are thrilled to officially launch our new community hub. Our goal is to provide a space where creators and developers can share ideas, collaborate on projects, and stay updated with the latest industry trends. Take a look around and let us know what you think!"
  },
  {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
  {
    author: "Tech Guru",
    date: "15 Jan 2026",
    title: "The Future of Web Development",
    body: "As we move further into 2026, the integration of AI-driven components and edge computing is changing how we build for the web. Performance is no longer just about optimizing images; it's about delivering personalized, low-latency experiences to users across the globe."
  },
  {
    author: "Community Manager",
    date: "14 Jan 2026",
    title: "Upcoming Community Meetup",
    body: "Join us next Friday for our monthly virtual coffee chat! We'll be discussing the roadmap for Q1, answering your questions live, and hosting a small giveaway for our most active contributors. Don't forget to RSVP via the link in our bio."
  },
    {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
    {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
    {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
  {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
  {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  },
  {
    author: "Sarah Chen",
    date: "17 Jan 2026",
    title: "10 Tips for Better UI Design",
    body: "Visual hierarchy is the cornerstone of any great interface. In this post, we explore how whitespace, typography, and color theory work together to create an intuitive user experience. Remember: sometimes less is more when it comes to guiding your users through a workflow."
  }
];

posts.forEach(post => {
  if (!post.id) {
    post.id = randomUUID();
  }
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get("/", (req, res)=>{
    res.render("index", {posts:posts.slice(0,4)

    });
});

app.get("/home", (req, res)=>{
    res.render("index",{posts:posts.slice(0,4)

    });
});

app.get("/write-post", (req, res)=>{
    res.render("write-post");
});

app.get("/post", (req, res)=>{
    res.render("post-page",{posts
    });
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const { uid, password } = req.body;



  // TEMP logic (replace later with DB)
  if (uid === "admin" && password === "1234") {
    res.redirect("/home");
  } else {
    res.send("Invalid credentials");
  }
});




// Create new post
app.post("/compose", (req, res) => {
  const { title, body } = req.body;
  const post = {
    id: randomUUID(),
    author: "Admin",
    date: new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
    title: title || "Untitled",
    body: body || ""
  };
  posts.unshift(post);
  res.redirect(`/post/${post.id}`);
});

// Show all posts listing (already exists as /post but ensure proper)
app.get("/post", (req, res) => {
  res.render("post-page", { posts });
});

// Show single post
app.get("/post/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.render("single-post", { post });
});

// Edit form
app.get("/post/:id/edit", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.render("edit-post", { post });
});

// Update post
app.post("/post/:id/update", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");
  const { title, body } = req.body;
  post.title = title || post.title;
  post.body = body || post.body;
  post.date = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  res.redirect(`/post/${post.id}`);
});

// Delete post
app.post("/post/:id/delete", (req, res) => {
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).send("Post not found");
  posts.splice(idx, 1);
  res.redirect("/home");
});
app.listen(port, ()=>{
    console.log(`Server running on port ${port}.`);
});