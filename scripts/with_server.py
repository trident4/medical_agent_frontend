#!/usr/bin/env python3
"""
Server lifecycle management script for running Playwright tests.
Starts the Next.js dev server, waits for it to be ready, runs the test command,
then gracefully shuts down the server.

Based on SKILLS.md patterns.

Usage:
    python scripts/with_server.py --server "npm run dev" --port 3000 -- pytest tests/ -v
    
Multiple servers:
    python scripts/with_server.py \
        --server "cd backend && python server.py" --port 8000 \
        --server "npm run dev" --port 3000 \
        -- pytest tests/ -v
"""

import argparse
import subprocess
import sys
import time
import socket
import signal
import os
from typing import List, Tuple


def wait_for_port(port: int, host: str = "localhost", timeout: float = 60.0) -> bool:
    """Wait for a port to become available."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except (ConnectionRefusedError, socket.timeout, OSError):
            time.sleep(0.5)
    return False


def start_server(command: str, cwd: str = None) -> subprocess.Popen:
    """Start a server process."""
    env = os.environ.copy()
    env["BROWSER"] = "none"  # Prevent browser auto-open

    return subprocess.Popen(
        command,
        shell=True,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        preexec_fn=os.setsid if os.name != "nt" else None,
    )


def stop_server(process: subprocess.Popen):
    """Stop a server process gracefully."""
    if process.poll() is None:  # Still running
        if os.name != "nt":
            # Send SIGTERM to process group
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        else:
            process.terminate()

        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if os.name != "nt":
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
            else:
                process.kill()


def parse_args() -> Tuple[List[Tuple[str, int]], List[str]]:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Manage server lifecycle for running Playwright tests"
    )
    parser.add_argument(
        "--server",
        "-s",
        action="append",
        dest="servers",
        default=[],
        help="Server command to run (can be specified multiple times)",
    )
    parser.add_argument(
        "--port",
        "-p",
        action="append",
        dest="ports",
        type=int,
        default=[],
        help="Port to wait for (must match number of --server args)",
    )
    parser.add_argument(
        "--timeout",
        "-t",
        type=float,
        default=60.0,
        help="Timeout in seconds to wait for each server (default: 60)",
    )

    # Parse known args, rest goes to test command
    args, remaining = parser.parse_known_args()

    # Remove leading '--' if present
    if remaining and remaining[0] == "--":
        remaining = remaining[1:]

    # Validate
    if len(args.servers) != len(args.ports):
        parser.error("Number of --server and --port arguments must match")

    server_configs = list(zip(args.servers, args.ports))

    return server_configs, remaining, args.timeout


def main():
    server_configs, test_command, timeout = parse_args()

    if not test_command:
        print("Error: No test command provided after '--'")
        print(
            "Usage: python scripts/with_server.py --server 'npm run dev' --port 3000 -- pytest tests/ -v"
        )
        sys.exit(1)

    processes = []

    try:
        # Start all servers
        for cmd, port in server_configs:
            print(f"Starting server: {cmd}")
            proc = start_server(cmd)
            processes.append(proc)

            print(f"Waiting for port {port}...")
            if not wait_for_port(port, timeout=timeout):
                print(f"Error: Server did not start on port {port} within {timeout}s")
                sys.exit(1)
            print(f"Server ready on port {port}")

        # Run test command
        print(f"\nRunning: {' '.join(test_command)}")
        result = subprocess.run(test_command)
        sys.exit(result.returncode)

    except KeyboardInterrupt:
        print("\nInterrupted, shutting down...")
    finally:
        # Stop all servers
        for proc in reversed(processes):
            print("Stopping server...")
            stop_server(proc)
        print("All servers stopped")


if __name__ == "__main__":
    main()
