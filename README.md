<div align="center">
    <!-- https://icons8.com/icons -->
    <img width="96" height="96" src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/api/logo.png" alt="myrekap-logo"/>
</div>

<h1 align="center">API MyRekap & MyFlower v2</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v22.18.0-43853d?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.21.2-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-v5.6.3-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-v6.3.1-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/MariaDB-v10.11.6-003545?logo=mariadb&logoColor=white" />
  <img src="https://img.shields.io/badge/Midtrans-Payment%20Gateway-0A9E01" />
  <img src="https://img.shields.io/badge/Brevo-Email%20Service-0D99FF" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

**API MyRekap & MyFlower v2** is a dual-service system built with **Node.js** and **TypeScript**, designed to support data management and business operations efficiently.
This API powers two connected applications — [**MyRekap**](https://github.com/afifudin23/myrekap-v2) (for admin dashboard) and [**MyFlower**](https://github.com/afifudin23/myflower-v2) (for online store) — enabling seamless communication and real-time updates between both services.

---

## Table of Contents

-   [Features](#features)
-   [Tech Stack Required](#tech-stack-required)
-   [Getting Started](#getting-started)
    -   [Initial Step](#1-initial-step)
    -   [Setup API](#2-setup-api)
-   [Documentation](#documentation)
    -   [API Documentation](#api-documentation)
    -   [ERD Database](#erd-database)

---

## Features

### 📊 MyRekap

The MyRekap service serves as the reporting and administrative dashboard, enabling managers and admins to:

-   Product Management – Create, update, and delete products
-   Order Management – View and update order statuses (especially orders placed from MyFlower)
-   Report Generation – Automatically generate monthly stock and sales reports
-   User Management – Manage admin, staff, and user accounts
-   Notifications – Automatically send notifications to the manager and customer when a new order is created or an order is updated.

### 🌸 MyFlower

The MyFlower service focuses on sales management for a flower shop, allowing users to:

-   Online Ordering – Browse and order flowers easily
-   Shopping Cart – Add and manage items before checkout
-   Payment Integration – Secure payments handled via Midtrans Snap
-   Order History & Receipt – View past orders and print digital receipts
-   Product Reviews – Submit product feedback and ratings
-   Order Tracking – Monitor order progress and delivery status
-   Notifications – Automatically send order status updates to the customer and manager when orders are created or updated

---

## Tech Stack Required

-   **Backend:**
    -   Node.js (v22.18)
    -   Express.js (v4.21)
    -   TypeScript (v5.6)
-   **Frontend:**
    -   React.js (v18.3)
    -   Vite (v6.0)
    -   TypeScript (v5.6)
-   **Database:**
    -   MariaDB (v10.11)
    -   Prisma ORM (v6.3)
-   **Package Manager:**
    -   npm (v10.9)
-   **Third-Party Service:**
    -   Brevo (for email service)
    -   Midtrans (for payment gateway)

---

## Getting Started

Before starting, make sure you have Node.js installed.  
It’s **recommended to use NVM (Node Version Manager)** so you can easily switch between different Node.js versions.

## 🧩 Install Node.js (Recommended via NVM)

To manage Node.js versions easily, it’s **recommended** to install it using **NVM (Node Version Manager)**.

Please follow the installation guide for your platform:

-   **Windows:** [NVM for Windows Documentation](https://github.com/coreybutler/nvm-windows)
-   **Linux / macOS:** [Official NVM Repository](https://github.com/nvm-sh/nvm)

Once NVM is installed, verify and set up Node.js:

```bash
nvm -v            # Check if NVM is installed
nvm install 22.18.0
nvm use 22.18.0
node -v           # Verify Node.js version
npm -v            # Verify npm version

```

### 1. Initial Step:

```bash
git clone git@github.com:afifudin23/api-myrekap-myflower-v2.git
cd api-myrekap-myflower-v2
```

### 2. Setup (API)

Install the dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your configuration:

```bash
# Server Configuration
PORT=                                       # The port number your server will listen on (default: 5000)
MYREKAP_URL=                                # Base URL for the MyRekap service (e.g. http://localhost:5001)
MYFLOWER_URL=                               # Base URL for the MyFlower service (e.g. http://localhost:5002)
DATABASE_URL=                               # Database connection string (e.g. postgresql://user:pass@localhost:5432/dbname)

# Security
JWT_ACCESS=                                 # Secret key for signing access JWT tokens
JWT_RESET_PASSWORD=                         # Secret key for signing password reset JWT tokens

# Superadmin Account
SUPERADMIN_FULL_NAME=                       # Full name for the superadmin account
SUPERADMIN_USERNAME=                        # Username for the superadmin account
SUPERADMIN_EMAIL=                           # Email for the superadmin account
SUPERADMIN_PHONE_NUMBER=                    # Phone number for the superadmin account
SUPERADMIN_PASSWORD=                        # Password for the superadmin account

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=                      # Cloudinary cloud name
CLOUDINARY_API_KEY=                         # Cloudinary API key
CLOUDINARY_API_SECRET=                      # Cloudinary API secret

# Midtrans Configuration
MIDTRANS_CLIENT_KEY=                        # Midtrans client key
MIDTRANS_SERVER_KEY=                        # Midtrans server key

# Brevo (Sendinblue) Email Configuration
BREVO_API_KEY=                              # Brevo API key
BREVO_SENDER_NAME=                          # Sender name for outgoing emails (e.g. Notification MyRekap)
BREVO_SENDER_EMAIL=                         # Sender email address
BREVO_TEMPLATE_OTP_ID=                      # Template ID for OTP email
BREVO_TEMPLATE_ORDER_OWNER_ID=              # Template ID for owner order notification
BREVO_TEMPLATE_MYREKAP_ORDER_STATUS_ID=     # Template ID for MyRekap order status updates
BREVO_TEMPLATE_MYFLOWER_ORDER_STATUS_ID=    # Template ID for MyFlower order status updates
MANAGER_EMAIL=                              # Manager email for internal notifications

```

**For Prisma database URL documentation** check this link, [Database Connection URL](https://www.prisma.io/docs/orm/reference/connection-urls).  
And, **documentation for Setup Brevo** access in here, [how to Setup Brevo](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/brevo/SETUP.md).  
Also, **documentation for Setup Midtrans** can be accessed here, [how to Setup Midtrans](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/midtrans/SETUP.md).

Next, run Prisma migration to the database:

```bash
npx prisma migrate deploy
npx prisma generate
```

Finally, start the server:

```bash
npm start
```

Now the server is running at

```bash
http://localhost:<PORT>                   # Default PORT: 5000
```

## Documentation

### API Documentation

Detailed API documentation is provided using **Swagger** and can be [accessed online here](https://afifudin23.github.io/api-myrekap-myflower-v2/docs).  
The source code is available [in this directory](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/api).

> 💡 **Tip:**  
> To preview the Swagger UI locally, run a local web server (for example, **Live Server** or any similar tool)  
> and open this file:  
> [docs/api/index.html](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/api/index.html)

### ERD Database

The database Entity-Relationship Diagram (ERD) was created using [dbdiagram.io](https://dbdiagram.io/) and the source code can be [accessed here](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/erd/myapps-v2.dbml).

<a href="https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/erd/myapps-v2.png" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/erd/myapps-v2.png"/> </a>
