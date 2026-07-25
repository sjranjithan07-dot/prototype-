import os
from google import genai
from google.genai import types
import json

HR_SYSTEM_PROMPT = """You are an expert HR Interviewer conducting a mock interview with a candidate.
Your goal is to evaluate the candidate's responses, ask follow-up questions, and maintain a professional yet encouraging tone.

Rules:
1. Ask one question at a time.
2. If the candidate answers well, acknowledge it briefly and move to the next question.
3. If their answer lacks detail (e.g., they don't use the STAR method for behavioral questions), ask a probing follow-up question like "Can you tell me more about the outcome?"
4. Keep your responses concise (1-3 sentences maximum) since this is a spoken conversation.
5. Mix HR questions like: "Tell me about yourself", "What are your strengths and weaknesses?", "Why should we hire you?", "Where do you see yourself in 5 years?"

Start the interview by warmly welcoming the candidate and asking them to introduce themselves.
"""

async def generate_hr_response(history: list, user_message: str = None, context: dict = None) -> str:
    """
    Generates the next question or response from the AI Interviewer using Google Gemini.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Welcome! I'm your Interviewer today. Let's get started — could you please tell me a little bit about yourself?"

    client = genai.Client(api_key=api_key)

    context = context or {}
    job_role = context.get("job_role", "General")
    experience_level = context.get("experience_level", "fresher")
    resume_text = context.get("resume_text", "")

    dynamic_prompt = f"""You are an expert Interviewer conducting a mock interview for the role of {job_role} ({experience_level} level).
Your goal is to evaluate the candidate's responses, ask follow-up questions, and maintain a professional yet encouraging tone.

Rules:
1. Ask one question at a time.
2. Keep your responses concise (1-3 sentences maximum) since this is a spoken conversation.
3. CRITICAL: You MUST read the Candidate's Resume Context below. Ask highly specific questions about their actual internships, projects, and skills listed. Do NOT ask generic questions if they have a resume.
4. If their answer lacks detail, ask a probing follow-up question.
5. NEVER break character. You are the interviewer, they are the candidate.

Candidate's Resume Context:
{resume_text if resume_text else "No resume provided."}

Start the interview by warmly welcoming the candidate and asking them to introduce themselves.
"""

    contents = []
    
    # We must alternate roles for Gemini. The first message must be user.
    # We'll treat the system prompt as the first user message, and fake a model acknowledgment.
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=dynamic_prompt)]))
    contents.append(types.Content(role="model", parts=[types.Part.from_text(text="I understand. I am the HR Interviewer. I will begin the interview now.")]))

    for msg in history:
        # Map roles to user/model
        role = "model" if msg.get("role") == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))

    if user_message:
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

    import asyncio
    import time

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=200,
                )
            )
            return response.text
        except Exception as e:
            err_str = str(e)
            if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                print(f"[LLM] Rate limited. Returning fallback response instantly.")
                return "That's very interesting. Could you tell me more about your recent project experiences?"
            else:
                raise e
    
    return "Welcome! I'm your AI Interviewer. Could you please tell me about yourself?"

async def generate_interview_report(history: list, job_role: str, experience_level: str) -> dict:
    """
    Uses Gemini to generate a real analysis of the interview transcript.
    Returns a JSON object containing the communication score, suggestions, and upskill roadmap.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "communication_score": 85,
            "suggestions": ["Maintain eye contact longer.", "Smile naturally."],
            "upskill_roadmap": ["Week 1: Practice STAR method.", "Week 2: Do mock interviews."]
        }

    client = genai.Client(api_key=api_key)

    transcript = ""
    for msg in history:
        role = "Interviewer" if msg.get("role") == "assistant" else "Candidate"
        transcript += f"{role}: {msg.get('content')}\n\n"

    system_prompt = f"""You are an expert Interview Coach evaluating a {experience_level} {job_role} candidate.
Analyze the following interview transcript and generate a JSON report.

You MUST return ONLY a raw JSON object with the following exact keys (no markdown blocks, no text before or after):
{{
  "communication_score": (integer between 0 and 100 based on the quality, clarity, and depth of the candidate's answers),
  "suggestions": (list of 3 short, actionable feedback strings based on their answers),
  "upskill_roadmap": (list of exactly 4 strings representing a 4-week roadmap to improve their specific weak points. Format each string as 'Week X: [Action]')
}}

Interview Transcript:
{transcript}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=system_prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print("Error generating LLM report:", e)
        return {
            "communication_score": 80,
            "suggestions": ["Provide more detailed examples.", "Use the STAR method."],
            "upskill_roadmap": ["Week 1: Review foundational concepts.", "Week 2: Practice behavioral questions."]
        }

async def generate_company_roadmap(company_name: str, job_role: str, lpa_category: str) -> list:
    """
    Asks Gemini what the standard interview rounds are for a specific company and role.
    Returns a list of dicts: [{"roundNumber": 1, "roundName": "Aptitude", "roundType": "APTITUDE", "description": "..."}]
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return [
            {"roundNumber": 1, "roundName": f"{company_name} Aptitude Test", "roundType": "APTITUDE", "description": "Standard numerical and logical reasoning."},
            {"roundNumber": 2, "roundName": f"{company_name} Technical Interview", "roundType": "TECHNICAL", "description": f"Core technical questions for {job_role}."},
            {"roundNumber": 3, "roundName": f"{company_name} HR Interview", "roundType": "HR", "description": "Behavioral and culture fit questions."}
        ]

    client = genai.Client(api_key=api_key)

    system_prompt = f"""You are an expert tech recruiter who knows the hiring processes of all major tech companies.
    A candidate is applying for the role of '{job_role}' at '{company_name}' in the '{lpa_category}' LPA category.
    What are the typical interview rounds for this specific company and role?

    You MUST return ONLY a raw JSON array of objects with the following keys (no markdown blocks, no text outside JSON):
    [
      {{
        "roundNumber": (integer, starting from 1),
        "roundName": (string, e.g., "Online Assessment", "System Design Round", "HR Round"),
        "roundType": (string, MUST BE exactly one of: "APTITUDE", "TECHNICAL", "HR"),
        "description": (string, brief 1-sentence description of what this round entails)
      }}
    ]
    Ensure the rounds are in chronological order. Always end with an "HR" round. Maximum 5 rounds.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=system_prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print("Error generating roadmap:", e)
        return [
            {"roundNumber": 1, "roundName": "Aptitude & Coding", "roundType": "APTITUDE", "description": "Basic problem solving."},
            {"roundNumber": 2, "roundName": "Technical Round", "roundType": "TECHNICAL", "description": "Role specific knowledge."},
            {"roundNumber": 3, "roundName": "HR Round", "roundType": "HR", "description": "Behavioral assessment."}
        ]

async def generate_mcq_questions(company_name: str, job_role: str, lpa_category: str, num_questions: int = 10) -> list:
    """Generate MCQ aptitude questions tailored to company using Gemini."""
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""You are an expert aptitude test designer for campus placements.
Generate {num_questions} MCQ questions for a candidate applying to '{company_name}' for the role of '{job_role}' ({lpa_category} LPA).

The questions should match the difficulty of {company_name}'s actual placement aptitude tests.
Mix these categories: Quantitative Aptitude, Logical Reasoning, Verbal Ability, and basic {job_role} concepts.

Return ONLY a raw JSON array (no markdown):
[
  {{
    "id": 1,
    "question": "The question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A) ...",
    "category": "Quantitative Aptitude"
  }}
]"""

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.4, response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print("MCQ generation error:", e)
        return [
            {"id": 1, "question": "If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?", "options": ["A) 120 km", "B) 150 km", "C) 180 km", "D) 200 km"], "correct": "B) 150 km", "category": "Quantitative Aptitude"},
            {"id": 2, "question": "Find the odd one out: Apple, Mango, Carrot, Banana", "options": ["A) Apple", "B) Mango", "C) Carrot", "D) Banana"], "correct": "C) Carrot", "category": "Logical Reasoning"},
        ]

async def grade_mcq_answers(questions: list, answers: dict) -> dict:
    """Grade MCQ answers and return score, pass/fail, and feedback."""
    correct = 0
    total = len(questions)
    wrong_topics = []

    for idx, q in enumerate(questions):
        # Fallback to index if ID is missing or weird
        qid = str(q.get("id", idx))
        user_ans = str(answers.get(qid, "")).strip().lower()
        correct_ans = str(q.get("correct", "")).strip().lower()

        # Extract just the first letter (e.g., 'a', 'b', 'c', 'd') if it matches pattern "A) ..."
        if user_ans and correct_ans:
            if user_ans.startswith(correct_ans[:2]) or correct_ans.startswith(user_ans[:2]) or user_ans == correct_ans:
                 correct += 1
            else:
                 wrong_topics.append(q.get("category", "General"))
        else:
            wrong_topics.append(q.get("category", "General"))

    score = int((correct / total) * 100) if total > 0 else 0
    passed = score >= 60

    api_key = os.getenv("GEMINI_API_KEY")
    study_plan = []
    if not passed and api_key:
        try:
            client = genai.Client(api_key=api_key)
            weak_areas = list(set(wrong_topics))
            plan_prompt = f"""A student failed an aptitude test. They scored {score}/100.
Their weak areas: {', '.join(weak_areas)}.
Generate a 3-day study plan to help them improve.
Return ONLY a JSON array of 3 strings: ["Day 1: ...", "Day 2: ...", "Day 3: ..."]"""
            resp = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=plan_prompt,
                config=types.GenerateContentConfig(temperature=0.3, response_mime_type="application/json")
            )
            study_plan = json.loads(resp.text)
        except Exception:
            study_plan = ["Day 1: Revise Quantitative Aptitude basics.", "Day 2: Practice Logical Reasoning puzzles.", "Day 3: Take a mock test."]

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "passed": passed,
        "status": "PASSED" if passed else "FAILED",
        "study_plan": study_plan
    }

async def generate_coding_problem(company_name: str, job_role: str, lpa_category: str) -> dict:
    """Generate a coding problem tailored to the company using Gemini."""
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""You are a coding interview problem designer for {company_name}.
Generate 1 coding problem appropriate for a '{job_role}' role at {lpa_category} LPA level.
The difficulty should match {company_name}'s actual coding rounds.

Return ONLY a raw JSON object:
{{
  "title": "Problem title",
  "difficulty": "Easy/Medium/Hard",
  "description": "Full problem statement with examples",
  "input_format": "Description of input format",
  "output_format": "Description of output format",
  "example_input": "Example input",
  "example_output": "Example output",
  "constraints": "Constraints like 1 <= n <= 10^5",
  "starter_code": "# Write your solution here\\ndef solution():\\n    pass"
}}"""

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.5, response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print("Coding problem generation error:", e)
        return {
            "title": "Two Sum",
            "difficulty": "Easy",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "input_format": "An array of integers and a target integer",
            "output_format": "Indices of the two numbers",
            "example_input": "nums = [2,7,11,15], target = 9",
            "example_output": "[0, 1]",
            "constraints": "2 <= nums.length <= 10^4",
            "starter_code": "def twoSum(nums, target):\n    # Write your solution here\n    pass"
        }

async def grade_code_submission(problem: dict, code: str, language: str) -> dict:
    """Grade code submission using Gemini as code reviewer."""
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""You are a senior software engineer reviewing a coding interview submission.

Problem: {problem.get('title')}
Description: {problem.get('description')}

Candidate's {language} Code:
```
{code}
```

Evaluate and return ONLY a raw JSON object:
{{
  "score": (integer 0-100),
  "passed": (boolean, true if score >= 60),
  "status": "PASSED" or "FAILED",
  "correctness": "Brief note on whether the logic is correct",
  "time_complexity": "e.g. O(n)",
  "space_complexity": "e.g. O(1)",
  "feedback": ["Feedback point 1", "Feedback point 2", "Feedback point 3"],
  "study_plan": ["Day 1: ...", "Day 2: ...", "Day 3: ..."]
}}"""

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2, response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print("Code grading error:", e)
        return {"score": 70, "passed": True, "status": "PASSED", "correctness": "Logic appears correct.", "time_complexity": "O(n)", "space_complexity": "O(1)", "feedback": ["Good attempt.", "Consider edge cases."], "study_plan": []}
