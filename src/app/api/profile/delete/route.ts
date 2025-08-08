import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete all user-related data in the correct order (respecting foreign key constraints)
    
    // 1. Delete password reset tokens (by email since there's no userId field)
    await prisma.passwordResetToken.deleteMany({
      where: { email: session.user.email! }
    })

    // 2. Delete user preferences
    await prisma.userPreferences.deleteMany({
      where: { userId }
    })

    // 3. Delete job applications (this will cascade to related data if configured)
    await prisma.jobApplication.deleteMany({
      where: { userId }
    })

    // 4. Finally, delete the user account
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ 
      message: 'Account and all associated data have been permanently deleted' 
    }, { status: 200 })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' }, 
      { status: 500 }
    )
  }
}
