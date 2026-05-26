# Domain Name Generator

This is a Vercel-ready domain name generator.

## Clean structure

```text
.
├── index.html          # Website homepage, served at /
├── styles.css          # Website styling
├── app.js              # Browser JavaScript
├── saloon-bg.png       # Image asset
├── api/
│   └── [...path].js    # Vercel serverless API handler for /api/*
├── server.js           # Express API + local dev server
├── package.json
├── package-lock.json
├── vercel.json
└── .gitignore
```

## Deploy to Vercel

1. Upload these files to a GitHub repository.
2. Import the repository in Vercel.
3. Leave Framework Preset as **Other**.
4. Leave Build Command empty.
5. Leave Output Directory empty.
6. Deploy.

Important: do not set the Vercel project root to `api`. The project root must be the folder that contains `index.html` and `vercel.json`.

## Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

API endpoints used by the website:

```text
GET  /api/words/meta
POST /api/check
```
