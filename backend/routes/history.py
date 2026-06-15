from flask import Blueprint, request, jsonify
from database import db, AnalysisRecord

history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
def get_history():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    verdict_filter = request.args.get("verdict", "").upper()

    query = AnalysisRecord.query.order_by(AnalysisRecord.created_at.desc())
    if verdict_filter in ("SCAM", "SUSPICIOUS", "SAFE"):
        query = query.filter(AnalysisRecord.verdict == verdict_filter)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "records": [r.to_dict() for r in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page,
    })


@history_bp.route("/history/<int:record_id>", methods=["DELETE"])
def delete_record(record_id):
    record = AnalysisRecord.query.get_or_404(record_id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({"deleted": record_id})
