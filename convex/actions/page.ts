import { api } from '@pagerduty/pdjs';
import { action } from "../_generated/server";

const pd = api({token: process.env.PD_API_KEY});

export default action(async ({}, destUserId: string) => {
  // For whatever reason it auto-acks on creation+assign, so
  // create it without assigning, then assign separately
  const incident: any = await pd.post("/incidents", {
    data: {
      incident: {
          type: "incident",
          title: "Page from oncall_app",
          service: {
              id: "PAZE25R",
              type: "service_reference",
          },
      }
    },
  });
  const result = await pd.put(`/incidents/${incident.data.incident.id}`, {
    data: {
      incident: {
          type: "incident",
          assignments: [{
              assignee: {
                  id: destUserId,
                  type: "user_reference",
              },
          }],
      },
    },
  })
});
