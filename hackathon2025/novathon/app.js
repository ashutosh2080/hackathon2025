/* ──────────────────────────────────────────
   OCTOBOARD DASHBOARD — app.js
────────────────────────────────────────── */

// ── DATA ─────────────────────────────────────────

const TOP_CUSTOMERS = [
  { amount: 16180, delta: "+$16.18k" },
  { amount: 11460, delta: "+$11.46k" },
  { amount: 6920,  delta: "+1,595%"  },
  { amount: 6919,  delta: "+1,596%"  },
];

const TRANSACTIONS = [
  { source: "S", store: "OCTOBOARD", time: "2 days ago" },
  { source: "S", store: "OCTOBOARD", time: "2 days ago" },
];

// Bar chart data (new vs returning per day, Mar 04–31)
const LABELS = [
  "Mar 04","Mar 07","Mar 10","Mar 13","Mar 16",
  "Mar 19","Mar 22","Mar 25","Mar 28","Mar 31"
];
const NEW_DATA     = [38,12,52,18,60,22,45,14,55,20];
const RETURN_DATA  = [320,290,370,310,430,380,420,310,460,390];

// ── COUNTER ANIMATION ─────────────────────────────

function animateCount(el, target, prefix = "", suffix = "") {
  const duration = 1200;
  const start = performance.now();
  const isDecimal = target !== Math.floor(target);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    if (target >= 10000) {
      // format as $71.30k style
      const k = current / 1000;
      el.textContent = prefix + k.toFixed(2) + "k";
    } else if (target > 100) {
      el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
    } else {
      el.textContent = prefix + current.toFixed(2) + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
    else {
      if (target >= 10000) {
        el.textContent = prefix + (target / 1000).toFixed(2) + "k";
      } else if (target === 78745) {
        el.textContent = "$787.45";
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
  }
  requestAnimationFrame(update);
}

// ── INTERSECTION OBSERVER (ANIMATE ON SCROLL) ─────

function setupObserver() {
  const items = document.querySelectorAll("[data-animate]");
  items.forEach((el, i) => { el.style.setProperty("--i", i); });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // KPI counters
        entry.target.querySelectorAll(".kpi-value").forEach(valEl => {
          const raw = parseInt(valEl.getAttribute("data-count"));
          if (!raw) return;
          const prefix = valEl.classList.contains("dollar") ? "$" : "";
          animateCount(valEl, raw, prefix);
        });

        // Customer bars
        entry.target.querySelectorAll(".customer-bar").forEach(bar => {
          setTimeout(() => {
            bar.style.width = bar.getAttribute("data-w") + "%";
          }, 200);
        });
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

// ── BAR CHART ─────────────────────────────────────

function buildBarChart() {
  const ctx = document.getElementById("barChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: LABELS,
      datasets: [
        {
          label: "New Customers",
          data: NEW_DATA,
          backgroundColor: "#00c2a8",
          borderRadius: 3,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.75,
        },
        {
          label: "Returning Customers",
          data: RETURN_DATA,
          backgroundColor: "#0b1929",
          borderRadius: 3,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.75,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0b1929",
          titleFont: { family: "DM Sans", size: 12 },
          bodyFont: { family: "DM Mono", size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#8899aa",
            font: { family: "DM Sans", size: 11 },
          },
        },
        y: {
          stacked: false,
          grid: { color: "#f0f4f8", lineWidth: 1 },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: "#8899aa",
            font: { family: "DM Sans", size: 11 },
            maxTicksLimit: 5,
          },
        },
      },
    },
  });
}

// ── DONUT CHART ───────────────────────────────────

function buildDonutChart() {
  const ctx = document.getElementById("donutChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["New Customers", "Returning Customers"],
      datasets: [{
        data: [57, 456],
        backgroundColor: ["#00c2a8", "#0b1929"],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0b1929",
          titleFont: { family: "DM Sans", size: 12 },
          bodyFont: { family: "DM Mono", size: 12 },
          padding: 10,
          cornerRadius: 8,
        },
      },
    },
  });
}

// ── TOP CUSTOMERS TABLE ───────────────────────────

function buildCustomerList() {
  const container = document.getElementById("customerList");
  const max = Math.max(...TOP_CUSTOMERS.map(c => c.amount));

  TOP_CUSTOMERS.forEach((c, i) => {
    const pct = Math.round((c.amount / max) * 100);
    const amountStr = c.amount >= 1000
      ? "$" + (c.amount / 1000).toFixed(2) + "k"
      : "$" + c.amount.toFixed(2);

    const item = document.createElement("div");
    item.className = "customer-item";
    item.innerHTML = `
      <div class="customer-name">customer_${String(i + 1).padStart(3, "0")} xxxxxxxx</div>
      <div class="customer-bar-wrap">
        <div class="customer-bar-bg">
          <div class="customer-bar" data-w="${pct}" style="width:0%"></div>
        </div>
      </div>
      <div class="customer-amount">${amountStr}</div>
      <div class="customer-delta">${c.delta}</div>
    `;
    container.appendChild(item);
  });
}

// ── TRANSACTIONS TABLE ────────────────────────────

function buildTransactionsList() {
  const container = document.getElementById("txList");

  TRANSACTIONS.forEach(tx => {
    const row = document.createElement("div");
    row.className = "tx-row";
    row.innerHTML = `
      <div class="tx-source">
        <div class="tx-source-icon">${tx.source}</div>
      </div>
      <div class="tx-store">${tx.store}</div>
      <div class="tx-message"></div>
      <div class="tx-time">${tx.time}</div>
    `;
    container.appendChild(row);
  });
}

// ── SECTION HEADER FOR CUSTOMERS ROW ─────────────

function injectSectionBars() {
  const bottomRow = document.querySelector(".bottom-row");
  const bar = document.createElement("div");
  bar.className = "section-bar";
  bar.textContent = "Customers";
  bottomRow.parentNode.insertBefore(bar, bottomRow);
}

// ── INIT ──────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  buildCustomerList();
  buildTransactionsList();
  injectSectionBars();
  buildBarChart();
  buildDonutChart();
  setupObserver();
});
