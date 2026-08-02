/* ============================================
   SwasthAI – Gemma 4 Medical Intake Assistant
   Enhanced App Logic v2
   ============================================ */

// ── State ───────────────────────────────────────────────
let apiKey      = ''; // hidden for public demo
let demoMode    = true; // always demo mode for public demo
let recognition = null;
let isRecording = false;
let totalAnalyzed = parseInt(localStorage.getItem('swasthai_count') || '0');
let totalEmergency = parseInt(localStorage.getItem('swasthai_emergency') || '0');
let lastInput   = '';
let currentTab  = 'structured';

// ── Examples ───────────────────────────────────────────
const EXAMPLES = [
  `મને બે દિવસથી છાતીમાં દુખે છે અને આજે શ્વાસ લેવામાં ઘણી તકલીફ થાય છે. ઉલ્ટી પણ થઈ. BP ની દવા ચાલુ છે. ઉંમર 62 વર્ષ છે. Amlodipine 5mg સવારે લઉ છું.`,
  `मुझे तीन दिन से बुखार है, 102 degree तक। साथ में सर दर्द और बदन दर्द भी है। कोई दवा नहीं ले रहा हूँ। उम्र 28 साल। पहले कभी ऐसा नहीं हुआ।`,
  `Patient is 55 years old, diabetic since 10 years. Metformin 500mg ચાલુ છે. ત્રણ દિવસથી ઘૂંટણ માં સોજો છે અને ખૂબ દુખાવો છે. Walking difficult. No allergy known.`,
  `My mother is 70 years old. She has been having severe headache for the past week. She is on blood pressure medication (Telmisartan 40mg). She also has mild diabetes. Today she felt dizzy and had some blurred vision. No fever, no vomiting.`
];

// ── Demo Responses (pre-baked Gemma 4 outputs) ─────────
const DEMO_RESPONSES = [
  {
    name: "Unknown", age: "62 years", gender: "Not specified",
    detected_language: "Gujarati",
    main_complaint: "Chest pain (2 days) with acute onset breathing difficulty today",
    symptoms: ["Chest pain (2 days duration)", "Difficulty breathing (acute, severe, today)", "Vomiting"],
    duration: "Chest pain: 2 days · Breathing difficulty: onset today",
    existing_conditions: ["Hypertension (on medication)"],
    current_medications: ["Amlodipine 5mg once daily (morning)"],
    allergies: "Not mentioned",
    missing_info: ["Patient's full name", "Gender", "BP reading today", "Previous cardiac history", "Exact time breathing difficulty started", "Any chest radiation or sweating"],
    emergency_flags: ["Chest pain + acute breathing difficulty in 62-year-old hypertensive patient — rule out ACS/STEMI"],
    doctor_note: `Patient: Unknown, Age 62 years | Language: Gujarati\n\nCC: Chest pain × 2 days with acute onset dyspnea today.\n\nHistory: 62-year-old patient (known hypertensive on Amlodipine 5mg OD) presents with 2-day history of chest pain. Today developed acute, severe difficulty in breathing with vomiting.\n\n⚠️ EMERGENCY FLAG: Chest pain + acute dyspnea in elderly hypertensive patient. Immediate ECG, O2 saturation, and cardiac enzyme testing recommended. Do NOT delay evaluation.\n\nAllergies: Not mentioned. Missing: BP today, cardiac history, onset time.`,
    gujarati_summary: `દર્દીની માહિતી:\n\nઉંમર: ૬૨ વર્ષ\nમુખ્ય ફરિયાદ: છાતીમાં દુખાવો (૨ દિવસથી) અને શ્વાસ લેવામાં તકલીફ (આજથી)\nલક્ષણો: છાતીમાં દુખાવો, શ્વાસ લેવામાં ઘણી તકલીફ, ઉલ્ટી\nચાલુ દવા: Amlodipine 5mg (સવારે)\nBP ની સમસ્યા: હા\n\n⚠️ ધ્યાન: આ ગંભીર સ્થિતિ છે. તુરંત ડૉક્ટરને બતાવો.\n\nઆ ફોર્મ ક્લિનિક સ્ટાફ દ્વારા ચેક કરવામાં આવ્યું છે.`,
    is_emergency: true,
    triage_level: "emergency",
    emergency_message: "Chest pain + acute breathing difficulty in 62-year-old hypertensive. Possible cardiac event — immediate attention required.",
    completeness: 65
  },
  {
    name: "Unknown", age: "28 years", gender: "Male (inferred)",
    detected_language: "Hindi",
    main_complaint: "High-grade fever (102°F) for 3 days with headache and body ache",
    symptoms: ["High-grade fever up to 102°F (3 days)", "Headache", "Body ache / myalgia"],
    duration: "3 days",
    existing_conditions: ["None reported"],
    current_medications: ["None"],
    allergies: "Not mentioned",
    missing_info: ["Patient's full name", "Any recent travel history", "Rash or joint pain", "Cough or cold symptoms", "Platelet count if available"],
    emergency_flags: [],
    doctor_note: `Patient: Unknown, Age 28 years (Male) | Language: Hindi\n\nCC: High-grade fever (max 102°F) × 3 days with headache and myalgia.\n\nHistory: Young male presents with 3-day history of high-grade fever peaking at 102°F, associated with headache and generalised body ache. No current medications. No known allergies. No prior similar episodes.\n\nNote: Suggest CBC with differential. Dengue NS1/IgM if in endemic region and platelets low. Malaria rule-out if travel history positive.\n\nMissing: Full name, travel history, rash, joint pain.`,
    gujarati_summary: `દર્દીની માહિતી:\n\nઉંમર: ૨૮ વર્ષ (પુરુષ)\nભાષા: હિન્દી\nમુખ્ય ફરિયાદ: ૩ દિવસથી ૧૦૨°F તાવ, માથાનો દુખાવો, અને શરીર દુખાવો\nચાલુ દવા: કોઈ નહીં\nએલર્જી: ઉલ્લેખ નથી\n\nJij dhyan rakhjo: Taav utar nahi toh kal phir clinic aavo.\n\nStaff checked: ✅`,
    is_emergency: false,
    triage_level: "normal",
    emergency_message: "",
    completeness: 55
  },
  {
    name: "Unknown", age: "55 years", gender: "Not specified",
    detected_language: "Mixed (Gujarati + English)",
    main_complaint: "Knee swelling and severe pain with difficulty walking — known diabetic",
    symptoms: ["Knee swelling (3 days)", "Severe knee pain", "Difficulty walking"],
    duration: "3 days",
    existing_conditions: ["Diabetes mellitus (10 years)"],
    current_medications: ["Metformin 500mg"],
    allergies: "None known",
    missing_info: ["Patient name", "Which knee affected (left/right/both)", "Fever or redness of joint", "Recent blood sugar / HbA1c", "Any trauma or injury", "Uric acid levels"],
    emergency_flags: [],
    doctor_note: `Patient: Unknown, Age 55 years | Language: Mixed (Gujarati + English)\n\nCC: Knee swelling and pain × 3 days, difficulty walking. Known diabetic.\n\nHistory: 55-year-old known diabetic (DM × 10 years, on Metformin 500mg) presents with 3-day history of knee swelling and pain causing difficulty walking. No known allergies.\n\nNote: In diabetic patients, consider septic arthritis (requires urgent aspiration), gout/pseudogout, or diabetic arthropathy. Check FBS today, inflammatory markers (CRP, ESR), X-ray knee. Uric acid if gout suspected.\n\nMissing: Laterality, fever, trauma, recent sugar levels.`,
    gujarati_summary: `દર્દીની માહિતી:\n\nઉંમર: ૫૫ વર્ષ\nડાયાબિટીસ: ૧૦ વર્ષથી · Metformin 500mg\nમુખ્ય ફરિયાદ: ૩ દિવસથી ઘૂંટણ માં સોજો અને દુખાવો, ચાલવામાં તકલીફ\nએલર્જી: કોઈ નહીં\n\nclinic ની સૂચના: આજે blood sugar ચેક કરાવવો. ડૉક્ટર ઘૂંટણ ની તપાસ કરશે.\n\nStaff checked: ✅`,
    is_emergency: false,
    triage_level: "high",
    emergency_message: "Diabetic patient with joint swelling — septic arthritis must be ruled out.",
    completeness: 72
  },
  {
    name: "Patient's mother", age: "70 years", gender: "Female",
    detected_language: "English",
    main_complaint: "Severe headache (1 week) with acute onset dizziness and blurred vision today",
    symptoms: ["Severe headache (1 week duration)", "Dizziness (acute onset today)", "Blurred vision (acute onset today)"],
    duration: "Headache: 1 week · Dizziness + blurred vision: today",
    existing_conditions: ["Hypertension", "Mild diabetes mellitus"],
    current_medications: ["Telmisartan 40mg"],
    allergies: "Not mentioned",
    missing_info: ["BP reading today", "Blood sugar today", "Any focal weakness or slurred speech", "Previous headache episodes", "Diabetes medication details", "Family history of stroke"],
    emergency_flags: ["Headache + dizziness + blurred vision in 70-year-old hypertensive — rule out hypertensive crisis, TIA, or CVA"],
    doctor_note: `Patient: 70-year-old Female | Language: English\n\nCC: Severe headache × 1 week with acute onset dizziness and blurred vision today.\n\nHistory: Known hypertensive (Telmisartan 40mg) with mild DM. One week of severe headache, now with acute onset dizziness and blurred vision today. No fever, no vomiting.\n\n⚠️ EMERGENCY FLAG: New neurological symptoms (blurred vision + dizziness) in elderly hypertensive female. Check BP STAT. Rule out hypertensive crisis, TIA, or CVA. Neuro exam required. Consider urgent CT head if BP uncontrolled.\n\nMissing: BP today, blood sugar, focal neuro deficits, diabetes medications.`,
    gujarati_summary: `દર્દીની માહિતી:\n\nઉંમર: ૭૦ વર્ષ (મહિલા)\nBP ની દવા: Telmisartan 40mg · ડાયાબિટીસ: હળવો\nમુખ્ય ફરિયાદ: ૧ અઠવાડિયાથી ભારે માથાનો દુખાવો, આજથી ચક્કર અને ઝાંખું દેખાય છે\n\n⚠️ તાત્કાલિક: BP તુરંત ચેક કરો. ડૉક્ટરને તુરંત બતાવો.\n\nStaff checked: ✅`,
    is_emergency: true,
    triage_level: "emergency",
    emergency_message: "New neurological symptoms in 70-year-old hypertensive. Rule out stroke or hypertensive crisis — immediate evaluation needed.",
    completeness: 70
  }
];

// ── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiSection();
  setupCharCount();
  setupSpeechRecognition();
  updateCounters();
  animateImpactNumbers();
});

// ── Counters ────────────────────────────────────────────
function updateCounters() {
  document.getElementById('countAnalyzed').textContent = totalAnalyzed;
  document.getElementById('countEmergency').textContent = totalEmergency;
}

function animateImpactNumbers() {
  const cards = document.querySelectorAll('.impact-num');
  const targets = [5, 4, 12, 0];
  const suffixes = ['×', '', '', ''];
  cards.forEach((el, i) => {
    let count = 0;
    const target = targets[i];
    if (target === 0) { el.textContent = '0' + suffixes[i]; return; }
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count + suffixes[i];
      if (count >= target) clearInterval(timer);
    }, 60);
  });
}

// ── API Setup ───────────────────────────────────────────
function initApiSection() {
  const saved = localStorage.getItem('swasthai_key');
  if (saved) {
    apiKey = saved;
    demoMode = false;
    document.getElementById('apiKeyInput').value = saved;
    setApiStatus('✅ API key loaded · Live Gemma 4 inference enabled', 'ok');
    setModeBadge(false);
  }
}

function saveKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!val) { setApiStatus('❌ Please enter a valid API key', 'err'); return; }
  apiKey = val; demoMode = false;
  localStorage.setItem('swasthai_key', val);
  setApiStatus('✅ Key saved · Live Gemma 4 (gemma-3-27b-it) enabled', 'ok');
  setModeBadge(false);
}

function useDemo() {
  demoMode = true; apiKey = '';
  setApiStatus('⚡ Demo Mode — pre-loaded Gemma 4 responses for all 4 examples', 'demo');
  setModeBadge(true);
}

function setApiStatus(msg, cls) {
  const el = document.getElementById('apiStatus');
  el.textContent = msg;
  el.className = 'api-status ' + cls;
}

function setModeBadge(isDemo) {
  const b = document.getElementById('apiModeBadge');
  b.textContent = isDemo ? '⚡ Demo Mode' : '🟢 Live · Gemma 4';
  b.className = 'api-mode-badge' + (isDemo ? '' : ' live');
}

// ── Input helpers ───────────────────────────────────────
function setupCharCount() {
  const ta = document.getElementById('patientInput');
  ta.addEventListener('input', () => {
    const text = ta.value;
    document.getElementById('charCount').textContent = text.length + ' characters';
    document.getElementById('wordCount').textContent = '· ' + (text.trim() ? text.trim().split(/\s+/).length : 0) + ' words';
    detectLanguageLive(text);
  });
}

function detectLanguageLive(text) {
  if (text.length < 5) {
    document.getElementById('langDetectBadge').classList.add('hidden');
    return;
  }
  const hasGujarati = /[\u0A80-\u0AFF]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasLatin = /[a-zA-Z]{3,}/.test(text);
  let lang = '';
  if (hasGujarati && hasLatin)       lang = '🔤 Mixed: Gujarati + English';
  else if (hasGujarati && hasDevanagari) lang = '🔤 Mixed: Gujarati + Hindi';
  else if (hasGujarati)              lang = '🇮🇳 Gujarati Detected';
  else if (hasDevanagari && hasLatin)lang = '🔤 Mixed: Hindi + English';
  else if (hasDevanagari)            lang = '🇮🇳 Hindi Detected';
  else if (hasLatin)                 lang = '🔤 English Detected';
  const badge = document.getElementById('langDetectBadge');
  badge.textContent = lang;
  badge.classList.toggle('hidden', !lang);
}

function loadExample(idx) {
  const ta = document.getElementById('patientInput');
  ta.value = EXAMPLES[idx];
  ta.dataset.exampleIdx = idx;
  document.getElementById('charCount').textContent = EXAMPLES[idx].length + ' characters';
  document.getElementById('wordCount').textContent = '· ' + EXAMPLES[idx].trim().split(/\s+/).length + ' words';
  detectLanguageLive(EXAMPLES[idx]);
  ta.focus();
}

function clearAll() {
  const ta = document.getElementById('patientInput');
  ta.value = ''; ta.dataset.exampleIdx = '';
  document.getElementById('charCount').textContent = '0 characters';
  document.getElementById('wordCount').textContent = '· 0 words';
  document.getElementById('langDetectBadge').classList.add('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
}

function scrollToInput() {
  clearAll();
  document.getElementById('inputSection').scrollIntoView({ behavior: 'smooth' });
}

// ── Voice ───────────────────────────────────────────────
function setupSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const mb = document.getElementById('micBtn');
    mb.style.opacity = '0.4';
    mb.title = 'Voice input not supported — use Chrome or Edge';
    return;
  }
  recognition = new SR();
  recognition.lang = 'gu-IN';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onresult = (e) => {
    let t = '';
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    document.getElementById('patientInput').value = t;
    document.getElementById('charCount').textContent = t.length + ' characters';
    detectLanguageLive(t);
  };
  recognition.onerror = () => stopMic();
  recognition.onend   = () => stopMic();
}

function toggleMic() {
  if (!recognition) { alert('Use Chrome or Edge for voice input.'); return; }
  if (isRecording) { recognition.stop(); stopMic(); }
  else {
    recognition.start(); isRecording = true;
    const btn = document.getElementById('micBtn');
    btn.textContent = '🔴 Recording…'; btn.classList.add('active');
  }
}
function stopMic() {
  isRecording = false;
  const btn = document.getElementById('micBtn');
  btn.textContent = '🎤 Voice'; btn.classList.remove('active');
}

// ── Processing Overlay Steps ─────────────────────────────
const STEP_DELAYS = [400, 900, 1350, 1750, 2100];

function showOverlay() {
  document.getElementById('processingOverlay').classList.remove('hidden');
  ['step1','step2','step3','step4','step5'].forEach(id => {
    document.getElementById(id).className = 'step-item';
  });
  STEP_DELAYS.forEach((delay, i) => {
    setTimeout(() => {
      const id = 'step' + (i + 1);
      // Mark previous as done
      if (i > 0) document.getElementById('step' + i).className = 'step-item done';
      document.getElementById(id).className = 'step-item active';
    }, delay);
  });
}

function hideOverlay() {
  // Mark last step done briefly
  document.getElementById('step5').className = 'step-item done';
  setTimeout(() => {
    document.getElementById('processingOverlay').classList.add('hidden');
  }, 300);
}

// ── MAIN ANALYZE ─────────────────────────────────────────
async function analyze() {
  const input = document.getElementById('patientInput').value.trim();
  if (!input) { showToast('Please enter a patient description first.', 'warn'); return; }
  lastInput = input;

  setLoading(true);
  showOverlay();

  try {
    let result;
    if (demoMode) {
      result = await simulateGemmaResponse(input);
    } else {
      result = await callGemma4API(input);
    }
    hideOverlay();
    renderResults(result);
    // Update counters
    totalAnalyzed++;
    if (result.is_emergency) totalEmergency++;
    localStorage.setItem('swasthai_count', totalAnalyzed);
    localStorage.setItem('swasthai_emergency', totalEmergency);
    updateCounters();
  } catch (err) {
    hideOverlay();
    console.error(err);
    showToast('Error: ' + err.message.slice(0, 80) + ' — try Demo Mode.', 'error');
  } finally {
    setLoading(false);
  }
}

function setLoading(on) {
  const btn  = document.getElementById('analyzeBtn');
  const icon = document.getElementById('btnIcon');
  const txt  = document.getElementById('btnText');
  const spin = document.getElementById('btnSpinner');
  btn.disabled = on;
  icon.classList.toggle('hidden', on);
  txt.textContent = on ? 'Analyzing…' : 'Analyze with Gemma 4';
  spin.classList.toggle('hidden', !on);
}

// ── Demo ────────────────────────────────────────────────
async function simulateGemmaResponse(input) {
  await new Promise(r => setTimeout(r, 2600)); // realistic delay
  const ta = document.getElementById('patientInput');
  const idx = parseInt(ta.dataset.exampleIdx ?? '');
  if (!isNaN(idx) && DEMO_RESPONSES[idx]) return DEMO_RESPONSES[idx];
  // Generic fallback
  return {
    name: "Not provided", age: "Not provided", gender: "Not specified",
    detected_language: "Unknown",
    main_complaint: "Patient complaint received (demo mode)",
    symptoms: ["Symptom description"], duration: "Not specified",
    existing_conditions: [], current_medications: [], allergies: "Not mentioned",
    missing_info: ["Add your API key for live extraction"],
    emergency_flags: [],
    doctor_note: `Demo Mode — Live Gemma 4 extraction not active.\n\nOriginal: "${input.substring(0,150)}"`,
    gujarati_summary: `Demo Mode.\n\nLive extraction ઉપલબ્ધ નથી. API key ઉમેરો.`,
    is_emergency: false,
    triage_level: "normal",
    emergency_message: "",
    completeness: 20
  };
}

// ── Live API ────────────────────────────────────────────
async function callGemma4API(patientInput) {
  const SYSTEM = `You are a medical intake assistant for Indian clinics. Convert patient descriptions (Gujarati/Hindi/English/mixed) into structured intake data.

CRITICAL RULES:
- NO diagnosis, NO treatment recommendations, NO dosage advice
- Only extract what patient explicitly states
- Emergency flags are rule-based only (listed below)
- Always output valid JSON

Return this exact JSON structure:
{
  "name": string,
  "age": string,
  "gender": string,
  "detected_language": string (e.g. "Gujarati", "Hindi", "English", "Mixed (Gujarati+English)"),
  "main_complaint": string (one sentence in English),
  "symptoms": string[],
  "duration": string,
  "existing_conditions": string[],
  "current_medications": string[],
  "allergies": string,
  "missing_info": string[],
  "emergency_flags": string[],
  "doctor_note": string (3-5 sentences clinical intake note, NO diagnosis),
  "gujarati_summary": string (patient-facing summary in Gujarati script for WhatsApp, include ⚠️ if emergency),
  "is_emergency": boolean,
  "triage_level": "emergency"|"high"|"normal",
  "emergency_message": string,
  "completeness": number (0-100, percentage of key fields filled)
}

Rule-based emergency triggers:
- Chest pain + breathing difficulty
- Chest pain in patient >50 years old
- Sudden severe headache ("thunderclap")
- Blurred vision + headache in elderly or hypertensive
- Breathing difficulty (severe/worsening)
- Unresponsiveness or confusion
- Severe bleeding
- Signs of stroke (facial droop, arm weakness, speech)`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: `Patient description:\n\n${patientInput}\n\nReturn only valid JSON.` }] }],
    generationConfig: { temperature: 0.15, maxOutputTokens: 1800, responseMimeType: 'application/json' }
  };

  const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) {
    const e = await resp.text();
    throw new Error(`API ${resp.status}: ${e.slice(0, 150)}`);
  }
  const data = await resp.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty response from Gemma 4');
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

// ── Render ───────────────────────────────────────────────
function renderResults(data) {
  // 1. Triage banner
  renderTriage(data);

  // 2. Language banner
  renderLangBanner(data);

  // 3. Structured summary
  renderStructuredGrid(data);

  // 4. Missing info
  renderMissingInfo(data);

  // 5. Doctor note
  document.getElementById('doctorNote').textContent = data.doctor_note || '';

  // 6. Gujarati summary
  document.getElementById('gujaratiSummary').textContent = data.gujarati_summary || 'N/A';

  // 7. Compare view
  renderCompareView(data);

  // Show results
  const rs = document.getElementById('resultsSection');
  rs.classList.remove('hidden');
  rs.classList.add('slide-in');
  setTimeout(() => rs.classList.remove('slide-in'), 700);

  // Switch to first tab
  switchTab('structured');

  // Scroll
  setTimeout(() => rs.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

function renderTriage(data) {
  const banner = document.getElementById('triageBanner');
  const icon   = document.getElementById('triageIcon');
  const label  = document.getElementById('triageLabel');
  const msg    = document.getElementById('triageMsg');
  const bar    = document.getElementById('completenessBar');
  const score  = document.getElementById('completenessScore');

  const level = data.triage_level || 'normal';
  banner.className = 'triage-banner ' + level;

  const configs = {
    emergency: { icon: '🚨', label: 'EMERGENCY — Immediate Attention Required', msg: data.emergency_message || data.emergency_flags?.[0] || '' },
    high:      { icon: '⚠️', label: 'High Priority — Review Promptly',          msg: data.emergency_message || 'This patient should be seen soon.' },
    normal:    { icon: '✅', label: 'Standard Priority',                         msg: 'No emergency indicators detected. Proceed with routine intake.' }
  };
  const cfg = configs[level] || configs.normal;
  icon.textContent  = cfg.icon;
  label.textContent = cfg.label;
  msg.textContent   = cfg.msg;

  const pct = data.completeness || 50;
  bar.style.width = pct + '%';
  score.textContent = pct + '% complete';
}

function renderLangBanner(data) {
  const lb = document.getElementById('langBanner');
  const lang = data.detected_language || 'Unknown';
  lb.innerHTML = `
    <span>🌐 Language detected:</span>
    <span class="lang-tag">${lang}</span>
    <span style="color:var(--text-muted)">· Gemma 4 processed natively — no translation layer used</span>
  `;
}

function renderStructuredGrid(data) {
  const grid = document.getElementById('summaryGrid');
  grid.innerHTML = '';

  const fields = [
    { label: 'Patient Name',         value: data.name,                   ph: 'Not provided' },
    { label: 'Age',                  value: data.age,                    ph: 'Unknown' },
    { label: 'Gender',               value: data.gender,                 ph: 'Not specified' },
    { label: 'Chief Complaint',      value: data.main_complaint,         ph: 'Not recorded', fullWidth: true },
    { label: 'Duration',             value: data.duration,               ph: 'Not specified' },
    { label: 'Symptoms',             value: data.symptoms,               ph: 'None mentioned', isArray: true },
    { label: 'Existing Conditions',  value: data.existing_conditions,    ph: 'None', isArray: true, tagClass: 'purple' },
    { label: 'Current Medications',  value: data.current_medications,    ph: 'None', isArray: true, tagClass: 'warn' },
    { label: 'Known Allergies',      value: data.allergies,              ph: 'Not mentioned' },
    { label: 'Emergency Indicators', value: data.emergency_flags,        ph: 'None', isArray: true, tagClass: 'danger' },
  ];

  fields.forEach(f => {
    const div = document.createElement('div');
    div.className = 'summary-field';
    if (f.fullWidth) div.style.gridColumn = '1 / -1';

    const label = document.createElement('div');
    label.className = 'field-label';
    label.textContent = f.label;

    const valDiv = document.createElement('div');
    valDiv.className = 'field-value';
    valDiv.contentEditable = 'true';
    valDiv.setAttribute('data-ph', f.ph);

    if (f.isArray && Array.isArray(f.value) && f.value.length > 0) {
      f.value.forEach(item => {
        const tag = document.createElement('span');
        tag.className = 'field-tag ' + (f.tagClass || '');
        tag.textContent = item;
        valDiv.appendChild(tag);
      });
    } else if (!f.isArray && f.value) {
      valDiv.textContent = f.value;
    }

    // Copy button per field
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-field-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy field';
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(valDiv.textContent).then(() => showToast('Copied!', 'success'));
    };

    div.appendChild(label);
    div.appendChild(valDiv);
    div.appendChild(copyBtn);
    grid.appendChild(div);
  });
}

function renderMissingInfo(data) {
  const mc = document.getElementById('missingCard');
  const ml = document.getElementById('missingList');
  if (data.missing_info?.length > 0) {
    ml.innerHTML = data.missing_info.map(m =>
      `<div class="missing-item">${m}</div>`
    ).join('');
    mc.classList.remove('hidden');
  } else {
    mc.classList.add('hidden');
  }
}

function renderCompareView(data) {
  document.getElementById('compareOriginal').textContent = lastInput;
  const ex = document.getElementById('compareExtracted');
  const rows = [
    ['Language',    data.detected_language],
    ['Complaint',   data.main_complaint],
    ['Symptoms',    (data.symptoms || []).join(', ')],
    ['Duration',    data.duration],
    ['Conditions',  (data.existing_conditions || []).join(', ') || 'None'],
    ['Medications', (data.current_medications || []).join(', ') || 'None'],
    ['Allergies',   data.allergies],
    ['Emergency',   data.is_emergency ? '🚨 ' + (data.emergency_flags || []).join('; ') : '✅ None'],
    ['Completeness',data.completeness + '%'],
  ];
  ex.innerHTML = rows.map(([l, v]) =>
    `<div class="ex-row"><span class="ex-label">${l}</span><span class="ex-val">${v || '—'}</span></div>`
  ).join('');
}

// ── Tabs ─────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  const panels = { structured: 'panelStructured', doctor: 'panelDoctor', gujarati: 'panelGujarati', compare: 'panelCompare' };
  const tabs    = { structured: 'tab1',            doctor: 'tab2',        gujarati: 'tab3',          compare: 'tab4' };
  Object.entries(panels).forEach(([key, id]) => {
    document.getElementById(id).classList.toggle('hidden', key !== tab);
  });
  Object.entries(tabs).forEach(([key, id]) => {
    document.getElementById(id).classList.toggle('active', key === tab);
  });
}

// ── Actions ──────────────────────────────────────────────
function copyStructured() {
  const grid = document.getElementById('summaryGrid');
  const text = Array.from(grid.querySelectorAll('.summary-field')).map(f => {
    const l = f.querySelector('.field-label').textContent;
    const v = f.querySelector('.field-value').textContent;
    return `${l}: ${v}`;
  }).join('\n');
  navigator.clipboard.writeText('PATIENT INTAKE SUMMARY\n' + '='.repeat(35) + '\n\n' + text)
    .then(() => showToast('✅ Structured summary copied!', 'success'));
}

function copyDoctor() {
  navigator.clipboard.writeText(document.getElementById('doctorNote').textContent)
    .then(() => showToast('✅ Doctor note copied!', 'success'));
}

function copyGujarati() {
  navigator.clipboard.writeText(document.getElementById('gujaratiSummary').textContent)
    .then(() => showToast('✅ ગુજરાતી સારાંશ copied!', 'success'));
}

function shareWhatsApp() {
  const grid = document.getElementById('summaryGrid');
  const note = document.getElementById('doctorNote').textContent;
  const text = '*Patient Intake Summary — SwasthAI*\n\n' +
    Array.from(grid.querySelectorAll('.summary-field')).map(f => {
      const l = f.querySelector('.field-label').textContent;
      const v = f.querySelector('.field-value').textContent;
      return `*${l}:* ${v}`;
    }).join('\n') +
    '\n\n*Doctor Note:*\n' + note +
    '\n\n_Generated by SwasthAI · Gemma 4 · Not a medical diagnosis_';
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function shareWhatsAppGujarati() {
  const text = document.getElementById('gujaratiSummary').textContent +
    '\n\n_SwasthAI · Gemma 4 · ડૉક્ટર નો નિર્ણય નથી_';
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function confirmSummary() {
  showToast('✅ Summary confirmed and marked ready for doctor!', 'success');
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const colors = {
    success: 'rgba(16,185,129,0.95)',
    error:   'rgba(239,68,68,0.95)',
    warn:    'rgba(245,158,11,0.95)'
  };
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:30px;right:24px;z-index:9999;
    background:${colors[type] || colors.success};color:#fff;
    padding:13px 24px;border-radius:12px;font-size:0.88rem;font-weight:600;
    box-shadow:0 6px 24px rgba(0,0,0,0.35);
    animation:slideIn 0.3s ease;
    max-width:320px;
  `;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 2800);
}
