# Functions that agents can call (CV inference, Weather API, Search, etc.)

import os
import json
import torch
from PIL import Image
from torchvision import transforms

from src.vision.model import CropDiseaseClassifier

# ---------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------

_current_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.abspath(os.path.join(_current_dir, "..", ".."))

# Load class index mapping
_class_index_path = os.path.join(_project_root, "class_index.json")

# Fallback to notebooks/ if not in root
if not os.path.exists(_class_index_path):
    _class_index_path = os.path.join(_project_root, "notebooks", "class_index.json")

with open(_class_index_path, "r") as f:
    CLASS_IDX = json.load(f)

IDX_CLASS = {v: k for k, v in CLASS_IDX.items()}

# ---------------------------------------------------------------------
# Device
# ---------------------------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------------------------------------------------------------
# Model loading (SAFE – will NOT crash app if model missing)
# ---------------------------------------------------------------------

NUM_CLASSES = len(CLASS_IDX)
MODEL_PATH = os.path.join(_project_root, "best_model_mobilenet.pt")

model = None

if os.path.exists(MODEL_PATH):
    try:
        model = CropDiseaseClassifier(NUM_CLASSES).to(DEVICE)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.eval()
        print(f"[INFO] Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        model = None
else:
    print(
        f"[WARNING] Model file not found at {MODEL_PATH}. "
        "Application will run, but predictions are disabled."
    )

# ---------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------

IMG_SIZE = 128

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# ---------------------------------------------------------------------
# Prediction function
# ---------------------------------------------------------------------

def predict_disease(image_path: str):
    """
    Predict crop disease from an image.

    Raises:
        RuntimeError: If ML model is not loaded.
    """

    if model is None:
        raise RuntimeError(
            "ML model is not loaded. Prediction is currently unavailable."
        )

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    return IDX_CLASS[pred.item()], conf.item()
