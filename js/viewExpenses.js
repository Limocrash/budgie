// viewExpenses.js

// Loads and filters the published expenses CSV into a table

document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = BUDGIE_CONFIG["VIEW_EXPENSES_CSV"];
    const tableContainer = document.getElementById("tableContainer");
    const totalsContainer = document.getElementById("totals");
    const refreshButton = document.getElementById("refresh");
  
    refreshButton.addEventListener("click", loadAndFilterData);
    loadAndFilterData();
  
    async function loadAndFilterData() {
      const start = document.getElementById("startDate").value;
      const end = document.getElementById("endDate").value;
      const response = await fetch(csvUrl);
      const text = await response.text();
      const rows = parseCSV(text);
  
      const [header, ...data] = rows;
      const filtered = filterByDate(data, start, end);
  
      renderTable([header, ...filtered]);
      showTotals(filtered);
    }
  
    function parseCSV(text) {
      return text.trim().split("\n").map(row => row.split(","));
    }
  
    function filterByDate(rows, startDate, endDate) {
      if (!startDate || !endDate) return rows;
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      return rows.filter(row => {
        const rowDate = new Date(row[0]); // Assumes column 0 is the date
        return rowDate >= start && rowDate <= end;
      });
    }
  
    function renderTable(rows) {
      const table = document.createElement("table");
      table.innerHTML = "";
  
      rows.forEach((row, index) => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
          const td = document.createElement(index === 0 ? "th" : "td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
  
      tableContainer.innerHTML = "";
      tableContainer.appendChild(table);
    }
  
    function showTotals(rows) {
      const total = rows.reduce((sum, row) => sum + parseFloat(row[2] || 0), 0);
      totalsContainer.textContent = `Total: ₱${total.toFixed(2)}`;
    }
  });
  