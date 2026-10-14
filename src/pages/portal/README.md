# RMBGH Hospital Website (public, desktop)

Rosario Maclang Bautista General Hospital — public pages at `/portal` (no login required).

Routes: `/portal`, `/portal/services`, `/portal/services/:slug`, `/portal/statistics`

## To customize
- `data.js` — hospital address, phone numbers, email (marked TODO), services, news, stats, census chart (sample data).
- Images: put in `public/portal/` — `hero.jpg`, `news-1.jpg`..`news-3.jpg`, `director.jpg`. Missing files fall back to illustrations.
- Staff Access menu (navbar): HRIS -> `/login`; set the real ICS address in `STAFF_SYSTEMS` in `data.js`.
- Logo uses `src/assets/rmbghlogo.png`.
