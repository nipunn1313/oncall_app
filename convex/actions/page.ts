import { api } from '@pagerduty/pdjs';
import { action } from "../_generated/server";

const pd = api({token: process.env.PD_API_KEY});

export default action(async ({}, destUserId: string): Promise<string> => {
  // For whatever reason it auto-acks on creation+assign, so
  // create it without assigning, then assign separately
  let incident: any = await pd.post("/incidents", {
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
  const result: any = await pd.put(`/incidents/${incident.data.incident.id}`, {
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
  incident = result.data.incident;
  const assignee = incident.assignments[0].assignee.summary;

  console.log(`Paged ${assignee} at ${incident.html_url}`);
  return incident.html_url;
});
