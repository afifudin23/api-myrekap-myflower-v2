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

<a href="https://dashboard.sandbox.midtrans.com/settings/access-keys" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/midtrans/access-key.jpeg" alt="Access Key"/> </a>

## 4. Environment Configuration

Add the following variables to your backend .env file:

# Midtrans Configuration

```bash
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
```

🔁 When going live, replace sandbox with api.midtrans.com and app.midtrans.com.

## 5. Webhook & Snap Preferences

### Webhook (Payment Notification URL)

Midtrans sends a notification (webhook) to your backend every time a transaction status changes (e.g. success, pending, or failed).

1. Go to your Midtrans Dashboard → Settings → Configuration → Payment → Notification URL
2. Add your backend notification endpoint (example):

```bash
https://{your-domain-api}/api/v2/transactions/webhook
```

<a href="https://dashboard.sandbox.midtrans.com/settings/payment/notification" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/midtrans/webhook.jpeg" alt="Access Key"/> </a>

> ⚠️ Make sure this URL is accessible from the internet.  
> If your backend has not been deployed yet, you can use [**ngrok**](https://ngrok.com) to temporarily expose your local server for testing purposes.

### Snap Preferences

In your Midtrans dashboard, go to:  
Settings → Settings → Snap Preferences → System Settings  
Then set:

-   Finish URL

```bash
https://{your-domain-myflower}/orders/payment-success
```

-   Error Payment URL

```bash
https://{your-domain-myflower}/orders/payment-failed
```

<a href="https://dashboard.sandbox.midtrans.com/settings/snap_preference" align="center"> <img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/midtrans/snap-preferences.jpg" alt="Access Key"/> </a>

> ⚠️ If your MyFlower frontend has not been deployed yet, you can also use [**ngrok**](https://ngrok.com) to expose your local React app for testing Snap redirections.  
> Once deployed, replace the ngrok URL with your production domain.
