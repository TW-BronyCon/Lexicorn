<p align="center">
  <img src="./public/favicon.svg" alt="TWBC Logo" align="center" width="256">
</p>

<h1 align="center">TWBC - Storyteller</h1>

<p align="center">
  A collaborative, "Mad Libs"-style word game built for Taiwan BronyCon.
</p>

<p align="center">
  <a href="https://nuxt.com"><img
    alt="Made with Nuxt"
    src="https://img.shields.io/badge/made_with-nuxt-00DC82?logo=nuxt.js"
  ></a>
  <img
    alt="Works on my machine"
    src="https://img.shields.io/badge/works_on-my_machine-dark_green"
  >
</p>

## What is this?

This is a live, collaborative, "Mad Libs"-style word game built for **Taiwan BronyCon (TWBC)**, a fan-organized convention for *My Little Pony: Friendship is Magic* fans in Taiwan.

The application features:
- **Story Creator:** Author templates with bracketed blanks and variable references.
- **Host Controls:** Manage active templates, host inputs, and game state.
- **Kiosk View:** Real-time spectator display that polls for progress.
- **Cloudflare Integration:** Built-in Cloudflare KV support with a local filesystem cache fallback.

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3 Composition API)
- **Database/Persistence:** [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Styling:** Vanilla CSS (Material Design 3 tokens)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- `npm`

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```
## Deployment

This app is deployed as a full-stack **Cloudflare Pages** project.

1. **Create KV Namespace:** Create a KV namespace on your Cloudflare dashboard.
2. **Configure:** In [wrangler.jsonc](./wrangler.jsonc), bind `STORYTELLER_KV` to your KV namespace ID.
3. **Deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy .output/public
   ```

## Contributors

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit and branch guidelines.

## License

Copyright (C) 2026 TWBC

**Code:** This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

**Assets:** All visual assets (including logos, images, and icons) are **not** covered by the GPL license. These assets remain the exclusive property and copyright of the TWBC team. Unauthorized use, redistribution, or modification of these assets is prohibited.

See [LICENSE](./LICENSE) for details.
