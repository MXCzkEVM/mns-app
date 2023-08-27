import openai
import json
import time
import os

# Replace this with your actual API key
openai.api_key = "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"

# Function to translate text using GPT-4
def translate(text, target_language):
    messages = [
            {"role": "system", "content": "You are an experienced cryptocurrency translator who translates without error"},
            {"role": "user", "content": f"Traslate mobile app text using very local crypto terms, make sure the translated text length is not going to be much longer than English as the mobile layout is limited, Understand word gas as network fee. Also pay attention to ``\"`` these are the coding parameter, if you see it just leave as it is, don't miss them, but if you don't see this parameter, don't add it to the response. Remove all the explanation in response, only give me the result. Remember what I just told you and translate the following English text to {target_language}: {text}"},
        ]
    response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=0.1,
                max_tokens=1024,  # here is the amount of the text in answers
                top_p=0.1,
                frequency_penalty=0.3,
                presence_penalty=0.6,
    )
    print(response)
    return response["choices"][0]["message"]["content"].strip()

def main():
    language_dict = {
        "de": "German",
        "es": "Español",
        "fr": "Français",
        "it": "Italiano",
        "ko": "Korean",
        "nl": "Dutch",
        "ro": "Romanian",
        "tr": "Turkish",
        "zh_CN": "Chinese Simplified",
        "zh_TW": "Chinese Traditional",
        "id": "Indonesian",
        "pt": "Portuguese",
        "vi": "Vietnamese",
        "ja": "Japanese",
        "ru": "Russian"
    }
    
    # Ensure the source 'en' folder exists
    if not os.path.exists('en'):
        print("Error: 'en' folder not found!")
        return

    # Loop through each language in the dictionary
    for lang_code, lang_name in language_dict.items():
        
        # Ensure the language folder exists or create it
        if not os.path.exists(lang_code):
            os.makedirs(lang_code)

        # Loop through each JSON file in the 'en' folder
        for filename in os.listdir('en'):
            if filename.endswith(".json"):
                # Read the input JSON file from 'en' folder
                with open(os.path.join('en', filename), 'r') as file:
                    data = json.load(file)

                # Translate the values
                for key, value in data.items():
                    data[key] = translate(value, lang_name)
                    time.sleep(6)  # Pause for a bit between each translation request

                # Write the translated JSON to the respective language folder with the same filename
                with open(os.path.join(lang_code, filename), 'w') as file:
                    json.dump(data, file, ensure_ascii=False, indent=4)

                print(f"Translation of {filename} to {lang_name} complete. Check the '{lang_code}/{filename}' file.")

if __name__ == '__main__':
    main()
