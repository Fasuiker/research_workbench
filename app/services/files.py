from __future__ import annotations

import hashlib
import base64
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

from sqlalchemy.orm import Session

from app.models import Paper

# Windows drive path: D:\foo or D:/foo — not absolute on Linux/WSL.
_WIN_DRIVE_RE = re.compile(r"^([A-Za-z]):([\\/].*)$")


def to_native_path(path: str) -> str:
    """Map Windows paths to the host filesystem when running under WSL/Linux."""
    path = (path or "").strip().strip('"').strip("'")
    if not path:
        return ""
    m = _WIN_DRIVE_RE.match(path)
    if m and os.name != "nt":
        drive = m.group(1).lower()
        rest = m.group(2).replace("\\", "/")
        # Prefer WSL mount; fall back to /d/... style if present.
        for candidate in (f"/mnt/{drive}{rest}", f"/{drive}{rest}"):
            if Path(candidate).exists():
                return candidate
        return f"/mnt/{drive}{rest}"
    return path


def normalize_path(path: str) -> str:
    if not path:
        return ""
    native = to_native_path(path)
    return str(Path(native).expanduser().resolve())


def path_key(path: str) -> str:
    """Fast, filesystem-free key for comparing already-known local paths."""
    raw = (path or "").strip().strip('"').strip("'")
    m = _WIN_DRIVE_RE.match(raw)
    if m and os.name != "nt":
        raw = f"/mnt/{m.group(1).lower()}{m.group(2).replace(chr(92), '/')}"
    return os.path.normcase(os.path.normpath(raw))


def resolve_under_root(root: str, path: str) -> Path:
    """Resolve path and ensure it stays inside watch-folder root."""
    root_path = Path(normalize_path(root)).resolve()
    target = Path(normalize_path(path)).resolve()
    if root_path not in target.parents and target != root_path:
        raise PermissionError("路径不在监视目录内")
    return target


def file_meta(path: str) -> dict:
    p = Path(path)
    if not p.is_file():
        return {"file_size": None, "file_mtime": None, "file_hash": "", "exists": False}
    h = hashlib.sha1()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
            if f.tell() > 32 * 1024 * 1024:
                break
    st = p.stat()
    return {
        "file_size": st.st_size,
        "file_mtime": st.st_mtime,
        "file_hash": h.hexdigest(),
        "exists": True,
    }


def title_from_filename(path: str) -> str:
    name = Path(path).stem
    return name.replace("_", " ").replace("-", " ").strip() or "Untitled"


def list_pdfs(root: str, sub: str = "", max_depth: int = 4) -> list[dict]:
    root_path = Path(normalize_path(root))
    if not root_path.is_dir():
        raise FileNotFoundError(f"目录不存在: {root}")
    base = root_path / sub if sub else root_path
    base = base.resolve()
    if root_path not in base.parents and base != root_path:
        raise PermissionError("越界访问")
    items: list[dict] = []
    try:
        entries = sorted(base.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        return items
    for entry in entries:
        if entry.name.startswith("."):
            continue
        if entry.is_dir():
            rel = str(entry.relative_to(root_path)).replace("\\", "/")
            depth = 0 if not sub else sub.count("/") + 1
            items.append(
                {
                    "name": entry.name,
                    "path": str(entry),
                    "rel": rel,
                    "is_dir": True,
                    "size": None,
                    "mtime": entry.stat().st_mtime,
                }
            )
        elif entry.suffix.lower() == ".pdf":
            st = entry.stat()
            items.append(
                {
                    "name": entry.name,
                    "path": str(entry),
                    "rel": str(entry.relative_to(root_path)).replace("\\", "/"),
                    "is_dir": False,
                    "size": st.st_size,
                    "mtime": st.st_mtime,
                }
            )
    _ = max_depth  # reserved for recursive mode
    return items


def path_imported_map(db: Session, paths: Iterable[str]) -> dict[str, int]:
    wanted = {path_key(p): p for p in paths if p}
    if not wanted:
        return {}
    papers = db.query(Paper).filter(Paper.local_path != "").all()
    out: dict[str, int] = {}
    by_key = {path_key(p.local_path): p.id for p in papers if p.local_path}
    for normalized, original in wanted.items():
        if normalized in by_key:
            out[original] = by_key[normalized]
            out[normalized] = by_key[normalized]
    return out


def safe_under_roots(path: str, roots: list[str]) -> bool:
    target = Path(normalize_path(path))
    if not target.exists():
        return False
    for root in roots:
        try:
            root_p = Path(normalize_path(root))
            if target == root_p or root_p in target.parents:
                return True
        except Exception:
            continue
    # allow any existing local pdf for personal use
    return target.suffix.lower() == ".pdf" and target.is_file()


def open_in_os(path: str) -> None:
    path = normalize_path(path)
    if os.name == "nt":
        os.startfile(path)  # type: ignore[attr-defined]
    else:
        subprocess.Popen(["open" if sys.platform == "darwin" else "xdg-open", path])


def reveal_in_os(path: str) -> None:
    """Open the containing folder and select the file when the host supports it."""
    target = Path(normalize_path(path))
    if not target.is_file():
        raise FileNotFoundError(str(target))
    if os.name == "nt":
        subprocess.Popen(["explorer.exe", f"/select,{target}"])
        return
    if sys.platform == "darwin":
        subprocess.Popen(["open", "-R", str(target)])
        return
    # The workbench commonly runs inside WSL while files live on Windows.
    if shutil.which("explorer.exe") and shutil.which("wslpath"):
        windows_path = subprocess.check_output(["wslpath", "-w", str(target)], text=True).strip()
        windows_parent = subprocess.check_output(["wslpath", "-w", str(target.parent)], text=True).strip()
        helper = Path(__file__).resolve().parents[2] / "scripts" / "wb-file-reveal.exe"
        if helper.is_file():
            subprocess.Popen(
                [str(helper), windows_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return
        powershell = shutil.which("powershell.exe")
        if powershell:
            target_ps = windows_path.replace("'", "''")
            parent_ps = windows_parent.replace("'", "''")
            script = f"""
$target = '{target_ps}'
$parent = '{parent_ps}'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class WbWindow {{
  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  public static extern int SHParseDisplayName(string name, IntPtr bindingContext, out IntPtr pidl, uint attributes, out uint attributesOut);
  [DllImport("shell32.dll")]
  public static extern IntPtr ILFindLastID(IntPtr pidl);
  [DllImport("shell32.dll")]
  public static extern int SHOpenFolderAndSelectItems(IntPtr folderPidl, uint itemCount, IntPtr[] itemPidls, uint flags);
  [DllImport("ole32.dll")]
  public static extern void CoTaskMemFree(IntPtr ptr);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}}
'@
$folderPidl = [IntPtr]::Zero
$itemPidl = [IntPtr]::Zero
$attrs = [uint32]0
try {{
  $folderResult = [WbWindow]::SHParseDisplayName($parent, [IntPtr]::Zero, [ref]$folderPidl, 0, [ref]$attrs)
  $itemResult = [WbWindow]::SHParseDisplayName($target, [IntPtr]::Zero, [ref]$itemPidl, 0, [ref]$attrs)
  if ($folderResult -eq 0 -and $itemResult -eq 0) {{
    $childPidl = [WbWindow]::ILFindLastID($itemPidl)
    $children = New-Object 'IntPtr[]' 1
    $children[0] = $childPidl
    [WbWindow]::SHOpenFolderAndSelectItems($folderPidl, 1, $children, 0) | Out-Null
  }}
}} finally {{
  if ($folderPidl -ne [IntPtr]::Zero) {{ [WbWindow]::CoTaskMemFree($folderPidl) }}
  if ($itemPidl -ne [IntPtr]::Zero) {{ [WbWindow]::CoTaskMemFree($itemPidl) }}
}}
Start-Sleep -Milliseconds 650
$shell = New-Object -ComObject Shell.Application
$window = @($shell.Windows()) | Where-Object {{
  try {{ $_.Document.Folder.Self.Path -eq $parent }} catch {{ $false }}
}} | Select-Object -Last 1
if ($window) {{
  [WbWindow]::ShowWindowAsync([IntPtr]$window.HWND, 9) | Out-Null
  [WbWindow]::SetForegroundWindow([IntPtr]$window.HWND) | Out-Null
}}
"""
            encoded = base64.b64encode(script.encode("utf-16le")).decode("ascii")
            subprocess.Popen(
                [powershell, "-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return
        explorer = shutil.which("explorer.exe") or "/mnt/c/Windows/explorer.exe"
        subprocess.Popen([explorer, f"/select,{windows_path}"])
        return
    subprocess.Popen(["xdg-open", str(target.parent)])
