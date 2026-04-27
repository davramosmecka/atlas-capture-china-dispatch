// ── Admin dashboard ─────────────────────────────────────────────────────────
let adminState = {
  tab: 'sd',           // 'sd' | 'ret'
  filterHub: 'all',
  filterStatus: 'all',
  filterReason: 'all',
  sdRows: [],
  retRows: [],
  summary: [],
  loading: false,
  pollHandle: null,
  expanded: {}         // id -> bool
};

function isAdminAuthorized() {
  return localStorage.getItem(LS_ADMIN_OK) === '1';
}

function renderAdminGate() {
  return `
    <div class="screen admin-gate">
      <h1>${t('adminTitle')}</h1>
      <form id="admin-gate-form">
        <label class="field">
          <span class="field-label">${t('adminAccessPrompt')}</span>
          <input type="password" name="code" autocomplete="off" autofocus />
        </label>
        <div class="form-error" id="admin-gate-error" hidden></div>
        <button type="submit" class="btn-primary">${t('submit')}</button>
      </form>
    </div>
  `;
}

function handleAdminGateSubmit(formEl) {
  const code = (new FormData(formEl)).get('code') || '';
  const errEl = formEl.querySelector('#admin-gate-error');
  if (code === ADMIN_ACCESS_CODE) {
    localStorage.setItem(LS_ADMIN_OK, '1');
    goto('admin');
  } else {
    errEl.textContent = t('adminWrongCode');
    errEl.hidden = false;
  }
}

function renderAdmin() {
  return `
    <div class="screen admin">
      <header class="admin-header">
        <h1>${t('adminTitle')}</h1>
        <button class="btn-secondary" id="admin-refresh-btn">${t('refresh')}</button>
      </header>

      <div id="hub-summary-cards" class="hub-summary-cards"></div>

      <nav class="admin-tabs">
        <button class="tab-btn ${adminState.tab === 'sd' ? 'active' : ''}" data-admin-tab="sd">${t('adminTabSD')}</button>
        <button class="tab-btn ${adminState.tab === 'ret' ? 'active' : ''}" data-admin-tab="ret">${t('adminTabRet')}</button>
      </nav>

      <div class="admin-filters">
        <label>${t('adminFilterHub')}
          <select id="filter-hub">
            <option value="all">${t('adminAll')}</option>
            ${HUBS.map(h => `<option value="${h}" ${adminState.filterHub === h ? 'selected' : ''}>${h}</option>`).join('')}
          </select>
        </label>
        <label>${t('adminFilterStatus')}
          <select id="filter-status">
            <option value="all">${t('adminAll')}</option>
            ${(adminState.tab === 'sd' ? SD_STATUSES : RET_STATUSES)
              .map(s => `<option value="${s}" ${adminState.filterStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </label>
        ${adminState.tab === 'ret' ? `
          <label>${t('adminFilterReason')}
            <select id="filter-reason">
              <option value="all">${t('adminAll')}</option>
              <option value="broken_rma" ${adminState.filterReason === 'broken_rma' ? 'selected' : ''}>${t('reasonBrokenRMA')}</option>
              <option value="end_of_cycle" ${adminState.filterReason === 'end_of_cycle' ? 'selected' : ''}>${t('reasonEndOfCycle')}</option>
            </select>
          </label>
        ` : ''}
      </div>

      <div id="admin-table-container">
        <div class="loading">${adminState.loading ? '…' : ''}</div>
      </div>
    </div>
  `;
}

function bindAdmin(rootEl) {
  rootEl.querySelector('#admin-refresh-btn').addEventListener('click', loadAdminData);

  rootEl.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      adminState.tab = btn.dataset.adminTab;
      adminState.filterStatus = 'all';
      adminState.filterReason = 'all';
      goto('admin');
    });
  });

  const hubSel = rootEl.querySelector('#filter-hub');
  if (hubSel) hubSel.addEventListener('change', e => { adminState.filterHub = e.target.value; loadAdminData(); });
  const statusSel = rootEl.querySelector('#filter-status');
  if (statusSel) statusSel.addEventListener('change', e => { adminState.filterStatus = e.target.value; loadAdminData(); });
  const reasonSel = rootEl.querySelector('#filter-reason');
  if (reasonSel) reasonSel.addEventListener('change', e => { adminState.filterReason = e.target.value; loadAdminData(); });

  loadAdminData();
  startAdminPolling();
}

function startAdminPolling() {
  if (adminState.pollHandle) clearInterval(adminState.pollHandle);
  adminState.pollHandle = setInterval(loadAdminData, ADMIN_POLL_INTERVAL);
}

function stopAdminPolling() {
  if (adminState.pollHandle) clearInterval(adminState.pollHandle);
  adminState.pollHandle = null;
}

async function loadAdminData() {
  adminState.loading = true;
  renderAdminTable();

  const params = {
    type: adminState.tab === 'sd' ? 'sd_cards' : 'device_returns',
    hub: adminState.filterHub,
    status: adminState.filterStatus
  };
  if (adminState.tab === 'ret') params.reason = adminState.filterReason;

  const [subRes, sumRes] = await Promise.all([
    api.getSubmissions(params),
    api.getHubSummary()
  ]);

  if (subRes.success) {
    if (adminState.tab === 'sd') adminState.sdRows = subRes.data || [];
    else adminState.retRows = subRes.data || [];
  }
  if (sumRes.success) adminState.summary = sumRes.data || [];

  adminState.loading = false;
  renderHubSummary();
  renderAdminTable();
}

function renderHubSummary() {
  const container = document.getElementById('hub-summary-cards');
  if (!container) return;
  if (!adminState.summary.length) { container.innerHTML = ''; return; }
  container.innerHTML = adminState.summary.map(s => `
    <div class="hub-card">
      <div class="hub-card-name">${s.hub}</div>
      <div class="hub-card-stats">
        <div class="hub-stat">
          <div class="hub-stat-value">${s.sd_pending_inbound}</div>
          <div class="hub-stat-label">${t('adminSdPending')}</div>
        </div>
        <div class="hub-stat">
          <div class="hub-stat-value">${s.device_returns_open}</div>
          <div class="hub-stat-label">${t('adminRetOpen')}</div>
        </div>
        <div class="hub-stat">
          <div class="hub-stat-value">${s.open_rmas}</div>
          <div class="hub-stat-label">${t('adminOpenRmas')}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderAdminTable() {
  const container = document.getElementById('admin-table-container');
  if (!container) return;
  if (adminState.loading) { container.innerHTML = `<div class="loading">…</div>`; return; }
  if (adminState.tab === 'sd') container.innerHTML = renderSDTable();
  else container.innerHTML = renderRetTable();
  bindTableActions(container);
}

function renderSDTable() {
  if (!adminState.sdRows.length) return `<div class="empty">${t('adminEmpty')}</div>`;
  return `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>${t('adminColTimestamp')}</th>
            <th>${t('adminColHub')}</th>
            <th>${t('adminColTeam')}</th>
            <th>${t('adminColCount')}</th>
            <th>${t('adminColHandoff')}</th>
            <th>${t('adminColStatus')}</th>
            <th>${t('adminColActual')}</th>
            <th>${t('adminColVariance')}</th>
            <th>${t('adminColActions')}</th>
          </tr>
        </thead>
        <tbody>
          ${adminState.sdRows.map(r => sdRowHTML(r)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function sdRowHTML(r) {
  const variance = r.variance === '' ? '' : Number(r.variance);
  let varClass = '';
  if (variance === 0) varClass = 'var-zero';
  else if (variance < 0) varClass = 'var-neg';
  else if (variance > 0) varClass = 'var-pos';
  return `
    <tr data-id="${r.submission_id}">
      <td>${formatDateTime(r.timestamp)}</td>
      <td>${escapeText(r.hub)}</td>
      <td>
        ${escapeText(r.team_name)}
        ${r.business_id ? `<div class="muted">${escapeText(r.business_id)}</div>` : ''}
      </td>
      <td class="num">${escapeText(r.sd_count_submitted)}</td>
      <td>${formatDateTime(r.expected_handoff_time)}</td>
      <td>${statusBadge(r.status)}</td>
      <td><input type="number" class="inline-input" data-actual data-id="${r.submission_id}" value="${escapeAttr(r.sd_count_actual)}" min="0" /></td>
      <td class="num ${varClass}">${variance === '' ? '—' : variance}</td>
      <td>
        <select data-status data-id="${r.submission_id}">
          ${SD_STATUSES.map(s => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button class="btn-tiny" data-save-sd data-id="${r.submission_id}">${t('save')}</button>
      </td>
    </tr>
  `;
}

function renderRetTable() {
  if (!adminState.retRows.length) return `<div class="empty">${t('adminEmpty')}</div>`;
  return `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>${t('adminColTimestamp')}</th>
            <th>${t('adminColHub')}</th>
            <th>${t('adminColTeam')}</th>
            <th>${t('adminColReason')}</th>
            <th>${t('adminColSets')}</th>
            <th>${t('adminColMulticam')}</th>
            <th>${t('adminColCM5')}</th>
            <th>${t('adminColStatus')}</th>
            <th>${t('adminColActions')}</th>
          </tr>
        </thead>
        <tbody>
          ${adminState.retRows.map(r => retRowHTML(r)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function retRowHTML(r) {
  const expanded = !!adminState.expanded[r.request_id];
  const reasonLabel = r.reason === 'broken_rma' ? t('reasonBrokenRMA') : t('reasonEndOfCycle');
  return `
    <tr data-id="${r.request_id}" class="${expanded ? 'expanded-row' : ''}">
      <td><button class="btn-tiny" data-toggle-expand data-id="${r.request_id}">${expanded ? t('adminCollapse') : t('adminExpand')}</button></td>
      <td>${formatDateTime(r.timestamp)}</td>
      <td>${escapeText(r.hub)}</td>
      <td>
        ${escapeText(r.team_name)}
        ${r.business_id ? `<div class="muted">${escapeText(r.business_id)}</div>` : ''}
      </td>
      <td>${reasonLabel}</td>
      <td class="num">${escapeText(r.sets_returning || '0')} / ${escapeText(r.sets_needed || '0')}</td>
      <td class="num">${escapeText(r.multicam_count || '0')} / ${escapeText(r.replacement_multicam_needed || '0')}</td>
      <td class="num">${escapeText(r.cm5_count || '0')} / ${escapeText(r.replacement_cm5_needed || '0')}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <select data-status data-id="${r.request_id}">
          ${RET_STATUSES.map(s => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button class="btn-tiny" data-save-ret data-id="${r.request_id}">${t('save')}</button>
      </td>
    </tr>
    ${expanded ? `
      <tr class="expand-content">
        <td colspan="10">
          <div class="expand-grid">
            ${r.fault_description ? `<div><strong>${t('adminFaultLabel')}:</strong><br/>${escapeText(r.fault_description)}</div>` : ''}
            ${r.multicam_ids ? `<div><strong>${t('adminMulticamIds')}:</strong><br/>${escapeText(r.multicam_ids)}</div>` : ''}
            ${r.cm5_ids ? `<div><strong>${t('adminCM5Ids')}:</strong><br/>${escapeText(r.cm5_ids)}</div>` : ''}
          </div>
          <div class="expand-notes">
            <label>${t('adminAdminNotes')}</label>
            <textarea data-notes data-id="${r.request_id}" rows="2">${escapeText(r.notes || '')}</textarea>
          </div>
        </td>
      </tr>
    ` : ''}
  `;
}

function statusBadge(status) {
  const c = STATUS_COLORS[status] || { bg: '#e5e7eb', fg: '#374151' };
  return `<span class="badge" style="background:${c.bg};color:${c.fg}">${escapeText(statusLabel(status))}</span>`;
}

function bindTableActions(container) {
  container.querySelectorAll('[data-toggle-expand]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      adminState.expanded[id] = !adminState.expanded[id];
      renderAdminTable();
    });
  });

  container.querySelectorAll('[data-save-sd]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const row = container.querySelector(`tr[data-id="${id}"]`);
      const status = row.querySelector('[data-status]').value;
      const actual = row.querySelector('[data-actual]').value;
      btn.disabled = true; btn.textContent = t('saving');
      const res = await api.updateSDStatus({ submission_id: id, status, sd_count_actual: actual });
      btn.disabled = false; btn.textContent = t('save');
      if (!res.success) alert(res.error || 'Save failed');
      else loadAdminData();
    });
  });

  container.querySelectorAll('[data-save-ret]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const row = container.querySelector(`tr[data-id="${id}"]`);
      const status = row.querySelector('[data-status]').value;
      // Pull notes from expanded section if open
      const notesEl = container.querySelector(`textarea[data-notes][data-id="${id}"]`);
      const notes = notesEl ? notesEl.value : undefined;
      btn.disabled = true; btn.textContent = t('saving');
      const payload = { request_id: id, status };
      if (notes !== undefined) payload.notes = notes;
      const res = await api.updateDeviceStatus(payload);
      btn.disabled = false; btn.textContent = t('save');
      if (!res.success) alert(res.error || 'Save failed');
      else loadAdminData();
    });
  });
}
