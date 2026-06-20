# SENTINEL — AI-Based Scam Conversation Detector

SENTINEL is a full-stack web application that uses Machine Learning and Natural Language Processing to detect fraudulent and suspicious conversations in real time. Paste any chat message, SMS, or email content and receive an instant verdict with a confidence score and red flag analysis.


---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
  - [Deploy Backend (Render)](#deploy-backend-render)
  - [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
- [ML Model](#ml-model)
- [Success Metrics](#success-metrics)
- [Future Enhancements](#future-enhancements)

---

## Overview

Online scams have become increasingly sophisticated, targeting individuals through messaging platforms, social media, email, and SMS. SENTINEL addresses the gap in conversation-level scam detection by automatically analysing text content and warning users when suspicious patterns are found.

**How it works:**

1. User pastes a conversation into the input field
2. The text is sent to the Flask backend
3. The ML model preprocesses the text and extracts features
4. A classification verdict is returned — **SCAM**, **SUSPICIOUS**, or **SAFE**
5. The result is displayed with a confidence score and specific red flags
6. Every analysis is stored in the database for review

---

## Features

- **Real-time scam detection** — verdict returned in under 3 seconds
- **Three-tier classification** — SCAM, SUSPICIOUS, or SAFE
- **Confidence scoring** — percentage confidence for each prediction
- **Red flag breakdown** — specific reasons why content was flagged
- **Analysis history** — browse, filter, and delete past analyses
- **Admin dashboard** — stats, verdict distribution, and engine status
- **Sample conversations** — quick-test buttons with real scam examples
- **Fully responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2.7 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12 | Runtime |
| Flask | 3.0 | Web framework |
| scikit-learn | 1.5 | ML classification |
| NLTK | 3.8 | NLP preprocessing |
| SQLite | — | Database |
| Flask-SQLAlchemy | 3.1 | ORM |
| Flask-CORS | 4.0 | Cross-origin requests |

---

## Project Structure

```
scam-detector/
├── backend/
│   ├── app.py                  # Flask factory + entry point
│   ├── database.py             # SQLAlchemy model (AnalysisRecord)
│   ├── requirements.txt
│   ├── models/
│   │   └── classifier.py       # TF-IDF + Logistic Regression model
│   ├── routes/
│   │   ├── analyze.py          # POST /api/analyze
│   │   ├── history.py          # GET/DELETE /api/history
│   │   └── stats.py            # GET /api/stats
│   └── utils/
│       └── preprocessing.py    # NLP pipeline (tokenize, lemmatize)
│
├── frontend/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 + custom design tokens
│   │   ├── layout.tsx          # Root layout with nav
│   │   ├── page.tsx            # Analyze page
│   │   ├── history/page.tsx    # History page
│   │   └── stats/page.tsx      # Dashboard page
│   ├── components/
│   │   ├── NavLink.tsx         # Active-state nav links
│   │   ├── VerdictBadge.tsx    # SCAM / SUSPICIOUS / SAFE pill
│   │   ├── ConfidenceBar.tsx   # Animated progress bar
│   │   ├── ResultCard.tsx      # Full analysis result card
│   │   ├── StatCard.tsx        # Metric card for dashboard
│   │   └── LoadingSkeleton.tsx # Shimmer loading state
│   ├── constant/
│   │   └── samples.ts          # Sample scam/legitimate conversations
│   ├── lib/
│   │   └── api.ts              # Typed API client
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── .env.local              # Local environment variables (not committed)
│   └── .env.example            # Template for environment variables
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **Python** >= 3.10
- **npm** or **yarn**

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
python app.py
```

The backend will start at `http://localhost:5000`.

The ML model trains automatically on first run and saves to `models/scam_model.pkl`. Subsequent starts load from the saved file.

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Run the development server
npm run dev
```

The frontend will start at `http://localhost:3000`.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL of the Flask backend API | `http://localhost:5000/api` |

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the values. **Never commit `.env.local`.**

### Backend

No `.env` file is required for local development. For production, set:

| Variable | Description |
|----------|-------------|
| `FLASK_ENV` | Set to `production` |
| `DATABASE_URL` | PostgreSQL URL if switching from SQLite |

---

## API Reference

Base URL: `http://localhost:5000/api`

### `POST /analyze`

Analyse a conversation for scam patterns.

**Request body:**
```json
{ "text": "Congratulations! You have won £850,000..." }
```

**Response:**
```json
{
  "id": 1,
  "verdict": "SCAM",
  "confidence": 94.2,
  "flags": [
    "Unsolicited prize or money mention",
    "Requests for personal or financial information"
  ],
  "summary": "Classified as a scam with 94% confidence. 2 red flag(s) found.",
  "created_at": "2025-06-13T09:00:00"
}
```

---

### `GET /history`

Retrieve paginated analysis history.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Results per page (max 100) |
| `verdict` | string | — | Filter by `SCAM`, `SUSPICIOUS`, or `SAFE` |

---

### `DELETE /history/:id`

Delete a specific analysis record.

---

### `GET /stats`

Returns system performance statistics.

**Response:**
```json
{
  "total_analyzed": 42,
  "scam_count": 18,
  "suspicious_count": 7,
  "safe_count": 17,
  "scam_detection_rate": 42.8,
  "average_confidence": 81.3
}
```

---

## Deployment

### Deploy Backend (Render)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository and select the `backend/` folder as root
4. Set the following:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:create_app()`
   - **Environment:** Python 3
5. Add environment variable: `FLASK_ENV=production`
6. Deploy — copy the live URL (e.g. `https://sentinel-backend.onrender.com`)

---

### Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Go to **Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` |

5. Deploy

> **Note:** Deploy the backend first so you have a real URL for step 4.

---

## ML Model

The classifier uses a hybrid feature approach:

**Text features (TF-IDF)**
- Unigrams and bigrams, 5000 features
- Sublinear TF scaling

**Hand-crafted signal features**
- Urgency word count (`urgent`, `expire`, `act now`…)
- Money/prize references (`won`, `lottery`, `bitcoin`…)
- Personal info requests (`OTP`, `PIN`, `account number`…)
- Threat language (`suspended`, `legal action`, `arrest`…)
- Suspicious URL presence
- Caps ratio and exclamation mark count

**Classifier:** Logistic Regression with `class_weight="balanced"`

**Verdict thresholds:**

| Scam probability | Verdict |
|-----------------|---------|
| ≥ 70% | SCAM |
| 40–69% | SUSPICIOUS |
| < 40% | SAFE |

To retrain after adding more data to `SEED_DATA` in `models/classifier.py`:

```python
from models.classifier import classifier
classifier.retrain()
```

For better accuracy, replace the seed dataset with a real labelled corpus such as the [UCI SMS Spam Collection](https://archive.ics.uci.edu/ml/datasets/SMS+Spam+Collection).

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Detection accuracy | ≥ 90% |
| False positive rate | < 10% |
| Prediction response time | < 3 seconds |

---

## Future Enhancements

- [ ] Deep learning / transformer-based model (BERT)
- [ ] WhatsApp and Telegram integration
- [ ] Multilingual support
- [ ] Voice scam detection
- [ ] Mobile application (React Native)
- [ ] Browser extension
- [ ] Real-time webhook alerts