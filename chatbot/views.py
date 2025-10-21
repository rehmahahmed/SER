import json
import os
import tempfile
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from . import utils
from pydub import AudioSegment

# --- Main SER page ---
def ser_view(request):
    """
    Renders the Speech Emotion Recognition interface.
    """
    return render(request, 'chatbot/chat.html')

# --- Handles voice input for emotion detection ---
@csrf_exempt
def analyze_audio_view(request):
    """
    Receives an audio file, predicts emotion, and returns it as JSON.
    """
    if request.method == 'POST' and request.FILES.get('audio_data'):
        audio_file = request.FILES['audio_data']
        temp_dir = settings.BASE_DIR / '_temp_audio'
        temp_dir.mkdir(exist_ok=True)

        try:
            sound = AudioSegment.from_file(audio_file)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav', dir=temp_dir) as tmp_wav_file:
                sound.export(tmp_wav_file.name, format="wav")
                tmp_wav_path = tmp_wav_file.name

            predicted_emotion = utils.predict_emotion(tmp_wav_path)
            os.unlink(tmp_wav_path)

            return JsonResponse({'emotion': predicted_emotion})

        except Exception as e:
            print(f"Error processing audio: {e}")
            return JsonResponse({'error': 'Failed to process audio file.'}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)
