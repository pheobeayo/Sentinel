from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class AnalysisRecord(db.Model):
    __tablename__ = "analysis_records"

    id = db.Column(db.Integer, primary_key=True)
    conversation_text = db.Column(db.Text, nullable=False)
    verdict = db.Column(db.String(20), nullable=False)       # SCAM | SUSPICIOUS | SAFE
    confidence = db.Column(db.Float, nullable=False)
    flags = db.Column(db.Text, nullable=True)                # JSON array stored as string
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "conversation_snippet": self.conversation_text[:120] + ("…" if len(self.conversation_text) > 120 else ""),
            "verdict": self.verdict,
            "confidence": round(self.confidence, 1),
            "flags": json.loads(self.flags) if self.flags else [],
            "summary": self.summary,
            "created_at": self.created_at.isoformat(),
        }
