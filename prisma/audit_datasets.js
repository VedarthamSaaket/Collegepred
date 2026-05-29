const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dataDir = path.join(__dirname, 'data');

// Read all unique college names from each dataset
const eamcetColleges = new Set();
const nitColleges = new Set();
const jeeAdvColleges = new Set();

// EAMCET Phase 1
for (const phase of ['EAMCET_2024_Phase_1_Cutoffs.csv', 'EAMCET_2024_Phase_2_Cutoffs.csv', 'EAMCET_2024_Phase_3_Cutoffs.csv', 'tseamcet_2022_2.csv', 'ts-eamcet-2025-phase2-cutoffs.csv']) {
  const p = path.join(dataDir, phase);
  if (fs.existsSync(p)) {
    const data = parse(fs.readFileSync(p, 'utf-8'), { columns: true, skip_empty_lines: true });
    for (const row of data) {
      if (row['College Name'] || row['College']) eamcetColleges.add((row['College Name'] || row['College']).trim());
    }
  }
}

// NIT CSV
const nitsPath = path.join(dataDir, 'jee_college_cutoffs_nits.csv');
if (fs.existsSync(nitsPath)) {
  const data = parse(fs.readFileSync(nitsPath, 'utf-8'), { columns: true, skip_empty_lines: true });
  for (const row of data) {
    if (row.institute) nitColleges.add(row.institute.trim());
  }
}

// JEE Advanced Round 5
const round5Path = path.join(dataDir, '2024Round5.xlsx');
if (fs.existsSync(round5Path)) {
  const wb = XLSX.readFile(round5Path);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);
  for (const row of data) {
    if (row.Institute || row.institute) jeeAdvColleges.add((row.Institute || row.institute).toString().trim());
  }
  // Also check Round 1
  const round1Path = path.join(dataDir, '2024Round1.xlsx');
  if (fs.existsSync(round1Path)) {
    const wb1 = XLSX.readFile(round1Path);
    const ws1 = wb1.Sheets[wb1.SheetNames[0]];
    const data1 = XLSX.utils.sheet_to_json(ws1);
    for (const row of data1) {
      if (row.Institute || row.institute) jeeAdvColleges.add((row.Institute || row.institute).toString().trim());
    }
  }
}

console.log('=== Dataset College Counts ===');
console.log('EAMCET unique colleges:', eamcetColleges.size);
console.log('NIT CSV unique colleges:', nitColleges.size);
console.log('JEE Advanced unique colleges:', jeeAdvColleges.size);

console.log('\n=== NIT CSV Colleges ===');
for (const c of [...nitColleges].sort()) console.log('  -', c);

console.log('\n=== JEE Advanced Colleges ===');
for (const c of [...jeeAdvColleges].sort()) console.log('  -', c);

console.log('\n=== EAMCET Colleges (first 50) ===');
for (const c of [...eamcetColleges].sort().slice(0, 50)) console.log('  -', c);

// Now compare against our DB colleges
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const dbColleges = await p.college.findMany({ select: { name: true, slug: true } });
  const dbNames = new Set(dbColleges.map(c => c.name.toLowerCase().replace(/[^a-z0-9]/g, '')));

  // For NIT CSV - see how many match
  const normalize = s => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const matchedNits = [...nitColleges].filter(n => {
    const norm = normalize(n);
    return [...dbColleges].some(d => {
      const normD = normalize(d.name);
      return norm.includes(normD) || normD.includes(norm);
    });
  });
  const matchedEamcet = [...eamcetColleges].filter(e => {
    const norm = normalize(e);
    return [...dbColleges].some(d => {
      const normD = normalize(d.name);
      return norm.includes(normD) || normD.includes(norm);
    });
  });
  const matchedJee = [...jeeAdvColleges].filter(j => {
    const norm = normalize(j);
    return [...dbColleges].some(d => {
      const normD = normalize(d.name);
      return norm.includes(normD) || normD.includes(norm);
    });
  });

  console.log('\n=== Coverage Analysis ===');
  console.log(`NIT CSV: ${matchedNits.length}/${nitColleges.size} colleges have DB match`);
  console.log(`JEE Adv: ${matchedJee.length}/${jeeAdvColleges.size} colleges have DB match`);
  console.log(`EAMCET: ${matchedEamcet.length}/${eamcetColleges.size} colleges have DB match`);

  console.log('\n=== MISSING from NIT CSV (no DB match) ===');
  for (const c of [...nitColleges].filter(n => !matchedNits.includes(n)).sort()) console.log('  -', c);

  console.log('\n=== MISSING from JEE Advanced (no DB match) ===');
  for (const c of [...jeeAdvColleges].filter(j => !matchedJee.includes(j)).sort()) console.log('  -', c);

  console.log('\n=== MISSING from EAMCET (no DB match) - first 50 ===');
  for (const c of [...eamcetColleges].filter(e => !matchedEamcet.includes(e)).sort().slice(0, 50)) console.log('  -', c);

  await p.$disconnect();
})();