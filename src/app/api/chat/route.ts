import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getCurrentUser() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  const session = await prisma.session.findFirst({
    where: { tokenHash: token, isRevoked: false, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  return session?.user || null;
}

// GET — Fetch conversations or messages
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get('with');
  const mode = searchParams.get('mode'); // 'conversations' or 'messages'

  if (mode === 'conversations' || !withUserId) {
    // Get all conversations for this user
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const convMap = new Map<string, any>();
    for (const msg of messages) {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      // Count unread where user is receiver and message is unread
      if (msg.receiverId === user.id && !msg.isRead) {
        const entry = convMap.get(partnerId);
        if (entry) entry.unreadCount++;
      }
    }

    // For super_admin: also get list of users they can chat with
    let allUsers: any[] = [];
    if (user.role === 'super_admin') {
      const users = await prisma.user.findMany({
        where: { id: { not: user.id }, isActive: true },
        select: { id: true, fullName: true, role: true, clinicId: true },
        orderBy: { fullName: 'asc' },
      });
      allUsers = users;
    }

    return NextResponse.json({
      conversations: Array.from(convMap.values()),
      allUsers,
      currentUserId: user.id,
      currentUserRole: user.role,
    });
  }

  // Get messages with specific user
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: withUserId },
        { senderId: withUserId, receiverId: user.id },
      ],
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
      receiver: { select: { id: true, fullName: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark unread messages as read
  await prisma.chatMessage.updateMany({
    where: {
      senderId: withUserId,
      receiverId: user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ messages, currentUserId: user.id, currentUserRole: user.role });
}

// POST — Send a message
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const { receiverId, message } = body;

  if (!receiverId || !message?.trim()) {
    return NextResponse.json({ error: 'البيانات مفقودة' }, { status: 400 });
  }

  // Only super_admin can reply; others can only send to super_admin
  if (user.role !== 'super_admin') {
    // Non-admin user: verify receiver is a super_admin
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver || receiver.role !== 'super_admin') {
      return NextResponse.json({ error: 'يمكنك التواصل مع المالك فقط' }, { status: 403 });
    }
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      senderId: user.id,
      receiverId,
      message: message.trim(),
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
      receiver: { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json(chatMessage);
}
