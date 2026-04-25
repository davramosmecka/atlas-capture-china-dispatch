// ── User-facing strings (centralized for easy i18n later) ───────────────────
// All copy lives in this dictionary. To add a new language, copy the `en:`
// block, translate values, and flip `LANG` below.

const LANG = 'en';

const STRINGS = {
  en: {
    // Brand
    appTitle: 'Mecka Dispatch',
    appSubtitle: 'SD cards & device returns',

    // Home / type selector
    homeHeading: 'What are you submitting?',
    sdCardCardTitle: 'Send SD Cards',
    sdCardCardDesc: 'Declare SD cards you are sending to the upload center',
    deviceCardTitle: 'Return Devices',
    deviceCardDesc: 'Return Multicam / CM5 devices and request replacements',

    // Identity
    hub: 'Hub',
    teamName: 'Team Name',
    businessId: 'Business ID',
    businessIdPlaceholder: 'Optional — leave blank if not applicable',
    selectHub: 'Select hub…',
    teamId: 'Team ID',
    selectTeam: 'Select team…',

    // SD card form
    sdFormHeading: 'SD Card Dispatch',
    sdCount: 'SD Card Count',
    sdCountHelp: 'How many cards are you sending?',
    expectedHandoff: 'Expected Handoff Time',
    expectedHandoffHelp: 'When will the cards be physically handed off?',
    notes: 'Notes',
    notesPlaceholder: 'Optional — anything the upload center should know',

    // Device return form
    retFormHeading: 'Device Return Request',
    retStep1Title: 'Step 1 of 2 — Context',
    retStep2Title: 'Step 2 of 2 — Devices',
    returnReason: 'Return Reason',
    reasonBrokenRMA: 'Broken / Faulty — RMA',
    reasonEndOfCycle: 'End of Filming Cycle — Rotation',
    faultDescription: 'Fault Description',
    faultDescriptionPlaceholder: 'Describe what is wrong with the device(s)',
    multicamSection: 'Multicam',
    cm5Section: 'CM5',
    returningMulticam: 'I am returning Multicam devices',
    returningCM5: 'I am returning CM5 devices',
    deviceCount: 'Count',
    deviceIds: 'Device IDs',
    deviceIdsHelp: 'One ID per line, or comma-separated',
    replacementsNeeded: 'Replacements Needed',
    replacementsHelp: 'How many replacements do you need? (0 if none)',

    // Buttons
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    submitting: 'Submitting…',
    submitAnother: 'Submit another',
    backToHome: 'Back to home',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    refresh: 'Refresh',

    // Confirmation
    confirmSDTitle: 'SD card submission received',
    confirmRetTitle: 'Return request submitted',
    confirmRetCTA: 'The logistics team will review and confirm shipment.',
    confirmId: 'Reference ID',

    // Errors / validation
    errRequired: 'This field is required',
    errCountIDsMismatch: 'Heads up — count does not match number of IDs',
    errNoDevicesSelected: 'Toggle at least one device type to continue',
    errSubmitFailed: 'Submit failed. Check your connection and retry.',
    errLoadFailed: 'Could not load data. Tap refresh to retry.',
    errMissingGasUrl: 'GAS_URL not configured. Edit js/config.js after deploying the Apps Script.',

    // Demo mode
    demoBanner: 'Demo mode — data is saved to your browser only',
    demoReset: 'Reset demo data',
    demoResetConfirm: 'Wipe all demo submissions and reload sample data?',
    demoOpenAdmin: 'Open admin view',

    // Admin
    adminTitle: 'Dispatch Admin',
    adminAccessPrompt: 'Enter admin access code',
    adminWrongCode: 'Incorrect code',
    adminTabSD: 'SD Cards',
    adminTabRet: 'Device Returns',
    adminFilterHub: 'Hub',
    adminFilterStatus: 'Status',
    adminFilterReason: 'Reason',
    adminAll: 'All',
    adminColTimestamp: 'Time',
    adminColHub: 'Hub',
    adminColTeam: 'Team',
    adminColCount: 'Submitted',
    adminColHandoff: 'Handoff',
    adminColStatus: 'Status',
    adminColActual: 'Actual',
    adminColVariance: 'Variance',
    adminColReason: 'Reason',
    adminColMulticam: 'Multicam (ret/repl)',
    adminColCM5: 'CM5 (ret/repl)',
    adminColActions: 'Actions',
    adminEmpty: 'No submissions yet',
    adminSdPending: 'SD cards inbound',
    adminRetOpen: 'Returns open',
    adminOpenRmas: 'Open RMAs',
    adminLastUpdated: 'Updated',
    adminExpand: 'Details',
    adminCollapse: 'Hide',
    adminFaultLabel: 'Fault',
    adminMulticamIds: 'Multicam IDs',
    adminCM5Ids: 'CM5 IDs',
    adminAdminNotes: 'Admin notes',
    adminUpdate: 'Update'
  }
};

function t(key) {
  const dict = STRINGS[LANG] || STRINGS.en;
  return dict[key] !== undefined ? dict[key] : key;
}
