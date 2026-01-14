<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://vncosurveys.com">
    <img src="images/logo.png" alt="Logo" width="540" height="134">
  </a>

<h3 align="center">VNCO Property Lookup Portal</h3>

  <p align="center">
    Customer portal for tracking lot grading certificate jobs
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
      </ul>
    </li>
    <li><a href="#for-customers">For Customers</a></li>
    <li><a href="#for-administrators">For Administrators</a></li>
    <li><a href="#database-schema">Database Schema</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

The VNCO Property Lookup Portal is a web-based application for VNCO SURVEYS that allows customers to check the status of their lot grading certificate jobs by searching their property address.

**About VNCO SURVEYS:**

VNCO SURVEYS is an Edmonton-based land surveying company (established 2018) specializing in:
- Final Grade Certificates (completed within 4 days)
- Rough Grade Certificates
- Legal survey services through partnership with Navigation Surveys

**What This Portal Does:**

Customers can search by address to view:
- Order date
- Payment status (Pending, Paid, Overdue)
- Inspection status (Scheduled, In Progress, Completed)

No login required - simple search by address.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![Node][Node.js]][Node-url]
* [![Express][Express.js]][Express-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![Prisma][Prisma]][Prisma-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR CUSTOMERS -->
## For Customers

**How to Use:**

1. Visit the portal website
2. Enter your property address
3. View your job information:
   - Order date
   - Payment status
   - Inspection status

**Inspection Status:**
- **Scheduled**: Survey booked, awaiting completion
- **In Progress**: Survey completed, submitted to City of Edmonton
- **Completed**: City inspection passed, certificate issued

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR ADMINISTRATORS -->
## For Administrators

**Managing Job Data:**

Administrators can manage property data through a web-based admin dashboard.

**Option 1: Admin Dashboard**

Add or update jobs through simple web forms:
1. Log into admin dashboard
2. Add new jobs or search existing ones
3. Update payment status and inspection status
4. Save changes

**Option 2: CSV Import**

For bulk updates:
1. Maintain data in Excel with these columns:
   - Address
   - Service Type
   - Order Date
   - Payment Status
   - Inspection Status
   - Client Name
   - Client Phone

2. Export as CSV
3. Upload through admin dashboard
4. System automatically updates database

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

**Current Features:**
- [x] Address search functionality
- [x] Display job status (order date, payment, inspection)
- [x] Mobile-responsive design

**Planned Features:**
- [ ] CSV import for administrators
- [ ] Admin dashboard for data management

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATABASE SCHEMA -->
## Database Schema

### Properties Table

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Auto-incrementing primary key |
| address | String | Property address (unique, searchable) |
| service_type | Enum | "Rough Grade" or "Final Grade" |
| order_date | DateTime | Date survey was ordered |
| payment_status | Enum | "Pending", "Paid", or "Overdue" |
| inspection_status | Enum | "Scheduled", "In Progress", or "Completed" |
| client_name | String | Customer name |
| client_phone | String | Customer phone number |
| created_at | DateTime | Record creation timestamp |
| updated_at | DateTime | Last update timestamp |

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

**Project Repository**  
[https://github.com/phuongnambui/property-lookup-portal](https://github.com/phuongnambui/property-lookup-portal)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge
[license-url]: #license

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
