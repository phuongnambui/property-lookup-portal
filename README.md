<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/vnco-property-portal">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">VNCO Property Lookup Portal</h3>

  <p align="center">
    Internal customer portal for property job tracking
    <br />
    <a href="https://vncosurveys.com"><strong>Visit VNCO SURVEYS »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#how-it-works">How It Works</a></li>
    <li><a href="#for-customers">For Customers</a></li>
    <li><a href="#for-administrators">For Administrators</a></li>
    <li><a href="#database-schema">Database Schema</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![VNCO Property Portal Screen Shot][product-screenshot]](https://vncosurveys.com)

The VNCO Property Lookup Portal is a customer-facing web application built for VNCO SURVEYS, an Edmonton-based land surveying company specializing in lot grading certificates. Founded in 2018, VNCO SURVEYS helps homeowners, landscapers, and builders obtain the required lot grading certificates mandated by the City of Edmonton for new construction and property development.

**What VNCO SURVEYS Does:**

VNCO SURVEYS provides Alberta Land Surveying services focused on residential lot grading:

- **Final Grade Surveys & Certificates**: Complete surveys and certificates within 4 days, required before landscaping can begin
- **Rough Grade Surveys & Certificates**: Post-foundation grading surveys required after building construction
- **Legal Surveys**: Partners with Navigation Surveys for RPR (Real Property Reports) and property line locating

**Why Lot Grading Certificates Matter:**

In Edmonton, lot grading certificates are mandatory for:
- Ensuring proper drainage away from foundations
- Compliance with City of Edmonton Drainage Bylaw 18093
- Preventing water damage and erosion
- Obtaining final occupancy permits
- Property sales and mortgage requirements

**Purpose of This Portal:**

This portal allows VNCO SURVEYS customers to:
- Check the status of their grading certificate orders by searching their property address
- Track payment status (Pending, Paid, Overdue)
- Monitor inspection progress (Scheduled, In Progress, Completed)
- Access information 24/7 without needing to call the office
- Plan their landscaping timeline based on certificate completion

**What Makes It Different:**

This is not a public real-estate marketplace. It's a specialized tool for VNCO SURVEYS customers to track their specific lot grading survey jobs. No login or account required — simply search by address.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![Node][Node.js]][Node-url]
* [![Express][Express.js]][Express-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![Prisma][Prisma]][Prisma-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Key Features

- **Simple Address Search**: Customers search by property address — no login required
- **Certificate Status Tracking**: View order date, payment status, and City of Edmonton inspection status
- **Service Type Display**: See whether job is for rough grade or final grade certificate
- **Admin CSV Import**: Bulk upload property data from spreadsheets
- **Responsive Design**: Mobile-friendly for customers and field staff
- **Fast Database Queries**: Optimized with Prisma ORM for quick lookups
- **Edmonton-Focused**: Designed specifically for Edmonton lot grading workflows

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- HOW IT WORKS -->
## How It Works

The portal connects to a master database containing all property job information. When a customer searches for their address, the system:

1. Queries the PostgreSQL database for matching properties
2. Returns the current job status information
3. Displays order date, payment status, and inspection status

**System Architecture:**
- **Frontend**: React-based user interface
- **Backend**: Node.js + Express API server
- **Database**: PostgreSQL with Prisma ORM
- **Data Source**: Single master dataset maintained by VNCO SURVEYS administrators

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR CUSTOMERS -->
## For Customers

**How to Use the Portal:**

1. Go to the VNCO Property Lookup Portal website
2. Enter your property address (street address in Edmonton area)
3. View your lot grading certificate job information:
   - **Order Date**: When your survey was ordered
   - **Service Type**: Rough Grade or Final Grade Certificate
   - **Payment Status**: Pending, Paid, or Overdue
   - **Inspection Status**: 
     - *Scheduled*: Survey booked, awaiting completion
     - *In Progress*: Survey completed, submitted to City of Edmonton
     - *Completed*: City inspection passed, certificate issued

**What You'll Need:**
- Your property address (e.g., "123 Main Street, Edmonton")

**No Account Required:**
The portal is designed for quick, convenient access without the hassle of creating accounts or remembering passwords.

**Typical Timeline:**
- VNCO SURVEYS typically completes final grade surveys and certificates within 4 days
- City of Edmonton inspection may take additional time depending on scheduling

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR ADMINISTRATORS -->
## For Administrators

**Managing Survey Job Data:**

Administrators can update property and job information through multiple methods:

**1. CSV Import (Recommended for Bulk Updates)**
Upload a CSV file with the following columns:
- `address` - Full property address
- `service_type` - "Rough Grade" or "Final Grade"
- `order_date` - Date survey was ordered
- `payment_status` - "Pending", "Paid", or "Overdue"
- `inspection_status` - "Scheduled", "In Progress", or "Completed"
- `client_name` - Customer name (optional)
- `client_phone` - Customer contact (optional)

**2. Direct Database Management**
- Use PostgreSQL tools like pgAdmin or DBeaver
- Connect directly to production database (credentials required)

**3. Prisma Studio (Development)**
Visual interface for database management during development:
```sh
npx prisma studio
```

**Data Entry Best Practices:**
- Update inspection status after City of Edmonton inspections
- Mark payment status accurately to avoid customer confusion
- Keep addresses consistent for easy customer searches
- Archive completed jobs older than 2 years

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATABASE SCHEMA -->
## Database Schema

### Properties Table

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key (auto-increment) |
| address | String | Full property address (unique, indexed) |
| service_type | Enum | "Rough Grade" or "Final Grade" |
| order_date | DateTime | Date survey was ordered |
| payment_status | Enum | "Pending", "Paid", or "Overdue" |
| inspection_status | Enum | "Scheduled", "In Progress", or "Completed" |
| client_name | String | Customer name (optional) |
| client_phone | String | Customer phone (optional) |
| city_inspection_date | DateTime | Date of City of Edmonton inspection (optional) |
| certificate_issued_date | DateTime | Date certificate was issued (optional) |
| notes | Text | Internal notes (optional) |
| created_at | DateTime | Record creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Indexes
- `address` - Unique index for fast search lookups
- `inspection_status` - For filtering active jobs
- `created_at` - For chronological sorting

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

**Current Features (MVP)**
- [x] Simple address search functionality
- [x] Display job information: order date, payment status, inspection status
- [x] No user accounts required
- [x] Master database for all property data
- [x] Admin access to manage data

**Planned Features**
- [ ] CSV import for administrators to bulk upload property data
- [ ] Admin dashboard for easier data management

**Future Enhancements**
Additional features will be considered based on business needs and customer feedback.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Proprietary software developed for VNCO SURVEYS.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

**VNCO SURVEYS**
Website: [https://vncosurveys.com](https://vncosurveys.com)

**Developer**
Phuong Nam Bui - basten2006@icloud.com

Project Repository: [https://github.com/phuongnambui/property-lookup-portal](https://github.com/phuongnambui/property-lookup-portal)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge
[license-url]: #license
[product-screenshot]: images/screenshot.png

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Prisma]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
