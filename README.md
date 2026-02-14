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
    Customer portal for tracking lot grading certificate jobs for large clients
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

The VNCO Property Lookup Portal is a web-based application for VNCO SURVEYS that allows big clients (builders/developers with multiple properties) to track their lot grading certificate jobs using a customer code.

**About VNCO SURVEYS:**

VNCO SURVEYS is an Edmonton-based land surveying company (established 2018) specializing in:
- Final Grade Certificates (completed within 4 days)
- Rough Grade Certificates
- Legal survey services through partnership with Navigation Surveys

**What This Portal Does:**

Large clients can access their property dashboard by entering their customer code to view all their properties with:
- Property address
- Service type (Rough Grade / Final Grade)
- Order date
- Payment status (Pending, Paid, Overdue)
- Inspection status (Scheduled, In Progress, Completed)

No password required - access via customer code only.

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

**Target Users:**

This portal is designed for **big clients** (builders, developers, construction companies) who have multiple properties being surveyed by VNCO SURVEYS.

**How to Use:**

1. Visit `portal.vncosurveys.com`
2. Enter your customer code (provided by VNCO SURVEYS)
3. View all your properties in a dashboard showing:
   - Address
   - Service type
   - Order date
   - Payment status
   - Inspection status

**Inspection Status:**
- **Scheduled**: Survey booked, awaiting completion
- **In Progress**: Survey completed, submitted to City of Edmonton
- **Completed**: City inspection passed, certificate issued

**Getting Your Customer Code:**

When you place an order with VNCO SURVEYS, you will be assigned a unique customer code (e.g., VNCO-001). Use this code to access the portal.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR ADMINISTRATORS -->
## For Administrators

**Admin Login:**

Administrators access a secure dashboard with username and password to manage customer data and property statuses.

**Managing Job Data:**

**CSV Upload**

Administrators manage all data through a single CSV file containing both customer and property information.

**CSV Format:**

| customer_code | company_name | address | service_type | order_date | payment_status | inspection_status |
|---------------|--------------|---------|--------------|------------|----------------|-------------------|
| VNCO-001 | ABC Developments | 123 Main St Edmonton AB | Final Grade | 2024-01-15 | Paid | Completed |
| VNCO-001 | ABC Developments | 456 Oak Ave Edmonton AB | Rough Grade | 2024-02-01 | Pending | Scheduled |
| VNCO-002 | XYZ Builders | 321 Elm St Edmonton AB | Final Grade | 2024-02-10 | Paid | Completed |

**Upload Process:**
1. Maintain data in Excel with the columns shown above
2. Log into admin dashboard
3. Click "Upload CSV"
4. Select your CSV file
5. System automatically creates/updates customers and properties
6. Confirmation shows number of records processed

**How It Works:**
- System automatically creates customers from unique customer_code + company_name combinations
- Each row represents one property
- Multiple rows with the same customer_code belong to the same customer
- Easy to update: just modify the CSV and re-upload

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

**Current Features:**
- [x] Customer code-based access (no password)
- [x] View all properties for a customer
- [x] Mobile-responsive design
- [x] Admin authentication
- [x] CSV upload for bulk data management

**Planned Features:**
- [ ] Web-based form for individual property updates
- [ ] Search/filter properties in admin dashboard
- [ ] Export current data as CSV backup
- [ ] Email notifications for status changes

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATABASE SCHEMA -->
## Database Schema

### Customers Table

| Field | Type | Description |
|-------|------|-------------|
| customer_code | String | Unique identifier (e.g., "VNCO-001"), Primary Key |
| company_name | String | Client company name |

### Properties Table

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Auto-incrementing primary key |
| customer_code | String | Links to customers table |
| address | String | Property address |
| service_type | Enum | "Rough Grade" or "Final Grade" |
| order_date | Date | Date survey was ordered |
| payment_status | Enum | "Pending", "Paid", or "Overdue" |
| inspection_status | Enum | "Scheduled", "In Progress", or "Completed" |
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
