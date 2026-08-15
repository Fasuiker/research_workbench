"""Native Windows launcher for the packaged Research Workbench app."""

from __future__ import annotations

import os
from pathlib import Path
import socket
import subprocess
import sys
import threading
import time


SERVER_FLAG = "--workbench-server"
RESTART_EXIT_CODE = 75


def configure_windows_app_identity() -> None:
    """Give the native window and shortcuts one stable Windows identity."""
    if os.name != "nt":
        return

    from ctypes import windll

    windll.shell32.SetCurrentProcessExplicitAppUserModelID(
        "Fasuiker.ResearchWorkbench"
    )


def available_port(preferred: int = 8787) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        try:
            probe.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            probe.bind(("127.0.0.1", 0))
            return int(probe.getsockname()[1])


def wait_until_ready(port: int, timeout: float = 20.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
            client.settimeout(0.25)
            if client.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.08)
    raise RuntimeError("科研工作台本地服务启动超时")


def run_server(port: int) -> None:
    # Importing the application opens the active data space. Keep that work in
    # the server child so the native window can survive a data-space restart.
    import uvicorn

    from app.main import app

    # Windowed PyInstaller executables do not have sys.stderr. Disabling
    # uvicorn's console formatter also keeps backend restarts silent.
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        log_config=None,
        access_log=False,
    )


def server_command(port: int) -> list[str]:
    if getattr(sys, "frozen", False):
        return [sys.executable, SERVER_FLAG, str(port)]
    return [sys.executable, str(Path(__file__).resolve()), SERVER_FLAG, str(port)]


class ServerSupervisor:
    def __init__(self, port: int) -> None:
        self.port = port
        self.stopping = threading.Event()
        self._lock = threading.Lock()
        self._process: subprocess.Popen | None = None
        self._monitor: threading.Thread | None = None

    def _spawn(self) -> subprocess.Popen:
        env = os.environ.copy()
        env["WORKBENCH_DESKTOP_SERVER"] = "1"
        kwargs: dict = {"env": env}
        if os.name == "nt":
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        return subprocess.Popen(server_command(self.port), **kwargs)

    def start(self) -> None:
        with self._lock:
            self._process = self._spawn()
        wait_until_ready(self.port)
        self._monitor = threading.Thread(
            target=self._monitor_loop,
            name="research-workbench-supervisor",
            daemon=True,
        )
        self._monitor.start()

    def _monitor_loop(self) -> None:
        while not self.stopping.is_set():
            with self._lock:
                process = self._process
            if process is None:
                return
            exit_code = process.wait()
            if self.stopping.is_set() or exit_code != RESTART_EXIT_CODE:
                return
            time.sleep(0.08)
            with self._lock:
                if self.stopping.is_set():
                    return
                self._process = self._spawn()

    def stop(self) -> None:
        self.stopping.set()
        with self._lock:
            process = self._process
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
        if self._monitor is not None:
            self._monitor.join(timeout=3)


def main() -> None:
    configure_windows_app_identity()

    import webview

    port = available_port()
    supervisor = ServerSupervisor(port)
    supervisor.start()
    try:
        webview.create_window(
            "科研工作台",
            f"http://127.0.0.1:{port}/",
            width=1440,
            height=920,
            min_size=(1040, 680),
            background_color="#e9efed",
        )
        webview.start()
    finally:
        supervisor.stop()


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == SERVER_FLAG:
        run_server(int(sys.argv[2]))
    else:
        main()
