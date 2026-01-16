import torch
import torch.nn as nn
from torchvision import models

def get_kissan_model(num_classes):
    # Load weights
    model = models.efficientnet_b0(weights='DEFAULT')
    
    # Freeze the early layers
    for param in model.parameters():
        param.requires_grad = False
    
    # FIX: Explicitly cast to int so Pylance knows it's a number
    # model.classifier[1] is the Linear layer in EfficientNet_B0
    in_features = int(model.classifier[1].in_features)  # type: ignore
    
    # Replace the final head
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features=in_features, out_features=num_classes)
    )
    
    return model