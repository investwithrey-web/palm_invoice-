#!/usr/bin/env bash
# Palm Resort - Invoice Builder Launcher for macOS

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🌴 Palm Resort - Smart Invoice Builder & Billing System"
echo "=========================================================="
echo "Starting local server on http://localhost:3000..."

# Start node server
node local-server.js &
SERVER_PID=$!

sleep 1

# Open in default macOS browser
if command -v open >/dev/null 2>&1; then
  open "http://localhost:3000"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:3000"
fi

echo "App running at:"
echo "💻 Mac Browser:   http://localhost:3000"
echo "📱 Mobile/Phone:  http://192.168.29.99:3000 (connected to same Wi-Fi)"
echo "Press Ctrl+C to stop the server."

wait $SERVER_PID
