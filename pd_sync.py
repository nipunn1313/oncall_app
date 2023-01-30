"""
Instructions:

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 pd_sync.py
"""
import json
import os
from datetime import datetime, timedelta
from pprint import pprint

import requests
from convex.values import ConvexValue
from dotenv import load_dotenv
from pdpyras import APISession, PDClientError

from convex import ConvexClient

load_dotenv()

PRIMARY_SCHEDULE = "PE2BZLJ"
SECONDARY_SCHEDULE = "P8M5WT3"

DEV_PROXY = "http://localhost:8187"
PROD = json.load(open("convex.json"))["prodUrl"]
CONVEX_URL = PROD if os.getenv("PROD") else DEV_PROXY

pd_api_key = os.environ["PD_API_KEY"]
pd_session = APISession(pd_api_key, default_from="oncall_app@convex.dev")
convex_client = ConvexClient(CONVEX_URL)
convex_client.set_debug(True)
sync_key = os.environ["SYNC_KEY"]

# Sync all the members of the rotation
try:
    # Get all users from pagerduty
    users = pd_session.jget(f"/users")["users"]

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

    convex_client.mutation("oncall:updateOncallMembers", sync_key, users)

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
        "oncall:updateCurrentOncall", sync_key, current_primary[0], current_secondary[0]
    )
except PDClientError as e:
    print(e.response.text)
    raise

print(f"Sync From Pagerduty to {CONVEX_URL} Success")
