# Google Ads Campaign Sandbox

A training environment for teams to practice building Google Ads search campaigns — mirroring the real Google Ads workflow without touching a live account.

![Training Mode](https://img.shields.io/badge/mode-training-blue)
![React](https://img.shields.io/badge/react-18-61dafb)
![Vite](https://img.shields.io/badge/vite-6-646cff)

## What It Does

Walk through each step of building a Google Search campaign, just like you would in the actual Google Ads interface:

| Step | What You Configure |
|------|--------------------|
| **1. Campaign** | Name, bid strategy, budget, schedule, networks, locations, language, devices |
| **2. Ad Groups** | Create themed groups with default max CPC bids |
| **3. Keywords** | Add keywords with Broad / Phrase / Exact match types (bulk entry supported) |
| **4. Negatives** | Campaign-level and ad group-level negative keywords |
| **5. Responsive Ads** | Full RSA builder — 15 headlines, 4 descriptions, display paths, live SERP preview |
| **6. Review** | Complete campaign audit with issue warnings and summary stats |

The sandbox validates required fields, enforces character limits, formats match types correctly (`keyword`, `"keyword"`, `[keyword]`), and shows a realistic ad preview.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/google-ads-sandbox.git
cd google-ads-sandbox

# Install dependencies
npm install

# Start dev server (opens at http://localhost:3000)
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder will contain a static build you can deploy anywhere (Netlify, Vercel, GitHub Pages, internal server, etc.).

## Project Structure

```
google-ads-sandbox/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React DOM mount
    └── App.jsx         # Full sandbox application
```

## Usage Notes

- **This is a training tool** — nothing connects to a real Google Ads account
- All data lives in browser memory and resets on refresh
- The stepper enforces logical progression (must name the campaign and create ad groups before moving forward)
- Character counters on headlines (30) and descriptions (90) match Google's actual limits
- The review step flags common issues (missing keywords, empty ad groups, no budget, etc.)

## Customization Ideas

- Pre-populate with example campaigns for specific training scenarios
- Add an export button to save campaign configs as JSON
- Split `App.jsx` into separate component files for maintainability
- Add localStorage persistence so work survives page refreshes
- Connect to Google Ads API for real account drafts (advanced)

## License

Internal training tool. Modify and distribute as needed within your organization.
