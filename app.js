let state = {
  traffic: 0,
  blocked: 0,
  threats: 0,
  alerts: [],
  upcomingAlerts: [],
  totalAccuracy: 0
};

let distribution = {};

const formatNum = num => num.toLocaleString();
const getTimeString = () => new Date().toISOString().split('T')[1].substring(0, 12) + 'Z';

function initDistributionChart() {
  const container = document.getElementById('chart-container');
  container.innerHTML = '';
  const total = Object.values(distribution).reduce((a,b) => a+b, 0);
  if(total === 0) return;
  
  const colors = ['red', 'orange', 'green'];
  let colorIdx = 0;

  Object.entries(distribution).sort((a,b) => b[1] - a[1]).forEach(([key, val]) => {
    const percent = Math.round((val / total) * 100);
    const colorClass = colors[colorIdx++ % colors.length];
    container.innerHTML += `
      <div class="bar-row">
        <div class="bar-labels"><span>${key}</span><span>${formatNum(val)}</span></div>
        <div class="bar-track"><div class="bar-fill ${colorClass}" style="width: 0%" data-target="${percent}%"></div></div>
      </div>
    `;
  });

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
  const safePercent = ((safeTraffic / Math.max(1, state.traffic)) * 100).toFixed(3);
  const accPercent = (state.totalAccuracy * 100).toFixed(2);
  
  container.innerHTML = `
    <div class="positive-metric">
      <div class="positive-metric-info"><h3>Safe Traffic</h3><p>Allowed Benign</p></div>
      <div class="positive-metric-value" id="pos-safe">${safePercent}%</div>
    </div>
    <div class="positive-metric orange">
      <div class="positive-metric-info"><h3>True Positive Rate</h3><p>Verified Accuracy</p></div>
      <div class="positive-metric-value">${accPercent}%</div>
    </div>
  `;
}

function createAlertElement(alert) {
  const div = document.createElement('div');
  let colorClass = 'warning';
  
  if (alert.attack_type === 'None' || alert.attack_type === 'Benign') {
    colorClass = 'safe';
  } else if (alert.severity === 'high') {
    colorClass = 'critical';
  } else {
    colorClass = 'warning';
  }
  
  div.className = `alert-item ${colorClass}`;
  const typeText = colorClass === 'safe' ? 'Benign Traffic Routed' : `${alert.attack_type} detected`;
  
  div.innerHTML = `
    <div class="alert-meta">
      <span class="alert-type">${typeText}</span>
      <span class="alert-time">${alert.timestamp} • ${alert.id}</span>
    </div>
    <div class="alert-details">
      <div class="detail-stat">
        <span class="stat-label">Confidence</span>
        <span class="stat-val ${(alert.confidence > 0.95 && alert.severity === 'high') ? 'danger' : ''}">${(alert.confidence * 100).toFixed(1)}%</span>
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
  state.traffic += Math.floor(Math.random() * 50);
  
  if(state.upcomingAlerts.length > 0 && Math.random() > 0.3) {
    let newAlert = state.upcomingAlerts.shift();
    
    // 30% chance to inject a benign/safe traffic alert for visual balance
    if(Math.random() < 0.3) {
      newAlert = {
        id: `evt_${Math.floor(Math.random()*90000)+10000}`,
        timestamp: getTimeString(),
        attack_type: 'Benign',
        confidence: 0.99,
        severity: 'low',
        details: {}
      };
    }

    state.alerts.unshift(newAlert);
    if(state.alerts.length > 100) state.alerts.pop();
    
    if(newAlert.attack_type !== "Benign" && newAlert.attack_type !== "None") {
      state.blocked++;
      state.threats = Math.max(1, Math.floor(Math.random() * 8));
      let key = newAlert.attack_type;
      if (key.includes("Recon")) key = "Recon_Port_Scan";
      if (key.includes("DoS-ICMP")) key = "DoS_ICMP";
      if (key.includes("Flood")) key = "MQTT_Flood";
      if (distribution[key] !== undefined) distribution[key]++;
    }
    
    const container = document.getElementById('alerts-container');
    const el = createAlertElement(newAlert);
    container.insertBefore(el, container.firstChild);
    if(container.children.length > 8) container.lastChild.remove();
    
    appendToHistorical(newAlert);
  }

  document.getElementById('kpi-traffic').innerText = formatNum(state.traffic);
  document.getElementById('kpi-blocked').innerText = formatNum(state.blocked);
  document.getElementById('kpi-threats').innerText = state.threats;
  
  const safeEl = document.getElementById('pos-safe');
  if(safeEl) safeEl.innerText = ((state.traffic - state.blocked) / Math.max(1, state.traffic) * 100).toFixed(3) + '%';
}

function appendToHistorical(alert) {
  const tbody = document.getElementById('historical-tbody');
  if(!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="color: var(--text-secondary)">${alert.timestamp}</td>
    <td><span class="badge">${alert.id}</span></td>
    <td style="font-weight: 500">${alert.attack_type}</td>
    <td>10.0.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*255)}</td>
    <td>${(alert.confidence * 100).toFixed(1)}%</td>
  `;
  tbody.insertBefore(tr, tbody.firstChild);
  if(tbody.children.length > 50) tbody.lastChild.remove();
}

function seedAlerts() {
  const container = document.getElementById('alerts-container');
  
  // Mix in some simulated benign traffic for the initial view
  const mixedAlerts = [];
  state.alerts.slice(0, 8).forEach(a => mixedAlerts.push(a));
  for(let i=0; i<3; i++) {
    mixedAlerts.push({
      id: `init_safe_${i}`,
      timestamp: getTimeString(),
      attack_type: 'Benign',
      confidence: 0.98 + (Math.random() * 0.02),
      severity: 'low'
    });
  }
  mixedAlerts.sort(() => Math.random() - 0.5);
  
  mixedAlerts.forEach(a => {
    container.appendChild(createAlertElement(a));
  });
  
  state.alerts.slice(0, 50).forEach(a => appendToHistorical(a));
}

async function startSim() {
  try {
    const [metricsRes, alertsRes] = await Promise.all([
      fetch('data/metrics.json'),
      fetch('data/alerts.json')
    ]);
    const metrics = await metricsRes.json();
    const alertsData = await alertsRes.json();
    
    state.traffic = metrics.totalTraffic;
    state.blocked = metrics.blockedAttacks;
    state.threats = metrics.activeThreats;
    state.totalAccuracy = metrics.accuracy;
    distribution = metrics.breakdown;
    state.alerts = alertsData.slice(0, 30);
    state.upcomingAlerts = alertsData.slice(30);
    
    initDistributionChart();
    initPositiveCharts();
    seedAlerts();
    
    document.getElementById('kpi-traffic').innerText = formatNum(state.traffic);
    document.getElementById('kpi-blocked').innerText = formatNum(state.blocked);
    document.getElementById('kpi-threats').innerText = state.threats;
    
    setInterval(tick, 1500);
    setInterval(initDistributionChart, 5000);
    setupInteractions();
  } catch(e) {
    console.error("Failed to load data.", e);
  }
}

function setupInteractions() {
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportBtn.innerText = "Exporting...";
      let csv = "data:text/csv;charset=utf-8,ID,Timestamp,Attack Type,Severity,Confidence\n";
      state.alerts.forEach(r => { csv += `${r.id},${r.timestamp},${r.attack_type},${r.severity},${(r.confidence * 100).toFixed(1)}%\r\n`; });
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "IoMT_Threat_Report.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => { exportBtn.innerText = "Export"; }, 1000);
    });
  }

  document.querySelectorAll('#sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const target = e.currentTarget.getAttribute('data-view');
      document.querySelectorAll('.view-panel').forEach(p => {
        p.classList.toggle('active-view', p.id === `view-${target}`);
      });
    });
  });

  const chatWidget = document.getElementById('chat-widget');
  const toggleBtn = document.getElementById('toggle-chat');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  document.getElementById('chat-header').addEventListener('click', () => {
    chatWidget.classList.toggle('closed');
    toggleBtn.innerText = chatWidget.classList.contains('closed') ? '+' : '-';
  });

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if(!text) return;
    chatBody.innerHTML += `<div class="msg user">${text}</div>`;
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
    
    chatBody.innerHTML += `<div class="msg ai">Analyzing...</div>`;
    const loadingMsg = chatBody.lastChild;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      loadingMsg.innerText = data.reply || "No response.";
    } catch(err) {
      loadingMsg.innerText = "Error: Ensure Ollama is running and app.py is active.";
    }
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  sendBtn.addEventListener('click', (e) => { e.stopPropagation(); sendMessage(); });
  chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
  chatInput.addEventListener('click', (e) => e.stopPropagation());
}

window.onload = startSim;
