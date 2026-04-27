// ── User-facing strings (bilingual: English + Simplified Chinese) ──────────
// t() returns "English / 中文" when both are available — set BILINGUAL = false
// to show only the active LANG.

const LANG = 'en';
const BILINGUAL = true;

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
    adminUpdate: 'Update',
    adminColSets: 'Sets (ret/repl)',

    // Sets (device return)
    setsReturning: 'Sets being returned',
    setsNeeded: 'Sets needed back',
    setsHelp: 'A "set" = paired Multicam + CM5 + accessories. Enter 0 if unsure.',

    // Replacement reminder
    replaceReminder: 'Only send these back if you need replacements. Devices without a replacement request can be disposed at the hub.'
  },

  zh: {
    appTitle: 'Mecka 调度',
    appSubtitle: 'SD卡与设备退还',

    homeHeading: '您要提交什么？',
    sdCardCardTitle: '发送SD卡',
    sdCardCardDesc: '申报您发送至上传中心的SD卡',
    deviceCardTitle: '退还设备',
    deviceCardDesc: '退还Multicam / CM5设备并申请替换',

    hub: '中心',
    teamName: '团队名称',
    businessId: '商户ID',
    businessIdPlaceholder: '可选 — 如不适用请留空',
    selectHub: '选择中心…',
    teamId: '团队ID',
    selectTeam: '选择团队…',

    sdFormHeading: 'SD卡发货',
    sdCount: 'SD卡数量',
    sdCountHelp: '您要发送多少张卡？',
    expectedHandoff: '预计交接时间',
    expectedHandoffHelp: 'SD卡何时实物交接？',
    notes: '备注',
    notesPlaceholder: '可选 — 任何上传中心需要知道的信息',

    retFormHeading: '设备退还请求',
    retStep1Title: '第1步 / 共2步 — 背景信息',
    retStep2Title: '第2步 / 共2步 — 设备',
    returnReason: '退还原因',
    reasonBrokenRMA: '损坏 / 故障 — RMA',
    reasonEndOfCycle: '拍摄周期结束 — 轮换',
    faultDescription: '故障描述',
    faultDescriptionPlaceholder: '请描述设备问题',
    multicamSection: 'Multicam',
    cm5Section: 'CM5',
    returningMulticam: '我要退还Multicam设备',
    returningCM5: '我要退还CM5设备',
    deviceCount: '数量',
    deviceIds: '设备ID',
    deviceIdsHelp: '每行一个ID，或用逗号分隔',
    replacementsNeeded: '需要的替换数量',
    replacementsHelp: '您需要多少个替换品？（不需要请填0）',

    next: '下一步',
    back: '返回',
    submit: '提交',
    submitting: '提交中…',
    submitAnother: '再提交一个',
    backToHome: '返回主页',
    retry: '重试',
    cancel: '取消',
    save: '保存',
    saving: '保存中…',
    refresh: '刷新',

    confirmSDTitle: '已收到SD卡提交',
    confirmRetTitle: '退还请求已提交',
    confirmRetCTA: '物流团队将审核并确认发货。',
    confirmId: '参考编号',

    errRequired: '此字段为必填',
    errCountIDsMismatch: '提示 — 数量与ID数不一致',
    errNoDevicesSelected: '请至少选择一种设备类型以继续',
    errSubmitFailed: '提交失败。请检查网络连接并重试。',
    errLoadFailed: '无法加载数据。请点击刷新重试。',
    errMissingGasUrl: '未配置GAS_URL。请部署Apps Script后编辑js/config.js。',

    demoBanner: '演示模式 — 数据仅保存在浏览器中',
    demoReset: '重置演示数据',
    demoResetConfirm: '清除所有演示提交并重新加载示例数据？',
    demoOpenAdmin: '打开管理员视图',

    adminTitle: '调度管理',
    adminAccessPrompt: '请输入管理员访问码',
    adminWrongCode: '访问码错误',
    adminTabSD: 'SD卡',
    adminTabRet: '设备退还',
    adminFilterHub: '中心',
    adminFilterStatus: '状态',
    adminFilterReason: '原因',
    adminAll: '全部',
    adminColTimestamp: '时间',
    adminColHub: '中心',
    adminColTeam: '团队',
    adminColCount: '已提交',
    adminColHandoff: '交接',
    adminColStatus: '状态',
    adminColActual: '实际',
    adminColVariance: '差异',
    adminColReason: '原因',
    adminColMulticam: 'Multicam（退/换）',
    adminColCM5: 'CM5（退/换）',
    adminColActions: '操作',
    adminEmpty: '暂无提交',
    adminSdPending: '待入库SD卡',
    adminRetOpen: '待处理退还',
    adminOpenRmas: '待处理RMA',
    adminLastUpdated: '更新',
    adminExpand: '详情',
    adminCollapse: '隐藏',
    adminFaultLabel: '故障',
    adminMulticamIds: 'Multicam ID',
    adminCM5Ids: 'CM5 ID',
    adminAdminNotes: '管理员备注',
    adminUpdate: '更新',
    adminColSets: '套数（退/换）',

    setsReturning: '退还套数',
    setsNeeded: '需要的套数',
    setsHelp: '一"套" = 配对的Multicam + CM5 + 配件。不确定请填0。',

    replaceReminder: '仅在需要替换时寄回设备。无需替换的设备可在中心处理。'
  }
};

function t(key) {
  const en = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
  const zh = STRINGS.zh && STRINGS.zh[key];
  if (BILINGUAL && zh) {
    return LANG === 'zh' ? zh + ' / ' + en : en + ' / ' + zh;
  }
  const dict = STRINGS[LANG] || STRINGS.en;
  return dict[key] !== undefined ? dict[key] : key;
}
