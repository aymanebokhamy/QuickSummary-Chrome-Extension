from flask import Flask, request, jsonify
from summarizer import summarize_text, detect_language

app = Flask(__name__)

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        text = data.get('text', '')
        summary_length = data.get('length', 'medium')
        target_language = data.get('language', 'en')

        if not text:
            return jsonify({"error": "No text provided for summarization."}), 400

        summary = summarize_text(text, summary_length, target_language)
        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
