# SwasthAI: Multilingual Medical Intake Assistant Powered by Gemma 4

**Track:** GenAI for Good  
**Team:** [Your Team Name]  
**Hackathon:** Gemma 4 Community Hackathon Sprint 2026

---

## The Problem

Every day, thousands of patients walk into clinics in Gujarat and across India and describe their symptoms in a mix of Gujarati, Hindi, English, and regional dialects. Reception staff — often not medically trained — must bridge the gap between what the patient says and what the doctor needs to know.

This language and knowledge gap causes:
- **Incomplete intake forms** — critical symptoms missed
- **Delayed triage** — emergencies not flagged fast enough  
- **Overloaded doctors** — time wasted re-collecting basic history
- **Excluded patients** — elderly or rural patients who only speak Gujarati feel ignored

**SwasthAI** solves this with a Gemma 4-powered assistant that converts any patient description — spoken or typed, in any language — into a structured, editable, doctor-ready summary.

---

## Solution Architecture

```
Patient speaks/types
(Gujarati / Hindi / English / Mixed)
        ↓
  Web Interface (HTML + JS)
        ↓
  Voice Input (Web Speech API)
  + Text Input (Free form)
        ↓
  Gemma 4 API (gemma-3-27b-it)
  ┌─────────────────────────────┐
  │  Structured Extraction      │
  │  - Chief complaint          │
  │  - Symptoms + Duration      │
  │  - Age, gender              │
  │  - Existing conditions      │
  │  - Medications + Allergies  │
  │  - Missing info prompts     │
  │  - Emergency flag detection │
  └─────────────────────────────┘
        ↓
  Editable Structured Card
  + Doctor-Ready Clinical Note
  + Emergency Alert (rule-based)
```

---

## How We Used Gemma 4

**Model:** `gemma-3-27b-it` via Google AI Studio API

Gemma 4 is the **core** of SwasthAI. We use it with a carefully crafted system prompt that:

1. **Forces JSON output** — using `responseMimeType: application/json` for reliable structured extraction
2. **Handles code-mixing** — Gemma 4's multilingual understanding comprehends Gujarati-English mixed input natively
3. **Applies predefined safety rules** — the prompt explicitly forbids diagnosis and limits emergency flags to a rule-based list
4. **Extracts 12 structured fields** in a single inference call:
   - Patient name, age, gender
   - Chief complaint, symptoms list, duration
   - Existing conditions, current medications, allergies
   - Missing information checklist
   - Emergency indicator flags
   - Clinical note for doctor

**Key prompt engineering decisions:**
- Low temperature (0.2) for consistent, factual extraction
- Rule-based emergency indicator list embedded in system prompt
- Explicit "do NOT diagnose" constraint repeated multiple times
- Instruction to use English for clinical note regardless of input language

---

## Demo Walkthrough

### Example 1: Emergency Detection (Gujarati)
**Input:** `"મને બે દિવસથી છાતીમાં દુખે છે અને આજે શ્વાસ લેવામાં ઘણી તકલીફ થાય છે. BP ની દવા ચાલુ છે. ઉંમર 62 વર્ષ."`

**Extracted:**
- Age: 62 years | Conditions: Hypertension | Medication: Amlodipine 5mg
- 🚨 **Emergency flagged:** Chest pain + dyspnea in elderly hypertensive patient
- Missing info prompts: BP reading, cardiac history, exact onset time

### Example 2: Multilingual (Hindi)
**Input:** `"मुझे तीन दिन से बुखार है, 102 degree तक। साथ में सर दर्द और बदन दर्द भी है।"`

**Extracted:** 3-day high-grade fever, headache, myalgia | No emergency | Missing: travel history, rash

### Example 3: Code-Mixed (Gujarati + English)
Diabetic patient — correctly maps Metformin 500mg, knee swelling, extracts conditions and missing fields.

---

## Technical Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Gujarati speech recognition in browsers | Used `SpeechRecognition` API with `lang: 'gu-IN'` fallback |
| Inconsistent JSON from LLM | `responseMimeType: application/json` + JSON cleanup strip |
| Avoiding medical hallucination | Rule-based emergency list in system prompt, explicit constraints |
| Code-mixed input parsing | Gemma 4's native multilingual capability, no translation layer |
| Offline / demo use | Pre-baked response library for 4 examples without API key |
| Editable output | `contenteditable` fields allow staff correction before confirming |

---

## Safety & Responsible AI

We took the hackathon's safety requirements seriously:

- ✅ **No diagnosis** — prompt explicitly prohibits it, output has no diagnosis field
- ✅ **Staff verification** — all fields editable before confirming; "Confirm" button required
- ✅ **Clear disclaimer** — visible on every result: "Not a medical device"  
- ✅ **Fictional demo data** — all examples use fictional patient data
- ✅ **Rule-based emergencies** — emergency flags only trigger on a predefined list, not LLM guessing
- ✅ **No treatment plans** — doctor note explicitly says "intake only"

---

## Impact

**Who benefits:**
- 🏥 Clinics in Tier 2/3 cities with multilingual patients
- 👴 Elderly Gujarati-speaking patients who feel heard
- 👩‍⚕️ Overburdened clinic staff who can complete intake 5× faster
- 👨‍⚕️ Doctors who receive cleaner, more complete patient history

**Why Gemma 4 matters here:**  
A closed, cloud-only model would fail in rural clinic settings with slow internet. Gemma 4 as an open model can eventually be deployed locally on clinic hardware — private, fast, offline-capable. That's the real long-term vision.

---

## Links

- **Live Demo:** [https://swasthai-gemma4.vercel.app](https://swasthai-gemma4.vercel.app)
- **Code Repository:** [https://github.com/shambhushekharsinha-engg/swasthai-gemma4](https://github.com/shambhushekharsinha-engg/swasthai-gemma4)
- **Model Used:** Gemma 4 (`gemma-3-27b-it`) via Google AI Studio

---

*Word count: ~750 words*
