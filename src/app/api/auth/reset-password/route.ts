import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Create nodemailer transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use a service like Ethereal Email for testing
  // For production, use a real email service like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires
      }
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Send email
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@jobtracker.com',
      to: email,
      subject: 'Reset Your Password - JobTracker',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p>You requested a password reset for your JobTracker account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json(
      { error: 'Failed to send reset email' }, 
      { status: 500 }
    )
  }
}
