#!/usr/bin/env bash
# 科研工作台：在 tmux 会话里常驻运行（关终端不掉）
# 用法：
#   ./scripts/wb-server.sh start    # 启动（已在跑则跳过）
#   ./scripts/wb-server.sh stop     # 停止
#   ./scripts/wb-server.sh restart  # 重启
#   ./scripts/wb-server.sh status   # 状态
#   ./scripts/wb-server.sh attach   # 进入日志窗口（Ctrl+b d 脱离）

set -euo pipefail

SESSION="${WB_TMUX_SESSION:-workbench}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${WB_PORT:-8787}"
CONDA_SH="${CONDA_SH:-$HOME/miniconda3/etc/profile.d/conda.sh}"
CONDA_ENV="${WB_CONDA_ENV:-phdbench}"

port_pids() {
  ss -lptn "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u || true
}

kill_port() {
  local pids
  pids="$(port_pids)"
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill ${pids} 2>/dev/null || true
    sleep 0.4
  fi
}

session_running() {
  tmux has-session -t "${SESSION}" 2>/dev/null
}

cmd_start() {
  if session_running; then
    echo "tmux 会话「${SESSION}」已在运行。"
    echo "打开：http://127.0.0.1:${PORT}"
    echo "看日志：./scripts/wb-server.sh attach"
    return 0
  fi

  if [[ ! -f "${CONDA_SH}" ]]; then
    echo "找不到 conda：${CONDA_SH}" >&2
    exit 1
  fi

  kill_port

  tmux new-session -d -s "${SESSION}" -c "${ROOT}" \
    "source '${CONDA_SH}' && conda activate '${CONDA_ENV}' && python run.py"

  # 等端口起来
  for _ in $(seq 1 30); do
    if curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; then
      echo "已在 tmux「${SESSION}」启动。"
      echo "打开：http://127.0.0.1:${PORT}"
      echo "看日志：./scripts/wb-server.sh attach  （Ctrl+b 再按 d 脱离）"
      echo "停止：  ./scripts/wb-server.sh stop"
      return 0
    fi
    sleep 0.3
  done

  echo "已创建会话，但端口 ${PORT} 尚未响应，请执行：./scripts/wb-server.sh attach" >&2
  return 1
}

cmd_stop() {
  kill_port
  if session_running; then
    tmux kill-session -t "${SESSION}"
    echo "已停止 tmux「${SESSION}」。"
  else
    echo "会话未运行（端口进程已清理）。"
  fi
}

cmd_restart() {
  cmd_stop || true
  sleep 0.3
  cmd_start
}

cmd_status() {
  local pids
  pids="$(port_pids)"
  if session_running; then
    echo "tmux：运行中（${SESSION}）"
  else
    echo "tmux：未运行"
  fi
  if [[ -n "${pids}" ]]; then
    echo "端口 ${PORT}：占用 pid ${pids}"
    if curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; then
      echo "HTTP：OK  http://127.0.0.1:${PORT}"
    else
      echo "HTTP：无响应"
    fi
  else
    echo "端口 ${PORT}：空闲"
  fi
}

cmd_attach() {
  if ! session_running; then
    echo "会话未运行，先执行：./scripts/wb-server.sh start" >&2
    exit 1
  fi
  exec tmux attach -t "${SESSION}"
}

case "${1:-start}" in
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_restart ;;
  status) cmd_status ;;
  attach|logs) cmd_attach ;;
  *)
    echo "用法: $0 {start|stop|restart|status|attach}" >&2
    exit 2
    ;;
esac
