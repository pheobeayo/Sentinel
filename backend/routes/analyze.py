import json
from flask import Blueprint, request, jsonify
from database import db, AnalysisRecord
from models.classifier import classifier

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    body = request.get_json(silent=True)
    if not body or not body.get("text", "").strip():
        return jsonify({"error": "Field 'text' is required and must not be empty."}), 400

    text = body["text"].strip()
    if len(text) > 10_000:
        return jsonify({"error": "Text exceeds 10,000 character limit."}), 400

    result = classifier.predict(text)

    record = AnalysisRecord(
        conversation_text=text,
        verdict=result["verdict"],
        confidence=result["confidence"],
        flags=json.dumps(result["flags"]),
        summary=_build_summary(result),
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "id": record.id,
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "flags": result["flags"],
        "summary": record.summary,
        "created_at": record.created_at.isoformat(),
    })


def _build_summary(result: dict) -> str:
    v = result["verdict"]
    c = result["confidence"]
    if v == "SCAM":
        return f"Classified as a scam with {c:.0f}% confidence. {len(result['flags'])} red flag(s) found."
    if v == "SUSPICIOUS":
        return f"Conversation appears suspicious ({c:.0f}% confidence). Proceed with caution."
    return f"No scam patterns detected. Confidence: {c:.0f}%."
