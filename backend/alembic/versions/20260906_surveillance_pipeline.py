"""Add surveillance pipeline tables and event metadata.

Revision ID: 20260906_surveillance_pipeline
Revises:
"""

from alembic import op
import sqlalchemy as sa

revision = "20260906_surveillance_pipeline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("detection_events", sa.Column("zone_id", sa.String(length=50), nullable=True))
    op.add_column("detection_events", sa.Column("risk_score", sa.Float(), nullable=True))
    op.add_column("detection_events", sa.Column("event_type", sa.String(length=100), nullable=True))
    op.add_column("detection_events", sa.Column("environment_context", sa.Text(), nullable=True))
    op.create_index("ix_detection_events_zone_id", "detection_events", ["zone_id"])
    op.add_column("alerts", sa.Column("event_id", sa.String(length=50), nullable=True))
    op.add_column("alerts", sa.Column("zone_id", sa.String(length=50), nullable=True))
    op.add_column("alerts", sa.Column("risk_score", sa.Float(), nullable=True))
    op.create_index("ix_alerts_event_id", "alerts", ["event_id"])
    op.create_index("ix_alerts_zone_id", "alerts", ["zone_id"])
    op.add_column("incidents", sa.Column("event_id", sa.String(length=50), nullable=True))
    op.add_column("incidents", sa.Column("object_type", sa.String(length=50), nullable=True))
    op.add_column("incidents", sa.Column("tracking_id", sa.String(length=100), nullable=True))
    op.add_column("incidents", sa.Column("confidence", sa.Float(), nullable=True))
    op.add_column("incidents", sa.Column("evidence_path", sa.Text(), nullable=True))
    op.add_column("incidents", sa.Column("operator_notes", sa.Text(), nullable=True))
    op.create_index("ix_incidents_event_id", "incidents", ["event_id"])
    op.create_table(
        "zones",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("camera_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("polygon", sa.JSON(), nullable=False),
        sa.Column("zone_type", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_zones_id", "zones", ["id"])
    op.create_index("ix_zones_camera_id", "zones", ["camera_id"])
    op.create_table(
        "detections",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("camera_id", sa.String(length=50), nullable=False),
        sa.Column("class_name", sa.String(length=50), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("x1", sa.Integer(), nullable=False),
        sa.Column("y1", sa.Integer(), nullable=False),
        sa.Column("x2", sa.Integer(), nullable=False),
        sa.Column("y2", sa.Integer(), nullable=False),
        sa.Column("frame_number", sa.Integer(), nullable=True),
        sa.Column("timestamp_seconds", sa.Float(), nullable=False),
        sa.Column("processing_timestamp", sa.String(length=100), nullable=False),
        sa.Column("tracking_id", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detections_id", "detections", ["id"])
    op.create_index("ix_detections_camera_id", "detections", ["camera_id"])
    op.create_index("ix_detections_class_name", "detections", ["class_name"])
    op.create_index("ix_detections_tracking_id", "detections", ["tracking_id"])
    op.create_table(
        "evidence",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("event_id", sa.String(length=50), nullable=False),
        sa.Column("camera_id", sa.String(length=50), nullable=False),
        sa.Column("evidence_type", sa.String(length=30), nullable=False),
        sa.Column("path", sa.Text(), nullable=False),
        sa.Column("created_at", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_evidence_id", "evidence", ["id"])
    op.create_index("ix_evidence_event_id", "evidence", ["event_id"])
    op.create_index("ix_evidence_camera_id", "evidence", ["camera_id"])


def downgrade() -> None:
    op.drop_table("evidence")
    op.drop_table("detections")
    op.drop_table("zones")
    op.drop_index("ix_incidents_event_id", table_name="incidents")
    for column in ("operator_notes", "evidence_path", "confidence", "tracking_id", "object_type", "event_id"):
        op.drop_column("incidents", column)
    op.drop_index("ix_alerts_zone_id", table_name="alerts")
    op.drop_index("ix_alerts_event_id", table_name="alerts")
    for column in ("risk_score", "zone_id", "event_id"):
        op.drop_column("alerts", column)
    op.drop_index("ix_detection_events_zone_id", table_name="detection_events")
    for column in ("environment_context", "event_type", "risk_score", "zone_id"):
        op.drop_column("detection_events", column)
