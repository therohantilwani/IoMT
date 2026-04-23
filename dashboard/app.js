// Configuration and State
const state = {
  traffic: 1420500,
  blocked: 450,
  threats: 4,
  alerts: []
};

const attackTypes = [
  { name: 'ARP_Spoofing', severity: 'warning', prob: 0.2 },
  { name: 'TCP_IP-DoS-ICMP1', severity: 'critical', prob: 0.35 },
  { name: 'MQTT-DDoS-Connect-Flood', severity: 'critical', prob: 0.25 },
  { name: 'Recon-Port_Scan', severity: 'warning', prob: 0.2 }
];

const distribution = {
  'TCP_IP-DoS-ICMP1': 420,
  'MQTT-DDoS-Connect-Flood': 285,
  'Recon-Port_Scan': 140,
  'ARP_Spoofing': 90
};

// Utilities
const formatNum = num => num.toLocaleString();

const generateId = () => 'evt_' + Math.floor(Math.random() * 90000 + 10000);

const getRandomAttack = () => {
  const rand = Math.random();
  let cumulative = 0;
  for(let type of attackTypes) {
    cumulative += type.prob;
    if(rand <= cumulative) return type;
  }
  return attackTypes[0];
};

const getTimeString = (date = new Date()) => {
  return date.toISOString().split('T')[1].substring(0, 12) + 'Z';
};

// DOM Functions
function initDistributionChart() {
  const container = document.getElementById('chart-container');
  container.innerHTML = '';
  
  const total = Object.values(distribution).reduce((a,b) => a+b, 0);
  
  const colors = ['danger', 'purple', 'warning', 'accent'];
  let colorIdx = 0;

  Object.entries(distribution).sort((a,b) => b[1] - a[1]).forEach(([key, val]) => {
    const percent = Math.round((val / total) * 100);
    const colorClass = colors[colorIdx++ % colors.length];
    
    container.innerHTML += `
      <div class="bar-row">
        <div class="bar-labels">
          <span>${key}</span>
          <span>${formatNum(val)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${colorClass == 'accent' ? '' : colorClass}" style="width: 0%" data-target="${percent}%"></div>
        </div>
      </div>
    `;
  });

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.getAttribute('data-target');
    });
  }, 100);
}

function initPositiveCharts() {
  const container = document.getElementById('positive-charts-container');
  if(!container) return;
  
  const safeTraffic = state.traffic - state.blocked;
  const safePercent = ((safeTraffic / state.traffic) * 100).toFixed(3);
  
  container.innerHTML = `
    <div class="positive-metric">
      <div class="positive-metric-info">
        <h3>Safe Traffic Routed</h3>
        <p>Allowed Benign Packets</p>
      </div>
      <div class="positive-metric-value" id="pos-safe">
        ${safePercent}%
      </div>
    </div>
    <div class="positive-metric blue">
      <div class="positive-metric-info">
        <h3>True Positive Rate</h3>
        <p>Verified Accuracy (IoMT)</p>
      </div>
      <div class="positive-metric-value">
        98.48%
      </div>
    </div>
  `;
}

function createAlertElement(alert) {
  const div = document.createElement('div');
  div.className = `alert-item ${alert.severity}`;
  
  div.innerHTML = `
    <div class="alert-meta">
      <span class="alert-type">${alert.type.name} detected</span>
      <span class="alert-time">${alert.timestamp} • ${alert.id}</span>
    </div>
    <div class="alert-details">
      <div class="detail-stat">
        <span class="stat-label">Confidence</span>
        <span class="stat-val ${(alert.confidence > 0.95 && alert.severity == 'critical') ? 'danger' : ''}">
          ${(alert.confidence * 100).toFixed(1)}%
        </span>
      </div>
      <div class="detail-stat">
        <span class="stat-label">Source</span>
        <span class="stat-val">10.0.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*255)}</span>
      </div>
    </div>
  `;
  return div;
}

function tick() {
  // Update KPIs slightly to simulate live traffic
  state.traffic += Math.floor(Math.random() * 50);
  
  // Decide if new threat emerges
  if(Math.random() > 0.75) {
    const attack = getRandomAttack();
    const newAlert = {
      id: generateId(),
      timestamp: getTimeString(),
      type: attack,
      severity: attack.severity,
      confidence: 0.85 + (Math.random() * 0.14) // 85% to 99%
    };
    
    state.alerts.unshift(newAlert);
    if(state.alerts.length > 20) state.alerts.pop();
    
    state.blocked++;
    state.threats = Math.max(1, Math.floor(Math.random() * 8));
    distribution[attack.name]++;
    
    // UI Update
    const container = document.getElementById('alerts-container');
    const el = createAlertElement(newAlert);
    container.insertBefore(el, container.firstChild);
    
    if(container.children.length > 8) {
      container.lastChild.remove();
    }
    
    appendToHistorical(newAlert);
  }

  // Update DOM explicitly
  document.getElementById('kpi-traffic').innerText = formatNum(state.traffic);
  document.getElementById('kpi-blocked').innerText = formatNum(state.blocked);
  document.getElementById('kpi-threats').innerText = state.threats;
  
  const safeEl = document.getElementById('pos-safe');
  if(safeEl) {
    safeEl.innerText = ((state.traffic - state.blocked) / state.traffic * 100).toFixed(3) + '%';
  }
}

// Initialization
function appendToHistorical(alert) {
  const tbody = document.getElementById('historical-tbody');
  if(!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="color: var(--text-muted)">${alert.timestamp}</td>
    <td><span class="badge-table">${alert.id}</span></td>
    <td style="font-weight: 500">${alert.type.name}</td>
    <td>10.0.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*255)}</td>
    <td>${(alert.confidence * 100).toFixed(1)}%</td>
  `;
  tbody.insertBefore(tr, tbody.firstChild);
  if(tbody.children.length > 50) tbody.lastChild.remove();
}

function seedAlerts() {
  for(let i=0; i<30; i++) {
    const d = new Date(Date.now() - Math.floor(Math.random() * 86400000));
    const attack = getRandomAttack();
    state.alerts.push({
      id: generateId(),
      timestamp: getTimeString(d),
      type: attack,
      severity: attack.severity,
      confidence: 0.85 + (Math.random() * 0.14)
    });
  }
  state.alerts.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  
  const container = document.getElementById('alerts-container');
  state.alerts.forEach((a, i) => {
    if(i < 8) container.appendChild(createAlertElement(a));
    appendToHistorical(a);
  });
}

function startSim() {
  initDistributionChart();
  initPositiveCharts();
  seedAlerts();
  
  document.getElementById('kpi-traffic').innerText = formatNum(state.traffic);
  document.getElementById('kpi-blocked').innerText = formatNum(state.blocked);
  document.getElementById('kpi-threats').innerText = state.threats;
  
  // Update UI periodically
  setInterval(tick, 1500); // New event check every 1.5s
  setInterval(initDistributionChart, 5000); // Refresh distribution every 5s

  setupInteractions();
}

// Interactivity & Button Functionality
function setupInteractions() {
  // Export Report Button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportBtn.innerText = "Exporting...";
      
      // Generate CSV from current alerts
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Timestamp,Attack Type,Severity,Confidence\n";
      state.alerts.forEach(function(rowArray) {
          const row = `${rowArray.id},${rowArray.timestamp},${rowArray.type.name},${rowArray.severity},${(rowArray.confidence * 100).toFixed(1)}%`;
          csvContent += row + "\\r\\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "IoMT_Threat_Report.csv");
      document.body.appendChild(link);
      
      link.click(); // This will download the data file
      document.body.removeChild(link);
      
      setTimeout(() => { exportBtn.innerText = "Export Report"; }, 1000);
    });
  }

  // Sidebar Navigation Logic
  const navLinks = document.querySelectorAll('#sidebar-nav a');
  const viewPanels = document.querySelectorAll('.view-panel');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update sidebar styling
      navLinks.forEach(l => l.classList.remove('active'));
      e.currentTarget.classList.add('active');

      // Update view panel
      const targetView = e.currentTarget.getAttribute('data-view');
      viewPanels.forEach(panel => {
        if (panel.id === `view-${targetView}`) {
          panel.classList.add('active-view');
        } else {
          panel.classList.remove('active-view');
        }
      });
    });
  });
}

window.onload = startSim;
