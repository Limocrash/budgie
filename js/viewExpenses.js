// viewExpenses.js
// Version 0.1.11.3d - adds row numbers, clickable receipt links, preps for mobile-responsive layout
// ⛔ TEMP INLINE CONFIG – for testing loading order
window.BUDGIE_CONFIG = {
  VIEW_EXPENSES_CSV: "https://docs.google.com/spreadsheets/d/1AStIoowJuZX2enGOCrvLwnG4F4Ypg9VK5NZp-oDE8yo/gviz/tq?tqx=out:csv&sheet=Form%20Responses%206"
};

window.addEventListener("DOMContentLoaded", async () => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const tableContainer = document.getElementById("tableContainer");
  const totalsContainer = document.getElementById("totals");

  const configUrl = window.BUDGIE_CONFIG.VIEW_EXPENSES_CSV;
  console.log("✅ Using CSV URL:", configUrl);

  const parseCSV = (text) => {
    return text
      .trim()
      .split("\n")
      .map(line => line.split(",").map(cell => cell.replace(/^"|"$/g, "").trim()));
  };

  const loadData = async () => {
    try {
      const response = await fetch(configUrl);
      const csvText = await response.text();
      const data = parseCSV(csvText);

      const headers = ["#", ...data[0]]; // Add row number column
      const rows = data.slice(1);

      const dateCol = headers.findIndex(h => h.toLowerCase() === "date");
      const amountCol = headers.findIndex(h => h.toLowerCase() === "amount");
      const photoCol = headers.findIndex(h => h.toLowerCase().includes("photo"));

      if (dateCol === -1 || amountCol === -1) {
        tableContainer.innerHTML = "<p>Error: Missing 'Date' or 'Amount' column in CSV.</p>";
        return;
      }

      const start = new Date(startDateInput.value);
      const end = new Date(endDateInput.value);

      const filtered = rows.filter(row => {
        const date = new Date(row[dateCol - 1]); // Adjusted for row number offset
        return date >= start && date <= end;
      });

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      filtered.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.className = index % 2 === 0 ? "even" : "odd";

        const rowNum = document.createElement("td");
        rowNum.textContent = index + 1;
        tr.appendChild(rowNum);

        row.forEach((cell, colIndex) => {
          const td = document.createElement("td");
          if (colIndex === photoCol - 1 && cell.startsWith("http")) {
            const link = document.createElement("a");
            link.href = cell;
            link.textContent = "View Photo";
            link.target = "_blank";
            td.appendChild(link);
          } else {
            td.textContent = cell;
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableContainer.innerHTML = "";
      tableContainer.appendChild(table);

      const total = filtered.reduce((sum, row) => {
        const val = parseFloat(row[amountCol - 1]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      totalsContainer.innerHTML = `<strong>Total Amount:</strong> ₱${total.toLocaleString()}`;
    } catch (err) {
      console.error("❌ Error loading CSV:", err);
      tableContainer.innerHTML = `<p>Error loading data: ${err.message}</p>`;
    }
  };

  refreshBtn.addEventListener("click", () => {
    console.log("🔁 Refresh clicked with dates:", startDateInput.value, endDateInput.value);
    loadData();
  });

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startDateInput.value = firstOfMonth.toISOString().split("T")[0];
  endDateInput.value = now.toISOString().split("T")[0];
  await loadData();
});
