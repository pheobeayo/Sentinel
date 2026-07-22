"""
ScamClassifier — trains on seed data, persists to disk, and exposes
a predict() method used by the Flask API.
"""

import os
import pickle
import numpy as np
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import FunctionTransformer
from utils.preprocessing import preprocess, extract_raw_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "scam_model.pkl")

# ── Seed training data ─────────────────────────────────────────────────────
# Labels: 1 = scam, 0 = legitimate
# Balanced dataset: 40 scam, 40 legitimate
SEED_DATA = [
    # ── SCAM examples ──────────────────────────────────────────────────────
    ("Congratulations you have won one million dollars click here to claim your prize now", 1),
    ("Your bank account has been suspended please verify your pin and password immediately", 1),
    ("Send zero point five bitcoin and receive double back guaranteed limited time offer", 1),
    ("URGENT you must pay a processing fee of one hundred fifty dollars to release your lottery winnings", 1),
    ("Dear winner provide your bank account number and OTP to transfer funds to your account", 1),
    ("You have been selected for a free iPhone click this link to claim today only expires soon", 1),
    ("Your PayPal account is locked enter your credit card details to unlock it immediately", 1),
    ("We detected suspicious activity on your account call us immediately to avoid arrest and legal action", 1),
    ("Investment opportunity guaranteed three hundred percent return in seven days send money now", 1),
    ("Hello I am a prince and need to transfer five million dollars please assist me urgently", 1),
    ("Your parcel is held at customs pay twenty five dollars delivery fee to release it click here", 1),
    ("Final notice your social security number has been suspended call this number immediately or face arrest", 1),
    ("Work from home earn five hundred dollars daily no experience required send registration fee first", 1),
    ("Verify your identity now or your account will be permanently deleted within twenty four hours", 1),
    ("You owe back taxes the IRS will take legal action unless you pay with gift cards immediately", 1),
    ("You have been chosen as a lucky winner of our weekly draw claim your cash reward now", 1),
    ("WARNING your computer has a virus call our toll free number immediately to fix it now", 1),
    ("Your Netflix account has been suspended update your payment information to continue your membership", 1),
    ("Send your account details to receive your inheritance of eight million dollars from deceased relative", 1),
    ("Exclusive crypto investment double your money in forty eight hours guaranteed returns no risk", 1),
    ("You have won a gift card worth five hundred dollars complete the survey to claim it", 1),
    ("Your Amazon account has been compromised verify your details immediately to secure your account", 1),
    ("Limited offer send one hundred dollars now and receive one thousand dollars in twenty four hours", 1),
    ("ALERT your debit card has been blocked call our helpline immediately with your card number and pin", 1),
    ("Congratulations you are our monthly winner claim your prize of ten thousand dollars today only", 1),
    ("Dear customer your loan has been approved send processing fee of two hundred dollars to receive funds", 1),
    ("You have an unclaimed tax refund of two thousand dollars click here to claim it today", 1),
    ("Your WhatsApp account will be suspended unless you verify your number by clicking this link now", 1),
    ("Make money fast from home guaranteed income of two thousand dollars per week no experience needed", 1),
    ("URGENT your SIM card will be blocked update your KYC details immediately by clicking this link", 1),
    ("You have been pre approved for a loan of fifty thousand dollars no credit check required apply now", 1),
    ("Your account shows suspicious login please confirm your username and password to secure your account", 1),
    ("Charity lottery winner you have won fifty thousand pounds send your details to claim your prize", 1),
    ("Free government grant of ten thousand dollars available click here to apply before deadline today", 1),
    ("Your electric bill is overdue pay now to avoid disconnection click here to pay with gift card", 1),
    ("Romance investment opportunity my uncle left me gold bars help me transfer them and keep thirty percent", 1),
    ("FINAL WARNING legal proceedings will be initiated against you unless you pay outstanding debt now", 1),
    ("Congratulations your phone number was selected win a brand new car send your details to claim", 1),
    ("Your bank transfer of fifty thousand dollars is ready provide your account details to receive it", 1),
    ("You have been approved for a credit card with zero interest click here to activate your card now", 1),

    # ── LEGITIMATE examples ─────────────────────────────────────────────────
    ("Hey are you free for lunch on Thursday the new pasta place downtown around one pm", 0),
    ("Your order has shipped estimated delivery is next Tuesday track it on our website", 0),
    ("Meeting at nine am tomorrow to discuss the sprint backlog see you there", 0),
    ("I wanted to check in about the project report due on Friday let me know if you need help", 0),
    ("Can you pick up some milk and bread on your way home tonight thanks", 0),
    ("The conference call has been rescheduled to three pm please update your calendar accordingly", 0),
    ("Happy birthday hope you have a wonderful day with your family and friends", 0),
    ("Reminder your dentist appointment is on Monday at two pm please arrive five minutes early", 0),
    ("The latest software update is available please install it at your convenience this week", 0),
    ("Thanks for your application we will be in touch within five business days regarding next steps", 0),
    ("Your subscription will renew automatically on the fifteenth you can manage it in account settings", 0),
    ("Great work on the presentation everyone really loved the data visualization section well done", 0),
    ("The road on Oak Street is closed for repairs please use Elm Avenue as an alternative route", 0),
    ("Library books are due back by next week renewals are available online through the library portal", 0),
    ("Your electricity bill for this month is seventy eight dollars due on the twentieth of this month", 0),
    ("We are planning a team dinner on Friday evening at the Italian place on Main Street join us", 0),
    ("The school will be closed on Monday due to the public holiday classes resume on Tuesday morning", 0),
    ("Your flight booking confirmation number is AB1234 check in opens twenty four hours before departure", 0),
    ("Just checking if you received my last email about the project timeline let me know your thoughts", 0),
    ("The gym will be closed for maintenance this weekend and will reopen on Monday morning as usual", 0),
    ("Your package has been delivered and left at the front door as requested please check when you can", 0),
    ("Hi can we reschedule our meeting to next week I have a conflict on Thursday afternoon", 0),
    ("The quarterly report is ready for review I have shared it with you on Google Drive please check", 0),
    ("Your prescription is ready for pickup at the pharmacy please bring your ID when collecting it", 0),
    ("We are hosting a community cleanup event this Saturday morning volunteers are welcome to join us", 0),
    ("Please find attached the invoice for last month services payment is due within thirty days", 0),
    ("The internet will be down for maintenance tonight from midnight to two am we apologize for inconvenience", 0),
    ("Your job application has been received we will review it and contact you within two weeks", 0),
    ("Reminder to submit your timesheet by end of day Friday so payroll can be processed on time", 0),
    ("The new coffee machine in the break room is now working please clean up after yourself thank you", 0),
    ("Your car service is due please call us to book an appointment at your earliest convenience", 0),
    ("We would like to invite you to our annual charity fundraiser dinner next month details to follow", 0),
    ("The water will be shut off tomorrow from nine am to noon for routine maintenance in the area", 0),
    ("Your visa application has been received processing typically takes ten to fifteen business days", 0),
    ("Please note the office will close at three pm this Friday for the company end of year event", 0),
    ("Your test results are available please log into the patient portal to view them or call the clinic", 0),
    ("The book club meeting is this Wednesday at seven pm at Sarah house everyone is welcome to come", 0),
    ("Your direct debit of fifty pounds for home insurance has been processed thank you for being a customer", 0),
    ("Hi just a reminder that rent is due on the first of next month please transfer it to the usual account", 0),
    ("The parent teacher meeting is scheduled for next Thursday evening please confirm your attendance", 0),
]


def _dense_features(texts):
    rows = []
    for t in texts:
        f = extract_raw_features(t)
        rows.append(list(f.values()))
    return np.array(rows, dtype=np.float64)


class ScamClassifier:
    def __init__(self):
        self.pipeline = None
        self._load_or_train()

    def _build_pipeline(self):
        tfidf = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=8000,
            sublinear_tf=True,
            min_df=1,
        )
        dense = FunctionTransformer(_dense_features, validate=False)
        features = FeatureUnion([
            ("tfidf", tfidf),
            ("hand_crafted", dense),
        ])
        # Higher C = less regularisation, better fit on small dataset
        # class_weight balanced handles any remaining imbalance
        clf = LogisticRegression(
            max_iter=2000,
            C=2.0,
            class_weight="balanced",
            solver="lbfgs",
        )
        return Pipeline([("features", features), ("clf", clf)])

    def _train(self):
        texts  = [preprocess(t) for t, _ in SEED_DATA]
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
        """Force a retrain — call after editing SEED_DATA."""
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        self._train()

    def predict(self, text: str) -> dict:
        processed  = preprocess(text)
        proba      = self.pipeline.predict_proba([processed])[0]
        scam_prob  = float(proba[1])
        raw        = extract_raw_features(text)

        # Adjusted thresholds — raise SCAM bar to reduce false positives
        if scam_prob >= 0.65:
            verdict = "SCAM"
        elif scam_prob >= 0.40:
            verdict = "SUSPICIOUS"
        else:
            verdict = "SAFE"

        flags = self._build_flags(text, raw, scam_prob)

        return {
            "verdict":    verdict,
            "confidence": round(scam_prob * 100, 1),
            "flags":      flags,
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


classifier = ScamClassifier()