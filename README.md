# Manomaya — A quiet place in a noisy world

Manomaya is a sacred, digital sanctuary designed for mindfulness, spiritual reflection, and inner peace. It features a minimalist aesthetic, parallax animations, a breathing widget, and interactive storytelling—all carefully curated to provide a quiet corner on the web, free of ads and trackers.

## 🚀 Overview & Architecture

Manomaya has been architected as a **Single-Page Application (SPA)** to ensure seamless, instantaneous transitions between different sections of the sanctuary without page reloads.

- **Unified Structure**: All pages (`About`, `Blog`, `Reflections`, `Journey`) have been merged into a single `index.html` payload.
- **Hash-Based Routing**: Navigation is handled natively using lightweight client-side URL hashes (e.g., `#home`, `#about`, `#blog`).
- **Asset Inlining**: To eliminate render-blocking network requests, the core CSS design tokens and JavaScript interaction logic are completely inlined within `index.html`. 

## ✨ Key Features

- **Custom Premium Aesthetics**: Fluid typography, subtle custom cursors, and deep, calming color palettes designed to evoke stillness.
- **Interactive Breathing Widget**: A dedicated, animated component to guide users through structured breathwork.
- **Parallax & Scroll Animations**: Elements fade, rise, and expand elegantly as you navigate and scroll through the application, triggered precisely via the IntersectionObserver API.
- **Local Storage Journal**: A "Journey" feature that allows users to privately save reflections and bookmarks directly to their browser's `localStorage`, ensuring complete privacy.

## 📈 SEO & Performance Optimizatons

Despite being a JavaScript-powered SPA, Manomaya is fully optimized for search engines:
- **Semantic HTML**: Proper heading hierarchies (single H1, structured H2s).
- **Accessibility**: Missing `alt` tags have been resolved, particularly on dynamic elements.
- **Structured Data**: `JSON-LD` WebSite and Organization schema is injected to give search engines immediate clarity on the site's purpose.
- **Sitemap**: An optimized `sitemap.xml` has been included, pointing to the canonical application payload.

## 🛠 Getting Started

Manomaya is incredibly simple to run. It requires no build tools or package managers. 

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd manomaya
   ```

2. **Run a local server**:
   Because of the dynamic `fetch` calls for blog content (via `data/blogs.json`), you must run the site over an HTTP server.
   ```bash
   # Using Python 3
   python -m http.server 8000
   ```

3. **View the sanctuary**:
   Navigate to `http://localhost:8000` in your web browser.

## 🗂 Project Structure

```
manomaya/
├── index.html        # The entire SPA, containing all views, CSS, and interaction JS
├── sitemap.xml       # SEO configuration for crawlers
├── README.md         # Documentation
├── assets/           # Images, favicons, and other static media
└── data/
    └── blogs.json    # JSON feed representing dynamic blog/story content
```

## ⚖️ License

All rights reserved.
