import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createJobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
  workLocation: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  status: z.enum(['APPLIED', 'PHONE_SCREENING', 'TECHNICAL_INTERVIEW', 'ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  appliedDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  followUpReminder: z.string().datetime().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const jobType = searchParams.get('jobType')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'appliedDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }
    if (jobType) {
      where.jobType = jobType
    }
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobApplications = await prisma.jobApplication.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        documents: true,
        events: {
          orderBy: { eventDate: 'desc' },
          take: 1,
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { remindAt: 'asc' },
        },
      },
    })

    return NextResponse.json(jobApplications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createJobSchema.parse(body)

    // Extract followUpReminder from data as it's not part of the JobApplication model
    const { followUpReminder, ...jobData } = data

    const jobApplication = await prisma.jobApplication.create({
      data: {
        ...jobData,
        userId: session.user.id,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status || 'APPLIED',
      },
      include: {
        documents: true,
        events: true,
        reminders: true,
      },
    })

    // Create initial event
    await prisma.applicationEvent.create({
      data: {
        jobApplicationId: jobApplication.id,
        title: 'Application Created',
        description: `Applied to ${data.position} at ${data.company}`,
        eventDate: jobApplication.appliedDate,
        eventType: 'status_change',
      },
    })

    // Create follow-up reminder if provided
    if (followUpReminder) {
      await prisma.reminder.create({
        data: {
          jobApplicationId: jobApplication.id,
          title: `${jobApplication.position} application`,
          description: null, // Remove verbose description
          remindAt: new Date(followUpReminder),
          reminderType: 'follow_up',
        },
      })
    }

    return NextResponse.json(jobApplication, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating job application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
