#!/usr/bin/env python3
"""
EcoSort AI - Live Recycling Hackathon Demo Script
Connects Python test feeds directly into the running full-stack EcoSort AI web app.
Simulates real scans, tests 4 streams, and verifies closed-loop confirmations.
"""

import sys
import time
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3000/api"

TEST_CASES = [
    {
        "name": "Sparkling Water Bottle",
        "hint": "Clear PET plastic water bottle 500ml",
        "demoUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
        "expected_bin": "blue",
        "confirm_bin": "blue"
    },
    {
        "name": "Organic Banana Peel",
        "hint": "Yellow organic banana peel fruit scrap",
        "demoUrl": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80",
        "expected_bin": "brown",
        "confirm_bin": "brown"
    },
    {
        "name": "Discarded Phone Battery",
        "hint": "Lithium-ion mobile phone battery e-waste",
        "demoUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
        "expected_bin": "red",
        "confirm_bin": "red"
    },
    {
        "name": "Reusable Coffee Tumbler",
        "hint": "Stainless steel travel mug reusable",
        "demoUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        "expected_bin": "green",
        "confirm_bin": "green"
    },
    {
        "name": "Greasy Pizza Box (Mismatch Test)",
        "hint": "Greasy cheese cardboard pizza box",
        "demoUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
        "expected_bin": "brown",
        "confirm_bin": "blue" # Simulates mismatch!
    }
]

def make_request(endpoint: str, data: dict = None):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if data:
        encoded = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=encoded, headers=headers, method='POST')
    else:
        req = urllib.request.Request(url, headers=headers, method='GET')

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"[Error] Failed to connect to {url}: {e}")
        return None

def run_demo():
    print("==========================================================")
    print("      EcoSort AI - Python Vision Pipeline Integration     ")
    print("==========================================================")
    print("Checking backend status at http://localhost:3000...")
    
    health = make_request("health")
    if not health:
        print("[FAIL] Backend server not reachable at http://localhost:3000.")
        print("Ensure the EcoSort web server is running ('npm run dev')!")
        return

    print(f"[OK] Backend active: {health}")
    print("\nStarting simulated test item stream:\n")

    for idx, test in enumerate(TEST_CASES, 1):
        print(f"[{idx}/{len(TEST_CASES)}] Scanning: {test['name']}")
        
        # 1. Analyze scan
        scan_payload = {
            "hintText": test["hint"],
            "demoImageUrl": test["demoUrl"],
            "station": "Python Vision Test Runner (Station A)"
        }
        res = make_request("scan/analyze", scan_payload)
        if not res or not res.get("item"):
            print("  -> Failed to analyze item.")
            continue

        item = res["item"]
        item_id = item["id"]
        category = item["category"]
        bin_color = item["binColor"]

        print(f"  -> Vision AI Result: {category.upper()} -> {bin_color.upper()} Bin ({int(item['confidence']*100)}% conf)")
        print(f"     Material: {item['material']}")
        print(f"     Guidance: {item['recyclingInstructions']}")

        # 2. Confirm bin deposit
        time.sleep(0.5)
        conf_res = make_request(f"scans/{item_id}/confirm", {"confirmedBin": test["confirm_bin"]})
        if conf_res:
            if conf_res.get("isMatch"):
                print(f"  -> Match Confirmed! +{conf_res['creditsAwarded']} Eco-Credits credited to user.")
            else:
                print(f"  -> Mismatch detected! (User selected {test['confirm_bin'].upper()}, expected {bin_color.upper()}). Marked for volunteer audit!")
        
        print("")
        time.sleep(0.5)

    print("==========================================================")
    print("Demo completed! View real-time results in your browser at:")
    print("http://localhost:3000")
    print("==========================================================")

if __name__ == '__main__':
    run_demo()
