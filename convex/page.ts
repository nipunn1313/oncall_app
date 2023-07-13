'use node'
import { api } from '@pagerduty/pdjs'
import { action } from './_generated/server'

const pd = api({ token: process.env.PD_API_KEY })

export default action(
  async (
    _ctx,
    args: { destUserId: string; from: string; message: string | null }
  ): Promise<string> => {
    if (!process.env.CONVEX_CLOUD_URL!.includes('abnormal-wren-792')) {
      const error = `Would have paged ${args.destUserId} with message: ${args.message}`
      console.log(error)
      return error
    }
    // For whatever reason it auto-acks on creation+assign, so
    // create it without assigning, then assign separately
    let incident: any = await pd.post('/incidents', {
      data: {
        incident: {
          type: 'incident',
          title: `Page from ${args.from} via oncall_app`,
          service: {
            id: 'PAZE25R',
            type: 'service_reference',
          },
        },
      },
    })
    const result: any = await pd.put(
      `/incidents/${incident.data.incident.id}`,
      {
        data: {
          incident: {
            type: 'incident',
            assignments: [
              {
                assignee: {
                  id: args.destUserId,
                  type: 'user_reference',
                },
              },
            ],
          },
        },
      }
    )
    incident = result.data.incident
    const assignee = incident.assignments[0].assignee.summary

    console.log(`Paged ${assignee} at ${incident.html_url}`)
    return incident.html_url
  }
)
