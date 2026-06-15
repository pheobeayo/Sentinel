"""
ScamClassifier — trains on synthetic seed data, persists to disk, and exposes
a predict() method used by the Flask API.

In production you would replace the seed dataset with a real labelled corpus
(e.g. the SMS Spam Collection from UCI or a custom dataset).
"""

import os
import json
import pickle
import numpy as np
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import FunctionTransformer
from sklearn.model_selection import cross_val_score
from utils.preprocessing import preprocess, extract_raw_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "scam_model.pkl")

# ── Seed training data ────────────────────────────────────────────────────────
# Labels: 1 = scam, 0 = legitimate
# Replace / augment this with a real dataset for better accuracy.
SEED_DATA = [
    # Scam examples
    ("Congratulations you have won 1000000 dollars click here to claim your prize now", 1),
    ("Your bank account has been suspended please verify your pin and password immediately", 1),
    ("Send 0.5 BTC and receive double back guaranteed limited time offer", 1),
    ("URGENT you must pay a processing fee of 150 dollars to release your lottery winnings", 1),
    ("Dear winner provide your bank account number and OTP to transfer funds", 1),
    ("You have been selected for a free iPhone click this link to claim today only", 1),
    ("Your PayPal account is locked enter your credit card details to unlock", 1),
    ("We detected suspicious activity on your account call us immediately to avoid arrest", 1),
    ("Investment opportunity guaranteed 300 percent return in 7 days send money now", 1),
    ("Hello I am a prince and need to transfer 5 million dollars please assist me", 1),
    ("Your parcel is held at customs pay 25 dollars delivery fee to release it click here", 1),
    ("Final notice your social security number has been suspended call this number immediately", 1),
    ("Work from home earn 500 dollars daily no experience required send registration fee", 1),
    ("Verify your identity now or your account will be permanently deleted within 24 hours", 1),
    ("You owe back taxes the IRS will take legal action unless you pay with gift cards now", 1),
    # Legitimate examples
    ("Hey are you free for lunch on Thursday the pasta place downtown", 0),
    ("Your order has shipped estimated delivery is next Tuesday track it on our website", 0),
    ("Meeting at 9am tomorrow to discuss the sprint backlog see you there", 0),
    ("I wanted to check in about the project report due on Friday", 0),
    ("Can you pick up some milk on your way home thanks", 0),
    ("The conference call is rescheduled to 3pm please update your calendar", 0),
    ("Happy birthday hope you have a wonderful day", 0),
    ("Reminder your dentist appointment is on Monday at 2pm", 0),
    ("The latest software update is available please install at your convenience", 0),
    ("Thanks for your application we will be in touch within five business days", 0),
    ("Your subscription will renew automatically on the 15th you can manage it in settings", 0),
    ("Great work on the presentation everyone loved the data visualization section", 0),
    ("The road on Oak Street is closed for repairs please use Elm Avenue as a detour", 0),
    ("Library books are due back by next week renewals available online", 0),
    ("Your electricity bill for this month is 78 dollars due on the 20th", 0),
]


def _dense_features(texts):
    """Convert texts to dense hand-crafted feature matrix."""
    from utils.preprocessing import extract_raw_features
    rows = []
    for t in texts:
        f = extract_raw_features(t)
        rows.append(list(f.values()))
    return np.array(rows, dtype=np.float64)


class ScamClassifier:
    def __init__(self):
        self.pipeline = None
        self.classes_ = ["SAFE", "SCAM"]
        self._load_or_train()

    # ── Training ───────────────────────────────────────────────────────────────
    def _build_pipeline(self):
        tfidf = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
        )
        dense = FunctionTransformer(_dense_features, validate=False)

        features = FeatureUnion([
            ("tfidf", tfidf),
            ("hand_crafted", dense),
        ])

        clf = LogisticRegression(max_iter=1000, C=1.0, class_weight="balanced")

        return Pipeline([("features", features), ("clf", clf)])

    def _train(self):
        texts = [preprocess(t) for t, _ in SEED_DATA]
        labels = [label for _, label in SEED_DATA]
        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, labels)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(self.pipeline, f)

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                self.pipeline = pickle.load(f)
        else:
            self._train()

    def retrain(self):
        """Force a retrain (call after adding new training data)."""
        self._train()

    # ── Prediction ─────────────────────────────────────────────────────────────
    def predict(self, text: str) -> dict:
        """
        Returns:
            verdict: SCAM | SUSPICIOUS | SAFE
            confidence: float 0-100
            flags: list of red-flag strings
        """
        processed = preprocess(text)
        proba = self.pipeline.predict_proba([processed])[0]
        scam_prob = float(proba[1])
        raw_features = extract_raw_features(text)

        if scam_prob >= 0.7:
            verdict = "SCAM"
        elif scam_prob >= 0.4:
            verdict = "SUSPICIOUS"
        else:
            verdict = "SAFE"

        flags = self._build_flags(text, raw_features, scam_prob)

        return {
            "verdict": verdict,
            "confidence": round(scam_prob * 100, 1),
            "flags": flags,
        }

    def _build_flags(self, text: str, features: dict, scam_prob: float) -> list:
        flags = []
        if features["urgency_count"] >= 2:
            flags.append("High-urgency language designed to create panic")
        if features["money_count"] >= 2:
            flags.append("Unsolicited money or prize mentions")
        if features["personal_info_request"] >= 1:
            flags.append("Requests for sensitive personal or financial information")
        if features["threat_count"] >= 1:
            flags.append("Threatening consequences to pressure compliance")
        if features["has_suspicious_link"]:
            flags.append("Contains suspicious or shortened URL")
        if features["caps_ratio"] > 0.15:
            flags.append("Excessive use of capital letters — common pressure tactic")
        if features["exclamation_count"] >= 3:
            flags.append("Multiple exclamation marks — manipulation signal")
        return flags[:5]


# Singleton instance — import this in routes
classifier = ScamClassifier()
