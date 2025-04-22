// viewExpenses.js
// Fetches and displays filtered CSV data from the Budgie-configured sheet
// Version 0.1.10.3 - Fully self-contained with inline debugging

// Wait until DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const csvUrl = BUDGIE_CONFIG.VIEW_EXPENSES_CSV;
  if (!csvUrl) {
    console.error("❌ VIEW_EXPENSES_CSV not found in Config.js");
    return;
  }

  console.log("✅ VIEW_EXPENSES_CSV URL:", csvUrl);

  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const tableContainer = document.getElementById("tableContainer");
  const totalsContainer = document.getElementById("totals");

  refreshBtn.addEventListener("click", async () => {
    const startDate = startInput.value;
    const endDate = endInput.value;
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    try {
      const response = await fetch(csvUrl);
      const raw = await response.text();
      const rows = raw.split("\n").map(row => row.split(","));

      // Clean header
      let headers = rows.find(r => r.includes("Date") && r.includes("Amount"));
      if (!headers) throw new Error("Header row not found.");

      const dataStartIndex = rows.findIndex(r => r === headers) + 1;
      const filtered = rows.slice(dataStartIndex).filter(r => {
        const dateStr = r[0]?.trim();
        if (!dateStr) return false;
        const rowDate = new Date(dateStr);
        return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
      });

      renderTable([headers, ...filtered]);
    } catch (err) {
      console.error("❌ Error loading CSV:", err);
    }
  });

  function renderTable(data) {
    tableContainer.innerHTML = "";
    if (!data.length) {
      tableContainer.textContent = "No results for the selected date range.";
      return;
    }
    const table = document.createElement("table");
    table.classList.add("expense-table");

    const thead = table.createTHead();
    const headRow = thead.insertRow();
    data[0].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    });

    const tbody = table.createTBody();
    let total = 0;
    data.slice(1).forEach(row => {
      const tr = tbody.insertRow();
      row.forEach((cell, idx) => {
        const td = tr.insertCell();
        td.textContent = cell;
        if (idx === 1) {
          const amt = parseFloat(cell.replace(/[^\d.\-]/g, ""));
          if (!isNaN(amt)) total += amt;
        }
      });
    });

    tableContainer.appendChild(table);
    totalsContainer.innerHTML = `<strong>Total:</strong> ₱${total.toFixed(2)}`;
  }
});
