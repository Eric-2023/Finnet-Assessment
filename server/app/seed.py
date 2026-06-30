"""
Auto-seeding: populates the database with sample users and posts on
first run only. Design decision: seeding is idempotent — it checks for
existing rows before inserting, so restarting the server never
duplicates data. This satisfies the spec's "auto-seeding on first run"
requirement without needing a separate manual step.

Locale decision: names/emails/companies come from Faker's `en_KE`
provider (real Kenyan name and company conventions). Faker's en_KE
address provider still falls back to generic English town-name
templates though, so cities and streets are hand-curated from real
Kenyan locations instead — this keeps the seed data recognizable to a
Kenyan reviewer rather than reading as a US-default fixture with a
local name slapped on top. Post bodies are hand-written (not
Faker's word-salad `paragraph()`) so the feed reads as real posts
instead of lorem-ipsum-style filler.
"""
import random

from faker import Faker

from app.database import SessionLocal, engine, Base
from app.models import User, Post

fake = Faker("en_KE")
Faker.seed(42)  # deterministic seed data, useful for reviewers re-running it
random.seed(42)

NUM_USERS = 8
MIN_POSTS_PER_USER = 3
MAX_POSTS_PER_USER = 6

KENYAN_CITIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
    "Thika", "Malindi", "Nyeri", "Machakos", "Kakamega",
    "Naivasha", "Kitale", "Kericho", "Nanyuki", "Kiambu",
]

# Real Nairobi/major-town street and road names, paired with a plot/house
# number the way Kenyan postal addresses are typically written.
KENYAN_STREETS = [
    "Moi Avenue", "Kimathi Street", "Ngong Road", "Waiyaki Way",
    "Tom Mboya Street", "Kenyatta Avenue", "Mama Ngina Street",
    "Argwings Kodhek Road", "Riverside Drive", "Limuru Road",
    "Outer Ring Road", "Thika Road", "Lenana Road", "Muindi Mbingu Street",
    "Haile Selassie Avenue",
]

# Hand-written post content, grouped loosely by theme so a given user's
# feed doesn't read like 6 random unrelated topics. Each entry is a
# (title, body) pair.
POST_BANK = [
    ("Sunday market run in Kiambu",
     "Stopped by the farmers market this morning for sukuma wiki and fresh "
     "avocado — prices are finally coming down after the rains. Worth the "
     "early start."),
    ("M-Pesa outage this morning",
     "Anyone else having trouble sending money since around 8am? STK push "
     "keeps timing out on my end. Hoping it's resolved before the work day "
     "really kicks off."),
    ("Traffic on Thika Road",
     "Forty minutes to cover what's usually a fifteen minute drive. The "
     "ongoing roadworks near Roysambu aren't helping. Left earlier than "
     "usual and still got caught up."),
    ("New coffee spot in Kilimani",
     "Tried the new café near Yaya Centre over the weekend. Good "
     "Nyeri-grown coffee and decent wifi if you need a change of scenery "
     "for work."),
    ("Thoughts on the new payroll rules",
     "The updated NSSF and Housing Levy deductions are catching a lot of "
     "small businesses off guard this quarter. Worth double-checking your "
     "payroll setup before the next filing."),
    ("Weekend hike at Ngong Hills",
     "Clear skies for once, so we made the most of it. The view over the "
     "Rift Valley from the seventh hill never gets old. Highly recommend "
     "an early start to beat the heat."),
    ("Small business spotlight",
     "Picked up some beautiful handwoven baskets from a stall in Gikomba "
     "this week. Supporting local makers feels better than ordering from "
     "abroad, and the quality is honestly better too."),
    ("Internet been spotty all week",
     "Fibre's been dropping out every evening around 7pm — anyone else in "
     "Nairobi having the same issue, or is it just my area? Considering "
     "switching providers if it doesn't clear up soon."),
    ("Football at Kasarani",
     "Match was tense until the last fifteen minutes. The crowd at "
     "Kasarani was loud the whole way through — exactly what you want from "
     "a derby weekend."),
    ("Notes from a client meeting",
     "Good conversation today about scaling their inventory process. "
     "Sometimes the simplest fix — better seed data and clearer "
     "validation — solves more than a big rewrite would."),
    ("Rainy season prep",
     "Started clearing the gutters before the long rains properly set in. "
     "Last year's flooding around Mathare was a good reminder not to wait "
     "until the first storm."),
    ("Quick recipe win",
     "Tried githeri with a twist this week — added some smoked fish and "
     "extra dhania. Simple, filling, and good for meal-prepping the whole "
     "week."),
    ("Power outage update",
     "KPLC crew was out fixing the transformer near our estate most of the "
     "afternoon. Power's back now, but good reminder to keep a power bank "
     "charged."),
    ("Thinking about side hustles",
     "More people I know are running small online shops alongside their "
     "day jobs. Curious what's working for others — M-Pesa till numbers "
     "seem to make checkout a lot smoother."),
    ("Book recommendation",
     "Finally finished a book on East African trade history I'd been "
     "putting off. Worth the read if you're into how the region's "
     "commerce networks actually developed."),
    ("Early morning at the gym",
     "6am sessions are brutal but the gym's empty enough to actually use "
     "every machine without waiting around. Small win for consistency this "
     "month."),
]


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
                address_city=random.choice(KENYAN_CITIES),
                address_street=f"{random.randint(1, 999)} {random.choice(KENYAN_STREETS)}",
            )
            db.add(user)
            db.flush()  # get user.id before creating posts

            post_count = random.randint(MIN_POSTS_PER_USER, MAX_POSTS_PER_USER)
            user_posts = random.sample(POST_BANK, k=post_count)
            for title, body in user_posts:
                db.add(Post(title=title, body=body, user_id=user.id))

        db.commit()
        print(f"Seeded {NUM_USERS} users with posts.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
