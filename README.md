# Lumina Spark

Lumina Spark is a multilingual, voice-controlled academic assistant designed for teachers in a college classroom.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Next, create a `.env` file in the root of the project and add your Gemini API key. The application is configured to use the `GEMINI_API_KEY` environment variable.

```
GEMINI_API_KEY=your_api_key_here
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Features

- **Voice Input**: Uses the Web Speech API to transcribe questions.
- **AI Assistant**: Powered by Google's Gemini 1.5 Flash model.
- **Voice Output**: Speaks responses back using multilingual TTS.
- **Language Support**: English, Hindi, Tamil, and Telugu.
- **Q&A History**: Displays the last 5 interactions.
- **PWA Support**: Installable on your home screen.
- **Dark/Light Mode**: Switch between themes.
