#!/usr/bin/env python3
"""
EcoSort AI - Standalone OpenCV Camera App
Captures webcam stream, runs waste classification, overlays 4-stream color-coded bounding boxes,
and pushes scans live to the web application backend (http://localhost:3000/api/scan/analyze).
"""

import sys
import os
import time
import json
import base64

try:
    import cv2
    HAVE_CV2 = True
except ImportError:
    HAVE_CV2 = False

try:
    import requests
    HAVE_REQUESTS = True
except ImportError:
    HAVE_REQUESTS = False

from class_map import get_class_info, BIN_BLUE, BIN_GREEN, BIN_BROWN, BIN_RED

API_URL = os.environ.get('ECOSORT_API_URL', 'http://localhost:3000/api/scan/analyze')

# BGR Color tuples for OpenCV overlay
CV_COLORS = {
    'blue': (235, 99, 37),      # BGR for blue (#2563EB)
    'green': (129, 185, 16),    # BGR for emerald green (#10B981)
    'brown': (11, 158, 245),    # BGR for amber/brown (#F59E0B)
    'red': (68, 68, 239),       # BGR for alert red (#EF4444)
    'slate': (138, 116, 100)    # BGR for slate
}

def main():
    if not HAVE_CV2:
        print("[EcoSort Vision] opencv-python is not installed. To run the desktop camera app, run: pip install -r requirements.txt", file=sys.stderr)
        print("[EcoSort Vision] Note: You can use the WebRTC in-browser camera directly in the web app UI at http://localhost:3000!", file=sys.stderr)
        sys.exit(1)

    print("==================================================")
    print("   EcoSort AI - Desktop Camera Vision Stream      ")
    print("==================================================")
    print("Controls:")
    print("  's' - Send current scan to EcoSort Web App")
    print("  'q' - Quit camera stream")
    print(f"Target Backend: {API_URL}")
    print("--------------------------------------------------")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[Error] Could not open webcam device (index 0).", file=sys.stderr)
        sys.exit(1)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w, _ = frame.shape

        # Simulated center target region for demo
        x1, y1 = int(w * 0.2), int(h * 0.2)
        x2, y2 = int(w * 0.8), int(h * 0.8)

        # Draw scanning crosshair box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 128), 2)
        cv2.putText(frame, "EcoSort Vision Engine - Press [S] to Scan", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 128), 2)

        cv2.imshow("EcoSort AI - Smart Waste Camera", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break
        elif key == ord('s'):
            print("\n[+] Capturing frame and dispatching to EcoSort AI backend...")
            _, buffer = cv2.imencode('.jpg', frame)
            b64_image = base64.b64encode(buffer).decode('utf-8')

            if HAVE_REQUESTS:
                try:
                    payload = {
                        'imageBase64': f"data:image/jpeg;base64,{b64_image}",
                        'mimeType': 'image/jpeg',
                        'station': 'Local Desktop Edge Camera (Python OpenCV)'
                    }
                    res = requests.post(API_URL, json=payload, timeout=8)
                    if res.status_code == 200:
                        data = res.json()
                        item = data.get('item', {})
                        print(f"[SUCCESS] Classified as: {item.get('name')}")
                        print(f"          Category: {item.get('category').upper()} -> Place in {item.get('binColor').upper()} BIN")
                        print(f"          Credits Available: {item.get('suggestedPoints')} pts")
                    else:
                        print(f"[Error] Backend returned {res.status_code}: {res.text}")
                except Exception as ex:
                    print(f"[Error] Failed to connect to {API_URL}: {ex}")
            else:
                print("[Notice] Python requests package not installed. Send via browser UI.")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
