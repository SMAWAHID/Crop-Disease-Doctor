import sys
import os
import torch
import torch.nn as nn
from torch.optim import AdamW
from tqdm import tqdm

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.vision.utils import prepare_dataloaders
from src.vision.model import CropDiseaseClassifier

def main():
    # Config
    DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "PlantVillage"))
    BATCH_SIZE = 32
    EPOCHS = 1  # Just 1 epoch for verification
    LR = 1e-3
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "best_model_mobilenet.pt")

    print(f"Running on: {DEVICE}")
    if DEVICE == "cpu":
        print("Model: MobileNetV3-Small | Image Size: 128x128")

    # Load Data
    print("Preparing dataloaders...")
    train_loader, val_loader, class_to_idx = prepare_dataloaders(DATA_DIR, batch_size=BATCH_SIZE)
    num_classes = len(class_to_idx)
    print(f"Number of classes: {num_classes}")

    # Initialize Model
    model = CropDiseaseClassifier(num_classes=num_classes, pretrained=True).to(DEVICE)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = AdamW(model.parameters(), lr=LR)

    # Training Loop
    print("Starting training...")
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0
        correct = 0
        total = 0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}")
        for images, labels in pbar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
            # detailed progress in description
            pbar.set_postfix({"loss": loss.item(), "acc": correct/total})

        train_loss = running_loss / total
        train_acc = correct / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total
        print(f"Epoch {epoch+1}: Train Loss={train_loss:.4f}, Train Acc={train_acc:.4f}, Val Acc={val_acc:.4f}")

        # Save model
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print(f"Saved model to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    main()
