# app/seeds/seed_data.py

import asyncio
import json
from uuid import uuid4
from datetime import date, datetime
from sqlalchemy import select
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.models.user_authentication import UserAuthentication
from app.models.user_onboarding import UserOnboarding
from app.models.dosha_assessment import DoshaAssessment
from app.models.conversation_session import ConversationSession
from app.models.chat_message import ConversationMessage
from app.database.connection import AsyncSessionLocal, init_db


async def seed_test_data():
    """Seed test data into SQLite database"""
    print("🌱 Starting database seeding...")
    
    try:
        await init_db()  # Ensure tables exist
        print("✅ Database initialized")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    try:
        async with AsyncSessionLocal() as db:
            test_users = [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "john@example.com",
                    "full_name": "John Wellness",
                    "phone": "+1234567890",
                    "primary_dosha": "vata"
                },
                {
                    "id": "550e8400-e29b-41d4-a716-446655440001", 
                    "email": "maya@example.com",
                    "full_name": "Maya Calm",
                    "phone": "+1234567891",
                    "primary_dosha": "pitta"
                },
                {
                    "id": "550e8400-e29b-41d4-a716-446655440002",
                    "email": "arjun@example.com",
                    "full_name": "Arjun Steady",
                    "phone": "+1234567892", 
                    "primary_dosha": "kapha"
                }
            ]
            
            created_users = 0
            
            for user_data in test_users:
                # Check if user already exists
                result = await db.execute(select(User).where(User.email == user_data["email"]))
                existing_user = result.scalars().first()
                
                if not existing_user:
                    # Create new user
                    user = User(
                        id=user_data["id"],
                        email=user_data["email"],
                        full_name=user_data["full_name"],
                        phone=user_data["phone"],
                        country="US",
                        account_status="active"
                    )
                    db.add(user)
                    created_users += 1
                    user_id = user_data["id"]
                    print(f"➕ Created user: {user_data['email']}")
                else:
                    user_id = existing_user.id
                    print(f"👤 User already exists: {user_data['email']}")

                # Create user authentication
                auth_result = await db.execute(select(UserAuthentication).where(UserAuthentication.user_id == user_id))
                if not auth_result.scalars().first():
                    auth = UserAuthentication(
                        user_id=user_id,
                        password_hash="$2b$12$example_hashed_password",
                        failed_attempts=0
                    )
                    db.add(auth)

                # Create user onboarding  
                onboarding_result = await db.execute(select(UserOnboarding).where(UserOnboarding.user_id == user_id))
                if not onboarding_result.scalars().first():
                    onboarding = UserOnboarding(
                        user_id=user_id,
                        step_1_completed=True,
                        step_2_completed=True, 
                        step_3_completed=True,
                        health_baseline={
                            "sleep": 7,
                            "energy": 6,
                            "appetite": 8,
                            "pain": 2,
                            "medications": []
                        }
                    )
                    db.add(onboarding)

                # Create user preferences
                prefs_result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == user_id))
                if not prefs_result.scalars().first():
                    preferences = UserPreferences(
                        user_id=user_id,
                        preferred_language="English",
                        voice_gender="female",
                        background_sounds=True,
                        morning_reminder=True,
                        evening_checkin=True,
                        learning_level="beginner",
                        favorite_practices=[],
                        disliked_practices=[]
                    )
                    db.add(preferences)

                # Create dosha assessment
                assessment_result = await db.execute(select(DoshaAssessment).where(DoshaAssessment.user_id == user_id))
                if not assessment_result.scalars().first():
                    assessment = DoshaAssessment(
                        user_id=user_id,
                        assessment_type="initial",
                        responses={
                            "q1": 3, "q2": 2, "q3": 4, "q4": 3, "q5": 2,
                            "q6": 4, "q7": 3, "q8": 2, "q9": 4, "q10": 3,
                            "q11": 2, "q12": 4, "q13": 3, "q14": 2, "q15": 4
                        },
                        prakriti_scores={
                            "vata": 0.4 if user_data["primary_dosha"] == "vata" else 0.2,
                            "pitta": 0.5 if user_data["primary_dosha"] == "pitta" else 0.3,
                            "kapha": 0.6 if user_data["primary_dosha"] == "kapha" else 0.2
                        },
                        primary_dosha=user_data["primary_dosha"],
                        confidence_score=0.85
                    )
                    db.add(assessment)

                # Create sample conversation session
                session_result = await db.execute(select(ConversationSession).where(ConversationSession.user_id == user_id))
                if not session_result.scalars().first():
                    session = ConversationSession(
                        user_id=user_id,
                        session_type="regular",
                        device_info={"model": "iPhone 13", "os": "iOS 16.5"},
                        network_type="wifi"
                    )
                    db.add(session)
                    await db.flush()  # Get session_id
                    
                    # Create sample messages
                    message = ConversationMessage(
                        session_id=session.session_id,
                        user_id=user_id,
                        sequence_number=1,
                        input_type="text",
                        transcript_text="Hello, how are you today?",
                        ai_response_text=f"Hello {user_data['full_name']}! I'm doing well, thank you for asking. How are you feeling today?",
                        time_of_day="morning"
                    )
                    db.add(message)

            await db.commit()
            print(f"\n🎉 Seeding completed successfully!")
            print(f"📊 Created {created_users} new users")
            print(f"📈 Database is ready for testing")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        await db.rollback()


if __name__ == "__main__":
    asyncio.run(seed_test_data())
