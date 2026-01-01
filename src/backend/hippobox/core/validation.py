# Email: simple local@domain.tld format (no whitespace).
import re

# Email: simple local@domain.tld format (no whitespace).
EMAIL_REGEX = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

# Password: 8-64 chars, no spaces; additional checks enforce uppercase + digit + special.
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 64
PASSWORD_REGEX = r"^\S{8,64}$"


def is_password_strong(value: str) -> bool:
    if not re.match(PASSWORD_REGEX, value):
        return False
    has_upper = any(ch.isupper() for ch in value)
    has_digit = any(ch.isdigit() for ch in value)
    has_special = any(not ch.isalnum() for ch in value)
    return has_upper and has_digit and has_special


# Name: 2-30 chars, starts with alnum/Hangul; allows spaces, dots, underscores, hyphens.
NAME_MIN_LENGTH = 2
NAME_MAX_LENGTH = 30
NAME_REGEX = r"^[A-Za-z0-9\uAC00-\uD7A3](?:[A-Za-z0-9\uAC00-\uD7A3 _.-]{1,29})$"
