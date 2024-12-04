from transformers import BartForConditionalGeneration, BartTokenizer
from googletrans import Translator
from langdetect import detect

# Initialize translator and BART model
translator = Translator()
model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)

def detect_language(text):
    """
    Detects the language of the input text.
    """
    return detect(text)

def translate_text(text, target_language):
    """
    Translates the given text to the specified target language.
    """
    try:
        translated = translator.translate(text, dest=target_language)
        return translated.text
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # If translation fails, return the original text

def summarize_text(text, summary_length='medium', target_language='en'):
    """
    Summarizes the input text. If the input language is not English,
    it first translates the text to English, summarizes it, and then
    translates the summary back to the target language (if needed).
    
    Parameters:
    - text (str): Text to summarize.
    - summary_length (str): Length of summary ('short', 'medium', 'detailed').
    - target_language (str): Language for the final summary output.

    Returns:
    - str: Summarized text in the specified target language.
    """
    # Step 1: Detect the source language
    source_language = detect_language(text)
    print(f"[DEBUG] Detected language: {source_language}")
    
    # Step 2: Translate text to English if it's not already in English
    if source_language != 'en':
        text = translate_text(text, 'en')
        print(f"[DEBUG] Translated text to English: {text}")

    # Step 3: Tokenize and summarize
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    max_length = 50 if summary_length == 'short' else 150 if summary_length == 'medium' else 300
    summary_ids = model.generate(inputs['input_ids'], max_length=max_length, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    print(f"[DEBUG] English summary: {summary}")

    # Step 4: Translate the summary back to the target language if needed
    if target_language != 'en':
        summary = translate_text(summary, target_language)
        print(f"[DEBUG] Translated summary to {target_language}: {summary}")

    return summary
