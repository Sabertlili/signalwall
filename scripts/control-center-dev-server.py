from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import re
import sys
import time


REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = REPO_ROOT / "src" / "SignalWall" / "web"
CONFIG_PATH = WEB_ROOT / "quote-signal-config.js"
CONFIG_PATTERN = re.compile(
    r"window\.QUOTE_SIGNAL_CONFIG\s*=\s*(\{[\s\S]*\})\s*;?\s*$"
)


def read_config():
    source = CONFIG_PATH.read_text(encoding="utf-8-sig")
    match = CONFIG_PATTERN.search(source)
    if not match:
        raise RuntimeError("quote-signal-config.js is invalid")
    return json.loads(match.group(1))


def write_config(config):
    CONFIG_PATH.write_text(
        "window.QUOTE_SIGNAL_CONFIG = "
        + json.dumps(config, indent=2)
        + ";\n",
        encoding="utf-8",
    )


def send_json(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def send_file(handler, path, content_type):
    if not path.exists():
        handler.send_error(404)
        return
    body = path.read_bytes()
    handler.send_response(200)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        return

    def do_GET(self):
        path = urlparse(self.path).path
        files = {
            "/": ("control-center.html", "text/html; charset=utf-8"),
            "/control-center.css": ("control-center.css", "text/css; charset=utf-8"),
            "/control-center.js": ("control-center.js", "text/javascript; charset=utf-8"),
            "/wallpaper": ("index.html", "text/html; charset=utf-8"),
            "/quote-signal-config.js": (
                "quote-signal-config.js",
                "text/javascript; charset=utf-8",
            ),
        }
        if path in files:
            filename, content_type = files[path]
            send_file(self, WEB_ROOT / filename, content_type)
            return
        if path == "/api/state":
            send_json(
                self,
                200,
                {
                    "config": read_config(),
                    "screens": [
                        {
                            "index": 2,
                            "name": "Left display",
                            "primary": False,
                            "bounds": "-1920,0,1920,1080",
                        },
                        {
                            "index": 3,
                            "name": "Center display",
                            "primary": True,
                            "bounds": "0,0,1920,1080",
                        },
                        {
                            "index": 1,
                            "name": "Right display",
                            "primary": False,
                            "bounds": "1920,0,1920,1080",
                        },
                    ],
                },
            )
            return
        self.send_error(404)

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length) or b"{}")
        if path == "/api/save":
            config = payload.get("config")
            if not isinstance(config, dict):
                send_json(self, 400, {"error": "Missing configuration"})
                return
            write_config(config)
            send_json(self, 200, {"ok": True, "savedAt": time.strftime("%H:%M:%S")})
            return
        if path == "/api/reload":
            send_json(self, 200, {"ok": True, "reloadedAt": time.strftime("%H:%M:%S")})
            return
        self.send_error(404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 48730
    print(f"http://127.0.0.1:{port}/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
