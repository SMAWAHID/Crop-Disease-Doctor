# Functions that agents can call (CV inference, Weather API, Search, etc.)
import torch
from src.vision.model import CropDiseaseClassifier
from torchvision import transforms
from PIL import Image
import json
import os

# Load class index mapping (find it in project root or notebooks/)
_current_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.abspath(os.path.join(_current_dir, "..", ".."))
_class_index_path = os.path.join(_project_root, "class_index.json")

# Fallback to notebooks/ if not in root
if not os.path.exists(_class_index_path):
    _class_index_path = os.path.join(_project_root, "notebooks", "class_index.json")

with open(_class_index_path, "r") as f:
    CLASS_IDX = json.load(f)
IDX_CLASS = {v:k for k,v in CLASS_IDX.items()}

# Device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# Load trained model
NUM_CLASSES = len(CLASS_IDX)
MODEL_PATH = os.path.join(_project_root, "best_model_mobilenet.pt")
model = CropDiseaseClassifier(NUM_CLASSES).to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

# Transform
IMG_SIZE = 128
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def predict_disease(image_path):
    """Predict crop disease from image"""
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)
    return IDX_CLASS[pred.item()], conf.item()
