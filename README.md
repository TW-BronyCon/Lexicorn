# TWBC Storyteller

TWBC Storyteller is a live, collaborative, "Mad Libs"-style word game built for Taiwan BronyCon. Hosts can create customized story templates with hidden placeholders (blanks), while players and spectators watch progress synchronize in real-time on a clean kiosk view. Together, they fill in the blanks and reveal a hilarious final story!

## 🚀 Key Features

* **Interactive Storytelling**: Mad Libs style template creator with bracketed blanks (`【Noun 1】` or `[Noun 1]`).
* **Variable Linking & References**: Automatically links duplicate variables (e.g., `【Food 1 (Reference)】` or `[Food 1 (Ref)]` matches and copies the value of `Food 1`).
* **Live Kiosk Viewer Panel**: Real-time polling layout tailored for projectors and shared spectator displays. Spectators can follow filling progress checkmarks without seeing future/unrevealed blanks.
* **Material Design 3 (MD3) Styling**: Premium, flat visual design system using solid shapes, outlines, and rounded pills (no gradients/emojis) built on custom CSS variables.
* **Taiwan BronyCon (TWBC) Branding**: Theme aligned with the official twbc-site colors (deep purple background `#120b18`, surface card containers `#191022`, and a primary violet accent `#a85bc4`).
* **Cloudflare KV Integration**: Server handlers interact natively with Cloudflare KV, with a robust local file-cache fallback (`.data/kv/`) for offline development.

---

## 🛠️ Tech Stack & Architecture

* **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, Composition API)
* **Hosting/Serverless**: [Cloudflare Pages](https://pages.cloudflare.com/) (using wrangler configuration)
* **Storage**: [Cloudflare KV](https://developers.cloudflare.com/kv/) for low-latency session and template storage
* **Styling**: Vanilla CSS utilizing Material Design 3 tokens and TWBC brand variables ([app/assets/css/main.css](app/assets/css/main.css)).

---

## 📂 Project Structure

```
├── app/
│   ├── app.vue                 # Main entrypoint
│   ├── assets/
│   │   └── css/
│   │       └── main.css        # Material Design 3 + TWBC CSS variables & layout resets
│   ├── layouts/
│   │   └── default.vue         # Shared header/navigation shell
│   └── pages/
│       ├── index.vue           # Landing page (Join Session / Open Host Panel)
│       ├── host/
│       │   ├── index.vue       # Host template manager dashboard
│       │   ├── session/
│       │   │   └── [id].vue    # Host game controls, prompt manager, and checklist queue
│       │   └── template/
│       │       └── [id].vue    # Interactive template editor and variable config
│       └── session/
│           └── [id].vue        # Viewer kiosk broadcast screen (layout-disabled)
├── public/
│   ├── favicon.svg             # Custom TWBC brand favicon (book + sparkle star)
│   ├── favicon.ico             # Fallback browser favicon
│   └── robots.txt              # Standard robots config
├── server/
│   ├── api/
│   │   ├── sessions/           # Session management routes (spawn, reset, update)
│   │   └── templates/          # Template CRUD endpoints
│   └── utils/
│       ├── kv.ts               # Cloudflare KV wrapper & local JSON file caching fallback
│       └── parser.ts           # Advanced bracket parses & canonical reference mapping
├── nuxt.config.ts              # Nuxt configuration and HTML meta head declarations
└── wrangler.jsonc              # Cloudflare configuration file
```

---

## 💻 Local Development

### 1. Installation
Install dependencies:
```bash
npm install
```

### 2. Run local server
Start the Nuxt development environment:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. Local data will automatically store in `.data/kv/` for persistence.

### 3. Production Build & Preview
To build and check production compilation locally:
```bash
npm run build
npm run preview
```

---

## 🌐 Deployment to Cloudflare Pages

This application compiles statically and dynamically, optimized to run as a Cloudflare Pages full-stack app.

1. **Create KV Namespace**: Create a KV namespace on your Cloudflare dashboard (e.g., named `storyteller-kv`).
2. **Update Configuration**: In [wrangler.jsonc](wrangler.jsonc), change `"STORYTELLER_KV_PLACEHOLDER"` to your deployed KV namespace ID:
   ```json
   "kv_namespaces": [
     {
       "binding": "STORYTELLER_KV",
       "id": "your-actual-kv-namespace-id"
     }
   ]
   ```
3. **Deploy via Wrangler**:
   ```bash
   npx wrangler pages deploy .output/public
   ```
   Or connect your GitHub repository directly to Cloudflare Pages for automatic CI/CD deployment.

---

## 🔒 Security & Access Protection (Cloudflare Access)

To secure the creation and editing controls, the Host dashboard routes (`/host/*`) and templates APIs (`/api/templates/*`) should be protected using **Cloudflare Zero Trust Access**.

For detailed step-by-step setup on hiding the admin panel behind Access, please consult the security guidelines or refer to the Cloudflare Zero Trust console.
