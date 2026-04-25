// ── Identity helpers (hub + team + business persisted in localStorage) ─────
function getIdentity() {
  return {
    hub: localStorage.getItem(LS_HUB) || '',
    team_name: localStorage.getItem(LS_TEAM) || '',
    business_id: localStorage.getItem(LS_BUSINESS) || ''
  };
}

function saveIdentity(hub, team, business) {
  if (hub) localStorage.setItem(LS_HUB, hub);
  if (team) localStorage.setItem(LS_TEAM, team);
  if (business !== undefined) localStorage.setItem(LS_BUSINESS, business || '');
}

function buildHubOptions(selectedValue) {
  const opts = ['<option value="">' + t('selectHub') + '</option>'];
  HUBS.forEach(h => {
    const sel = h === selectedValue ? ' selected' : '';
    opts.push('<option value="' + h + '"' + sel + '>' + h + '</option>');
  });
  return opts.join('');
}

function buildTeamOptions(selectedValue) {
  const opts = ['<option value="">' + t('selectTeam') + '</option>'];
  TEAM_OPTIONS.forEach(team => {
    const sel = team === selectedValue ? ' selected' : '';
    opts.push('<option value="' + team + '"' + sel + '>' + team + '</option>');
  });
  return opts.join('');
}

// Single-hub deployment: hub is hardcoded to China, no UI input needed.
const FIXED_HUB = HUBS[0];

function defaultHandoffTime() {
  // Default to today + 2 hours, formatted for datetime-local input
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
    + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// ── SD Card form ────────────────────────────────────────────────────────────
function renderSDForm() {
  const id = getIdentity();
  return `
    <div class="screen">
      <button class="link-back" data-action="goto-home">← ${t('backToHome')}</button>
      <h1>${t('sdFormHeading')}</h1>
      <div class="hub-chip">${t('hub')}: <strong>${FIXED_HUB}</strong></div>

      <form id="sd-form" novalidate>
        <input type="hidden" name="hub" value="${FIXED_HUB}" />

        <label class="field">
          <span class="field-label">${t('teamName')} *</span>
          <input type="text" name="team_name" required value="${escapeAttr(id.team_name)}" autocomplete="off" />
        </label>

        <label class="field">
          <span class="field-label">${t('teamId')} *</span>
          <select name="business_id" required>${buildTeamOptions(id.business_id)}</select>
        </label>

        <label class="field">
          <span class="field-label">${t('sdCount')} *</span>
          <input type="number" name="sd_count_submitted" min="1" required inputmode="numeric" />
          <span class="field-help">${t('sdCountHelp')}</span>
        </label>

        <label class="field">
          <span class="field-label">${t('expectedHandoff')} *</span>
          <input type="datetime-local" name="expected_handoff_time" required value="${defaultHandoffTime()}" />
          <span class="field-help">${t('expectedHandoffHelp')}</span>
        </label>

        <label class="field">
          <span class="field-label">${t('notes')}</span>
          <textarea name="notes" rows="3" placeholder="${t('notesPlaceholder')}"></textarea>
        </label>

        <div class="form-error" id="sd-form-error" hidden></div>
        <button type="submit" class="btn-primary" id="sd-submit-btn">${t('submit')}</button>
      </form>
    </div>
  `;
}

async function handleSDSubmit(formEl) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  const errEl = formEl.querySelector('#sd-form-error');
  const btn = formEl.querySelector('#sd-submit-btn');

  errEl.hidden = true;
  if (!data.hub || !data.team_name || !data.business_id || !data.sd_count_submitted || !data.expected_handoff_time) {
    errEl.textContent = t('errRequired');
    errEl.hidden = false;
    return;
  }
  saveIdentity(data.hub, data.team_name, data.business_id);

  btn.disabled = true;
  btn.textContent = t('submitting');
  const res = await api.submitSDCards(data);
  btn.disabled = false;
  btn.textContent = t('submit');

  if (!res.success) {
    errEl.textContent = res.error || t('errSubmitFailed');
    errEl.hidden = false;
    return;
  }

  showConfirmation({
    title: t('confirmSDTitle'),
    refId: res.data.submission_id,
    summary: [
      [t('hub'), data.hub],
      [t('teamName'), data.team_name],
      [t('teamId'), data.business_id],
      [t('sdCount'), data.sd_count_submitted],
      [t('expectedHandoff'), formatDateTime(data.expected_handoff_time)]
    ],
    onSubmitAnother: () => goto('sd')
  });
}

// ── Device return form (2 steps) ────────────────────────────────────────────
let returnFormState = null;

function renderReturnFormStep1() {
  const id = getIdentity();
  const s = returnFormState || {};
  const reason = s.reason || '';
  const showFault = reason === 'broken_rma';
  return `
    <div class="screen">
      <button class="link-back" data-action="goto-home">← ${t('backToHome')}</button>
      <h1>${t('retFormHeading')}</h1>
      <p class="step-label">${t('retStep1Title')}</p>
      <div class="hub-chip">${t('hub')}: <strong>${FIXED_HUB}</strong></div>

      <form id="ret-step1-form" novalidate>
        <input type="hidden" name="hub" value="${FIXED_HUB}" />

        <label class="field">
          <span class="field-label">${t('teamName')} *</span>
          <input type="text" name="team_name" required value="${escapeAttr(s.team_name || id.team_name)}" autocomplete="off" />
        </label>

        <label class="field">
          <span class="field-label">${t('businessId')}</span>
          <input type="text" name="business_id" placeholder="${t('businessIdPlaceholder')}" value="${escapeAttr(s.business_id || id.business_id)}" autocomplete="off" />
        </label>

        <fieldset class="field">
          <legend class="field-label">${t('returnReason')} *</legend>
          ${RETURN_REASONS.map(r => `
            <label class="radio-row">
              <input type="radio" name="reason" value="${r.value}" ${reason === r.value ? 'checked' : ''} required />
              <span>${t(r.label)}</span>
            </label>
          `).join('')}
        </fieldset>

        <label class="field" id="fault-field" ${showFault ? '' : 'hidden'}>
          <span class="field-label">${t('faultDescription')} *</span>
          <textarea name="fault_description" rows="3" placeholder="${t('faultDescriptionPlaceholder')}">${escapeText(s.fault_description || '')}</textarea>
        </label>

        <div class="form-error" id="ret-step1-error" hidden></div>
        <button type="submit" class="btn-primary">${t('next')}</button>
      </form>
    </div>
  `;
}

function bindReturnFormStep1(rootEl) {
  const form = rootEl.querySelector('#ret-step1-form');
  if (!form) return;
  form.addEventListener('change', (e) => {
    if (e.target.name === 'reason') {
      const fault = form.querySelector('#fault-field');
      fault.hidden = e.target.value !== 'broken_rma';
    }
  });
}

function handleReturnStep1Submit(formEl) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  const errEl = formEl.querySelector('#ret-step1-error');
  errEl.hidden = true;
  if (!data.hub || !data.team_name || !data.reason) {
    errEl.textContent = t('errRequired');
    errEl.hidden = false;
    return;
  }
  if (data.reason === 'broken_rma' && !(data.fault_description || '').trim()) {
    errEl.textContent = t('errRequired');
    errEl.hidden = false;
    return;
  }
  saveIdentity(data.hub, data.team_name, data.business_id);
  returnFormState = { ...(returnFormState || {}), ...data };
  goto('return-step2');
}

function renderReturnFormStep2() {
  const s = returnFormState || {};
  const mcOn = !!s.multicam_on;
  const cmOn = !!s.cm5_on;
  return `
    <div class="screen">
      <button class="link-back" data-action="goto-return-step1">← ${t('back')}</button>
      <h1>${t('retFormHeading')}</h1>
      <p class="step-label">${t('retStep2Title')}</p>

      <form id="ret-step2-form" novalidate>
        <div class="device-grid">
          <fieldset class="device-card">
            <label class="toggle-row">
              <input type="checkbox" name="multicam_on" ${mcOn ? 'checked' : ''} />
              <span class="toggle-label">${t('returningMulticam')}</span>
            </label>
            <div class="device-fields" data-fields="multicam" ${mcOn ? '' : 'hidden'}>
              <label class="field">
                <span class="field-label">${t('deviceCount')}</span>
                <input type="number" name="multicam_count" min="1" inputmode="numeric" value="${escapeAttr(s.multicam_count || '')}" />
              </label>
              <label class="field">
                <span class="field-label">${t('deviceIds')}</span>
                <textarea name="multicam_ids" rows="3" placeholder="${t('deviceIdsHelp')}">${escapeText(s.multicam_ids || '')}</textarea>
              </label>
              <label class="field">
                <span class="field-label">${t('replacementsNeeded')}</span>
                <input type="number" name="replacement_multicam_needed" min="0" inputmode="numeric" value="${escapeAttr(s.replacement_multicam_needed || '0')}" />
                <span class="field-help">${t('replacementsHelp')}</span>
              </label>
            </div>
          </fieldset>

          <fieldset class="device-card">
            <label class="toggle-row">
              <input type="checkbox" name="cm5_on" ${cmOn ? 'checked' : ''} />
              <span class="toggle-label">${t('returningCM5')}</span>
            </label>
            <div class="device-fields" data-fields="cm5" ${cmOn ? '' : 'hidden'}>
              <label class="field">
                <span class="field-label">${t('deviceCount')}</span>
                <input type="number" name="cm5_count" min="1" inputmode="numeric" value="${escapeAttr(s.cm5_count || '')}" />
              </label>
              <label class="field">
                <span class="field-label">${t('deviceIds')}</span>
                <textarea name="cm5_ids" rows="3" placeholder="${t('deviceIdsHelp')}">${escapeText(s.cm5_ids || '')}</textarea>
              </label>
              <label class="field">
                <span class="field-label">${t('replacementsNeeded')}</span>
                <input type="number" name="replacement_cm5_needed" min="0" inputmode="numeric" value="${escapeAttr(s.replacement_cm5_needed || '0')}" />
                <span class="field-help">${t('replacementsHelp')}</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div class="form-warn" id="ret-step2-warn" hidden></div>
        <div class="form-error" id="ret-step2-error" hidden></div>
        <button type="submit" class="btn-primary" id="ret-submit-btn">${t('submit')}</button>
      </form>
    </div>
  `;
}

function bindReturnFormStep2(rootEl) {
  const form = rootEl.querySelector('#ret-step2-form');
  if (!form) return;
  form.addEventListener('change', (e) => {
    if (e.target.name === 'multicam_on' || e.target.name === 'cm5_on') {
      const key = e.target.name === 'multicam_on' ? 'multicam' : 'cm5';
      const block = form.querySelector(`[data-fields="${key}"]`);
      block.hidden = !e.target.checked;
    }
    runStep2CountWarn(form);
  });
  form.addEventListener('input', () => runStep2CountWarn(form));
}

function countIDs(text) {
  if (!text) return 0;
  return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
}

function runStep2CountWarn(form) {
  const warn = form.querySelector('#ret-step2-warn');
  const data = Object.fromEntries(new FormData(form).entries());
  const msgs = [];
  if (data.multicam_on === 'on' && data.multicam_count && data.multicam_ids) {
    const idCount = countIDs(data.multicam_ids);
    if (idCount !== Number(data.multicam_count)) {
      msgs.push('Multicam: ' + t('errCountIDsMismatch') + ' (' + data.multicam_count + ' vs ' + idCount + ')');
    }
  }
  if (data.cm5_on === 'on' && data.cm5_count && data.cm5_ids) {
    const idCount = countIDs(data.cm5_ids);
    if (idCount !== Number(data.cm5_count)) {
      msgs.push('CM5: ' + t('errCountIDsMismatch') + ' (' + data.cm5_count + ' vs ' + idCount + ')');
    }
  }
  if (msgs.length) {
    warn.innerHTML = msgs.join('<br/>');
    warn.hidden = false;
  } else {
    warn.hidden = true;
  }
}

async function handleReturnStep2Submit(formEl) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  const errEl = formEl.querySelector('#ret-step2-error');
  const btn = formEl.querySelector('#ret-submit-btn');
  errEl.hidden = true;

  const mcOn = data.multicam_on === 'on';
  const cmOn = data.cm5_on === 'on';
  if (!mcOn && !cmOn) {
    errEl.textContent = t('errNoDevicesSelected');
    errEl.hidden = false;
    return;
  }
  if (mcOn && (!data.multicam_count || !(data.multicam_ids || '').trim())) {
    errEl.textContent = 'Multicam: ' + t('errRequired');
    errEl.hidden = false;
    return;
  }
  if (cmOn && (!data.cm5_count || !(data.cm5_ids || '').trim())) {
    errEl.textContent = 'CM5: ' + t('errRequired');
    errEl.hidden = false;
    return;
  }

  // Persist step2 state in case of submit failure
  returnFormState = { ...(returnFormState || {}), ...data };

  const s = returnFormState;
  const payload = {
    hub: s.hub,
    team_name: s.team_name,
    business_id: s.business_id || '',
    reason: s.reason,
    fault_description: s.fault_description || '',
    multicam_count: mcOn ? (Number(s.multicam_count) || 0) : 0,
    multicam_ids: mcOn ? normalizeIds(s.multicam_ids) : '',
    cm5_count: cmOn ? (Number(s.cm5_count) || 0) : 0,
    cm5_ids: cmOn ? normalizeIds(s.cm5_ids) : '',
    replacement_multicam_needed: mcOn ? (Number(s.replacement_multicam_needed) || 0) : 0,
    replacement_cm5_needed: cmOn ? (Number(s.replacement_cm5_needed) || 0) : 0
  };

  btn.disabled = true;
  btn.textContent = t('submitting');
  const res = await api.submitDeviceReturn(payload);
  btn.disabled = false;
  btn.textContent = t('submit');

  if (!res.success) {
    errEl.textContent = res.error || t('errSubmitFailed');
    errEl.hidden = false;
    return;
  }

  const summary = [
    [t('hub'), payload.hub],
    [t('teamName'), payload.team_name],
    [t('returnReason'), payload.reason === 'broken_rma' ? t('reasonBrokenRMA') : t('reasonEndOfCycle')]
  ];
  if (payload.multicam_count) {
    summary.push(['Multicam', payload.multicam_count + ' returned, ' + payload.replacement_multicam_needed + ' replacements']);
  }
  if (payload.cm5_count) {
    summary.push(['CM5', payload.cm5_count + ' returned, ' + payload.replacement_cm5_needed + ' replacements']);
  }

  returnFormState = null;
  showConfirmation({
    title: t('confirmRetTitle'),
    cta: t('confirmRetCTA'),
    refId: res.data.request_id,
    summary,
    onSubmitAnother: () => goto('return')
  });
}

function normalizeIds(text) {
  if (!text) return '';
  return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).join(', ');
}

// ── Confirmation screen (reusable) ──────────────────────────────────────────
function showConfirmation(opts) {
  const root = document.getElementById('app-root');
  const summaryHtml = (opts.summary || [])
    .map(([k, v]) => `<div class="summary-row"><span class="summary-key">${k}</span><span class="summary-val">${escapeText(String(v))}</span></div>`)
    .join('');
  root.innerHTML = `
    <div class="screen confirmation">
      <div class="confirm-icon">✓</div>
      <h1>${opts.title}</h1>
      <div class="ref-id">
        <span class="ref-id-label">${t('confirmId')}</span>
        <span class="ref-id-value">${opts.refId}</span>
      </div>
      <div class="summary-card">${summaryHtml}</div>
      ${opts.cta ? `<p class="confirm-cta">${opts.cta}</p>` : ''}
      <div class="confirm-actions">
        <button class="btn-secondary" data-action="goto-home">${t('backToHome')}</button>
        <button class="btn-primary" id="submit-another-btn">${t('submitAnother')}</button>
      </div>
    </div>
  `;
  document.getElementById('submit-another-btn').addEventListener('click', opts.onSubmitAnother);
}

// ── Tiny HTML escape helpers ────────────────────────────────────────────────
function escapeText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeText(s).replace(/"/g, '&quot;');
}
function formatDateTime(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
