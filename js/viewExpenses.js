// viewExpenses.js
// Fetches Google Sheets data via Visualization API and renders dynamic table with date filter
// Version 0.1.10.5 fixed fetch issue and confirmed event listener

window.addEventListener("DOMContentLoaded", async () => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const tableContainer = document.getElementById("tableContainer");
  const totalsContainer = document.getElementById("totals");

  const configUrl = window.BUDGIE_CONFIG?.VIEW_EXPENSES_CSV;
  console.log("✅ VIEW_EXPENSES_CSV URL:", configUrl);

  if (!configUrl) {
    tableContainer.textContent = "Missing VIEW_EXPENSES_CSV URL in Config.js";
    return;
  }

  const loadData = async () => {
    try {
      const response = await fetch(configUrl);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));

      const rows = json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
      const headers = json.table.cols.map(col => col.label || "");
      console.log("✅ Parsed headers:", headers);
      console.log("✅ Row count:", rows.length);

      const data = [headers, ...rows];

      // Get date range from input
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);

      const dateColIndex = headers.findIndex(h => h.toLowerCase() === "date");
      const amountColIndex = headers.findIndex(h => h.toLowerCase() === "amount");

      if (dateColIndex === -1 || amountColIndex === -1) {
        tableContainer.innerHTML = "<p>Error: Missing 'Date' or 'Amount' column.</p>";
        return;
      }

      const filtered = rows.filter(row => {
        const rowDate = new Date(row[dateColIndex]);
        return rowDate >= startDate && rowDate <= endDate;
      });

      // Render table
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      filtered.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableContainer.innerHTML = "";
      tableContainer.appendChild(table);

      // Calculate and display total amount
      const total = filtered.reduce((sum, row) => sum + (parseFloat(row[amountColIndex]) || 0), 0);
      totalsContainer.innerHTML = `<strong>Total Amount:</strong> ${total.toLocaleString(undefined, {
        style: 'currency', currency: 'PHP'
      })}`;
    } catch (err) {
      console.error("❌ Error loading CSV:", err);
      tableContainer.innerHTML = `<p>Error loading data: ${err.message}</p>`;
    }
  };

  refreshBtn.addEventListener("click", loadData);

  // Default to current month
  const now = new Date();
  startDateInput.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  endDateInput.value = now.toISOString().split("T")[0];

  // Load initial data
  await loadData();
});
