import numpy as np
import soundfile as sf
import os

# Generate a 1-second silence/tone
sr = 16000
t = np.linspace(0, 1, sr)
audio = np.sin(2 * np.pi * 440 * t) * 0.5  # A4 tone

output_path = r"c:\Users\GM A\OneDrive - ITech Khan Solutions\Desktop\RAG\data\audio_sample.wav"
sf.write(output_path, audio, sr)
print(f"Created dummy audio at {output_path}")
