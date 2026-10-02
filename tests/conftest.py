import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tests_dir = os.path.dirname(os.path.abspath(__file__))

# Ensure tests dir doesn't shadow root packages
if tests_dir in sys.path:
    sys.path.remove(tests_dir)

while BASE_DIR in sys.path:
    sys.path.remove(BASE_DIR)
sys.path.insert(0, BASE_DIR)
