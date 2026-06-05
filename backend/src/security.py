import base64
import hashlib
import hmac
import json
import os
import time

import bcrypt

# Signing secret for stateless session tokens. MUST be set in production
# (Render injects a generated value via render.yaml). The dev fallback is only
# for local/test runs and is intentionally not a real secret.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret")  # pragma: allowlist secret

# Session tokens are valid for 30 days.
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


# ---- Stateless HMAC session tokens (no external dependency) ----

def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(payload_b64: str) -> str:
    sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("ascii"), hashlib.sha256).digest()
    return _b64url_encode(sig)


def create_session_token(user_id: str, username: str) -> str:
    """Issue a signed token binding a request to a specific user."""
    payload = {
        "uid": str(user_id),
        "uname": username,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    return f"{payload_b64}.{_sign(payload_b64)}"


def verify_session_token(token: str) -> dict | None:
    """Return the token payload if the signature is valid and it hasn't expired."""
    if not isinstance(token, str) or "." not in token:
        return None
    payload_b64, _, sig = token.partition(".")
    # Constant-time signature check.
    if not hmac.compare_digest(sig, _sign(payload_b64)):
        return None
    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict) or int(payload.get("exp", 0)) < int(time.time()):
        return None
    return payload
