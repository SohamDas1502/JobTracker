import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create default preferences if they don't exist
    let preferences = user.preferences
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          defaultStatus: 'APPLIED',
          defaultFollowUpDays: 7
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { defaultStatus, defaultFollowUpDays } = await request.json()

    // Validate the input
    const validStatuses = ['APPLIED', 'PHONE_SCREENING', 'TECHNICAL_INTERVIEW', 'ONSITE_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']
    if (defaultStatus && !validStatuses.includes(defaultStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (defaultFollowUpDays && (defaultFollowUpDays < 1 || defaultFollowUpDays > 30)) {
      return NextResponse.json({ error: 'Follow-up days must be between 1 and 30' }, { status: 400 })
    }

    // Update or create preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        ...(defaultStatus && { defaultStatus }),
        ...(defaultFollowUpDays && { defaultFollowUpDays })
      },
      create: {
        userId: user.id,
        defaultStatus: defaultStatus || 'APPLIED',
        defaultFollowUpDays: defaultFollowUpDays || 7
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' }, 
      { status: 500 }
    )
  }
}
