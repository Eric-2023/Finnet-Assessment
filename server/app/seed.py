"""
Auto-seeding: populates the database with sample users and posts on
first run only. Design decision: seeding is idempotent — it checks for
existing rows before inserting, so restarting the server never
duplicates data. This satisfies the spec's "auto-seeding on first run"
requirement without needing a separate manual step.
"""
from faker import Faker

from app.database import SessionLocal, engine, Base
from app.models import User, Post

fake = Faker()
Faker.seed(42)  # deterministic seed data, useful for reviewers re-running it

NUM_USERS = 8
MIN_POSTS_PER_USER = 3
MAX_POSTS_PER_USER = 6


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first():
            print("Database already seeded — skipping.")
            return

        for _ in range(NUM_USERS):
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                company_name=fake.company(),
                address_city=fake.city(),
                address_street=fake.street_address(),
            )
            db.add(user)
            db.flush()  # get user.id before creating posts

            post_count = fake.random_int(min=MIN_POSTS_PER_USER, max=MAX_POSTS_PER_USER)
            for _ in range(post_count):
                post = Post(
                    title=fake.sentence(nb_words=6).rstrip("."),
                    body=fake.paragraph(nb_sentences=5),
                    user_id=user.id,
                )
                db.add(post)

        db.commit()
        print(f"Seeded {NUM_USERS} users with posts.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
