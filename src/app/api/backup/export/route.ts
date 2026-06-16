import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// POST /api/backup/export
// Owner-only: export all clinic data as a downloadable JSON file.
// This is a manual backup trigger — the owner can call it any time
// to download a snapshot of the current state.
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - يتطلب صلاحية المالك' }, { status: 403 });
    }

    // Export everything except sensitive auth fields (passwordHash, tokens, etc.)
    const [
      clinics, users, patients, appointments, invoices,
      inventoryItems, tasks, medicalRecords, subscriptionPlans,
      clinicSubscriptions, offers, auditLogs, securityConfigs,
    ] = await Promise.all([
      db.clinic.findMany(),
      db.user.findMany({
        select: {
          id: true, username: true, fullName: true, role: true,
          phone: true, email: true, clinicId: true, isActive: true,
          twoFactorEnabled: true, lastLogin: true, createdAt: true, updatedAt: true,
          // NOTE: passwordHash, passwordPlain, twoFactorSecret, encryptionPrivateKey
          // are intentionally excluded.
        },
      }),
      db.patient.findMany(),
      db.appointment.findMany(),
      db.invoice.findMany(),
      db.inventoryItem.findMany(),
      db.task.findMany(),
      db.medicalRecord.findMany(),
      db.subscriptionPlan.findMany(),
      db.clinicSubscription.findMany(),
      db.offer.findMany(),
      db.auditLog.findMany({ take: 1000, orderBy: { createdAt: 'desc' } }),
      db.securityConfig.findMany(),
    ]);

    const backup = {
      _meta: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: authResult.user.username,
        clinicCount: clinics.length,
        patientCount: patients.length,
        appointmentCount: appointments.length,
        invoiceCount: invoices.length,
      },
      clinics,
      users,
      patients,
      appointments,
      invoices,
      inventoryItems,
      tasks,
      medicalRecords,
      subscriptionPlans,
      clinicSubscriptions,
      offers,
      auditLogs,
      securityConfigs,
    };

    const filename = `clinic-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      { error: 'فشل تصدير النسخة الاحتياطية', details: String(error) },
      { status: 500 }
    );
  }
}
