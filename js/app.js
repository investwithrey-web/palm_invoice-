/**
 * Palm Resort Invoice Builder
 * Robust, client-side & server-sync enabled invoice generator
 */

(function () {
  'use strict';

  // Constants & Pre-filled Business Details
  const BUSINESS_INFO = {
    name: 'Palm resort',
    phone: '9997742709',
    website: 'www.palmresort.online',
    address: 'palm resort near garh ganga up 244235'
  };

  // State Management
  let state = {
    invoiceNumber: 1,
    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerMobile: '',
    items: [],
    taxRate: 0,
    amountPaid: 0,
    paymentMode: 'UPI / Online',
    notes: 'Thank you for choosing Palm Resort! Standard Check-in is 12:00 PM and Check-out is 11:00 AM. Please keep this invoice for your records.',
    usedNumbers: [],
    invoices: [],
    zoom: 1.0,
    isServerActive: false
  };

  // DOM Elements
  const els = {
    // Inputs
    invoiceNumber: document.getElementById('invoiceNumber'),
    invoiceDate: document.getElementById('invoiceDate'),
    customerName: document.getElementById('customerName'),
    customerMobile: document.getElementById('customerMobile'),
    taxRate: document.getElementById('taxRate'),
    paymentMode: document.getElementById('paymentMode'),
    amountPaid: document.getElementById('amountPaid'),
    invoiceNotes: document.getElementById('invoiceNotes'),
    itemsTableBody: document.getElementById('itemsTableBody'),
    invoiceNumberStatus: document.getElementById('invoiceNumberStatus'),
    
    // Buttons
    btnNextNumber: document.getElementById('btnNextNumber'),
    btnRandomNumber: document.getElementById('btnRandomNumber'),
    btnAddItem: document.getElementById('btnAddItem'),
    btnSaveInvoice: document.getElementById('btnSaveInvoice'),
    btnDownloadPDF: document.getElementById('btnDownloadPDF'),
    btnDownloadPDF2: document.getElementById('btnDownloadPDF2'),
    btnPrintInvoice: document.getElementById('btnPrintInvoice'),
    btnResetForm: document.getElementById('btnResetForm'),
    btnQuickSample: document.getElementById('btnQuickSample'),
    btnOpenHistory: document.getElementById('btnOpenHistory'),
    btnCloseHistory: document.getElementById('btnCloseHistory'),
    btnCloseModalBottom: document.getElementById('btnCloseModalBottom'),
    historyModal: document.getElementById('historyModal'),
    btnExportJSON: document.getElementById('btnExportJSON'),
    btnResetAllNumbers: document.getElementById('btnResetAllNumbers'),

    // Zoom Controls
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnZoomReset: document.getElementById('btnZoomReset'),
    zoomLevel: document.getElementById('zoomLevel'),
    invoicePaper: document.getElementById('invoicePaper'),

    // Form Summary Elements
    formSubtotal: document.getElementById('formSubtotal'),
    formDiscount: document.getElementById('formDiscount'),
    formTax: document.getElementById('formTax'),
    formTotal: document.getElementById('formTotal'),
    formBalanceDue: document.getElementById('formBalanceDue'),
    paymentStatusBadge: document.getElementById('paymentStatusBadge'),

    // Preview Elements
    previewBusinessName: document.getElementById('previewBusinessName'),
    previewBusinessAddress: document.getElementById('previewBusinessAddress'),
    previewBusinessPhone: document.getElementById('previewBusinessPhone'),
    previewBusinessWebsite: document.getElementById('previewBusinessWebsite'),
    previewInvoiceNumber: document.getElementById('previewInvoiceNumber'),
    previewInvoiceDate: document.getElementById('previewInvoiceDate'),
    previewCustomerName: document.getElementById('previewCustomerName'),
    previewCustomerMobile: document.getElementById('previewCustomerMobile'),
    previewPaymentMode: document.getElementById('previewPaymentMode'),
    previewStatusBadge: document.getElementById('previewStatusBadge'),
    previewItemsBody: document.getElementById('previewItemsBody'),
    previewSubtotal: document.getElementById('previewSubtotal'),
    previewDiscount: document.getElementById('previewDiscount'),
    previewDiscountRow: document.getElementById('previewDiscountRow'),
    previewTax: document.getElementById('previewTax'),
    previewTaxRow: document.getElementById('previewTaxRow'),
    previewTaxLabel: document.getElementById('previewTaxLabel'),
    previewTotal: document.getElementById('previewTotal'),
    previewPaid: document.getElementById('previewPaid'),
    previewBalanceDue: document.getElementById('previewBalanceDue'),
    previewBalanceRow: document.getElementById('previewBalanceRow'),
    previewAmountInWords: document.getElementById('previewAmountInWords'),
    previewNotes: document.getElementById('previewNotes'),
    invoiceSheetLogo: document.getElementById('invoiceSheetLogo'),
    invoiceSheetStamp: document.getElementById('invoiceSheetStamp'),
    appNavLogo: document.getElementById('appNavLogo'),

    // Modal Tabs & Content
    tabInvoicesBtn: document.getElementById('tabInvoicesBtn'),
    tabNumbersBtn: document.getElementById('tabNumbersBtn'),
    tabInvoicesPane: document.getElementById('tabInvoicesPane'),
    tabNumbersPane: document.getElementById('tabNumbersPane'),
    historyTableBody: document.getElementById('historyTableBody'),
    searchInvoices: document.getElementById('searchInvoices'),
    numbersGrid: document.getElementById('numbersGrid'),
    headerUsedCount: document.getElementById('headerUsedCount'),
    statUsedCount: document.getElementById('statUsedCount'),
    statAvailableCount: document.getElementById('statAvailableCount'),

    // Mobile Navigation & Bottom Bar Elements
    btnTabEdit: document.getElementById('btnTabEdit'),
    btnTabPreview: document.getElementById('btnTabPreview'),
    mobileTabBadge: document.getElementById('mobileTabBadge'),
    btnMobileToggleView: document.getElementById('btnMobileToggleView'),
    btnMobileDownload: document.getElementById('btnMobileDownload'),
    mToggleText: document.getElementById('mToggleText'),
    mBottomStatus: document.getElementById('mBottomStatus'),
    mBottomBalance: document.getElementById('mBottomBalance'),
    invoicePaperWrapper: document.querySelector('.invoice-paper-wrapper'),
    
    // Mobile Connect & QR Elements
    btnOpenMobileConnect: document.getElementById('btnOpenMobileConnect'),
    mobileModal: document.getElementById('mobileModal'),
    btnCloseMobileModal: document.getElementById('btnCloseMobileModal'),
    btnCloseMobileModalBottom: document.getElementById('btnCloseMobileModalBottom'),
    mobileUrlInput: document.getElementById('mobileUrlInput'),
    btnCopyMobileUrl: document.getElementById('btnCopyMobileUrl'),
    mobileQrImg: document.getElementById('mobileQrImg'),

    // Toast
    toast: document.getElementById('toast')
  };

  /**
   * Currency & Formatting Utilities
   */
  function formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹ ' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Convert Number to Indian Words (Rupees)
   */
  function numberToIndianWords(num) {
    const n = Math.floor(Math.abs(Number(num) || 0));
    if (n === 0) return 'Rupees Zero Only';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(val) {
      let str = '';
      if (val > 19) {
        str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
      } else {
        str += a[val];
      }
      return str;
    }

    let crore = Math.floor(n / 10000000);
    let remCrore = n % 10000000;
    let lakh = Math.floor(remCrore / 100000);
    let remLakh = remCrore % 100000;
    let thousand = Math.floor(remLakh / 1000);
    let remThousand = remLakh % 1000;
    let hundred = Math.floor(remThousand / 100);
    let remHundred = remThousand % 100;

    let res = '';
    if (crore > 0) res += inWords(crore) + ' Crore ';
    if (lakh > 0) res += inWords(lakh) + ' Lakh ';
    if (thousand > 0) res += inWords(thousand) + ' Thousand ';
    if (hundred > 0) res += inWords(hundred) + ' Hundred ';
    if (remHundred > 0) {
      if (res !== '') res += 'and ';
      res += inWords(remHundred) + ' ';
    }

    return 'Rupees ' + res.trim() + ' Only';
  }

  /**
   * Toast notification
   */
  function showToast(message, type = 'info') {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.className = 'toast show ' + (type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : '');
    setTimeout(() => {
      els.toast.className = 'toast';
    }, 3500);
  }

  /**
   * Storage: LocalStorage & Optional Server Sync
   */
  const STORAGE_KEYS = {
    USED_NUMBERS: 'palm_resort_used_numbers_v1',
    INVOICES: 'palm_resort_invoices_v1'
  };

  async function loadData() {
    // 1. Try loading from localStorage first
    try {
      const localUsed = localStorage.getItem(STORAGE_KEYS.USED_NUMBERS);
      if (localUsed) {
        state.usedNumbers = JSON.parse(localUsed);
      }
      const localInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (localInvoices) {
        state.invoices = JSON.parse(localInvoices);
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }

    // 2. Check if local backend server is reachable
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (res.ok) {
        state.isServerActive = true;
        // Sync from server
        const [numRes, invRes] = await Promise.all([
          fetch('/api/used-numbers'),
          fetch('/api/invoices')
        ]);
        if (numRes.ok) {
          const numData = await numRes.json();
          // Merge unique numbers
          const merged = Array.from(new Set([...state.usedNumbers, ...(numData.usedNumbers || [])])).sort((a,b) => a - b);
          state.usedNumbers = merged;
          localStorage.setItem(STORAGE_KEYS.USED_NUMBERS, JSON.stringify(merged));
        }
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) {
            state.invoices = invData;
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invData));
          }
        }
      }
    } catch {
      state.isServerActive = false;
    }

    updateUsedNumbersUI();
  }

  async function saveInvoiceToStorage(invoice) {
    const num = parseInt(invoice.invoiceNumber, 10);
    
    // Add to used numbers list
    if (!state.usedNumbers.includes(num)) {
      state.usedNumbers.push(num);
      state.usedNumbers.sort((a, b) => a - b);
    }

    // Upsert into invoices list
    const existingIndex = state.invoices.findIndex(inv => parseInt(inv.invoiceNumber, 10) === num);
    if (existingIndex >= 0) {
      state.invoices[existingIndex] = invoice;
    } else {
      state.invoices.unshift(invoice);
    }

    // Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEYS.USED_NUMBERS, JSON.stringify(state.usedNumbers));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(state.invoices));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    // Sync to Server if active
    if (state.isServerActive) {
      try {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...invoice, overwrite: true })
        });
      } catch (err) {
        console.warn('Server sync failed:', err);
      }
    }

    updateUsedNumbersUI();
  }

  /**
   * Invoice Number Generation Logic (1 - 1000)
   */
  function getNextAvailableNumber() {
    for (let i = 1; i <= 1000; i++) {
      if (!state.usedNumbers.includes(i)) {
        return i;
      }
    }
    return null; // All 1000 numbers are used
  }

  function getRandomAvailableNumber() {
    const available = [];
    for (let i = 1; i <= 1000; i++) {
      if (!state.usedNumbers.includes(i)) {
        available.push(i);
      }
    }
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  function setInvoiceNumber(num) {
    els.invoiceNumber.value = num;
    state.invoiceNumber = num;
    validateInvoiceNumberInput();
    updateLivePreview();
  }

  function validateInvoiceNumberInput() {
    const val = parseInt(els.invoiceNumber.value, 10);
    if (isNaN(val)) {
      els.invoiceNumberStatus.innerHTML = '<span style="color:var(--danger)">Please enter a number between 1 and 1000.</span>';
      return false;
    }
    if (val < 1 || val > 1000) {
      els.invoiceNumberStatus.innerHTML = '<span style="color:var(--danger)">Number must be strictly between 1 and 1000.</span>';
      return false;
    }

    if (state.usedNumbers.includes(val)) {
      const match = state.invoices.find(inv => parseInt(inv.invoiceNumber, 10) === val);
      const custInfo = match ? `(Used for ${match.customerName || 'Guest'} on ${formatDateDisplay(match.invoiceDate)})` : '(Already generated)';
      els.invoiceNumberStatus.innerHTML = `<span style="color:var(--warning)">⚠️ Invoice #${val} has already been used! ${custInfo}. It will be updated if saved again.</span>`;
      return false;
    } else {
      els.invoiceNumberStatus.innerHTML = `<span style="color:var(--success)">✓ Invoice #${val} is available for generation.</span>`;
      return true;
    }
  }

  /**
   * Items Management
   */
  function createItemRow(item = { description: '', price: 0, qty: 1, discount: 0 }) {
    const tr = document.createElement('tr');
    tr.className = 'item-row';

    tr.innerHTML = `
      <td>
        <input type="text" class="item-desc" placeholder="Service or Item Name" value="${item.description}">
      </td>
      <td>
        <input type="number" class="item-price" min="0" step="any" placeholder="0" value="${item.price}">
      </td>
      <td>
        <input type="number" class="item-qty" min="1" step="any" placeholder="1" value="${item.qty}">
      </td>
      <td>
        <input type="number" class="item-discount" min="0" step="any" placeholder="0" value="${item.discount}">
      </td>
      <td>
        <input type="text" class="item-total" readonly value="₹ 0.00" style="background:#f8fafc; font-weight:700;">
      </td>
      <td class="text-center">
        <button type="button" class="btn-remove-row" title="Remove this item">&times;</button>
      </td>
    `;

    // Event listeners on inputs
    const inputs = tr.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        calculateTotalsAndPreview();
      });
    });

    // Remove row button
    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      const rows = els.itemsTableBody.querySelectorAll('tr');
      if (rows.length > 1) {
        tr.remove();
        calculateTotalsAndPreview();
      } else {
        // Reset the single remaining row instead of removing
        tr.querySelector('.item-desc').value = '';
        tr.querySelector('.item-price').value = 0;
        tr.querySelector('.item-qty').value = 1;
        tr.querySelector('.item-discount').value = 0;
        calculateTotalsAndPreview();
      }
    });

    els.itemsTableBody.appendChild(tr);
    return tr;
  }

  function readItemsFromDOM() {
    const rows = els.itemsTableBody.querySelectorAll('tr');
    const items = [];

    rows.forEach(tr => {
      const desc = tr.querySelector('.item-desc').value.trim();
      const price = parseFloat(tr.querySelector('.item-price').value) || 0;
      const qty = parseFloat(tr.querySelector('.item-qty').value) || 0;
      const discount = parseFloat(tr.querySelector('.item-discount').value) || 0;
      
      const total = Math.max(0, (price * qty) - discount);
      tr.querySelector('.item-total').value = formatINR(total);

      items.push({
        description: desc || 'Resort Service',
        price,
        qty,
        discount,
        total
      });
    });

    return items;
  }

  /**
   * Live Calculations & Preview Synchronization
   */
  function calculateTotalsAndPreview() {
    const items = readItemsFromDOM();
    state.items = items;

    // Calculate subtotal and discounts
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(it => {
      subtotal += (it.price * it.qty);
      totalDiscount += it.discount;
    });

    const netBeforeTax = Math.max(0, subtotal - totalDiscount);
    const taxRate = parseFloat(els.taxRate.value) || 0;
    const taxAmount = (netBeforeTax * taxRate) / 100;
    const grandTotal = netBeforeTax + taxAmount;

    const amountPaid = parseFloat(els.amountPaid.value) || 0;
    const balanceDue = grandTotal - amountPaid;

    // Update Form Totals
    els.formSubtotal.textContent = formatINR(subtotal);
    els.formDiscount.textContent = '- ' + formatINR(totalDiscount);
    els.formTax.textContent = '+ ' + formatINR(taxAmount);
    els.formTotal.textContent = formatINR(grandTotal);
    els.formBalanceDue.textContent = formatINR(Math.max(0, balanceDue));

    // Payment Status Badge
    if (balanceDue <= 0 && grandTotal > 0) {
      els.paymentStatusBadge.textContent = 'Payment Status: PAID IN FULL ✓';
      els.paymentStatusBadge.className = 'status-badge badge-paid';
      els.previewStatusBadge.textContent = 'PAID IN FULL';
      els.previewStatusBadge.className = 'ov-badge badge-paid';
      els.formBalanceDue.style.color = 'var(--success)';
    } else if (amountPaid > 0 && balanceDue > 0) {
      els.paymentStatusBadge.textContent = `Payment Status: PARTIAL (Due: ${formatINR(balanceDue)})`;
      els.paymentStatusBadge.className = 'status-badge badge-partial';
      els.previewStatusBadge.textContent = 'PARTIAL PAYMENT';
      els.previewStatusBadge.className = 'ov-badge badge-partial';
      els.formBalanceDue.style.color = 'var(--warning)';
    } else {
      els.paymentStatusBadge.textContent = `Payment Status: DUE (${formatINR(grandTotal)})`;
      els.paymentStatusBadge.className = 'status-badge badge-due';
      els.previewStatusBadge.textContent = 'PAYMENT DUE';
      els.previewStatusBadge.className = 'ov-badge badge-due';
      els.formBalanceDue.style.color = 'var(--danger)';
    }

    // Synchronize to Live A4 Sheet Preview
    updateLivePreview(subtotal, totalDiscount, taxRate, taxAmount, grandTotal, amountPaid, balanceDue);

    // Synchronize Mobile Bottom Bar & Badges
    if (els.mobileTabBadge) els.mobileTabBadge.textContent = formatINR(grandTotal);
    if (els.mBottomBalance) els.mBottomBalance.textContent = formatINR(Math.max(0, balanceDue));
    if (els.mBottomStatus) {
      if (balanceDue <= 0 && grandTotal > 0) {
        els.mBottomStatus.textContent = 'PAID IN FULL ✓';
        els.mBottomStatus.style.color = 'var(--success)';
      } else if (amountPaid > 0 && balanceDue > 0) {
        els.mBottomStatus.textContent = 'PARTIAL DUE:';
        els.mBottomStatus.style.color = 'var(--warning)';
      } else {
        els.mBottomStatus.textContent = 'BALANCE DUE:';
        els.mBottomStatus.style.color = 'var(--danger)';
      }
    }
  }

  function updateLivePreview(subtotal = 0, totalDiscount = 0, taxRate = 0, taxAmount = 0, grandTotal = 0, amountPaid = 0, balanceDue = 0) {
    const invNum = els.invoiceNumber.value || '1';
    const padded = String(invNum).padStart(4, '0');
    els.previewInvoiceNumber.textContent = `#${padded}`;
    els.previewInvoiceDate.textContent = formatDateDisplay(els.invoiceDate.value);

    els.previewCustomerName.textContent = els.customerName.value.trim() || 'Valued Guest';
    els.previewCustomerMobile.textContent = els.customerMobile.value.trim() ? '+91 ' + els.customerMobile.value.trim() : '+91 ----------';
    els.previewPaymentMode.textContent = els.paymentMode.value;

    // Render Preview Items Table Rows
    els.previewItemsBody.innerHTML = '';
    if (state.items.length === 0) {
      els.previewItemsBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:18px; color:var(--text-light)">No items added yet.</td></tr>`;
    } else {
      state.items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="text-center">${index + 1}</td>
          <td><strong>${escapeHTML(item.description)}</strong></td>
          <td class="text-center">${item.qty}</td>
          <td class="text-right">${formatINR(item.price)}</td>
          <td class="text-right ${item.discount > 0 ? 'text-success' : ''}">${item.discount > 0 ? '-' + formatINR(item.discount) : '₹ 0.00'}</td>
          <td class="text-right"><strong>${formatINR(item.total)}</strong></td>
        `;
        els.previewItemsBody.appendChild(tr);
      });
    }

    // Totals in Preview
    els.previewSubtotal.textContent = formatINR(subtotal);
    if (totalDiscount > 0) {
      els.previewDiscountRow.style.display = 'flex';
      els.previewDiscount.textContent = '- ' + formatINR(totalDiscount);
    } else {
      els.previewDiscountRow.style.display = 'none';
    }

    if (taxRate > 0) {
      els.previewTaxRow.style.display = 'flex';
      els.previewTaxLabel.textContent = `Tax (GST ${taxRate}%):`;
      els.previewTax.textContent = '+ ' + formatINR(taxAmount);
    } else {
      els.previewTaxRow.style.display = 'none';
    }

    els.previewTotal.textContent = formatINR(grandTotal);
    els.previewPaid.textContent = formatINR(amountPaid);
    els.previewBalanceDue.textContent = formatINR(Math.max(0, balanceDue));

    // Amount in words
    els.previewAmountInWords.textContent = numberToIndianWords(grandTotal);

    // Notes
    els.previewNotes.textContent = els.invoiceNotes.value.trim() || 'Thank you for choosing Palm Resort!';
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Invoice Object Generator
   */
  function getCurrentInvoiceObject() {
    const invNum = parseInt(els.invoiceNumber.value, 10) || 1;
    const items = readItemsFromDOM();
    
    let subtotal = 0;
    let totalDiscount = 0;
    items.forEach(it => {
      subtotal += (it.price * it.qty);
      totalDiscount += it.discount;
    });

    const netBeforeTax = Math.max(0, subtotal - totalDiscount);
    const taxRate = parseFloat(els.taxRate.value) || 0;
    const taxAmount = (netBeforeTax * taxRate) / 100;
    const grandTotal = netBeforeTax + taxAmount;
    const amountPaid = parseFloat(els.amountPaid.value) || 0;
    const balanceDue = Math.max(0, grandTotal - amountPaid);

    return {
      invoiceNumber: invNum,
      invoiceDate: els.invoiceDate.value,
      customerName: els.customerName.value.trim() || 'Valued Guest',
      customerMobile: els.customerMobile.value.trim(),
      items,
      subtotal,
      totalDiscount,
      taxRate,
      taxAmount,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentMode: els.paymentMode.value,
      notes: els.invoiceNotes.value.trim(),
      business: BUSINESS_INFO
    };
  }

  /**
   * Guaranteed Single-Page PDF Generation and Download
   */
  async function downloadInvoicePDF() {
    // 1. Validation
    if (!els.customerName.value.trim()) {
      showToast('Please enter customer name before generating PDF', 'error');
      els.customerName.focus();
      return;
    }

    const inv = getCurrentInvoiceObject();

    // 2. Save and mark number as used
    await saveInvoiceToStorage(inv);
    showToast(`Generating 1-Page PDF for Invoice #${inv.invoiceNumber}...`, 'info');

    // 3. Generate PDF filename
    const filename = `Palm_Resort_Invoice_${String(inv.invoiceNumber).padStart(4, '0')}_${(inv.customerName || 'Guest').replace(/\s+/g, '_')}.pdf`;

    // Ensure logo and stamp images are ready
    if (window.PALM_RESORT_LOGO_BASE64 && els.invoiceSheetLogo) {
      els.invoiceSheetLogo.src = window.PALM_RESORT_LOGO_BASE64;
    }
    if (window.PALM_RESORT_STAMP_BASE64 && els.invoiceSheetStamp) {
      els.invoiceSheetStamp.src = window.PALM_RESORT_STAMP_BASE64;
    }

    const element = document.getElementById('invoicePaper');
    const prevTransform = element.style.transform;
    element.style.transform = 'none';

    try {
      // Determine available PDF & Canvas engines
      const h2c = window.html2canvas || (window.html2pdf && window.html2pdf().html2canvas);
      const PDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

      if (h2c && PDFClass) {
        // Render high-DPI canvas
        const canvas = await h2c(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Initialize single A4 page document
        const pdf = new PDFClass({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 4; // 4mm safe border
        const maxW = pageWidth - (margin * 2);
        const maxH = pageHeight - (margin * 2);

        let renderW = maxW;
        let renderH = (canvas.height * renderW) / canvas.width;

        // Guaranteed single page constraint: never exceed page height
        if (renderH > maxH) {
          renderH = maxH;
          renderW = (canvas.width * renderH) / canvas.height;
        }

        // Center on A4 page
        const posX = margin + (maxW - renderW) / 2;
        const posY = margin + (maxH - renderH) / 2;

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
        
        // Mobile & Desktop compatible PDF download trigger
        try {
          pdf.save(filename);
        } catch (saveErr) {
          console.warn('pdf.save failed, using blob link fallback:', saveErr);
          const blob = pdf.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            link.remove();
            URL.revokeObjectURL(blobUrl);
          }, 3000);
        }

        showToast('Single-page PDF downloaded successfully! 📄', 'success');
      } else if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: 0,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all'] }
        };

        await html2pdf().set(opt).from(element).save();
        showToast('PDF downloaded successfully! 📄', 'success');
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Direct PDF download error, opening print dialog:', err);
      window.print();
    } finally {
      element.style.transform = prevTransform;
    }
  }

  /**
   * Save Invoice Button Handler
   */
  async function handleSaveInvoice() {
    if (!els.customerName.value.trim()) {
      showToast('Please enter Customer Name', 'error');
      els.customerName.focus();
      return;
    }

    const inv = getCurrentInvoiceObject();
    await saveInvoiceToStorage(inv);
    showToast(`Invoice #${inv.invoiceNumber} successfully saved & number registered!`, 'success');
  }

  /**
   * Form Reset & Preparation
   */
  function resetFormForNewInvoice() {
    const nextNum = getNextAvailableNumber();
    if (!nextNum) {
      showToast('All 1000 invoice numbers have been used! Check history to manage or reset.', 'error');
      return;
    }

    setInvoiceNumber(nextNum);
    els.invoiceDate.value = new Date().toISOString().split('T')[0];
    els.customerName.value = '';
    els.customerMobile.value = '';
    els.taxRate.value = '0';
    els.paymentMode.value = 'UPI / Online';
    els.amountPaid.value = '0';
    els.invoiceNotes.value = 'Thank you for choosing Palm Resort! Standard Check-in is 12:00 PM and Check-out is 11:00 AM. Please keep this invoice for your records.';

    // Clear items table and put 1 empty row
    els.itemsTableBody.innerHTML = '';
    createItemRow({ description: '', price: 0, qty: 1, discount: 0 });

    calculateTotalsAndPreview();
    showToast(`Fresh invoice prepared with Invoice #${nextNum}!`, 'info');
  }

  /**
   * Sample Data Loader
   */
  function fillSampleData() {
    let nextNum = parseInt(els.invoiceNumber.value, 10);
    if (isNaN(nextNum) || state.usedNumbers.includes(nextNum)) {
      nextNum = getNextAvailableNumber() || 42;
      setInvoiceNumber(nextNum);
    }

    els.customerName.value = 'Vikramaditya Singhal';
    els.customerMobile.value = '9812345670';
    els.invoiceDate.value = new Date().toISOString().split('T')[0];
    els.paymentMode.value = 'UPI / Online';
    els.taxRate.value = '0';

    els.itemsTableBody.innerHTML = '';
    createItemRow({
      description: 'Deluxe Cottage Room Stay (2 Nights)',
      price: 3500,
      qty: 2,
      discount: 500
    });
    createItemRow({
      description: 'Buffet Breakfast & Dinner Package',
      price: 1200,
      qty: 2,
      discount: 0
    });
    createItemRow({
      description: 'Swimming Pool & Resort Amenities Pass',
      price: 400,
      qty: 2,
      discount: 100
    });

    // Total will be: (7000-500) + (2400-0) + (800-100) = 6500 + 2400 + 700 = 9600
    // Set paid amount = 5000, leaving 4600 due
    els.amountPaid.value = '5000';

    calculateTotalsAndPreview();
    showToast('✨ Sample resort invoice loaded!', 'success');
  }

  /**
   * Numbers Tracker & History UI
   */
  function updateUsedNumbersUI() {
    const usedCount = state.usedNumbers.length;
    const availableCount = Math.max(0, 1000 - usedCount);

    if (els.headerUsedCount) els.headerUsedCount.textContent = usedCount;
    if (els.statUsedCount) els.statUsedCount.textContent = usedCount;
    if (els.statAvailableCount) els.statAvailableCount.textContent = availableCount;

    validateInvoiceNumberInput();
  }

  function renderHistoryModal() {
    // 1. Render Invoices Table
    const query = (els.searchInvoices.value || '').toLowerCase().trim();
    const filtered = state.invoices.filter(inv => {
      const matchName = (inv.customerName || '').toLowerCase().includes(query);
      const matchPhone = (inv.customerMobile || '').toLowerCase().includes(query);
      const matchNum = String(inv.invoiceNumber).includes(query);
      return matchName || matchPhone || matchNum;
    });

    els.historyTableBody.innerHTML = '';
    if (filtered.length === 0) {
      els.historyTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 20px; color: var(--text-light)">No invoices found.</td></tr>`;
    } else {
      filtered.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>#${String(inv.invoiceNumber).padStart(4, '0')}</strong></td>
          <td>${formatDateDisplay(inv.invoiceDate)}</td>
          <td><strong>${escapeHTML(inv.customerName)}</strong></td>
          <td>${inv.customerMobile || '-'}</td>
          <td>${formatINR(inv.grandTotal)}</td>
          <td>${formatINR(inv.amountPaid)}</td>
          <td style="color:${inv.balanceDue > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight:700;">
            ${formatINR(inv.balanceDue)}
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-sm btn-outline load-btn" data-num="${inv.invoiceNumber}" title="Load into editor">
                Load
              </button>
              <button type="button" class="btn btn-sm btn-danger-outline delete-btn" data-num="${inv.invoiceNumber}" title="Delete invoice & free number">
                Delete
              </button>
            </div>
          </td>
        `;

        tr.querySelector('.load-btn').addEventListener('click', () => {
          loadInvoiceIntoEditor(inv);
          closeHistoryModal();
        });

        tr.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete Invoice #${inv.invoiceNumber}? This will free number ${inv.invoiceNumber} for reuse.`)) {
            await deleteInvoice(inv.invoiceNumber);
          }
        });

        els.historyTableBody.appendChild(tr);
      });
    }

    // 2. Render 1 to 1000 Grid
    els.numbersGrid.innerHTML = '';
    const currentNum = parseInt(els.invoiceNumber.value, 10);
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= 1000; i++) {
      const cell = document.createElement('div');
      cell.className = 'num-cell' + (state.usedNumbers.includes(i) ? ' used' : '') + (i === currentNum ? ' current' : '');
      cell.textContent = i;
      cell.title = state.usedNumbers.includes(i) ? `Invoice #${i} (Used)` : `Invoice #${i} (Available)`;

      cell.addEventListener('click', () => {
        setInvoiceNumber(i);
        closeHistoryModal();
        showToast(`Selected Invoice #${i}`, 'info');
      });

      fragment.appendChild(cell);
    }
    els.numbersGrid.appendChild(fragment);
  }

  function loadInvoiceIntoEditor(inv) {
    setInvoiceNumber(inv.invoiceNumber);
    els.invoiceDate.value = inv.invoiceDate || new Date().toISOString().split('T')[0];
    els.customerName.value = inv.customerName || '';
    els.customerMobile.value = inv.customerMobile || '';
    els.paymentMode.value = inv.paymentMode || 'UPI / Online';
    els.taxRate.value = String(inv.taxRate || 0);
    els.amountPaid.value = inv.amountPaid || 0;
    els.invoiceNotes.value = inv.notes || '';

    // Load items
    els.itemsTableBody.innerHTML = '';
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach(it => createItemRow(it));
    } else {
      createItemRow();
    }

    calculateTotalsAndPreview();
    showToast(`Loaded Invoice #${inv.invoiceNumber} for ${inv.customerName}!`, 'success');
  }

  async function deleteInvoice(num) {
    const n = parseInt(num, 10);
    state.invoices = state.invoices.filter(inv => parseInt(inv.invoiceNumber, 10) !== n);
    state.usedNumbers = state.usedNumbers.filter(used => used !== n);

    localStorage.setItem(STORAGE_KEYS.USED_NUMBERS, JSON.stringify(state.usedNumbers));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(state.invoices));

    if (state.isServerActive) {
      try {
        await fetch(`/api/invoices/${n}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Server delete error:', e);
      }
    }

    updateUsedNumbersUI();
    renderHistoryModal();
    showToast(`Invoice #${n} deleted and number freed!`, 'info');
  }

  function openHistoryModal() {
    renderHistoryModal();
    els.historyModal.classList.add('show');
  }

  function closeHistoryModal() {
    els.historyModal.classList.remove('show');
  }

  /**
   * Zoom Controls
   */
  function applyZoom(delta) {
    if (delta === 0) {
      state.zoom = 1.0;
    } else {
      state.zoom = Math.min(1.5, Math.max(0.6, state.zoom + delta));
    }
    els.invoicePaper.style.transform = `scale(${state.zoom})`;
    els.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  /**
   * Event Listeners Setup
   */
  function setupEventListeners() {
    // Real-time Inputs
    els.invoiceNumber.addEventListener('input', () => {
      state.invoiceNumber = parseInt(els.invoiceNumber.value, 10);
      validateInvoiceNumberInput();
      calculateTotalsAndPreview();
    });

    els.invoiceDate.addEventListener('input', () => calculateTotalsAndPreview());
    els.customerName.addEventListener('input', () => calculateTotalsAndPreview());
    els.customerMobile.addEventListener('input', () => calculateTotalsAndPreview());
    els.taxRate.addEventListener('change', () => calculateTotalsAndPreview());
    els.paymentMode.addEventListener('change', () => calculateTotalsAndPreview());
    els.amountPaid.addEventListener('input', () => calculateTotalsAndPreview());
    els.invoiceNotes.addEventListener('input', () => calculateTotalsAndPreview());

    // Auto Number Buttons
    els.btnNextNumber.addEventListener('click', () => {
      const next = getNextAvailableNumber();
      if (next) {
        setInvoiceNumber(next);
        showToast(`Assigned next unused number: #${next}`, 'info');
      } else {
        showToast('All numbers between 1 and 1000 have been used!', 'error');
      }
    });

    els.btnRandomNumber.addEventListener('click', () => {
      const rnd = getRandomAvailableNumber();
      if (rnd) {
        setInvoiceNumber(rnd);
        showToast(`Assigned random unused number: #${rnd}`, 'info');
      } else {
        showToast('All numbers between 1 and 1000 have been used!', 'error');
      }
    });

    // Add Item Button
    els.btnAddItem.addEventListener('click', () => {
      createItemRow();
      calculateTotalsAndPreview();
    });

    // Quick Item Suggestion Chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const item = chip.getAttribute('data-item');
        const price = parseFloat(chip.getAttribute('data-price')) || 0;
        createItemRow({
          description: item,
          price: price,
          qty: 1,
          discount: 0
        });
        calculateTotalsAndPreview();
        showToast(`Added: ${item}`, 'info');
      });
    });

    // Save & Download Actions
    els.btnSaveInvoice.addEventListener('click', handleSaveInvoice);
    els.btnDownloadPDF.addEventListener('click', downloadInvoicePDF);
    els.btnDownloadPDF2.addEventListener('click', downloadInvoicePDF);
    els.btnPrintInvoice.addEventListener('click', () => {
      window.print();
    });

    // Form Reset & Sample Data
    els.btnResetForm.addEventListener('click', () => {
      if (confirm('Start a fresh new invoice? Current unsaved form fields will be reset.')) {
        resetFormForNewInvoice();
      }
    });
    els.btnQuickSample.addEventListener('click', fillSampleData);

    // History Modal
    els.btnOpenHistory.addEventListener('click', openHistoryModal);
    els.btnCloseHistory.addEventListener('click', closeHistoryModal);
    els.btnCloseModalBottom.addEventListener('click', closeHistoryModal);
    els.historyModal.addEventListener('click', (e) => {
      if (e.target === els.historyModal) closeHistoryModal();
    });

    // Modal Tabs
    els.tabInvoicesBtn.addEventListener('click', () => {
      els.tabInvoicesBtn.classList.add('active');
      els.tabNumbersBtn.classList.remove('active');
      els.tabInvoicesPane.classList.add('active');
      els.tabNumbersPane.classList.remove('active');
    });

    els.tabNumbersBtn.addEventListener('click', () => {
      els.tabNumbersBtn.classList.add('active');
      els.tabInvoicesBtn.classList.remove('active');
      els.tabNumbersPane.classList.add('active');
      els.tabInvoicesPane.classList.remove('active');
    });

    els.searchInvoices.addEventListener('input', () => {
      renderHistoryModal();
    });

    // Export JSON
    els.btnExportJSON.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.invoices, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `Palm_Resort_Invoices_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Reset All Numbers
    els.btnResetAllNumbers.addEventListener('click', () => {
      if (confirm('CAUTION: Are you sure you want to reset all used numbers? This will clear the used numbers registry.')) {
        state.usedNumbers = [];
        state.invoices = [];
        localStorage.removeItem(STORAGE_KEYS.USED_NUMBERS);
        localStorage.removeItem(STORAGE_KEYS.INVOICES);
        updateUsedNumbersUI();
        renderHistoryModal();
        showToast('All numbers and invoices have been reset.', 'info');
      }
    });

    // Zoom Controls
    els.btnZoomIn.addEventListener('click', () => applyZoom(0.1));
    els.btnZoomOut.addEventListener('click', () => applyZoom(-0.1));
    els.btnZoomReset.addEventListener('click', () => applyZoom(0));

    // Keyboard Shortcuts (Cmd+P or Ctrl+P triggers print)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });

    // Mobile Tab Nav Listeners
    if (els.btnTabEdit) {
      els.btnTabEdit.addEventListener('click', () => switchMobileView('edit'));
    }
    if (els.btnTabPreview) {
      els.btnTabPreview.addEventListener('click', () => switchMobileView('preview'));
    }
    if (els.btnMobileToggleView) {
      els.btnMobileToggleView.addEventListener('click', () => {
        switchMobileView(currentMobileView === 'edit' ? 'preview' : 'edit');
      });
    }
    if (els.btnMobileDownload) {
      els.btnMobileDownload.addEventListener('click', downloadInvoicePDF);
    }

    // Mobile Connect & QR Modal Listeners
    if (els.btnOpenMobileConnect) {
      els.btnOpenMobileConnect.addEventListener('click', () => {
        checkMobileNetworkInfo();
        if (els.mobileModal) els.mobileModal.classList.add('show');
      });
    }
    if (els.btnCloseMobileModal) {
      els.btnCloseMobileModal.addEventListener('click', () => {
        if (els.mobileModal) els.mobileModal.classList.remove('show');
      });
    }
    if (els.btnCloseMobileModalBottom) {
      els.btnCloseMobileModalBottom.addEventListener('click', () => {
        if (els.mobileModal) els.mobileModal.classList.remove('show');
      });
    }
    if (els.btnCopyMobileUrl && els.mobileUrlInput) {
      els.btnCopyMobileUrl.addEventListener('click', () => {
        els.mobileUrlInput.select();
        navigator.clipboard.writeText(els.mobileUrlInput.value).then(() => {
          showToast('Mobile URL copied to clipboard! 📋', 'success');
        }).catch(() => {
          showToast('Copied: ' + els.mobileUrlInput.value, 'info');
        });
      });
    }

    // Auto-scale on window resize / orientation change
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 992) {
        if (currentMobileView === 'preview') {
          autoScaleMobilePreview();
        }
      } else {
        document.body.classList.remove('view-edit', 'view-preview');
        els.invoicePaper.style.transform = `scale(${state.zoom})`;
        els.invoicePaperWrapper.style.minHeight = 'auto';
      }
    });
  }

  /**
   * Mobile Responsiveness & View Switching
   */
  let currentMobileView = 'edit';

  function switchMobileView(view) {
    currentMobileView = view;
    if (view === 'preview') {
      document.body.classList.remove('view-edit');
      document.body.classList.add('view-preview');
      if (els.btnTabPreview) els.btnTabPreview.classList.add('active');
      if (els.btnTabEdit) els.btnTabEdit.classList.remove('active');
      if (els.mToggleText) els.mToggleText.textContent = '✏️ Edit Form';
      setTimeout(autoScaleMobilePreview, 50);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.body.classList.remove('view-preview');
      document.body.classList.add('view-edit');
      if (els.btnTabEdit) els.btnTabEdit.classList.add('active');
      if (els.btnTabPreview) els.btnTabPreview.classList.remove('active');
      if (els.mToggleText) els.mToggleText.textContent = '👁️ Preview';
    }
  }

  function autoScaleMobilePreview() {
    if (window.innerWidth <= 992 && els.invoicePaper && els.invoicePaperWrapper) {
      const containerW = els.invoicePaperWrapper.clientWidth || (window.innerWidth - 24);
      const targetW = Math.max(280, containerW - 12);
      const scale = Math.min(1.0, targetW / 794);
      els.invoicePaper.style.transform = `scale(${scale})`;
      els.invoicePaper.style.transformOrigin = 'top center';
      if (els.zoomLevel) els.zoomLevel.textContent = `${Math.round(scale * 100)}%`;
      state.zoom = scale;
      
      const naturalH = els.invoicePaper.offsetHeight || 1040;
      els.invoicePaperWrapper.style.minHeight = `${Math.round(naturalH * scale) + 20}px`;
    }
  }

  async function checkMobileNetworkInfo() {
    try {
      const res = await fetch('/api/network-info', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.mobileUrl && els.mobileUrlInput) {
          els.mobileUrlInput.value = data.mobileUrl;
          if (els.mobileQrImg) {
            els.mobileQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data.mobileUrl)}`;
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }

  /**
   * Application Initialization
   */
  async function init() {
    await loadData();
    setupEventListeners();

    // Set initial date
    els.invoiceDate.value = new Date().toISOString().split('T')[0];

    // Pick first unused number (1-1000)
    const initialNum = getNextAvailableNumber() || 1;
    setInvoiceNumber(initialNum);

    // Initial item row
    createItemRow({
      description: 'Deluxe Cottage Stay (1 Night)',
      price: 3500,
      qty: 1,
      discount: 0
    });

    calculateTotalsAndPreview();

    // Check base64 logo & stamp
    if (window.PALM_RESORT_LOGO_BASE64) {
      if (els.invoiceSheetLogo) els.invoiceSheetLogo.src = window.PALM_RESORT_LOGO_BASE64;
      if (els.appNavLogo) els.appNavLogo.src = window.PALM_RESORT_LOGO_BASE64;
    }
    if (window.PALM_RESORT_STAMP_BASE64 && els.invoiceSheetStamp) {
      els.invoiceSheetStamp.src = window.PALM_RESORT_STAMP_BASE64;
    }

    // Initialize mobile view
    if (window.innerWidth <= 992) {
      switchMobileView('edit');
    }
    checkMobileNetworkInfo();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
