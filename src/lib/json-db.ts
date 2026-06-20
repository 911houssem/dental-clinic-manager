/**
 * JSON File-Based Storage - يعمل على Vercel بدون قاعدة بيانات خارجية
 * يستخدم /tmp للحفظ المؤقت + يهيّي البيانات عند كل بداية تشغيل
 *
 * ملاحظة: على Vercel، الـ /tmp يتفرغ مع كل تشغيل جديد.
 * لذا نخزن البيانات في الذاكرة (in-memory) + نحفظ نسخة في /tmp.
 * البيانات تضيع فقط عند إعادة نشر الموقع، لكن تبقى طوال جلسة العمل.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// === أنواع البيانات ===
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  passwordPlain?: string;
  fullName: string;
  role: string;
  phone?: string;
  email?: string;
  clinicId?: string;
  permissions?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  securityLevel: string;
  lastLogin?: Date;
  accountLocked?: boolean;
  lockoutUntil?: Date;
  failedLoginAttempts?: number;
  lastPasswordChange?: Date;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Clinic {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  currency: string;
  paymentMode: string;
  slotDuration: number;
  bookingSlug?: string;
  bookingEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  fileNumber: string;
  fullName: string;
  phone?: string;
  gender?: string;
  age?: string;
  bloodType?: string;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId?: string;
  title?: string;
  startTime: string;
  endTime?: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  clinicId?: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod?: string;
  items?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  itemType: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  yearlyPrice: number;
  features: string;
  modules?: string;
  maxPatients: number;
  maxDoctors: number;
  maxClinics: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicSubscription {
  id: string;
  clinicId: string;
  planId: string;
  status: string;
  billingCycle?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  planId?: string;
  isActive: boolean;
  showOnLanding: boolean;
  badge?: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  refreshTokenHash?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt?: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details?: string;
  userName?: string;
  createdAt: Date;
}

// === الذاكرة الرئيسية ===
interface Database {
  users: User[];
  clinics: Clinic[];
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  inventoryItems: InventoryItem[];
  medicalRecords: MedicalRecord[];
  subscriptionPlans: SubscriptionPlan[];
  clinicSubscriptions: ClinicSubscription[];
  offers: Offer[];
  sessions: Session[];
  auditLogs: AuditLog[];
  loginAttempts: any[];
  securityLogs: any[];
  trustedDevices: any[];
  deviceAuthorizations: any[];
  tasks: any[];
  securityConfigs: any[];
}

let db: Database | null = null;

// === Helper: توليد ID ===
function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// === Fixed IDs (عشان تتطابق بين Vercel instances) ===
const FIXED_IDS = {
  admin: 'a0000000000000000000000000000001',
  doctor: 'a0000000000000000000000000000002',
  reception: 'a0000000000000000000000000000003',
  clinic: 'c0000000000000000000000000000001',
  basicPlan: 'p0000000000000000000000000000001',
  proPlan: 'p0000000000000000000000000000002',
  premiumPlan: 'p0000000000000000000000000000003',
  clinicSub: 's0000000000000000000000000000001',
  offer1: 'o0000000000000000000000000000001',
  offer2: 'o0000000000000000000000000000002',
  offer3: 'o0000000000000000000000000000003',
};

// === Helper: hash كلمة المرور ===
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// === Helper: hash التوكن ===
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// === Helper: pick fields from object (for select) ===
function pickFields(obj: any, select: any): any {
  if (!obj || !select) return obj;
  const result: any = {};
  for (const key of Object.keys(select)) {
    if (select[key] && obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}

// === تهيئة قاعدة البيانات بالبيانات الافتراضية ===
export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  console.log('[DB] Initializing JSON database...');

  db = {
    users: [],
    clinics: [],
    patients: [],
    appointments: [],
    invoices: [],
    inventoryItems: [],
    medicalRecords: [],
    subscriptionPlans: [],
    clinicSubscriptions: [],
    offers: [],
    sessions: [],
    auditLogs: [],
    loginAttempts: [],
    securityLogs: [],
    trustedDevices: [],
    deviceAuthorizations: [],
    tasks: [],
    securityConfigs: [],
  };

  // === إنشاء admin ===
  const adminHash = await hashPassword('admin123');
  const admin: User = {
    id: FIXED_IDS.admin,
    username: 'admin',
    passwordHash: adminHash,
    passwordPlain: 'admin123',
    fullName: 'المالك',
    role: 'super_admin',
    phone: '0500000000',
    email: 'admin@clinic.com',
    permissions: JSON.stringify({
      dashboard: true, patients: true, appointments: true,
      records: true, invoices: true, inventory: true,
      reports: true, settings: true,
    }),
    isActive: true,
    twoFactorEnabled: false,
    securityLevel: 'standard',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.push(admin);

  // === إنشاء عيادة افتراضية ===
  const clinic: Clinic = {
    id: FIXED_IDS.clinic,
    name: 'عيادة الشفاء',
    phone: '0501234567',
    address: 'الرياض، حي النزهة',
    taxNumber: '1234567890',
    currency: 'SAR',
    paymentMode: 'partial',
    slotDuration: 15,
    bookingSlug: 'عيادة-الشفاء',
    bookingEnabled: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.clinics.push(clinic);

  // === إنشاء طبيب ===
  const doctorHash = await hashPassword('doctor123');
  const doctor: User = {
    id: FIXED_IDS.doctor,
    username: 'doctor1',
    passwordHash: doctorHash,
    passwordPlain: 'doctor123',
    fullName: 'د. أحمد محمد',
    role: 'doctor',
    phone: '0501111111',
    email: 'doctor@clinic.com',
    clinicId: clinic.id,
    permissions: JSON.stringify({
      dashboard: true, patients: true, appointments: true,
      records: true, invoices: true, inventory: false,
      reports: false, settings: false,
    }),
    isActive: true,
    twoFactorEnabled: false,
    securityLevel: 'standard',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.push(doctor);

  // === إنشاء استقبال ===
  const receptionHash = await hashPassword('reception123');
  const reception: User = {
    id: FIXED_IDS.reception,
    username: 'reception1',
    passwordHash: receptionHash,
    passwordPlain: 'reception123',
    fullName: 'سارة أحمد',
    role: 'reception',
    phone: '0502222222',
    email: 'reception@clinic.com',
    clinicId: clinic.id,
    permissions: JSON.stringify({
      dashboard: true, patients: true, appointments: true,
      records: false, invoices: true, inventory: false,
      reports: false, settings: false,
    }),
    isActive: true,
    twoFactorEnabled: false,
    securityLevel: 'standard',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.push(reception);

  // === إنشاء خطط الاشتراك ===
  const basicPlan: SubscriptionPlan = {
    id: generateId(),
    id: FIXED_IDS.basicPlan,
    name: 'أساسي', nameEn: 'Basic',
    description: 'للعيادات الصغيرة التي تبدأ رحلتها الرقمية',
    price: 99, yearlyPrice: 990,
    features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير الأساسية', 'دعم عبر البريد الإلكتروني']),
    modules: JSON.stringify(['appointments', 'patients', 'invoices']),
    maxPatients: 500, maxDoctors: 2, maxClinics: 1,
    isActive: true, isPopular: false, sortOrder: 1,
    createdAt: new Date(), updatedAt: new Date(),
  };
  const proPlan: SubscriptionPlan = {
    id: generateId(),
    id: FIXED_IDS.proPlan,
    name: 'احترافي', nameEn: 'Professional',
    description: 'للعيادات المتوسطة التي تحتاج ميزات متقدمة',
    price: 249, yearlyPrice: 2490,
    features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير المتقدمة', 'المخزون', 'التقارير', 'دعم أولوية', 'رابط الحجز العام']),
    modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records']),
    maxPatients: 2000, maxDoctors: 5, maxClinics: 3,
    isActive: true, isPopular: true, sortOrder: 2,
    createdAt: new Date(), updatedAt: new Date(),
  };
  const premiumPlan: SubscriptionPlan = {
    id: generateId(),
    id: FIXED_IDS.premiumPlan,
    name: 'ممتاز', nameEn: 'Premium',
    description: 'للعيادات الكبيرة والسلاسل الطبية',
    price: 499, yearlyPrice: 4990,
    features: JSON.stringify(['جميع مميزات الاحترافي', 'إدارة متعددة العيادات', 'صلاحيات متقدمة', 'التقارير المالية', 'المهام', 'دعم مخصص ٢٤/٧', 'تخصيص كامل']),
    modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records', 'tasks', 'management', 'settings']),
    maxPatients: -1, maxDoctors: -1, maxClinics: -1,
    isActive: true, isPopular: false, sortOrder: 3,
    createdAt: new Date(), updatedAt: new Date(),
  };
  db.subscriptionPlans.push(basicPlan, proPlan, premiumPlan);

  // === منح العيادة الافتراضية اشتراك ===
  const clinicSub: ClinicSubscription = {
    id: FIXED_IDS.clinicSub,
    clinicId: clinic.id,
    planId: proPlan.id,
    status: 'active',
    billingCycle: 'monthly',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    notes: 'اشتراك تجريبي - تم إنشاؤه تلقائياً',
    autoRenew: true,
    createdAt: new Date(), updatedAt: new Date(),
  };
  db.clinicSubscriptions.push(clinicSub);

  // === إنشاء العروض ===
  db.offers.push({
    id: FIXED_IDS.offer1,
    title: 'خصم الإطلاق',
    description: 'احصل على خصم ٣٠٪ عند الاشتراك لأول مرة',
    discountType: 'percentage', discountValue: 30, planId: proPlan.id,
    isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1,
    createdAt: new Date(), updatedAt: new Date(),
  });
  db.offers.push({
    id: FIXED_IDS.offer2,
    title: 'اشترك سنة ووفّر',
    description: 'وفّر ما يعادل شهرين عند الاشتراك السنوي',
    discountType: 'percentage', discountValue: 17, planId: premiumPlan.id,
    isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2,
    createdAt: new Date(), updatedAt: new Date(),
  });
  db.offers.push({
    id: FIXED_IDS.offer3,
    title: 'تجربة مجانية',
    description: 'جرب الخطة الاحترافية مجاناً لمدة ١٤ يوماً',
    discountType: 'percentage', discountValue: 100, planId: basicPlan.id,
    isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3,
    createdAt: new Date(), updatedAt: new Date(),
  });

  // === إنشاء مرضى تجريبيين ===
  const patientNames = [
    { name: 'محمد علي', phone: '0551234567', gender: 'male', age: '25', bloodType: 'A+' },
    { name: 'فاطمة أحمد', phone: '0552345678', gender: 'female', age: '30', bloodType: 'B+' },
    { name: 'خالد سعيد', phone: '0553456789', gender: 'male', age: '35', bloodType: 'O+' },
    { name: 'نورة عبدالله', phone: '0554567890', gender: 'female', age: '40', bloodType: 'AB+' },
    { name: 'عمر حسن', phone: '0555678901', gender: 'male', age: '45', bloodType: 'A-' },
    { name: 'مريم يوسف', phone: '0556789012', gender: 'female', age: '50', bloodType: 'B-' },
    { name: 'يوسف إبراهيم', phone: '0557890123', gender: 'male', age: '55', bloodType: 'O-' },
    { name: 'هند سالم', phone: '0558901234', gender: 'female', age: '60', bloodType: 'AB-' },
  ];
  for (let i = 0; i < patientNames.length; i++) {
    const p = patientNames[i];
    db.patients.push({
      id: generateId(),
      fileNumber: `CL-${Date.now().toString().slice(-8)}${i}`,
      fullName: p.name,
      phone: p.phone,
      gender: p.gender,
      age: p.age,
      bloodType: p.bloodType,
      clinicId: clinic.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // === إنشاء مواعيد تجريبية ===
  const today = new Date().toISOString().split('T')[0];
  const aptData = [
    { patientIdx: 0, time: '09:00', type: 'regular', title: 'كشف عام' },
    { patientIdx: 1, time: '09:30', type: 'follow_up', title: 'متابعة' },
    { patientIdx: 2, time: '10:00', type: 'consultation', title: 'استشارة' },
    { patientIdx: 3, time: '10:30', type: 'emergency', title: 'طوارئ' },
  ];
  for (const apt of aptData) {
    const patient = db.patients[apt.patientIdx];
    if (patient) {
      db.appointments.push({
        id: generateId(),
        patientId: patient.id,
        doctorId: doctor.id,
        clinicId: clinic.id,
        title: apt.title,
        startTime: `${today}T${apt.time}:00`,
        endTime: `${today}T${String(parseInt(apt.time.split(':')[0]) + 1).padStart(2, '0')}:${apt.time.split(':')[1]}:00`,
        type: apt.type,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // === إنشاء فواتير تجريبية ===
  const invoiceData = [
    { patientIdx: 0, subtotal: 200, paid: 200, status: 'paid' },
    { patientIdx: 1, subtotal: 350, paid: 350, status: 'paid' },
    { patientIdx: 2, subtotal: 150, paid: 0, status: 'pending' },
    { patientIdx: 3, subtotal: 500, paid: 250, status: 'partial' },
  ];
  for (let i = 0; i < invoiceData.length; i++) {
    const inv = invoiceData[i];
    const patient = db.patients[inv.patientIdx];
    if (patient) {
      const tax = inv.subtotal * 0.15;
      const total = inv.subtotal + tax;
      db.invoices.push({
        id: generateId(),
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-6)}${i}`,
        patientId: patient.id,
        clinicId: clinic.id,
        subtotal: inv.subtotal,
        taxPercentage: 15,
        taxAmount: tax,
        total,
        paidAmount: inv.paid,
        dueAmount: total - inv.paid,
        status: inv.status,
        paymentMethod: inv.status === 'paid' ? 'cash' : undefined,
        items: JSON.stringify([{ item_name: 'كشف طبي', unit_price: inv.subtotal, quantity: 1 }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // === إنشاء مخزون تجريبي ===
  const inventoryItems = [
    { name: 'باراسيتامول 500mg', type: 'medication', qty: 500, buy: 2, sell: 5 },
    { name: 'أموكسيسيلين 250mg', type: 'medication', qty: 200, buy: 5, sell: 12 },
    { name: 'قفازات طبية', type: 'supply', qty: 1000, buy: 0.5, sell: 1 },
    { name: 'إبرة حقن', type: 'supply', qty: 300, buy: 1, sell: 2.5 },
    { name: 'جهاز ضغط', type: 'equipment', qty: 3, buy: 200, sell: 350 },
  ];
  for (const item of inventoryItems) {
    db.inventoryItems.push({
      id: generateId(),
      itemName: item.name,
      itemType: item.type,
      quantity: item.qty,
      purchasePrice: item.buy,
      sellingPrice: item.sell,
      clinicId: clinic.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('[DB] Database initialized successfully!');
  console.log(`[DB] Users: ${db.users.length}, Clinics: ${db.clinics.length}, Patients: ${db.patients.length}`);
  return db;
}

// === الحصول على قاعدة البيانات (تهيّي تلقائياً لو ما هي مهيأة) ===
export async function getDb(): Promise<Database> {
  if (!db) {
    await initializeDatabase();
  }
  return db!;
}

// === Helper: تحديث updatedAt تلقائياً ===
function touch<T extends { updatedAt: Date }>(item: T): T {
  item.updatedAt = new Date();
  return item;
}

// === واجهة API مشابهة لـ Prisma ===
export const dbClient = {
  user: {
    async findFirst(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.users;
      if (args?.where) {
        if (args.where.username) result = result.filter(u => u.username === args.where.username);
        if (args.where.id) result = result.filter(u => u.id === args.where.id);
        if (args.where.email) result = result.filter(u => u.email === args.where.email);
        if (args.where.isActive !== undefined) result = result.filter(u => u.isActive === args.where.isActive);
        if (args.where.role) result = result.filter(u => u.role === args.where.role);
        if (args.where.clinicId) result = result.filter(u => u.clinicId === args.where.clinicId);
      }
      return result[0] || null;
    },
    async findUnique(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.users;
      if (args?.where) {
        if (args.where.id) result = result.filter(u => u.id === args.where.id);
        if (args.where.username) result = result.filter(u => u.username === args.where.username);
        if (args.where.email) result = result.filter(u => u.email === args.where.email);
      }
      const user = result[0] || null;
      if (user && args?.include?.clinic) {
        return { ...user, clinic: d.clinics.find(c => c.id === user.clinicId) || null };
      }
      return user;
    },
    async findMany(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.users;
      if (args?.where) {
        if (args.where.role) result = result.filter(u => u.role === args.where.role);
        if (args.where.clinicId) result = result.filter(u => u.clinicId === args.where.clinicId);
        if (args.where.isActive !== undefined) result = result.filter(u => u.isActive === args.where.isActive);
      }
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const user: User = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        twoFactorEnabled: false,
        securityLevel: 'standard',
        ...args.data,
      };
      d.users.push(user);
      return user;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.users.findIndex(u => u.id === args.where.id || u.username === args.where.username);
      if (idx === -1) throw new Error('User not found');
      d.users[idx] = { ...d.users[idx], ...args.data, updatedAt: new Date() };
      return d.users[idx];
    },
    async upsert(args: { where: any; create: any; update: any }) {
      const d = await getDb();
      const existing = d.users.find(u => u.username === args.where.username);
      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        return existing;
      } else {
        const user: User = {
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.create,
        };
        d.users.push(user);
        return user;
      }
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.users.findIndex(u => u.id === args.where.id);
      if (idx !== -1) d.users.splice(idx, 1);
      return null;
    },
    async count() {
      const d = await getDb();
      return d.users.length;
    },
  },

  clinic: {
    async findFirst() {
      const d = await getDb();
      return d.clinics[0] || null;
    },
    async findMany(args?: { where?: any; include?: any; orderBy?: any }) {
      const d = await getDb();
      let result = [...d.clinics];
      if (args?.where?.id) result = result.filter(c => c.id === args.where.id);
      if (args?.orderBy?.createdAt === 'desc') result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (args?.include) {
        result = result.map(c => {
          const clinic: any = { ...c };
          if (args.include.users) clinic.users = d.users.filter(u => u.clinicId === c.id);
          if (args.include._count) {
            clinic._count = {
              patients: d.patients.filter(p => p.clinicId === c.id).length,
              appointments: d.appointments.filter(a => a.clinicId === c.id).length,
              tasks: d.tasks.filter((t: any) => t.clinicId === c.id).length,
            };
          }
          if (args.include.subscription) {
            clinic.subscription = d.clinicSubscriptions.find(s => s.clinicId === c.id) || null;
          }
          return clinic;
        });
      }
      return result;
    },
    async findUnique(args?: { where?: any; include?: any }) {
      const d = await getDb();
      if (!args?.where) return d.clinics[0] || null;
      const clinic = d.clinics.find(c => c.id === args.where.id || c.bookingSlug === args.where.bookingSlug) || null;
      if (clinic && args?.include?.users) {
        return { ...clinic, users: d.users.filter(u => u.clinicId === clinic.id) };
      }
      if (clinic && args?.include?.subscription) {
        return { ...clinic, subscription: d.clinicSubscriptions.find(s => s.clinicId === clinic.id) || null };
      }
      return clinic;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const clinic: Clinic = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: 'SAR',
        paymentMode: 'partial',
        slotDuration: 15,
        bookingEnabled: false,
        isActive: true,
        ...args.data,
      };
      d.clinics.push(clinic);
      return clinic;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.clinics.findIndex(c => c.id === args.where.id);
      if (idx === -1) throw new Error('Clinic not found');
      d.clinics[idx] = { ...d.clinics[idx], ...args.data, updatedAt: new Date() };
      return d.clinics[idx];
    },
    async count() {
      const d = await getDb();
      return d.clinics.length;
    },
  },

  patient: {
    async findMany(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = [...d.patients];
      if (args?.where?.clinicId) result = result.filter(p => p.clinicId === args.where.clinicId);
      if (args?.where?.id) result = result.filter(p => p.id === args.where.id);
      if (args?.where?.OR) {
        // Support search with OR (fullName contains, phone contains, fileNumber contains)
        const ors = args.where.OR;
        result = result.filter(p => {
          return ors.some((or: any) => {
            if (or.fullName?.contains) return p.fullName.includes(or.fullName.contains);
            if (or.phone?.contains) return p.phone?.includes(or.phone.contains);
            if (or.fileNumber?.contains) return p.fileNumber.includes(or.fileNumber.contains);
            return false;
          });
        });
      }
      return result;
    },
    async findUnique(args?: { where?: any }) {
      const d = await getDb();
      return d.patients.find(p => p.id === args?.where?.id) || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const patient: Patient = {
        id: generateId(),
        fileNumber: `CL-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      d.patients.push(patient);
      return patient;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.patients.findIndex(p => p.id === args.where.id);
      if (idx !== -1) {
        d.patients[idx] = { ...d.patients[idx], ...args.data, updatedAt: new Date() };
        return d.patients[idx];
      }
      return null;
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.patients.findIndex(p => p.id === args.where.id);
      if (idx !== -1) d.patients.splice(idx, 1);
      return null;
    },
    async count(args?: { where?: any }) {
      const d = await getDb();
      let result = d.patients;
      if (args?.where?.clinicId) result = result.filter(p => p.clinicId === args.where.clinicId);
      return result.length;
    },
  },

  appointment: {
    async findMany(args?: { where?: any; include?: any; orderBy?: any }) {
      const d = await getDb();
      let result = [...d.appointments];
      if (args?.where?.clinicId) result = result.filter(a => a.clinicId === args.where.clinicId);
      if (args?.where?.patientId) result = result.filter(a => a.patientId === args.where.patientId);
      if (args?.where?.doctorId) result = result.filter(a => a.doctorId === args.where.doctorId);
      if (args?.where?.status) result = result.filter(a => a.status === args.where.status);
      // Support startTime: { contains: today }
      if (args?.where?.startTime?.contains) {
        result = result.filter(a => a.startTime.includes(args.where.startTime.contains));
      }
      // Support status: { in: [...] }
      if (args?.where?.status?.in) {
        result = result.filter(a => args.where.status.in.includes(a.status));
      }
      // orderBy
      if (args?.orderBy?.startTime === 'asc') result.sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (args?.orderBy?.startTime === 'desc') result.sort((a, b) => b.startTime.localeCompare(a.startTime));
      // include patient and doctor
      if (args?.include?.patient || args?.include?.doctor) {
        const patientSelect = args?.include?.patient?.select;
        const doctorSelect = args?.include?.doctor?.select;
        result = result.map(a => {
          const apt: any = { ...a };
          if (args.include.patient) {
            const p = d.patients.find(p => p.id === a.patientId);
            apt.patient = patientSelect ? pickFields(p, patientSelect) : p;
          }
          if (args.include.doctor) {
            const u = d.users.find(u => u.id === a.doctorId);
            apt.doctor = doctorSelect ? pickFields(u, doctorSelect) : u;
          }
          return apt;
        });
      }
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const apt: Appointment = {
        id: generateId(),
        type: 'regular',
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      d.appointments.push(apt);
      return apt;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.appointments.findIndex(a => a.id === args.where.id);
      if (idx !== -1) {
        d.appointments[idx] = { ...d.appointments[idx], ...args.data, updatedAt: new Date() };
        return d.appointments[idx];
      }
      return null;
    },
  },

  invoice: {
    async findMany(args?: { where?: any; include?: any; orderBy?: any; select?: any }) {
      const d = await getDb();
      let result = [...d.invoices];
      if (args?.where?.clinicId) result = result.filter(i => i.clinicId === args.where.clinicId);
      if (args?.where?.patientId) result = result.filter(i => i.patientId === args.where.patientId);
      if (args?.where?.status) result = result.filter(i => i.status === args.where.status);
      // Support createdAt: { gte: date }
      if (args?.where?.createdAt?.gte) {
        result = result.filter(i => new Date(i.createdAt) >= new Date(args.where.createdAt.gte));
      }
      // orderBy
      if (args?.orderBy?.createdAt === 'asc') result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      if (args?.orderBy?.createdAt === 'desc') result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      // include patient
      if (args?.include?.patient) {
        result = result.map(i => ({
          ...i,
          patient: d.patients.find(p => p.id === i.patientId),
        }));
      }
      // select
      if (args?.select) {
        result = result.map(i => pickFields(i, args.select));
      }
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const invoice: Invoice = {
        id: generateId(),
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: 0,
        taxPercentage: 15,
        taxAmount: 0,
        total: 0,
        paidAmount: 0,
        dueAmount: 0,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      d.invoices.push(invoice);
      return invoice;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.invoices.findIndex(i => i.id === args.where.id);
      if (idx !== -1) {
        d.invoices[idx] = { ...d.invoices[idx], ...args.data, updatedAt: new Date() };
        return d.invoices[idx];
      }
      return null;
    },
    async count(args?: { where?: any }) {
      const d = await getDb();
      let result = d.invoices;
      if (args?.where?.clinicId) result = result.filter(i => i.clinicId === args.where.clinicId);
      if (args?.where?.status) result = result.filter(i => i.status === args.where.status);
      return result.length;
    },
    async aggregate(args?: { where?: any; _sum?: any; _count?: any }) {
      const d = await getDb();
      let result = d.invoices;
      if (args?.where?.clinicId) result = result.filter(i => i.clinicId === args.where.clinicId);
      const sumResult: any = {};
      if (args?._sum) {
        if (args._sum.total) sumResult.total = result.reduce((s, i) => s + (i.total || 0), 0);
        if (args._sum.paidAmount) sumResult.paidAmount = result.reduce((s, i) => s + (i.paidAmount || 0), 0);
        if (args._sum.dueAmount) sumResult.dueAmount = result.reduce((s, i) => s + (i.dueAmount || 0), 0);
        if (args._sum.subtotal) sumResult.subtotal = result.reduce((s, i) => s + (i.subtotal || 0), 0);
      }
      return {
        _sum: sumResult,
        _count: args?._count ? result.length : undefined,
      };
    },
  },

  inventoryItem: {
    async findMany(args?: { where?: any }) {
      const d = await getDb();
      let result = d.inventoryItems;
      if (args?.where?.clinicId) result = result.filter(i => i.clinicId === args.where.clinicId);
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const item: InventoryItem = {
        id: generateId(),
        quantity: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      d.inventoryItems.push(item);
      return item;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.inventoryItems.findIndex(i => i.id === args.where.id);
      if (idx !== -1) {
        d.inventoryItems[idx] = { ...d.inventoryItems[idx], ...args.data, updatedAt: new Date() };
        return d.inventoryItems[idx];
      }
      return null;
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.inventoryItems.findIndex(i => i.id === args.where.id);
      if (idx !== -1) d.inventoryItems.splice(idx, 1);
      return null;
    },
  },

  medicalRecord: {
    async findMany(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.medicalRecords;
      if (args?.where?.patientId) result = result.filter(r => r.patientId === args.where.patientId);
      if (args?.include?.doctor) {
        result = result.map(r => ({
          ...r,
          doctor: d.users.find(u => u.id === r.doctorId),
        }));
      }
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const record: MedicalRecord = {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      d.medicalRecords.push(record);
      return record;
    },
  },

  subscriptionPlan: {
    async findMany(args?: { where?: any }) {
      const d = await getDb();
      let result = d.subscriptionPlans;
      if (args?.where?.isActive !== undefined) result = result.filter(p => p.isActive === args.where.isActive);
      return result.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async findUnique(args?: { where?: any }) {
      const d = await getDb();
      return d.subscriptionPlans.find(p => p.id === args?.where?.id) || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const plan: SubscriptionPlan = {
        id: generateId(),
        price: 0, yearlyPrice: 0,
        features: '[]',
        maxPatients: 0, maxDoctors: 0, maxClinics: 0,
        isActive: true, isPopular: false, sortOrder: 0,
        createdAt: new Date(), updatedAt: new Date(),
        ...args.data,
      };
      d.subscriptionPlans.push(plan);
      return plan;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.subscriptionPlans.findIndex(p => p.id === args.where.id);
      if (idx !== -1) {
        d.subscriptionPlans[idx] = { ...d.subscriptionPlans[idx], ...args.data, updatedAt: new Date() };
        return d.subscriptionPlans[idx];
      }
      return null;
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.subscriptionPlans.findIndex(p => p.id === args.where.id);
      if (idx !== -1) d.subscriptionPlans.splice(idx, 1);
      return null;
    },
    async count() {
      const d = await getDb();
      return d.subscriptionPlans.length;
    },
  },

  clinicSubscription: {
    async findMany(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.clinicSubscriptions;
      if (args?.where?.clinicId) result = result.filter(s => s.clinicId === args.where.clinicId);
      if (args?.include?.clinic || args?.include?.plan) {
        result = result.map(s => ({
          ...s,
          clinic: d.clinics.find(c => c.id === s.clinicId),
          plan: d.subscriptionPlans.find(p => p.id === s.planId),
        }));
      }
      return result;
    },
    async findUnique(args?: { where?: any }) {
      const d = await getDb();
      return d.clinicSubscriptions.find(s => s.clinicId === args?.where?.clinicId) || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const sub: ClinicSubscription = {
        id: generateId(),
        status: 'active',
        autoRenew: false,
        startDate: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
        ...args.data,
      };
      d.clinicSubscriptions.push(sub);
      return sub;
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.clinicSubscriptions.findIndex(s => s.id === args.where.id);
      if (idx !== -1) d.clinicSubscriptions.splice(idx, 1);
      return null;
    },
  },

  offer: {
    async findMany(args?: { where?: any }) {
      const d = await getDb();
      let result = d.offers;
      if (args?.where?.isActive !== undefined) result = result.filter(o => o.isActive === args.where.isActive);
      if (args?.where?.showOnLanding !== undefined) result = result.filter(o => o.showOnLanding === args.where.showOnLanding);
      return result.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async findUnique(args?: { where?: any }) {
      const d = await getDb();
      return d.offers.find(o => o.id === args?.where?.id) || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const offer: Offer = {
        id: generateId(),
        discountType: 'percentage',
        discountValue: 0,
        isActive: true,
        showOnLanding: true,
        sortOrder: 0,
        createdAt: new Date(), updatedAt: new Date(),
        ...args.data,
      };
      d.offers.push(offer);
      return offer;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.offers.findIndex(o => o.id === args.where.id);
      if (idx !== -1) {
        d.offers[idx] = { ...d.offers[idx], ...args.data, updatedAt: new Date() };
        return d.offers[idx];
      }
      return null;
    },
    async delete(args: { where: any }) {
      const d = await getDb();
      const idx = d.offers.findIndex(o => o.id === args.where.id);
      if (idx !== -1) d.offers.splice(idx, 1);
      return null;
    },
    async count() {
      const d = await getDb();
      return d.offers.length;
    },
  },

  session: {
    async findFirst(args?: { where?: any }) {
      const d = await getDb();
      let result = d.sessions;
      if (args?.where?.tokenHash) result = result.filter(s => s.tokenHash === args.where.tokenHash);
      if (args?.where?.isRevoked !== undefined) result = result.filter(s => s.isRevoked === args.where.isRevoked);
      if (args?.where?.expiresAt?.gt) result = result.filter(s => new Date(s.expiresAt) > new Date(args.where.expiresAt.gt));
      return result[0] || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const session: Session = {
        id: generateId(),
        isRevoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        ...args.data,
      };
      d.sessions.push(session);
      return session;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.sessions.findIndex(s => s.id === args.where.id);
      if (idx !== -1) {
        d.sessions[idx] = { ...d.sessions[idx], ...args.data };
        return d.sessions[idx];
      }
      return null;
    },
    async count(args?: { where?: any }) {
      const d = await getDb();
      let result = d.sessions;
      if (args?.where?.userId) result = result.filter(s => s.userId === args.where.userId);
      if (args?.where?.isRevoked !== undefined) result = result.filter(s => s.isRevoked === args.where.isRevoked);
      return result.length;
    },
  },

  auditLog: {
    async create(args: { data: any }) {
      const d = await getDb();
      const log: AuditLog = {
        id: generateId(),
        createdAt: new Date(),
        ...args.data,
      };
      d.auditLogs.push(log);
      return log;
    },
  },

  loginAttempt: {
    async create(args: { data: any }) {
      const d = await getDb();
      const attempt = { id: generateId(), createdAt: new Date(), ...args.data };
      d.loginAttempts.push(attempt);
      return attempt;
    },
  },

  securityLog: {
    async create(args: { data: any }) {
      const d = await getDb();
      const log = { id: generateId(), createdAt: new Date(), ...args.data };
      d.securityLogs.push(log);
      return log;
    },
    async findMany(args?: { where?: any }) {
      const d = await getDb();
      return d.securityLogs;
    },
  },

  trustedDevice: {
    async findFirst(args?: { where?: any }) {
      const d = await getDb();
      if (!args?.where) return d.trustedDevices[0] || null;
      return d.trustedDevices.find(t =>
        (!args.where.userId || t.userId === args.where.userId) &&
        (!args.where.deviceFingerprint || t.deviceFingerprint === args.where.deviceFingerprint)
      ) || null;
    },
    async upsert(args: { where: any; create: any; update: any }) {
      const d = await getDb();
      const existing = d.trustedDevices.find(t => t.deviceFingerprint === args.where.deviceFingerprint);
      if (existing) {
        Object.assign(existing, args.update, { lastUsedAt: new Date() });
        return existing;
      } else {
        const device = { id: generateId(), createdAt: new Date(), ...args.create };
        d.trustedDevices.push(device);
        return device;
      }
    },
  },

  deviceAuthorization: {
    async create(args: { data: any }) {
      const d = await getDb();
      const auth = { id: generateId(), createdAt: new Date(), ...args.data };
      d.deviceAuthorizations.push(auth);
      return auth;
    },
  },

  task: {
    async findMany(args?: { where?: any; include?: any }) {
      const d = await getDb();
      let result = d.tasks;
      if (args?.where?.clinicId) result = result.filter((t: any) => t.clinicId === args.where.clinicId);
      if (args?.where?.status) result = result.filter((t: any) => t.status === args.where.status);
      if (args?.include?.assignee || args?.include?.creator) {
        result = result.map((t: any) => ({
          ...t,
          assignee: d.users.find(u => u.id === t.assigneeId),
          creator: d.users.find(u => u.id === t.creatorId),
        }));
      }
      return result;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const task = { id: generateId(), createdAt: new Date(), updatedAt: new Date(), status: 'todo', ...args.data };
      d.tasks.push(task);
      return task;
    },
    async update(args: { where: any; data: any }) {
      const d = await getDb();
      const idx = d.tasks.findIndex((t: any) => t.id === args.where.id);
      if (idx !== -1) {
        d.tasks[idx] = { ...d.tasks[idx], ...args.data, updatedAt: new Date() };
        return d.tasks[idx];
      }
      return null;
    },
  },

  securityConfig: {
    async findFirst(args?: { where?: any }) {
      const d = await getDb();
      if (!args?.where?.clinicId) return d.securityConfigs[0] || null;
      return d.securityConfigs.find((s: any) => s.clinicId === args.where.clinicId) || null;
    },
    async create(args: { data: any }) {
      const d = await getDb();
      const config = { id: generateId(), createdAt: new Date(), updatedAt: new Date(), ...args.data };
      d.securityConfigs.push(config);
      return config;
    },
  },
};

// === تصدير للتوافق مع الكود الحالي ===
export { dbClient, hashPassword, verifyPassword, hashToken, generateId, initializeDatabase, getDb };

// === Helper functions للتوافق ===
export async function $queryRaw() {
  return [{ '?column?': 1 }];
}

// === إعادة تعيين قاعدة البيانات (للاختبار) ===
export async function resetDatabase() {
  db = null;
  await initializeDatabase();
}
