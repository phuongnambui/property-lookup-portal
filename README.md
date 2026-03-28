# VNCO Property Lookup Portal

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](https://vncosurveys.com)

<div align="center">
  <a href="https://vncosurveys.com">
    <img src="images/logo.png" alt="VNCO SURVEYS" width="540" height="134">
  </a>

  <p align="center">
    Production property tracking system for lot grading certificates
    <br />
    Built for VNCO SURVEYS — Edmonton land surveying company
    <br /><br />
    🔗 <strong><a href="https://portal.vncosurveys.com">Live: portal.vncosurveys.com</a></strong>
    <br />
    <em>Currently in production use by construction companies in Edmonton</em>
  </p>
</div>

---

## About

A full-stack web application for tracking lot grading certificate jobs through a multi-stage certification pipeline. Built for **VNCO SURVEYS**, an Edmonton-based land surveying company.

### The Problem
Construction clients manage multiple properties through the City of Edmonton certification process with no visibility into where each one stands. Status updates required constant back-and-forth with the surveyor.

### The Solution
A customer portal where clients log in with a company code and instantly see the status of all their properties. The admin (company owner) manages everything through a dashboard — no technical knowledge required.

**Real Users:** Active production use by construction companies in Edmonton  
**Business Impact:** Eliminates status update calls, improves client transparency

---

## Screenshots

### Customer Login
![Customer Login](images/screenshot-login.png)

### Customer Dashboard
![Customer Dashboard](images/screenshot-dashboard.png)

### Timeline Visualization
![Timeline](images/screenshot-timeline.png)

### Admin Dashboard
![Admin Dashboard](images/screenshot-admin.png)

---

## Built With

**Backend**
- Node.js + Express — REST API
- Google Sheets API — live data source (no database required)
- Cloudinary — persistent deficiency photo storage
- bcrypt — admin password hashing
- Deployed on Railway

**Frontend**
- React + React Router
- Axios
- Custom timeline component
- Deployed on Vercel with custom domain via GoDaddy

---

## Architecture

```
Google Sheets -> Node/Express API (Railway) -> React Frontend (Vercel)
                          |
                    Cloudinary (photos)
```

Google Sheets acts as the live database. The company owner manages all property data directly in the sheet — adding new properties, updating submission dates — while status updates and photo uploads are handled through the admin dashboard and written back to the sheet in real time.

---

## Key Features

### Customer Portal
- Login via company code (e.g. `VNCO-001`) — no password required
- Property dashboard with filter by status
- Visual timeline showing certification stages
- Deficiency photo display when issues are recorded
- Attempt tracking for re-submitted properties

### Certification Stages
1. Request Received
2. Processing
3. Submitted to City
4. Passed / Failed

### Admin Dashboard
- Secure login with bcrypt-hashed credentials
- Live property table pulled from Google Sheets on every load
- One-click status updates — writes directly to the sheet
- Drag-and-drop deficiency photo upload via Cloudinary
- Search and filter by status, address, or company

---

## Engineering Decisions

### Data Layer: Google Sheets over a Traditional Database
The initial implementation used CSV file uploads — the admin would export a spreadsheet, upload it through the dashboard, and the portal would parse and store the data. In practice this created unnecessary friction: every update required exporting, uploading, and managing file versions.

Since the client's existing workflow was already spreadsheet-native, I migrated the data layer to the Google Sheets API. The sheet becomes the live source of truth — the admin edits cells directly and the portal reflects changes on every page load. This eliminated the upload step entirely and reduced the technical barrier for the non-developer admin.

**Tradeoff acknowledged:** Google Sheets has rate limits and no transaction support. For the current scale this is appropriate, but a migration to PostgreSQL would be the right call at higher volume.

### Timeline: Removing Dates to Reduce Admin Overhead
The original timeline tracked both the stage and the date it was reached — displayed as a dated progression across the certification stages. In production, this created a fragile workflow: the admin had to manually maintain a formatted date string per stage, and a single formatting error would break the timeline display.

After observing how the admin actually used the system, I simplified the timeline to derive stage completion purely from the current status — all prior stages are automatically marked complete, with no date tracking required. This eliminated a category of user error entirely and reduced data entry to a single field update, without meaningfully reducing the portal's value to clients.

### Photo Storage: Cloudinary over Filesystem
Deficiency photos were initially stored on the server filesystem. Railway's ephemeral filesystem meant photos were lost on every redeploy — a silent data loss issue that wouldn't surface until a client noticed a missing photo.

Migrating to Cloudinary resolved this. Photos persist across deployments, are served via CDN, and the Cloudinary URL is written back to the Google Sheet automatically on upload.

### Auth: Standardised to sessionStorage
An early auth bug was traced to inconsistent token storage — some parts of the app read from `localStorage`, others from `sessionStorage`. Standardising all token handling to `sessionStorage` resolved the issue and aligns better with the security expectation that sessions don't persist across browser closes.

---

## Data Schema

All data lives in Google Sheets with the following columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | customer_code | e.g. `VNCO-001` |
| B | company_name | Client company name |
| C | address | Property address |
| D | service_type | `Final Grade` or `Rough Grade` |
| E | current_status | One of the valid pipeline stages |
| F | submission_date | Date submitted to City |
| G | has_deficiency | `TRUE` or `FALSE` |
| H | deficiency_photo_url | Cloudinary URL |
| I | attempt_number | Number of submission attempts |

---

## Local Development

### Prerequisites
- Node.js 18+
- Google Cloud service account with Sheets API enabled
- Cloudinary account

### Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_ID=your_sheet_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secret
```

```bash
node src/server.js
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001
```

```bash
npm start
```

---

## Deployment

- **Backend** — Railway (auto-deploys from GitHub, env vars set in Railway dashboard)
- **Frontend** — Vercel (auto-deploys from GitHub, `REACT_APP_API_URL` set in Vercel dashboard)
- **Domain** — GoDaddy DNS pointed to Vercel

---

## License

Proprietary software developed for VNCO SURVEYS. All rights reserved.

---

## Contact

**VNCO SURVEYS**  
[vncosurveys.com](https://vncosurveys.com)

**Developer**  
Phuong Nam Bui — Computer Science, UNSW  
[basten2006@icloud.com](mailto:basten2006@icloud.com)  
[github.com/phuongnambui/property-lookup-portal](https://github.com/phuongnambui/property-lookup-portal)

**Live:** [portal.vncosurveys.com](https://portal.vncosurveys.com)
