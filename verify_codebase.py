
import sys
import os
import torch
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

def print_status(component, success, message=""):
    status = "[OK]" if success else "[FAIL]"
    print(f"{status} {component}: {message if message else ''}")

def main():
    print("--- Codebase Verification ---")
    
    # 1. Check Torch & CUDA
    try:
        print(f"   Torch: {torch.__version__}")
        print(f"   CUDA Available: {torch.cuda.is_available()}")
        print_status("Torch & CUDA", True)
    except Exception as e:
        print_status("Torch & CUDA", False, str(e))

    # 2. Check Transformers
    try:
        import transformers
        print(f"   Transformers: {transformers.__version__}")
        print_status("Transformers", True)
    except Exception as e:
        print_status("Transformers", False, f"Missing or broken ({e})")

    # 3. Check Data Directory
    data_dir = os.path.join("data", "PlantVillage")
    if os.path.exists(data_dir):
        print_status("Data Directory", True, f"Found at {data_dir}")
    else:
        print_status("Data Directory", False, f"Not found at {data_dir} (Make sure to unzip dataset)")

    # 4. Check Vision Model
    try:
        from src.vision.model import CropDiseaseClassifier
        model = CropDiseaseClassifier(num_classes=10, pretrained=False)
        print_status("Vision Model Initialization", True)
    except Exception as e:
        print_status("Vision Model Initialization", False, str(e))

    # 5. Check Whisper Bot Imports
    try:
        # Just check imports, don't load model to save time/bandwidth
        from src.interfaces.whisper_bot import load_audio, transcribe_audio
        print_status("Whisper Bot Imports", True)
    except Exception as e:
        print_status("Whisper Bot Imports", False, str(e))

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    main()
