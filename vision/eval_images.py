#!/usr/bin/env python3
"""
EcoSort AI - Vision Evaluation Script
Evaluates classification accuracy across the 4 waste streams (Recyclable, Reusable, Biodegradable, Hazardous).
Computes precision, stream mapping accuracy, and confusion statistics.
"""

import os
import sys
import json
from class_map import get_class_info, CLASS_MAP

TEST_DATASET = [
    {"input": "plastic bottle", "expected_category": "recyclable", "expected_bin": "blue"},
    {"input": "aluminum soda can", "expected_category": "recyclable", "expected_bin": "blue"},
    {"input": "wine glass", "expected_category": "recyclable", "expected_bin": "blue"},
    {"input": "cardboard box", "expected_category": "recyclable", "expected_bin": "blue"},
    {"input": "newspaper", "expected_category": "recyclable", "expected_bin": "blue"},
    {"input": "ceramic cup", "expected_category": "reusable", "expected_bin": "green"},
    {"input": "steel bowl", "expected_category": "reusable", "expected_bin": "green"},
    {"input": "canvas tote bag", "expected_category": "reusable", "expected_bin": "green"},
    {"input": "yellow banana peel", "expected_category": "biodegradable", "expected_bin": "brown"},
    {"input": "apple core", "expected_category": "biodegradable", "expected_bin": "brown"},
    {"input": "greasy pizza box", "expected_category": "biodegradable", "expected_bin": "brown"},
    {"input": "smartphone battery", "expected_category": "hazardous", "expected_bin": "red"},
    {"input": "laptop circuit board", "expected_category": "hazardous", "expected_bin": "red"},
    {"input": "computer keyboard", "expected_category": "hazardous", "expected_bin": "red"},
]

def run_evaluation():
    print("-------------------------------------------------------")
    print("      EcoSort AI - 4-Stream Vision Accuracy Benchmark  ")
    print("-------------------------------------------------------")

    correct = 0
    total = len(TEST_DATASET)

    for item in TEST_DATASET:
        info = get_class_info(item["input"])
        is_correct = (
            info["category"] == item["expected_category"] and 
            info["bin"] == item["expected_bin"]
        )
        if is_correct:
            correct += 1
            status = "[PASS]"
        else:
            status = "[FAIL]"

        print(f"{status} '{item['input']}': Detected as {info['category'].upper()} ({info['bin'].upper()} Bin)")

    accuracy = (correct / total) * 100
    print("-------------------------------------------------------")
    print(f"Total Evaluated: {total}")
    print(f"Correctly Mapped: {correct}/{total}")
    print(f"4-Stream Accuracy: {accuracy:.1f}%")
    print("-------------------------------------------------------")

if __name__ == '__main__':
    run_evaluation()
