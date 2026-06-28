import os
import sys
import json
import argparse
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(env_path)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def translate_text(text, source_lang="Portuguese", target_lang="English"):
    if not GEMINI_API_KEY:
        return {"success": False, "error": "GEMINI_API_KEY not found in .env file."}
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"Translate the following text from {source_lang} to {target_lang}. Only return the translated text, without any explanations or markdown quotes:\n\n{text}"
        
        response = model.generate_content(prompt)
        translated_text = response.text.strip()
        
        return {"success": True, "translated_text": translated_text}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Translate text using Google Gemini API')
    parser.add_argument('text', type=str, help='The text to translate')
    parser.add_argument('--source', type=str, default='Portuguese', help='Source language (default: Portuguese)')
    parser.add_argument('--target', type=str, default='English', help='Target language (default: English)')
    
    args = parser.parse_args()
    
    result = translate_text(args.text, args.source, args.target)
    # Output the JSON result so the calling PHP process can parse it
    print("RESULT_JSON:" + json.dumps(result))
