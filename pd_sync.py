"""
Instructions:

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 pd_sync.py
"""
import json
import os
import requests
from pprint import pprint
from convex import ConvexClient
from convex.values import ConvexValue
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pdpyras import APISession, PDClientError

load_dotenv()

PRIMARY_SCHEDULE = "PE2BZLJ"

DEV_PROXY = "http://localhost:8187"
PROD = json.load(open("convex.json"))["prodUrl"]
CONVEX_URL = PROD if os.getenv("PROD") else DEV_PROXY

r = requests.post(
    url="https://dev-6nkf1fvj.us.auth0.com/oauth/token",
    json={
        "client_id": "ggwCKUkxxiQtdLMP9Q6Z2DQXSavPd9xc",
        "client_secret": os.environ["AUTH0_CLIENT_SECRET"],
        "audience": "https://convex-oncall-app",
        "grant_type": "client_credentials",
    },
)
r.raise_for_status()
auth0_result = r.json()
assert auth0_result["token_type"] == "Bearer"
token = auth0_result["access_token"]

api_key = os.environ["PD_API_KEY"]
pd_session = APISession(api_key, default_from="oncall_app@convex.dev")
convex_client = ConvexClient(CONVEX_URL)
convex_client.set_debug(True)
convex_client.set_auth(token)

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

    convex_client.mutation("oncall:updateOncallMembers", users)

    # Sync the current oncall
    current_oncall = pd_session.jget(
        f"/schedules/{PRIMARY_SCHEDULE}/users",
        data={"since": now, "until": now + timedelta.resolution},
    )["users"]
    assert len(current_oncall) == 1
    convex_client.mutation("oncall:updateCurrentOncall", current_oncall[0])
except PDClientError as e:
    print(e.response.text)
    raise

print(f"Sync From Pagerduty to {CONVEX_URL} Success")
