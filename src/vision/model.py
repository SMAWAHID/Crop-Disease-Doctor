import torch
import torch.nn as nn
from torchvision import models

class CropDiseaseClassifier(nn.Module):
    def __init__(self, num_classes, pretrained=True):
        super().__init__()
        # MobileNetV3-Small backbone (Faster on CPU)
        # Use weights parameter to avoid deprecation warning
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(in_features, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)
