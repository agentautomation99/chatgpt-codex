const storageKey = "expense-tracker-items";
const budgetKey = "expense-tracker-budget";

const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const filter = document.getElementById("filter-category");
const totalSpentEl = document.getElementById("total-spent");
const monthSpentEl = document.getElementById("month-spent");
const remainingEl = document.getElementById("remaining");
const budgetInput = document.getElementById("budget-input");
const budgetStatus = document.getElementById("budget-status");

let expenses = load(storageKey, []);
let budget = Number(load(budgetKey, 0));

form.date.valueAsDate = new Date();

document.getElementById("save-budget").addEventListener("click", () => {
  budget = Number(budgetInput.value || 0);
  save(budgetKey, budget);
  render();
});

document.getElementById("clear-all").addEventListener("click", () => {
  if (!confirm("Delete all expenses?")) return;
  expenses = [];
  save(storageKey, expenses);
  render();
});

filter.addEventListener("change", render);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const expense = {
    id: crypto.randomUUID(),
    description: form.description.value.trim(),
    amount: Number(form.amount.value),
    category: form.category.value,
    date: form.date.value,
  };
  expenses.unshift(expense);
  save(storageKey, expenses);
  form.reset();
  form.date.valueAsDate = new Date();
  render();
});

function deleteExpense(id) {
  expenses = expenses.filter((item) => item.id !== id);
  save(storageKey, expenses);
  render();
}

function render() {
  const category = filter.value;
  const filtered = category === "All" ? expenses : expenses.filter((e) => e.category === category);

  list.innerHTML = "";
  filtered.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(item.description)}</strong>
        <div class="small">${item.category} • ${item.date}</div>
      </div>
      <strong>$${item.amount.toFixed(2)}</strong>
      <button class="danger" aria-label="Delete expense">Delete</button>
    `;
    li.querySelector("button").addEventListener("click", () => deleteExpense(item.id));
    list.appendChild(li);
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthTotal = expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - monthTotal;

  totalSpentEl.textContent = `$${total.toFixed(2)}`;
  monthSpentEl.textContent = `$${monthTotal.toFixed(2)}`;
  remainingEl.textContent = budget ? `$${remaining.toFixed(2)}` : "$0.00";
  budgetStatus.textContent = budget ? `Monthly budget: $${budget.toFixed(2)}` : "No budget set";
  budgetStatus.classList.toggle("over", budget > 0 && remaining < 0);
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
