import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { hashPassword } from '@/lib/security';

export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult || (authResult.user.role !== 'admin' && authResult.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Admin can only see users in their own clinic
    const clinicId = authResult.user.role === 'super_admin' ? undefined : authResult.user.clinicId;

    const users = await db.user.findMany({
      where: { clinicId },
      select: {
        id: true, username: true, fullName: true, role: true,
        phone: true, email: true, clinicId: true, permissions: true,
        isActive: true, twoFactorEnabled: true, securityLevel: true,
        lastLogin: true, lastPasswordChange: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || (authResult.user.role !== 'admin' && authResult.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const data = await request.json();
    
    // Admin can only add users to their own clinic
    let clinicId: string | null;
    if (authResult.user.role === 'super_admin') {
      clinicId = data.clinicId || null;
    } else {
      clinicId = authResult.user.clinicId || null;
      // Admin cannot assign super_admin role
      if (data.role === 'super_admin') {
        return NextResponse.json({ error: 'لا يمكنك تعيين دور المالك' }, { status: 403 });
      }
      // Admin cannot add users to other clinics
      if (data.clinicId && data.clinicId !== authResult.user.clinicId) {
        return NextResponse.json({ error: 'لا يمكنك إضافة مستخدمين لعيادة أخرى' }, { status: 403 });
      }
    }

    if (!data.password) {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await db.user.create({
      data: {
        username: data.username,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'reception',
        phone: data.phone,
        email: data.email,
        clinicId,
        permissions: data.permissions ? JSON.stringify(data.permissions) : null,
        isActive: true,
        lastPasswordChange: new Date(),
      },
    });

    // Security log
    await db.securityLog.create({
      data: {
        userId: authResult.user.id,
        action: 'user_created',
        severity: 'info',
        details: `تم إنشاء مستخدم جديد: ${data.username} بدور ${data.role} في العيادة`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('User POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();

    // Get the target user to check permissions
    const targetUser = await db.user.findUnique({ where: { id: data.id } });
    if (!targetUser) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    // Admin can only edit users in their own clinic
    if (authResult.user.role === 'admin') {
      if (targetUser.clinicId !== authResult.user.clinicId) {
        return NextResponse.json({ error: 'لا يمكنك تعديل مستخدم من عيادة أخرى' }, { status: 403 });
      }
      // Admin cannot change role to super_admin
      if (data.role === 'super_admin') {
        return NextResponse.json({ error: 'لا يمكنك تعيين دور المالك' }, { status: 403 });
      }
      // Admin cannot edit super_admin users
      if (targetUser.role === 'super_admin') {
        return NextResponse.json({ error: 'لا يمكنك تعديل بيانات المالك' }, { status: 403 });
      }
    }

    const updateData: any = {
      fullName: data.fullName, role: data.role, phone: data.phone,
      email: data.email, isActive: data.isActive,
    };

    if (data.permissions) updateData.permissions = JSON.stringify(data.permissions);
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
      updateData.lastPasswordChange = new Date();
    }

    const updatedUser = await db.user.update({ where: { id: data.id }, data: updateData });

    // Security log
    await db.securityLog.create({
      data: {
        userId: authResult.user.id,
        action: 'user_updated',
        severity: 'info',
        details: `تم تحديث مستخدم: ${data.username || data.id} - الدور: ${data.role || targetUser.role}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
