// Seed data for the Riverside Suburban Medical Clinic EHR prototype.
// Dates are generated relative to "today" so the dashboard always looks alive.

const iso = (d) => d.toISOString()
const dateOnly = (d) => d.toISOString().slice(0, 10)

function dayOffset(days, hour = 9, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, min, 0, 0)
  return d
}

export function buildSeed() {
  const today = dateOnly(new Date())

  const users = [
    {
      id: 'u-admin',
      username: 'admin',
      password: 'admin123',
      name: 'Sarah Naidoo',
      role: 'admin',
      title: 'System Administrator',
    },
    {
      id: 'u-doc-1',
      username: 'dmoyo',
      password: 'doctor123',
      name: 'Dr. Thabo Moyo',
      role: 'doctor',
      title: 'General Practitioner',
      speciality: 'Family Medicine',
    },
    {
      id: 'u-doc-2',
      username: 'dpatel',
      password: 'doctor123',
      name: 'Dr. Aisha Patel',
      role: 'doctor',
      title: 'General Practitioner',
      speciality: 'Internal Medicine',
    },
    {
      id: 'u-recep',
      username: 'reception',
      password: 'front123',
      name: 'Lerato Khumalo',
      role: 'receptionist',
      title: 'Front Desk Receptionist',
    },
  ]

  const doctors = users.filter((u) => u.role === 'doctor')

  const pharmacies = [
    { id: 'ph-1', name: 'Riverside Pharmacy', phone: '011 555 0101' },
    { id: 'ph-2', name: 'Clicks Northgate', phone: '011 555 0202' },
    { id: 'ph-3', name: 'Dis-Chem Riverside Mall', phone: '011 555 0303' },
  ]

  const patients = [
    {
      id: 'p-1',
      firstName: 'Nomvula',
      lastName: 'Dlamini',
      idNumber: '8504125678083',
      dob: '1985-04-12',
      gender: 'Female',
      phone: '082 345 6789',
      email: 'nomvula.dlamini@example.com',
      address: '14 Acacia Road, Riverside',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: 'DH-449201',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      visits: [
        {
          id: 'v-1',
          date: '2026-03-02',
          doctorId: 'u-doc-1',
          reason: 'Blood pressure review',
          notes: 'BP 142/90. Continue amlodipine. Advised low-salt diet.',
        },
      ],
    },
    {
      id: 'p-2',
      firstName: 'Sipho',
      lastName: 'Mthembu',
      idNumber: '7811235432081',
      dob: '1978-11-23',
      gender: 'Male',
      phone: '083 222 1190',
      email: 'sipho.mthembu@example.com',
      address: '7 Kingfisher Close, Riverside',
      medicalAidScheme: 'Bonitas',
      medicalAidNumber: 'BN-771204',
      allergies: [],
      chronicConditions: ['Type 2 Diabetes'],
      visits: [
        {
          id: 'v-2',
          date: '2026-04-18',
          doctorId: 'u-doc-2',
          reason: 'Diabetes follow-up',
          notes: 'HbA1c 7.8%. Adjusted metformin dose. Foot exam normal.',
        },
      ],
    },
    {
      id: 'p-3',
      firstName: 'Ayesha',
      lastName: 'Khan',
      idNumber: '9302145678089',
      dob: '1993-02-14',
      gender: 'Female',
      phone: '084 998 2231',
      email: 'ayesha.khan@example.com',
      address: '22 Heron Avenue, Riverside',
      medicalAidScheme: 'Momentum Health',
      medicalAidNumber: 'MM-220487',
      allergies: ['Sulfa drugs', 'Latex'],
      chronicConditions: ['Asthma'],
      visits: [],
    },
    {
      id: 'p-4',
      firstName: 'Johan',
      lastName: 'van der Merwe',
      idNumber: '6607075678088',
      dob: '1966-07-07',
      gender: 'Male',
      phone: '082 776 5540',
      email: 'johan.vdm@example.com',
      address: '3 Weaver Street, Riverside',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: 'DH-118822',
      allergies: ['Aspirin'],
      chronicConditions: ['High cholesterol', 'Hypertension'],
      visits: [
        {
          id: 'v-3',
          date: '2026-05-09',
          doctorId: 'u-doc-1',
          reason: 'Annual check-up',
          notes: 'Cholesterol elevated. Started atorvastatin. Repeat lipids in 3 months.',
        },
      ],
    },
    {
      id: 'p-5',
      firstName: 'Thandeka',
      lastName: 'Nkosi',
      idNumber: '0001011234086',
      dob: '2000-01-01',
      gender: 'Female',
      phone: '081 334 8890',
      email: 'thandeka.nkosi@example.com',
      address: '41 Robin Lane, Riverside',
      medicalAidScheme: 'None (Private)',
      medicalAidNumber: '',
      allergies: [],
      chronicConditions: [],
      visits: [],
    },
    {
      id: 'p-6',
      firstName: 'Pieter',
      lastName: 'Botha',
      idNumber: '5912255678087',
      dob: '1959-12-25',
      gender: 'Male',
      phone: '083 110 4423',
      email: 'pieter.botha@example.com',
      address: '9 Swallow Crescent, Riverside',
      medicalAidScheme: 'Medihelp',
      medicalAidNumber: 'MH-330091',
      allergies: ['Codeine'],
      chronicConditions: ['COPD', 'Hypertension'],
      visits: [
        {
          id: 'v-4',
          date: '2026-02-20',
          doctorId: 'u-doc-2',
          reason: 'Shortness of breath',
          notes: 'COPD exacerbation. Prescribed prednisone course and inhaler review.',
        },
      ],
    },
    {
      id: 'p-7',
      firstName: 'Fatima',
      lastName: 'Adams',
      idNumber: '8807305678082',
      dob: '1988-07-30',
      gender: 'Female',
      phone: '084 552 1178',
      email: 'fatima.adams@example.com',
      address: '18 Sunbird Road, Riverside',
      medicalAidScheme: 'Bonitas',
      medicalAidNumber: 'BN-660145',
      allergies: [],
      chronicConditions: ['Hypothyroidism'],
      visits: [],
    },
    {
      id: 'p-8',
      firstName: 'Lwazi',
      lastName: 'Zulu',
      idNumber: '9510185678084',
      dob: '1995-10-18',
      gender: 'Male',
      phone: '082 909 3321',
      email: 'lwazi.zulu@example.com',
      address: '5 Falcon Way, Riverside',
      medicalAidScheme: 'Discovery Health',
      medicalAidNumber: 'DH-905512',
      allergies: ['Peanuts'],
      chronicConditions: [],
      visits: [],
    },
  ]

  const appointments = [
    {
      id: 'a-1',
      patientId: 'p-1',
      doctorId: 'u-doc-1',
      start: iso(dayOffset(0, 9, 0)),
      durationMin: 30,
      reason: 'Hypertension review',
      status: 'scheduled',
      reminderSent: false,
    },
    {
      id: 'a-2',
      patientId: 'p-2',
      doctorId: 'u-doc-2',
      start: iso(dayOffset(0, 10, 0)),
      durationMin: 30,
      reason: 'Diabetes follow-up',
      status: 'scheduled',
      reminderSent: true,
    },
    {
      id: 'a-3',
      patientId: 'p-4',
      doctorId: 'u-doc-1',
      start: iso(dayOffset(0, 11, 0)),
      durationMin: 30,
      reason: 'Lipid results discussion',
      status: 'scheduled',
      reminderSent: false,
    },
    {
      id: 'a-4',
      patientId: 'p-6',
      doctorId: 'u-doc-2',
      start: iso(dayOffset(1, 9, 30)),
      durationMin: 30,
      reason: 'COPD check',
      status: 'scheduled',
      reminderSent: false,
    },
    {
      id: 'a-5',
      patientId: 'p-3',
      doctorId: 'u-doc-1',
      start: iso(dayOffset(2, 14, 0)),
      durationMin: 30,
      reason: 'Asthma review',
      status: 'scheduled',
      reminderSent: false,
    },
  ]

  const queue = [
    {
      id: 'q-1',
      number: 1,
      patientId: 'p-5',
      reason: 'Sore throat',
      status: 'waiting',
      addedAt: iso(dayOffset(0, 8, 15)),
    },
    {
      id: 'q-2',
      number: 2,
      patientId: 'p-7',
      reason: 'Repeat script',
      status: 'waiting',
      addedAt: iso(dayOffset(0, 8, 40)),
    },
  ]

  const invoices = [
    {
      id: 'inv-1',
      number: 'INV-1001',
      patientId: 'p-1',
      date: '2026-03-02',
      items: [
        { id: 'it-1', description: 'Consultation', type: 'consultation', qty: 1, unitPrice: 650 },
        { id: 'it-2', description: 'Blood pressure monitoring', type: 'procedure', qty: 1, unitPrice: 180 },
        { id: 'it-3', description: 'Amlodipine 5mg (30)', type: 'medication', qty: 1, unitPrice: 120 },
      ],
      payments: [{ id: 'pay-1', amount: 950, method: 'Medical Aid', date: '2026-03-05' }],
      status: 'paid',
    },
    {
      id: 'inv-2',
      number: 'INV-1002',
      patientId: 'p-2',
      date: '2026-04-18',
      items: [
        { id: 'it-4', description: 'Consultation', type: 'consultation', qty: 1, unitPrice: 650 },
        { id: 'it-5', description: 'HbA1c blood test', type: 'procedure', qty: 1, unitPrice: 320 },
        { id: 'it-6', description: 'Metformin 850mg (60)', type: 'medication', qty: 1, unitPrice: 95 },
      ],
      payments: [{ id: 'pay-2', amount: 500, method: 'Cash', date: '2026-04-18' }],
      status: 'partial',
    },
    {
      id: 'inv-3',
      number: 'INV-1003',
      patientId: 'p-4',
      date: '2026-05-09',
      items: [
        { id: 'it-7', description: 'Consultation', type: 'consultation', qty: 1, unitPrice: 650 },
        { id: 'it-8', description: 'Atorvastatin 20mg (30)', type: 'medication', qty: 1, unitPrice: 145 },
      ],
      payments: [],
      status: 'unpaid',
    },
  ]

  const claims = [
    {
      id: 'cl-1',
      invoiceId: 'inv-1',
      patientId: 'p-1',
      scheme: 'Discovery Health',
      memberNumber: 'DH-449201',
      amount: 950,
      submittedAt: '2026-03-03',
      status: 'paid',
      history: [
        { status: 'submitted', at: '2026-03-03' },
        { status: 'approved', at: '2026-03-04' },
        { status: 'paid', at: '2026-03-05' },
      ],
    },
    {
      id: 'cl-2',
      invoiceId: 'inv-2',
      patientId: 'p-2',
      scheme: 'Bonitas',
      memberNumber: 'BN-771204',
      amount: 1065,
      submittedAt: '2026-04-19',
      status: 'submitted',
      history: [{ status: 'submitted', at: '2026-04-19' }],
    },
  ]

  const labOrders = [
    {
      id: 'lab-1',
      patientId: 'p-2',
      doctorId: 'u-doc-2',
      test: 'HbA1c',
      orderedAt: '2026-04-18',
      status: 'resulted',
      result: 'HbA1c 7.8% (target <7.0%)',
      resultedAt: '2026-04-20',
    },
    {
      id: 'lab-2',
      patientId: 'p-4',
      doctorId: 'u-doc-1',
      test: 'Lipid panel',
      orderedAt: '2026-05-09',
      status: 'pending',
      result: '',
      resultedAt: null,
    },
    {
      id: 'lab-3',
      patientId: 'p-1',
      doctorId: 'u-doc-1',
      test: 'Urea & Electrolytes',
      orderedAt: '2026-03-02',
      status: 'pending',
      result: '',
      resultedAt: null,
    },
  ]

  const prescriptions = [
    {
      id: 'rx-1',
      patientId: 'p-1',
      doctorId: 'u-doc-1',
      medication: 'Amlodipine 5mg',
      dosage: '1 tablet daily',
      quantity: 30,
      pharmacyId: 'ph-1',
      status: 'sent',
      createdAt: '2026-03-02',
    },
    {
      id: 'rx-2',
      patientId: 'p-2',
      doctorId: 'u-doc-2',
      medication: 'Metformin 850mg',
      dosage: '1 tablet twice daily',
      quantity: 60,
      pharmacyId: 'ph-2',
      status: 'sent',
      createdAt: '2026-04-18',
    },
  ]

  const auditLog = [
    {
      id: 'log-seed',
      at: iso(dayOffset(0, 7, 55)),
      actor: 'System',
      role: 'system',
      action: 'seed',
      entity: 'database',
      entityId: '-',
      details: 'Initial demo data loaded',
    },
  ]

  return {
    meta: { seededOn: today, version: 1 },
    users,
    doctors: doctors.map((d) => d.id),
    pharmacies,
    patients,
    appointments,
    queue,
    invoices,
    claims,
    labOrders,
    prescriptions,
    auditLog,
  }
}
