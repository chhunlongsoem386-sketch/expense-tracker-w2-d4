const sampleTransactions = [
  { id: 1, note: "Salary", category: "Income", type: "income", amountCents: 30000 },
  { id: 2, note: "Lunch", category: "Food", type: "expense", amountCents: 450 },
  { id: 3, note: "Bus", category: "Transport", type: "expense", amountCents: 150 },
  { id: 4, note: "Notebook", category: "Study", type: "expense", amountCents: 300 },
];
// Start with an empty list; fetch() will load the data later.
let transactions = [];

function formatMoney(cents) {
  const sign = cents < 0 ? "-" : "";
  return sign + "$" + (Math.abs(cents) / 100).toFixed(2);
}

function totalCents(list) {
  return list.reduce((sum, tx) => sum + tx.amountCents, 0);
}

function filterByCategory(list, category) {
  return list.filter((tx) => tx.category === category);
}

function filterByType(list, type) {
  return list.filter((tx) => tx.type === type);
}

function summarize(list) {
  const incomeCents = totalCents(filterByType(list, "income"));
  const expensesCents = totalCents(filterByType(list, "expense"));
  return {
    incomeCents: incomeCents,
    expensesCents: expensesCents,
    balanceCents: incomeCents - expensesCents,
  };
}

function addTransaction(list, tx) {
  return [...list, tx];
}

// Practice 2 — the AI's totalExpenses, reviewed and fixed:
// whole cents, no off-by-one loop, no duplicated work.
function totalExpenses(list) {
  return totalCents(filterByType(list, "expense"));
}

const notes = sampleTransactions.map((tx) => tx.note);

// Update the summary cards using transaction data
function render() {
    const summary = summarize(transactions);

    document.querySelector("#balance-amount").textContent =
        formatMoney(summary.balanceCents);

    document.querySelector("#income-amount").textContent =
        formatMoney(summary.incomeCents);

    document.querySelector("#expense-amount").textContent =
        formatMoney(summary.expensesCents);
        renderTransactions(transactions);
}


// Listen for the expense form submission
const formEl = document.querySelector("#expense-form");

const messageEl = document.querySelector("#form-message");

formEl.addEventListener("submit", (event) => {
    // Stop the browser from reloading
    event.preventDefault();

    // Get the values entered by the user
    const note = document.querySelector("#note").value.trim();

    const amount = document.querySelector("#amount").value;

    const category = document.querySelector("#category").value;

    // Convert dollars into whole cents
    const amountCents = Math.round(Number(amount) * 100);

    // Clear previous error messages
    messageEl.textContent = "";

    // Check if the note is empty
    if (note === "") {
        messageEl.textContent = "Please enter a note.";
        return;
    }

    // Check if the amount is valid
    if (amount.trim() === "" || !Number.isFinite(amountCents) || amountCents <= 0) {
        messageEl.textContent = "Please enter an amount greater than zero.";
        return;
    }

    // Create a new expense transaction
    const newTransaction = {
        id: Date.now(),
        note: note,
        category: category,
        type: "expense",
        amountCents: amountCents
    };

    // Add the transaction to our data
    transactions = addTransaction(transactions, newTransaction);

    // Update the webpage
    render();

    // Clear the form
    formEl.reset();
});

// Display transactions on the webpage
function renderTransactions(list) {
    const listEl = document.querySelector("#transaction-list");

    // Clear the old list
    listEl.replaceChildren();

    // Create one row for each transaction
    for (const tx of list) {
    // Create the transaction row
    const li = document.createElement("li");
    li.className = "mb-2 flex flex-col gap-1 border-2 border-black bg-white px-4 py-3 sm:flex-row sm:justify-between sm:gap-3";

    // Display transaction name
    const note = document.createElement("span");
    note.className = "flex-1 font-semibold";
    note.textContent = tx.note;

    // Display category
    const category = document.createElement("span");
    category.className = "text-neutral-600";
    category.textContent = tx.category;

    // Display amount
    const amount = document.createElement("span");
    amount.className = tx.type === "income"
        ? "font-bold text-green-700"
        : "font-bold text-red-600";

    amount.textContent =
        (tx.type === "income" ? "+" : "-") +
        formatMoney(tx.amountCents);

    // Add everything to the row
    li.append(note, category, amount);

    // Add the row to the webpage
    listEl.append(li);
}
}

// ----- Checks -----
function check(name, actual, expected) {
  const ok = actual === expected;
  console.log(ok ? "✓" : "✗", name, ok ? "" : `(expected ${expected}, got ${actual})`);
}

check("format 450", formatMoney(450), "$4.50");
check("total", totalCents(sampleTransactions), 30900);
check("Food count", filterByCategory(sampleTransactions, "Food").length, 1);
check("expense count", filterByType(sampleTransactions, "expense").length, 3);
check("balance", summarize(sampleTransactions).balanceCents, 29100);
check(
  "new length",
  addTransaction(sampleTransactions, { id: 5, note: "Coffee", category: "Food", type: "expense", amountCents: 250 }).length,
  5
);
check("notes", notes.join(","), "Salary,Lunch,Bus,Notebook");
check("total expenses", totalExpenses(sampleTransactions), 900);

// Edge cases
check("total of empty list", totalCents([]), 0);
check("total expenses of empty list", totalExpenses([]), 0);
check("original list not changed", sampleTransactions.length, 4); // after addTransaction

// Load transaction data from the JSON file
async function loadTransactions() {
    const response = await fetch("transactions.json");

    if (!response.ok) {
        throw new Error("Failed to load transactions");
    }

    return await response.json();
}

// Load JSON data and display it on the webpage
async function start() {
    try {
        transactions = await loadTransactions();
        render();
    } catch (error) {
        messageEl.textContent = error.message;
    }
}

start();