import os
import sys
import tempfile

# Fix Windows console encoding for Unicode (Tamil, etc.)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribes audio bytes using Groq's Whisper model if API key is available.
    Falls back to a dummy transcript if not.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key or api_key == "your_groq_api_key_here":
        return "This is a dummy transcript. I am excited to apply for this position because I have strong technical skills and experience in software development."

    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=api_key)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name

        try:
            with open(tmp_path, "rb") as audio_file:
                transcript = await client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=(filename, audio_file),
                    response_format="json",
                    language="en"  # Force English transcription to avoid encoding issues
                )
            
            # Extract text from response
            result = ""
            if hasattr(transcript, 'text'):
                result = transcript.text
            elif isinstance(transcript, dict) and 'text' in transcript:
                result = transcript['text']
            else:
                result = str(transcript)
            
            # Ensure result is clean ASCII-safe string for Windows
            result = result.encode('ascii', errors='ignore').decode('ascii').strip()
            
            if not result:
                return "I was unable to clearly hear your response. Could you please repeat that?"
            
            return result
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except Exception as e:
        # Use ascii-safe error printing to avoid Windows charmap crash
        safe_error = str(e).encode('ascii', errors='replace').decode('ascii')
        print(f"Transcription error: {safe_error}")
        return "I was unable to transcribe the audio. Please try again."
