# Prefix/Suffix Domain Generator

This version preserves the original frontend design and behavior, including the saloon background and machine UI.

## Local run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Upload this folder to GitHub.
2. Import the GitHub repo in Vercel.
3. Use these settings:
   - Framework Preset: Other
   - Build Command: leave empty
   - Output Directory: leave empty
4. Deploy.

The frontend is served from `index.html`. The Express API is served through `api/[...path].js`.
