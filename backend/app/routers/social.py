"""
Social endpoints – follow, unfollow, following list.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserFollow
from app.schemas import (
    MessageResponse,
    FollowingUserResponse,
    FollowingListResponse,
)

router = APIRouter(prefix="/user", tags=["Social"])

DEFAULT_USER_ID = 1


# ── POST /user/follow ─────────────────────────────────────────────────────
@router.post("/follow", response_model=MessageResponse)
def follow_user(follower_id: int, following_id: int, db: Session = Depends(get_db)):
    """Follow a user."""
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = (
        db.query(UserFollow)
        .filter(
            UserFollow.follower_id == follower_id,
            UserFollow.following_id == following_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already following"}

    db.add(UserFollow(follower_id=follower_id, following_id=following_id))
    db.commit()
    return {"message": "Now following"}


# ── DELETE /user/unfollow ──────────────────────────────────────────────────
@router.delete("/unfollow", response_model=MessageResponse)
def unfollow_user(follower_id: int, following_id: int, db: Session = Depends(get_db)):
    """Unfollow a user."""
    follow = (
        db.query(UserFollow)
        .filter(
            UserFollow.follower_id == follower_id,
            UserFollow.following_id == following_id,
        )
        .first()
    )
    if follow:
        db.delete(follow)
        db.commit()
    return {"message": "Unfollowed"}


# ── GET /user/following ───────────────────────────────────────────────────
@router.get("/following", response_model=FollowingListResponse)
def get_following(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return the user's following list and counts."""
    following_rows = (
        db.query(UserFollow)
        .filter(UserFollow.follower_id == user_id)
        .all()
    )
    following_ids = [f.following_id for f in following_rows]

    following_users = []
    if following_ids:
        users = db.query(User).filter(User.id.in_(following_ids)).all()
        following_users = [
            FollowingUserResponse(id=u.id, username=u.username, xp=u.xp, streak=u.streak)
            for u in users
        ]

    followers_count = db.query(UserFollow).filter(UserFollow.following_id == user_id).count()
    following_count = len(following_ids)

    return FollowingListResponse(
        following=following_users,
        followers_count=followers_count,
        following_count=following_count,
    )
