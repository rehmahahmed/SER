**SER stands for Speech Emotion Recognition**, it is a Machine Learning Project that detects emotion from a person's voice using voice features such as chroma and mel. The project is trained using a small version of the RAVDASS audio dataset. The model is trained on MLPClassifier and its pickle file is used in the Django application.

**Requirements**: Python 3.13

**Steps to Run**:
* cd SER
* python -m venv venv
* venv\Scripts\activate
* pip install -r requirements.txt
* python manage.py runserver

**Project Working**:
* Start Recording
* Speak something
* Stop Recording
* Wait a few seconds
* The Project will show the detected emotion from your recording!
