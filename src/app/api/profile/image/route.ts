import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `${randomUUID()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, which is fine
    }

    // Save file to disk
    const filepath = join(uploadsDir, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Generate public URL
    const imageUrl = `/uploads/profiles/${filename}`

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    })

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove image from user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    })

    return NextResponse.json({ message: 'Profile image removed' })
  } catch (error) {
    console.error('Error removing profile image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
