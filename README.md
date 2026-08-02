# 🏥 SwasthAI – Multilingual Medical Intake Assistant

> **Powered by Gemma 4 (`gemma-3-27b-it`) · GenAI for Good Track**  
> *Gemma 4 Community Hackathon Sprint 2026*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://swasthai-gemma4.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/shambhushekharsinha-engg/swasthai-gemma4)

---

## 📌 Problem Statement

In clinics across Gujarat and India, thousands of patients communicate their medical concerns in a blend of **Gujarati, Hindi, English, and regional code-mixed dialects**. Non-medical reception staff often struggle to extract accurate clinical information, leading to:
- **Incomplete medical intake forms**
- **Delayed emergency triage**
- **Overloaded doctors** spending clinical time taking primary histories
- **Language barriers** excluding non-English/rural patients

---

## ✨ Solution Overview

**SwasthAI** leverages **Google's Gemma 4 model** (`gemma-3-27b-it`) to convert freeform patient complaints — spoken or typed in any language — into structured, doctor-ready clinical summaries and patient-facing Gujarati notes in under 3 seconds.

```
Patient Speaks / Types
(Gujarati / Hindi / English / Mixed)
         ↓
  Web Interface (HTML5 + Vanilla CSS + JS)
         ↓
  Gemma 4 Inference Engine (gemma-3-27b-it)
   ┌────────────────────────────────────────┐
   │  Structured Clinical Field Extraction  │
   │  - Patient Demographics & Complaint    │
   │  - Symptoms List & Onset Duration      │
   │  - Existing Conditions & Medications   │
   │  - Known Allergies & Missing Info      │
   │  - Rule-Based Emergency Triage         │
   │  - English Clinical Note for Doctor    │
   │  - Gujarati Patient Summary (WhatsApp) │
   └────────────────────────────────────────┘
         ↓
  Editable Medical Card + WhatsApp Export
```

---

## 🔥 Key Features

- **🌐 Code-Mixed Multilingual Processing**: Native extraction from Gujarati, Hindi, English, and mixed inputs without intermediate translation layers.
- **🚨 Rule-Based Emergency Triage**: Instant red-flagging of chest pain, dyspnea, stroke indicators, or hypertensive crises.
- **📋 Doctor-Ready Clinical Notes**: Standardized English intake summary ready for medical review.
- **🇮🇳 Gujarati Patient Confirmation**: Patient-facing summary formatted for instant 1-click WhatsApp sharing.
- **✏️ Editable Summary Card**: All extracted fields can be modified by clinic staff before finalizing.
- **🎤 Web Speech Voice Input**: Native speech-to-text input support (`gu-IN` Gujarati).
- **⚡ Pre-loaded Demo Mode & Live API Integration**: Instant zero-key demonstration mode + optional live Google AI Studio key connection.
- **🔒 Privacy-First Design**: Zero patient data storage or persistent tracking.

---

## 🚀 Live Demo & Hosting

- **🌐 Web Application**: [https://swasthai-gemma4.vercel.app](https://swasthai-gemma4.vercel.app)
- **💻 GitHub Code Repository**: [https://github.com/shambhushekharsinha-engg/swasthai-gemma4](https://github.com/shambhushekharsinha-engg/swasthai-gemma4)

---

## 🛠️ Project Structure

```text
swasthai-gemma4/
├── index.html        # Main HTML5 application structure & UI layout
├── style.css         # Modern dark glassmorphism design system
├── app.js            # Core application logic & Gemma 4 API engine
├── vercel.json       # Production deployment & security header configuration
├── KAGGLE_WRITEUP.md # Hackathon writeup submission
└── README.md         # Documentation
```

---

## 💻 Local Development Setup

No build step or node package manager required!

1. Clone the repository:
   ```bash
   git clone https://github.com/shambhushekharsinha-engg/swasthai-gemma4.git
   cd swasthai-gemma4
   ```
2. Open `index.html` in your web browser.

---

## 🛡️ Responsible AI & Safety

- ❌ **No Diagnosis**: Prompt explicitly prohibits providing diagnostic opinions or treatment/dosage advice.
- ✅ **Administrative Intake Only**: Functions strictly as an administrative intake aid for human review.
- ⚠️ **Prominent Medical Disclaimer**: Clear disclaimers present across all UI panels.
