# 💳 Setup Midtrans Payment Gateway

## 1. Overview

This guide explains how to integrate and configure Midtrans Snap as a payment gateway in the MyRekap project.

Midtrans is used to handle online payments securely, including transactions via bank transfer, e-wallet, and credit card.

## 2. Prerequisites

Before you begin, make sure you have the following:

-   ✅ A verified Midtrans account
-   ✅ A registered project (MyRekap or MyFlower)
-   ✅ Access to Server Key and Client Key (found in your Midtrans Dashboard)
-   ✅ The backend is already set up to handle payment APIs

## 3. Obtain API Keys

1. Log in to your Midtrans dashboard → https://dashboard.midtrans.com/
2. Go to: Settings → Access Keys
3. Copy the following credentials for your environment:
    - Server Key → Used in the backend for API requests
    - Client Key → Used in the frontend to trigger Snap

> Notes: ⚠️ Use Sandbox Keys for testing and Production Keys when going live.       

<a href="https://github.com/afifudin23/api-myrekap-myflower-v2/tree/main/docs/midtrans/access-key.jpeg" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/midtrans/access-key.jpeg" alt="Access Key"/> </a>

## 4. Environment Configuration

Add the following variables to your backend .env file:

# Midtrans Configuration

```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
```

🔁 When going live, replace sandbox with api.midtrans.com and app.midtrans.com.
