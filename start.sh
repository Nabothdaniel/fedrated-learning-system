#!/bin/bash

echo "================================================"
echo "Starting Federated Learning Environment"
echo "================================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nShutting down services..."
    kill $CORE_PID $UI_PID 2>/dev/null
    exit
}

# Catch termination signals to properly kill background processes
trap cleanup SIGINT SIGTERM EXIT

# 1. Start the Core (FastAPI Backend)
echo "[1/2] Starting Core (FastAPI Backend)..."
if [ -f "$SCRIPT_DIR/backend/venv/bin/uvicorn" ]; then
    UVICORN_CMD="$SCRIPT_DIR/backend/venv/bin/uvicorn"
else
    UVICORN_CMD="uvicorn"
fi

cd "$SCRIPT_DIR/backend"
"$UVICORN_CMD" src.api:app --host 0.0.0.0 --port 8000 --reload &
CORE_PID=$!

# 2. Start the Dashboard UI (Next.js)
echo "[2/2] Starting Dashboard UI (Next.js)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
UI_PID=$!

echo "================================================"
echo "All services started! Press Ctrl+C to terminate."
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to terminate."
echo "================================================"

# Wait indefinitely for both processes
wait $CORE_PID $UI_PID

