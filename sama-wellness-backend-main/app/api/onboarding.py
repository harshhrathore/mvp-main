from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Dict
import logging
import uuid

from app.database.connection import get_db
from app.services.questionnaire_service import (
    get_phase1_questions,
    get_phase2_questions,
    calculate_dosha_scores
)

logger = logging.getLogger(__name__)
router = APIRouter()


class Phase1Request(BaseModel):
    """Request to start onboarding"""
    user_id: str


class Phase1Response(BaseModel):
    """Response with first 5 questions"""
    session_id: str
    questions: List[Dict]
    total_questions: int
    phase: int


class Phase1AnswersRequest(BaseModel):
    """Submit answers to phase 1"""
    session_id: str
    user_id: str
    answers: Dict[str, str]


class Phase2Response(BaseModel):
    """Response with personalized 10 questions"""
    session_id: str
    questions: List[Dict]
    preliminary_pattern: str
    phase: int


class Phase2AnswersRequest(BaseModel):
    """Submit answers to phase 2"""
    session_id: str
    user_id: str
    answers: Dict[str, str]


class FinalResultResponse(BaseModel):
    """Final Prakriti assessment result"""
    user_id: str
    prakriti_type: str
    dosha_percentages: Dict[str, float]
    scores: Dict[str, int]
    certainty: str
    confidence: float
    interpretation: str


@router.post("/onboarding/start", response_model=Phase1Response)
async def start_onboarding(
    request: Phase1Request,
    db: AsyncSession = Depends(get_db)
):
    """Start onboarding - return first 5 questions"""
    logger.info(f"Starting onboarding for user {request.user_id}")
    
    from app.models.user_onboarding import UserOnboarding
    
    session_id = str(uuid.uuid4())
    onboarding = UserOnboarding(
        session_id=session_id,
        user_id=request.user_id,
        current_phase=1,
        phase1_answers={}
    )
    
    db.add(onboarding)
    await db.commit()
    
    questions = get_phase1_questions()
    
    return Phase1Response(
        session_id=session_id,
        questions=questions,
        total_questions=15,
        phase=1
    )


@router.post("/onboarding/phase1/submit", response_model=Phase2Response)
async def submit_phase1(
    request: Phase1AnswersRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit phase 1 answers, get personalized phase 2 questions"""
    logger.info(f"Processing phase 1 for session {request.session_id}")
    
    from sqlalchemy import select
    from app.models.user_onboarding import UserOnboarding
    
    result = await db.execute(
        select(UserOnboarding).where(
            UserOnboarding.session_id == request.session_id
        )
    )
    onboarding = result.scalar_one_or_none()
    
    if not onboarding:
        raise HTTPException(status_code=404, detail="Session not found")
    
    preliminary_scores = calculate_dosha_scores(request.answers, phase=1)
    
    max_dosha = max(preliminary_scores['scores'], key=preliminary_scores['scores'].get)
    max_percentage = preliminary_scores['percentages'][max_dosha]
    
    if max_percentage > 40:
        pattern = f"{max_dosha.lower()}_leaning"
    else:
        pattern = "balanced"
    
    onboarding.phase1_answers = request.answers
    onboarding.preliminary_pattern = pattern
    onboarding.current_phase = 2
    
    await db.commit()
    
    phase2_questions = get_phase2_questions(pattern)
    
    return Phase2Response(
        session_id=request.session_id,
        questions=phase2_questions,
        preliminary_pattern=pattern,
        phase=2
    )


@router.post("/onboarding/phase2/submit", response_model=FinalResultResponse)
async def submit_phase2(
    request: Phase2AnswersRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit phase 2 answers, calculate final Prakriti"""
    logger.info(f"Finalizing assessment for session {request.session_id}")
    
    from sqlalchemy import select
    from app.models.user_onboarding import UserOnboarding
    
    result = await db.execute(
        select(UserOnboarding).where(
            UserOnboarding.session_id == request.session_id
        )
    )
    onboarding = result.scalar_one_or_none()
    
    if not onboarding:
        raise HTTPException(status_code=404, detail="Session not found")
    
    all_answers = {**onboarding.phase1_answers, **request.answers}
    
    final_result = calculate_dosha_scores(all_answers, phase="final")
    
    onboarding.phase2_answers = request.answers
    onboarding.final_scores = final_result['scores']
    onboarding.prakriti_type = final_result['classification']['label']
    onboarding.completed = True
    
    await db.commit()
    
    return FinalResultResponse(
        user_id=request.user_id,
        prakriti_type=final_result['classification']['label'],
        dosha_percentages=final_result['percentages'],
        scores=final_result['scores'],
        certainty=final_result['classification']['certainty'],
        confidence=final_result['classification']['confidence'],
        interpretation=final_result['interpretation']
    )


class HealthBaselineRequest(BaseModel):
    user_id: str
    baseline: Dict

@router.post("/onboarding/health-baseline")
async def update_health_baseline(
    request: HealthBaselineRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive health baseline (medical quiz) data from Node.js backend
    and update the user_onboarding record.
    """
    logger.info(f"Received health baseline for user {request.user_id}")
    
    from sqlalchemy import select
    from app.models.user_onboarding import UserOnboarding
    
    # Check if onboarding record exists for user
    result = await db.execute(
        select(UserOnboarding).where(
            UserOnboarding.user_id == request.user_id
        )
    )
    onboarding = result.scalar_one_or_none()
    
    if not onboarding:
        # Create new record if not exists
        onboarding = UserOnboarding(
            user_id=request.user_id,
            health_baseline=request.baseline,
            step_1_completed=True
        )
        db.add(onboarding)
    else:
        # Update existing
        onboarding.health_baseline = request.baseline
        onboarding.step_1_completed = True
        
    await db.commit()
    
    return {"status": "success", "message": "Health baseline updated"}
