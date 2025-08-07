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

    // Get overall statistics
    const totalApplications = await prisma.jobApplication.count({
      where: { userId: session.user.id },
    })

    const statusCounts = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId: session.user.id },
      _count: { status: true },
    })

    const priorityCounts = await prisma.jobApplication.groupBy({
      by: ['priority'],
      where: { userId: session.user.id },
      _count: { priority: true },
    })

    // Get applications by month for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const applicationsByMonth = await prisma.jobApplication.findMany({
      where: {
        userId: session.user.id,
        appliedDate: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        appliedDate: true,
        status: true,
      },
    })

    // Group by month
    const monthlyData = applicationsByMonth.reduce((acc: Record<string, { total: number; offers: number; rejections: number }>, app: { appliedDate: Date; status: string }) => {
      const month = app.appliedDate.toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { total: 0, offers: 0, rejections: 0 }
      }
      acc[month].total++
      if (app.status === 'OFFER') acc[month].offers++
      if (app.status === 'REJECTED') acc[month].rejections++
      return acc
    }, {} as Record<string, { total: number; offers: number; rejections: number }>)

    // Get recent applications
    const recentApplications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { appliedDate: 'desc' },
      take: 5,
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        appliedDate: true,
      },
    })

    // Get upcoming reminders (including today's reminders)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        jobApplication: { userId: session.user.id },
        isCompleted: false,
        remindAt: {
          gte: today, // Include reminders from start of today
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      orderBy: { remindAt: 'asc' },
      take: 5,
      include: {
        jobApplication: {
          select: {
            company: true,
            position: true,
            deadline: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalApplications,
      statusCounts: statusCounts.reduce((acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      priorityCounts: priorityCounts.reduce((acc: Record<string, number>, item: { priority: string; _count: { priority: number } }) => {
        acc[item.priority] = item._count.priority
        return acc
      }, {} as Record<string, number>),
      monthlyData,
      recentApplications,
      upcomingReminders,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
