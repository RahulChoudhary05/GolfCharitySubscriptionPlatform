# Frontend - Golf Charity Subscription Platform

React + Vite client for authentication, subscriptions, score entry, draw results, and admin dashboard views.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment

Create frontend/.env:

```env
VITE_API_URL=http://localhost:5000/api
```

For production on Vercel:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

## Deployment Notes

- vercel.json includes SPA route rewrite support.
- favicon is customized at public/favicon.svg.
- index.html includes SEO description metadata.
