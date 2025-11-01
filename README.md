<div align="center">
    <!-- https://icons8.com/icons -->
    <img width="96" height="96" src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/api/logo.png" alt="myrekap-logo"/>
</div>

<h1 align="center">MyRekap – Quick and Easy Flower Sales Management</h1>

![Node.js](https://img.shields.io/badge/Node.js-v22.18.0-green)
![NPM](https://img.shields.io/badge/npm-v10.9.3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**MyRekap** is an application designed to help record data, monitor progress, and display reports in real time.
Built with Node.js and a modern frontend, it allows users to manage information efficiently.

---

## Table of Contents

-   [Features](#features)
-   [Tech Stack Required](#tech-stack-required)
-   [Getting Started](#getting-started)
    -   [Initial Step](#1-initial-step)
    -   [Setup Backend](#2-setup-backend-api)
    -   [Setup Frontend](#3-setup-frontend-myrekap)
-   [Documentation](#documentation)
    -   [API Documentation](#api-documentation)
    -   [ERD Database](#erd-database)
    -   [Demo Features](#demo-features)

---

## Features

-   Store and display recap data in real time
-   Compact dashboard for progress monitoring
-   Generate sales reports quickly and clearly
-   Manage product data effortlessly
-   Track and update sales records easily, including creating, editing, and monitoring progress
-   Responsive and user-friendly interface

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
    -   Brevo (for notification emails)

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
git clone git@github.com:afifudin23/myrekap-v1.git
cd myrekap-v1
```

### 2. Setup Backend (API)

Go to the backend folder and install the dependencies:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your configuration:

```bash
# Server Configuration
PORT=                           # The port number your server will listen on, default 5000
MYREKAP_URL=                    # Base URL for the MyRekap service, default http://localhost:5001
DATABASE_URL=                   # Connection URL for your database

# Security
JWT_ACCESS=                     # Secret key for signing access JWT tokens
JWT_RESET_PASSWORD=             # Secret key for signing password reset JWT tokens

# Superadmin Account
SUPERADMIN_USERNAME=            # Username for the superadmin account
SUPERADMIN_EMAIL=               # Email for the superadmin account
SUPERADMIN_PASSWORD=            # Password for the superadmin account

# Setup Brevo (Email Service)
BREVO_API_KEY=                  # API key for Brevo (formerly Sendinblue)
BREVO_SENDER_NAME=              # Name displayed as the sender in emails, "Notification MyRekap"
BREVO_SENDER_EMAIL=             # Email address used to send emails
BREVO_TEMPLATE_OTP_ID=          # Template ID for OTP emails
BREVO_TEMPLATE_ORDER_OWNER_ID=  # Template ID for order notification emails to owner
MANAGER_EMAIL=                  # Email of manager for notifications

# Others
IMAGES_DIR=                     # Directory path where uploaded images are stored

```

**For Prisma database URL documentation** check this link, [Database Connection URL](https://www.prisma.io/docs/orm/reference/connection-urls).  
And, **documentation for Setup Brevo** access in here, [how to Setup Brevo](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/brevo/SETUP.md).  
Next, run Prisma migration to the database:

```bash
npx prisma migrate deploy
```

Finally, start the server:

```bash
npm start
```

Now the server is running at

```bash
http://localhost:<PORT>                   # Default PORT: 5000
```

### 3. Setup Frontend (MyRekap)

Go to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

Copy .env.example to .env and set your configuration:

```bash
# System
VITE_BASE_API_URL=               # The base URL of your backend API, default http://localhost:5000

```

Build the application for production:

```bash
npm run build
```

Run the app in preview mode:

```bash
npm run preview -- --port <PORT>          # Default PORT: 5001
```

The app will be available at:

```bash
http://localhost:<PORT>                   # Default PORT: 5001
```

## Documentation

### API Documentation

Detailed API documentation is provided using **Swagger** and can be [accessed online here](https://afifudin23.github.io/api-myrekap-myflower-v2/docs).  
The source code is available [in this directory](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/api).

> 💡 **Tip:**  
> To preview the Swagger UI locally, run a local web server (for example, **Live Server** or any similar tool)  
> and open this file:  
> [backend/docs/swagger/index.html](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/api/index.html)

### ERD Database

The database Entity-Relationship Diagram (ERD) was created using [dbdiagram.io](https://dbdiagram.io/) and the source code can be [accessed here](https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/erd/myapps-v2.dbml).

<a href="https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/erd/myapps-v2.png" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/erd/myapps-v2.png"/> </a>

### Demo Features

Explore the main frontend features of MyRekap through these live demos:

-   Product Management: [Demo Link](https://jam.dev/c/0f63f2a4-f904-413a-b759-636163f1e689)
-   Orders Management: [Demo Link](https://jam.dev/c/b6239010-40d8-4c53-9c1a-e0272a8a182d)
-   Admin Management: [Demo Link](https://jam.dev/c/17c2cd20-f0c9-4ebd-b7ef-c4eca58e0c1a)
-   Reports Management: [Demo Link](https://jam.dev/c/b36739fe-ee11-4acd-adfb-31abccbbbf7b)

Interact with the demos to see how MyRekap handles products, orders, admins, and reports in real time.
