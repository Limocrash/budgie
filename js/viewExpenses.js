// viewExpenses.js
// Version 0.1.11 - fetches and filters CSV data by date range, no JSON involved
// ⛔ TEMP INLINE CONFIG – for testing loading order
window.BUDGIE_CONFIG = {
  VIEW_EXPENSES_CSV: "https://docs.google.com/spreadsheets/d/1AStIoowJuZX2enGOCrvLwnG4F4Ypg9VK5NZp-oDE8yo/gviz/tq?tqx=out:csv&sheet=Form%20Responses%206"
};

// domContentLoaded event to ensure the DOM is fully loaded before executing the script
window.addEventListener("DOMContentLoaded", async () => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const tableContainer = document.getElementById("tableContainer");
  const totalsContainer = document.getElementById("totals");

  // Check if the config URL is set in the global config
  const configUrl = "https://docs.google.com/spreadsheets/d/1AStIoowJuZX2enGOCrvLwnG4F4Ypg9VK5NZp-oDE8yo/gviz/tq?tqx=out:csv&sheet=Form%20Responses%206";
  console.log("✅ Using hardcoded CSV URL:", configUrl);

  // Function to parse CSV text into a 2D array
  const parseCSV = (text) => {
    return text
      .trim()
      .split("\n")
      .map(line => line.split(",").map(cell => cell.replace(/^"|"$/g, "").trim()));
  };

  // Function to load and filter data from the CSV
  const loadData = async () => {
    try {
      const response = await fetch(configUrl);
      const csvText = await response.text();
      const data = parseCSV(csvText);

      const headers = data[0];
      const rows = data.slice(1);

      const dateCol = headers.findIndex(h => h.toLowerCase() === "date");
      const amountCol = headers.findIndex(h => h.toLowerCase() === "amount");

      if (dateCol === -1 || amountCol === -1) {
        tableContainer.innerHTML = "<p>Error: Missing 'Date' or 'Amount' column in CSV.</p>";
        return;
      }

      // Validate date inputs
      const start = new Date(startDateInput.value);
      const end = new Date(endDateInput.value);

      const filtered = rows.filter(row => {
        const date = new Date(row[dateCol]);
        return date >= start && date <= end;
      });

      // Create table headers
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

      // Create table body with filtered data
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

      const total = filtered.reduce((sum, row) => {
        const val = parseFloat(row[amountCol]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      // Display totals
      totalsContainer.innerHTML = `<strong>Total Amount:</strong> ₱${total.toLocaleString()}`;
    } catch (err) {
      console.error("❌ Error loading CSV:", err);
      tableContainer.innerHTML = `<p>Error loading data: ${err.message}</p>`;
    }
  };

  // Event listeners for date inputs and refresh button
  refreshBtn.addEventListener("click", loadData);

  const now = new Date();
  startDateInput.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  endDateInput.value = now.toISOString().split("T")[0];
  await loadData();
});
