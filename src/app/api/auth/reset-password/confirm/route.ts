import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true }
    })

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' }, 
      { status: 500 }
    )
  }
}
