"""
Instructions:

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 pd_sync.py
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from pdpyras import APISession, PDClientError

from convex import ConvexClient

load_dotenv(".env.local")
if os.getenv("PROD"):
    load_dotenv(".env")

PRIMARY_SCHEDULE = "PE2BZLJ"
SECONDARY_SCHEDULE = "P8M5WT3"


CONVEX_URL = os.environ["NEXT_PUBLIC_CONVEX_URL"]
PD_API_KEY = os.environ["PD_API_KEY"]
SYNC_KEY = os.environ["SYNC_KEY"]
pd_session = APISession(PD_API_KEY, default_from="oncall_app@convex.dev")
convex_client = ConvexClient(CONVEX_URL)

# Sync all the members of the rotation
try:
    # Get all users from pagerduty
    users = pd_session.jget("/users")["users"]

    # Get just the users on the eng primary rotation
    now = datetime.now()
    oncalls = pd_session.jget(
        f"/schedules/{PRIMARY_SCHEDULE}/users",
        data={"since": now, "until": now + timedelta(days=90)},
    )["users"]
    assert len(oncalls) > 0
    oncall_ids = [u["id"] for u in oncalls]

    for user in users:
        if user["id"] in oncall_ids:
            user["in_rotation"] = True
        else:
            user["in_rotation"] = False

    convex_client.mutation(
        "oncall:updateOncallMembers", {"syncKey": SYNC_KEY, "users": users}
    )

    # Sync the current oncalls
    current_primary = pd_session.jget(
        f"/schedules/{PRIMARY_SCHEDULE}/users",
        data={"since": now, "until": now + timedelta.resolution},
    )["users"]
    current_secondary = pd_session.jget(
        f"/schedules/{SECONDARY_SCHEDULE}/users",
        data={"since": now, "until": now + timedelta.resolution},
    )["users"]
    assert len(current_primary) == 1
    assert len(current_secondary) == 1
    convex_client.mutation(
        "oncall:updateCurrentOncall",
        {
            "syncKey": SYNC_KEY,
            "primary": current_primary[0],
            "secondary": current_secondary[0],
        },
    )
except PDClientError as e:
    print(e.response.text)
    raise

print(f"Sync From Pagerduty to {CONVEX_URL} Success")
