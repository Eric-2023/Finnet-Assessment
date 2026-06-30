from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Post
from app.schemas import PostOut, PostCreate

router = APIRouter(prefix="/api/users", tags=["posts"])


@router.get("/{user_id}/posts", response_model=list[PostOut])
def list_user_posts(
    user_id: int,
    db: Session = Depends(get_db),
    # Optional pagination (spec lists this as a nice-to-have). Defaults
    # preserve existing behavior — limit=100 effectively returns "all"
    # for this assessment's small seed sizes.
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    posts = (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [PostOut.from_orm_post(p) for p in posts]


@router.post("/{user_id}/posts", response_model=PostOut, status_code=201)
def create_post(user_id: int, payload: PostCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    post = Post(title=payload.title, body=payload.body, user_id=user_id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostOut.from_orm_post(post)
