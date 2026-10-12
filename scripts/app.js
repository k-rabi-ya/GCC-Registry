/* ============================================================
   GCC Registry — Main Application Logic
   ============================================================ */

// ---- Constants ----
const PAGE_SIZE = 15;

// ---- State ----
const state = {
  // Explorer
  search: '',
  filterCity: '',
  filterSector: '',
  filterCountry: '',
  yearFrom: '',
  yearTo: '',
  showVerified: true,
  showEstimated: true,
  sortKey: 'company-asc',
  currentPage: 1,
  // Compare
  selectedCities: [],
  activeMetric: 'gccCount',
  compareChartInstance: null,
  // Advisor
  selectedPriority: '',
};

// ---- City color palette ----
const CITY_COLORS = ['#0F1F3D', '#E85D27', '#0E6BAD', '#2D9E6F'];
const CITY_COLORS_LIGHT = ['rgba(15,31,61,0.15)', 'rgba(232,93,39,0.15)', 'rgba(14,107,173,0.15)', 'rgba(45,158,111,0.15)'];

// ============================================================
// NAV
// ============================================================
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });

  document.getElementById('nav-logo').addEventListener('click', e => {
    e.preventDefault();
    navigateTo('explorer');
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.hidden = true;
  });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  const btn = document.getElementById('nav-' + page);
  if (target) { target.hidden = false; target.classList.add('active'); }
  if (btn) btn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// EXPLORER
// ============================================================
function initExplorer() {
  // Populate filter dropdowns
  const citySelect = document.getElementById('filter-city');
  CITIES.forEach(c => citySelect.appendChild(opt(c, c)));

  const sectorSelect = document.getElementById('filter-sector');
  SECTORS.forEach(s => sectorSelect.appendChild(opt(s, s)));

  const countrySelect = document.getElementById('filter-country');
  COUNTRIES.forEach(c => countrySelect.appendChild(opt(c, c)));

  // Event listeners
  document.getElementById('search-input').addEventListener('input', e => {
    state.search = e.target.value.trim().toLowerCase();
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-city').addEventListener('change', e => {
    state.filterCity = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-sector').addEventListener('change', e => {
    state.filterSector = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-country').addEventListener('change', e => {
    state.filterCountry = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-year-from').addEventListener('input', e => {
    state.yearFrom = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-year-to').addEventListener('input', e => {
    state.yearTo = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-verified').addEventListener('change', e => {
    state.showVerified = e.target.checked;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('filter-estimated').addEventListener('change', e => {
    state.showEstimated = e.target.checked;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    state.sortKey = e.target.value;
    state.currentPage = 1;
    renderTable();
  });

  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  document.getElementById('total-count').textContent = GCC_DATA.length;

  renderTable();
}

function resetFilters() {
  state.search = '';
  state.filterCity = '';
  state.filterSector = '';
  state.filterCountry = '';
  state.yearFrom = '';
  state.yearTo = '';
  state.showVerified = true;
  state.showEstimated = true;
  state.currentPage = 1;

  document.getElementById('search-input').value = '';
  document.getElementById('filter-city').value = '';
  document.getElementById('filter-sector').value = '';
  document.getElementById('filter-country').value = '';
  document.getElementById('filter-year-from').value = '';
  document.getElementById('filter-year-to').value = '';
  document.getElementById('filter-verified').checked = true;
  document.getElementById('filter-estimated').checked = true;

  renderTable();
}

function getFilteredData() {
  return GCC_DATA.filter(row => {
    if (state.search && !row.company.toLowerCase().includes(state.search)) return false;
    if (state.filterCity && row.city !== state.filterCity) return false;
    if (state.filterSector && row.sector !== state.filterSector) return false;
    if (state.filterCountry && row.parentCountry !== state.filterCountry) return false;
    if (state.yearFrom && row.year < parseInt(state.yearFrom)) return false;
    if (state.yearTo && row.year > parseInt(state.yearTo)) return false;
    if (row.verified && !state.showVerified) return false;
    if (!row.verified && !state.showEstimated) return false;
    return true;
  });
}

function getSortedData(data) {
  const [key, dir] = state.sortKey.split('-');
  return [...data].sort((a, b) => {
    let av = a[key === 'company' ? 'company' : key];
    let bv = b[key === 'company' ? 'company' : key];
    if (typeof av === 'string') {
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return dir === 'asc' ? av - bv : bv - av;
  });
}

function renderTable() {
  const filtered = getFilteredData();
  const sorted = getSortedData(filtered);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const pageData = sorted.slice(start, start + PAGE_SIZE);

  const tbody = document.getElementById('gcc-tbody');
  const emptyState = document.getElementById('empty-state');
  const table = document.getElementById('gcc-table');

  tbody.innerHTML = '';

  if (pageData.length === 0) {
    table.hidden = true;
    emptyState.hidden = false;
  } else {
    table.hidden = false;
    emptyState.hidden = true;
    pageData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="company-name">${esc(row.company)}</span></td>
        <td>${esc(row.city)}</td>
        <td>${esc(row.state)}</td>
        <td><span class="sector-tag">${esc(row.sector)}</span></td>
        <td>${flagEmoji(row.parentCountry)} ${esc(row.parentCountry)}</td>
        <td>${row.year}</td>
        <td>${row.employees.toLocaleString()}</td>
        <td>
          <span class="badge ${row.verified ? 'badge-verified' : 'badge-estimated'}">
            ${row.verified ? 'Verified' : 'Estimated'}
          </span>
        </td>
        <td>
          <a class="source-link" href="${row.source}" target="_blank" rel="noopener" title="View source">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Source
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Update count
  document.getElementById('shown-count').textContent = total;

  // Pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const prevBtn = el('button', 'page-btn', '&#8592;');
  prevBtn.disabled = state.currentPage === 1;
  prevBtn.addEventListener('click', () => { state.currentPage--; renderTable(); });
  container.appendChild(prevBtn);

  let start = Math.max(1, state.currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  if (start > 1) {
    const btn = el('button', 'page-btn', '1');
    btn.addEventListener('click', () => { state.currentPage = 1; renderTable(); });
    container.appendChild(btn);
    if (start > 2) container.appendChild(el('span', 'page-ellipsis', '&hellip;'));
  }

  for (let i = start; i <= end; i++) {
    const btn = el('button', `page-btn${i === state.currentPage ? ' active' : ''}`, String(i));
    btn.addEventListener('click', (i => () => { state.currentPage = i; renderTable(); })(i));
    container.appendChild(btn);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) container.appendChild(el('span', 'page-ellipsis', '&hellip;'));
    const btn = el('button', 'page-btn', String(totalPages));
    btn.addEventListener('click', () => { state.currentPage = totalPages; renderTable(); });
    container.appendChild(btn);
  }

  const nextBtn = el('button', 'page-btn', '&#8594;');
  nextBtn.disabled = state.currentPage === totalPages;
  nextBtn.addEventListener('click', () => { state.currentPage++; renderTable(); });
  container.appendChild(nextBtn);
}

// ============================================================
// COMPARE
// ============================================================
function initCompare() {
  const select = document.getElementById('city-add-select');
  CITIES.forEach(c => select.appendChild(opt(c, c)));

  select.addEventListener('change', e => {
    const city = e.target.value;
    if (!city) return;
    if (!state.selectedCities.includes(city) && state.selectedCities.length < 4) {
      state.selectedCities.push(city);
      renderCompare();
    }
    select.value = '';
  });

  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeMetric = tab.dataset.metric;
      updateChart();
    });
  });

  renderCompare();
}

function renderCompare() {
  const chips = document.getElementById('city-chips');
  chips.innerHTML = '';
  state.selectedCities.forEach((city, i) => {
    const chip = document.createElement('div');
    chip.className = 'city-chip city-color-' + i;
    chip.innerHTML = `
      ${esc(city)}
      <button class="city-chip-remove" data-city="${esc(city)}" aria-label="Remove ${esc(city)}">&#215;</button>
    `;
    chip.querySelector('.city-chip-remove').addEventListener('click', () => {
      state.selectedCities = state.selectedCities.filter(c => c !== city);
      renderCompare();
    });
    chips.appendChild(chip);
  });

  // Update add-select options
  const select = document.getElementById('city-add-select');
  Array.from(select.options).forEach(o => {
    if (o.value) o.disabled = state.selectedCities.includes(o.value) || state.selectedCities.length >= 4;
  });

  const empty = document.getElementById('compare-empty');
  const grid = document.getElementById('compare-grid');
  const chartSection = document.getElementById('chart-section');

  if (state.selectedCities.length === 0) {
    empty.style.display = 'flex';
    grid.hidden = true;
    chartSection.hidden = true;
    return;
  }

  empty.style.display = 'none';
  grid.hidden = false;
  chartSection.hidden = false;

  // Responsive grid columns
  grid.style.gridTemplateColumns = `repeat(${Math.min(state.selectedCities.length, 2)}, 1fr)`;
  if (state.selectedCities.length > 2) grid.style.gridTemplateColumns = `repeat(${state.selectedCities.length}, 1fr)`;

  grid.innerHTML = '';
  state.selectedCities.forEach((city, i) => {
    const data = CITY_DATA[city];
    if (!data) return;
    const card = document.createElement('div');
    card.className = 'compare-card';
    card.style.borderTop = `3px solid ${CITY_COLORS[i]}`;

    const rentMid = Math.round((data.officeRent.min + data.officeRent.max) / 2);

    card.innerHTML = `
      <div class="compare-card-header">
        <div>
          <div class="compare-city-name">${esc(city)}</div>
          <div class="compare-city-state">${esc(data.state)}</div>
        </div>
        <div style="width:10px;height:10px;border-radius:50%;background:${CITY_COLORS[i]};box-shadow:0 0 0 3px ${CITY_COLORS_LIGHT[i]};"></div>
      </div>
      <div class="compare-card-body">
        <div class="compare-metric">
          <span class="metric-label">GCC Count</span>
          <span class="metric-value accent">${data.gccCount}+</span>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Office Rent</span>
          <div class="metric-value">
            <div>&#8377;${data.officeRent.min}&ndash;${data.officeRent.max}</div>
            <div style="font-size:10px;color:var(--text-light);font-weight:400">/sq.ft/month</div>
          </div>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Talent Score</span>
          <div>
            <div class="metric-value">${data.talentScore}/100</div>
            <div class="score-bar"><div class="score-bar-fill" style="width:${data.talentScore}%"></div></div>
          </div>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Cost Score</span>
          <div>
            <div class="metric-value">${data.costScore}/100</div>
            <div class="score-bar"><div class="score-bar-fill" style="width:${data.costScore}%"></div></div>
          </div>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Incentives</span>
          <div>
            <div class="metric-value">${data.incentiveScore}/100</div>
            <div class="score-bar"><div class="score-bar-fill" style="width:${data.incentiveScore}%"></div></div>
          </div>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Avg Salary (Mid)</span>
          <div class="metric-value">&#8377;${data.avgSalary.mid}L ${data.avgSalary.unit}</div>
        </div>
        <div class="compare-metric">
          <span class="metric-label">Infrastructure</span>
          <span class="metric-value">${data.infrastructure}</span>
        </div>
        <div class="compare-metric" style="align-items:flex-start">
          <span class="metric-label" style="white-space:nowrap;min-width:80px">Talent Pool</span>
          <span class="incentives-text">${data.talentDescription}</span>
        </div>
        <div class="compare-metric" style="align-items:flex-start">
          <span class="metric-label" style="white-space:nowrap;min-width:80px">Incentives</span>
          <span class="incentives-text">${data.stateIncentives}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  updateChart();
}

function updateChart() {
  const canvas = document.getElementById('compare-chart');
  const metric = state.activeMetric;

  const labels = state.selectedCities;
  const values = labels.map(city => {
    const d = CITY_DATA[city];
    if (!d) return 0;
    if (metric === 'officeRent') return Math.round((d.officeRent.min + d.officeRent.max) / 2);
    return d[metric] || 0;
  });

  const metricLabels = {
    gccCount: 'GCC Count',
    costScore: 'Cost Score (0-100)',
    talentScore: 'Talent Score (0-100)',
    incentiveScore: 'Incentives Score (0-100)',
    officeRent: 'Avg Office Rent (INR/sq.ft/month)'
  };

  if (state.compareChartInstance) {
    state.compareChartInstance.destroy();
  }

  state.compareChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: metricLabels[metric],
        data: values,
        backgroundColor: labels.map((_, i) => CITY_COLORS_LIGHT[i]),
        borderColor: labels.map((_, i) => CITY_COLORS[i]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F1F3D',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.8)',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6B7A99', font: { family: 'Inter', size: 13, weight: '600' } }
        },
        y: {
          grid: { color: '#EEF1F7' },
          ticks: { color: '#6B7A99', font: { family: 'Inter', size: 12 } },
          beginAtZero: true,
        }
      }
    }
  });
}

// ============================================================
// SETUP ADVISOR
// ============================================================
function initAdvisor() {
  const sectorSelect = document.getElementById('adv-sector');
  SECTORS.forEach(s => sectorSelect.appendChild(opt(s, s)));

  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedPriority = btn.dataset.priority;
    });
  });

  document.getElementById('advisor-form').addEventListener('submit', e => {
    e.preventDefault();
    runAdvisor();
  });

  document.getElementById('advisor-reset').addEventListener('click', () => {
    document.getElementById('advisor-form').reset();
    state.selectedPriority = '';
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('advisor-results').hidden = true;
  });
}

function runAdvisor() {
  const sector = document.getElementById('adv-sector').value;
  const headcount = document.getElementById('adv-headcount').value;
  const budget = document.getElementById('adv-budget').value;
  const priority = state.selectedPriority;

  if (!sector || !headcount || !budget || !priority) {
    alert('Please fill in all required fields and select a priority.');
    return;
  }

  // Scoring weights based on priority
  const weights = getWeights(priority, headcount, budget);

  // Score each city
  const scored = CITIES.map(city => {
    const d = CITY_DATA[city];
    if (!d) return null;

    // Sector bonus — does city have significant presence in this sector?
    const sectorPresence = GCC_DATA.filter(g => g.city === city && g.sector === sector).length;
    const sectorBonus = Math.min(sectorPresence * 5, 20);

    // Headcount suitability
    let headcountBonus = 0;
    if (headcount === 'xlarge' && d.talentScore >= 80) headcountBonus = 10;
    if (headcount === 'small' && d.speedScore >= 70) headcountBonus = 8;

    // Budget suitability
    let budgetBonus = 0;
    if (budget === 'lean' && d.costScore >= 80) budgetBonus = 15;
    if (budget === 'premium' && d.infrastructure === 'Excellent') budgetBonus = 8;

    const raw =
      weights.cost     * d.costScore +
      weights.talent   * d.talentScore +
      weights.incentive * d.incentiveScore +
      weights.speed    * d.speedScore +
      sectorBonus + headcountBonus + budgetBonus;

    return {
      city,
      score: Math.round(raw),
      costScore: d.costScore,
      talentScore: d.talentScore,
      incentiveScore: d.incentiveScore,
      speedScore: d.speedScore,
      sectorPresence,
      data: d,
    };
  }).filter(Boolean).sort((a, b) => b.score - a.score);

  renderAdvisorResults(scored.slice(0, 3), weights, priority, sector, headcount, budget);
}

function getWeights(priority, headcount, budget) {
  const base = { cost: 0.25, talent: 0.30, incentive: 0.25, speed: 0.20 };

  if (priority === 'cost') {
    return { cost: 0.45, talent: 0.20, incentive: 0.25, speed: 0.10 };
  } else if (priority === 'talent') {
    return { cost: 0.15, talent: 0.50, incentive: 0.20, speed: 0.15 };
  } else if (priority === 'speed') {
    return { cost: 0.15, talent: 0.25, incentive: 0.20, speed: 0.40 };
  }
  return base;
}

const RANK_LABELS = ['Gold', 'Silver', 'Bronze'];
const RANK_CLASSES = ['result-card--gold', 'result-card--silver', 'result-card--bronze'];

function renderAdvisorResults(top3, weights, priority, sector, headcount, budget) {
  const resultsEl = document.getElementById('advisor-results');
  const cardsEl = document.getElementById('result-cards');
  const formulaEl = document.getElementById('scoring-formula');

  cardsEl.innerHTML = '';

  top3.forEach((result, i) => {
    const d = result.data;
    const card = document.createElement('div');
    card.className = `result-card ${RANK_CLASSES[i]}`;

    const reasoning = buildReasoning(result, sector, headcount, budget, priority, i);

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-rank-badge">
          <span class="rank-number">${i + 1}</span>
          <div>
            <div class="result-city-name">${esc(result.city)}</div>
            <div class="result-city-state">${esc(d.state)}</div>
          </div>
        </div>
        <div class="result-total-score">
          <div class="score-number">${result.score}</div>
          <div class="score-label">Score</div>
        </div>
      </div>
      <div class="result-card-body">
        <div class="result-score-bars">
          <div class="score-bar-item">
            <div class="score-bar-label">Cost</div>
            <div class="score-bar-value">${result.costScore}</div>
            <div class="score-bar-track"><div class="fill fill-cost" style="width:${result.costScore}%"></div></div>
          </div>
          <div class="score-bar-item">
            <div class="score-bar-label">Talent</div>
            <div class="score-bar-value">${result.talentScore}</div>
            <div class="score-bar-track"><div class="fill fill-talent" style="width:${result.talentScore}%"></div></div>
          </div>
          <div class="score-bar-item">
            <div class="score-bar-label">Incentives</div>
            <div class="score-bar-value">${result.incentiveScore}</div>
            <div class="score-bar-track"><div class="fill fill-incentive" style="width:${result.incentiveScore}%"></div></div>
          </div>
          <div class="score-bar-item">
            <div class="score-bar-label">Speed</div>
            <div class="score-bar-value">${result.speedScore}</div>
            <div class="score-bar-track"><div class="fill fill-speed" style="width:${result.speedScore}%"></div></div>
          </div>
        </div>
        <div class="result-reasoning">${reasoning}</div>
        <div class="result-stats">
          <span class="result-stat">&#8377;${d.officeRent.min}&ndash;${d.officeRent.max}/sq.ft/month</span>
          <span class="result-stat"><strong>${d.gccCount}+</strong> existing GCCs</span>
          <span class="result-stat"><strong>${result.sectorPresence}</strong> ${esc(sector)} GCCs</span>
          <span class="result-stat">${d.connectivity}</span>
        </div>
      </div>
    `;
    cardsEl.appendChild(card);
  });

  // Formula box
  const pctCost = Math.round(weights.cost * 100);
  const pctTalent = Math.round(weights.talent * 100);
  const pctIncentive = Math.round(weights.incentive * 100);
  const pctSpeed = Math.round(weights.speed * 100);

  formulaEl.innerHTML = `
    <div class="formula-title">Scoring Formula (Priority: ${esc(priority.charAt(0).toUpperCase() + priority.slice(1))})</div>
    <div class="formula-grid">
      <div class="formula-item">
        <span class="formula-dot legend-cost"></span>
        <span class="formula-desc">Cost Score (affordability, rent, salaries)</span>
        <span class="formula-weight">${pctCost}%</span>
      </div>
      <div class="formula-item">
        <span class="formula-dot legend-talent"></span>
        <span class="formula-desc">Talent Score (pool size, universities, skills)</span>
        <span class="formula-weight">${pctTalent}%</span>
      </div>
      <div class="formula-item">
        <span class="formula-dot legend-incentive"></span>
        <span class="formula-desc">Incentives (state subsidies, tax benefits, SEZs)</span>
        <span class="formula-weight">${pctIncentive}%</span>
      </div>
      <div class="formula-item">
        <span class="formula-dot legend-speed"></span>
        <span class="formula-desc">Speed (GCC ecosystem maturity, infra, ease of setup)</span>
        <span class="formula-weight">${pctSpeed}%</span>
      </div>
    </div>
    <div style="margin-top:12px;font-size:12px;color:var(--text-light)">
      Sources: NASSCOM GCC Report 2024, Invest India, JLL India Office Market 2024, State IT Department websites.
      Scores are model-generated estimates and should be validated with advisors.
    </div>
  `;

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildReasoning(result, sector, headcount, budget, priority, rank) {
  const d = result.data;
  const city = result.city;

  const budgetMap = { lean: 'lean budget', moderate: 'moderate budget', standard: 'standard budget', premium: 'premium budget' };
  const hcMap = { small: '1-100 employees', medium: '101-500 employees', large: '501-2,000 employees', xlarge: '2,000+ employees' };
  const prioMap = { cost: 'cost optimization', talent: 'talent access', speed: 'speed of setup' };

  let reasoning = `<strong>${city}</strong> is an excellent choice for your <strong>${sector}</strong> GCC targeting <strong>${hcMap[headcount]}</strong> with focus on <strong>${prioMap[priority]}</strong>. `;

  if (result.sectorPresence >= 3) {
    reasoning += `The city already hosts <strong>${result.sectorPresence} ${sector} GCCs</strong>, demonstrating a mature ecosystem with regulatory familiarity. `;
  } else if (result.sectorPresence >= 1) {
    reasoning += `With <strong>${result.sectorPresence} existing ${sector} GCC(s)</strong>, you'll find a growing but competitive talent market in this space. `;
  } else {
    reasoning += `As an early mover in <strong>${sector}</strong> here, you'll face less competition for talent. `;
  }

  if (priority === 'cost') {
    reasoning += `At &#8377;${d.officeRent.min}&ndash;${d.officeRent.max}/sq.ft/month, real estate costs are significantly lower than Tier-1 metros. Mid-level salaries average &#8377;${d.avgSalary.mid}L per annum. `;
  } else if (priority === 'talent') {
    reasoning += `With a talent score of <strong>${d.talentScore}/100</strong> — ${d.talentDescription.split('.')[0].toLowerCase()}. `;
  } else if (priority === 'speed') {
    reasoning += `${city}'s mature GCC ecosystem (${d.gccCount}+ active centres) means established vendors, legal frameworks, and recruitment pipelines that accelerate your setup timeline. `;
  }

  const incentiveHighlight = d.stateIncentives.split('.')[0];
  reasoning += `State incentives include: <em>${incentiveHighlight}</em>.`;

  return reasoning;
}

// ============================================================
// UTILS
// ============================================================
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function opt(value, label) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = label;
  return o;
}

function el(tag, className, html) {
  const e = document.createElement(tag);
  e.className = className;
  e.innerHTML = html;
  return e;
}

function flagEmoji(country) {
  const flags = {
    'USA': '&#x1F1FA;&#x1F1F8;',
    'UK': '&#x1F1EC;&#x1F1E7;',
    'Germany': '&#x1F1E9;&#x1F1EA;',
    'France': '&#x1F1EB;&#x1F1F7;',
    'Switzerland': '&#x1F1E8;&#x1F1ED;',
    'Netherlands': '&#x1F1F3;&#x1F1F1;',
    'Ireland': '&#x1F1EE;&#x1F1EA;',
    'South Korea': '&#x1F1F0;&#x1F1F7;',
    'Finland': '&#x1F1EB;&#x1F1EE;',
    'UAE': '&#x1F1E6;&#x1F1EA;',
    'India': '&#x1F1EE;&#x1F1F3;',
  };
  return flags[country] || '&#x1F30D;';
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initExplorer();
  initCompare();
  initAdvisor();
});
