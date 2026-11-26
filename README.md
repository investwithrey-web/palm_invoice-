# 🌴 Palm Resort - Smart Invoice Builder & Billing System
This is only for palm resort only
A fast, modern, and complete invoice generator tailored specifically for **Palm Resort**.

---

## ✨ Features

- **Pre-filled Business Details:**
  - **Business Name:** Palm resort
  - **Logo:** High-resolution resort logo (`Tropical Sunset Palm Resort Logo.png`) with automatic embedded offline fallback
  - **Mobile:** 9997742709
  - **Website:** www.palmresort.online
  - **Address:** palm resort near garh ganga up 244235

- **Customer & Invoice Parameters:**
  - Customer Name
  - Customer Mobile Number
  - Invoice Date
  - Itemized Services / Charges with Description, Unit Price (₹), Quantity, and Discount Price (₹)
  - Quick Suggestion Chips (Deluxe Cottage, Executive Villa, Pool Pass, Buffet Meals, etc.)

- **Real-Time On-The-Fly Calculations:**
  - Subtotal = `Sum(Price × Qty)`
  - Total Discounts
  - Optional GST/Tax (0%, 5%, 12%, 18%)
  - Grand Total in **Rupees (₹)**
  - Amount Paid (₹) input
  - **Automatic Balance Due calculation:** `Total Amount - Amount Paid`
  - Dynamic payment badges: `PAID IN FULL`, `PARTIALLY PAID`, or `PAYMENT DUE`
  - Automatic **Amount in Words in Indian Currency** (e.g. *Rupees Nine Thousand Six Hundred Only*)

- **Smart Invoice Number Tracker (Range: 1 – 1000):**
  - Invoice numbers are strictly generated between **1 and 1000**
  - **"⚡ Auto Next"**: Automatically finds and assigns the next unused number
  - **"🎲 Random"**: Assigns a random available number from the unused pool
  - **Duplicate Prevention**: Tracks all generated numbers so duplicate numbers are never assigned accidentally
  - **Visual 1-1000 Numbers Grid**: See which numbers are used (green) and available (white)
  - **Persistent Storage**: Saved in browser `localStorage` and `data/used_numbers.json`

- **Instant PDF & Printing:**
  - **📥 Download PDF**: 1-click download of the invoice as a formatted PDF file named `Palm_Resort_Invoice_XXXX_CustomerName.pdf`
  - **🖨️ Print / Save Vector PDF**: Native print styling tuned specifically for **A4 portrait sheets** with zero margins cut off

- **History & Management:**
  - View all past saved invoices
  - Search invoices by customer name, mobile, or invoice number
  - 1-click reload into the editor
  - Delete past invoices and free up their invoice numbers

---

## 🚀 How to Run

### Method 1: Double-click Launcher (Easiest on macOS)
Double-click `start.command` or run:
```bash
./start.sh
```
This automatically starts the local server and shows:
- **Mac Browser:** [http://localhost:3000](http://localhost:3000)
- **Mobile / Phone (same Wi-Fi):** `http://192.168.29.99:3000`

### 📱 Opening and Using on Mobile / Phone:
1. Make sure your smartphone (iPhone or Android) is connected to the same Wi-Fi network.
2. Open your mobile browser (Safari, Chrome) and go to:
   `http://192.168.29.99:3000`
   *(Or click "📱 Phone" on your Mac to scan the QR code with your phone camera!)*
3. **Mobile Features:**
   - **`[ ✏️ Edit Invoice Form ]`**: Fill out customer details, items, discounts, and payments with touch-friendly controls and auto-numeric keypad.
   - **`[ 📄 Live A4 Preview ]`**: Auto-scales the full A4 invoice to fit your phone screen with no horizontal cutting.
   - **Sticky Bottom Action Bar**: Instant 1-touch **"📥 Download PDF"** and view balance due anytime!
   - **Full Mobile PDF Download**: Generates crisp, single-page vector PDFs directly onto your smartphone.

### Method 2: Node.js Server
```bash
npm start
# or
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Method 3: Direct Browser File (Zero Setup)
Simply double-click `index.html` or drag and drop `index.html` into any browser (Google Chrome, Safari, Microsoft Edge, Firefox). The application runs completely client-side with offline local storage!

---

## 📁 File Structure

```
invoice builder/
├── index.html                           # Main web application interface
├── css/
│   └── styles.css                       # Luxury resort styling & print-optimized CSS
├── js/
│   └── app.js                           # Core generator, calculations & PDF logic
├── assets/
│   └── logo.js                          # Embedded base64 logo for guaranteed rendering
├── data/
│   ├── invoices.json                    # Saved invoices database
│   └── used_numbers.json                # Array of used invoice numbers (1-1000)
├── Tropical Sunset Palm Resort Logo.png # High-res resort logo
├── logo.png                             # Normalized logo image
├── server.js                            # Zero-dependency local Node.js server
├── start.sh                             # macOS shell launcher
├── start.command                        # Double-clickable macOS launcher
├── package.json                         # Project metadata
└── README.md                            # Documentation
```
