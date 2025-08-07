import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user statistics
    const [totalApplications, activeReminders, user] = await Promise.all([
      // Total applications count
      prisma.jobApplication.count({
        where: { userId: session.user.id },
      }),
      
      // Active reminders count  
      prisma.reminder.count({
        where: {
          jobApplication: { userId: session.user.id },
          isCompleted: false,
          remindAt: {
            gte: new Date(), // Future reminders only
          },
        },
      }),
      
      // User creation date for days active calculation
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { createdAt: true },
      }),
    ])

    // Calculate days active (days since account creation)
    const daysActive = user?.createdAt 
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return NextResponse.json({
      totalApplications,
      activeReminders,
      daysActive,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
