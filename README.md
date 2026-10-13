# GCC Registry — India

A static web app for exploring Global Capability Centres (GCCs) set up in India.
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

## Data

- **`GCC_DATA`** — 80 company entries across 13 cities (Bengaluru, Hyderabad, Chennai, Pune, Mumbai, Delhi NCR, and 7 tier-2 cities).
- **`CITY_DATA`** — Per-city profiles: office rent range, talent score, cost score, incentives score, speed score, avg salaries, state incentives text.

To replace sample data with real data, edit `data/gcc-data.js` — the schema is self-documented in the file.
