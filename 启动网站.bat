@echo off
chcp 65001 >nul
title 致 鸥黑米 · 生日快乐
cd /d "%~dp0"

echo.
echo   =========================================
echo    致 鸥黑米 · 生日快乐
echo    正在本地打开这份心意...
echo   =========================================
echo.
echo   浏览器关闭后，直接关掉这个黑窗口即可。
echo.

start "" "http://127.0.0.1:8765/"
python -m http.server 8765 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo   [!] 没找到 python，改用 py 启动...
  start "" "http://127.0.0.1:8765/"
  py -m http.server 8765 --bind 127.0.0.1
)
pause
