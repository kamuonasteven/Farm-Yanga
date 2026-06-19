function renderSidebar(activePage) {
  const nav = [
    { label: 'OVERVIEW', items: [
      { page:'dashboard', icon:'ti-layout-dashboard', text:'Dashboard', href:'dashboard.html' },
      { page:'crops', icon:'ti-plant', text:'My Crops', href:'crops.html' },
    ]},
    { label: 'RECORDS', items: [
      { page:'activities', icon:'ti-notes', text:'Farm Activities', href:'activities.html' },
      { page:'costs', icon:'ti-coin', text:'Costs & Budget', href:'costs.html' },
      { page:'equipment', icon:'ti-tractor', text:'Equipment', href:'equipment.html' },
    ]},
    { label: 'TOOLS', items: [
      { page:'calendar', icon:'ti-calendar', text:'Calendar', href:'calendar.html' },
      { page:'notes', icon:'ti-notebook', text:'Farm Notes', href:'notes.html' },
      { page:'calculator', icon:'ti-calculator', text:'Input Calculator', href:'calculator.html' },
      { page:'market', icon:'ti-chart-bar', text:'Market Prices', href:'market.html' },
      { page:'ai', icon:'ti-message-chatbot', text:'Yanga AI', href:'ai.html' },
    ]},
  ];

  const html = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">🌱</div>
      <div><div class="sidebar-brand-name">Farm Yanga</div><div class="sidebar-brand-sub">Smart Farming</div></div>
    </div>
    <nav class="sidebar-nav">
      ${nav.map(section => `
        <div class="nav-label">${section.label}</div>
        ${section.items.map(item => `
          <a href="${item.href}" class="nav-link ${item.page===activePage?'active':''}" data-page="${item.page}">
            <i class="ti ${item.icon}"></i> ${item.text}
          </a>`).join('')}
      `).join('')}
    </nav>
    <div class="sidebar-user">
      <div class="sidebar-user-card">
        <div class="user-avatar" id="sidebar-avatar">?</div>
        <div><div class="user-name" id="sidebar-user-name">...</div><div class="user-loc" id="sidebar-user-loc">Malawi</div></div>
        <button class="logout-btn" id="logout-btn" title="Log out"><i class="ti ti-logout"></i></button>
      </div>
    </div>`;

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.innerHTML = html;
}
