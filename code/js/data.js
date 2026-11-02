/* StaffWare 2.0 – module definitions transcribed from the legacy Access screens.
   Button tuple: [label, requiredFilters, {kind, exp, exps, help}]
   requiredFilters: letters of filters that must be filled ("AIL|ABIL" = either set). */

const DIVISIONS = [
  { id: 'BAY', name: 'Tracy CA' },
  { id: 'REI', name: 'Elite' },
  { id: 'REW', name: 'Sacramento CA' },
];

const LOOKUPS = {
  customer: ['Taylor Morrison', 'Lennar', 'Pulte Homes', 'KB Home', 'Woodside Homes', 'Richmond American'],
  job: ['Esplanade at Madeira Ranch Estates', 'Esplanade at Turkey Creek', 'Mariposa at Winding Creek', 'Oakhaven at Winding Creek', 'Wildhawk 65 (Latitude)'],
  lot: ['329/C-7-2521', '330/B-10-2979', '331/C-7-2521', '373/C-7-2521', '531/A-10-2979', '1027/B-2-1529', '500/C-5-1792'],
  phase: ['Phase 1', 'Phase 2', 'Phase 3'],
  stage: ['Rough', 'Trim', 'Counter trim', 'Final', 'Temp power'],
  work: ['High voltage', 'Low voltage', 'Lighting', 'Alarm'],
  packtype: ['Standard pack', 'Options', 'Customs', 'Low Volt', 'Light fixtures'],
  invoice: ['INV-20418', 'INV-20419', 'INV-20420', 'INV-20421'],
  plan: ['Plan 1A', 'Plan 1B', 'Plan 2A', 'Plan 3C'],
  tm: ['T&M 5501', 'T&M 5502', 'T&M 5503'],
  po: ['18030', '17218', '17143', '16951', '16795'],
  vendor: ['Granite Electrical Supply', 'Wesco Distribution', 'Graybar', 'Border States'],
  item: ['BX-MT-1G-HB-EX', 'HD-CRMP-SLVE', 'MI-WN-YW', 'SP-STPL-ROM', 'WI-14-2-ROMEX', 'BX-PL-1G-NO-18CI', 'DE-PL-1G-DEC-WH', 'DE-SWSP-15A-DEC-WH'],
  invclass: ['BOX', 'CHIME', 'CONDUIT', 'DECO FIXTURE', 'DEVICE', 'LIGHT FIXTURES', 'WIRE'],
  popack: ['PK-1001', 'PK-1002', 'PK-1003'],
  bid: ['Bid 2026-014', 'Bid 2026-015', 'Bid 2026-016'],
  pmplan: ['PM Plan 101', 'PM Plan 102', 'PM Plan 103'],
  estbid: ['EST Bid 7001', 'EST Bid 7002'],
  estplan: ['EST Plan 301', 'EST Plan 302'],
  estpack: ['EST Pack 11', 'EST Pack 12'],
  employee: ['A. Alvarez', 'B. Chen', 'C. Davis', 'D. Okafor', 'E. Nguyen'],
  address: ['1021 Sunrise Ln', '1033 Sunrise Ln', '2210 Oakhaven Dr'],
  packname: [
    'Excerise Room at 1 Bay Garage', 'Exercise Room at Tandem', 'Exhaust Fan - with Switch - Bath 2',
    'Exhaust Fan - With Switch - Bath 3', 'Exhaust Fan - with switch - Laundry Room',
    'Exhaust Fan - with switch - Master Bedroom', 'Exhaust Fan - With Switch - Powder Room',
    'Exhaust Fan w/ Timer in Garage', 'Expanded 3 Car Garage - Elevation A', 'Expanded 3 Car Garage - Elevation B',
    'Expanded 3 Car Garage - Elevation C', 'Expanded CA Room', 'Expanded California Room-No FP (5 cans and 1 fan)',
    'Expanded Covered Patio', 'Expanded Dining Room Base & Uppers', 'Expanded Extended garage', 'Expanded Garage',
    'Expanded Great Room', 'Expanded Great Room ILO Outdoor Living', 'Expanded Island #1', 'Expanded Kitchen Cabinets',
    'Expanded Kitchen Island', 'Expanded Laundry Room', 'Expanded Loft', 'Standard Pack - Plan 1A', 'Whole House Fan',
  ],
  packcode: ['EXP-GAR-3A', 'EXP-GAR-3B', 'EXP-GRT-01', 'STD-1A'],
};

const OPEN_LOTS = [
  ['2031-09', 1, ''], ['2031-08', 1, ''], ['2030-07', 1, ''], ['2030-05', 1, ''],
  ['2026-10', 188, 87], ['2026-09', 277, 146], ['2026-08', 255, 222], ['2026-07', 249, 182],
  ['2026-06', 206, 155], ['2026-05', 120, 162], ['2026-04', 120, 142], ['2026-03', 64, 120],
  ['2026-02', 71, 91], ['2026-01', 145, 69], ['2025-12', 55, 38], ['2025-11', 24, 32],
  ['2025-10', 48, 55], ['2025-09', 50, 25], ['2025-08', 60, 19], ['2025-07', 66, 51],
  ['2025-06', 40, 27], ['2025-05', 49, 39], ['2025-04', 48, 43], ['2025-03', 27, 55],
  ['2025-02', 27, 45], ['2025-01', 190, 54], ['2024-12', 40, 26],
];

const F = (l, label, type = 'text', opt = null) => ({ l, label, type, opt });

const MODULES = [
  {
    code: 'MG', name: 'Management', color: '#f2b82e', tint: '#fff4d6', ink: '#3a2a00',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job', 'select', 'job'), F('C', 'Lot', 'select', 'lot'),
      F('D', 'Phase', 'select', 'phase'), F('E', 'From', 'date'), F('F', 'To', 'date'), F('G', 'Date', 'date'),
      F('H', 'Division', 'division'), F('I', 'Stage', 'select', 'stage'), F('J', 'Work', 'select', 'work'),
      F('K', 'Burden %', 'number'), F('', 'Active JC', 'list', 'job'),
    ],
    aside: 'openlots',
    sections: [
      { title: 'Data entry forms', cols: [[['Lot info detail', 'AB']]] },
      { title: 'Job cost', cols: [[
        ['Process job cost info', 'EFK', { kind: 'red' }], ['Clear job cost info', '', { kind: 'blue' }],
        ['Job cost builder/div', ''], ['Job cost by builder', 'H'], ['Job cost by job', 'H', { exp: 1 }],
        ['Job cost by phase', 'AH'], ['Job cost by job/lot', 'AB', { exp: 1 }], ['Job cost by super', 'H'],
        ['JC by builder/lot', 'AH', { exps: ['Exp1', 'Exp2'] }],
      ]] },
      { title: 'Reports', cols: [[
        ['Lots ready to close', 'G'], ['Lots ready to close-super', 'G'], ['Material posted to lot', 'ABC'],
        ['Counter material posted to lot', 'ABC'], ['Job cost packs no value', 'EF'],
        ['Labor paid vs budget open lots', 'AH'], ['Labor paid vs budget employee', 'EFH', { note: 'EFH*' }],
        ['Labor paid to lot', 'ABC'], ['Labor paid to lot date', 'ABCEF'], ['Lot budget vs job cost', 'ABCK'],
        ['Job cost by type of work', 'AEFJ'], ['Option pack scheduled by job', 'AEFH'], ['Open lots per period', 'EFH'],
      ]] },
    ],
  },
  {
    code: 'AR', name: 'Accounts receivable', color: '#7b4ea3', tint: '#f3ecfa', ink: '#fff',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job', 'select', 'job'), F('C', 'Lot', 'select', 'lot'),
      F('D', 'Phase', 'select', 'phase'), F('E', 'From', 'date'), F('F', 'To', 'date'),
      F('G', 'Pack type', 'select', 'packtype'), F('H', 'Date', 'date'), F('I', 'Division', 'division'),
      F('J', 'Invoice', 'select', 'invoice'), F('K', 'Plan', 'select', 'plan'), F('L', 'Burden', 'number'),
      F('M', 'T&M #', 'select', 'tm'),
    ],
    aside: 'snapshot',
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Process billing', 'AHI'], ['Process billing job', 'ABHI'], ['Manual invoice', ''], ['Manual fix billing code', 'IJ'],
      ]] },
      { title: 'Reports', cols: [[
        ['Pre billing detail', 'AI'], ['Pre billing summary', 'AI'], ['Invoices by date/div', 'EFI'],
        ['Inv summary by date/div', 'EFI'], ['Invoice', 'J'], ['Lot-pack to bill', 'AEFI'], ['Billing by super', 'HI'],
        ['Lot-pack by type to bill', 'AEFGI'],
      ], [
        ['Lots by plan', 'ABK'], ['Total billing by lot', 'ABC'], ['WIP', 'AIL|ABIL', { exp: 1, note: 'AIL or ABIL' }],
        ['WIP timed', 'AEFI'], ['WIP lot', 'ABCL'], ['WIP T&M', 'ABM'], ['Sequence sheet billing data', 'ABD'],
      ]] },
      { title: 'Action buttons', cols: [[
        ['Post billing', 'AHI', { kind: 'red' }], ['Clear billing snapshot', 'AI', { kind: 'red' }], ['Fix billing code', 'I', { kind: 'blue' }],
      ]] },
    ],
  },
  {
    code: 'IC', name: 'Inventory control', color: '#f4d65a', tint: '#fffae0', ink: '#3a2f00',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job', 'select', 'job'), F('C', 'Lot', 'select', 'lot'),
      F('D', 'From', 'date'), F('E', 'To', 'date'), F('F', 'Date', 'date'), F('G', 'Division', 'division'),
      F('H', 'Inv item', 'select', 'item'),
    ],
    aside: 'invdates',
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Inventory item', ''], ['Item research', ''], ['Counter material by ID OLD', 'ABF'], ['Counter material by name', 'ABF'],
        ['Counter material lot', 'ABF'], ['Process pack material', ''], ['Inv transaction adjustment', '', { kind: 'blue' }],
        ['Receive PO material', ''],
      ]] },
      { title: 'Inventory count', cols: [[
        ['Process inventory count', 'DEFG', { kind: 'blue' }], ['Enter inventory count', 'FG'],
        ['Post inventory count', 'FG', { kind: 'blue' }], ['Export inventory count', 'FG'],
      ], [
        ['Inventory count/value', 'FG'], ['Inventory value summ', 'FG'], ['Top 20 value disc', 'FG'], ['Top 20 quantity disc', 'FG'],
      ]] },
      { title: 'Reports', cols: [[
        ['Item list full', 'G'], ['Export item list', ''], ['Item list - LARGE', 'G'], ['Lot packs unposted', 'DEG'],
        ['Job/lot packs unposted', 'AB'], ['Exp material unposted', 'DEG'], ['Item back shipped', 'H'],
        ['Material posted to lot', 'ABC'], ['Material posted JC by class', 'DEG'], ['Material posted JC value', 'DEG'],
      ], [
        ['Counter material by job/plan', 'ADE'], ['Counter material plan detail', 'ABDE'], ['Counter material by super', 'DE', { exp: 1 }],
        ['Counter material by super/reason', 'DE'], ['Counter material by reason', 'DEG'], ['Counter material by inv class', 'DEG', { exp: 1 }],
        ['Counter material by job/lots', 'ABDE'], ['Counter material by lot', 'ABC'], ['Counter sheets entered', 'DE', { note: 'DEname' }],
      ], [
        ['Inv item transac history', 'DEH'], ['Inv item JC transac detail', 'FH'], ['Need to order items', 'G'],
        ['Negative on hand qty', '', { exp: 1 }], ['Material transactions', 'DEG', { exp: 1 }], ['Exp on hand qty check', 'FG'],
        ['Current inventory detail', 'G'], ['Current inventory summary', 'G'], ['Inventory dated value', 'FG'],
        ['Exp material posted JC', 'DEG'], ['Exp mat posted monthly JC', 'DEG'],
      ]] },
      { title: 'Action buttons', cols: [[
        ['Post packs to job cost', 'G', { kind: 'red' }], ['Update on hand/order qty', 'G', { kind: 'red' }],
      ]] },
    ],
  },
  {
    code: 'PO', name: 'Purchasing', color: '#4a72b0', tint: '#eaf1fb', ink: '#fff',
    filters: [
      F('A', 'From', 'date'), F('B', 'To', 'date'), F('C', 'PO number', 'select', 'po'), F('D', 'Vendor', 'select', 'vendor'),
      F('E', 'Inventory item', 'select', 'item'), F('F', 'Division', 'division'), F('G', 'Inventory class', 'select', 'invclass'),
      F('H', 'PO pack num', 'select', 'popack'),
    ],
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Purchase order', ''], ['Inventory item', ''], ['Item research', ''], ['Receive PO material', ''],
        ['Billed PO material', ''], ['Vendors', ''], ['Vendor categories', ''], ['PO pack', ''],
      ]] },
      { title: 'Reports', cols: [[
        ['View purchase order', 'C', { exp: 1 }], ['Material back ordered', ''], ['Material back order period', 'AB'],
        ['Material back order vendor', 'DF'], ['Mat back order vendor div', 'DF'], ['Material overages period', 'AB'],
        ['Item research list', ''], ['Item research list detail', ''], ['Material not invoiced', 'D'],
      ], [
        ['PO item history', 'E'], ['PO item history export', 'E'], ['PO item history by class', 'ABG'],
        ['Material order estimate', 'ABF'], ['Need to order items', 'F'], ['Material ordered by co', 'AB'],
        ['Material ordered by vendor', 'ABD'], ['Material price fluctuation', 'F'], ['PO by div/vendor', 'ABDF', { exp: 1 }],
      ], [
        ['Compare vendor prices', 'AB'], ['New created items', 'AB'], ['PO material received', 'C'],
        ['Search if item is in use', 'E'], ['View PO pack', 'H'], ['View PO pack material', 'H'],
        ['Negative on hand qty', ''], ['Low estimating prices', ''], ['Items with zero value', ''],
      ]] },
      { title: 'Action buttons', cols: [[
        ['Post Purchase order', 'C', { kind: 'red' }], ['Update item prices', '', { kind: 'blue' }],
      ]] },
    ],
  },
  {
    code: 'ES', name: 'Estimating', color: '#86963f', tint: '#f3f6e6', ink: '#fff',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job', 'select', 'job'), F('C', 'PM bid', 'select', 'bid'),
      F('D', 'PM plan', 'select', 'pmplan'), F('E', 'EST bid', 'select', 'estbid'), F('F', 'EST plan', 'select', 'estplan'),
      F('G', 'EST pack', 'select', 'estpack'),
    ],
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Inventory item', ''], ['Customer job bid setup', ''], ['Assembly bid management', 'ABE'],
        ['Material bid management', 'ABE'], ['Master assembly', '', { route: '#/assemblies' }], ['Job history log', ''],
      ]] },
      { title: 'Reports', cols: [[
        ['Low estimating prices', ''], ['Job history log', 'AB'], ['Bid full detail', 'ABE'],
      ]] },
      { title: 'Action buttons', cols: [[
        ['Update item prices', '', { kind: 'blue' }], ['Update assembly item prices', '', { kind: 'blue' }],
      ], [
        ['Transfer bid data to PM', 'ABCE', { kind: 'red' }], ['Transfer plan data to PM', 'ABCEF', { kind: 'red' }],
        ['Transfer pack data to PM', 'ABCDEFG', { kind: 'red' }],
      ]] },
    ],
  },
  {
    code: 'PM', name: 'Plan management', color: '#b9cc8a', tint: '#f4f8e9', ink: '#2c3a10',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job', 'select', 'job'), F('C', 'Bid', 'select', 'bid'),
      F('D', 'PM plan', 'select', 'pmplan'), F('E', 'Inv item', 'select', 'item'), F('F', 'Pack type', 'select', 'packtype'),
      F('G', 'Division', 'division'), F('H', 'From', 'date'), F('I', 'To', 'date'),
      F('J', 'Pack name', 'combo', 'packname'), F('K', 'Pack words', 'text'), F('L', 'Pack code', 'select', 'packcode'),
    ],
    actionFilters: [
      F('A', 'From job', 'select', 'job'), F('B', 'From bid', 'select', 'bid'), F('C', 'From plan', 'select', 'plan'),
      F('D', 'From pack', 'select', 'popack'), F('D*', 'From code', 'select', 'packcode', ), F('E', 'To job', 'select', 'job'),
      F('F', 'To bid', 'select', 'bid'), F('G', 'To plan', 'select', 'plan'),
    ],
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Customer job bid setup', ''], ['Plan management', 'ABC'], ['Edit pack material', 'AEF', { kind: 'blue' }], ['Material substitution', ''],
      ]] },
      { title: 'Reports', cols: [[
        ['Plan standard data', 'ABCD'], ['Plan full data', 'ABC'], ['Job list by division', ''], ['Active plans', 'G'],
        ['Customer standard prices', 'A'], ['Customer option prices', 'A'], ['Bid cost per customer', 'A'], ['Bid cost per bid', 'ABC'],
      ], [
        ['Bid cost current prices', 'ABC'], ['Bid cost per plan', 'ABCD'], ['Bid wire price check', 'G'], ['Pack search', 'GJ'],
        ['Pack key words search', 'GK'], ['Pack code search', 'GL'], ['Exp option prices', 'A'],
      ]] },
      { title: 'Action buttons', action: true, cols: [[
        ['Duplicate bid', 'ABEF', { kind: 'peach' }], ['Duplicate plan', 'ABCEF', { kind: 'peach' }], ['Duplicate pack', 'ABCDEFG', { kind: 'peach' }],
      ], [
        ['Update zero item cost', '', { kind: 'red' }], ['Delete plan data', 'ABC', { kind: 'blue' }],
        ['Import bid est price', 'ABC', { kind: 'blue' }], ['Update bid item prices', 'ABC', { kind: 'blue' }],
      ]] },
    ],
  },
  {
    code: 'PR', name: 'Payroll', color: '#a9bf7a', tint: '#f3f7e8', ink: '#2c3a10',
    filters: [
      F('A', 'Customer', 'select', 'customer'), F('B', 'Job/Project', 'select', 'job'), F('C', 'Lot', 'select', 'lot'),
      F('D', 'From', 'date'), F('E', 'To', 'date'), F('F', 'Date', 'date'), F('G', 'Division', 'division'),
      F('H', 'Employee', 'select', 'employee'), F('I', 'Lot address', 'select', 'address'),
    ],
    aside: 'payroll',
    sections: [
      { title: 'Data entry forms', cols: [[
        ['Process piece timecard', 'FG'], ['Process hourly timecard', 'FG'], ['Employee list', ''],
        ['Process payroll', 'DEFG|FG', { icon: '▦', note: 'DEFG | FG' }], ['Process hourly old timecard', 'F'],
      ]] },
      { title: 'Reports', badge: 'Payroll in progress', cols: [[
        ['Hourly', 'F'], ['Hourly for job', 'ABF'], ['Piece & [hourly]', 'F'], ['Piece & [hourly] summ', 'F'],
        ['Employee totals', 'F'], ['Employee & dates', ''], ['Open labor', 'ABC'], ['Hourly detail by super', 'DEG'],
        ['Hourly summ by super', 'DEG'], ['Hourly summ by work', 'DE'],
      ], [
        ['Employee last check', 'G'], ['Timecard', 'DEH'], ['Posted weekly payroll', 'F'], ['Export payroll', 'F'],
        ['Address lot search', 'I'], ['Labor paid to lot', 'ABC', { exp: 1 }], ['Labor paid to job', 'AB'],
        ['Labor paid to job dated', 'ABDE'], ['Labor paid to employee', 'DEH'], ['Labor paid all employees', 'DEG'],
        ['Labor div summary', 'DE'], ['Labor paid by division', 'DEG'], ['Labor paid by builder', 'DEG'],
      ], [
        ['Employee full list', 'G'], ['Employee active list', 'G'], ['Terminated employees', 'G'],
        ['Employee active detail', 'G'], ['Exp labor paid to job', 'ABG', { help: 'Exports labor paid to job to CSV for the selected customer, job and division.' }],
      ]] },
      { title: 'Action buttons', cols: [[
        ['Append hourly to piece', 'F', { kind: 'red' }], ['Post payroll', 'F', { kind: 'red' }], ['Post payroll (new)', 'F', { kind: 'blue' }],
      ]] },
    ],
  },
  { code: 'AM', name: 'Alarm monitoring', stub: true },
  { code: 'CM', name: 'Contract management', stub: true },
  { code: 'CS', name: 'Customer service', stub: true },
  { code: 'CX', name: 'Cox cable', stub: true, legacy: true },
  { code: 'DM', name: 'Database maintenance', stub: true },
  { code: 'FM', name: 'Foreman reports', stub: true },
  { code: 'JS', name: 'Job setup', stub: true },
  { code: 'PU', name: 'Public', stub: true },
  { code: 'SA', name: 'Sales', stub: true },
  { code: 'SC', name: 'Scheduling', stub: true },
  { code: 'TM', name: 'Time and material (PO)', stub: true },
];

/* Master assemblies (Estimating → Master assembly) */
const ASSEMBLY_GROUPS = ['REW', 'REI', 'REW - Light Fixtures', 'Vegas - Base Assemblies', 'Vegas - Low Volt Assemblies',
  'Vegas - Option Assemblies', 'z-Mstr Base Assemblies', 'z-Mstr Base Assemblies (Original Combined)', 'z-Mstr Misc Assemblies', 'z-RENO', 'Z.donotuse'];

const ASSEMBLY_TYPES = {
  REW: ['01- Standard pack', '01.1 Standard pack - Copperweld Lennar', '02- Customs', '03- Options', '04- Low Volt - Security Alarm',
    '05- Low Volt - Struct Wiring', '06- Low Volt - Surround Sound', '07- Low Volt - Whole House Audio', '08- Low Volt - Intercom',
    '09- Central Vacuum', '10- Air Treatments', '11- Multi-Family - Gear, House Lts, etc.', '12- Utility Assemblies', '13- Utility Trench',
    '14- Temp Power', '15- JMC Light Fixtures', '16- Home Automation', '17- Street lighting', '18- Alarm Kit Lennar',
    '19- Square D QO Breakers/Energy Center', '20- Span', 'z-Std pack Teco (NO LONGER BEING USED)', 'z-Home Automation'],
  REI: ['01 Alarm', '02 Automation', '03 Cameras', '04 Central Vacuum', '05 Components (Spkrs,AV,Network,Plasma Pre Wire)',
    '06 Energy Management', '07 Furniture, Brackets, Safes and Racks', '08 HVAC', '09 Intercom', '10 Labor', '11 Lighting', '12 Nexia',
    '13 Structured Wiring', '14 Surround Sound', '15 Whole House Audio', '16 Mis. Purchase', '17 After Market', '19 HDMI & Patch Cables',
    '20 AV Receiver', '21 Networking', '23. Custom Components', '24 Model Homes', '25 White Glove'],
};

const I = (item, qty, stage, work, price) => ({ item, qty, stage, work, status: 'Active', price, nochange: 'No' });
const ASSEMBLIES = {
  REW: [
    { name: '01a. Ceiling Light - (4-0 Metal) Exterior PK', desc: '', notes: '' },
    { name: '01a. Ceiling Light - (4-0 Plastic) Exterior BH', desc: 'Traverse', notes: '' },
    { name: '01a. Ceiling Light - (4-0 Plastic) Interior BH', desc: '', notes: '' },
    { name: '01b. Ceiling Light - (3-0 Plastic) Interior Nail-On', desc: '', notes: '' },
    { name: '01c. Ceiling Light - (4-0 Plastic) Interior Nail-On', desc: '', notes: 'Traverse' },
    { name: '02a. Bracket Light - (4-0 Pancake) Exterior (3-Coat Stucco/Siding)', desc: 'Includes EPC 4/0 Quickflash', notes: '' },
    { name: '02b. Bracket Light - (3-0 Nail on) Exterior (3 Coat Stucco)', desc: 'Includes 7/8" Quickflash', notes: '' },
    { name: '03a. Sw 1G- S', desc: '', notes: '' },
    { name: '03b. Sw 1G- S3', desc: '', notes: '' },
    { name: '06a. Sw 2G- S S3', desc: '', notes: 'Added 30\' per 3W on all Units' },
    { name: '10d. Combo 2G- S S (Tog-Dec) Combo Plate Only', desc: 'Vacancy Sensor & Astro', notes: 'This is intended with an occ sensor' },
    { name: '11a. Recepts 2G- Plug Plug (Dup-Dup) (Tamp Res)', desc: 'Tamper Resistant Recept', notes: '' },
    { name: '13a. Sw 1G- S (Dec)', desc: '', notes: '', items: [
      I('HD-CRMP-SLVE', 1, 'Rough', 'High voltage', 0.08755), I('MI-WN-YW', 2, 'Rough', 'High voltage', 0.03296),
      I('SP-STPL-ROM', 3, 'Rough', 'High voltage', 0.012339), I('WI-14-2-ROMEX', 20, 'Rough', 'High voltage', 0.29561),
      I('BX-PL-1G-NO-18CI', 1, 'Rough', 'High voltage', 0.408873), I('DE-PL-1G-DEC-WH', 1, 'Trim', 'High voltage', 0.169697),
      I('DE-SWSP-15A-DEC-WH', 1, 'Trim', 'High voltage', 1.284136)] },
    { name: '16a. Sw 2G- S S3 (Dec)', desc: '', notes: '', items: [
      I('BX-PL-2G-NO-48CI', 1, 'Rough', 'High voltage', 2.22068), I('HD-CRMP-SLVE', 1, 'Rough', 'High voltage', 0.08755),
      I('MI-WN-RD', 2, 'Rough', 'High voltage', 0.03502), I('SP-STPL-ROM', 3, 'Rough', 'High voltage', 0.012339),
      I('WI-14-2-ROMEX', 20, 'Rough', 'High voltage', 0.29561), I('WI-14-3-ROMEX', 30, 'Rough', 'High voltage', 0.415914),
      I('DE-PL-2G-DEC-WH', 1, 'Trim', 'High voltage', 0.375257), I('DE-SW3W-15A-DEC-WH', 1, 'Trim', 'High voltage', 1.636525),
      I('DE-SWSP-15A-DEC-WH', 1, 'Trim', 'High voltage', 1.284136)] },
    { name: '17a. Sw 4G- S S S3 (Dec)', desc: '', notes: '' },
  ],
  REI: [
    { name: 'CAM - 02 - CAM 8ch NVR with 4TB Hard Drive', desc: 'N8NRE4TB', notes: 'JW' },
    { name: 'CAM - 02 - CAM Northern Video Dome Camera', desc: 'NTH-DWMVIR', notes: 'ES', items: [
      I('HA-CAM-OUTDR-FLIR-2.1MP', 1, 'Counter trim', 'Low voltage', 50.47)] },
    { name: 'CAM - 02 - CAM Speco 5MP x4 w/ 2TB Kit', desc: '5MP & 2TB', notes: 'JW' },
    { name: 'CAM - 02 - CAM Speco Intensifier3 Video Dome Camera', desc: 'HT7246IHR', notes: 'SP' },
    { name: 'CAM - 02 - CAM Speco Video Bullet Camera', desc: 'CVC5100BPVF', notes: 'SP' },
    { name: 'CAM - 02 - CAM Wirepath 2MP IP Dome Camera White - Luma 700', desc: 'WPS-750-DOM-IP-WH', notes: 'BM', items: [
      I('HA-DVR-16CH-8TB', 1, 'Counter trim', 'Low voltage', 647.87)] },
    { name: 'CAM - 03 - DVR Wirepath 4 channel DVR', desc: 'WPS-100-DVR-4CH', notes: 'BM' },
    { name: 'CAM - 03 - DVR Wirepath 8 Channel DVR', desc: 'WPS-100-DVR-8CH', notes: 'ES' },
    { name: 'CAM - 03 - DVR Speco 16 Channel DVR', desc: 'SO-D16WCS2TB', notes: 'SP', items: [
      I('HA-NVR-4CH-LUMA', 1, 'Trim', 'Low voltage', 579.3132)] },
    { name: 'CAM - 04 - PWR Northern 4 Channel Power supply 24V, 1.6A', desc: 'NTH-AC411UL', notes: 'BM' },
  ],
};

/* Report fixtures */
const TWIP = [
  { head: 'Taylor Morrison | Esplanade at Madeira Ranch Estates - REW', rows: [
    ['329/C-7-2521', '2026-10-05', 2614.39, 2659.39, 77.5, 3, 4678.58, 4715.41, 23.21, 0, 10321.46, 10829.46, 1548.22, 9281.24, 2665.91, 26, 3089.22, 29, 1445.71, 93],
    ['330/B-10-2979', '2026-10-05', 2860.99, 3049.74, 77.5, 3, 5091.65, 5788.52, 23.21, 0, 11235.93, 14972.93, 1685.39, 13287.54, 2888.69, 26, 5686.06, 38, 1582.88, 94],
    ['331/C-7-2521', '2026-10-05', 2614.39, 2745.64, 77.5, 3, 4678.58, 5012.91, 23.21, 0, 10321.46, 12944.46, 1548.22, 11396.24, 2665.91, 26, 4797.41, 37, 1445.71, 93],
    ['373/C-7-2521', '2026-10-05', 2614.39, 2874.39, 0, 0, 4678.58, 5379.62, 0, 0, 10321.46, 14088.46, 0, 12538.24, 2665.91, 26, 5415.53, 38, 0, 0],
  ] },
  { head: 'Taylor Morrison | Esplanade at Turkey Creek - REW', rows: [
    ['1027/B-2-1529', '2026-10-19', 1871.61, 1871.61, 0, 0, 3828.9, 3828.9, 298.9, 8, 9073.45, 9073.45, 0, 9073.45, 3076.2, 34, 3076.2, 34, 0, 0],
    ['500/C-5-1792', '2026-10-19', 1904.28, 1904.28, 0, 0, 3958.43, 3958.43, 298.9, 8, 9335.65, 9335.65, 0, 9335.65, 3166.17, 34, 3166.17, 34, 0, 0],
    ['501/A-3-1651', '2026-10-19', 1844.39, 1844.39, 0, 0, 3867.74, 3867.74, 298.9, 8, 8898.65, 8898.65, 0, 8898.65, 2886.77, 32, 2886.77, 32, 0, 0],
  ] },
  { head: 'Taylor Morrison | Mariposa at Winding Creek - REW', rows: [
    ['139/C-45-11-2250', '2026-10-19', 2563.13, 2563.13, 28.75, 1, 5016.65, 5016.65, 241.72, 5, 10753.08, 10753.08, 0, 10753.08, 2784.51, 26, 2784.51, 26, -289.2, 0],
    ['140/A-45-11-2250', '2026-10-19', 2563.13, 2563.13, 28.75, 1, 5016.65, 5016.65, 241.72, 5, 10753.08, 10753.08, 0, 10753.08, 2784.51, 26, 2784.51, 26, -289.2, 0],
  ] },
  { head: 'Taylor Morrison | Wildhawk 65 (Latitude) - REW', rows: [
    ['293/B-20-3392', '2026-10-14', 3144.28, 3171.78, 67.5, 2, 4668.63, 4713.23, 208.62, 4, 12453, 12848, 1867.95, 10980.05, 4278.28, 34, 4597.72, 36, 1575.66, 84],
    ['304/D-17-2512', '2026-10-14', 2619.53, 2639.53, 92.5, 4, 3960.09, 4001.33, 208.62, 5, 10524, 10819, 1578.6, 9240.4, 3637.48, 35, 3868.04, 36, 1261.31, 80],
  ] },
];

const INV_VALUE = [
  ['BOX', 284433.59, 283957.63, 283957.63], ['CHIME', 45834.64, 45605.55, 45605.55], ['CLOTHING', 0, 0, 0],
  ['CONDUIT', 40328.88, 39485.19, 39485.19], ['COPPER WELD', 34635.16, 34635.16, 34635.16], ['CUTLER', 151587.87, 150789.81, 150789.81],
  ['CVAC', 48.75, 52.69, 52.69], ['DECO FIXTURE', 401923.03, 399746.64, 399746.64], ['DEVICE', 388747.99, 391122.47, 391122.47],
  ['EQUIP RENTAL', 0, 0, 0], ['FAN', 14767.4, 14684.18, 14684.18], ['FIRE PROTECTION', 51890.08, 49430.76, 49430.76],
  ['FITTING', 50316.52, 52619.09, 52619.09], ['GAS', 0, 0, 0], ['HARDWARE', 19724.92, 19815.78, 19815.78], ['HOMEAUTO', 0, 0, 0],
  ['IS', 15217.71, 15152.33, 15152.33], ['LABOR', -15, -15, -15], ['LAMP', 12680.82, 12653.82, 12653.82],
  ['LIGHT FIXTURES', 568727.27, 574448.06, 574448.06], ['MISC', 4683611.29, 157687.29, 157687.29], ['ONQ', 19620.39, 19663.23, 19663.23],
  ['SEM', 4407.46, 4407.46, 4407.46], ['SPAN', 39210.07, 39239.23, 39239.23], ['SQD', 395424.9, 395563.93, 395563.93],
  ['SUPPORT', 41742.55, 41719.17, 41719.17], ['UNDERGROUND', 135.3, 135.3, 135.3], ['WIRE', 688793.68, 651697.68, 651697.68],
  ['WP', 29571.11, 29754.89, 29754.89], ['ZOBSOLETE', 30321.33, 30294.95, 30294.95],
];

const PO_HISTORY = [
  ['BAY', [[14835, '2023-09-27', 'Granite Electrical Supply', 50, 50, 3.56], [13433, '2022-06-30', 'Wesco Distribution', 50, 50, 2.0006]]],
  ['REW', [[18030, '2026-09-30', 'Granite Electrical Supply', 100, 100, 2.9275], [17218, '2025-11-25', 'Granite Electrical Supply', 20, 20, 2.9275],
    [17143, '2025-10-27', 'Granite Electrical Supply', 50, 50, 2.9275], [16951, '2025-08-26', 'Granite Electrical Supply', 50, 50, 2.9275],
    [16795, '2025-06-30', 'Granite Electrical Supply', 100, 100, 2.9275], [16220, '2024-11-25', 'Wesco Distribution', 100, 100, 2.0006],
    [16173, '2024-11-11', 'Granite Electrical Supply', 20, 20, 1.31738], [16133, '2024-10-25', 'Wesco Distribution', 200, 200, 2.0006],
    [15822, '2024-07-18', 'Granite Electrical Supply', 50, 50, 3.56], [15122, '2023-12-21', 'Wesco Distribution', 100, 100, 2.0006],
    [14078, '2023-01-25', 'Wesco Distribution', 100, 100, 2.0006], [12159, '2021-06-25', 'Wesco Distribution', 20, 20, 1.76],
    [12044, '2021-05-26', 'Wesco Distribution', 50, 100, 1.5316], [11499, '2020-12-18', 'Wesco Distribution', 25, 25, 1.409]]],
];

const INV_DATES = [['2026-10-02', 'REW'], ['2026-09-25', 'REI'], ['2026-06-25', 'REW'], ['2026-06-19', 'REI'], ['2026-04-03', 'REW'],
  ['2026-03-22', 'REI'], ['2025-12-19', 'REI'], ['2025-12-18', 'REW'], ['2025-09-26', 'REI'], ['2025-09-25', 'REW'], ['2025-06-27', 'REI'],
  ['2025-06-26', 'REW'], ['2025-04-04', 'REW'], ['2025-03-21', 'REI'], ['2024-12-20', 'REI'], ['2024-12-20', 'REW']];

const PAID_DATES = [['10/23/2026', 'REW'], ['10/21/2026', 'REW'], ['10/20/2026', 'REI'], ['10/16/2026', 'REW'], ['10/14/2026', 'REW'],
  ['10/13/2026', 'REI'], ['10/9/2026', 'REW'], ['10/7/2026', 'REW'], ['10/6/2026', 'REI'], ['10/1/2026', 'REW'], ['9/30/2026', 'REW']];
