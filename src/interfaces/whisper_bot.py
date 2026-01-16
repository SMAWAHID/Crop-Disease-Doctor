import torch
import torchaudio
from transformers import WhisperProcessor, WhisperForConditionalGeneration

# -----------------------------
# Config
# -----------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Choose model size: small / medium / large
MODEL_NAME = "openai/whisper-small"

# Load model & processor
processor = WhisperProcessor.from_pretrained(MODEL_NAME)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_NAME).to(DEVICE)

# Set the target language to Urdu
LANGUAGE = "ur"

# -----------------------------
# Utility Functions
# -----------------------------
def load_audio(audio_path, sampling_rate=16000):
    """
    Load audio and resample to 16kHz mono
    """
    waveform, sr = torchaudio.load(audio_path, backend="soundfile")
    if sr != sampling_rate:
        waveform = torchaudio.transforms.Resample(orig_freq=sr, new_freq=sampling_rate)(waveform)
    # Convert to mono
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)
    return waveform

def transcribe_audio(audio_path):
    """
    Transcribe Urdu audio to text
    """
    waveform = load_audio(audio_path)
    input_features = processor(waveform.squeeze(0), sampling_rate=16000, return_tensors="pt").input_features.to(DEVICE)

    # Generate transcription
    predicted_ids = model.generate(input_features)
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

    return transcription
