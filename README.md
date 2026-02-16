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
    Customer portal for tracking lot grading certificate jobs with horizontal timeline visualization
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

The VNCO Property Lookup Portal is a web-based application for VNCO SURVEYS that allows big clients (builders/developers with multiple properties) to track their lot grading certificate jobs using a customer code. The portal provides detailed horizontal timeline visualization showing the progress of each property through the certification process.

**About VNCO SURVEYS:**

VNCO SURVEYS is an Edmonton-based land surveying company (established 2018) specializing in:
- Final Grade Certificates (completed within 4 days)
- Rough Grade Certificates
- Legal survey services through partnership with Navigation Surveys

**What This Portal Does:**

Large clients can access their property dashboard by entering their customer code to view all their properties with:
- Property address and service type
- Order date
- Horizontal timeline showing progression through certification stages
- Current status with historical tracking
- Deficiency photos (if applicable)
- Attempt number for failed properties

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
3. View all your properties in a dashboard
4. Click on any property to see detailed horizontal timeline

**Property Status Timeline:**

Each property progresses through these stages:

1. **Request Received** - Survey order placed
2. **Surveyed** - Survey completed on-site
3. **Certificate Processing** - Certificate being prepared
4. **Submitted to City** - Submitted to City of Edmonton for review
5. **Pass** - City inspection passed, certificate issued (FINAL)
6. **Fail** - City inspection failed, process restarts from beginning

**Timeline Visualization:**

The horizontal timeline shows:
- Completed steps with dates
- Current step highlighted
- Pending steps grayed out

**Deficiency Information:**
- Properties with deficiencies will display a deficiency photo below the timeline
- Deficiency photos show what needs to be corrected
- After correction, property may be re-surveyed

**Failed Properties:**
- If a property fails City inspection, the timeline restarts
- Attempt number indicates how many times the property has been submitted
- Full history is maintained for tracking purposes

**Getting Your Customer Code:**

When you place an order with VNCO SURVEYS, you will be assigned a unique customer code (e.g., VNCO-001). Use this code to access the portal.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FOR ADMINISTRATORS -->
## For Administrators

**Admin Login:**

Administrators access a secure dashboard with username and password to manage customer data and property statuses.

**Managing Job Data:**

### CSV Upload

Administrators manage all data through a CSV file containing customer and property information with timeline tracking.

**CSV Format:**

Required columns:
- `customer_code` - Unique customer identifier (e.g., VNCO-001)
- `company_name` - Client company name
- `address` - Property address
- `service_type` - "Rough Grade" or "Final Grade"
- `order_date` - Date survey was ordered (YYYY-MM-DD)
- `current_status` - Current stage in process
- `status_history` - Timeline of all status changes (format: "Status:Date,Status:Date")
- `has_deficiency` - true/false
- `deficiency_photo_url` - Path to deficiency photo (if applicable)
- `attempt_number` - Number of submission attempts (starts at 1)

**Status History Format:**
```
"Request Received:2024-01-15,Surveyed:2024-01-16,Certificate Processing:2024-01-17"
```

### Upload Process

1. Maintain data in Excel with the columns shown above
2. Log into admin dashboard
3. Click "Upload CSV"
4. Select your CSV file
5. System automatically creates/updates customers and properties with full timeline data
6. Confirmation shows number of records processed

### Manual Status Updates

Administrators can also update property status manually through the dashboard:
1. Select a property
2. Choose next status in workflow
3. System automatically timestamps the update
4. If status is "Fail", property automatically restarts from "Request Received"

**Note:** Properties marked as "Pass" cannot have their status changed.

### Photo Upload

For properties with deficiencies:
1. Upload deficiency photo through admin dashboard
2. Photo is automatically linked to the property
3. Customers will see the photo when viewing property details

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

**Current Features:**
- [x] Customer code-based access (no password)
- [x] View all properties for a customer
- [x] Timeline tracking with date stamps for each status
- [x] Failed property handling (automatic restart)
- [x] Deficiency photo support
- [x] Mobile-responsive design
- [x] Admin authentication
- [x] CSV upload for bulk data management

**Planned Features:**
- [ ] Horizontal timeline visualization component on frontend
- [ ] Property detail view with visual timeline display
- [ ] Photo upload interface for admin
- [ ] Manual status update through UI
- [ ] Email notifications for status changes
- [ ] Export timeline history as PDF

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
| current_status | Enum | Current stage: "Request Received", "Surveyed", "Certificate Processing", "Submitted to City", "Pass", "Fail" |
| status_history | Array | Timeline of all status changes with dates |
| has_deficiency | Boolean | Whether property has deficiency |
| deficiency_photo_url | String | Path to deficiency photo (nullable) |
| attempt_number | Integer | Number of submission attempts (increments on Fail) |
| created_at | DateTime | Record creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Status History Object Structure
```json
{
  "status": "Surveyed",
  "date": "2024-01-16",
  "timestamp": "2024-01-16T10:30:00Z",
  "note": "Optional note for this status change"
}
```

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
