# **App Name**: Lumina Spark

## Core Features:

- Voice Input: Voice input using Web Speech API to transcribe teacher's questions.
- Question to Gemini: Sends transcribed question to Gemini 1.5 Flash API with the user-provided API key.
- Answer Display: Displays Gemini’s answer in a stylish chat bubble with animation.
- Voice Output: Uses Puter.js TTS to speak Gemini's response in the selected language.
- Language Selector: Includes a language selector dropdown with flags and local names for multilingual support.
- Q&A History: Show last 5 Q&A pairs as history cards.
- PWA Support: Installable as a PWA (Add to Home Screen support).

## Style Guidelines:

- Primary color: Indigo (#4B0082) to convey trust, intelligence, and formality, befitting an academic context.
- Background color: Very light gray (#F0F0F0), nearly white, providing a clean and professional backdrop.
- Accent color: Sky blue (#87CEEB), to offer a touch of gentle contrast against the analogous color scheme, suggesting communication and clarity.
- Body and headline font: 'PT Sans' (sans-serif), providing a modern look, along with a touch of personality. Note: currently only Google Fonts are supported.
- Use simple, clear icons for the microphone button and language selector. Flags for each language option.
- Card-based layout with a floating mic button for accessibility.
- Subtle loading animation while waiting for Gemini to respond; animated chat bubbles.