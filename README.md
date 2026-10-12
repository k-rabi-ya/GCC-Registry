# GCC Registry — India

A static web app for exploring Global Capability Centres (GCCs) set up in India. No backend, no login, no build step — open `index.html` in a browser.

> **Note:** All data is sample/illustrative. Figures are approximate and for demonstration purposes only.

## Pages

| Page | What it does |
|------|-------------|
| **GCC Explorer** | Searchable, filterable table of 80 GCC entries. Filter by city, sector, parent country, year, and verification status. |
| **City Compare** | Pick up to 4 cities and compare them side-by-side on rent, talent, cost, and incentives — with a switchable bar chart. |
| **Setup Advisor** | Fill in sector, headcount, budget, and priority (Cost / Talent / Speed) to get a ranked top-3 city shortlist with transparent scoring. |

## Running locally

Just open the file:

```
d:\code\GCC Registry\index.html
```

Or serve it with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

## File structure

```
GCC Registry/
├── index.html          # All three page templates
├── styles/
│   └── main.css        # Design system (navy + warm parchment + flame accent)
├── scripts/
│   └── app.js          # Nav, filtering, scoring, charting logic
└── data/
    └── gcc-data.js     # 80 GCC entries + 14 city profiles (sample data)
```

## Data

- **`GCC_DATA`** — 80 company entries across 13 cities (Bengaluru, Hyderabad, Chennai, Pune, Mumbai, Delhi NCR, and 7 tier-2 cities).
- **`CITY_DATA`** — Per-city profiles: office rent range, talent score, cost score, incentives score, speed score, avg salaries, state incentives text.

To replace sample data with real data, edit `data/gcc-data.js` — the schema is self-documented in the file.

## Dependencies (CDN, no install needed)

- [Chart.js 4.4](https://www.chartjs.org/) — bar charts on the City Compare page
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — Google Fonts
