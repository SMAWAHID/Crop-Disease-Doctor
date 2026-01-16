import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split
import json
import os

def get_transforms(image_size=128):
    train_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    val_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    return train_transform, val_transform

def prepare_dataloaders(data_dir, batch_size=32, val_split=0.2, num_workers=4):
    train_transform, val_transform = get_transforms()
    dataset = datasets.ImageFolder(data_dir, transform=train_transform)
    class_to_idx = dataset.class_to_idx

    # Save class mapping to project root
    _current_dir = os.path.dirname(os.path.abspath(__file__))
    _project_root = os.path.abspath(os.path.join(_current_dir, "..", ".."))
    _class_index_path = os.path.join(_project_root, "class_index.json")
    
    with open(_class_index_path, "w") as f:
        json.dump(class_to_idx, f, indent=4)

    # Split dataset
    val_size = int(len(dataset) * val_split)
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    val_dataset.dataset.transform = val_transform

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False,
                            num_workers=num_workers, pin_memory=True)
    return train_loader, val_loader, class_to_idx
