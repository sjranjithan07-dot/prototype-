from typing import List, Dict

def calculate_final_scores(transcript_history: List[Dict], look_away_count: int, filler_words_count: int, llm_data: Dict = None) -> Dict:
    """
    Calculates the final interview scores based on both the LLM transcript analysis 
    and the physical metrics (Face Mesh + Audio heuristics).
    """
    
    # 1. Eye Contact Score
    # Baseline 100, lose 5 points for every time they looked away
    eye_contact_score = max(0, 100 - (look_away_count * 5))
    
    # 2. Confidence Score
    # Lowered by filler words and looking away
    confidence_penalty = (filler_words_count * 2) + (look_away_count * 3)
    confidence_score = max(0, 100 - confidence_penalty)
    
    # 3. Communication Score & LLM Data
    if not llm_data:
        llm_data = {}
        
    communication_score = llm_data.get("communication_score", 85)
    
    # 4. Overall Score (Weighted Average)
    overall_score = (eye_contact_score * 0.3) + (confidence_score * 0.3) + (communication_score * 0.4)
    
    # Real Suggestions & Roadmap from LLM
    suggestions = llm_data.get("suggestions", [
        "Maintain eye contact longer.",
        "Slow down your speaking pace.",
        "Smile naturally during introductions."
    ])
    
    upskill_roadmap = llm_data.get("upskill_roadmap", [
        "Week 1: Practice the STAR method (Situation, Task, Action, Result) in the mirror daily.",
        "Week 2: Focus on eliminating filler words like 'umm' and 'like'.",
        "Week 3: Work on maintaining eye contact with the camera.",
        "Week 4: Do 3 full mock interviews and review your posture."
    ])
    
    return {
        "overall_score": round(overall_score, 1),
        "eye_contact_score": eye_contact_score,
        "confidence_score": confidence_score,
        "communication_score": communication_score,
        "look_away_count": look_away_count,
        "filler_words_count": filler_words_count,
        "suggestions": suggestions,
        "upskill_roadmap": upskill_roadmap
    }
