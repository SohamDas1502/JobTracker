import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  status: z.enum(['APPLIED', 'PHONE_SCREENING', 'TECHNICAL_INTERVIEW', 'ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
  workLocation: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        documents: true,
        events: {
          orderBy: { eventDate: 'desc' },
        },
        reminders: {
          orderBy: { remindAt: 'asc' },
        },
      },
    })

    if (!jobApplication) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(jobApplication)
  } catch (error) {
    console.error('Error fetching job application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateJobSchema.parse(body)

    // Check if job application exists and belongs to user
    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }

    // Check if status changed to create an event
    const statusChanged = data.status && data.status !== existingJob.status

    const jobApplication = await prisma.jobApplication.update({
      where: { id: id },
      data: {
        ...data,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        documents: true,
        events: {
          orderBy: { eventDate: 'desc' },
        },
        reminders: {
          orderBy: { remindAt: 'asc' },
        },
      },
    })

    // Create status change event if status changed
    if (statusChanged) {
      await prisma.applicationEvent.create({
        data: {
          jobApplicationId: id,
          title: `Status Changed to ${data.status}`,
          description: `Application status updated to ${data.status?.replace('_', ' ')}`,
          eventDate: new Date(),
          eventType: 'status_change',
        },
      })
    }

    return NextResponse.json(jobApplication)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating job application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if job application exists and belongs to user
    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }

    await prisma.jobApplication.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Job application deleted successfully' })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
