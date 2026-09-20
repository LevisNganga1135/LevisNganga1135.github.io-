/* ------------------------------------------------------------------
   EDIT THIS FILE to update your portfolio.
   - Add a live URL to any project with `live: "https://..."`.
     A "Live site" button appears automatically when `live` is set.
   - Set `caseStudy: false` to hide the case-study page for a project.
   - Add a screenshot with `image: "assets/images/your-shot.png"`.
------------------------------------------------------------------- */
window.SITE = {
  name: "Levis Nganga",
  role: "Software Engineer",
  location: "Nairobi, Kenya",
  email: "leviskariuki2@gmail.com", // <- replace with your real email
  github: "https://github.com/LevisNganga1135",

  projects: [
    {
      slug: "feel-the-burn",
      title: "Feel The Burn",
      type: "Full-stack fitness app",
      year: "2026",
      summary:
        "A fitness tracker that logs workouts, charts progress and streaks, plans meals around Kenyan food, and connects people through a community feed.",
      tags: ["React", "Flask", "PostgreSQL", "Recharts", "JWT", "WebAuthn"],
      live: "https://calipath-eta.vercel.app",
      repo: "https://github.com/LevisNganga1135/calipath",
      caseStudy: true,
      problem:
        "Feel The Burn started as a workout tracker. In a user interview for the project, the tester asked for a diet plan built around local Kenyan cuisine with macro tracking. That request shaped the second phase: a backend with real accounts and a food database that treats ugali and sukuma wiki as first-class ingredients.",
      built: [
        "Workout logging: routines, sessions and set-by-set logs, with ownership checks so every user only sees their own data.",
        "Progress and streaks: Recharts graphs for weight, measurements and projections, plus a streak tracker.",
        "Diet plan: a curated, admin-managed food database with Kenyan staples such as ugali, sukuma wiki, nyama choma and githeri, plus meal logging and a calorie calculator.",
        "Exercise library: a self-hosted exercise model for weight lifting and calisthenics, tagged by body goal (bulk, athletic, lean, muscular).",
        "Community: posts, likes, comments, follows and profile pages with photo grids.",
        "Sign-in: JWT authentication with bcrypt-hashed passwords, plus passwordless passkeys with WebAuthn.",
        "Coach chat: an in-app AI coaching conversation."
      ],
      stack: [
        { label: "Frontend", items: "React, Recharts, a custom ember and charcoal design system" },
        { label: "Backend", items: "Flask, SQLAlchemy, PostgreSQL, Flask-JWT-Extended" },
        { label: "Hosting", items: "Vercel for the frontend, Render for the API" }
      ],
      learned:
        "I built the diet API as a standalone service first, checked it end to end with seeded Kenyan foods, and only then merged it into the main backend and ran the migration on production. Replacing a third-party exercise API with my own data model took more time up front, but it gave me full control over how exercises are curated."
    },
    {
      slug: "mama-oliech-restaurant",
      title: "Mama Oliech Restaurant",
      type: "Restaurant web app · Team project",
      summary:
        "A restaurant website that makes day-to-day work easier, with a REST API, a SQL database and M-Pesa payments.",
      tags: ["Node.js", "Express", "Knex", "SQL", "M-Pesa", "REST API"],
      live: "",
      repo: "https://github.com/LevisNganga1135/Mama-oliech-restorant",
      caseStudy: true,
      problem:
        "The goal was a website that makes running the restaurant easier, including payments through M-Pesa, the mobile-money service most customers in Kenya already use. I built it as a team project with Chalton on a shared Node.js codebase.",
      built: [
        "A REST API on Node.js and Express.",
        "SQL data access through Knex.",
        "M-Pesa payment integration.",
        "Teamwork through a shared upstream repository, merging teammates' changes into my fork."
      ],
      stack: [
        { label: "Backend", items: "Node.js, Express, Knex, SQL" },
        { label: "Payments", items: "M-Pesa" },
        { label: "Workflow", items: "Git and GitHub, shared upstream repository" }
      ],
      learned:
        "Working from a shared upstream repository taught me to pull often, resolve merge conflicts calmly and keep changes small enough for a teammate to review."
    },
    {
      slug: "supercar-tracker",
      title: "SuperCar Tracker",
      type: "Python command-line tool",
      summary:
        "A dealership management tool for the terminal that keeps its inventory in JSON files, with a matching admin portal.",
      tags: ["Python", "argparse", "pytest", "JSON", "Git"],
      live: "",
      repo: "https://github.com/LevisNganga1135/supercar-tracker",
      caseStudy: true,
      problem:
        "I wanted a project where the structure mattered as much as the features: a modular Python codebase with real persistence, tests and a professional Git workflow.",
      built: [
        "A modular command-line interface built with argparse.",
        "JSON persistence for the dealership inventory.",
        "A pytest test suite.",
        "A full Git workflow with feature branches and a merged pull request.",
        "A related SuperCar Admin Portal."
      ],
      stack: [
        { label: "Language", items: "Python" },
        { label: "Interface", items: "argparse command-line interface" },
        { label: "Quality", items: "pytest, feature branches, pull requests" }
      ],
      learned:
        "Non-sequential IDs turned out to come from counter inheritance and from_dict() creating extra IDs in my file I/O utilities. Tracing that bug taught me to follow state through file reads and writes, and to lock the fix in with tests."
    },
    {
      slug: "school-management-api",
      title: "School Management API",
      type: "Flask API with a styled web UI",
      summary:
        "A Flask API for managing a school, served with a styled HTML interface instead of raw JSON.",
      tags: ["Python", "Flask", "REST API", "HTML/CSS"],
      live: "",
      repo: "", // <- add the repo URL; the button falls back to your GitHub profile
      caseStudy: true,
      problem:
        "I wanted an API that non-developers could actually use, so the project serves a styled HTML interface on top of the endpoints rather than returning raw JSON.",
      built: [
        "A Flask API for school management data.",
        "A styled HTML interface served on top of the API.",
        "A clean development setup on Ubuntu with VS Code and a virtual environment."
      ],
      stack: [
        { label: "Backend", items: "Python, Flask" },
        { label: "Frontend", items: "HTML and CSS templates" },
        { label: "Environment", items: "Ubuntu, VS Code, Python virtual environments" }
      ],
      learned:
        "Setting this up on a fresh Ubuntu machine meant working through PEP 668 restrictions and a missing venv, which made virtual environments something I now set up first, not last."
    },
    {
      slug: "digital-library-app",
      title: "Digital Library App",
      type: "Web app · Team project",
      summary: "A digital library web application built with JavaScript.",
      tags: ["JavaScript", "Team project"],
      live: "",
      repo: "https://github.com/LevisNganga1135/digital-library-app",
      caseStudy: false
    },
    {
      slug: "spa-dictionary",
      title: "SPA Dictionary",
      type: "Single-page web app",
      summary: "A single-page dictionary app built with JavaScript.",
      tags: ["JavaScript", "SPA"],
      live: "",
      repo: "https://github.com/LevisNganga1135/SPA-DICTIONARY",
      caseStudy: false
    }
  ]
};
