import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');

    // Owner sees all tasks, admin/manager sees their clinic tasks, others see assigned to them
    let where: any = {};
    if (authResult.user.role === 'super_admin') {
      if (clinicId) where.clinicId = clinicId;
    } else if (authResult.user.role === 'admin') {
      where.clinicId = authResult.currentClinicId || authResult.user.clinicId;
    } else {
      where.assigneeId = authResult.user.id;
    }

    if (status) where.status = status;

    const tasks = await db.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, fullName: true, role: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
        clinic: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // Only super_admin (owner) and admin can create tasks
    if (authResult.user.role !== 'super_admin' && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بإنشاء مهام' }, { status: 403 });
    }

    const data = await request.json();

    // Determine clinic - owner can assign to any, admin only to their own
    let clinicId: string;
    if (authResult.user.role === 'super_admin') {
      clinicId = data.clinicId;
      if (!clinicId) return NextResponse.json({ error: 'حدد العيادة' }, { status: 400 });
    } else {
      clinicId = authResult.currentClinicId || authResult.user.clinicId!;
      // Admin can only create tasks in their own clinic
      if (data.clinicId && data.clinicId !== clinicId) {
        return NextResponse.json({ error: 'لا يمكنك إنشاء مهام في عيادة أخرى' }, { status: 403 });
      }
    }

    // If assignee specified, verify they belong to the same clinic
    if (data.assigneeId) {
      const assignee = await db.user.findUnique({ where: { id: data.assigneeId } });
      if (!assignee || assignee.clinicId !== clinicId) {
        return NextResponse.json({ error: 'المستخدم المحدد لا ينتمي لهذه العيادة' }, { status: 400 });
      }
    }

    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        rank: data.rank || 'general',
        dueDate: data.dueDate,
        clinicId,
        assigneeId: data.assigneeId || null,
        createdById: authResult.user.id,
      },
      include: {
        assignee: { select: { id: true, fullName: true, role: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
        clinic: { select: { id: true, name: true } },
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'task_created',
        details: `تم إنشاء مهمة: ${data.title} في العيادة ${task.clinic.name}`,
        userName: authResult.user.fullName,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();

    const existingTask = await db.task.findUnique({ where: { id: data.id } });
    if (!existingTask) return NextResponse.json({ error: 'المهمة غير موجودة' }, { status: 404 });

    // Admin can only update tasks in their clinic
    if (authResult.user.role === 'admin') {
      const myClinicId = authResult.currentClinicId || authResult.user.clinicId;
      if (existingTask.clinicId !== myClinicId) {
        return NextResponse.json({ error: 'لا يمكنك تعديل مهام عيادة أخرى' }, { status: 403 });
      }
    }

    // Non-admin users can only update status of tasks assigned to them
    if (authResult.user.role !== 'super_admin' && authResult.user.role !== 'admin') {
      if (existingTask.assigneeId !== authResult.user.id) {
        return NextResponse.json({ error: 'يمكنك فقط تحديث حالة المهام المسندة إليك' }, { status: 403 });
      }
      // They can only change the status
      const task = await db.task.update({
        where: { id: data.id },
        data: { status: data.status },
      });
      return NextResponse.json(task);
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;

    const task = await db.task.update({
      where: { id: data.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, fullName: true, role: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
        clinic: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    if (authResult.user.role !== 'super_admin' && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بحذف المهام' }, { status: 403 });
    }

    const { id } = await request.json();

    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ error: 'المهمة غير موجودة' }, { status: 404 });

    // Admin can only delete tasks in their clinic
    if (authResult.user.role === 'admin') {
      const myClinicId = authResult.currentClinicId || authResult.user.clinicId;
      if (existingTask.clinicId !== myClinicId) {
        return NextResponse.json({ error: 'لا يمكنك حذف مهام عيادة أخرى' }, { status: 403 });
      }
    }

    await db.task.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف المهمة' });
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
