#!/bin/zsh
PROJECT_DIR="/Users/jaysen/Desktop/cb/twopixel-craft"
clear
echo "正在停止 TwoPixel 开发进程..."
pkill -f "bun run scripts/electron-dev.ts" 2>/dev/null || true
pkill -f "$PROJECT_DIR/scripts/electron-dev.ts" 2>/dev/null || true
pkill -f "vite.*apps/electron/vite.config.ts" 2>/dev/null || true
pkill -f "electron .*apps/electron" 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
echo
echo "停止命令已执行。"
read "?按回车关闭窗口..."
