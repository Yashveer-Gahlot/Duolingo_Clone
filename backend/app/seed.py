"""
Database seeder – populates the SQLite DB with a full Spanish course,
a default learner profile, and mock leaderboard competitors.

Run standalone:  python -m app.seed
Auto-runs on server startup via main.py lifespan.
"""

import json
from datetime import datetime, date, timedelta

from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.models import (
    User,
    Course,
    Unit,
    Skill,
    Lesson,
    Exercise,
    ExerciseType,
    UserProgress,
    LeaderboardEntry,
    Achievement,
    UserAchievement,
    UserFollow,
)


def seed_database() -> None:
    """Populate the database if it's empty (idempotent)."""
    db: Session = SessionLocal()

    try:
        # Skip if data already fully seeded
        if db.query(Course).first() and db.query(Achievement).first():
            return

        # ──────────────────────────────────────────────────────────────
        # 1.  Spanish Course
        # ──────────────────────────────────────────────────────────────
        course = Course(
            title="Spanish",
            language_code="es",
            flag_icon="🇪🇸",
        )
        db.add(course)
        db.flush()

        # ──────────────────────────────────────────────────────────────
        # 2.  Unit 1 – Foundations
        # ──────────────────────────────────────────────────────────────
        unit1 = Unit(
            course_id=course.id,
            title="Foundations",
            description="Learn the basics of Spanish: greetings, common phrases, and food vocabulary.",
            order=1,
            color="#58cc02",
        )
        db.add(unit1)
        db.flush()

        # ──────────────────────────────────────────────────────────────
        # 3.  Skills (Basics 1, Phrases, Food)
        # ──────────────────────────────────────────────────────────────
        skills_data = [
            {"title": "Basics 1", "icon_name": "star", "order": 1, "total_lessons": 3},
            {"title": "Phrases", "icon_name": "chat", "order": 2, "total_lessons": 3},
            {"title": "Food", "icon_name": "utensils", "order": 3, "total_lessons": 3},
        ]

        skill_objects: list[Skill] = []
        for sd in skills_data:
            skill = Skill(unit_id=unit1.id, **sd)
            db.add(skill)
            skill_objects.append(skill)
        db.flush()

        # ──────────────────────────────────────────────────────────────
        # 4.  Lessons & Exercises per skill (Unit 1)
        # ──────────────────────────────────────────────────────────────
        _seed_basics_1(db, skill_objects[0])
        _seed_phrases(db, skill_objects[1])
        _seed_food(db, skill_objects[2])

        # ──────────────────────────────────────────────────────────────
        # 4b. Unit 2 – Order Food & Travel
        # ──────────────────────────────────────────────────────────────
        unit2 = Unit(
            course_id=course.id,
            title="Order Food & Travel",
            description="Order meals at restaurants, ask for directions, and introduce family.",
            order=2,
            color="#ce82ff",
        )
        db.add(unit2)
        db.flush()

        u2_skills_data = [
            {"title": "Travel", "icon_name": "plane", "order": 1, "total_lessons": 3},
            {"title": "Restaurant", "icon_name": "utensils", "order": 2, "total_lessons": 3},
            {"title": "Family", "icon_name": "users", "order": 3, "total_lessons": 3},
        ]

        u2_skill_objects: list[Skill] = []
        for sd in u2_skills_data:
            skill = Skill(unit_id=unit2.id, **sd)
            db.add(skill)
            u2_skill_objects.append(skill)
        db.flush()

        _seed_travel(db, u2_skill_objects[0])
        _seed_restaurant(db, u2_skill_objects[1])
        _seed_family(db, u2_skill_objects[2])

        # ──────────────────────────────────────────────────────────────
        # 5.  Default learner + leaderboard competitors
        # ──────────────────────────────────────────────────────────────
        today = date.today()
        default_user = User(
            username="learner",
            email="learner@duolingo.local",
            xp=240,
            streak=5,
            hearts=5,
            gems=500,
            last_active_date=today,
            hearts_updated_at=datetime.utcnow(),
            created_at=datetime.utcnow() - timedelta(days=30),
        )
        db.add(default_user)
        db.flush()

        # Progress: first skill of Unit 1 unlocked
        db.add(UserProgress(user_id=default_user.id, skill_id=skill_objects[0].id, completed_lessons=0, is_unlocked=True, is_completed=False))
        db.add(UserProgress(user_id=default_user.id, skill_id=skill_objects[1].id, completed_lessons=0, is_unlocked=False, is_completed=False))
        db.add(UserProgress(user_id=default_user.id, skill_id=skill_objects[2].id, completed_lessons=0, is_unlocked=False, is_completed=False))

        # Progress: Unit 2 skills (all locked until Unit 1 complete)
        db.add(UserProgress(user_id=default_user.id, skill_id=u2_skill_objects[0].id, completed_lessons=0, is_unlocked=False, is_completed=False))
        db.add(UserProgress(user_id=default_user.id, skill_id=u2_skill_objects[1].id, completed_lessons=0, is_unlocked=False, is_completed=False))
        db.add(UserProgress(user_id=default_user.id, skill_id=u2_skill_objects[2].id, completed_lessons=0, is_unlocked=False, is_completed=False))

        # Leaderboard entry for default user
        db.add(LeaderboardEntry(user_id=default_user.id, total_xp=240, weekly_xp=120))

        # 5 mock competitors
        competitors = [
            {"username": "maria_garcia", "email": "maria@duolingo.local", "xp": 520, "streak": 12, "total_xp": 520, "weekly_xp": 185},
            {"username": "john_smith", "email": "john@duolingo.local", "xp": 380, "streak": 8, "total_xp": 380, "weekly_xp": 95},
            {"username": "sakura_tanaka", "email": "sakura@duolingo.local", "xp": 670, "streak": 21, "total_xp": 670, "weekly_xp": 210},
            {"username": "ahmed_hassan", "email": "ahmed@duolingo.local", "xp": 150, "streak": 3, "total_xp": 150, "weekly_xp": 60},
            {"username": "emma_wilson", "email": "emma@duolingo.local", "xp": 310, "streak": 7, "total_xp": 310, "weekly_xp": 140},
        ]
        for c in competitors:
            user = User(
                username=c["username"],
                email=c["email"],
                xp=c["xp"],
                streak=c["streak"],
                hearts=5,
                last_active_date=today - timedelta(days=1),
                created_at=datetime.utcnow() - timedelta(days=60),
            )
            db.add(user)
            db.flush()
            db.add(LeaderboardEntry(user_id=user.id, total_xp=c["total_xp"], weekly_xp=c["weekly_xp"]))

        # ──────────────────────────────────────────────────────────────
        # 6.  Achievements
        # ──────────────────────────────────────────────────────────────
        achievements_data = [
            {"key": "wildfire",     "name": "Wildfire",      "description": "Reach a 3-day streak",           "icon": "🔥", "color": "#ff9600", "target_value": 3,    "category": "streak"},
            {"key": "sharpshooter","name": "Sharpshooter",  "description": "Complete a lesson with 100% accuracy", "icon": "🎯", "color": "#1cb0f6", "target_value": 1, "category": "accuracy"},
            {"key": "champion",    "name": "Champion",      "description": "Earn 100 XP",                    "icon": "🏆", "color": "#ffc800", "target_value": 100,  "category": "xp"},
            {"key": "sage",        "name": "Sage",          "description": "Earn 500 XP",                    "icon": "🦉", "color": "#ce82ff", "target_value": 500,  "category": "xp"},
            {"key": "scholar",     "name": "Scholar",       "description": "Earn 1000 XP",                   "icon": "📚", "color": "#58cc02", "target_value": 1000, "category": "xp"},
            {"key": "legendary",   "name": "Legendary",     "description": "Earn 5000 XP",                   "icon": "👑", "color": "#ff4b4b", "target_value": 5000, "category": "xp"},
            {"key": "streak_master", "name": "Streak Master", "description": "Reach a 30-day streak",        "icon": "⚡", "color": "#ff9600", "target_value": 30,   "category": "streak"},
            {"key": "polyglot",    "name": "Polyglot",      "description": "Earn 2500 XP",                   "icon": "🌍", "color": "#1cb0f6", "target_value": 2500, "category": "xp"},
        ]

        ach_objects = []
        for ad in achievements_data:
            ach = Achievement(**ad)
            db.add(ach)
            ach_objects.append(ach)
        db.flush()

        # Link all achievements to default user with initial progress
        for ach in ach_objects:
            initial_progress = 0
            is_unlocked = False

            if ach.key == "wildfire":
                initial_progress = min(default_user.streak, ach.target_value)
            elif ach.key in ("champion", "sage", "scholar", "legendary", "polyglot"):
                initial_progress = min(default_user.xp, ach.target_value)
            elif ach.key == "streak_master":
                initial_progress = min(default_user.streak, ach.target_value)

            if initial_progress >= ach.target_value:
                is_unlocked = True

            db.add(UserAchievement(
                user_id=default_user.id,
                achievement_id=ach.id,
                progress=initial_progress,
                is_unlocked=is_unlocked,
                unlocked_at=datetime.utcnow() if is_unlocked else None,
            ))

        # ──────────────────────────────────────────────────────────────
        # 7.  Default follows (learner follows 3 competitors)
        # ──────────────────────────────────────────────────────────────
        competitor_users = db.query(User).filter(User.id != default_user.id).limit(3).all()
        for cu in competitor_users:
            db.add(UserFollow(follower_id=default_user.id, following_id=cu.id))

        db.commit()
        print("✅  Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌  Seed failed: {e}")
        raise
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════
# Skill: Basics 1
# ═══════════════════════════════════════════════════════════════════════════
def _seed_basics_1(db: Session, skill: Skill) -> None:
    # ── Lesson 1 ──
    l1 = Lesson(skill_id=skill.id, title="Basic Greetings", order=1, xp_reward=10)
    db.add(l1)
    db.flush()
    _add_exercises(db, l1.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "Select 'the apple'",
            "correct_answer": "la manzana",
            "options_json": json.dumps(["la manzana", "el niño", "la mujer"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'El niño bebe agua'",
            "correct_answer": "The boy drinks water",
            "options_json": json.dumps(["The", "boy", "drinks", "water", "girl", "eats"]),
            "order": 2,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'hello' in Spanish?",
            "correct_answer": "hola",
            "options_json": None,
            "order": 3,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Yo ___ un estudiante. (I am a student)",
            "correct_answer": "soy",
            "options_json": json.dumps(["soy", "eres", "es", "somos"]),
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match the English words to their Spanish translations",
            "correct_answer": json.dumps({"hello": "hola", "goodbye": "adiós", "please": "por favor", "thank you": "gracias"}),
            "options_json": json.dumps({
                "english": ["hello", "goodbye", "please", "thank you"],
                "spanish": ["gracias", "hola", "por favor", "adiós"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 2 ──
    l2 = Lesson(skill_id=skill.id, title="People & Introductions", order=2, xp_reward=10)
    db.add(l2)
    db.flush()
    _add_exercises(db, l2.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "Select 'the woman'",
            "correct_answer": "la mujer",
            "options_json": json.dumps(["la mujer", "el hombre", "el niño"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'La mujer come pan'",
            "correct_answer": "The woman eats bread",
            "options_json": json.dumps(["The", "woman", "eats", "bread", "man", "drinks"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Él ___ un hombre. (He is a man)",
            "correct_answer": "es",
            "options_json": json.dumps(["soy", "eres", "es", "son"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'man' in Spanish?",
            "correct_answer": "hombre",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match the people to their Spanish translations",
            "correct_answer": json.dumps({"boy": "niño", "girl": "niña", "man": "hombre", "woman": "mujer"}),
            "options_json": json.dumps({
                "english": ["boy", "girl", "man", "woman"],
                "spanish": ["mujer", "niño", "hombre", "niña"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 3 ──
    l3 = Lesson(skill_id=skill.id, title="Simple Sentences", order=3, xp_reward=15)
    db.add(l3)
    db.flush()
    _add_exercises(db, l3.id, [
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Yo bebo leche'",
            "correct_answer": "I drink milk",
            "options_json": json.dumps(["I", "drink", "milk", "eat", "water", "he"]),
            "order": 1,
        },
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Yo como arroz' mean?",
            "correct_answer": "I eat rice",
            "options_json": json.dumps(["I eat rice", "I drink water", "He eats rice"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Nosotros ___ agua. (We drink water)",
            "correct_answer": "bebemos",
            "options_json": json.dumps(["bebo", "bebes", "bebe", "bebemos"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "Translate to Spanish: 'She eats bread'",
            "correct_answer": "Ella come pan",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match the verbs with their meanings",
            "correct_answer": json.dumps({"comer": "to eat", "beber": "to drink", "hablar": "to speak", "leer": "to read"}),
            "options_json": json.dumps({
                "spanish": ["comer", "beber", "hablar", "leer"],
                "english": ["to read", "to eat", "to speak", "to drink"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# Skill: Phrases
# ═══════════════════════════════════════════════════════════════════════════
def _seed_phrases(db: Session, skill: Skill) -> None:
    # ── Lesson 1 ──
    l1 = Lesson(skill_id=skill.id, title="Common Greetings", order=1, xp_reward=10)
    db.add(l1)
    db.flush()
    _add_exercises(db, l1.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Buenos días' mean?",
            "correct_answer": "Good morning",
            "options_json": json.dumps(["Good morning", "Good night", "Good afternoon"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Buenas noches'",
            "correct_answer": "Good night",
            "options_json": json.dumps(["Good", "night", "morning", "afternoon", "evening"]),
            "order": 2,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'Good afternoon' in Spanish?",
            "correct_answer": "Buenas tardes",
            "options_json": None,
            "order": 3,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "¿Cómo ___? (How are you?)",
            "correct_answer": "estás",
            "options_json": json.dumps(["estás", "eres", "tienes", "haces"]),
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match greetings with their translations",
            "correct_answer": json.dumps({"Good morning": "Buenos días", "Good afternoon": "Buenas tardes", "Good night": "Buenas noches", "See you later": "Hasta luego"}),
            "options_json": json.dumps({
                "english": ["Good morning", "Good afternoon", "Good night", "See you later"],
                "spanish": ["Buenas noches", "Buenos días", "Hasta luego", "Buenas tardes"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 2 ──
    l2 = Lesson(skill_id=skill.id, title="Polite Expressions", order=2, xp_reward=10)
    db.add(l2)
    db.flush()
    _add_exercises(db, l2.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "How do you say 'Thank you' in Spanish?",
            "correct_answer": "Gracias",
            "options_json": json.dumps(["Gracias", "Por favor", "De nada"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Lo siento mucho'",
            "correct_answer": "I am very sorry",
            "options_json": json.dumps(["I", "am", "very", "sorry", "happy", "not"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "___ favor, ayúdame. (Please, help me)",
            "correct_answer": "Por",
            "options_json": json.dumps(["Por", "Para", "Con", "Sin"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'You're welcome' in Spanish?",
            "correct_answer": "De nada",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match polite phrases",
            "correct_answer": json.dumps({"Thank you": "Gracias", "Please": "Por favor", "Excuse me": "Perdón", "You're welcome": "De nada"}),
            "options_json": json.dumps({
                "english": ["Thank you", "Please", "Excuse me", "You're welcome"],
                "spanish": ["Por favor", "De nada", "Gracias", "Perdón"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 3 ──
    l3 = Lesson(skill_id=skill.id, title="Questions & Responses", order=3, xp_reward=15)
    db.add(l3)
    db.flush()
    _add_exercises(db, l3.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does '¿Dónde está el baño?' mean?",
            "correct_answer": "Where is the bathroom?",
            "options_json": json.dumps(["Where is the bathroom?", "What is your name?", "How old are you?"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: '¿Cuántos años tienes?'",
            "correct_answer": "How old are you?",
            "options_json": json.dumps(["How", "old", "are", "you?", "what", "name"]),
            "order": 2,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you ask 'What is your name?' in Spanish?",
            "correct_answer": "¿Cómo te llamas?",
            "options_json": None,
            "order": 3,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "¿___ hora es? (What time is it?)",
            "correct_answer": "Qué",
            "options_json": json.dumps(["Qué", "Cuál", "Dónde", "Cómo"]),
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match questions with translations",
            "correct_answer": json.dumps({"What?": "¿Qué?", "Where?": "¿Dónde?", "When?": "¿Cuándo?", "Why?": "¿Por qué?"}),
            "options_json": json.dumps({
                "english": ["What?", "Where?", "When?", "Why?"],
                "spanish": ["¿Cuándo?", "¿Qué?", "¿Por qué?", "¿Dónde?"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# Skill: Food
# ═══════════════════════════════════════════════════════════════════════════
def _seed_food(db: Session, skill: Skill) -> None:
    # ── Lesson 1 ──
    l1 = Lesson(skill_id=skill.id, title="Fruits & Vegetables", order=1, xp_reward=10)
    db.add(l1)
    db.flush()
    _add_exercises(db, l1.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "Select 'the apple'",
            "correct_answer": "la manzana",
            "options_json": json.dumps(["la manzana", "la naranja", "el plátano"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Yo como una naranja'",
            "correct_answer": "I eat an orange",
            "options_json": json.dumps(["I", "eat", "an", "orange", "apple", "he"]),
            "order": 2,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'banana' in Spanish?",
            "correct_answer": "plátano",
            "options_json": None,
            "order": 3,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "La ___ es roja. (The apple is red)",
            "correct_answer": "manzana",
            "options_json": json.dumps(["manzana", "naranja", "uva", "fresa"]),
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match fruits with their Spanish names",
            "correct_answer": json.dumps({"apple": "manzana", "orange": "naranja", "banana": "plátano", "strawberry": "fresa"}),
            "options_json": json.dumps({
                "english": ["apple", "orange", "banana", "strawberry"],
                "spanish": ["naranja", "manzana", "fresa", "plátano"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 2 ──
    l2 = Lesson(skill_id=skill.id, title="Drinks", order=2, xp_reward=10)
    db.add(l2)
    db.flush()
    _add_exercises(db, l2.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What is 'water' in Spanish?",
            "correct_answer": "agua",
            "options_json": json.dumps(["agua", "leche", "jugo"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Ella bebe café'",
            "correct_answer": "She drinks coffee",
            "options_json": json.dumps(["She", "drinks", "coffee", "tea", "He", "eats"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Yo bebo ___. (I drink milk)",
            "correct_answer": "leche",
            "options_json": json.dumps(["leche", "agua", "café", "jugo"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'juice' in Spanish?",
            "correct_answer": "jugo",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match drinks with their Spanish names",
            "correct_answer": json.dumps({"water": "agua", "milk": "leche", "coffee": "café", "juice": "jugo"}),
            "options_json": json.dumps({
                "english": ["water", "milk", "coffee", "juice"],
                "spanish": ["café", "agua", "jugo", "leche"],
            }),
            "order": 5,
        },
    ])

    # ── Lesson 3 ──
    l3 = Lesson(skill_id=skill.id, title="At the Restaurant", order=3, xp_reward=15)
    db.add(l3)
    db.flush()
    _add_exercises(db, l3.id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'La cuenta, por favor' mean?",
            "correct_answer": "The check, please",
            "options_json": json.dumps(["The check, please", "The menu, please", "The water, please"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Quiero una ensalada'",
            "correct_answer": "I want a salad",
            "options_json": json.dumps(["I", "want", "a", "salad", "soup", "need"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Yo ___ pollo con arroz. (I want chicken with rice)",
            "correct_answer": "quiero",
            "options_json": json.dumps(["quiero", "tengo", "como", "bebo"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'I am hungry' in Spanish?",
            "correct_answer": "Tengo hambre",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match restaurant vocabulary",
            "correct_answer": json.dumps({"menu": "menú", "waiter": "mesero", "bill": "cuenta", "tip": "propina"}),
            "options_json": json.dumps({
                "english": ["menu", "waiter", "bill", "tip"],
                "spanish": ["cuenta", "menú", "propina", "mesero"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# UNIT 2 – Travel
# ═══════════════════════════════════════════════════════════════════════════
def _seed_travel(db: Session, skill: Skill) -> None:
    """Seed 3 lessons for the Travel skill."""
    lessons = []
    for i in range(1, 4):
        lesson = Lesson(skill_id=skill.id, title=f"Travel Lesson {i}", order=i)
        db.add(lesson)
        lessons.append(lesson)
    db.flush()

    # Lesson 1 – Directions basics
    _add_exercises(db, lessons[0].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does '¿Dónde está el baño?' mean?",
            "correct_answer": "Where is the bathroom?",
            "options_json": json.dumps(["Where is the bathroom?", "How are you?", "The bill please", "Good morning"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'I need a taxi'",
            "correct_answer": "Necesito un taxi",
            "options_json": json.dumps(["Necesito", "un", "taxi", "quiero", "el", "coche"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "¿Dónde ___ el aeropuerto? (Where is the airport?)",
            "correct_answer": "está",
            "options_json": json.dumps(["está", "es", "son", "hay"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the hotel' in Spanish?",
            "correct_answer": "El hotel",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match travel vocabulary",
            "correct_answer": json.dumps({"airport": "aeropuerto", "train": "tren", "bus": "autobús", "ticket": "boleto"}),
            "options_json": json.dumps({
                "english": ["airport", "train", "bus", "ticket"],
                "spanish": ["autobús", "aeropuerto", "boleto", "tren"],
            }),
            "order": 5,
        },
    ])

    # Lesson 2 – Getting around
    _add_exercises(db, lessons[1].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does '¿Cuánto cuesta?' mean?",
            "correct_answer": "How much does it cost?",
            "options_json": json.dumps(["How much does it cost?", "Where is it?", "What time is it?", "How old are you?"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Turn left at the corner'",
            "correct_answer": "Gira a la izquierda en la esquina",
            "options_json": json.dumps(["Gira", "a", "la", "izquierda", "en", "esquina", "derecha", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "El hotel está ___ de aquí. (The hotel is far from here.)",
            "correct_answer": "lejos",
            "options_json": json.dumps(["lejos", "cerca", "aquí", "allí"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the map' in Spanish?",
            "correct_answer": "El mapa",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match direction words",
            "correct_answer": json.dumps({"left": "izquierda", "right": "derecha", "straight": "derecho", "corner": "esquina"}),
            "options_json": json.dumps({
                "english": ["left", "right", "straight", "corner"],
                "spanish": ["derecha", "izquierda", "esquina", "derecho"],
            }),
            "order": 5,
        },
    ])

    # Lesson 3 – At the hotel
    _add_exercises(db, lessons[2].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Tengo una reservación' mean?",
            "correct_answer": "I have a reservation",
            "options_json": json.dumps(["I have a reservation", "I need a room", "Check-in please", "Where is the pool?"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'I need the key to my room'",
            "correct_answer": "Necesito la llave de mi habitación",
            "options_json": json.dumps(["Necesito", "la", "llave", "de", "mi", "habitación", "puerta", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "¿A qué hora es el ___? (What time is check-out?)",
            "correct_answer": "checkout",
            "options_json": json.dumps(["checkout", "desayuno", "almuerzo", "cena"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the room' in Spanish?",
            "correct_answer": "La habitación",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match hotel vocabulary",
            "correct_answer": json.dumps({"room": "habitación", "key": "llave", "pool": "piscina", "elevator": "ascensor"}),
            "options_json": json.dumps({
                "english": ["room", "key", "pool", "elevator"],
                "spanish": ["llave", "habitación", "ascensor", "piscina"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# UNIT 2 – Restaurant
# ═══════════════════════════════════════════════════════════════════════════
def _seed_restaurant(db: Session, skill: Skill) -> None:
    """Seed 3 lessons for the Restaurant skill."""
    lessons = []
    for i in range(1, 4):
        lesson = Lesson(skill_id=skill.id, title=f"Restaurant Lesson {i}", order=i)
        db.add(lesson)
        lessons.append(lesson)
    db.flush()

    # Lesson 1 – Ordering drinks
    _add_exercises(db, lessons[0].id, [
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'Un café con leche, por favor'",
            "correct_answer": "A coffee with milk, please",
            "options_json": json.dumps(["A", "coffee", "with", "milk", "please", "tea", "sugar", "water"]),
            "order": 1,
        },
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'La cuenta, por favor' mean?",
            "correct_answer": "The bill, please",
            "options_json": json.dumps(["The bill, please", "The menu, please", "More water, please", "A table for two"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Yo quiero ___ agua. (I want to drink water.)",
            "correct_answer": "beber",
            "options_json": json.dumps(["beber", "comer", "tener", "hacer"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the restaurant' in Spanish?",
            "correct_answer": "El restaurante",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match restaurant drinks",
            "correct_answer": json.dumps({"coffee": "el café", "water": "el agua", "juice": "el jugo", "beer": "la cerveza"}),
            "options_json": json.dumps({
                "english": ["coffee", "water", "juice", "beer"],
                "spanish": ["el agua", "el café", "la cerveza", "el jugo"],
            }),
            "order": 5,
        },
    ])

    # Lesson 2 – Ordering food
    _add_exercises(db, lessons[1].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Quiero el menú, por favor' mean?",
            "correct_answer": "I want the menu, please",
            "options_json": json.dumps(["I want the menu, please", "I want the bill", "A table for two", "More bread, please"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'I would like chicken with rice'",
            "correct_answer": "Me gustaría pollo con arroz",
            "options_json": json.dumps(["Me", "gustaría", "pollo", "con", "arroz", "carne", "pescado", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "La ___ está deliciosa. (The soup is delicious.)",
            "correct_answer": "sopa",
            "options_json": json.dumps(["sopa", "mesa", "silla", "cuchara"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the waiter' in Spanish?",
            "correct_answer": "El mesero",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match food vocabulary",
            "correct_answer": json.dumps({"chicken": "pollo", "rice": "arroz", "fish": "pescado", "salad": "ensalada"}),
            "options_json": json.dumps({
                "english": ["chicken", "rice", "fish", "salad"],
                "spanish": ["arroz", "pollo", "ensalada", "pescado"],
            }),
            "order": 5,
        },
    ])

    # Lesson 3 – Paying and leaving
    _add_exercises(db, lessons[2].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does '¿Aceptan tarjeta de crédito?' mean?",
            "correct_answer": "Do you accept credit cards?",
            "options_json": json.dumps(["Do you accept credit cards?", "Where is the tip?", "Is there a discount?", "Can I see the menu?"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'The tip is included'",
            "correct_answer": "La propina está incluida",
            "options_json": json.dumps(["La", "propina", "está", "incluida", "cuenta", "es", "no", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "¿Cuánto es la ___? (How much is the bill?)",
            "correct_answer": "cuenta",
            "options_json": json.dumps(["cuenta", "comida", "mesa", "propina"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'thank you very much' in Spanish?",
            "correct_answer": "Muchas gracias",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match payment vocabulary",
            "correct_answer": json.dumps({"bill": "la cuenta", "tip": "la propina", "cash": "efectivo", "change": "el cambio"}),
            "options_json": json.dumps({
                "english": ["bill", "tip", "cash", "change"],
                "spanish": ["la propina", "la cuenta", "el cambio", "efectivo"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# UNIT 2 – Family
# ═══════════════════════════════════════════════════════════════════════════
def _seed_family(db: Session, skill: Skill) -> None:
    """Seed 3 lessons for the Family skill."""
    lessons = []
    for i in range(1, 4):
        lesson = Lesson(skill_id=skill.id, title=f"Family Lesson {i}", order=i)
        db.add(lesson)
        lessons.append(lesson)
    db.flush()

    # Lesson 1 – Immediate family
    _add_exercises(db, lessons[0].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Mi madre es doctora' mean?",
            "correct_answer": "My mother is a doctor",
            "options_json": json.dumps(["My mother is a doctor", "My father is tall", "My sister is young", "My brother is a student"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'My father is tall'",
            "correct_answer": "Mi padre es alto",
            "options_json": json.dumps(["Mi", "padre", "es", "alto", "madre", "bajo", "la", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Mi ___ tiene diez años. (My brother is ten years old.)",
            "correct_answer": "hermano",
            "options_json": json.dumps(["hermano", "hermana", "primo", "amigo"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the family' in Spanish?",
            "correct_answer": "La familia",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match family members",
            "correct_answer": json.dumps({"mother": "madre", "father": "padre", "sister": "hermana", "brother": "hermano"}),
            "options_json": json.dumps({
                "english": ["mother", "father", "sister", "brother"],
                "spanish": ["padre", "madre", "hermano", "hermana"],
            }),
            "order": 5,
        },
    ])

    # Lesson 2 – Extended family
    _add_exercises(db, lessons[1].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Mi abuela cocina muy bien' mean?",
            "correct_answer": "My grandmother cooks very well",
            "options_json": json.dumps(["My grandmother cooks very well", "My aunt is pretty", "My uncle is funny", "My cousin lives here"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'I have two cousins'",
            "correct_answer": "Tengo dos primos",
            "options_json": json.dumps(["Tengo", "dos", "primos", "tres", "hermanos", "tíos", "mi", "el"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Mi ___ vive en México. (My grandfather lives in Mexico.)",
            "correct_answer": "abuelo",
            "options_json": json.dumps(["abuelo", "abuela", "tío", "primo"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'the uncle' in Spanish?",
            "correct_answer": "El tío",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match extended family",
            "correct_answer": json.dumps({"grandmother": "abuela", "grandfather": "abuelo", "uncle": "tío", "cousin": "primo"}),
            "options_json": json.dumps({
                "english": ["grandmother", "grandfather", "uncle", "cousin"],
                "spanish": ["abuelo", "abuela", "primo", "tío"],
            }),
            "order": 5,
        },
    ])

    # Lesson 3 – Describing family
    _add_exercises(db, lessons[2].id, [
        {
            "type": ExerciseType.MULTIPLE_CHOICE,
            "prompt": "What does 'Somos una familia grande' mean?",
            "correct_answer": "We are a big family",
            "options_json": json.dumps(["We are a big family", "I have a small family", "My family is happy", "We live together"]),
            "order": 1,
        },
        {
            "type": ExerciseType.TRANSLATE,
            "prompt": "Translate: 'My sister is very intelligent'",
            "correct_answer": "Mi hermana es muy inteligente",
            "options_json": json.dumps(["Mi", "hermana", "es", "muy", "inteligente", "hermano", "bonita", "alto"]),
            "order": 2,
        },
        {
            "type": ExerciseType.FILL_IN_BLANK,
            "prompt": "Mi familia es muy ___. (My family is very happy.)",
            "correct_answer": "feliz",
            "options_json": json.dumps(["feliz", "grande", "pequeña", "triste"]),
            "order": 3,
        },
        {
            "type": ExerciseType.TYPE_ANSWER,
            "prompt": "How do you say 'I love my family' in Spanish?",
            "correct_answer": "Amo a mi familia",
            "options_json": None,
            "order": 4,
        },
        {
            "type": ExerciseType.MATCH_PAIRS,
            "prompt": "Match family descriptions",
            "correct_answer": json.dumps({"tall": "alto", "short": "bajo", "young": "joven", "old": "viejo"}),
            "options_json": json.dumps({
                "english": ["tall", "short", "young", "old"],
                "spanish": ["bajo", "alto", "viejo", "joven"],
            }),
            "order": 5,
        },
    ])


# ═══════════════════════════════════════════════════════════════════════════
# Helper
# ═══════════════════════════════════════════════════════════════════════════
def _add_exercises(db: Session, lesson_id: int, exercises: list[dict]) -> None:
    for ex in exercises:
        db.add(Exercise(lesson_id=lesson_id, **ex))
    db.flush()


# ─── Allow running as a standalone script ─────────────────────────────────
if __name__ == "__main__":
    init_db()
    seed_database()
