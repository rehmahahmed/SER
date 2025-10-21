import os
import librosa
import soundfile
import numpy as np
import pickle
from django.conf import settings
from collections import Counter

# --- Load SER Model Once ---
MODEL_PATH = os.path.join(settings.BASE_DIR, 'model1.pkl')
with open(MODEL_PATH, 'rb') as model_file:
    emotion_model = pickle.load(model_file)

def extract_feature(file_name, mfcc, chroma, mel):
    with soundfile.SoundFile(file_name) as sound_file:
        X = sound_file.read(dtype="float32")
        sample_rate = sound_file.samplerate
        result = np.array([])
        if mfcc:
            mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T, axis=0)
            result = np.hstack((result, mfccs))
        if chroma:
            stft = np.abs(librosa.stft(X))
            chroma_feat = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T, axis=0)
            result = np.hstack((result, chroma_feat))
        if mel:
            mel_feat = np.mean(librosa.feature.melspectrogram(y=X, sr=sample_rate).T, axis=0)
            result = np.hstack((result, mel_feat))
    return result

def predict_emotion(audio_file_path):
    feature = extract_feature(audio_file_path, mfcc=True, chroma=True, mel=True)
    emotion = emotion_model.predict([feature])[0]
    return emotion

def get_average_mood(emotions_string):
    if not emotions_string:
        return "N/A"
    emo_list = [e.strip() for e in emotions_string.split(',') if e.strip()]
    if not emo_list:
        return "N/A"
    mood_counts = Counter(emo_list)
    return mood_counts.most_common(1)[0][0].capitalize()
