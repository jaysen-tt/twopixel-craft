#!/bin/zsh
PROJECT_DIR="/Users/jaysen/Desktop/cb/twopixel-craft"
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
clear
echo "正在关闭旧的 TwoPixel 开发进程..."
pkill -f "bun run scripts/electron-dev.ts" 2>/dev/null || true
pkill -f "$PROJECT_DIR/scripts/electron-dev.ts" 2>/dev/null || true
pkill -f "vite.*apps/electron/vite.config.ts" 2>/dev/null || true
pkill -f "electron .*apps/electron" 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2
cd "$PROJECT_DIR" || exit 1
export ELECTRON_DISABLE_SANDBOX=1
echo
echo "正在重新启动 TwoPixel..."
echo
bun run electron:dev
STATUS=$?
echo
echo "TwoPixel 已退出，状态码: $STATUS"
read "?按回车关闭窗口..."
exit $STATUS
