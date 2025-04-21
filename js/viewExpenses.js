// viewExpenses.js
// Loads Form Responses 6 CSV and filters by date range from user input

// --- Constants and Setup ---
const csvUrl = BUDGIE_CONFIG["VIEW_EXPENSES_CSV"];
const tableContainer = document.getElementById("tableContainer");
const totalsDiv = document.getElementById("totals");
const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  fetchAndDisplayExpenses(startDate, endDate);
});

async function fetchAndDisplayExpenses(startDate, endDate) {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const filteredRows = dataRows.filter(row => {
      const rowDate = new Date(row[1]); // Column B is 'Date'
      return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
    });

    renderTable(headers, filteredRows);
    displayTotal(filteredRows);
  } catch (err) {
    console.error("Error loading CSV:", err);
    tableContainer.innerHTML = "<p style='color:red;'>Failed to load data.</p>";
  }
}

function renderTable(headers, rows) {
  const table = document.createElement("table");
  table.classList.add("data-table");

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
  rows.forEach(row => {
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
}

function displayTotal(rows) {
  const total = rows.reduce((sum, row) => {
    const amount = parseFloat(row[2]); // Column C is 'Amount'
    return isNaN(amount) ? sum : sum + amount;
  }, 0);

  totalsDiv.textContent = `Total Amount: ₱${total.toFixed(2)}`;
}

function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/);
  return rows.map(line => line.split(","));
}
