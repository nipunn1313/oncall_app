import os
from convex import ConvexClient
from convex.values import ConvexValue
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pdpyras import APISession

load_dotenv()

PRIMARY_SCHEDULE = "PE2BZLJ"

DEV_PROXY = 'http://localhost:8187'

api_key = os.environ['PD_API_KEY']
pd_session = APISession(api_key, default_from="oncall_app@convex.dev")
convex_client = ConvexClient(DEV_PROXY)
convex_client.set_debug(True)

# Sync all the members of the rotation
sched = pd_session.jget(f"/schedules/{PRIMARY_SCHEDULE}")["schedule"]
user_ids = [user["id"] for user in sched["users"]]
oncallMembers = [pd_session.jget(f"/users/{uid}")["user"] for uid in user_ids]
convex_client.mutation("oncall:updateOncallMembers", oncallMembers)

# Sync the current oncall
now = datetime.now()
current_oncalls = pd_session.jget(f"/schedules/{PRIMARY_SCHEDULE}/users", data={'since': now, 'until': now + timedelta.resolution})['users']
assert len(current_oncalls) == 1
current_oncall = current_oncalls[0]
convex_client.mutation("oncall:updateCurrentOncall", current_oncall)
