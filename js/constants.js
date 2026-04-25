// ── Hubs ─────────────────────────────────────────────────────────────────────
const HUBS = ['China'];

// ── Team ID options (SD card form dropdown) ─────────────────────────────────
const TEAM_OPTIONS = [
  'Business - Shenzhen - Ext - Fujian Partner',
  'Business - Shenzhen - Ext - Gao Ming',
  'Business - Shenzhen - Ext - Kylar',
  'Business - Shenzhen - Ext - Liu Yiyu',
  'Business - Shenzhen - Ext - Mr Ma',
  'Business - Shenzhen - Ext - Mr Ying',
  'Business - Shenzhen - Ext - Paul',
  'Business - Shenzhen - Ext - Sandu',
  'Business - Shenzhen - Ext - Wang Qin'
];

// ── Statuses ─────────────────────────────────────────────────────────────────
const SD_STATUSES = ['Submitted', 'In Transit', 'Received', 'Processed'];
const RET_STATUSES = ['Submitted', 'Reviewing', 'Approved', 'Shipped', 'Closed'];

const STATUS_COLORS = {
  // SD card flow
  'Submitted':  { bg: '#e8effc', fg: '#1e40af' },
  'In Transit': { bg: '#fef3c7', fg: '#92400e' },
  'Received':   { bg: '#dcfce7', fg: '#166534' },
  'Processed':  { bg: '#e5e7eb', fg: '#374151' },
  // Device return flow (Submitted shared)
  'Reviewing':  { bg: '#fef3c7', fg: '#92400e' },
  'Approved':   { bg: '#dcfce7', fg: '#166534' },
  'Shipped':    { bg: '#ccfbf1', fg: '#115e59' },
  'Closed':     { bg: '#e5e7eb', fg: '#374151' }
};

// ── Return reasons ───────────────────────────────────────────────────────────
const RETURN_REASONS = [
  { value: 'broken_rma', label: 'reasonBrokenRMA' },
  { value: 'end_of_cycle', label: 'reasonEndOfCycle' }
];

// ── localStorage keys ────────────────────────────────────────────────────────
const LS_HUB = 'mecka_dispatch_hub';
const LS_TEAM = 'mecka_dispatch_team';
const LS_BUSINESS = 'mecka_dispatch_business';
const LS_ADMIN_OK = 'mecka_dispatch_admin_ok';
