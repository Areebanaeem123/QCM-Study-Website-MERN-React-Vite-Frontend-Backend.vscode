from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.result import QuizAttempt, QuizResponse
from app.schemas.result import QuizResultSubmit, QuizAttemptResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/submit", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz_result(
    result_data: QuizResultSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save the results of a completed QCM session.
    """
    # 1. Create Attempt
    db_attempt = QuizAttempt(
        user_id=current_user.id,
        pack_id=result_data.pack_id,
        question_bank_id=result_data.question_bank_id,
        mock_exam_id=result_data.mock_exam_id,
        score=result_data.score,
        total_questions=result_data.total_questions,
        correct_answers=result_data.correct_answers,
        mode=result_data.mode,
        time_taken=result_data.time_taken
    )
    db.add(db_attempt)
    db.flush() # Get ID
    
    # 2. Save Responses
    for resp in result_data.responses:
        db_response = QuizResponse(
            attempt_id=db_attempt.id,
            mcq_id=resp.mcq_id,
            selected_option_id=resp.selected_option_id,
            selected_option_ids=",".join(resp.selected_option_ids) if resp.selected_option_ids else None,
            is_correct=resp.is_correct
        )
        db.add(db_response)
    
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

@router.get("/my-results", response_model=List[QuizAttemptResponse])
def get_my_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all previous results for the current student.
    """
    return db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.created_at.desc()).all()
