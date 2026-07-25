from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import json
import io

from services.audio import transcribe_audio
from services.llm import generate_hr_response, generate_interview_report, generate_company_roadmap, generate_mcq_questions, grade_mcq_answers, generate_coding_problem, grade_code_submission

router = APIRouter(
    prefix="/api/interview",
    tags=["interview"]
)

# In-memory store for resume context (in production, use a DB per user session)
resume_context_store: dict = {}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF file."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception:
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract plain text from a DOCX file."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs]).strip()
    except Exception:
        return ""

@router.post("/upload-resume")
async def upload_resume(
    resume: UploadFile = File(...),
    job_role: str = Form("General"),
    experience_level: str = Form("fresher")
):
    """
    Accepts a resume file, extracts text, and stores it for the interview session.
    """
    file_bytes = await resume.read()
    filename = resume.filename or ""
    resume_text = ""

    if filename.endswith(".pdf"):
        resume_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx") or filename.endswith(".doc"):
        resume_text = extract_text_from_docx(file_bytes)

    # Store the context (keyed by session, simplified as "default" for now)
    resume_context_store["default"] = {
        "resume_text": resume_text[:3000],  # Limit to first 3000 chars
        "job_role": job_role,
        "experience_level": experience_level
    }

    return {
        "message": "Resume uploaded successfully",
        "extracted_chars": len(resume_text),
        "job_role": job_role,
        "experience_level": experience_level
    }


@router.post("/chat")
async def chat_with_hr(
    audio: UploadFile = File(...),
    history: str = Form("[]")  # History passed as a JSON string
):
    """
    Receives user audio and conversation history.
    Returns the transcription and the AI's response.
    """
    try:
        # Parse history
        conversation_history = json.loads(history)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid history format. Must be JSON array.")

    # 1. Read audio bytes
    audio_bytes = await audio.read()
    print(f"[CHAT] Received audio: {len(audio_bytes)} bytes")

    # 2. Transcribe Audio
    try:
        user_text = await transcribe_audio(audio_bytes, filename=audio.filename)
        safe_text = (user_text or "EMPTY").encode('ascii', errors='replace').decode('ascii')
        print(f"[CHAT] Transcription: '{safe_text[:100]}'")
    except Exception as e:
        safe_err = str(e).encode('ascii', errors='replace').decode('ascii')
        print(f"[CHAT] Transcription FAILED: {safe_err}")
        raise HTTPException(status_code=500, detail="Transcription failed")

    # 3. Generate AI Response
    try:
        context = resume_context_store.get("default", {})
        ai_response = await generate_hr_response(history=conversation_history, user_message=user_text, context=context)
        safe_resp = (ai_response or "EMPTY").encode('ascii', errors='replace').decode('ascii')
        print(f"[CHAT] AI response: '{safe_resp[:100]}'")
    except Exception as e:
        safe_err = str(e).encode('ascii', errors='replace').decode('ascii')
        print(f"[CHAT] LLM generation FAILED: {safe_err}")
        raise HTTPException(status_code=500, detail="LLM generation failed")

    # 4. Return both the user's recognized text and the AI's response
    return {
        "user_text": user_text or "",
        "ai_response": ai_response or "Welcome! Could you please tell me about yourself?"
    }

from pydantic import BaseModel
from services.scoring import calculate_final_scores

class AnalyzeRequest(BaseModel):
    history: List[dict]
    look_away_count: int
    filler_words_count: int

@router.post("/analyze")
async def generate_report(request: AnalyzeRequest):
    """
    Generates the final scoring report and 30-day upskill roadmap.
    """
    try:
        context = resume_context_store.get("default", {})
        job_role = context.get("job_role", "General")
        experience_level = context.get("experience_level", "fresher")
        
        llm_data = await generate_interview_report(request.history, job_role, experience_level)
        
        report = calculate_final_scores(
            transcript_history=request.history,
            look_away_count=request.look_away_count,
            filler_words_count=request.filler_words_count,
            llm_data=llm_data
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

class RoadmapRequest(BaseModel):
    company_name: str
    job_role: str
    lpa_category: str

@router.post("/generate-roadmap")
async def get_roadmap(request: RoadmapRequest):
    """
    Returns the dynamic interview roadmap for the specified company.
    """
    try:
        roadmap = await generate_company_roadmap(
            company_name=request.company_name,
            job_role=request.job_role,
            lpa_category=request.lpa_category
        )
        return {"rounds": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

# ── MCQ Round ────────────────────────────────────────────
class MCQRequest(BaseModel):
    company_name: str
    job_role: str
    lpa_category: str
    num_questions: int = 10

@router.post("/generate-mcq")
async def get_mcq_questions(request: MCQRequest):
    try:
        questions = await generate_mcq_questions(request.company_name, request.job_role, request.lpa_category, request.num_questions)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GradeMCQRequest(BaseModel):
    questions: list
    answers: dict

@router.post("/grade-mcq")
async def grade_mcq(request: GradeMCQRequest):
    try:
        result = await grade_mcq_answers(request.questions, request.answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Coding Round ─────────────────────────────────────────
class CodingProblemRequest(BaseModel):
    company_name: str
    job_role: str
    lpa_category: str

@router.post("/generate-coding")
async def get_coding_problem(request: CodingProblemRequest):
    try:
        problem = await generate_coding_problem(request.company_name, request.job_role, request.lpa_category)
        return {"problem": problem}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GradeCodeRequest(BaseModel):
    problem: dict
    code: str
    language: str = "Python"

@router.post("/grade-code")
async def grade_code(request: GradeCodeRequest):
    try:
        result = await grade_code_submission(request.problem, request.code, request.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
