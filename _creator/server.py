"""Loopback-only Creator Dashboard for the portfolio.

This server intentionally binds to 127.0.0.1. It serves the public portfolio
for previewing and exposes authenticated editing endpoints only under
/__creator/. It has no remote-listening mode.
"""

from __future__ import annotations

import cgi
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from datetime import datetime, timezone
from functools import partial
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent.parent
CREATOR_DIR = Path(__file__).resolve().parent
CONTENT_DIR = ROOT / "content"
SITE_FILE = CONTENT_DIR / "site.json"
PROJECTS_FILE = CONTENT_DIR / "projects.json"
PROJECTS_SCRIPT = ROOT / "projects.js"
SECRET_FILE = CREATOR_DIR / ".secret.json"
BACKUP_DIR = CREATOR_DIR / "backups"
HOST = "127.0.0.1"
PORT = 4140
SESSION_TTL_SECONDS = 30 * 60
MAX_JSON_BYTES = 2 * 1024 * 1024
MAX_UPLOAD_BYTES = 100 * 1024 * 1024
PBKDF2_ITERATIONS = 390_000

ALLOWED_UPLOADS = {
    "images": {
        "extensions": {".png", ".jpg", ".jpeg", ".webp", ".gif"},
        "directory": ROOT / "assets" / "images" / "uploads",
    },
    "videos": {
        "extensions": {".mp4", ".webm"},
        "directory": ROOT / "assets" / "videos" / "uploads",
    },
    "docs": {
        "extensions": {".pdf"},
        "directory": ROOT / "assets" / "docs" / "uploads",
    },
}

SESSIONS: dict[str, dict[str, object]] = {}
FAILED_LOGINS: list[float] = []
STATE_LOCK = threading.RLock()


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S-%f")


def json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, indent=2).encode("utf-8") + b"\n"


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="wb", dir=str(path.parent), prefix=f".{path.name}.", suffix=".tmp", delete=False
    ) as handle:
        handle.write(data)
        temp_path = Path(handle.name)
    os.replace(temp_path, path)


def read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def backup_file(path: Path) -> None:
    if not path.exists():
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, BACKUP_DIR / f"{utc_stamp()}-{path.name}")


def hash_code(code: str, salt: bytes | None = None) -> dict[str, object]:
    actual_salt = salt or secrets.token_bytes(24)
    digest = hashlib.pbkdf2_hmac(
        "sha256", code.encode("utf-8"), actual_salt, PBKDF2_ITERATIONS
    )
    return {
        "algorithm": "pbkdf2-sha256",
        "iterations": PBKDF2_ITERATIONS,
        "salt": actual_salt.hex(),
        "digest": digest.hex(),
    }


def ensure_secret() -> None:
    if SECRET_FILE.exists():
        return
    # This default is only a local convenience. The dashboard encourages the
    # owner to replace it, and the plaintext is never written to disk.
    initial_code = os.environ.get("PORTFOLIO_DASHBOARD_CODE", "4140p")
    atomic_write(SECRET_FILE, json_bytes(hash_code(initial_code)))
    print("Creator unlock initialized. Local code: 4140p")
    print("Change it from Dashboard > Security after signing in.")


def verify_code(code: str) -> bool:
    try:
        record = read_json(SECRET_FILE)
        salt = bytes.fromhex(str(record["salt"]))
        iterations = int(record["iterations"])
        expected = bytes.fromhex(str(record["digest"]))
        candidate = hashlib.pbkdf2_hmac(
            "sha256", code.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(candidate, expected)
    except (OSError, ValueError, KeyError, TypeError):
        return False


def change_code(new_code: str) -> None:
    if len(new_code) < 5 or len(new_code) > 128:
        raise ValueError("The unlock code must be between 5 and 128 characters.")
    atomic_write(SECRET_FILE, json_bytes(hash_code(new_code)))


def is_safe_href(value: str, *, allow_mailto: bool = False) -> bool:
    if not isinstance(value, str) or not value or len(value) > 2048:
        return False
    parsed = urlparse(value)
    if parsed.scheme:
        allowed = {"http", "https"}
        if allow_mailto:
            allowed.add("mailto")
        scheme = parsed.scheme.lower()
        if scheme not in allowed:
            return False
        if scheme in {"http", "https"}:
            return bool(parsed.netloc)
        return bool(parsed.path)
    normalized = value.replace("\\", "/")
    return not (
        normalized.startswith(("/", "//"))
        or ".." in normalized.split("/")
        or any(ch in normalized for ch in ("\x00", "\r", "\n"))
    )


def clean_text(value: object, field: str, limit: int = 500) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be text.")
    value = value.strip()
    if not value:
        raise ValueError(f"{field} cannot be empty.")
    if len(value) > limit:
        raise ValueError(f"{field} is too long.")
    return value


def validate_site(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        raise ValueError("Site content must be an object.")

    profile = payload.get("profile")
    if not isinstance(profile, dict):
        raise ValueError("Profile settings are missing.")

    roles = profile.get("roles")
    if not isinstance(roles, list) or not 1 <= len(roles) <= 12:
        raise ValueError("Add between 1 and 12 roles.")

    clean_profile = {
        "name": clean_text(profile.get("name"), "Name", 100),
        "company": clean_text(profile.get("company"), "Company", 100),
        "email": clean_text(profile.get("email"), "Email", 254),
        "greeting": clean_text(profile.get("greeting"), "Greeting", 100),
        "summary": clean_text(profile.get("summary"), "Summary", 400),
        "roles": [clean_text(role, "Role", 80) for role in roles],
        "avatar": clean_text(profile.get("avatar"), "Avatar path", 500),
        "resume": clean_text(profile.get("resume"), "Resume path", 500),
    }
    if "@" not in clean_profile["email"]:
        raise ValueError("Enter a valid email address.")
    if not is_safe_href(clean_profile["avatar"]) or not is_safe_href(clean_profile["resume"]):
        raise ValueError("Avatar and resume paths must be safe local paths or HTTPS URLs.")

    badges = payload.get("badges", [])
    if not isinstance(badges, list) or len(badges) > 8:
        raise ValueError("Badges must be a list with at most 8 items.")

    socials = payload.get("socials", {})
    if not isinstance(socials, dict) or len(socials) > 20:
        raise ValueError("Social links are invalid.")
    clean_socials: dict[str, str] = {}
    for label, href in socials.items():
        clean_label = clean_text(label, "Social label", 50)
        clean_href = clean_text(href, f"{clean_label} link", 2048)
        if not is_safe_href(clean_href):
            raise ValueError(f"{clean_label} must use an HTTP or HTTPS URL.")
        clean_socials[clean_label] = clean_href

    stats = payload.get("stats", [])
    if not isinstance(stats, list) or not 1 <= len(stats) <= 8:
        raise ValueError("Add between 1 and 8 statistics.")
    clean_stats = []
    for index, stat in enumerate(stats):
        if not isinstance(stat, dict):
            raise ValueError(f"Statistic {index + 1} is invalid.")
        clean_stats.append(
            {
                "value": clean_text(stat.get("value"), "Statistic value", 30),
                "suffix": str(stat.get("suffix", ""))[:8],
                "label": clean_text(stat.get("label"), "Statistic label", 80),
                "animated": bool(stat.get("animated", False)),
            }
        )

    copy = payload.get("copy", {})
    if not isinstance(copy, dict):
        raise ValueError("Page copy is invalid.")
    clean_copy = {
        "projectsTitle": clean_text(copy.get("projectsTitle"), "Projects title", 100),
        "contactTitle": clean_text(copy.get("contactTitle"), "Contact title", 100),
        "contactText": clean_text(copy.get("contactText"), "Contact text", 400),
        "footerTitle": clean_text(copy.get("footerTitle"), "Footer title", 140),
    }

    background = payload.get("background", {})
    if not isinstance(background, dict):
        raise ValueError("Background settings are invalid.")

    def bounded_int(key: str, minimum: int, maximum: int) -> int:
        try:
            number = int(background.get(key))
        except (TypeError, ValueError):
            raise ValueError(f"{key} must be a number.") from None
        if not minimum <= number <= maximum:
            raise ValueError(f"{key} must be between {minimum} and {maximum}.")
        return number

    return {
        "profile": clean_profile,
        "badges": [clean_text(item, "Badge", 120) for item in badges],
        "socials": clean_socials,
        "stats": clean_stats,
        "copy": clean_copy,
        "background": {
            "desktopPerViewport": bounded_int("desktopPerViewport", 4, 40),
            "tabletPerViewport": bounded_int("tabletPerViewport", 4, 30),
            "mobilePerViewport": bounded_int("mobilePerViewport", 2, 20),
            "maximum": bounded_int("maximum", 20, 240),
        },
    }


def validate_projects(payload: object) -> list[dict[str, object]]:
    if not isinstance(payload, list) or len(payload) > 100:
        raise ValueError("Projects must be a list with at most 100 entries.")

    cleaned = []
    seen_ids: set[int] = set()
    for index, item in enumerate(payload):
        if not isinstance(item, dict):
            raise ValueError(f"Project {index + 1} is invalid.")
        try:
            project_id = int(item.get("id"))
        except (TypeError, ValueError):
            raise ValueError(f"Project {index + 1} needs a numeric ID.") from None
        if project_id < 1 or project_id > 999999 or project_id in seen_ids:
            raise ValueError("Project IDs must be unique positive numbers.")
        seen_ids.add(project_id)

        tags = item.get("tags", [])
        if not isinstance(tags, list) or len(tags) > 20:
            raise ValueError(f"Project {project_id} has invalid tags.")

        link = clean_text(item.get("link"), "Project link", 2048)
        documentation = clean_text(
            item.get("documentation", f"docs.html?id={project_id}"),
            "Documentation link",
            2048,
        )
        thumbnail = clean_text(item.get("thumbnail"), "Thumbnail path", 500)
        video = clean_text(item.get("video"), "Video path", 500)
        for label, href in (
            ("Project link", link),
            ("Documentation link", documentation),
            ("Thumbnail path", thumbnail),
            ("Video path", video),
        ):
            if not is_safe_href(href):
                raise ValueError(f"{label} for project {project_id} is unsafe.")

        cleaned.append(
            {
                "id": project_id,
                "title": clean_text(item.get("title"), "Project title", 140),
                "desc": clean_text(item.get("desc"), "Project description", 1200),
                "proof": clean_text(item.get("proof"), "Project evidence", 300),
                "tags": [clean_text(tag, "Tag", 60) for tag in tags],
                "thumbnail": thumbnail,
                "video": video,
                "link": link,
                "documentation": documentation,
                "isHighlight": bool(item.get("isHighlight", False)),
                "isPortrait": bool(item.get("isPortrait", False)),
                "published": bool(item.get("published", True)),
            }
        )
    return cleaned


def generate_projects_script(projects: list[dict[str, object]]) -> bytes:
    payload = json.dumps(projects, ensure_ascii=False, indent=2).replace("</", "<\\/")
    text = (
        "/* Generated from content/projects.json by the local Creator Dashboard. */\n"
        f"const PROJECT_DATA = {payload};\n"
    )
    return text.encode("utf-8")


def list_media() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for kind, config in ALLOWED_UPLOADS.items():
        base = config["directory"]
        if not isinstance(base, Path) or not base.exists():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            records.append(
                {
                    "kind": kind,
                    "path": path.relative_to(ROOT).as_posix(),
                    "name": path.name,
                    "size": path.stat().st_size,
                    "modified": datetime.fromtimestamp(
                        path.stat().st_mtime, tz=timezone.utc
                    ).isoformat(),
                }
            )
    return records


def valid_file_signature(extension: str, head: bytes) -> bool:
    checks = {
        ".png": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": lambda data: data.startswith(b"\xff\xd8\xff"),
        ".jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
        ".gif": lambda data: data.startswith((b"GIF87a", b"GIF89a")),
        ".webp": lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
        ".mp4": lambda data: b"ftyp" in data[:32],
        ".webm": lambda data: data.startswith(b"\x1aE\xdf\xa3"),
        ".pdf": lambda data: data.startswith(b"%PDF-"),
    }
    check = checks.get(extension)
    return bool(check and check(head))


def safe_filename(filename: str) -> str:
    stem = Path(filename).stem
    extension = Path(filename).suffix.lower()
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "-", stem).strip("-_")[:80]
    if not cleaned:
        cleaned = "asset"
    return f"{cleaned}{extension}"


def git_command(*args: str, timeout: int = 60) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )


def git_status() -> str:
    result = git_command(
        "status", "--short", "--", "content", "projects.js", "assets"
    )
    return (result.stdout or result.stderr).strip()


def publish_changes(message: str) -> dict[str, object]:
    clean_message = re.sub(r"[\r\n]+", " ", message).strip()[:120]
    if not clean_message:
        clean_message = "Update portfolio content"

    staged = git_command("add", "-A", "--", "content", "projects.js", "assets")
    if staged.returncode:
        raise RuntimeError(staged.stderr.strip() or "Could not stage portfolio changes.")

    diff = git_command("diff", "--cached", "--quiet")
    if diff.returncode == 0:
        return {"published": False, "message": "There are no content changes to publish."}
    if diff.returncode not in (0, 1):
        raise RuntimeError(diff.stderr.strip() or "Could not inspect staged changes.")

    committed = git_command("commit", "-m", clean_message)
    if committed.returncode:
        raise RuntimeError(committed.stderr.strip() or "Could not create the update.")

    branch_result = git_command("branch", "--show-current")
    branch = branch_result.stdout.strip()
    if not branch:
        raise RuntimeError("The repository is not currently on a named branch.")

    pushed = git_command("push", "origin", branch, timeout=180)
    if pushed.returncode:
        raise RuntimeError(
            "The update was saved locally but could not be uploaded. "
            + (pushed.stderr.strip() or pushed.stdout.strip())
        )
    return {
        "published": True,
        "message": "Portfolio content was committed and uploaded successfully.",
        "branch": branch,
    }


class CreatorServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class CreatorHandler(SimpleHTTPRequestHandler):
    server_version = "PortfolioCreator/1.0"

    def log_message(self, format_string: str, *args: object) -> None:
        if self.path.startswith("/__creator/api/"):
            sys.stdout.write(
                f"[{self.log_date_time_string()}] {self.command} {self.path} "
                f"{format_string % args}\n"
            )

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        if self.path.startswith("/__creator"):
            self.send_header("Cache-Control", "no-store")
            self.send_header(
                "Content-Security-Policy",
                "default-src 'self'; img-src 'self' data: blob:; "
                "media-src 'self' blob:; style-src 'self'; script-src 'self'; "
                "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; "
                "form-action 'self'",
            )
        super().end_headers()

    def _host_is_local(self) -> bool:
        host = self.headers.get("Host", "")
        hostname = host.rsplit(":", 1)[0].strip("[]").lower()
        return hostname in {"127.0.0.1", "localhost"}

    def _origin_is_local(self) -> bool:
        origin = self.headers.get("Origin")
        if not origin:
            return True
        parsed = urlparse(origin)
        return (
            parsed.scheme == "http"
            and parsed.hostname in {"127.0.0.1", "localhost"}
            and parsed.port == PORT
        )

    def _json_response(self, status: int, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status: int, message: str) -> None:
        self._json_response(status, {"ok": False, "error": message})

    def _read_json_body(self, limit: int = MAX_JSON_BYTES) -> object:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Invalid request size.") from None
        if length <= 0 or length > limit:
            raise ValueError("Request size is invalid.")
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("Request contains invalid JSON.") from None

    def _session(self) -> tuple[str, dict[str, object]] | None:
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        morsel = cookie.get("creator_session")
        if not morsel:
            return None
        token = morsel.value
        with STATE_LOCK:
            record = SESSIONS.get(token)
            if not record:
                return None
            if float(record["expires"]) < time.time():
                SESSIONS.pop(token, None)
                return None
            record["expires"] = time.time() + SESSION_TTL_SECONDS
            return token, record

    def _require_session(self, *, csrf: bool = False) -> dict[str, object] | None:
        session = self._session()
        if not session:
            self._error(HTTPStatus.UNAUTHORIZED, "Creator session required.")
            return None
        record = session[1]
        if csrf and not hmac.compare_digest(
            self.headers.get("X-Creator-CSRF", ""), str(record["csrf"])
        ):
            self._error(HTTPStatus.FORBIDDEN, "Request verification failed.")
            return None
        return record

    def _serve_creator_asset(self, filename: str, content_type: str) -> None:
        target = CREATOR_DIR / filename
        if not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:  # noqa: N802
        if not self._host_is_local():
            self._error(HTTPStatus.FORBIDDEN, "Local access only.")
            return

        path = unquote(urlparse(self.path).path)
        if path in {"/__creator", "/__creator/"}:
            self._serve_creator_asset("dashboard.html", "text/html; charset=utf-8")
            return
        if path == "/__creator/dashboard.css":
            self._serve_creator_asset("dashboard.css", "text/css; charset=utf-8")
            return
        if path == "/__creator/dashboard.js":
            self._serve_creator_asset(
                "dashboard.js", "application/javascript; charset=utf-8"
            )
            return
        if path == "/__creator/api/session":
            session = self._session()
            self._json_response(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "authenticated": bool(session),
                    "csrf": session[1]["csrf"] if session else None,
                },
            )
            return
        if path == "/__creator/api/content":
            if not self._require_session():
                return
            self._json_response(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "site": read_json(SITE_FILE),
                    "projects": read_json(PROJECTS_FILE),
                    "media": list_media(),
                    "gitStatus": git_status(),
                },
            )
            return
        if path == "/__creator/api/backups":
            if not self._require_session():
                return
            backups = []
            if BACKUP_DIR.exists():
                backups = [
                    {
                        "name": item.name,
                        "size": item.stat().st_size,
                        "modified": datetime.fromtimestamp(
                            item.stat().st_mtime, tz=timezone.utc
                        ).isoformat(),
                    }
                    for item in sorted(
                        BACKUP_DIR.glob("*.json"),
                        key=lambda value: value.stat().st_mtime,
                        reverse=True,
                    )[:40]
                ]
            self._json_response(HTTPStatus.OK, {"ok": True, "backups": backups})
            return

        if path.startswith("/_creator"):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if not self._host_is_local() or not self._origin_is_local():
            self._error(HTTPStatus.FORBIDDEN, "Local access only.")
            return
        path = unquote(urlparse(self.path).path)
        try:
            if path == "/__creator/api/login":
                self._handle_login()
            elif path == "/__creator/api/logout":
                self._handle_logout()
            elif path == "/__creator/api/upload":
                self._handle_upload()
            elif path == "/__creator/api/publish":
                self._handle_publish()
            elif path == "/__creator/api/change-code":
                self._handle_change_code()
            elif path == "/__creator/api/restore":
                self._handle_restore()
            else:
                self._error(HTTPStatus.NOT_FOUND, "Unknown creator action.")
        except ValueError as error:
            self._error(HTTPStatus.BAD_REQUEST, str(error))
        except (OSError, RuntimeError, subprocess.SubprocessError) as error:
            self._error(HTTPStatus.INTERNAL_SERVER_ERROR, str(error))

    def do_PUT(self) -> None:  # noqa: N802
        if not self._host_is_local() or not self._origin_is_local():
            self._error(HTTPStatus.FORBIDDEN, "Local access only.")
            return
        if not self._require_session(csrf=True):
            return
        path = unquote(urlparse(self.path).path)
        try:
            payload = self._read_json_body()
            with STATE_LOCK:
                if path == "/__creator/api/site":
                    clean = validate_site(payload)
                    backup_file(SITE_FILE)
                    atomic_write(SITE_FILE, json_bytes(clean))
                elif path == "/__creator/api/projects":
                    clean = validate_projects(payload)
                    backup_file(PROJECTS_FILE)
                    atomic_write(PROJECTS_FILE, json_bytes(clean))
                    atomic_write(PROJECTS_SCRIPT, generate_projects_script(clean))
                else:
                    self._error(HTTPStatus.NOT_FOUND, "Unknown creator action.")
                    return
            self._json_response(
                HTTPStatus.OK,
                {"ok": True, "message": "Changes saved locally."},
            )
        except ValueError as error:
            self._error(HTTPStatus.BAD_REQUEST, str(error))
        except OSError as error:
            self._error(HTTPStatus.INTERNAL_SERVER_ERROR, str(error))

    def _handle_login(self) -> None:
        global FAILED_LOGINS
        payload = self._read_json_body(32 * 1024)
        if not isinstance(payload, dict):
            raise ValueError("Invalid login request.")
        code = str(payload.get("code", ""))
        now = time.time()
        with STATE_LOCK:
            FAILED_LOGINS = [stamp for stamp in FAILED_LOGINS if now - stamp < 300]
            if len(FAILED_LOGINS) >= 8:
                self._error(
                    HTTPStatus.TOO_MANY_REQUESTS,
                    "Too many attempts. Wait five minutes and try again.",
                )
                return
            if not verify_code(code):
                FAILED_LOGINS.append(now)
                time.sleep(0.35)
                self._error(HTTPStatus.UNAUTHORIZED, "Incorrect creator code.")
                return

            FAILED_LOGINS.clear()
            token = secrets.token_urlsafe(40)
            csrf = secrets.token_urlsafe(32)
            SESSIONS[token] = {
                "csrf": csrf,
                "expires": now + SESSION_TTL_SECONDS,
            }
        body = json.dumps({"ok": True, "authenticated": True, "csrf": csrf}).encode(
            "utf-8"
        )
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header(
            "Set-Cookie",
            f"creator_session={token}; Path=/__creator; HttpOnly; SameSite=Strict; "
            f"Max-Age={SESSION_TTL_SECONDS}",
        )
        self.end_headers()
        self.wfile.write(body)

    def _handle_logout(self) -> None:
        session = self._session()
        if session:
            with STATE_LOCK:
                SESSIONS.pop(session[0], None)
        body = b'{"ok":true}'
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header(
            "Set-Cookie",
            "creator_session=; Path=/__creator; HttpOnly; SameSite=Strict; Max-Age=0",
        )
        self.end_headers()
        self.wfile.write(body)

    def _handle_upload(self) -> None:
        if not self._require_session(csrf=True):
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("Invalid upload size.") from None
        if length <= 0 or length > MAX_UPLOAD_BYTES:
            raise ValueError("Uploads must be smaller than 100 MB.")
        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data"):
            raise ValueError("Use a file upload form.")

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
                "CONTENT_LENGTH": str(length),
            },
            keep_blank_values=False,
        )
        kind = form.getfirst("kind", "")
        file_item = form["file"] if "file" in form else None
        if kind not in ALLOWED_UPLOADS or file_item is None or not file_item.filename:
            raise ValueError("Choose a valid media type and file.")

        config = ALLOWED_UPLOADS[kind]
        filename = safe_filename(Path(file_item.filename).name)
        extension = Path(filename).suffix.lower()
        if extension not in config["extensions"]:
            raise ValueError(f"{extension or 'This file type'} is not allowed.")

        target_dir = config["directory"]
        if not isinstance(target_dir, Path):
            raise ValueError("Upload destination is invalid.")
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / filename
        if target.exists():
            target = target_dir / f"{Path(filename).stem}-{utc_stamp()[:15]}{extension}"

        head = file_item.file.read(64)
        if not valid_file_signature(extension, head):
            raise ValueError("The file contents do not match its extension.")

        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb", dir=str(target_dir), prefix=".upload-", suffix=".tmp", delete=False
            ) as handle:
                temp_path = Path(handle.name)
                handle.write(head)
                copied = len(head)
                while True:
                    chunk = file_item.file.read(1024 * 1024)
                    if not chunk:
                        break
                    copied += len(chunk)
                    if copied > MAX_UPLOAD_BYTES:
                        raise ValueError("The uploaded file is too large.")
                    handle.write(chunk)
            os.replace(temp_path, target)
        except Exception:
            if temp_path:
                temp_path.unlink(missing_ok=True)
            raise
        self._json_response(
            HTTPStatus.OK,
            {
                "ok": True,
                "message": "Media uploaded locally.",
                "media": {
                    "kind": kind,
                    "path": target.relative_to(ROOT).as_posix(),
                    "name": target.name,
                    "size": target.stat().st_size,
                },
            },
        )

    def _handle_publish(self) -> None:
        if not self._require_session(csrf=True):
            return
        payload = self._read_json_body(32 * 1024)
        if not isinstance(payload, dict):
            raise ValueError("Invalid publish request.")
        result = publish_changes(str(payload.get("message", "")))
        self._json_response(HTTPStatus.OK, {"ok": True, **result})

    def _handle_change_code(self) -> None:
        if not self._require_session(csrf=True):
            return
        payload = self._read_json_body(32 * 1024)
        if not isinstance(payload, dict):
            raise ValueError("Invalid security request.")
        current = str(payload.get("current", ""))
        new = str(payload.get("new", ""))
        if not verify_code(current):
            self._error(HTTPStatus.UNAUTHORIZED, "Current creator code is incorrect.")
            return
        change_code(new)
        with STATE_LOCK:
            SESSIONS.clear()
        self._json_response(
            HTTPStatus.OK,
            {
                "ok": True,
                "message": "Creator code changed. Sign in again with the new code.",
            },
        )

    def _handle_restore(self) -> None:
        if not self._require_session(csrf=True):
            return
        payload = self._read_json_body(32 * 1024)
        if not isinstance(payload, dict):
            raise ValueError("Invalid restore request.")
        name = Path(str(payload.get("name", ""))).name
        source = BACKUP_DIR / name
        if not source.is_file() or source.parent.resolve() != BACKUP_DIR.resolve():
            raise ValueError("Backup was not found.")

        if name.endswith("-site.json"):
            clean = validate_site(read_json(source))
            backup_file(SITE_FILE)
            atomic_write(SITE_FILE, json_bytes(clean))
        elif name.endswith("-projects.json"):
            clean = validate_projects(read_json(source))
            backup_file(PROJECTS_FILE)
            atomic_write(PROJECTS_FILE, json_bytes(clean))
            atomic_write(PROJECTS_SCRIPT, generate_projects_script(clean))
        else:
            raise ValueError("This backup type cannot be restored.")
        self._json_response(
            HTTPStatus.OK,
            {"ok": True, "message": "Backup restored locally."},
        )


def main() -> None:
    if "--help" in sys.argv:
        print("Run this file to open the loopback-only Creator Dashboard.")
        return
    ensure_secret()
    for config in ALLOWED_UPLOADS.values():
        directory = config["directory"]
        if isinstance(directory, Path):
            directory.mkdir(parents=True, exist_ok=True)
    handler = partial(CreatorHandler, directory=str(ROOT))
    server = CreatorServer((HOST, PORT), handler)
    url = f"http://localhost:{PORT}/"
    dashboard_url = f"http://localhost:{PORT}/__creator"
    print(f"Portfolio preview: {url}")
    print(f"Creator Dashboard: {dashboard_url}")
    print("This server only accepts connections from this computer.")
    if "--no-open" not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nCreator Dashboard stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
