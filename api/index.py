import sys
import os

# Add backend folder to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "/backend"))

# pyrefly: ignore [missing-import]
from app.main import app