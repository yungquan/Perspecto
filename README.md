# Perspecto

**Free 3D UI mockup generator.** Upload any screenshot → adjust perspective, depth, and layers → export a 2× high-res PNG with transparent background.

🔗 [perspecto.com](https://perspecto.com)

---

## Features

- CSS 3D transforms with real-time sliders (Perspective, Rotate X/Y/Z, Shadow Depth, Zoom)
- 6 one-click angle presets: Flat, Hero, Iso L, Iso R, Top Down, Float
- Three-layer depth stack (ambient glow → base image → glass overlay)
- Glassmorphic border toggle
- Browser chrome frame overlay
- Custom Canvas 2D export engine (no html2canvas — real 3D math)
- 2× retina PNG export with transparent / dark / light background options
- Watermark with viral share loop
- Undo reset
- Paste from clipboard (Ctrl+V)
- Fully responsive — works on tablet and mobile

---

## Tech Stack

- React 18 + Vite
- lucide-react icons
- Pure CSS 3D transforms (`transform-style: preserve-3d`, `perspective`, `translateZ`)
- Custom Canvas 2D renderer for export (affine triangle subdivision, perspective projection)
- Zero backend — 100% client-side

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel (5 minutes)

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**

### Connect your domain

1. Buy domain from [Porkbun](https://porkbun.com) or [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (~$9–11/yr for `.com`)
2. In Vercel dashboard → your project → **Settings → Domains**
3. Add your domain → Vercel gives you DNS records to add
4. Update in 2 files once domain is live:
   - `index.html` → replace all `https://perspecto.com` with your real URL
   - `src/App.jsx` → find the Twitter share URL and update the domain

---

## OG Image

After launch, create a 1200×630px PNG screenshot of the tool in action and save it to `public/og-image.png`. This is what appears when the link is shared on Twitter/X, LinkedIn, Slack, etc. A good OG image can double click-through rate from social shares.

---

## SEO Keywords Targeted

- free 3D screenshot generator
- SaaS landing page mockup tool
- isometric UI mockup online
- screenshot to 3D mockup free
- app screenshot mockup generator

---

## License

MIT — free to use, modify, and deploy.
