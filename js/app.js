// js/app.js

document.addEventListener("DOMContentLoaded", () => {
    renderLinks();
    setupControls();
    // initial load
    loadExpenses();
  });
  
  function renderLinks() {
    const linkMap = {
      FORM_EXPENSE_ID:   "Quick Expense Entry",
      FORM_LOAN_EXISTING_ID: "New Loan – Existing Borrower",
      FORM_LOAN_NEW_ID:       "New Loan – New Borrower",
      FORM_REPAYMENT_ID:      "Loan Repayment",
      SCRIPT_WEBAPP_URL:      "View Dashboard"
    };

    const staticlinks = {
        "View Selected Entries": "viewExpenses.html"
    };

    const container = document.getElementById("linkContainer");
  
    Object.entries(linkMap).forEach(([key, label]) => {
      const url = BUDGIE_CONFIG[key];
      if (url && url.startsWith("http")) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.textContent = label;
        a.className = "link-tile";
        container.appendChild(a);
      }
    });
  }
  
  function setupControls() {
    document.getElementById("refresh").addEventListener("click", loadExpenses);
  }
  
  async function loadExpenses() {
    const from = document.getElementById("startDate").value;
    const to   = document.getElementById("endDate").value;
    // build query params for published CSV (sheet must be published)
    const baseURL = BUDGIE_CONFIG.VIEW_EXPENSES;
    let url = baseURL + "&single=true&gid=439769693"; // adjust gid if needed
    if (from && to) {
      // CSV export with filter via Google Visualization API
      // (Requires your sheet to be published to web)
      url = `${baseURL}&tqx=out:csv&sheet=ExpensesView&range=A2:D` +
            `&query=select%20A,B,C,D%20where%20A%20>=%20date%20'${from}'%20` +
            `and%20A%20<=%20date%20'${to}'%20order%20by%20A%20desc`;
    }
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      renderTable(text);
    } catch (e) {
      document.getElementById("tableContainer").textContent = "Error loading data";
      console.error(e);
    }
  }
  
  function renderTable(csv) {
    const rows = csv.trim().split("\n").map(r => r.split(","));
    // build HTML table
    let html = "<table><thead><tr>";
    rows[0].forEach(h => html += `<th>${h}</th>`);
    html += "</tr></thead><tbody>";
    let total = 0;
    rows.slice(1).forEach(r => {
      html += "<tr>";
      r.forEach((cell, i) => {
        html += `<td>${cell}</td>`;
        // assume amount in column 1
        if (i === 1) total += parseFloat(cell) || 0;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    document.getElementById("tableContainer").innerHTML = html;
    document.getElementById("totals").textContent = `Total: ${total.toLocaleString()}`;
  }
  