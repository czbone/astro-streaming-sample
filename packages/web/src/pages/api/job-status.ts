import { videoQueue } from '@nexstream/shared'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }) => {
  const jobId = url.searchParams.get('jobId')

  if (!jobId) {
    return new Response(JSON.stringify({ error: 'jobId required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const job = await videoQueue.getJob(jobId)

    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const state = await job.getState()
    const progress = job.progress

    return new Response(
      JSON.stringify({
        jobId: job.id,
        state, // 'waiting', 'active', 'completed', 'failed'
        progress,
        data: job.data
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Job status error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
