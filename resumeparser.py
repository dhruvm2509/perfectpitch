import openai
from flask import Flask, request, jsonify, flash, redirect, url_for
import os
from flask_cors import CORS
from flask_cors import CORS
from werkzeug.utils import secure_filename
import fitz

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    # Open the provided PDF file
    document = fitz.open(file_path)
    text = ''
    for page in document:
        text += page.get_text()
    return text
@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        text = extract_text_from_pdf(file_path)
        Rating, summary, weak_summary_response = analyze_and_summarize(text)
        
        response = {
            'emotion': Rating,
            'summary': summary,
            'weak_summary_response': weak_summary_response 
        }
        return jsonify(response)

@app.route('/prediction', methods=['POST'])

# Set your OpenAI API key here
def analyze_and_summarize(text):
    # Classify emotion
    Rating = openai.Completion.create(
        engine="text-davinci-003",
        prompt="You are professional HR. Rate the resume out of 100 on the basis of ATS requirements. '{}'".format(text),
        max_tokens=10
    )
    Rating = Rating.choices[0].text.strip()

    # Summary about the emotion
    summary_response = openai.Completion.create(
        engine="text-davinci-003",
        prompt="Summarize strong key points from the given resume and list all the relevant job profile that matches with the job desription.".format(Rating, text),
        max_tokens=150
    )
    summary = summary_response.choices[0].text.strip()

    # Overall summary of the text
    weak_summary_response = openai.Completion.create(
        engine="text-davinci-003",
        prompt="Provide all the weakness in the resume and how can it be improved '{}'".format(text),
        max_tokens=150
    )
    weak_summary_response = weak_summary_response.choices[0].text.strip()

    return Rating, summary, weak_summary_response

@app.route('/prediction', methods=['POST'])
def predict_emotion_and_summarize():
    try:
        data = request.get_json(force=True)
        text = ' '.join(data['texts'])  # Assuming texts is a list of sentences from the call

        Rating, summary, weak_summary_response = analyze_and_summarize(text)
        
        response = {
            'emotion': Rating,
            'summary': summary,
            'weak_summary_response': weak_summary_response 
            
        }
    except Exception as e:
        print(f"An error occurred: {e}")  # Log the error for debugging
        # Predefined fallback response
        response = {
            "Rating": "Neutral",
            "summary": "The text does not describe a specific emotion, but rather suggests a neutral approach to sentiment analysis on a conversation. The suggestion is to make one call to an open API endpoint in order to create an analysis, implying that no definite positive or negative emotions are present.",
            "weak_summary_response": "This text is about creating sentiment analysis on a conversation using only one call to an open API endpoint."
        }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)