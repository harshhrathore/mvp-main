from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

TIER_WEIGHTS = {
    1: 5,  # Physical - highest reliability
    2: 3,  # Physiological - medium reliability
    3: 2   # Behavioral - context-dependent
}


def get_phase1_questions() -> List[Dict]:
    """Get the first 5 questions (Tier 1 - Physical traits)"""
    return [
        {
            "id": "q1",
            "tier": 1,
            "question": "How would you describe your natural body frame?",
            "instruction": "Consider your lifelong build, not recent changes.",
            "options": {
                "a": {"text": "Thin, lean, hard to gain weight", "dosha": "Vata"},
                "b": {"text": "Medium build, athletic, moderate weight", "dosha": "Pitta"},
                "c": {"text": "Large frame, solid build, easy to gain weight", "dosha": "Kapha"}
            }
        },
        {
            "id": "q2",
            "tier": 1,
            "question": "What is your skin's natural tendency?",
            "instruction": "Think about your skin without products.",
            "options": {
                "a": {"text": "Dry, rough, thin, flaky", "dosha": "Vata"},
                "b": {"text": "Warm, oily, prone to redness", "dosha": "Pitta"},
                "c": {"text": "Moist, smooth, thick, hydrated", "dosha": "Kapha"}
            }
        },
        {
            "id": "q3",
            "tier": 1,
            "question": "How would you describe your natural hair?",
            "instruction": "Without treatments or products.",
            "options": {
                "a": {"text": "Dry, coarse, frizzy, thin", "dosha": "Vata"},
                "b": {"text": "Fine, straight, oily, early graying", "dosha": "Pitta"},
                "c": {"text": "Thick, lustrous, wavy, oily", "dosha": "Kapha"}
            }
        },
        {
            "id": "q4",
            "tier": 1,
            "question": "What is your lifelong weight pattern?",
            "instruction": "Overall tendency throughout adulthood.",
            "options": {
                "a": {"text": "Underweight, hard to gain", "dosha": "Vata"},
                "b": {"text": "Moderate, gain/lose easily", "dosha": "Pitta"},
                "c": {"text": "Overweight, hard to lose", "dosha": "Kapha"}
            }
        },
        {
            "id": "q5",
            "tier": 1,
            "question": "How would you describe your joints?",
            "instruction": "Natural joint characteristics.",
            "options": {
                "a": {"text": "Small, prominent, crack easily", "dosha": "Vata"},
                "b": {"text": "Medium, flexible, moderate", "dosha": "Pitta"},
                "c": {"text": "Large, well-padded, stable", "dosha": "Kapha"}
            }
        }
    ]


def get_phase2_questions(pattern: str) -> List[Dict]:
    """Get personalized 10 questions based on preliminary pattern"""
    
    tier2_questions = [
        {
            "id": "q6",
            "tier": 2,
            "question": "How is your digestion typically?",
            "options": {
                "a": {"text": "Variable, bloating, gas", "dosha": "Vata"},
                "b": {"text": "Strong, fast, burns hot", "dosha": "Pitta"},
                "c": {"text": "Slow, heavy after eating", "dosha": "Kapha"}
            }
        },
        {
            "id": "q7",
            "tier": 2,
            "question": "How is your sleep pattern?",
            "options": {
                "a": {"text": "Light, interrupted, hard to fall asleep", "dosha": "Vata"},
                "b": {"text": "Moderate, wake refreshed", "dosha": "Pitta"},
                "c": {"text": "Deep, long, hard to wake", "dosha": "Kapha"}
            }
        },
        {
            "id": "q8",
            "tier": 2,
            "question": "How is your energy throughout the day?",
            "options": {
                "a": {"text": "Bursts then crashes, variable", "dosha": "Vata"},
                "b": {"text": "High and steady when fueled", "dosha": "Pitta"},
                "c": {"text": "Steady and enduring", "dosha": "Kapha"}
            }
        },
        {
            "id": "q9",
            "tier": 2,
            "question": "Body temperature preference?",
            "options": {
                "a": {"text": "Always cold, need warmth", "dosha": "Vata"},
                "b": {"text": "Run hot, prefer cool", "dosha": "Pitta"},
                "c": {"text": "Comfortable in most temps", "dosha": "Kapha"}
            }
        },
        {
            "id": "q10",
            "tier": 2,
            "question": "How is your appetite?",
            "options": {
                "a": {"text": "Variable, forget to eat", "dosha": "Vata"},
                "b": {"text": "Strong, angry when hungry", "dosha": "Pitta"},
                "c": {"text": "Low, can skip meals", "dosha": "Kapha"}
            }
        }
    ]
    
    tier3_questions = [
        {
            "id": "q11",
            "tier": 3,
            "question": "How do you handle stress?",
            "options": {
                "a": {"text": "Anxious, worried, restless", "dosha": "Vata"},
                "b": {"text": "Irritable, frustrated, angry", "dosha": "Pitta"},
                "c": {"text": "Withdrawn, sad, avoidant", "dosha": "Kapha"}
            }
        },
        {
            "id": "q12",
            "tier": 3,
            "question": "How do you make decisions?",
            "options": {
                "a": {"text": "Quickly but change mind, indecisive", "dosha": "Vata"},
                "b": {"text": "Decisively and stick to it", "dosha": "Pitta"},
                "c": {"text": "Slowly, need time", "dosha": "Kapha"}
            }
        },
        {
            "id": "q13",
            "tier": 3,
            "question": "How is your memory?",
            "options": {
                "a": {"text": "Quick to learn, quick to forget", "dosha": "Vata"},
                "b": {"text": "Sharp and focused", "dosha": "Pitta"},
                "c": {"text": "Slow to learn, long retention", "dosha": "Kapha"}
            }
        },
        {
            "id": "q14",
            "tier": 3,
            "question": "How do you speak?",
            "options": {
                "a": {"text": "Fast, talk a lot, jump topics", "dosha": "Vata"},
                "b": {"text": "Clear, direct, precise", "dosha": "Pitta"},
                "c": {"text": "Slow, thoughtful, deliberate", "dosha": "Kapha"}
            }
        },
        {
            "id": "q15",
            "tier": 3,
            "question": "New activities approach?",
            "options": {
                "a": {"text": "Excited, enthusiastic, don't finish", "dosha": "Vata"},
                "b": {"text": "Goal-oriented, competitive", "dosha": "Pitta"},
                "c": {"text": "Cautious, need encouragement", "dosha": "Kapha"}
            }
        }
    ]
    
    return tier2_questions + tier3_questions


def calculate_dosha_scores(answers: Dict[str, str], phase: int = 1) -> Dict:
    """Calculate dosha scores with weighted scoring"""
    
    scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}
    
    if phase == 1:
        questions = get_phase1_questions()
    else:
        questions = get_phase1_questions() + get_phase2_questions("balanced")
    
    for question in questions:
        qid = question["id"]
        if qid in answers:
            answer_key = answers[qid]
            if answer_key in question["options"]:
                dosha = question["options"][answer_key]["dosha"]
                weight = TIER_WEIGHTS[question["tier"]]
                scores[dosha] += weight
    
    total = sum(scores.values())
    if total == 0:
        percentages = {"Vata": 33.3, "Pitta": 33.3, "Kapha": 33.3}
    else:
        percentages = {
            dosha: round((score / total) * 100, 1)
            for dosha, score in scores.items()
        }
    
    sorted_doshas = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_doshas[0][0]
    secondary = sorted_doshas[1][0]
    
    primary_pct = percentages[primary]
    secondary_pct = percentages[secondary]
    margin = primary_pct - secondary_pct
    
    if margin >= 15:
        classification_type = "single_dominant"
        label = f"{primary}-dominant"
        certainty = "high" if margin >= 20 else "moderate"
        confidence = margin / 100
    elif margin >= 10:
        classification_type = "dual_dosha"
        label = f"{primary}-{secondary}"
        certainty = "moderate"
        confidence = margin / 100
    else:
        classification_type = "tridoshic"
        label = "Balanced (Tridoshic)"
        certainty = "low"
        confidence = 0.1
    
    interpretation = f"You have a {label} constitution with {certainty} certainty."
    
    return {
        "scores": scores,
        "percentages": percentages,
        "classification": {
            "type": classification_type,
            "label": label,
            "certainty": certainty,
            "confidence": confidence
        },
        "interpretation": interpretation
    }
