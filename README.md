# Rev. William Ward Senior Secondary School — Website

A rich, 3D, scroll-driven website for **Rev. William Ward Senior Secondary School**,
North Lakhimpur, Assam, India. Built with **Vite + Three.js** (plain JavaScript, no
framework) and designed to deploy to **GitHub Pages**.

> **Motto:** Knowledge · Discipline · Service · **Est.** 2005

---

## ✨ Features

- **Interactive 3D backdrop** — floating geometric shapes + a glowing particle field
  rendered with Three.js, with smooth scroll parallax and mouse tilt.
- **3D hero text** — big extruded, perspective-tilting headline.
- **Per-section colour "moods"** — the 3D lights subtly re-tint as you scroll
  through Home → About → Academics → … → Contact.
- **Sections:** Home, About, Academics, Facilities, Activities & Sports,
  Admissions, Contact.
- **Polished UI** — glassy cards, animated counters, scroll-reveal animations,
  sticky nav with active-link highlighting, scroll progress bar, mobile menu,
  back-to-top button.
- **Accessible & responsive** — respects `prefers-reduced-motion`, keyboard
  focus states, and works from small phones to large desktops.

---

## 🚀 Run locally

```bash
npm install       # install dependencies (once)
npm run dev       # start the dev server → http://localhost:5173
```

Other commands:

```bash
npm run build     # production build into ./dist
npm run preview   # preview the production build locally
```

---

## 🌐 Deploy to GitHub Pages

The site is already configured for GitHub Pages (`base: './'` in `vite.config.js`),
and a ready-to-use Actions workflow is included in the project folder at
`.github/workflows/deploy.yml`.

1. Make sure `.github/workflows/deploy.yml` is committed to your repo (it ships
   with this project — if you don't see it in your Git history yet, run
   `git add .github/workflows/deploy.yml` before pushing).
2. Push the code to GitHub.
3. In the repo on GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. Merge to `main` (or run the workflow manually from the **Actions** tab →
   **Deploy to GitHub Pages → Run workflow**).

The workflow will `npm ci`, build the site, and publish the `dist` folder.
Your site will then live at:

```
https://<your-username>.github.io/REV.-WILLIAM-WARD-SENIOR-SECONDARY-SCHOOL/
```

If you ever need to recreate the workflow file, its content is:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Manual deploy (no Actions)

```bash
npm run build
# then upload/commit the contents of the dist/ folder to your Pages branch
```

---

## 🛠 Customising the content

| What | Where |
| --- | --- |
| Text (About, Academics, Facilities, etc.) | `index.html` |
| Colours & fonts | `src/style.css` (`:root` variables) |
| 3D scene (shapes, particles, colours) | `src/three-scene.js` |
| Motto, year, phone/email/address | `index.html` (search for the values) |
| Images | `public/images/*.jpg` — replace with your real photos, keeping the same file names |

### Quick edits worth doing first

- **Motto / Est. year** — currently "Knowledge · Discipline · Service" and "Est. 2005".
- **Contact details** — phone `+91 3752 000 000`, emails `info@wwsss.edu.in` /
  `admissions@wwsss.edu.in`, and the address on "Ward Road, North Lakhimpur" are
  placeholders.
- **Stats** — the hero numbers (850+ students, 45+ faculty, 96% pass rate) are
  placeholders; edit the `data-count` attributes in `index.html`.

### Adding your logo

Replace `public/favicon.svg` and the two inline SVG crests in `index.html`
(the `.brand__mark` blocks) with your own school crest.

---

## 📁 Project structure

```
.
├── index.html              # all page content & structure
├── src/
│   ├── main.js             # UI behaviour (nav, reveals, counters, form, tilt)
│   ├── three-scene.js      # Three.js 3D backdrop
│   └── style.css           # all styling
├── public/
│   ├── favicon.svg
│   └── images/             # AI placeholder photos (swap with real ones)
├── vite.config.js
├── package.json
└── .github/workflows/deploy.yml
```

---

## 📝 Notes

- The photos in `public/images/` are **AI-generated placeholders**. Replace them
  with real campus/student photos of the same names for an authentic look.
- The contact form is a front-end demo (it shows a success message). To make it
  actually send email, connect it to a service such as Formspree, Netlify Forms,
  or a small serverless function.
