"""Add challenge_id to scores (daily challenge)

Revision ID: a1b2c3d4e5f6
Revises: 0169b4941585
Create Date: 2026-06-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0169b4941585'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('scores', sa.Column('challenge_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_scores_challenge_id'), 'scores', ['challenge_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_scores_challenge_id'), table_name='scores')
    op.drop_column('scores', 'challenge_id')
