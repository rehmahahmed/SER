// static/chatbot/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const recordButton = document.getElementById('record-button');
    const emotionLabel = document.getElementById('emotion-label');
    const emotionHistoryPanel = document.getElementById('emotion-history-panel');

    if (!recordButton || !emotionLabel || !emotionHistoryPanel) {
        console.error("Critical Error: Missing required HTML elements.");
        return;
    }

    let mediaRecorder;
    let audioChunks = [];
    let waveformInterval;

    // --- Helper Functions ---
    function startWaveAnimation() {
        recordButton.classList.add('recording');
        waveformInterval = setInterval(() => {
            recordButton.textContent = ['🛑', '🔴', '🎤'][Math.floor(Math.random() * 3)];
        }, 250);
    }

    function stopWaveAnimation() {
        clearInterval(waveformInterval);
        recordButton.textContent = '🎤';
        recordButton.classList.remove('recording');
    }

    function getEmotionColor(emotion) {
        const colors = {
            Happy: '#FFD700',
            Sad: '#87CEEB',
            Angry: '#FF6347',
            Neutral: '#C0C0C0',
            Fear: '#9370DB',
            Disgust: '#3CB371',
            Surprise: '#FFA500'
        };
        return colors[emotion] || '#CCCCCC';
    }

    // --- Voice Recording & SER ---
    recordButton.addEventListener('click', async () => {
        // Stop recording if already recording
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            stopWaveAnimation();
            return;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio_data', audioBlob, 'recording.wav');

                emotionLabel.textContent = "Analyzing...";
                recordButton.disabled = true;

                try {
                    const response = await fetch('/analyze-audio/', { method: 'POST', body: formData });
                    const data = await response.json();

                    if (response.ok || response.status === 200) {
                        emotionLabel.textContent = `Emotion: ${data.emotion || 'Not Detected'}`;

                        if (data.emotion) {
                            const emotionTag = document.createElement('span');
                            emotionTag.className = 'emotion-tag';
                            emotionTag.textContent = data.emotion;
                            emotionTag.style.backgroundColor = getEmotionColor(data.emotion);
                            emotionHistoryPanel.appendChild(emotionTag);
                            emotionHistoryPanel.scrollTop = emotionHistoryPanel.scrollHeight;
                        }
                    } else {
                        emotionLabel.textContent = 'Analysis Failed';
                        console.error('Server error:', data);
                    }
                } catch (error) {
                    emotionLabel.textContent = 'Analysis Failed';
                    console.error('Error analyzing audio:', error);
                } finally {
                    recordButton.disabled = false;
                }
            };

            // Start recording
            mediaRecorder.start();
            startWaveAnimation();
        } catch (error) {
            console.error('Microphone access error:', error);
            alert('Could not access microphone. Please allow microphone permissions.');
        }
    });
});
