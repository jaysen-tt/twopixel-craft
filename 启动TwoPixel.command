#!/bin/zsh
PROJECT_DIR="/Users/jaysen/Desktop/cb/twopixel-craft"
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
cd "$PROJECT_DIR" || exit 1
export ELECTRON_DISABLE_SANDBOX=1
clear
echo "正在启动 TwoPixel..."
echo
bun run electron:dev
STATUS=$?
echo
echo "TwoPixel 已退出，状态码: $STATUS"
read "?按回车关闭窗口..."
exit $STATUS
