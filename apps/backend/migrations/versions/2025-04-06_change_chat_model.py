"""change chat model

Revision ID: e1867ed4ab76
Revises: dce495e3513b
Create Date: 2025-04-06 21:31:53.623405

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "e1867ed4ab76"
down_revision: Union[str, None] = "dce495e3513b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Создаём enum тип
    chat_status_enum = postgresql.ENUM("OPEN", "CLOSED", name="chatstatus")
    chat_status_enum.create(op.get_bind())

    # Добавляем поля
    op.add_column("chats", sa.Column("name", sa.String(), nullable=False))
    op.add_column(
        "chats",
        sa.Column("status", chat_status_enum, nullable=False, server_default="OPEN"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем поля
    op.drop_column("chats", "status")
    op.drop_column("chats", "name")

    # Удаляем enum тип
    chat_status_enum = postgresql.ENUM("OPEN", "CLOSED", name="chatstatus")
    chat_status_enum.drop(op.get_bind())
