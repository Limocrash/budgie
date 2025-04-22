// viewExpenses.js
// Version 0.1.11.2 - adds default date values and ensures Refresh triggers reload
// ⛔ TEMP INLINE CONFIG – for testing loading order
window.BUDGIE_CONFIG = {
  VIEW_EXPENSES_CSV: "https://docs.google.com/spreadsheets/d/1AStIoowJuZX2enGOCrvLwnG4F4Ypg9VK5NZp-oDE8yo/gviz/tq?tqx=out:csv&sheet=Form%20Responses%206"
};

// DOMContentLoaded event to ensure the DOM is fully loaded before executing the script
// This is important to ensure that all elements are available for manipulation
// and that the script runs after the HTML is fully parsed.
// The script uses async/await for handling asynchronous operations and includes error handling for network requests.
window.addEventListener("DOMContentLoaded", async () => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const refreshBtn = document.getElementById("refreshBtn");
  const tableContainer = document.getElementById("tableContainer");
  const totalsContainer = document.getElementById("totals");

  
  // Check if the required elements are present in the DOM
  // before proceeding with the script execution.
  const configUrl = window.BUDGIE_CONFIG.VIEW_EXPENSES_CSV;
  console.log("✅ Using CSV URL:", configUrl);

  // Function to parse CSV text into a 2D array
  const parseCSV = (text) => {
    return text
      .trim()
      .split("\n")
      .map(line => line.split(",").map(cell => cell.replace(/^"|"$/g, "").trim()));
  };

  // Subfunction to load data from the CSV file and display it in a table
  // It fetches the CSV file, parses it, filters the data based on the selected date range,
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

      //
      const start = new Date(startDateInput.value);
      const end = new Date(endDateInput.value);

      const filtered = rows.filter(row => {
        const date = new Date(row[dateCol]);
        return date >= start && date <= end;
      });

      // Create a table element and populate it with the filtered data
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

      // Create the table body and populate it with the filtered data
      // Use the filtered data to create table rows and cells
      // Alternate row colors for better readability
      const tbody = document.createElement("tbody");
      filtered.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.className = index % 2 === 0 ? "even" : "odd";
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      // Clear the previous table and append the new one
      tableContainer.innerHTML = "";
      tableContainer.appendChild(table);

      // Calculate the total amount from the filtered data  
      // Use innerHTML to display the total amount in the totals container
      const total = filtered.reduce((sum, row) => {
        const val = parseFloat(row[amountCol]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      totalsContainer.innerHTML = `<strong>Total Amount:</strong> ₱${total.toLocaleString()}`;
    } catch (err) {
      console.error("❌ Error loading CSV:", err);
      tableContainer.innerHTML = `<p>Error loading data: ${err.message}</p>`;
    }
  };

  // Event listeners for date inputs and refresh button
  refreshBtn.addEventListener("click", () => {
    console.log("🔁 Refresh clicked with dates:", startDateInput.value, endDateInput.value);
    loadData();
  });

  // Set default date values to the first day of the current month and today
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startDateInput.value = firstOfMonth.toISOString().split("T")[0];
  endDateInput.value = now.toISOString().split("T")[0];
  await loadData();
});
