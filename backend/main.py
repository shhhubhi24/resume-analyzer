from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_text_from_pdf
from job_matcher import match_jobs
from gpt_suggester import get_resume_feedback
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

UPLOAD_DIR = "uploads"
MIN_RESUME_LEN = 100
MAX_FEEDBACK_LEN = 6000

app = FastAPI()
executor = ThreadPoolExecutor()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Simple scoring function ---
def calculate_resume_score(text: str) -> int:
    score = 50
    if "project" in text.lower():
        score += 10
    if any(word in text.lower() for word in ["python", "java", "react", "sql"]):
        score += 10
    if any(char in text for char in ["%", "+", "-", "$"]):
        score += 10
    if len(text) > 1500:
        score += 10
    return min(score, 100)

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), role: str = Form("General")):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        resume_text = extract_text_from_pdf(file_path).strip()
        if len(resume_text) < MIN_RESUME_LEN:
            raise HTTPException(status_code=400, detail="Resume is too short or unreadable.")

        job_matches = await match_jobs(resume_text)
        score = calculate_resume_score(resume_text)

        return {
            "filename": file.filename,
            "resume_text": resume_text[:1000],
            "job_matches": job_matches,
            "score": score
        }

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        print("❌ Resume upload error:", e)
        raise HTTPException(status_code=500, detail="Internal error during resume processing.")

@app.post("/suggest-improvements/")
async def suggest_improvements(file: UploadFile = File(...), role: str = Form("General")):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        resume_text = extract_text_from_pdf(file_path).strip()
        if len(resume_text) < MIN_RESUME_LEN:
            raise HTTPException(status_code=400, detail="Resume is too short for feedback.")
        elif len(resume_text) > MAX_FEEDBACK_LEN:
            raise HTTPException(status_code=400, detail="Resume is too long for feedback.")

        feedback = await asyncio.get_event_loop().run_in_executor(
            executor, get_resume_feedback, resume_text, role
        )

        if not feedback or "No valid content" in feedback:
            raise HTTPException(status_code=500, detail="AI feedback model returned no suggestions.")

        return {
            "filename": file.filename,
            "suggestions": feedback
        }

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        print("❌ GPT feedback error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate resume suggestions.")
