# RMBGH Portals (src/pages/portal)

| Site | URL | Who | Booking? |
|---|---|---|---|
| Employee Portal (`employee/`) | `/portal`, `/portal/statistics` | Signed-in employees (ProtectedRoute) | No |
| Customer site (`customer/`) | `/patients`, `/patients/services`, `/patients/services/:slug`, `/patients/statistics` | Public | Yes |

`shared/` holds the logo, photo blocks, hospital info and the statistics page used by both.

TODO: real ICS address in `employee/data.js`; hospital email in `shared/hospital.js`; replace sample news.
Images stay in `public/portal/` and `src/assets/`.
