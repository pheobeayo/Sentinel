from flask import Blueprint, jsonify
from sqlalchemy import func
from database import db, AnalysisRecord

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/stats", methods=["GET"])
def get_stats():
    total = db.session.query(func.count(AnalysisRecord.id)).scalar() or 0
    verdict_counts = (
        db.session.query(AnalysisRecord.verdict, func.count(AnalysisRecord.id))
        .group_by(AnalysisRecord.verdict)
        .all()
    )
    counts = {v: c for v, c in verdict_counts}
    scam_count = counts.get("SCAM", 0)
    suspicious_count = counts.get("SUSPICIOUS", 0)
    safe_count = counts.get("SAFE", 0)

    avg_confidence = (
        db.session.query(func.avg(AnalysisRecord.confidence)).scalar() or 0.0
    )

    scam_rate = round((scam_count / total) * 100, 1) if total else 0.0

    return jsonify({
        "total_analyzed": total,
        "scam_count": scam_count,
        "suspicious_count": suspicious_count,
        "safe_count": safe_count,
        "scam_detection_rate": scam_rate,
        "average_confidence": round(float(avg_confidence), 1),
    })
