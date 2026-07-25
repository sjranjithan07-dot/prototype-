import sys
import os

# === CRITICAL: Fix Windows charmap encoding before ANYTHING else ===
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI HR Interview Coach API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.interview import router as interview_router

@app.get("/")
async def root():
    return {"message": "AI HR Interview Coach API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(interview_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
