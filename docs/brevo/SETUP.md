# 📧 Setup Email Template with Brevo

## 1. Overview

This guide explains how to set up and use **email templates from Brevo (Sendinblue)** in the **MyRekap** project.

---

## 2. Prerequisites

Before you start, make sure you have:

-   ✅ Brevo account → [https://www.brevo.com](https://www.brevo.com)
-   ✅ Verified sender email
-   ✅ Create Brevo API key (for backend integration) — you can [access the link here](https://app.brevo.com/settings/keys/api)

<img src="https://raw.githubusercontent.com/afifudin23/api-myrekap-myflower-v2/main/docs/brevo/generate-api-brevo.jpeg" alt="generate-new-apiKey-brevo">

---

## 3. Create Templates

Go to your Brevo Dashboard → **Marketing** → **Templates** → **Create Template**

---

### 🧩 a. User OTP

**Template Name:** `User OTP`  
**Subject Line:** `{{ params.appName }} - Kode {{ params.type }} - {{ params.otp }}`  
**Preview Text:** `Gunakan kode ini untuk {{ params.purpose }}. Berlaku {{ params.expiresInMinutes }} menit.`  
**From Email:** `<User Email>`  
**From Name:** `<User Name>`

**Template Design (HTML):**

```html
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{ params.appName }} — Kode Verifikasi</title>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
    </head>
    <body style="margin:0; padding:0; background-color:#f5f7fb; font-family: Arial, Helvetica, sans-serif;">
        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="background-color:#f5f7fb; padding:24px 0;"
        >
            <tr>
                <td align="center">
                    <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="600"
                        style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(16,24,40,0.06);"
                    >
                        <!-- Header -->
                        <tr>
                            <td style="padding:24px 32px 8px 32px;">
                                <div style="font-size:14px; color:#98a2b3;">{{ params.appName }}</div>
                                <h1 style="margin:6px 0 0; font-size:20px; color:#1f2937;">{{ params.type }}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:8px 32px; color:#374151; font-size:14px;">
                                <p>Halo {{ params.username }},</p>
                                <p>
                                    Gunakan kode di bawah ini untuk {{ params.purpose }} di
                                    <strong>{{ params.appName }}</strong>.
                                </p>
                            </td>
                        </tr>

                        <!-- OTP -->
                        <tr>
                            <td align="center" style="padding:24px 32px 0;">
                                <table
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="border:1px solid #e5e7eb; border-radius:10px; padding:18px 24px;"
                                >
                                    <tr>
                                        <td
                                            style="font-family:'Courier New',monospace; font-size:32px; letter-spacing:8px; font-weight:700; color:#111827;"
                                        >
                                            {{ params.otp }}
                                        </td>
                                    </tr>
                                </table>
                                <div style="font-size:12px; color:#6b7280; margin-top:10px;">
                                    (Kode sekali pakai berisi 6 digit)
                                </div>
                            </td>
                        </tr>

                        <!-- Expiry -->
                        <tr>
                            <td style="padding:20px 32px; color:#4b5563; font-size:13px;">
                                <p>
                                    Kode ini akan kedaluwarsa dalam
                                    <strong>{{ params.expiresInMinutes }}</strong> menit.
                                </p>
                                <p>Jika Anda tidak meminta ini, abaikan saja email ini.</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding:24px 32px 28px; color:#9ca3af; font-size:12px;">
                                <p>— Tim {{ params.appName }}</p>
                            </td>
                        </tr>
                    </table>

                    <div style="max-width:600px; margin:14px auto 0; color:#9ca3af; font-size:11px; text-align:center;">
                        Anda menerima email ini karena ada permintaan {{ params.type }} untuk {{ params.appName }}.
                    </div>
                </td>
            </tr>
        </table>
    </body>
</html>
```

### 🧾 b. New Order Notification (Owner)

**Template Name:** `New Order Notification (Owner)`  
**Subject Line:** `Pesanan Baru Telah Dibuat - {{ params.orderCode }}`  
**Preview Text:** `Halo Owner, ada pesanan baru dari {{ params.customerName }} dengan total {{ params.totalPrice }}.`  
**From Email:** `<User Email>`  
**From Name:** `<User Name>`

---

#### 🧱 Template Design (HTML)

```html
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8" />
        <title>Pesanan Baru Masuk</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
        <div style="max-width:600px; margin:auto; border:1px solid #e2e2e2; padding:20px; border-radius:8px">
            <h2>Halo Owner 👋</h2>
            <p>Pesanan: <strong>{{ params.orderCode }}</strong></p>
            <p>Ada pesanan baru yang baru saja dibuat di Toko Bunga Anda!</p>

            <h3>Detail Pesanan:</h3>
            <ul>
                <li><strong>Nama Pelanggan:</strong> {{ params.customerName }}</li>
                <li><strong>Kategori Pelanggan:</strong> {{ params.customerCategory }}</li>
                <li><strong>Nomor Telepon:</strong> {{ params.phoneNumber }}</li>
                <li><strong>Metode Pembayaran:</strong> {{ params.paymentMethod }}</li>
                <li><strong>Total Harga:</strong> {{ params.totalPrice }}</li>
                <li><strong>Tanggal Produk Jadi:</strong> {{ params.readyDate }}</li>
                <li><strong>Metode Pengiriman:</strong> {{ params.deliveryOption }}</li>
                {% if params.deliveryOption == "Kirim ke Alamat" %}
                <li><strong>Alamat Pengiriman:</strong> {{ params.deliveryAddress }}</li>
                <li><strong>Biaya Pengiriman:</strong> {{ params.shippingCost }}</li>
                {% endif %}
            </ul>

            <h3>Daftar Produk:</h3>
            <pre>{{ params.items }}</pre>

            <p>Segera cek dashboard untuk memproses pesanan ini.</p>
            <p>Salam,<br /><strong>Sistem Notifikasi Toko Anda</strong></p>
        </div>
    </body>
</html>
```

### 🧩 c. Update Order Status Notification (MyRekap)

**Template Name:** `MyRekap OrderStatus Email`  
**Subject Line:** `Status Pesanan Anda Telah Diperbarui - {{params.orderCode}}`  
**Preview Text:** `Pesanan Anda sekarang dalam status {{params.orderStatus}}. Klik untuk lihat detailnya.`  
**From Email:** `<User Email>`  
**From Name:** `<User Name>`

---

#### 🧱 Template Design (HTML)

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Status Pesanan</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e2e2e2; padding: 20px; border-radius: 8px">
      <h2>Halo, {{params.customerName}}!</h2>
      <p>Pesanan Anda dengan kode <strong>{{params.orderCode}}</strong> telah diperbarui ke status berikut:</p>
      <h3 style="color: #007BFF;">{{params.orderStatus}}</h3>

      <p>
        Berikut ringkasan pesanan Anda:
      </p>
      <ul>
        <li><strong>Nama Pelanggan:</strong> {{params.customerName}}</li>
        <li><strong>Metode Pembayaran:</strong> {{params.paymentMethod}}</li>
        <li><strong>Provider:</strong> {{params.paymentProvider}}</li>
        <li><strong>Total Harga:</strong> {{params.totalPrice}}</li>
      </ul>

      <p><strong>Daftar Produk:</strong></p>
      <pre>{{params.items}}</pre>

      {% if params.orderStatus == "IN_PROCESS" %}
         <p>Pesanan Anda saat ini sedang dalam proses pengerjaan oleh tim kami. Kami akan segera mengabari jika pesanan telah selesai atau sedang dikirim.</p>
      {% endif %}

      {% if params.orderStatus == "DELIVERY" %}
         <p>Pesanan Anda sedang dalam proses pengiriman. Silakan pastikan nomor telepon Anda aktif untuk memudahkan kurir menghubungi Anda.</p>
      {% endif %}

      <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
      <p>Salam hangat,<br />Toko Bunga Anda</p>
    </div>
  </body>
</html>
```

### 🧾 d. Update Order Status Notification (MyFlower)

**Template Name:** `MyFlower OrderStatus Email`  
**Subject Line:** `MyFlower - Pesanan Anda {{params.orderCode}}`  
**Preview Text:** `Pesanan Anda sekarang dalam status {{params.orderStatus}}. Klik untuk lihat detailnya.`  
**From Email:** `<User Email>`  
**From Name:** `<User Name>`

---

#### 🧱 Template Design (HTML)

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Pesanan Anda</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e2e2e2; padding: 20px; border-radius: 8px">
      <h2>Halo, {{params.customerName}}!</h2>
      
      {% if params.status == "create" %}
        <p>Kamu telah membuat pesanan dengan kode <strong>{{params.orderCode}}</strong>, status pesanan Anda saat ini adalah:</p>
      {% endif %}
      {% if params.status == "confirm" %}
        <p>Kamu telah menerima pesanan dengan kode <strong>{{params.orderCode}}</strong>, status pesanan Anda saat ini adalah:</p>
      {% endif %}
      {% if params.status == "cancel" %}
        <p>Kamu telah membatalkan pesanan dengan kode <strong>{{params.orderCode}}</strong>, status pesanan Anda saat ini adalah:</p>
      {% endif %}

      <h3 style="color: #007BFF;">{{params.orderStatus}}</h3>

      <p>Berikut ringkasan pesanan Anda:</p>
      <ul>
        <li><strong>Nama Pelanggan:</strong> {{params.customerName}}</li>
        <li><strong>Metode Pembayaran:</strong> {{params.paymentMethod}}</li>
        <li><strong>Provider:</strong> {{params.paymentProvider}}</li>
        <li><strong>Total Harga:</strong> {{params.totalPrice}}</li>
      </ul>

      <p><strong>Daftar Produk:</strong></p>
      <pre>{{params.items}}</pre>

      <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
      <p>Salam hangat,<br />Toko Bunga Anda</p>
    </div>
  </body>
</html>
```

## 4. 💡 Tips

-   Save the **Template ID** for each Brevo template after creation. This ID is used to call the template via API.
-   Use simple and clean HTML formatting to ensure consistent display across all devices.
-   Test sending emails directly from the Brevo dashboard before integrating with the backend.
-   Make sure the sender email is **verified** in Brevo to prevent messages from going to the spam folder.

---

## 5. ⚙️ `.env` Configuration

Add the following configuration to your `.env` file in the backend project:

```bash
# Brevo Configuration
BREVO_API_KEY=xkeysib-xxxx-your_brevo_api_key
BREVO_SENDER_NAME="Notifikasi"
BREVO_SENDER_EMAIL="no-reply@myrekap.com"

# Template IDs
BREVO_TEMPLATE_OTP_ID=1
BREVO_TEMPLATE_ORDER_OWNER_ID=2
BREVO_TEMPLATE_MYREKAP_ORDER_STATUS_ID=3
BREVO_TEMPLATE_MYFLOWER_ORDER_STATUS_ID=4
```
