'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Syringe, LayoutDashboard, Users, CalendarDays, FileText, Receipt,
  Package, BarChart3, Settings, Building2, LogOut, Menu, X, Eye, EyeOff,
  Plus, Search, Trash2, Edit3, ChevronLeft, ChevronRight, Clock, CheckCircle,
  AlertCircle, XCircle, UserCircle, Phone, Mail, MapPin, Activity,
  TrendingUp, DollarSign, UserPlus, FileCheck, Save, RefreshCw,
  ToggleLeft, ToggleRight, Shield, ClipboardList, Hash, Lock, Key,
  Smartphone, Monitor, Globe, ShieldCheck, ShieldAlert, Fingerprint,
  AlertTriangle, CheckCircle2, ArrowLeft, Copy, QrCode, ListTodo,
  Link, ExternalLink, Star, Award, UserCog, Crown, BadgeCheck,
  ArrowUpRight, HeartPulse, ClipboardCheck, CalendarCheck, Zap,
  ChevronDown, MousePointerClick, ShieldCheck2, HeadphonesIcon, Sparkles,
  Database, Download, Info, Sun, Moon,
  ArrowRight, Play, Gift, Tag, Percent, Ban, MessageCircle, Send,
  LogIn, ArrowLeftRight, KeyRound
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ============== I18N / TRANSLATIONS ==============
type Lang = 'ar' | 'en';

const TRANSLATIONS = {
  // === COMMON ===
  'app.name': { ar: 'عيادة', en: 'Clinic' },
  'app.tagline': { ar: 'نظام إدارة العيادات', en: 'Clinic Management System' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.add': { ar: 'إضافة', en: 'Add' },
  'common.search': { ar: 'بحث', en: 'Search' },
  'common.close': { ar: 'إغلاق', en: 'Close' },
  'common.confirm': { ar: 'تأكيد', en: 'Confirm' },
  'common.back': { ar: 'العودة', en: 'Back' },
  'common.next': { ar: 'التالي', en: 'Next' },
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.saved': { ar: 'تم الحفظ', en: 'Saved' },
  'common.required': { ar: 'مطلوب', en: 'Required' },
  'common.optional': { ar: 'اختياري', en: 'Optional' },
  'common.yes': { ar: 'نعم', en: 'Yes' },
  'common.no': { ar: 'لا', en: 'No' },
  'common.active': { ar: 'نشط', en: 'Active' },
  'common.inactive': { ar: 'غير نشط', en: 'Inactive' },
  'common.status': { ar: 'الحالة', en: 'Status' },
  'common.actions': { ar: 'إجراءات', en: 'Actions' },
  'common.name': { ar: 'الاسم', en: 'Name' },
  'common.phone': { ar: 'الهاتف', en: 'Phone' },
  'common.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'common.address': { ar: 'العنوان', en: 'Address' },
  'common.date': { ar: 'التاريخ', en: 'Date' },
  'common.time': { ar: 'الوقت', en: 'Time' },
  'common.notes': { ar: 'ملاحظات', en: 'Notes' },
  'common.currency': { ar: 'العملة', en: 'Currency' },
  'common.today': { ar: 'اليوم', en: 'Today' },
  'common.tomorrow': { ar: 'غداً', en: 'Tomorrow' },
  'common.yesterday': { ar: 'أمس', en: 'Yesterday' },

  // === NAVIGATION / SIDEBAR ===
  'nav.clinic': { ar: 'العيادة', en: 'Clinic' },
  'nav.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'nav.patients': { ar: 'المرضى', en: 'Patients' },
  'nav.appointments': { ar: 'المواعيد', en: 'Appointments' },
  'nav.medicalRecords': { ar: 'السجلات الطبية', en: 'Medical Records' },
  'nav.finance': { ar: 'المالية', en: 'Finance' },
  'nav.invoices': { ar: 'الفواتير', en: 'Invoices' },
  'nav.inventory': { ar: 'المخزون', en: 'Inventory' },
  'nav.reports': { ar: 'التقارير', en: 'Reports' },
  'nav.management': { ar: 'الإدارة', en: 'Management' },
  'nav.tasks': { ar: 'المهام', en: 'Tasks' },
  'nav.settings': { ar: 'الإعدادات', en: 'Settings' },
  'nav.clinicManagement': { ar: 'إدارة العيادة', en: 'Clinic Management' },
  'nav.subscriptions': { ar: 'الاشتراكات', en: 'Subscriptions' },
  'nav.subscriptionsMgmt': { ar: 'إدارة الاشتراكات', en: 'Subscriptions Mgmt' },
  'nav.offers': { ar: 'العروض', en: 'Offers' },
  'nav.offersMgmt': { ar: 'إدارة العروض', en: 'Offers Mgmt' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'nav.role.owner': { ar: 'المالك', en: 'Owner' },
  'nav.role.admin': { ar: 'مدير', en: 'Manager' },
  'nav.role.doctor': { ar: 'طبيب', en: 'Doctor' },
  'nav.role.reception': { ar: 'استقبال', en: 'Receptionist' },

  // === AUTH ===
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.register': { ar: 'إنشاء حساب', en: 'Sign Up' },
  'auth.username': { ar: 'اسم المستخدم', en: 'Username' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'auth.phone': { ar: 'الهاتف', en: 'Phone' },
  'auth.loginBtn': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'auth.registerBtn': { ar: 'إنشاء حساب', en: 'Create Account' },
  'auth.loginSubtitle': { ar: 'أدخل بياناتك للوصول إلى حسابك', en: 'Enter your credentials to access your account' },
  'auth.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'auth.haveAccount': { ar: 'لديك حساب؟', en: 'Have an account?' },
  'auth.startFree': { ar: 'ابدأ مجاناً', en: 'Start Free' },
  'auth.welcome': { ar: 'مرحباً بعودتك', en: 'Welcome Back' },
  'auth.demoData': { ar: 'تهيئة البيانات التجريبية', en: 'Setup Demo Data' },
  'auth.invalidCreds': { ar: 'خطأ في اسم المستخدم أو كلمة المرور', en: 'Invalid username or password' },

  // === DASHBOARD ===
  'dash.greeting.morning': { ar: 'صباح الخير', en: 'Good Morning' },
  'dash.greeting.afternoon': { ar: 'مساء الخير', en: 'Good Afternoon' },
  'dash.greeting.evening': { ar: 'مساء النور', en: 'Good Evening' },
  'dash.todayAppointments': { ar: 'مواعيد اليوم', en: "Today's Appointments" },
  'dash.totalPatients': { ar: 'إجمالي المرضى', en: 'Total Patients' },
  'dash.revenue': { ar: 'الإيرادات', en: 'Revenue' },
  'dash.collected': { ar: 'المتحصل', en: 'Collected' },
  'dash.weeklyRevenue': { ar: 'إيرادات الأسبوع', en: 'Weekly Revenue' },
  'dash.noAppointmentsToday': { ar: 'لا توجد مواعيد اليوم', en: 'No appointments today' },

  // === PATIENTS ===
  'patients.title': { ar: 'إدارة المرضى', en: 'Patients Management' },
  'patients.new': { ar: 'مريض جديد', en: 'New Patient' },
  'patients.fileNumber': { ar: 'رقم الملف', en: 'File Number' },
  'patients.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'patients.gender': { ar: 'الجنس', en: 'Gender' },
  'patients.male': { ar: 'ذكر', en: 'Male' },
  'patients.female': { ar: 'أنثى', en: 'Female' },
  'patients.bloodType': { ar: 'فصيلة الدم', en: 'Blood Type' },
  'patients.age': { ar: 'العمر', en: 'Age' },
  'patients.searchPlaceholder': { ar: 'بحث بالاسم أو الهاتف أو رقم الملف...', en: 'Search by name, phone, or file number...' },
  'patients.medicalRecords': { ar: 'السجل الطبي للمريض', en: 'Patient Medical Records' },
  'patients.noDiagnoses': { ar: 'لا توجد تشخيصات سابقة', en: 'No previous diagnoses' },
  'patients.diagnosesWillAppear': { ar: 'سيتم عرض التشخيصات هنا عند إتمام مواعيد المريض', en: 'Diagnoses will appear here after completing patient appointments' },
  'patients.previousDiagnoses': { ar: 'التشخيصات السابقة', en: 'Previous Diagnoses' },

  // === APPOINTMENTS ===
  'apt.title': { ar: 'المواعيد', en: 'Appointments' },
  'apt.new': { ar: 'موعد جديد', en: 'New Appointment' },
  'apt.patient': { ar: 'المريض', en: 'Patient' },
  'apt.doctor': { ar: 'الطبيب', en: 'Doctor' },
  'apt.type': { ar: 'النوع', en: 'Type' },
  'apt.status.scheduled': { ar: 'مجدول', en: 'Scheduled' },
  'apt.status.completed': { ar: 'تم', en: 'Completed' },
  'apt.status.cancelled': { ar: 'ملغي', en: 'Cancelled' },
  'apt.type.regular': { ar: 'عادي', en: 'Regular' },
  'apt.type.follow_up': { ar: 'متابعة', en: 'Follow-up' },
  'apt.type.emergency': { ar: 'طوارئ', en: 'Emergency' },
  'apt.type.consultation': { ar: 'استشارة', en: 'Consultation' },
  'apt.complete': { ar: 'تم', en: 'Done' },
  'apt.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'apt.completeTitle': { ar: 'إتمام الموعد', en: 'Complete Appointment' },
  'apt.price': { ar: 'سعر الكشف', en: 'Consultation Price' },
  'apt.diagnosis': { ar: 'التشخيص الطبي للمريض', en: 'Medical Diagnosis' },
  'apt.diagnosisPlaceholder': { ar: 'اكتب التشخيص الطبي للمريض بعد الكشف...', en: 'Enter the medical diagnosis after examination...' },
  'apt.diagnosisHint': { ar: 'سيتم حفظ التشخيص في السجل الطبي للمريض، ويمكن مراجعته لاحقاً من صفحة المرضى', en: 'Diagnosis will be saved to the patient medical record, accessible later from the Patients page' },
  'apt.confirmCreate': { ar: 'تأكيد وإنشاء فاتورة', en: 'Confirm & Create Invoice' },
  'apt.invoiceNote': { ar: 'سيتم تسجيل فاتورة تلقائياً في الفواتير كـ', en: 'An invoice will be auto-created as' },
  'apt.fullyPaid': { ar: 'مدفوعة كلياً', en: 'Fully Paid' },
  'apt.value': { ar: 'بقيمة', en: 'with value' },
  'apt.diagnosisSaved': { ar: '+ سيتم حفظ التشخيص في السجل الطبي للمريض', en: '+ Diagnosis will be saved to patient record' },

  // === SETTINGS ===
  'settings.title': { ar: 'إعدادات العيادة', en: 'Clinic Settings' },
  'settings.clinicName': { ar: 'اسم العيادة', en: 'Clinic Name' },
  'settings.taxNumber': { ar: 'الرقم الضريبي', en: 'Tax Number' },
  'settings.paymentMode': { ar: 'نوع الدفع', en: 'Payment Mode' },
  'settings.paymentMode.postpaid': { ar: 'آجل', en: 'Postpaid' },
  'settings.paymentMode.prepaid': { ar: 'مقدم', en: 'Prepaid' },
  'settings.slotDuration': { ar: 'مدة الموعد (دقيقة)', en: 'Slot Duration (minutes)' },
  'settings.saveChanges': { ar: 'حفظ التغييرات', en: 'Save Changes' },

  // === LANGUAGE SECTION ===
  'lang.title': { ar: 'اللغة والاتجاه', en: 'Language & Direction' },
  'lang.subtitle': { ar: 'اختر لغة العرض المفضلة (Language & Direction)', en: 'Choose your preferred display language' },
  'lang.arabic': { ar: 'العربية', en: 'Arabic' },
  'lang.english': { ar: 'الإنجليزية', en: 'English' },
  'lang.saved': { ar: 'تم حفظ تفضيل اللغة', en: 'Language preference saved' },
  'lang.note.ar': { ar: 'ملاحظة: تغيير اللغة يطبق على اتجاه الصفحة (RTL/LTR). ترجمة كامل المحتوى للإنجليزية قيد التطوير — بعض العناصر قد تبقى بالعربية مؤقتاً.', en: 'Note: language change applies page direction (RTL/LTR). Full content translation is in progress.' },
  'lang.note.en': { ar: 'ملاحظة: تغيير اللغة يطبق على اتجاه الصفحة (RTL/LTR). ترجمة كامل المحتوى للإنجليزية قيد التطوير — بعض العناصر قد تبقى بالعربية مؤقتاً.', en: 'Note: language change applies page direction (RTL/LTR). Full content translation is in progress.' },

  // === BACKUP ===
  'backup.title': { ar: 'النسخ الاحتياطي والبيانات', en: 'Backup & Data' },
  'backup.subtitle': { ar: 'صدّر نسخة كاملة من بيانات النظام كملف JSON', en: 'Export a full backup of system data as JSON' },
  'backup.export': { ar: 'تصدير نسخة احتياطية', en: 'Export Backup' },
  'backup.exporting': { ar: 'جاري التصدير...', en: 'Exporting...' },
  'backup.lastBackup': { ar: 'آخر نسخة', en: 'Last backup' },
  'backup.includes': { ar: 'تشمل النسخة: العيادات، المستخدمين (بدون كلمات المرور)، المرضى، المواعيد، الفواتير، المخزون، المهام، السجلات الطبية، خطط الاشتراك، العروض، سجلات التدقيق.', en: 'Includes: clinics, users (no passwords), patients, appointments, invoices, inventory, tasks, medical records, plans, offers, audit logs.' },
  'backup.tip': { ar: 'يُنصح بإجراء نسخة احتياطية أسبوعياً، أو قبل أي تعديل كبير على البيانات.', en: 'Recommended: weekly backup, or before major data changes.' },

  // === SUBSCRIPTIONS ===
  'sub.title': { ar: 'إدارة الاشتراكات', en: 'Subscriptions Management' },
  'sub.plans': { ar: 'خطط الاشتراك', en: 'Subscription Plans' },
  'sub.clinicSubs': { ar: 'اشتراكات العيادات', en: 'Clinic Subscriptions' },
  'sub.newPlan': { ar: 'خطة جديدة', en: 'New Plan' },
  'sub.grant': { ar: 'منح اشتراك', en: 'Grant Subscription' },
  'sub.billingCycle': { ar: 'دورة الفوترة', en: 'Billing Cycle' },
  'sub.monthly': { ar: 'شهري', en: 'Monthly' },
  'sub.yearly': { ar: 'سنوي', en: 'Yearly' },
  'sub.saveUpTo': { ar: 'وفّر حتى ١٧٪', en: 'Save up to 17%' },
  'sub.startDate': { ar: 'تاريخ البدء', en: 'Start Date' },
  'sub.endDate': { ar: 'تاريخ الانتهاء', en: 'End Date' },
  'sub.notSpecified': { ar: 'غير محدد', en: 'Not specified' },
  'sub.endDateHint': { ar: 'تاريخ الانتهاء (اختياري — يُحسب تلقائياً إذا تُرك فارغاً)', en: 'End date (optional — auto-calculated if empty)' },
  'sub.chooseClinic': { ar: 'اختر عيادة', en: 'Choose a clinic' },
  'sub.choosePlan': { ar: 'اختر خطة', en: 'Choose a plan' },
  'sub.clinic': { ar: 'العيادة', en: 'Clinic' },
  'sub.plan': { ar: 'الخطة', en: 'Plan' },
  'sub.grantBtn': { ar: 'منح الاشتراك', en: 'Grant Subscription' },
  'sub.saveYearly': { ar: 'وفّر', en: 'Save' },
  'sub.perYear': { ar: 'ر.س/سنة', en: 'SAR/year' },
  'sub.perMonth': { ar: 'ر.س/شهر', en: 'SAR/month' },

  // === LANDING ===
  'landing.hero.badge': { ar: 'نظام إدارة العيادات رقم ١ في المنطقة', en: '#1 Clinic Management System in the Region' },
  'landing.hero.title1': { ar: 'أدِر عيادتك', en: 'Manage Your Clinic' },
  'landing.hero.title2': { ar: 'بذكاء وسهولة', en: 'Smartly & Easily' },
  'landing.hero.subtitle': { ar: 'نظام متكامل لإدارة المواعيد والمرضى والفواتير. وفّر وقتك وركّز على ما يهم — رعاية مرضاك.', en: 'An integrated system for appointments, patients, and invoices. Save time and focus on what matters — patient care.' },
  'landing.hero.cta1': { ar: 'ابدأ مجاناً الآن', en: 'Start Free Now' },
  'landing.hero.cta2': { ar: 'شاهد كيف يعمل', en: 'See How It Works' },

  // === EMPTY STATES ===
  'empty.noData': { ar: 'لا توجد بيانات', en: 'No Data' },
  'empty.noPatients': { ar: 'لا يوجد مرضى بعد', en: 'No patients yet' },
  'empty.addFirst': { ar: 'أضف أول مريض للبدء', en: 'Add your first patient to get started' },
} as Record<string, { ar: string; en: string }>;

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: 'ar',
  setLang: () => {},
  t: (key: string) => key,
});

const useLang = () => useContext(LanguageContext);

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Lang | null;
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
      const html = document.documentElement;
      if (saved === 'en') {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
      } else {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
      }
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('app-language', l);
    const html = document.documentElement;
    if (l === 'en') {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    } else {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    }
  };

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry.ar || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============== TYPES ==============
interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  phone?: string;
  email?: string;
  clinicId?: string | null;
  permissions: Record<string, boolean> | null;
  twoFactorEnabled: boolean;
  securityLevel: string;
  clinic?: { id: string; name: string; phone?: string; address?: string; currency: string } | null;
}

interface Clinic {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  currency: string;
  paymentMode: string;
  slotDuration: number;
  isActive: boolean;
  notes?: string;
  bookingSlug?: string;
  bookingEnabled?: boolean;
  users?: any[];
  _count?: { patients: number; appointments: number; tasks: number };
  subscription?: ClinicSubscription | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  yearlyPrice?: number;
  features: string; // JSON
  modules?: string | null; // JSON array of module IDs
  maxPatients?: number;
  maxDoctors?: number;
  maxClinics?: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

interface ClinicSubscription {
  id: string;
  clinicId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  allowedModules?: string | null;
  grantedBy?: string;
  notes?: string;
  autoRenew: boolean;
  plan?: SubscriptionPlan;
  clinic?: { id: string; name: string };
}

interface Offer {
  id: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  planId?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  showOnLanding: boolean;
  badge?: string;
  sortOrder: number;
  plan?: SubscriptionPlan;
}

// ============== AUTH CONTEXT ==============
const AuthContext = createContext<{
  user: AuthUser | null;
  currentClinicId: string | null;
  clinics: Clinic[];
  login: (username: string, password: string, twoFactorCode?: string, trustDevice?: boolean) => Promise<string>;
  logout: () => Promise<void>;
  setCurrentClinicId: (id: string) => void;
  refreshUser: () => Promise<void>;
  loginAs: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  returnToOwner: () => Promise<{ ok: boolean; error?: string }>;
  isImpersonating: boolean;
  impersonatorName: string | null;
  requiresTwoFactor: boolean;
  requiresDeviceAuth: boolean;
  pendingUserId: string | null;
  deviceAuthCode: string | null;
  deviceName: string;
} | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentClinicId, setCurrentClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [requiresDeviceAuth, setRequiresDeviceAuth] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [deviceAuthCode, setDeviceAuthCode] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatorName, setImpersonatorName] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCurrentClinicId(data.currentClinicId);
      } else {
        setUser(null);
      }
      // Sync impersonation state from cookie (cookie is JS-readable since we set httpOnly:false)
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)impersonator_name=([^;]+)/);
        if (match && match[1]) {
          try {
            setImpersonatorName(decodeURIComponent(match[1]));
            setIsImpersonating(true);
          } catch {
            setImpersonatorName(null);
            setIsImpersonating(false);
          }
        } else {
          setImpersonatorName(null);
          setIsImpersonating(false);
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (username: string, password: string, twoFactorCode?: string, trustDevice?: boolean) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, twoFactorCode, trustDevice }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCurrentClinicId(data.currentClinicId);
        setRequiresTwoFactor(false);
        setRequiresDeviceAuth(false);
        setIsImpersonating(false);
        setImpersonatorName(null);
        const clinicsRes = await fetch('/api/clinics');
        if (clinicsRes.ok) setClinics(await clinicsRes.json());
        return 'success';
      }
      const data = await res.json();
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setPendingUserId(data.userId);
        return 'requires_2fa';
      }
      if (data.requiresDeviceAuth) {
        setRequiresDeviceAuth(true);
        setPendingUserId(data.userId);
        setDeviceName(data.deviceName || '');
        setDeviceAuthCode(data._demoAuthCode || '');
        return 'requires_device_auth';
      }
      return data.error || 'failed';
    } catch {
      return 'failed';
    }
  };

  // Owner-only: login as another user (impersonation)
  const loginAs = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCurrentClinicId(data.currentClinicId);
        setIsImpersonating(true);
        setImpersonatorName(data.impersonatorName || 'المالك');
        // Refresh clinics list for the impersonated context
        const clinicsRes = await fetch('/api/clinics');
        if (clinicsRes.ok) setClinics(await clinicsRes.json());
        return { ok: true };
      }
      return { ok: false, error: data.error || 'فشل الدخول كالمستخدم' };
    } catch {
      return { ok: false, error: 'خطأ في الاتصال' };
    }
  };

  // Return to owner account after impersonation
  const returnToOwner = async () => {
    try {
      const res = await fetch('/api/auth/impersonate', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCurrentClinicId(data.currentClinicId);
        setIsImpersonating(false);
        setImpersonatorName(null);
        const clinicsRes = await fetch('/api/clinics');
        if (clinicsRes.ok) setClinics(await clinicsRes.json());
        return { ok: true };
      }
      return { ok: false, error: data.error || 'فشل العودة إلى حساب المالك' };
    } catch {
      return { ok: false, error: 'خطأ في الاتصال' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCurrentClinicId(null);
    setRequiresTwoFactor(false);
    setRequiresDeviceAuth(false);
    setIsImpersonating(false);
    setImpersonatorName(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentClinicId, clinics, login, logout, setCurrentClinicId, refreshUser, loginAs, returnToOwner, isImpersonating, impersonatorName, requiresTwoFactor, requiresDeviceAuth, pendingUserId, deviceAuthCode, deviceName }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext)!;
}

// ============== LOGIN PAGE ==============
function LoginPage({ onBack, onSwitchRegister }: { onBack?: () => void; onSwitchRegister?: () => void } = {}) {
  const { login, requiresTwoFactor, requiresDeviceAuth, deviceAuthCode, deviceName } = useAuth();
  const { t } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [step, setStep] = useState<'login' | '2fa' | 'device'>('login');

  const handleSeed = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      setSeeded(true);
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (result === 'success') {
      // Logged in
    } else if (result === 'requires_2fa') {
      setStep('2fa');
    } else if (result === 'requires_device_auth') {
      setStep('device');
    } else {
      setError(result !== 'failed' ? result : t('auth.invalidCreds'));
    }
    setLoading(false);
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password, twoFactorCode, trustDevice);
    if (result === 'success') {
      // Logged in
    } else {
      setError(typeof result === 'string' && result !== 'failed' ? result : (t('auth.invalidCreds')));
    }
    setLoading(false);
  };

  const handleDeviceAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password, deviceCode, trustDevice);
    if (result === 'success') {
      // Logged in
    } else {
      setError(typeof result === 'string' && result !== 'failed' ? result : (t('auth.invalidCreds')));
    }
    setLoading(false);
  };

  // 2FA Verification Step
  if (step === '2fa' || requiresTwoFactor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 flex items-center justify-center p-4 relative overflow-hidden pattern-dots">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-950/25 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-900/25 rounded-full blur-[100px]" />
        </div>
        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-600/30 animate-float">
              <ShieldCheck className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">التحقق الثنائي</h1>
            <p className="text-teal-500/80 text-sm">أدخل رمز التحقق من تطبيق المصادقة</p>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-teal-200">رمز التحقق (6 أرقام)</label>
                <input
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-2xl tracking-[0.5em] placeholder-teal-400/40 outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-600/30 transition-all"
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <label className="flex items-center gap-2 text-teal-500/80 text-sm cursor-pointer">
                <input type="checkbox" checked={trustDevice} onChange={e => setTrustDevice(e.target.checked)}
                  className="rounded border-white/20 bg-white/10" />
                <span>الثوق في هذا الجهاز</span>
              </label>
              {error && (
                <div className="bg-red-500/30 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm text-center">{error}</div>
              )}
              <button type="submit" disabled={loading || twoFactorCode.length !== 6}
                className="w-full py-3 bg-gradient-to-l from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg shadow-orange-600/35 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50">
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </button>
              <button type="button" onClick={() => setStep('login')}
                className="w-full py-2.5 text-sm text-teal-500/80 hover:text-teal-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> العودة لتسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Device Authorization Step
  if (step === 'device' || requiresDeviceAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 flex items-center justify-center p-4 relative overflow-hidden pattern-dots">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-950/25 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-900/25 rounded-full blur-[100px]" />
        </div>
        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-600 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-rose-600/40 animate-float">
              <Fingerprint className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">جهاز جديد</h1>
            <p className="text-teal-500/80 text-sm">تم اكتشاف جهاز جديد. يرجى التحقق من الهوية</p>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="bg-orange-500/10 border border-orange-600/30 rounded-xl p-3 mb-4 text-orange-200 text-sm text-center">
              <Monitor size={16} className="inline-block ml-1" />
              {deviceName}
            </div>
            <form onSubmit={handleDeviceAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-teal-200">رمز تفويض الجهاز</label>
                <input
                  placeholder="أدخل رمز التفويض"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-xl tracking-[0.3em] placeholder-teal-400/40 outline-none focus:border-rose-400/60 focus:ring-2 focus:ring-rose-600/30 transition-all"
                  type="text"
                  value={deviceCode}
                  onChange={e => setDeviceCode(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              {deviceAuthCode && (
                <div className="bg-orange-700/10 border border-orange-700/30 rounded-xl p-3 text-orange-200 text-sm text-center">
                  <p className="text-xs mb-1">رمز التفويض (للتجربة):</p>
                  <p className="text-xl font-mono font-bold tracking-widest">{deviceAuthCode}</p>
                </div>
              )}
              <label className="flex items-center gap-2 text-teal-500/80 text-sm cursor-pointer">
                <input type="checkbox" checked={trustDevice} onChange={e => setTrustDevice(e.target.checked)}
                  className="rounded border-white/20 bg-white/10" />
                <span>الثوق في هذا الجهاز لمدة 30 يوم</span>
              </label>
              {error && (
                <div className="bg-red-500/30 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm text-center">{error}</div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-l from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-semibold rounded-2xl shadow-lg shadow-rose-600/35 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50">
                {loading ? 'جاري التحقق...' : 'تفويض الجهاز'}
              </button>
              <button type="button" onClick={() => setStep('login')}
                className="w-full py-2.5 text-sm text-teal-500/80 hover:text-teal-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> العودة لتسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Regular Login Step — Split screen
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 relative items-center justify-center p-12 overflow-hidden">
        {/* Animated bg elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="deco-blob absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal-800/15" style={{ animationDelay: '0s' }} />
          <div className="deco-blob absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-500/25" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-orange-400/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 pattern-dots opacity-40" />
          {/* Orbiting dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit">
              <div className="w-2.5 h-2.5 bg-teal-800/40 rounded-full shadow-lg shadow-teal-500/30" />
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-md text-center space-y-8 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-600/50 animate-float">
            <Syringe className="text-white" size={36} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">عيادة</h1>
            <p className="text-teal-300/80 text-lg font-medium leading-relaxed">نظام إدارة العيادات المتكامل</p>
          </div>
          {/* Feature bullets */}
          <div className="space-y-4 text-right">
            {[
              { icon: CalendarCheck, text: 'إدارة المواعيد بذكاء' },
              { icon: Users, text: 'ملفات مرضى شاملة' },
              { icon: Receipt, text: 'فواتير تلقائية' },
              { icon: Shield, text: 'صلاحيات متقدمة' },
            ].map((f, i) => {
              const FIcon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 text-white/85 hover:text-white transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                    <FIcon size={16} className="text-teal-500" />
                  </div>
                  <span className="text-sm font-medium">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 bg-background flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
        <div className="w-full max-w-[420px] animate-slide-up relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-xl shadow-teal-600/40 mb-3">
              <Syringe className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black gradient-text">عيادة</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{t('auth.login')}</h2>
            <p className="text-muted-foreground text-sm mb-8">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t('auth.username')}</label>
              <div className="relative group">
                <UserCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  placeholder={t('auth.username')}
                  className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:bg-muted/20 transition-all duration-300"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
              <div className="relative group">
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input
                  placeholder={t('auth.password')}
                  className="w-full pr-4 pl-11 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:bg-muted/20 transition-all duration-300"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 dark:bg-red-900/20 border border-red-800/40 dark:border-red-800/50 rounded-xl p-3 text-red-400 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-[15px]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> {t('common.loading')}
                </span>
              ) : t('auth.loginBtn')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground/60">{t('common.optional')}</span></div>
          </div>

          {!seeded && (
            <button onClick={handleSeed}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-xl hover:bg-muted/30 transition-all">
              {t('auth.demoData')}
            </button>
          )}

          {seeded && (
            <div className="bg-orange-900/30 dark:bg-orange-900/20 border border-orange-700/40 dark:border-orange-800/50 rounded-xl p-3 text-orange-400 text-xs text-center">
              تم تهيئة البيانات — admin / admin123
            </div>
          )}

          <div className="mt-6 text-center">
            <button type="button" onClick={onSwitchRegister}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('auth.noAccount')} <span className="font-semibold text-teal-600 dark:text-teal-400">{t('auth.register')}</span>
            </button>
          </div>

          {onBack && (
            <button onClick={onBack}
              className="mt-3 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1 mx-auto">
              <ArrowRight size={14} />
              العودة للرئيسية
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== REGISTER PAGE ==============
function RegisterPage({ onBack, onSwitchLogin }: { onBack?: () => void; onSwitchLogin?: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '', fullName: '', phone: '', email: '',
    clinicName: '', clinicPhone: '', clinicAddress: '', clinicCurrency: 'SAR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!form.username || !form.password || !form.fullName) {
        setError('جميع الحقول مطلوبة');
        return;
      }
      if (form.username.length < 3) {
        setError('اسم المستخدم يجب أن يكون ٣ أحرف على الأقل');
        return;
      }
      if (form.password.length < 6) {
        setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('كلمة المرور غير متطابقة');
        return;
      }
      setStep(2);
      return;
    }

    if (!form.clinicName) {
      setError('اسم العيادة مطلوب');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || undefined,
          email: form.email || undefined,
          clinicName: form.clinicName,
          clinicPhone: form.clinicPhone || undefined,
          clinicAddress: form.clinicAddress || undefined,
          clinicCurrency: form.clinicCurrency,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch {
      setError('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 flex items-center justify-center p-4 relative overflow-hidden pattern-dots">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-900/25 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-950/25 rounded-full blur-[100px]" />
        </div>
        <div className="w-full max-w-[440px] relative z-10 animate-scale-in text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-700/30">
            <CheckCircle className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">تم إنشاء الحساب بنجاح!</h1>
          <p className="text-teal-400/75 text-sm mb-2">يمكنك الآن تسجيل الدخول بحسابك</p>
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 mb-6">
            <div className="text-sm text-white/90 mb-1">اسم المستخدم</div>
            <div className="text-lg font-bold text-teal-500">{form.username}</div>
          </div>
          <button onClick={onSwitchLogin}
            className="w-full py-3.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/40 hover:shadow-xl hover:shadow-teal-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] text-base">
            تسجيل الدخول الآن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="deco-blob absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal-800/15" style={{ animationDelay: '0s' }} />
          <div className="deco-blob absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-500/25" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 pattern-dots opacity-40" />
        </div>
        <div className="relative z-10 max-w-md text-center space-y-8 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-600/50 animate-float">
            <UserPlus className="text-white" size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">إنشاء حساب جديد</h1>
            <p className="text-teal-300/80 text-lg font-medium leading-relaxed">انضم لآلاف العيادات التي تثق بنظام عيادة</p>
          </div>
          <div className="space-y-3 text-right">
            {[
              { num: '١', text: 'أنشئ حسابك في أقل من دقيقة' },
              { num: '٢', text: 'سجّل بيانات عيادتك' },
              { num: '٣', text: 'ابدأ باستقبال المرضى' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/85">
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 text-teal-300 font-bold text-sm">{f.num}</div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Register Form */}
      <div className="flex-1 bg-background flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Subtle pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
        <div className="w-full max-w-[480px] animate-slide-up relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-xl shadow-teal-600/40 mb-3">
              <UserPlus className="text-white" size={26} />
            </div>
            <h1 className="text-2xl font-black gradient-text">إنشاء حساب جديد</h1>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-0 mb-6" dir="ltr">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === 1 ? 'bg-teal-800 text-white shadow-md shadow-teal-600/30' : 'bg-teal-500/10 dark:bg-teal-900/35 text-teal-300'}`}>1</div>
              <span className={`text-xs font-medium ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>حسابك</span>
            </div>
            <div className={`w-12 h-0.5 mx-2 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-teal-800' : 'bg-border'}`} />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === 2 ? 'bg-teal-800 text-white shadow-md shadow-teal-600/30' : 'bg-muted text-muted-foreground'}`}>2</div>
              <span className={`text-xs font-medium ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>عيادتك</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">الاسم الكامل *</label>
                    <div className="relative group">
                      <UserCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <input placeholder="أدخل اسمك الكامل"
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">اسم المستخدم *</label>
                    <div className="relative group">
                      <Hash className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <input placeholder="اختر اسم مستخدم فريد"
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value.replace(/\s/g, '') })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">رقم الجوال</label>
                      <div className="relative group">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={16} />
                        <input placeholder="05xxxxxxxx"
                          className="w-full pr-10 pl-3 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 text-sm"
                          value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                      <div className="relative group">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={16} />
                        <input placeholder="email@example.com" type="email" dir="ltr"
                          className="w-full pr-10 pl-3 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 text-sm"
                          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">كلمة المرور *</label>
                    <div className="relative group">
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <input placeholder="أدخل كلمة مرور قوية (٦ أحرف على الأقل)"
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        type="password"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">تأكيد كلمة المرور *</label>
                    <div className="relative group">
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <input placeholder="أعد كتابة كلمة المرور"
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        type="password"
                        value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">اسم العيادة *</label>
                    <div className="relative group">
                      <Building2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <input placeholder="مثال: عيادة الشفاء"
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        value={form.clinicName} onChange={e => setForm({ ...form, clinicName: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">هاتف العيادة</label>
                      <div className="relative group">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={16} />
                        <input placeholder="رقم هاتف العيادة"
                          className="w-full pr-10 pl-3 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 text-sm"
                          value={form.clinicPhone} onChange={e => setForm({ ...form, clinicPhone: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">العملة</label>
                      <select
                        className="w-full px-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                        value={form.clinicCurrency} onChange={e => setForm({ ...form, clinicCurrency: e.target.value })}>
                        <option value="SAR" className="bg-background">ريال سعودي (ر.س)</option>
                        <option value="QAR" className="bg-background">ريال قطري (ر.ق)</option>
                        <option value="AED" className="bg-background">درهم إماراتي (د.إ)</option>
                        <option value="EGP" className="bg-background">جنيه مصري (ج.م)</option>
                        <option value="KWD" className="bg-background">دينار كويتي (د.ك)</option>
                        <option value="BHD" className="bg-background">دينار بحريني (د.ب)</option>
                        <option value="OMR" className="bg-background">ريال عماني (ر.ع)</option>
                        <option value="JOD" className="bg-background">دينار أردني (د.أ)</option>
                        <option value="LBP" className="bg-background">ليرة لبنانية (ل.ل)</option>
                        <option value="IQD" className="bg-background">دينار عراقي (د.ع)</option>
                        <option value="SYP" className="bg-background">ليرة سورية (ل.س)</option>
                        <option value="YER" className="bg-background">ريال يمني (ر.ي)</option>
                        <option value="DZD" className="bg-background">دينار جزائري (د.ج)</option>
                        <option value="TND" className="bg-background">دينار تونسي (د.ت)</option>
                        <option value="MAD" className="bg-background">درهم مغربي (د.م)</option>
                        <option value="LYD" className="bg-background">دينار ليبي (د.ل)</option>
                        <option value="SDG" className="bg-background">جنيه سوداني (ج.س)</option>
                        <option value="MRU" className="bg-background">أوقية موريتانية (أ.م)</option>
                        <option value="SOS" className="bg-background">شلن صومالي (ش.ص)</option>
                        <option value="DJF" className="bg-background">فرنك جيبوتي (ف.ج)</option>
                        <option value="USD" className="bg-background">دولار أمريكي ($)</option>
                        <option value="EUR" className="bg-background">يورو (€)</option>
                        <option value="GBP" className="bg-background">جنيه إسترليني (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">عنوان العيادة</label>
                    <div className="relative group">
                      <MapPin className="absolute right-3.5 top-4 text-muted-foreground/50 group-focus-within:text-teal-500 transition-colors" size={18} />
                      <textarea placeholder="المدينة، الحي، الشارع..."
                        className="w-full pr-11 pl-4 py-3 bg-muted/30 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 resize-none"
                        rows={2}
                        value={form.clinicAddress} onChange={e => setForm({ ...form, clinicAddress: e.target.value })} />
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="bg-teal-900/10 dark:bg-teal-950/15 border border-teal-950/40 dark:border-teal-900/40 rounded-xl p-3 flex items-start gap-2">
                    <Sparkles size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-400">ستكون مدير العيادة بصلاحيات كاملة ويمكنك لاحقاً إضافة موظفين وأطباء من داخل لوحة التحكم</p>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-950/30 dark:bg-red-900/20 border border-red-800/40 dark:border-red-800/50 rounded-xl p-3 text-red-400 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="px-5 py-3 text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-xl hover:bg-muted/30 transition-all duration-300">
                    رجوع
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 text-[15px]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin" /> جاري الإنشاء...
                    </span>
                  ) : step === 1 ? 'التالي' : 'إنشاء الحساب والعيادة'}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <button onClick={onSwitchLogin}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                لديك حساب بالفعل؟ <span className="font-semibold text-teal-600 dark:text-teal-400">سجّل دخولك</span>
              </button>
            </div>
          </div>

          {onBack && (
            <button onClick={onBack}
              className="mt-4 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1 mx-auto">
              <ArrowRight size={14} />
              العودة للرئيسية
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== SIDEBAR ==============
const NAV_ITEMS = [
  { id: 'dashboard', label: { ar: 'لوحة التحكم', en: 'Dashboard' }, icon: LayoutDashboard, permission: 'dashboard', group: { ar: 'الرئيسية', en: 'Main' } },
  { id: 'patients', label: { ar: 'المرضى', en: 'Patients' }, icon: Users, permission: 'patients', group: { ar: 'العيادة', en: 'Clinic' } },
  { id: 'appointments', label: { ar: 'المواعيد', en: 'Appointments' }, icon: CalendarDays, permission: 'appointments', group: { ar: 'العيادة', en: 'Clinic' } },
  { id: 'records', label: { ar: 'السجلات الطبية', en: 'Medical Records' }, icon: FileText, permission: 'records', group: { ar: 'العيادة', en: 'Clinic' } },
  { id: 'invoices', label: { ar: 'الفواتير', en: 'Invoices' }, icon: Receipt, permission: 'invoices', group: { ar: 'المالية', en: 'Finance' } },
  { id: 'inventory', label: { ar: 'المخزون', en: 'Inventory' }, icon: Package, permission: 'inventory', group: { ar: 'المالية', en: 'Finance' } },
  { id: 'reports', label: { ar: 'التقارير', en: 'Reports' }, icon: BarChart3, permission: 'reports', group: { ar: 'المالية', en: 'Finance' } },
  { id: 'tasks', label: { ar: 'المهام', en: 'Tasks' }, icon: ListTodo, permission: 'dashboard', group: { ar: 'الإدارة', en: 'Management' } },
  { id: 'settings', label: { ar: 'الإعدادات', en: 'Settings' }, icon: Settings, permission: 'settings', group: { ar: 'الإدارة', en: 'Management' } },
  { id: 'management', label: { ar: 'إدارة العيادات', en: 'Clinic Mgmt' }, icon: Building2, permission: 'settings', group: { ar: 'الإدارة', en: 'Management' } },
  { id: 'subscriptions', label: { ar: 'إدارة الاشتراكات', en: 'Subscriptions' }, icon: Crown, permission: 'super_admin', group: { ar: 'الاشتراكات', en: 'Subscriptions' } },
  { id: 'offers', label: { ar: 'إدارة العروض', en: 'Offers' }, icon: Star, permission: 'super_admin', group: { ar: 'الاشتراكات', en: 'Subscriptions' } },
];

function Sidebar({ currentView, setCurrentView }: { currentView: string; setCurrentView: (v: string) => void }) {
  const { user, logout, clinics, currentClinicId, setCurrentClinicId } = useAuth();
  const { lang, t } = useLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const hasPermission = (perm: string) => {
    if (user.role === 'super_admin') return true;
    if (perm === 'super_admin') return false; // only super_admin
    if (perm === 'management') return user.role === 'super_admin' || user.role === 'admin';
    return user.permissions?.[perm] ?? false;
  };

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    doctor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/35 dark:text-teal-400',
    reception: 'bg-orange-100 text-orange-700 dark:bg-orange-900/35 dark:text-orange-400',
    accountant: 'bg-purple-100 text-purple-700 dark:bg-purple-900/35 dark:text-purple-300',
    nurse: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300',
  };

  const roleLabels: Record<string, string> = {
    super_admin: t('nav.role.owner'),
    admin: t('nav.role.admin'),
    doctor: t('nav.role.doctor'),
    reception: t('nav.role.reception'),
    accountant: lang === 'ar' ? 'محاسب' : 'Accountant',
    nurse: lang === 'ar' ? 'تمريض' : 'Nurse',
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-slate-50/50 to-teal-50/30 dark:from-teal-950 dark:via-teal-950 dark:to-teal-950/20">
      {/* Brand */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-[0.85rem] flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
            <span className="text-white font-black text-lg">{lang === 'ar' ? 'ع' : 'C'}</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-[15px] truncate tracking-tight text-foreground">{t('app.name')}</h2>
              <p className="text-[11px] text-muted-foreground/70 truncate">{t('app.tagline')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clinic selector for super_admin */}
      {user.role === 'super_admin' && clinics.length > 0 && !collapsed && (
        <div className="px-4 pb-2">
          <select
            value={currentClinicId || ''}
            onChange={e => setCurrentClinicId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 dark:bg-white/5 border border-border/60 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
          >
            <option value="">{lang === 'ar' ? 'اختر عيادة' : 'Select clinic'}</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Nav Items with groups */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto sidebar-nav-scroll">
        {(() => {
          const visibleItems = NAV_ITEMS.filter(item => hasPermission(item.permission));
          let lastGroup = '';
          return visibleItems.map((item, idx) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            const groupLabel = item.group[lang];
            const itemLabel = item.label[lang];
            const showGroup = groupLabel !== lastGroup && !collapsed;
            lastGroup = groupLabel;
            return (
              <div key={item.id}>
                {showGroup && idx > 0 && (
                  <div className="px-2 pt-5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap">{groupLabel}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
                    </div>
                  </div>
                )}
                <button onClick={() => { setCurrentView(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-300 relative group/nav ${
                    active
                      ? 'bg-gradient-to-l from-teal-500/20 to-teal-700/10 text-teal-700 dark:text-teal-300 font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}>
                  {active && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5/6 rounded-l-full bg-gradient-to-b from-teal-500 to-orange-500 shadow-sm shadow-teal-600/40" />
                  )}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${active ? 'bg-teal-600/20' : 'group-hover/nav:bg-muted/80'}`}>
                    <Icon size={17} className={`transition-all duration-300 ${active ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  </div>
                  {!collapsed && <span className="truncate">{itemLabel}</span>}
                </button>
              </div>
            );
          });
        })()}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 mt-auto">
        {!collapsed ? (
          <div className="rounded-xl bg-gradient-to-l from-teal-50/80 to-orange-50/50 dark:from-teal-950/20 dark:to-orange-950/10 border border-teal-200/40 dark:border-teal-900/30 p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-teal-600/25">
                {user.fullName?.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{user.fullName}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${roleColors[user.role] || ''}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-900/20 transition-all duration-200" title={t('nav.logout')}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={logout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-900/20 transition-all duration-200">
            <LogOut size={17} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 glass-card-v2 rounded-xl shadow-lg border border-border">
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 modal-overlay" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-card border-l border-border/40 shadow-2xl" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-card border-l border-border/40 transition-all duration-300 shrink-0 shadow-sm ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}>
        {sidebarContent}
      </aside>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex fixed bottom-6 z-30 w-7 h-7 items-center justify-center bg-card border border-border/50 rounded-full shadow-md hover:bg-muted transition-colors"
        style={{ right: collapsed ? '8px' : '248px' }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </>
  );
}

// ============== DASHBOARD ==============
function DashboardView() {
  const { currentClinicId, user } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    let cancelled = false;
    if (!currentClinicId) { setLoading(false); setSubscriptionStatus('inactive'); return; }
    
    // Check subscription
    fetch('/api/clinic-subscriptions')
      .then(r => r.ok ? r.json() : [])
      .then((subs: ClinicSubscription[]) => {
        if (cancelled) return;
        // Active or trial (not yet expired) subscriptions both grant access
        const now = new Date();
        const clinicSub = subs.find((s: ClinicSubscription) =>
          s.clinicId === currentClinicId &&
          (s.status === 'active' || s.status === 'trial') &&
          (!s.endDate || new Date(s.endDate) > now)
        );
        // Super admin always has access
        if (user?.role === 'super_admin' || clinicSub) {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('inactive');
        }
      })
      .catch(() => {
        if (!cancelled) setSubscriptionStatus('inactive');
      });

    fetch(`/api/dashboard?clinicId=${currentClinicId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentClinicId, user?.role]);

  if (!currentClinicId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Building2 size={64} className="mx-auto text-muted-foreground animate-float" />
          <h2 className="text-2xl font-bold">اختر عيادة من القائمة</h2>
          <p className="text-muted-foreground">اختر عيادة من القائمة الجانبية لعرض لوحة التحكم</p>
        </div>
      </div>
    );
  }

  // Subscription check overlay
  if (subscriptionStatus === 'inactive') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto">
            <Crown size={36} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">اشتراك مطلوب</h2>
          <p className="text-muted-foreground leading-relaxed">هذه العيادة ليس لديها اشتراك فعال. يرجى التواصل مع المالك للحصول على اشتراك.</p>
          <div className="bg-orange-900/15 border border-orange-700/30 rounded-xl p-4">
            <p className="text-orange-400 text-sm">للحصول على اشتراك، تواصل مع إدارة النظام</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center glow-ring">
            <RefreshCw className="animate-spin text-teal-600" size={28} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل البيانات...</p>
      </div>
    </div>
  );

  const stats = data?.stats || { todayAppointments: 0, totalPatients: 0, totalRevenue: 0, totalCollected: 0 };
  const statCards = [
    { label: t('dash.todayAppointments'), value: stats.todayAppointments, gradient: 'from-teal-500 to-teal-600', icon: CalendarDays, glow: 'stat-glow-sapphire', bg: 'bg-gradient-to-br' },
    { label: t('dash.totalPatients'), value: stats.totalPatients, gradient: 'from-orange-500 to-orange-600', icon: Users, glow: 'stat-glow-cyan', bg: 'bg-gradient-to-br' },
    { label: t('dash.revenue'), value: `${stats.totalRevenue?.toFixed(0)} ${currentClinic?.currency || 'SAR'}`, gradient: 'from-orange-600 to-orange-700', icon: TrendingUp, glow: 'stat-glow-coral', bg: 'bg-gradient-to-br' },
    { label: t('dash.collected'), value: `${stats.totalCollected?.toFixed(0)} ${currentClinic?.currency || 'SAR'}`, gradient: 'from-rose-500 to-rose-600', icon: DollarSign, glow: 'stat-glow-rose', bg: 'bg-gradient-to-br' },
  ];

  const statusColors: Record<string, string> = {
    scheduled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    completed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'مجدول', completed: 'تم', cancelled: 'ملغي',
  };

  const typeColors: Record<string, string> = {
    regular: 'border-teal-500', follow_up: 'border-orange-500',
    emergency: 'border-red-500', consultation: 'border-amber-500',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.greeting.morning');
    if (hour < 17) return t('dash.greeting.afternoon');
    return t('dash.greeting.evening');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">{getGreeting()} 👋</h1>
          <p className="text-muted-foreground/70 text-sm mt-1">{formatArabicDate(new Date(), { weekday: 'long', month: 'long', year: true, day: true })}</p>
        </div>
      </div>

      {/* Stat Cards — Professional white cards with left border accent + glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const borderColors = ['border-r-teal-600', 'border-r-orange-800', 'border-r-orange-600', 'border-r-rose-600'];
          const iconBgs = ['bg-teal-500/10 dark:bg-teal-950/35', 'bg-orange-800/15 dark:bg-orange-700/25', 'bg-orange-600/15 dark:bg-orange-600/35', 'bg-rose-600/15 dark:bg-rose-600/35'];
          const iconColors = ['text-teal-600 dark:text-teal-400', 'text-orange-600 dark:text-orange-400', 'text-orange-600 dark:text-orange-400', 'text-rose-600 dark:text-rose-400'];
          return (
            <div key={i} data-animate className={`stat-card-glow bg-card rounded-xl p-5 border border-border/50 border-r-4 ${borderColors[i]} shadow-sm hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1`}
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{card.label}</p>
                  <p className="text-2xl lg:text-[28px] font-black mt-1.5 metric-value text-foreground animate-count-up">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${iconBgs[i]} rounded-xl flex items-center justify-center icon-container-gradient`}>
                  <Icon size={22} className={iconColors[i]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {data?.revenueChart && (
          <div data-animate className="glass-card-enhanced bg-card rounded-xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-base">{t('dash.weeklyRevenue')}</h3>
              <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">
                <TrendingUp size={14} />
                <span>{t('common.active')}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" fill="url(#colorRevenue)" strokeWidth={2.5} name={t('dash.revenue')} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#0d9488', strokeWidth: 2, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Today's Appointments — Timeline style */}
        <div data-animate className="glass-card-enhanced bg-card rounded-xl p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground text-base">{t('dash.todayAppointments')}</h3>
            <span className="badge-glow">
              {data?.todayAppointments?.length || 0} موعد
            </span>
          </div>
          {data?.todayAppointments?.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto bg-muted/40 rounded-xl flex items-center justify-center mb-3">
                <CalendarDays size={28} className="text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">{t('dash.noAppointmentsToday')}</p>
            </div>
          ) : (
            <div className="space-y-0 max-h-[300px] overflow-y-auto sidebar-nav-scroll">
              {data?.todayAppointments?.map((apt: any, idx: number) => {
                const typeBorderColors: Record<string, string> = { regular: 'bg-teal-500', follow_up: 'bg-orange-500', emergency: 'bg-red-500', consultation: 'bg-amber-500' };
                return (
                  <div key={apt.id} className="flex gap-3.5 group relative">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${typeBorderColors[apt.type] || 'bg-gray-400'} ring-4 ring-card`} />
                      {idx < (data?.todayAppointments?.length || 0) - 1 && (
                        <div className="w-px flex-1 bg-border/50 min-h-[40px]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-4 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{apt.patient?.fullName}</p>
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{apt.startTime?.split('T')[1]?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{apt.title || apt.type}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusColors[apt.status] || ''}`}>
                          {statusLabels[apt.status] || apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== PATIENTS VIEW ==============
function PatientsView() {
  const { currentClinicId } = useAuth();
  const { t } = useLang();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const fetchPatients = async () => {
    if (!currentClinicId) return;
    const res = await fetch(`/api/patients?clinicId=${currentClinicId}&search=${search}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setPatients(data.patients);
      setTotalPages(data.pages);
    }
  };

  useEffect(() => { fetchPatients(); }, [currentClinicId, search, page]);

  const handleSave = async () => {
    const method = editPatient ? 'PUT' : 'POST';
    const body = editPatient ? { ...form, id: editPatient.id } : { ...form, clinicId: currentClinicId };
    await fetch('/api/patients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowModal(false);
    setEditPatient(null);
    setForm({});
    fetchPatients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return;
    await fetch('/api/patients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchPatients();
  };

  const openEdit = (p: any) => {
    setEditPatient(p);
    setForm(p);
    setShowModal(true);
  };

  const openNew = () => {
    setEditPatient(null);
    setForm({ fullName: '', phone: '', gender: 'male', bloodType: '', age: '', notes: '' });
    setShowModal(true);
  };

  const openMedicalRecords = async (p: any) => {
    setSelectedPatient(p);
    setShowRecordsModal(true);
    setLoadingRecords(true);
    setMedicalRecords([]);
    try {
      const res = await fetch(`/api/records?patientId=${p.id}`);
      if (res.ok) {
        const data = await res.json();
        setMedicalRecords(data);
      }
    } catch (e) {
      console.error('Error fetching records:', e);
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">{t('patients.title')}</h1>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-600/25 hover:-translate-y-0.5 active:scale-[0.98]">
          <Plus size={16} /> {t('patients.new')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
        <input
          placeholder={t('patients.searchPlaceholder')}
          className="w-full pr-10 pl-4 py-3 bg-card border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/40">
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('patients.fileNumber')}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('patients.fullName')}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('common.phone')}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('patients.gender')}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('patients.bloodType')}</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-t border-border/30 hover:bg-teal-600/[0.08] transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.fileNumber}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone || '-'}</td>
                  <td className="px-4 py-3">{p.gender === 'male' ? t('patients.male') : p.gender === 'female' ? t('patients.female') : '-'}</td>
                  <td className="px-4 py-3">{p.bloodType || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openMedicalRecords(p)} className="p-1.5 hover:bg-orange-500/10 dark:hover:bg-orange-950/20 rounded-lg transition-colors" title="عرض السجل الطبي والتشخيصات"><ClipboardCheck size={14} className="text-orange-500" /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-teal-500/10 dark:hover:bg-teal-950/20 rounded-lg transition-colors" title="تعديل"><Edit3 size={14} className="text-teal-500" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-950/30 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr><td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center">
                      <Users size={28} className="text-muted-foreground/25" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">لا يوجد مرضى بعد</p>
                    <p className="text-muted-foreground/50 text-xs">أضف مريضك الأول باستخدام زر &quot;مريض جديد&quot;</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-card border border-border/40 text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors">السابق</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button key={pageNum} onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum ? 'bg-teal-800 text-white shadow-sm' : 'bg-card border border-border/40 text-muted-foreground hover:bg-muted/50'}`}>
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="text-muted-foreground text-xs px-1">...</span>}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-card border border-border/40 text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors">التالي</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in border border-border/40 shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-l from-teal-700/25 to-transparent">
              <div className="w-9 h-9 bg-teal-500/10 dark:bg-teal-900/35 rounded-lg flex items-center justify-center">
                <Edit3 size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">{editPatient ? 'تعديل مريض' : 'مريض جديد'}</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground/80">الاسم الكامل *</label>
                <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                  value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">الهاتف</label>
                  <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">هاتف آخر</label>
                  <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.phone2 || ''} onChange={e => setForm({ ...form, phone2: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">الجنس</label>
                  <select className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.gender || 'male'} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">فصيلة الدم</label>
                  <select className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.bloodType || ''} onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                    <option value="">-</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">العمر</label>
                  <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground/80">الحالة الاجتماعية</label>
                  <select className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                    value={form.maritalStatus || ''} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                    <option value="">-</option>
                    <option value="single">أعزب</option>
                    <option value="married">متزوج</option>
                    <option value="divorced">مطلق</option>
                    <option value="widowed">أرمل</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground/80">البريد الإلكتروني</label>
                <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                  value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground/80">العنوان</label>
                <input className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                  value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-foreground/80">ملاحظات</label>
                <textarea className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm resize-none outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-800/10 transition-all"
                  rows={3} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border/40 bg-muted/20">
              <button onClick={handleSave}
                className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-md shadow-teal-600/25 text-sm">
                <Save size={15} className="inline ml-1.5" />حفظ
              </button>
              <button onClick={() => { setShowModal(false); setEditPatient(null); }}
                className="px-6 py-2.5 bg-muted/60 hover:bg-muted rounded-xl font-medium transition-colors text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records Modal — shows all past diagnoses for this patient */}
      {showRecordsModal && selectedPatient && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowRecordsModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-scale-in gradient-border" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/25">
                  <ClipboardCheck className="text-white" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black gradient-text">السجل الطبي للمريض</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.fullName} — {selectedPatient.fileNumber}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRecordsModal(false)} className="p-2 hover:bg-muted/40 rounded-lg transition-colors">
                <XCircle size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Patient info card */}
            <div className="bg-muted/30 border border-border/40 rounded-xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">الجنس</div>
                <div className="font-medium">{selectedPatient.gender === 'male' ? 'ذكر' : selectedPatient.gender === 'female' ? 'أنثى' : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">العمر</div>
                <div className="font-medium">{selectedPatient.age || '-'} سنة</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">فصيلة الدم</div>
                <div className="font-medium">{selectedPatient.bloodType || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">الهاتف</div>
                <div className="font-medium" dir="ltr">{selectedPatient.phone || '-'}</div>
              </div>
            </div>

            {/* Records list */}
            {loadingRecords ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-teal-400" size={28} />
                <span className="mr-2 text-muted-foreground">جاري تحميل السجلات...</span>
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck size={48} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">لا توجد تشخيصات سابقة</p>
                <p className="text-xs text-muted-foreground/60 mt-1">سيتم عرض التشخيصات هنا عند إتمام مواعيد المريض</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FileCheck size={16} className="text-orange-600" />
                    التشخيصات السابقة ({medicalRecords.length})
                  </h4>
                </div>
                {medicalRecords.map((record, idx) => (
                  <div key={record.id} className="bg-card border border-border/40 rounded-xl p-4 hover:border-orange-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                          {medicalRecords.length - idx}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {formatArabicDate(record.createdAt, { month: 'long', year: true, day: true })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.doctor?.fullName ? `د. ${record.doctor.fullName}` : 'الطبيب المعالج'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {record.chiefComplaint && (
                      <div className="mb-2 text-sm">
                        <span className="text-muted-foreground text-xs">الشكوى الرئيسية: </span>
                        <span className="text-foreground">{record.chiefComplaint}</span>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div className="bg-orange-500/5 border-r-2 border-orange-500 rounded-lg p-3 my-2">
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-1 flex items-center gap-1">
                          <ClipboardCheck size={12} /> التشخيص
                        </div>
                        <div className="text-sm text-foreground leading-relaxed">{record.diagnosis}</div>
                      </div>
                    )}
                    {record.treatmentPlan && (
                      <div className="mb-2 text-sm">
                        <span className="text-muted-foreground text-xs">خطة العلاج: </span>
                        <span className="text-foreground">{record.treatmentPlan}</span>
                      </div>
                    )}
                    {record.notes && (
                      <div className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border/20">
                        📝 {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-border/30">
              <button onClick={() => setShowRecordsModal(false)}
                className="px-6 py-2.5 bg-muted/60 hover:bg-muted rounded-xl font-medium transition-colors text-sm">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== APPOINTMENTS VIEW ==============
function AppointmentsView() {
  const { currentClinicId, clinics } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [bookingCopied, setBookingCopied] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [appointmentPrice, setAppointmentPrice] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const currentClinic = clinics.find(c => c.id === currentClinicId);

  const fetchAppointments = async () => {
    if (!currentClinicId) return;
    const [aptRes, docRes, patRes] = await Promise.all([
      fetch(`/api/appointments?clinicId=${currentClinicId}&date=${date}`),
      fetch(`/api/users`),
      fetch(`/api/patients?clinicId=${currentClinicId}`),
    ]);
    if (aptRes.ok) setAppointments(await aptRes.json());
    if (docRes.ok) {
      const users = await docRes.json();
      setDoctors(users.filter((u: any) => u.role === 'doctor'));
    }
    if (patRes.ok) {
      const data = await patRes.json();
      setPatients(data.patients || []);
    }
  };

  useEffect(() => { fetchAppointments(); }, [currentClinicId, date]);

  const handleSave = async () => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clinicId: currentClinicId }),
    });
    setShowModal(false);
    setForm({});
    fetchAppointments();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAppointments();
  };

  const handleComplete = (apt: any) => {
    setSelectedApt(apt);
    setAppointmentPrice('');
    setDiagnosis('');
    setShowPriceModal(true);
  };

  const confirmComplete = async () => {
    if (!selectedApt || !appointmentPrice || Number(appointmentPrice) <= 0) return;

    // Update appointment status to completed
    await fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedApt.id, status: 'completed' }),
    });

    // Save diagnosis as a medical record (if provided)
    if (diagnosis.trim()) {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedApt.patientId,
          doctorId: selectedApt.doctorId,
          chiefComplaint: selectedApt.title || 'كشف طبي',
          diagnosis: diagnosis.trim(),
          notes: `تشخيص من موعد بتاريخ ${formatDateEN(selectedApt.startTime)}`,
        }),
      });
    }

    // Create invoice as fully paid
    const price = Number(appointmentPrice);
    const taxPercentage = 0; // No tax for simple appointment
    const total = price;
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedApt.patientId,
        clinicId: currentClinicId,
        subtotal: price,
        insuranceDiscount: 0,
        taxPercentage,
        taxAmount: 0,
        total,
        paidAmount: total,
        dueAmount: 0,
        status: 'paid',
        paymentMethod: 'cash',
        items: JSON.stringify([{ item_name: selectedApt.title || 'كشف طبي', unit_price: price, quantity: 1 }]),
        notes: `فاتورة تلقائية من موعد - ${selectedApt.patient?.fullName || ''}`,
      }),
    });

    setShowPriceModal(false);
    setSelectedApt(null);
    setAppointmentPrice('');
    setDiagnosis('');
    fetchAppointments();
  };

  const handleCancel = async (id: string) => {
    await updateStatus(id, 'cancelled');
  };

  const typeLabels: Record<string, string> = { regular: 'عادي', follow_up: 'متابعة', emergency: 'طوارئ', consultation: 'استشارة' };
  const typeColors: Record<string, string> = {
    regular: 'border-r-teal-500 bg-teal-500/8 dark:bg-teal-500/18',
    follow_up: 'border-r-orange-800 bg-orange-800/8 dark:bg-orange-800/18',
    emergency: 'border-r-red-600 bg-red-600/8 dark:bg-red-600/18',
    consultation: 'border-r-orange-600 bg-orange-600/8 dark:bg-orange-600/18',
  };
  const statusLabels: Record<string, string> = {
    scheduled: 'مجدول', completed: 'تم', cancelled: 'ملغي',
  };
  const statusColors: Record<string, string> = {
    scheduled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    completed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  const activeAppointments = appointments.filter(a => !['completed', 'cancelled'].includes(a.status));
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black gradient-text">المواعيد</h1>
        <button onClick={() => { setForm({ type: 'regular', patientId: '', doctorId: '', startTime: `${date}T09:00`, endTime: `${date}T09:30` }); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 active:scale-[0.98] btn-primary-enhanced">
          <Plus size={16} /> موعد جديد
        </button>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center gap-3 glass-card-v2 rounded-2xl p-3.5 gradient-border">
        <button onClick={prevDay} className="p-2 hover:bg-teal-500/10 rounded-lg transition-colors"><ChevronRight size={18} /></button>
        <span className="font-bold flex-1 text-center">
          {formatArabicDate(date + 'T00:00:00', { weekday: 'long', month: 'long', year: true, day: true })}
        </span>
        <button onClick={nextDay} className="p-2 hover:bg-teal-500/10 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
        <button onClick={() => setDate(new Date().toISOString().split('T')[0])}
          className="px-4 py-1.5 text-xs bg-teal-500/10 text-teal-500 rounded-lg font-bold hover:bg-teal-500/10 transition-colors">اليوم</button>
      </div>

      {/* Booking Link */}
      {currentClinic && (
        <div className="flex items-center gap-2 glass-card bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700/40 rounded-xl p-3 gradient-border">
          <Link size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-sm text-teal-700 dark:text-teal-300 flex-1 font-bold">رابط الحجز العام للمرضى</span>
          {currentClinic.bookingSlug ? (
            <>
              <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${currentClinic.bookingSlug}`}
                className="flex-1 px-2 py-1.5 bg-white dark:bg-teal-900 border border-teal-300 dark:border-teal-700 rounded-lg text-xs font-mono max-w-[260px] text-foreground" />
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/booking/${currentClinic.bookingSlug}`);
                setBookingCopied(true);
                setTimeout(() => setBookingCopied(false), 2000);
              }} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                {bookingCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {bookingCopied ? 'تم' : 'نسخ'}
              </button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">لم يتم إنشاء رابط حجز بعد</span>
          )}
        </div>
      )}

      {/* Active Appointments List */}
      <div>
        <div className="section-header">
          <Clock size={20} className="text-teal-500" />
          <h2 className="text-lg font-black">المواعيد النشطة</h2>
          <span className="text-sm font-normal text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full">{activeAppointments.length}</span>
        </div>
        <div className="space-y-3">
          {activeAppointments.length === 0 ? (
            <div className="glass-card-v2 rounded-2xl p-10 text-center">
              <CalendarDays size={48} className="mx-auto text-muted-foreground/25 mb-3" />
              <p className="text-muted-foreground font-medium">لا توجد مواعيد نشطة لهذا اليوم</p>
            </div>
          ) : (
            activeAppointments.map(apt => (
              <div key={apt.id} className={`border-r-4 ${typeColors[apt.type] || ''} glass-card-v2 rounded-2xl p-4 hover-lift card-shine`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm font-bold">{apt.startTime?.split('T')[1]?.slice(0, 5)} - {apt.endTime?.split('T')[1]?.slice(0, 5)}</span>
                      <span className="text-xs px-2.5 py-0.5 bg-muted/70 rounded-full font-medium">{typeLabels[apt.type] || apt.type}</span>
                      <span className={`status-pill ${statusColors[apt.status] || 'bg-muted'}`}>{statusLabels[apt.status] || apt.status}</span>
                    </div>
                    <p className="font-bold text-[15px]">{apt.patient?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctor?.fullName} • {apt.title || typeLabels[apt.type]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleComplete(apt)}
                      className="text-xs px-4 py-2 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-bold transition-all duration-200 shadow-md shadow-orange-600/30 hover:shadow-lg flex items-center gap-1.5">
                      <CheckCircle size={14} /> تم
                    </button>
                    <button onClick={() => handleCancel(apt.id)}
                      className="text-xs px-4 py-2 bg-red-600/15 text-red-400 dark:text-red-400 hover:bg-red-500/25 rounded-lg font-bold transition-all duration-200 flex items-center gap-1.5 border border-red-400/30 dark:border-red-700/30">
                      <XCircle size={14} /> إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Appointments */}
      {completedAppointments.length > 0 && (
        <div>
          <div className="section-header">
            <CheckCircle size={20} className="text-orange-500" />
            <h2 className="text-lg font-black">المواعيد المكتملة</h2>
            <span className="text-sm font-normal text-muted-foreground bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 rounded-full">{completedAppointments.length}</span>
          </div>
          <div className="space-y-3">
            {completedAppointments.map(apt => (
              <div key={apt.id} className="border-r-4 border-r-orange-500 glass-card-v2 rounded-2xl p-4 opacity-75">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{apt.startTime?.split('T')[1]?.slice(0, 5)} - {apt.endTime?.split('T')[1]?.slice(0, 5)}</span>
                      <span className="text-xs px-2.5 py-0.5 bg-muted/70 rounded-full">{typeLabels[apt.type] || apt.type}</span>
                      <span className="status-pill bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">تم</span>
                    </div>
                    <p className="font-semibold">{apt.patient?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctor?.fullName} • {apt.title || typeLabels[apt.type]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Appointments */}
      {cancelledAppointments.length > 0 && (
        <div>
          <div className="section-header">
            <XCircle size={20} className="text-red-500" />
            <h2 className="text-lg font-black">المواعيد الملغاة</h2>
            <span className="text-sm font-normal text-muted-foreground bg-red-600/15 dark:bg-red-600/20 px-2.5 py-0.5 rounded-full">{cancelledAppointments.length}</span>
          </div>
          <div className="space-y-3">
            {cancelledAppointments.map(apt => (
              <div key={apt.id} className="border-r-4 border-r-red-500 glass-card-v2 rounded-2xl p-4 opacity-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{apt.startTime?.split('T')[1]?.slice(0, 5)} - {apt.endTime?.split('T')[1]?.slice(0, 5)}</span>
                      <span className="text-xs px-2.5 py-0.5 bg-muted/70 rounded-full">{typeLabels[apt.type] || apt.type}</span>
                      <span className="status-pill bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">ملغي</span>
                    </div>
                    <p className="font-medium line-through">{apt.patient?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctor?.fullName} • {apt.title || typeLabels[apt.type]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Modal - When completing appointment */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowPriceModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-md animate-scale-in gradient-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-700 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/25">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black gradient-text">إتمام الموعد</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApt?.patient?.fullName} — {selectedApt?.title || typeLabels[selectedApt?.type] || 'كشف'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">سعر الكشف (ر.س) *</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="أدخل السعر"
                    className="w-full pr-10 pl-4 py-3.5 input-glow text-sm text-lg font-black"
                    value={appointmentPrice}
                    onChange={e => setAppointmentPrice(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-orange-600" />
                  التشخيص الطبي للمريض
                  <span className="text-xs font-normal text-muted-foreground">(اختياري — يُحفظ في السجل الطبي للمريض)</span>
                </label>
                <textarea
                  placeholder="اكتب التشخيص الطبي للمريض بعد الكشف..."
                  className="w-full px-4 py-3 input-glow text-sm resize-none"
                  rows={3}
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Info size={12} />
                  سيتم حفظ التشخيص في السجل الطبي للمريض، ويمكن مراجعته لاحقاً من صفحة المرضى
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-700/40 rounded-xl p-3.5">
                <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">
                  سيتم تسجيل فاتورة تلقائياً في الفواتير كـ <span className="font-black">مدفوعة كلياً</span> بقيمة <span className="font-black text-teal-900 dark:text-teal-200">{appointmentPrice || '0'}</span> ر.س
                  {diagnosis.trim() && <span className="block mt-1 text-orange-600 dark:text-orange-400">+ سيتم حفظ التشخيص في السجل الطبي للمريض ✓</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={confirmComplete}
                disabled={!appointmentPrice || Number(appointmentPrice) <= 0}
                className="flex-1 py-3 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-orange-600/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <CheckCircle size={16} /> تأكيد وإنشاء فاتورة
              </button>
              <button onClick={() => setShowPriceModal(false)} className="px-6 py-3 bg-muted/70 hover:bg-muted rounded-xl font-bold transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in gradient-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/30">
                <CalendarDays className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-black gradient-text">موعد جديد</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">المريض *</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} - {p.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الطبيب *</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.doctorId || ''} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                  <option value="">اختر الطبيب</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">وقت البداية</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 input-glow text-sm"
                    value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">وقت النهاية</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 input-glow text-sm"
                    value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">نوع الموعد</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.type || 'regular'} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="regular">عادي</option>
                  <option value="follow_up">متابعة</option>
                  <option value="emergency">طوارئ</option>
                  <option value="consultation">استشارة</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">العنوان</label>
                <input className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ملاحظات</label>
                <textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none"
                  rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== RECORDS VIEW ==============
function RecordsView() {
  const { currentClinicId } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentClinicId) return;
    fetch(`/api/patients?clinicId=${currentClinicId}&search=${search}`)
      .then(r => r.ok ? r.json() : { patients: [] })
      .then(d => setPatients(d.patients || []));
  }, [currentClinicId, search]);

  const fetchRecords = async (patientId: string) => {
    const res = await fetch(`/api/records?patientId=${patientId}`);
    if (res.ok) setRecords(await res.json());
  };

  const selectPatient = (p: any) => {
    setSelectedPatient(p);
    fetchRecords(p.id);
  };

  const handleSave = async () => {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, patientId: selectedPatient.id }),
    });
    setShowForm(false);
    setForm({});
    fetchRecords(selectedPatient.id);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <h1 className="text-3xl font-black gradient-text">السجلات الطبية</h1>

      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input placeholder="ابحث عن مريض لعرض سجلاته الطبية..."
          className="w-full pr-10 pl-4 py-3.5 input-glow text-sm"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {!selectedPatient ? (
        <div className="space-y-2">
          {patients.map(p => (
            <button key={p.id} onClick={() => selectPatient(p)}
              className="w-full flex items-center gap-3 p-3 glass-card-v2 rounded-xl hover:bg-teal-500/10 transition-all text-right hover-lift">
              <Activity className="text-teal-500 shrink-0" size={18} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.fullName}</p>
                <p className="text-sm text-muted-foreground">{p.fileNumber} • {p.phone}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between glass-card-v2 rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-lg">{selectedPatient.fullName}</h3>
              <p className="text-sm text-muted-foreground">{selectedPatient.fileNumber} • {selectedPatient.phone}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm({}); setShowForm(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-teal-600/25">
                <Plus size={14} /> كشف جديد
              </button>
              <button onClick={() => { setSelectedPatient(null); setRecords([]); }}
                className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm transition-colors">
                رجوع
              </button>
            </div>
          </div>

          {records.map(r => (
            <div key={r.id} className="glass-card-v2 rounded-2xl p-4 space-y-2 border-r-4 border-r-teal-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{formatDateEN(r.createdAt)}</span>
                <span className="text-sm text-teal-300">{r.doctor?.fullName}</span>
              </div>
              {r.chiefComplaint && <div><span className="text-sm font-medium">الشكوى: </span><span className="text-sm">{r.chiefComplaint}</span></div>}
              {r.diagnosis && <div><span className="text-sm font-medium">التشخيص: </span><span className="text-sm">{r.diagnosis}</span></div>}
              {r.treatmentPlan && <div><span className="text-sm font-medium">خطة العلاج: </span><span className="text-sm">{r.treatmentPlan}</span></div>}
              {r.notes && <div><span className="text-sm font-medium">ملاحظات: </span><span className="text-sm text-muted-foreground">{r.notes}</span></div>}
            </div>
          ))}

          {records.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">لا توجد سجلات طبية لهذا المريض</p>
          )}

          {showForm && (
            <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
              <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in gradient-border" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 gradient-text">كشف جديد</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">الشكوى الرئيسية</label>
                    <textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none"
                      rows={2} value={form.chiefComplaint || ''} onChange={e => setForm({ ...form, chiefComplaint: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">التشخيص</label>
                    <input className="w-full px-3 py-2.5 input-glow text-sm"
                      value={form.diagnosis || ''} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">خطة العلاج</label>
                    <textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none"
                      rows={2} value={form.treatmentPlan || ''} onChange={e => setForm({ ...form, treatmentPlan: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ملاحظات</label>
                    <textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none"
                      rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============== INVOICES VIEW ==============
function InvoicesView() {
  const { currentClinicId } = useAuth();
  const [data, setData] = useState<any>({ invoices: [], stats: {} });
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ items: [{ item_name: 'كشف طبي', unit_price: 0, quantity: 1 }] });

  const fetchInvoices = async () => {
    if (!currentClinicId) return;
    const [invRes, patRes] = await Promise.all([
      fetch(`/api/invoices?clinicId=${currentClinicId}`),
      fetch(`/api/patients?clinicId=${currentClinicId}`),
    ]);
    if (invRes.ok) setData(await invRes.json());
    if (patRes.ok) { const d = await patRes.json(); setPatients(d.patients || []); }
  };

  useEffect(() => { fetchInvoices(); }, [currentClinicId]);

  const handleSave = async () => {
    const subtotal = form.items.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0);
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clinicId: currentClinicId, subtotal, paidAmount: form.paidAmount || 0, status: subtotal <= (form.paidAmount || 0) ? 'paid' : 'pending' }),
    });
    setShowModal(false);
    setForm({ items: [{ item_name: 'كشف طبي', unit_price: 0, quantity: 1 }] });
    fetchInvoices();
  };

  const toggleStatus = async (inv: any) => {
    const newStatus = inv.status === 'paid' ? 'pending' : 'paid';
    const paidAmount = newStatus === 'paid' ? inv.total : 0;
    await fetch('/api/invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inv.id, status: newStatus, paidAmount, dueAmount: inv.total - paidAmount }),
    });
    fetchInvoices();
  };

  const stats = data.stats || {};
  const statusLabels: Record<string, string> = { pending: 'معلقة', paid: 'مدفوعة', partial: 'جزئية', cancelled: 'ملغاة' };
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    paid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    partial: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 active:scale-[0.98] btn-primary-enhanced">
          <Plus size={16} /> فاتورة جديدة
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الفواتير', value: `${(stats.totalRevenue || 0).toFixed(0)} ر.س`, icon: Receipt, color: 'text-teal-700', bg: 'bg-teal-100/50' },
          { label: 'المدفوع', value: `${(stats.totalCollected || 0).toFixed(0)} ر.س`, icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100/50' },
          { label: 'المعلق', value: `${(stats.totalPending || 0).toFixed(0)} ر.س`, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-600/15' },
          { label: 'عدد الفواتير', value: stats.totalInvoices || 0, icon: Hash, color: 'text-purple-600', bg: 'bg-purple-600/15' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card-v2 rounded-2xl p-4 hover-lift card-shine" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className={s.color} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
                  <p className="font-black metric-value counter-animate">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card-v2 rounded-2xl overflow-hidden gradient-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm fancy-table">
            <thead>
              <tr>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">رقم الفاتورة</th>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">المريض</th>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">المبلغ</th>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">المدفوع</th>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">الحالة</th>
                <th className="text-right px-4 py-3.5 font-bold text-xs uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {(data.invoices || []).map((inv: any) => (
                <tr key={inv.id} className="border-t border-border/50">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3.5 font-medium">{inv.patient?.fullName}</td>
                  <td className="px-4 py-3.5 font-black metric-value">{inv.total?.toFixed(2)} ر.س</td>
                  <td className="px-4 py-3.5 font-medium">{inv.paidAmount?.toFixed(2)} ر.س</td>
                  <td className="px-4 py-3.5">
                    <span className={`status-pill ${statusColors[inv.status] || ''}`}>{statusLabels[inv.status] || inv.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleStatus(inv)}
                      className="text-xs px-3 py-1.5 bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/10 transition-colors font-bold">
                      {inv.status === 'paid' ? 'إلغاء الدفع' : 'تأكيد الدفع'}
                    </button>
                  </td>
                </tr>
              ))}
              {(data.invoices || []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">لا توجد فواتير</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in gradient-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 gradient-text">فاتورة جديدة</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">المريض *</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البنود</label>
                {form.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input placeholder="اسم البند" className="flex-1 px-3 py-2 input-glow text-sm outline-none"
                      value={item.item_name} onChange={e => {
                        const items = [...form.items]; items[idx] = { ...items[idx], item_name: e.target.value }; setForm({ ...form, items });
                      }} />
                    <input placeholder="السعر" type="number" className="w-24 px-3 py-2 input-glow text-sm outline-none"
                      value={item.unit_price} onChange={e => {
                        const items = [...form.items]; items[idx] = { ...items[idx], unit_price: parseFloat(e.target.value) || 0 }; setForm({ ...form, items });
                      }} />
                    <button onClick={() => { const items = form.items.filter((_: any, i: number) => i !== idx); setForm({ ...form, items }); }}
                      className="p-1.5 text-red-500 hover:bg-red-950/30 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => setForm({ ...form, items: [...form.items, { item_name: '', unit_price: 0, quantity: 1 }] })}
                  className="text-sm text-teal-300 hover:underline">+ إضافة بند</button>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">المبلغ المدفوع</label>
                <input type="number" className="w-full px-3 py-2.5 input-glow text-sm"
                  value={form.paidAmount || ''} onChange={e => setForm({ ...form, paidAmount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>المجموع:</span><span>{form.items?.reduce((s: number, i: any) => s + i.unit_price, 0).toFixed(2)} ر.س</span></div>
                <div className="flex justify-between"><span>الضريبة (15%):</span><span>{(form.items?.reduce((s: number, i: any) => s + i.unit_price, 0) * 0.15).toFixed(2)} ر.س</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-1"><span>الإجمالي:</span><span>{(form.items?.reduce((s: number, i: any) => s + i.unit_price, 0) * 1.15).toFixed(2)} ر.س</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== INVENTORY VIEW ==============
function InventoryView() {
  const { currentClinicId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const fetchInventory = async () => {
    if (!currentClinicId) return;
    const params = new URLSearchParams({ clinicId: currentClinicId, search, itemType: typeFilter });
    const res = await fetch(`/api/inventory?${params}`);
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { fetchInventory(); }, [currentClinicId, search, typeFilter]);

  const handleSave = async () => {
    const method = editItem ? 'PUT' : 'POST';
    await fetch('/api/inventory', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editItem ? { ...form, id: editItem.id } : { ...form, clinicId: currentClinicId }) });
    setShowModal(false); setEditItem(null); setForm({}); fetchInventory();
  };

  const typeLabels: Record<string, string> = { medication: 'دواء', supply: 'مستلزم', equipment: 'معدات', other: 'أخرى' };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">إدارة المخزون</h1>
        <button onClick={() => { setEditItem(null); setForm({ itemName: '', itemType: 'medication', quantity: 0, purchasePrice: 0, sellingPrice: 0 }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-teal-600/25 hover:-translate-y-0.5 active:scale-[0.98]">
          <Plus size={16} /> صنف جديد
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input placeholder="بحث..." className="w-full pr-10 pl-4 py-3 input-glow text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-3 input-glow text-sm"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">الكل</option>
          <option value="medication">دواء</option>
          <option value="supply">مستلزم</option>
          <option value="equipment">معدات</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      <div className="glass-card-v2 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-teal-900/12 dark:bg-teal-900/18">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 font-medium">النوع</th>
                <th className="text-right px-4 py-3 font-medium">الكمية</th>
                <th className="text-right px-4 py-3 font-medium">سعر الشراء</th>
                <th className="text-right px-4 py-3 font-medium">سعر البيع</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-border hover:bg-teal-600/8 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 bg-muted rounded-full">{typeLabels[item.itemType] || item.itemType}</span></td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.purchasePrice?.toFixed(2)}</td>
                  <td className="px-4 py-3">{item.sellingPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditItem(item); setForm(item); setShowModal(true); }} className="p-1.5 hover:bg-teal-500/10 dark:hover:bg-teal-950/20 rounded-lg transition-colors"><Edit3 size={15} className="text-teal-500" /></button>
                      <button onClick={async () => { if (!confirm('حذف؟')) return; await fetch('/api/inventory', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) }); fetchInventory(); }} className="p-1.5 hover:bg-red-950/30 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={15} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد أصناف</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 gradient-text">{editItem ? 'تعديل صنف' : 'صنف جديد'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">اسم الصنف *</label>
                <input className="w-full px-3 py-2.5 input-glow text-sm" value={form.itemName || ''} onChange={e => setForm({ ...form, itemName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">النوع</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm" value={form.itemType || 'medication'} onChange={e => setForm({ ...form, itemType: e.target.value })}>
                  <option value="medication">دواء</option>
                  <option value="supply">مستلزم</option>
                  <option value="equipment">معدات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">الكمية</label>
                  <input type="number" className="w-full px-3 py-2.5 input-glow text-sm" value={form.quantity || 0} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">سعر الشراء</label>
                  <input type="number" className="w-full px-3 py-2.5 input-glow text-sm" value={form.purchasePrice || 0} onChange={e => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">سعر البيع</label>
                  <input type="number" className="w-full px-3 py-2.5 input-glow text-sm" value={form.sellingPrice || 0} onChange={e => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REPORTS VIEW ==============
function ReportsView() {
  const { currentClinicId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'revenue' | 'appointments' | 'patients'>('revenue');

  useEffect(() => {
    if (!currentClinicId) return;
    setLoading(true);
    fetch(`/api/dashboard?clinicId=${currentClinicId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentClinicId]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><RefreshCw className="animate-spin text-teal-300" size={32} /></div>;

  const CHART_COLORS = ['#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const revenueData = data?.revenueChart || [];
  const appointmentStats = data?.appointmentStats || [];
  const patientStats = data?.patientStats || [];

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <h1 className="text-3xl font-black gradient-text">التقارير</h1>

      <div className="flex gap-2 glass-card-v2 rounded-xl p-1.5 gradient-border">
        {[
          { id: 'revenue' as const, label: 'الإيرادات' },
          { id: 'appointments' as const, label: 'المواعيد' },
          { id: 'patients' as const, label: 'المرضى' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-gradient-to-l from-teal-700 to-teal-800 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="glass-card-v2 rounded-2xl p-5 hover-lift gradient-border">
          <h3 className="font-bold mb-4 gradient-text text-lg">تقرير الإيرادات</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rptRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="20%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fill="url(#rptRev)" strokeWidth={2} name="الإيرادات" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="glass-card-v2 rounded-2xl p-5 hover-lift gradient-border">
          <h3 className="font-bold mb-4 gradient-text text-lg">تقرير المواعيد</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={appointmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} name="العدد" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'patients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-v2 rounded-2xl p-5 hover-lift">
            <h3 className="font-bold mb-4 gradient-text">توزيع المرضى حسب الجنس</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={patientStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {patientStats.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card-v2 rounded-2xl p-5 hover-lift">
            <h3 className="font-bold mb-4 gradient-text">إحصائيات عامة</h3>
            <div className="space-y-4">
              {[
                { label: 'إجمالي المرضى', value: data?.stats?.totalPatients || 0, icon: Users, color: 'text-teal-700', bg: 'bg-teal-100/50' },
                { label: 'مواعيد اليوم', value: data?.stats?.todayAppointments || 0, icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-100/50' },
                { label: 'الإيرادات الكلية', value: `${(data?.stats?.totalRevenue || 0).toFixed(0)} ر.س`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-600/15' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all table-row-hover">
                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <Icon size={20} className={s.color} />
                    </div>
                    <div className="flex-1"><p className="text-sm font-medium text-muted-foreground">{s.label}</p></div>
                    <p className="font-black metric-value counter-animate">{s.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== TASKS VIEW ==============
function TasksView() {
  const { currentClinicId, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);

  const fetchTasks = async () => {
    if (!currentClinicId) return;
    const params = new URLSearchParams({ clinicId: currentClinicId, status: statusFilter });
    const res = await fetch(`/api/tasks?${params}`);
    if (res.ok) setTasks(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchTasks(); }, [currentClinicId, statusFilter]);

  const handleSave = async () => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clinicId: currentClinicId }),
    });
    setShowModal(false); setForm({}); fetchTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchTasks();
  };

  const priorityColors: Record<string, string> = { critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', low: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' };
  const priorityLabels: Record<string, string> = { critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض' };
  const statusLabels: Record<string, string> = { todo: 'معلقة', in_progress: 'جارية', done: 'مكتملة', cancelled: 'ملغاة' };
  const statusColors: Record<string, string> = { todo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', in_progress: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', done: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
  const rankLabels: Record<string, string> = { owner: 'المالك', manager: 'مدير', senior: 'أول', junior: 'مبتدئ' };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black gradient-text">المهام</h1>
        <button onClick={() => { fetchUsers(); setForm({ title: '', description: '', priority: 'medium', rank: 'junior', assigneeId: '', dueDate: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 active:scale-[0.98] btn-primary-enhanced">
          <Plus size={16} /> مهمة جديدة
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'todo', 'in_progress', 'done'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s ? 'bg-gradient-to-l from-teal-700 to-teal-800 text-white' : 'glass-card text-muted-foreground hover:text-foreground'
            }`}>{s === '' ? 'الكل' : statusLabels[s]}</button>
        ))}
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="glass-card-v2 rounded-2xl p-4 hover-lift border-r-4 border-r-teal-600 table-row-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[t.priority] || ''}`}>{priorityLabels[t.priority] || t.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status] || ''}`}>{statusLabels[t.status] || t.status}</span>
                  {t.rank && <span className="text-xs px-2 py-0.5 rounded-full bg-muted flex items-center gap-1">{t.rank === 'owner' ? <Crown size={10} /> : t.rank === 'manager' ? <BadgeCheck size={10} /> : <Star size={10} />}{rankLabels[t.rank]}</span>}
                </div>
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {t.assignee && <span>{t.assignee.fullName}</span>}
                  {t.dueDate && <span>{formatDateEN(t.dueDate)}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                {t.status === 'todo' && <button onClick={() => updateStatus(t.id, 'in_progress')} className="text-xs px-2.5 py-1.5 bg-teal-800 text-white rounded-lg">بدء</button>}
                {t.status === 'in_progress' && <button onClick={() => updateStatus(t.id, 'done')} className="text-xs px-2.5 py-1.5 bg-orange-700 text-white rounded-lg">إتمام</button>}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="glass-card-v2 rounded-2xl p-12 text-center text-muted-foreground"><ListTodo size={40} className="mx-auto text-muted-foreground/30 mb-3" /><p className="font-medium">لا توجد مهام</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 gradient-text">مهمة جديدة</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1 block">العنوان *</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">الوصف</label><textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none" rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">الأولوية</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="critical">حرج</option><option value="high">عالي</option><option value="medium">متوسط</option><option value="low">منخفض</option></select></div>
                <div><label className="text-sm font-medium mb-1 block">الرتبة</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={form.rank || 'junior'} onChange={e => setForm({ ...form, rank: e.target.value })}><option value="owner">المالك</option><option value="manager">مدير</option><option value="senior">أول</option><option value="junior">مبتدئ</option></select></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">المسؤول</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={form.assigneeId || ''} onChange={e => setForm({ ...form, assigneeId: e.target.value })}><option value="">اختر</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}</select></div>
              <div><label className="text-sm font-medium mb-1 block">تاريخ الاستحقاق</label><input type="date" className="w-full px-3 py-2.5 input-glow text-sm" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== MANAGEMENT VIEW ==============
function ManagementView() {
  const { user, currentClinicId, clinics, setCurrentClinicId, loginAs } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [clinicUsers, setClinicUsers] = useState<any[]>([]);
  const [clinicTasks, setClinicTasks] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'users' | 'tasks' | 'booking'>('info');
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [clinicForm, setClinicForm] = useState<any>({});
  const [taskForm, setTaskForm] = useState<any>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bookingCopied, setBookingCopied] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState<any>({});
  const [staffError, setStaffError] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState('');

  const fetchClinicData = async (clinicId: string) => {
    const [cRes, uRes, tRes] = await Promise.all([
      fetch(`/api/clinics?id=${clinicId}`),
      fetch('/api/users'),
      fetch(`/api/tasks?clinicId=${clinicId}`),
    ]);
    if (cRes.ok) { const d = await cRes.json(); setSelectedClinic(d.clinic || d); }
    if (uRes.ok) { const users = await uRes.json(); setClinicUsers(users.filter((u: any) => u.clinicId === clinicId)); setAllUsers(users); }
    if (tRes.ok) setClinicTasks(await tRes.json());
  };

  useEffect(() => {
    if (selectedClinic?.id) fetchClinicData(selectedClinic.id);
  }, [selectedClinic?.id]);

  // Auto-select clinic for admin users (they have only one clinic)
  useEffect(() => {
    if (!selectedClinic && clinics.length > 0 && user?.role === 'admin') {
      setSelectedClinic(clinics[0]);
    }
  }, [clinics, selectedClinic, user?.role]);

  const addClinic = async () => {
    await fetch('/api/clinics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clinicForm) });
    setShowAddClinic(false); setClinicForm({});
    const res = await fetch('/api/clinics');
    if (res.ok) { const cs = await res.json(); if (cs.length > 0) setSelectedClinic(cs[cs.length - 1]); }
  };

  const updateClinic = async (data: any) => {
    await fetch('/api/clinics', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedClinic.id, ...data }) });
    fetchClinicData(selectedClinic.id);
  };

  const addTask = async () => {
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...taskForm, clinicId: selectedClinic.id }) });
    setShowTaskModal(false); setTaskForm({}); fetchClinicData(selectedClinic.id);
  };

  const changeRole = async (userId: string, role: string) => {
    await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, role }) });
    fetchClinicData(selectedClinic.id);
  };

  const addStaff = async () => {
    setStaffError('');
    if (!staffForm.username || !staffForm.password || !staffForm.fullName || !staffForm.role) {
      setStaffError('جميع الحقول مطلوبة');
      return;
    }
    if (staffForm.password.length < 6) {
      setStaffError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
      return;
    }
    setStaffLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: staffForm.username,
          password: staffForm.password,
          fullName: staffForm.fullName,
          role: staffForm.role,
          phone: staffForm.phone || undefined,
          email: staffForm.email || undefined,
          clinicId: selectedClinic.id,
          permissions: {
            dashboard: true,
            patients: ['doctor', 'reception', 'nurse'].includes(staffForm.role),
            appointments: true,
            records: staffForm.role === 'doctor',
            invoices: ['admin', 'reception', 'accountant'].includes(staffForm.role),
            inventory: staffForm.role === 'admin',
            reports: staffForm.role === 'admin',
            settings: false,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddStaff(false);
        setStaffForm({});
        fetchClinicData(selectedClinic.id);
      } else {
        setStaffError(data.error || 'حدث خطأ أثناء إضافة الموظف');
      }
    } catch {
      setStaffError('حدث خطأ في الاتصال');
    }
    setStaffLoading(false);
  };

  const togglePassword = (uid: string) => {
    setRevealedPasswords(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const copyCredential = async (uid: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(uid);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* ignore */ }
  };

  const handleImpersonate = async (u: any) => {
    setImpersonateError('');
    if (!confirm(`سيتم تسجيل الدخول كـ "${u.fullName}" (${u.username}). يمكنك العودة إلى حساب المالك لاحقاً. هل تريد المتابعة؟`)) return;
    setImpersonating(true);
    const res = await loginAs(u.id);
    if (!res.ok) {
      setImpersonateError(res.error || 'فشل الدخول كالمستخدم');
      setImpersonating(false);
    }
    // On success the entire app re-renders under the impersonated user, so no need to reset state.
  };

  const roleColors: Record<string, string> = { super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', doctor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400', reception: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', accountant: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', nurse: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  const roleLabels: Record<string, string> = { super_admin: 'المالك', admin: 'مدير', doctor: 'طبيب', reception: 'استقبال', accountant: 'محاسب', nurse: 'تمريض' };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black gradient-text">إدارة العيادات</h1>
        {user?.role === 'super_admin' && (
          <button onClick={() => { setClinicForm({ name: '', phone: '', address: '', currency: 'SAR', paymentMode: 'postpaid', slotDuration: 30 }); setShowAddClinic(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 active:scale-[0.98] btn-primary-enhanced">
            <Plus size={16} /> إضافة عيادة
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {clinics.map(c => (
          <button key={c.id} onClick={() => setSelectedClinic(c)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedClinic?.id === c.id ? 'bg-gradient-to-l from-teal-700 to-teal-800 text-white shadow-lg shadow-teal-600/25' : 'glass-card text-muted-foreground hover:text-foreground'
            }`}>{c.name}</button>
        ))}
      </div>

      {!selectedClinic ? (
        <div className="glass-card-v2 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 mx-auto bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={40} className="text-muted-foreground/50 animate-float" />
          </div>
          <p className="text-muted-foreground font-medium">اختر عيادة أو أضف واحدة جديدة</p>
        </div>
      ) : (
        <>
          {/* Empty state banner */}
          {(!selectedClinic._count || (selectedClinic._count.patients === 0 && selectedClinic._count.appointments === 0 && selectedClinic._count.tasks === 0)) && (
            <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-300 dark:border-teal-900 rounded-2xl p-4 flex items-center gap-3">
              <Building2 className="text-teal-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-teal-400">عيادة جديدة — غير مستخدمة</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">جميع البيانات صفرية. ابدأ بإضافة المرضى والموظفين.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {(['info', 'users', 'tasks', 'booking'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t ? 'bg-gradient-to-l from-teal-700 to-teal-800 text-white shadow-md' : 'glass-card text-muted-foreground hover:text-foreground'
                }`}>{t === 'info' ? 'معلومات' : t === 'users' ? 'المستخدمون والرتب' : t === 'tasks' ? 'المهام' : 'رابط الحجز'}</button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="glass-card-v2 rounded-2xl p-6 space-y-4 gradient-border">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">اسم العيادة</label><p className="font-medium">{selectedClinic.name}</p></div>
                <div><label className="text-xs text-muted-foreground">الهاتف</label><p className="font-medium">{selectedClinic.phone || '-'}</p></div>
                <div><label className="text-xs text-muted-foreground">العنوان</label><p className="font-medium">{selectedClinic.address || '-'}</p></div>
                <div><label className="text-xs text-muted-foreground">العملة</label><p className="font-medium">{getCurrencyLabel(selectedClinic.currency)}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="text-center p-3 bg-muted/30 rounded-xl"><p className="text-2xl font-bold gradient-text">{selectedClinic._count?.patients || 0}</p><p className="text-xs text-muted-foreground">مرضى</p></div>
                <div className="text-center p-3 bg-muted/30 rounded-xl"><p className="text-2xl font-bold gradient-text">{selectedClinic._count?.appointments || 0}</p><p className="text-xs text-muted-foreground">مواعيد</p></div>
                <div className="text-center p-3 bg-muted/30 rounded-xl"><p className="text-2xl font-bold gradient-text">{selectedClinic._count?.tasks || 0}</p><p className="text-xs text-muted-foreground">مهام</p></div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-3">
              {impersonateError && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 rounded-xl p-3 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {impersonateError}
                </div>
              )}
              {user?.role === 'super_admin' && (
                <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-300 dark:border-teal-900 rounded-xl p-3 text-teal-700 dark:text-teal-300 text-xs flex items-start gap-2">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">صلاحيات المالك</p>
                    <p className="opacity-80 mt-0.5">يمكنك رؤية كلمات مرور جميع الموظفين والدخول إلى أي حساب لمعاينة العيادة.</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => { setStaffForm({ username: '', password: '', fullName: '', role: 'reception', phone: '', email: '' }); setStaffError(''); setShowAddStaff(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-l from-teal-700 to-teal-800 text-white rounded-xl text-sm font-medium shadow-lg shadow-teal-600/25">
                  <UserPlus size={14} /> إضافة موظف
                </button>
              </div>
              {clinicUsers.map(u => {
                const revealed = !!revealedPasswords[u.id];
                const password = u.passwordPlain || '—';
                const masked = revealed ? password : '••••••••';
                return (
                  <div key={u.id} className="glass-card-v2 rounded-xl p-4 hover-lift table-row-hover">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/30 avatar-ring shrink-0">{u.fullName?.charAt(0)}</div>
                      <div className="flex-1 min-w-[140px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{u.fullName}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleColors[u.role] || ''}`}>{roleLabels[u.role] || u.role}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{u.username}</p>
                      </div>

                      {/* Credentials panel — visible to owner (super_admin) only */}
                      {user?.role === 'super_admin' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="bg-muted/40 dark:bg-white/5 border border-border/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5" dir="ltr">
                            <KeyRound size={12} className="text-teal-500 shrink-0" />
                            <span className="text-xs font-mono text-foreground/90 select-all">{masked}</span>
                            <button onClick={() => togglePassword(u.id)} className="p-0.5 text-muted-foreground hover:text-teal-500 transition-colors" title={revealed ? 'إخفاء' : 'إظهار'}>
                              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button onClick={() => copyCredential(u.id, password)} className="p-0.5 text-muted-foreground hover:text-orange-500 transition-colors" title="نسخ">
                              {copiedId === u.id ? <CheckCircle2 size={13} className="text-orange-500" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                      )}

                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        className="px-3 py-1.5 input-glow text-xs rounded-lg">
                        <option value="admin">مدير</option>
                        <option value="doctor">طبيب</option>
                        <option value="reception">استقبال</option>
                        <option value="accountant">محاسب</option>
                        <option value="nurse">تمريض</option>
                      </select>

                      {/* Login as user — owner only */}
                      {user?.role === 'super_admin' && u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleImpersonate(u)}
                          disabled={impersonating}
                          title={`الدخول كـ ${u.fullName}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg text-xs font-medium shadow-md shadow-orange-600/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                          {impersonating ? <RefreshCw size={12} className="animate-spin" /> : <LogIn size={12} />}
                          دخول
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {clinicUsers.length === 0 && <p className="text-center py-8 text-muted-foreground">لا يوجد مستخدمون في هذه العيادة</p>}
            </div>
          )}

          {tab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => { setTaskForm({ title: '', description: '', priority: 'medium', rank: 'junior', assigneeId: '', dueDate: '' }); setShowTaskModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-l from-teal-700 to-teal-800 text-white rounded-xl text-sm font-medium shadow-lg shadow-teal-600/25">
                  <Plus size={14} /> مهمة جديدة
                </button>
              </div>
              {clinicTasks.map(t => (
                <div key={t.id} className="glass-card-v2 rounded-xl p-3 hover-lift flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'done' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>{t.status === 'done' ? 'مكتملة' : t.status === 'in_progress' ? 'جارية' : 'معلقة'}</span>
                  <span className="font-medium text-sm flex-1">{t.title}</span>
                  {t.assignee && <span className="text-xs text-muted-foreground">{t.assignee.fullName}</span>}
                </div>
              ))}
              {clinicTasks.length === 0 && <p className="text-center py-4 text-muted-foreground text-sm">لا توجد مهام</p>}
            </div>
          )}

          {tab === 'booking' && (
            <div className="glass-card-v2 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-teal-700 dark:text-teal-400">رابط الحجز العام</h3>
                  <p className="text-sm text-muted-foreground mt-1">يمكن للمرضى حجز مواعيد عبر هذا الرابط</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-foreground">{selectedClinic.bookingEnabled ? 'مفعّل' : 'معطّل'}</span>
                  <button onClick={() => updateClinic({ bookingEnabled: !selectedClinic.bookingEnabled })}
                    className={`p-1 rounded-lg transition-colors ${selectedClinic.bookingEnabled ? 'bg-teal-800 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {selectedClinic.bookingEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </label>
              </div>
              {selectedClinic.bookingSlug ? (
                <div className="flex items-center gap-2">
                  <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${selectedClinic.bookingSlug}`}
                    className="flex-1 px-3 py-2 input-glow text-sm font-mono text-foreground" />
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/booking/${selectedClinic.bookingSlug}`); setBookingCopied(true); setTimeout(() => setBookingCopied(false), 2000); }}
                    className="px-4 py-2 bg-gradient-to-l from-teal-600 to-teal-700 text-white rounded-xl text-sm font-medium flex items-center gap-1 shadow-lg shadow-teal-600/25">
                    {bookingCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {bookingCopied ? 'تم' : 'نسخ'}
                  </button>
                </div>
              ) : (
                <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-400/40 dark:border-orange-800/30 rounded-xl p-4 text-center">
                  <p className="text-orange-700 dark:text-orange-400 text-sm font-medium">رابط الحجز غير متاح بعد</p>
                  <p className="text-muted-foreground text-xs mt-1">سيتم إنشاؤه تلقائياً عند تفعيل الحجز</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showAddClinic && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowAddClinic(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 gradient-text">إضافة عيادة جديدة</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1 block">اسم العيادة *</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={clinicForm.name || ''} onChange={e => setClinicForm({ ...clinicForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">الهاتف</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={clinicForm.phone || ''} onChange={e => setClinicForm({ ...clinicForm, phone: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">العنوان</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={clinicForm.address || ''} onChange={e => setClinicForm({ ...clinicForm, address: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">العملة</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={clinicForm.currency || 'SAR'} onChange={e => setClinicForm({ ...clinicForm, currency: e.target.value })}><option value="SAR">ريال سعودي (ر.س)</option><option value="QAR">ريال قطري (ر.ق)</option><option value="AED">درهم إماراتي (د.إ)</option><option value="EGP">جنيه مصري (ج.م)</option><option value="KWD">دينار كويتي (د.ك)</option><option value="BHD">دينار بحريني (د.ب)</option><option value="OMR">ريال عماني (ر.ع)</option><option value="JOD">دينار أردني (د.أ)</option><option value="LBP">ليرة لبنانية (ل.ل)</option><option value="IQD">دينار عراقي (د.ع)</option><option value="SYP">ليرة سورية (ل.س)</option><option value="YER">ريال يمني (ر.ي)</option><option value="DZD">دينار جزائري (د.ج)</option><option value="TND">دينار تونسي (د.ت)</option><option value="MAD">درهم مغربي (د.م)</option><option value="LYD">دينار ليبي (د.ل)</option><option value="SDG">جنيه سوداني (ج.س)</option><option value="MRU">أوقية موريتانية (أ.م)</option><option value="SOS">شلن صومالي (ش.ص)</option><option value="DJF">فرنك جيبوتي (ف.ج)</option><option value="USD">دولار أمريكي ($)</option><option value="EUR">يورو (€)</option><option value="GBP">جنيه إسترليني (£)</option></select></div>
                <div><label className="text-sm font-medium mb-1 block">مدة الموعد (دقيقة)</label><input type="number" className="w-full px-3 py-2.5 input-glow text-sm" value={clinicForm.slotDuration || 30} onChange={e => setClinicForm({ ...clinicForm, slotDuration: parseInt(e.target.value) })} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addClinic} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">إضافة</button>
              <button onClick={() => setShowAddClinic(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowTaskModal(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 gradient-text">مهمة جديدة</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1 block">العنوان *</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={taskForm.title || ''} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">الوصف</label><textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none" rows={2} value={taskForm.description || ''} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">الأولوية</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={taskForm.priority || 'medium'} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="critical">حرج</option><option value="high">عالي</option><option value="medium">متوسط</option><option value="low">منخفض</option></select></div>
                <div><label className="text-sm font-medium mb-1 block">الرتبة</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={taskForm.rank || 'junior'} onChange={e => setTaskForm({ ...taskForm, rank: e.target.value })}><option value="owner">المالك</option><option value="manager">مدير</option><option value="senior">أول</option><option value="junior">مبتدئ</option></select></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">المسؤول</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={taskForm.assigneeId || ''} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}><option value="">اختر</option>{clinicUsers.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addTask} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">حفظ</button>
              <button onClick={() => setShowTaskModal(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaff && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowAddStaff(false)}>
          <div className="glass-card-v2 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25">
                <UserPlus className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">إضافة موظف جديد</h3>
                <p className="text-xs text-muted-foreground">أضف موظفاً جديداً لعيادة {selectedClinic.name}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1 block">الاسم الكامل *</label><input className="w-full px-3 py-2.5 input-glow text-sm" placeholder="اسم الموظف" value={staffForm.fullName || ''} onChange={e => setStaffForm({ ...staffForm, fullName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">اسم المستخدم *</label><input className="w-full px-3 py-2.5 input-glow text-sm" placeholder="username" dir="ltr" value={staffForm.username || ''} onChange={e => setStaffForm({ ...staffForm, username: e.target.value.replace(/\s/g, '') })} /></div>
                <div><label className="text-sm font-medium mb-1 block">كلمة المرور *</label><input className="w-full px-3 py-2.5 input-glow text-sm" type="password" placeholder="••••••" value={staffForm.password || ''} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">الدور الوظيفي *</label>
                <select className="w-full px-3 py-2.5 input-glow text-sm" value={staffForm.role || 'reception'} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}>
                  <option value="doctor">طبيب</option>
                  <option value="reception">استقبال</option>
                  <option value="accountant">محاسب</option>
                  <option value="nurse">تمريض</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1 block">رقم الجوال</label><input className="w-full px-3 py-2.5 input-glow text-sm" placeholder="05xxxxxxxx" value={staffForm.phone || ''} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label><input className="w-full px-3 py-2.5 input-glow text-sm" placeholder="email@example.com" dir="ltr" value={staffForm.email || ''} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} /></div>
              </div>
              {staffError && <div className="bg-red-950/30 dark:bg-red-900/20 border border-red-800/40 dark:border-red-800 rounded-xl p-3 text-red-400 dark:text-red-400 text-sm text-center">{staffError}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addStaff} disabled={staffLoading}
                className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25 disabled:opacity-50">
                {staffLoading ? 'جاري الإضافة...' : 'إضافة الموظف'}
              </button>
              <button onClick={() => setShowAddStaff(false)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== SETTINGS VIEW ==============
function SettingsView() {
  const { currentClinicId } = useAuth();
  const [clinic, setClinic] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentClinicId) return;
    fetch(`/api/clinics?id=${currentClinicId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setClinic(d.clinic || d); setForm(d.clinic || d); } });
  }, [currentClinicId]);

  const handleSave = async () => {
    await fetch('/api/clinics', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clinic.id, ...form }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!clinic) return <div className="flex-1 flex items-center justify-center"><RefreshCw className="animate-spin text-teal-300" size={32} /></div>;

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      <h1 className="text-3xl font-black gradient-text">إعدادات العيادة</h1>

      <div className="glass-card-v2 rounded-2xl p-6 space-y-5 gradient-border">
        <div>
          <label className="text-sm font-medium mb-1 block">اسم العيادة</label>
          <input className="w-full px-3 py-2.5 input-glow text-sm" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">الهاتف</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div><label className="text-sm font-medium mb-1 block">العنوان</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">الرقم الضريبي</label><input className="w-full px-3 py-2.5 input-glow text-sm" value={form.taxNumber || ''} onChange={e => setForm({ ...form, taxNumber: e.target.value })} /></div>
          <div><label className="text-sm font-medium mb-1 block">العملة</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={form.currency || 'SAR'} onChange={e => setForm({ ...form, currency: e.target.value })}><option value="SAR">ريال سعودي (ر.س)</option><option value="QAR">ريال قطري (ر.ق)</option><option value="AED">درهم إماراتي (د.إ)</option><option value="EGP">جنيه مصري (ج.م)</option><option value="KWD">دينار كويتي (د.ك)</option><option value="BHD">دينار بحريني (د.ب)</option><option value="OMR">ريال عماني (ر.ع)</option><option value="JOD">دينار أردني (د.أ)</option><option value="LBP">ليرة لبنانية (ل.ل)</option><option value="IQD">دينار عراقي (د.ع)</option><option value="SYP">ليرة سورية (ل.س)</option><option value="YER">ريال يمني (ر.ي)</option><option value="DZD">دينار جزائري (د.ج)</option><option value="TND">دينار تونسي (د.ت)</option><option value="MAD">درهم مغربي (د.م)</option><option value="LYD">دينار ليبي (د.ل)</option><option value="SDG">جنيه سوداني (ج.س)</option><option value="MRU">أوقية موريتانية (أ.م)</option><option value="SOS">شلن صومالي (ش.ص)</option><option value="DJF">فرنك جيبوتي (ف.ج)</option><option value="USD">دولار أمريكي ($)</option><option value="EUR">يورو (€)</option><option value="GBP">جنيه إسترليني (£)</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">نوع الدفع</label><select className="w-full px-3 py-2.5 input-glow text-sm" value={form.paymentMode || 'postpaid'} onChange={e => setForm({ ...form, paymentMode: e.target.value })}><option value="postpaid">آجل</option><option value="prepaid">مقدم</option></select></div>
          <div><label className="text-sm font-medium mb-1 block">مدة الموعد (دقيقة)</label><input type="number" className="w-full px-3 py-2.5 input-glow text-sm" value={form.slotDuration || 30} onChange={e => setForm({ ...form, slotDuration: parseInt(e.target.value) })} /></div>
        </div>
        <div><label className="text-sm font-medium mb-1 block">ملاحظات</label><textarea className="w-full px-3 py-2.5 input-glow text-sm resize-none" rows={3} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25 hover:-translate-y-0.5 active:scale-[0.98]">
            <Save size={16} /> حفظ التغييرات
          </button>
          {saved && <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1"><CheckCircle size={14} /> تم الحفظ</span>}
        </div>
      </div>

      {/* إعدادات اللغة والعرض */}
      <LanguageSection />

      {/* النسخ الاحتياطي والبيانات */}
      <BackupSection />
    </div>
  );
}

// ============== LANGUAGE SECTION (inside Settings) ==============
function LanguageSection() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as 'ar' | 'en' | null;
    if (saved === 'en' || saved === 'ar') setLanguage(saved);
  }, []);

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
    // Apply direction and lang to <html>
    const html = document.documentElement;
    if (lang === 'en') {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    } else {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="glass-card-v2 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-orange-500/15 flex items-center justify-center">
          <Globe size={20} className="text-teal-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">اللغة والاتجاه</h2>
          <p className="text-xs text-muted-foreground">اختر لغة العرض المفضلة (Language & Direction)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleLanguageChange('ar')}
          className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            language === 'ar'
              ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
              : 'border-border/50 bg-transparent text-muted-foreground hover:border-border'
          }`}
        >
          <span className="text-xl">🇸🇦</span>
          العربية
          <span className="text-xs opacity-70">(RTL)</span>
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            language === 'en'
              ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
              : 'border-border/50 bg-transparent text-muted-foreground hover:border-border'
          }`}
        >
          <span className="text-xl">🇬🇧</span>
          English
          <span className="text-xs opacity-70">(LTR)</span>
        </button>
      </div>

      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 text-teal-600 dark:text-teal-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />
          {language === 'ar' ? 'تم حفظ تفضيل اللغة' : 'Language preference saved'}
        </div>
      )}

      <p className="text-xs text-muted-foreground/70 flex items-start gap-2">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>
          {language === 'ar'
            ? 'ملاحظة: تغيير اللغة يطبق على اتجاه الصفحة (RTL/LTR). ترجمة كامل المحتوى للإنجليزية قيد التطوير — بعض العناصر قد تبقى بالعربية مؤقتاً.'
            : 'Note: changing language applies the page direction (RTL/LTR). Full content translation to English is in progress — some elements may remain in Arabic temporarily.'}
        </span>
      </p>
    </div>
  );
}

// ============== BACKUP SECTION (inside Settings) ==============
function BackupSection() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!user || user.role !== 'super_admin') return null;

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await fetch('/api/backup/export', { method: 'POST' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'فشل التصدير');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinic-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastBackup(formatDateTimeEN(new Date()));
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="glass-card-v2 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-700/15 flex items-center justify-center">
          <Database size={20} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">النسخ الاحتياطي والبيانات</h2>
          <p className="text-xs text-muted-foreground">صدّر نسخة كاملة من بيانات النظام كملف JSON</p>
        </div>
      </div>

      <div className="bg-muted/30 border border-border/40 rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Shield size={14} className="text-orange-500 shrink-0 mt-0.5" />
          <span>تشمل النسخة: العيادات، المستخدمين (بدون كلمات المرور)، المرضى، المواعيد، الفواتير، المخزون، المهام، السجلات الطبية، خطط الاشتراك، العروض، سجلات التدقيق.</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock size={14} className="text-teal-500 shrink-0 mt-0.5" />
          <span>يُنصح بإجراء نسخة احتياطية أسبوعياً، أو قبل أي تعديل كبير على البيانات.</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/25 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <><RefreshCw size={16} className="animate-spin" /> جاري التصدير...</>
          ) : (
            <><Download size={16} /> تصدير نسخة احتياطية</>
          )}
        </button>
        {lastBackup && (
          <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <CheckCircle size={14} /> آخر نسخة: {lastBackup}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

// ============== SUBSCRIPTIONS VIEW ==============
function SubscriptionsView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subs, setSubs] = useState<ClinicSubscription[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', nameEn: '', description: '', price: 0, yearlyPrice: 0, features: '[]', maxPatients: 100, maxDoctors: 5, maxClinics: 1, isPopular: false, sortOrder: 0 });
  const [grantForm, setGrantForm] = useState({ clinicId: '', planId: '', endDate: '', notes: '', billingCycle: 'monthly' as 'monthly' | 'yearly' });
  const [viewCycle, setViewCycle] = useState<'monthly' | 'yearly'>('monthly');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, clinicsRes] = await Promise.all([
        fetch('/api/subscriptions?all=true'),
        fetch('/api/clinic-subscriptions'),
        fetch('/api/clinics'),
      ]);
      if (plansRes.ok) setPlans(await plansRes.json());
      if (subsRes.ok) setSubs(await subsRes.json());
      if (clinicsRes.ok) setClinics(await clinicsRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSavePlan = async () => {
    const method = editingPlan ? 'PUT' : 'POST';
    const url = editingPlan ? `/api/subscriptions/${editingPlan.id}` : '/api/subscriptions';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planForm),
    });
    if (res.ok) {
      setShowPlanForm(false);
      setEditingPlan(null);
      setPlanForm({ name: '', nameEn: '', description: '', price: 0, yearlyPrice: 0, features: '[]', maxPatients: 100, maxDoctors: 5, maxClinics: 1, isPopular: false, sortOrder: 0 });
      fetchData();
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;
    const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
    else { const d = await res.json(); alert(d.error || 'خطأ في الحذف'); }
  };

  const handleGrant = async () => {
    // If endDate is empty, auto-calculate based on billing cycle:
    // monthly → 1 month from now, yearly → 1 year from now
    let endDate = grantForm.endDate;
    if (!endDate) {
      const d = new Date();
      if (grantForm.billingCycle === 'yearly') {
        d.setFullYear(d.getFullYear() + 1);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      endDate = d.toISOString().split('T')[0];
    }
    const res = await fetch('/api/clinic-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...grantForm, endDate, autoRenew: true }),
    });
    if (res.ok) {
      setShowGrantForm(false);
      setGrantForm({ clinicId: '', planId: '', endDate: '', notes: '', billingCycle: 'monthly' });
      fetchData();
    } else {
      const d = await res.json();
      alert(d.error || 'خطأ في منح الاشتراك');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟')) return;
    const res = await fetch(`/api/clinic-subscriptions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><RefreshCw className="animate-spin text-teal-300" size={32} /></div>;

  const statusColors: Record<string, string> = {
    active: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700',
    expired: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    trial: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700',
  };
  const statusLabels: Record<string, string> = {
    active: 'نشط', expired: 'منتهي', cancelled: 'ملغي', trial: 'تجريبي',
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
            <Crown size={28} className="text-orange-500" /> إدارة الاشتراكات
          </h1>
          <p className="text-muted-foreground/70 text-sm mt-1">إدارة خطط الاشتراك واشتراكات العيادات</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowGrantForm(true); }} className="px-4 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2 text-sm">
            <Plus size={16} /> منح اشتراك
          </button>
          <button onClick={() => { setEditingPlan(null); setShowPlanForm(true); }} className="px-4 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25 flex items-center gap-2 text-sm">
            <Plus size={16} /> خطة جديدة
          </button>
        </div>
      </div>

      {/* Plans Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Crown size={20} className="text-teal-500" /> خطط الاشتراك</h2>
          {/* Billing cycle toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/40">
            <button
              type="button"
              onClick={() => setViewCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewCycle === 'monthly'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              شهري
            </button>
            <button
              type="button"
              onClick={() => setViewCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewCycle === 'yearly'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              سنوي
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                viewCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-orange-500/15 text-orange-400'
              }`}>
                وفّر حتى ١٧٪
              </span>
            </button>
          </div>
        </div>
        {plans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Crown size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد خطط اشتراك بعد</p>
            <p className="text-sm mt-1">أنشئ خطة جديدة للبدء</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => {
              const features = JSON.parse(plan.features || '[]');
              const isYearly = viewCycle === 'yearly';
              const displayedPrice = isYearly ? (plan.yearlyPrice || plan.price * 12) : plan.price;
              const priceUnit = isYearly ? 'ر.س/سنة' : 'ر.س/شهر';
              const monthlyEquivalent = isYearly && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : null;
              const yearlySaving = isYearly && plan.yearlyPrice ? (plan.price * 12) - plan.yearlyPrice : 0;
              return (
                <div key={plan.id} className={`relative glass-card-v2 rounded-xl p-5 ${plan.isPopular ? 'ring-2 ring-orange-500/50' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-l from-orange-600 to-orange-700 text-white text-xs font-bold rounded-full shadow-lg">
                      الأكثر شعبية
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${plan.isActive ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                      {plan.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                  {plan.description && <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>}
                  <div className="mb-4">
                    {/* Primary price — changes based on selected billing cycle */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-foreground">{displayedPrice.toLocaleString('en-GB')}</span>
                      <span className="text-muted-foreground text-sm">{priceUnit}</span>
                    </div>
                    {/* Secondary info under the price */}
                    {isYearly ? (
                      monthlyEquivalent ? (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          ≈ {monthlyEquivalent.toLocaleString('en-GB')} ر.س/شهر
                          {yearlySaving > 0 && (
                            <span className="text-orange-400 mr-2">— وفّر {yearlySaving.toLocaleString('en-GB')} ر.س سنوياً</span>
                          )}
                        </p>
                      ) : null
                    ) : (
                      plan.yearlyPrice ? (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          أو {plan.yearlyPrice.toLocaleString('en-GB')} ر.س/سنة
                        </p>
                      ) : null
                    )}
                  </div>
                  {features.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {features.slice(0, 5).map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle size={14} className="text-orange-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {features.length > 5 && <span className="text-xs text-muted-foreground/60">+{features.length - 5} مميزات أخرى</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-4">
                    {plan.maxPatients && <span>مرضى: {plan.maxPatients}</span>}
                    {plan.maxDoctors && <span>أطباء: {plan.maxDoctors}</span>}
                    {plan.maxClinics && <span>عيادات: {plan.maxClinics}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPlan(plan); setPlanForm({ name: plan.name, nameEn: plan.nameEn || '', description: plan.description || '', price: plan.price, yearlyPrice: plan.yearlyPrice || 0, features: plan.features, maxPatients: plan.maxPatients || 100, maxDoctors: plan.maxDoctors || 5, maxClinics: plan.maxClinics || 1, isPopular: plan.isPopular, sortOrder: plan.sortOrder }); setShowPlanForm(true); }} className="flex-1 px-3 py-2 bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1">
                      <Edit3 size={14} /> تعديل
                    </button>
                    <button onClick={() => handleDeletePlan(plan.id)} className="px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinic Subscriptions Section */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Building2 size={20} className="text-orange-500" /> اشتراكات العيادات</h2>
        {subs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد اشتراكات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm fancy-table">
              <thead>
                <tr className="text-foreground/70">
                  <th className="text-right py-3 px-4 font-medium">العيادة</th>
                  <th className="text-right py-3 px-4 font-medium">الخطة</th>
                  <th className="text-right py-3 px-4 font-medium">دورة الفوترة</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium">تاريخ البدء</th>
                  <th className="text-right py-3 px-4 font-medium">تاريخ الانتهاء</th>
                  <th className="text-right py-3 px-4 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{sub.clinic?.name || 'غير معروف'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{sub.plan?.name || 'غير معروف'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        (sub as any).billingCycle === 'yearly'
                          ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}>
                        {(sub as any).billingCycle === 'yearly' ? 'سنوي' : 'شهري'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[sub.status] || statusColors.active}`}>{statusLabels[sub.status] || sub.status}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDateEN(sub.startDate)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{sub.endDate ? formatDateEN(sub.endDate) : 'غير محدد'}</td>
                    <td className="py-3 px-4">
                      {sub.status === 'active' && (
                        <button onClick={() => handleRevoke(sub.id)} className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-xs font-medium transition-all">
                          إلغاء
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowPlanForm(false)}>
          <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">{editingPlan ? 'تعديل الخطة' : 'خطة اشتراك جديدة'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">اسم الخطة (عربي)</label><input className="w-full px-3 py-2.5 input-glass text-sm text-foreground" placeholder="احترافي" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">الاسم (إنجليزي)</label><input className="w-full px-3 py-2.5 input-glass text-sm text-foreground" placeholder="Professional" value={planForm.nameEn} onChange={e => setPlanForm({ ...planForm, nameEn: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">الوصف</label><textarea className="w-full px-3 py-2.5 input-glass text-sm text-foreground" rows={2} placeholder="وصف الخطة..." value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">السعر الشهري (ر.س)</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">السعر السنوي (ر.س)</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={planForm.yearlyPrice} onChange={e => setPlanForm({ ...planForm, yearlyPrice: Number(e.target.value) })} /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">المميزات (كل سطر مميزة)</label><textarea className="w-full px-3 py-2.5 input-glass text-sm text-foreground" rows={4} placeholder="إدارة المواعيد&#10;ملفات المرضى&#10;الفواتير" value={JSON.parse(planForm.features || '[]').join('\n')} onChange={e => setPlanForm({ ...planForm, features: JSON.stringify(e.target.value.split('\n').filter(Boolean)) })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">حد المرضى</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={planForm.maxPatients} onChange={e => setPlanForm({ ...planForm, maxPatients: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">حد الأطباء</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={planForm.maxDoctors} onChange={e => setPlanForm({ ...planForm, maxDoctors: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">حد العيادات</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={planForm.maxClinics} onChange={e => setPlanForm({ ...planForm, maxClinics: Number(e.target.value) })} /></div>
              </div>
              <label className="flex items-center gap-2 text-foreground/80 cursor-pointer">
                <input type="checkbox" checked={planForm.isPopular} onChange={e => setPlanForm({ ...planForm, isPopular: e.target.checked })} className="rounded" />
                <span className="text-sm">الأكثر شعبية</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSavePlan} className="flex-1 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/25">
                {editingPlan ? 'تحديث' : 'إنشاء'}
              </button>
              <button onClick={() => { setShowPlanForm(false); setEditingPlan(null); }} className="px-6 py-2.5 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Form Modal */}
      {showGrantForm && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowGrantForm(false)}>
          <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">منح اشتراك لعيادة</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1 block">العيادة</label>
                <select className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={grantForm.clinicId} onChange={e => setGrantForm({ ...grantForm, clinicId: e.target.value })}>
                  <option value="">اختر عيادة</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1 block">خطة الاشتراك</label>
                <select className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={grantForm.planId} onChange={e => setGrantForm({ ...grantForm, planId: e.target.value })}>
                  <option value="">اختر خطة</option>
                  {plans.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} - {p.price} ر.س/شهر</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1 block">دورة الفوترة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGrantForm({ ...grantForm, billingCycle: 'monthly' })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      grantForm.billingCycle === 'monthly'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                        : 'bg-transparent border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    شهري
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantForm({ ...grantForm, billingCycle: 'yearly' })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      grantForm.billingCycle === 'yearly'
                        ? 'bg-teal-600/20 border-teal-500 text-teal-300'
                        : 'bg-transparent border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    سنوي
                    {grantForm.planId && (() => {
                      const p = plans.find(pl => pl.id === grantForm.planId);
                      return p?.yearlyPrice ? <span className="block text-xs opacity-70 mt-0.5">{p.yearlyPrice} ر.س/سنة</span> : null;
                    })()}
                  </button>
                </div>
                {(() => {
                  const p = plans.find(pl => pl.id === grantForm.planId);
                  if (!p) return null;
                  const monthlyCost = p.price;
                  const yearlyCost = p.yearlyPrice || (p.price * 12);
                  const saving = monthlyCost * 12 - yearlyCost;
                  const savingPct = monthlyCost > 0 ? Math.round((saving / (monthlyCost * 12)) * 100) : 0;
                  if (grantForm.billingCycle === 'yearly' && saving > 0) {
                    return (
                      <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                        <CheckCircle size={12} /> وفّر {saving} ر.س سنوياً ({savingPct}٪ خصم)
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">تاريخ الانتهاء (اختياري — يُحسب تلقائياً إذا تُرك فارغاً)</label><input type="date" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={grantForm.endDate} onChange={e => setGrantForm({ ...grantForm, endDate: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">ملاحظات</label><textarea className="w-full px-3 py-2.5 input-glass text-sm text-foreground" rows={2} value={grantForm.notes} onChange={e => setGrantForm({ ...grantForm, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleGrant} className="flex-1 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/25">
                منح الاشتراك
              </button>
              <button onClick={() => setShowGrantForm(false)} className="px-6 py-2.5 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== OFFERS VIEW ==============
function OffersView() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState({ title: '', description: '', discountType: 'percentage', discountValue: 0, planId: '', startDate: '', endDate: '', isActive: true, showOnLanding: true, badge: '', sortOrder: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [offersRes, plansRes] = await Promise.all([fetch('/api/offers'), fetch('/api/subscriptions?all=true')]);
      if (offersRes.ok) setOffers(await offersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const method = editingOffer ? 'PUT' : 'POST';
    const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, planId: form.planId || null, startDate: form.startDate || null, endDate: form.endDate || null }),
    });
    if (res.ok) {
      setShowForm(false);
      setEditingOffer(null);
      setForm({ title: '', description: '', discountType: 'percentage', discountValue: 0, planId: '', startDate: '', endDate: '', isActive: true, showOnLanding: true, badge: '', sortOrder: 0 });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleToggleActive = async (offer: Offer) => {
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !offer.isActive }),
    });
    if (res.ok) fetchData();
  };

  const handleToggleLanding = async (offer: Offer) => {
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showOnLanding: !offer.showOnLanding }),
    });
    if (res.ok) fetchData();
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><RefreshCw className="animate-spin text-teal-300" size={32} /></div>;

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 page-transition-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
            <Star size={28} className="text-orange-500" /> إدارة العروض
          </h1>
          <p className="text-muted-foreground/70 text-sm mt-1">إنشاء وإدارة العروض والتخفيضات</p>
        </div>
        <button onClick={() => { setEditingOffer(null); setForm({ title: '', description: '', discountType: 'percentage', discountValue: 0, planId: '', startDate: '', endDate: '', isActive: true, showOnLanding: true, badge: '', sortOrder: 0 }); setShowForm(true); }} className="px-4 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2 text-sm">
          <Plus size={16} /> عرض جديد
        </button>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Gift size={48} className="mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-bold text-foreground mb-1">لا توجد عروض بعد</h3>
          <p className="text-muted-foreground text-sm">أنشئ عرضاً جديداً لجذب المزيد من العملاء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(offer => (
            <div key={offer.id} className={`glass-card-v2 rounded-xl p-5 relative ${!offer.isActive ? 'opacity-60' : ''}`}>
              {offer.badge && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-l from-orange-600 to-orange-700 text-white text-xs font-bold rounded-full shadow-lg">
                  {offer.badge}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{offer.title}</h3>
                  {offer.plan && <span className="text-xs text-teal-400">الخطة: {offer.plan.name}</span>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${offer.isActive ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                    {offer.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>
              {offer.description && <p className="text-muted-foreground text-sm mb-3">{offer.description}</p>}
              <div className="flex items-center gap-2 mb-3">
                {offer.discountType === 'percentage' ? (
                  <span className="text-2xl font-black text-orange-500">%{offer.discountValue}</span>
                ) : (
                  <span className="text-2xl font-black text-orange-500">{offer.discountValue} ر.س</span>
                )}
                <span className="text-muted-foreground text-sm">{offer.discountType === 'percentage' ? 'خصم نسبة' : 'خصم ثابت'}</span>
              </div>
              {(offer.startDate || offer.endDate) && (
                <div className="text-xs text-muted-foreground/60 mb-3">
                  {offer.startDate && <span>من {formatDateEN(offer.startDate)}</span>}
                  {offer.endDate && <span> إلى {formatDateEN(offer.endDate)}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <button onClick={() => handleToggleLanding(offer)} className={`px-2 py-1 rounded-lg border transition-all ${offer.showOnLanding ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : 'bg-muted/30 text-muted-foreground border-border/50'}`}>
                  {offer.showOnLanding ? 'ظاهر في الرئيسية' : 'مخفي من الرئيسية'}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggleActive(offer)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${offer.isActive ? 'bg-red-600/10 hover:bg-red-600/20 text-red-400' : 'bg-orange-600/10 hover:bg-orange-600/20 text-orange-400'}`}>
                  {offer.isActive ? <><Ban size={14} /> تعطيل</> : <><CheckCircle size={14} /> تفعيل</>}
                </button>
                <button onClick={() => { setEditingOffer(offer); setForm({ title: offer.title, description: offer.description || '', discountType: offer.discountType, discountValue: offer.discountValue, planId: offer.planId || '', startDate: offer.startDate ? offer.startDate.split('T')[0] : '', endDate: offer.endDate ? offer.endDate.split('T')[0] : '', isActive: offer.isActive, showOnLanding: offer.showOnLanding, badge: offer.badge || '', sortOrder: offer.sortOrder }); setShowForm(true); }} className="px-3 py-2 bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(offer.id)} className="px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">{editingOffer ? 'تعديل العرض' : 'عرض جديد'}</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">عنوان العرض</label><input className="w-full px-3 py-2.5 input-glass text-sm text-foreground" placeholder="خصم الصيف" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">الوصف</label><textarea className="w-full px-3 py-2.5 input-glass text-sm text-foreground" rows={2} placeholder="تفاصيل العرض..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1 block">نوع الخصم</label>
                  <select className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">قيمة الخصم</label><input type="number" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1 block">الخطة المرتبطة (اختياري)</label>
                <select className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })}>
                  <option value="">بدون ربط بخطة</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">تاريخ البدء</label><input type="date" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-foreground/80 mb-1 block">تاريخ الانتهاء</label><input type="date" className="w-full px-3 py-2.5 input-glass text-sm text-foreground" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground/80 mb-1 block">شارة العرض (اختياري)</label><input className="w-full px-3 py-2.5 input-glass text-sm text-foreground" placeholder="عرض خاص" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-foreground/80 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                  <span className="text-sm">نشط</span>
                </label>
                <label className="flex items-center gap-2 text-foreground/80 cursor-pointer">
                  <input type="checkbox" checked={form.showOnLanding} onChange={e => setForm({ ...form, showOnLanding: e.target.checked })} className="rounded" />
                  <span className="text-sm">ظاهر في الرئيسية</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/25">
                {editingOffer ? 'تحديث' : 'إنشاء'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingOffer(null); }} className="px-6 py-2.5 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== LANDING OFFERS COMPONENT ==============
function LandingOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetch('/api/offers?active=true')
      .then(r => r.ok ? r.json() : [])
      .then(d => setOffers(d))
      .catch(() => {});
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map(offer => (
        <div key={offer.id} className="group relative bg-white hover:bg-slate-50 backdrop-blur-sm border border-slate-200 hover:border-orange-500/40 rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:-translate-y-1 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-orange-100/60">
          {offer.badge && (
            <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-l from-orange-600 to-orange-700 text-white text-sm font-bold rounded-full shadow-lg shadow-orange-600/40">
              {offer.badge}
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-700/15 rounded-xl flex items-center justify-center">
              {offer.discountType === 'percentage' ? <Percent size={22} className="text-orange-600" /> : <Tag size={22} className="text-orange-600" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{offer.title}</h3>
              {offer.plan && <span className="text-xs text-teal-600 font-medium">خطة {offer.plan.name}</span>}
            </div>
          </div>
          {offer.description && <p className="text-slate-600 text-sm mb-4 leading-relaxed group-hover:text-slate-700 transition-colors">{offer.description}</p>}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-orange-600">
              {offer.discountType === 'percentage' ? `%${offer.discountValue}` : `${offer.discountValue}`}
            </span>
            <span className="text-slate-600 text-sm font-medium">{offer.discountType === 'percentage' ? 'خصم' : 'ر.س خصم'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============== LANDING PRICING COMPONENT ==============
function LandingPricing({ onRegister }: { onRegister: () => void }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(r => r.ok ? r.json() : [])
      .then((d: SubscriptionPlan[]) => {
        // Only show active plans, sorted by sortOrder
        const active = d.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
        setPlans(active);
      })
      .catch(() => {});
  }, []);

  const parseFeatures = (f: string): string[] => {
    try { return JSON.parse(f); } catch { return []; }
  };

  // Hero gradient per plan based on sortOrder
  const planStyles = [
    { gradient: 'from-teal-500 to-teal-700', shadow: 'shadow-teal-600/30', ring: 'ring-teal-500/30', icon: <Star size={22} className="text-teal-600" /> },
    { gradient: 'from-orange-500 to-orange-700', shadow: 'shadow-orange-600/30', ring: 'ring-orange-500/30', icon: <Crown size={22} className="text-orange-600" /> },
    { gradient: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-600/30', ring: 'ring-purple-500/30', icon: <Sparkles size={22} className="text-purple-600" /> },
  ];

  if (plans.length === 0) return null;

  return (
    <div>
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-teal-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-orange-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            سنوي
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">وفّر ٢ شهر</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => {
          const features = parseFeatures(plan.features);
          const style = planStyles[idx % planStyles.length];
          const isPopular = plan.isPopular;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-6 lg:p-8 transition-all duration-500 hover:-translate-y-2 ${
                isPopular
                  ? 'border-2 border-orange-500 shadow-2xl shadow-orange-500/20 lg:scale-105'
                  : 'border border-slate-200 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/60'
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-l from-orange-600 to-orange-700 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-600/40 flex items-center gap-1.5">
                  <Crown size={14} />
                  الأكثر شيوعاً
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 bg-gradient-to-br ${style.gradient} bg-opacity-10 rounded-2xl flex items-center justify-center`}>
                  <div className="bg-white/95 rounded-xl w-10 h-10 flex items-center justify-center shadow-sm">
                    {style.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  {plan.nameEn && <span className="text-xs text-slate-400 font-medium">{plan.nameEn}</span>}
                </div>
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-5 min-h-[2.5rem]">{plan.description}</p>
              )}

              {/* Price — shows ONLY the selected cycle, no cross-reference */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                {billingCycle === 'yearly' ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900">{(plan.yearlyPrice || plan.price * 12).toLocaleString('en-GB')}</span>
                    <span className="text-slate-500 font-medium">ر.س / سنوياً</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900">{plan.price.toLocaleString('en-GB')}</span>
                    <span className="text-slate-500 font-medium">ر.س / شهرياً</span>
                  </div>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-7 min-h-[12rem]">
                {features.map((feat, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm">
                    <div className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center mt-0.5`}>
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <span className="text-slate-600 leading-relaxed">{feat}</span>
                  </li>
                ))}
                {/* Limits info */}
                {(plan.maxPatients || plan.maxDoctors || plan.maxClinics) && (
                  <li className="pt-3 mt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-400">
                    <Award size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      {plan.maxPatients && plan.maxPatients > 0 ? `حتى ${plan.maxPatients} مريض · ` : 'مرضى غير محدود · '}
                      {plan.maxDoctors && plan.maxDoctors > 0 ? `${plan.maxDoctors} طبيب · ` : 'أطباء غير محدود · '}
                      {plan.maxClinics && plan.maxClinics > 0 ? `${plan.maxClinics} عيادة` : 'عيادات غير محدودة'}
                    </span>
                  </li>
                )}
              </ul>

              {/* CTA button */}
              <button
                onClick={onRegister}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                  isPopular
                    ? `bg-gradient-to-l ${style.gradient} text-white shadow-lg ${style.shadow} hover:shadow-xl`
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
              >
                ابدأ الآن
                <ArrowLeft size={16} className="inline-block mr-2" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Helper note under plans */}
      <div className="text-center mt-10">
        <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
          <HeadphonesIcon size={16} className="text-teal-500" />
          جميع الخطط تشمل تجربة مجانية لمدة ساعة — بدون أي التزام
        </p>
      </div>
    </div>
  );
}

// ============== LANDING PAGE ==============
function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ['hero', 'features', 'pricing', 'offers', 'stats', 'how-it-works', 'testimonials', 'cta'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-triggered animations using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'features', label: 'المميزات' },
    { id: 'pricing', label: 'الأسعار' },
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'how-it-works', label: 'كيف يعمل' },
    { id: 'testimonials', label: 'آراء العملاء' },
  ];

  const features = [
    { icon: CalendarCheck, title: 'إدارة المواعيد', desc: 'نظام حجز ذكي للمواعيد مع تذكيرات تلقائية وإمكانية الحجز عبر رابط مخصص لكل عيادة. تنظيم كامل لأجندة العمل اليومية.', color: 'from-teal-400 to-teal-800', shadow: 'shadow-teal-600/30' },
    { icon: Users, title: 'ملفات المرضى', desc: 'سجلات طبية شاملة لكل مريض مع تاريخ الزيارات والتشخيصات والعلاجات. وصول سريع ومنظم لجميع البيانات.', color: 'from-teal-300 to-teal-600', shadow: 'shadow-teal-500/25' },
    { icon: Receipt, title: 'نظام الفواتير', desc: 'إنشاء فواتير تلقائية عند إكمال الموعد مع تتبع المدفوعات والمبالغ المستحقة. تقارير مالية شاملة.', color: 'from-orange-500 to-orange-800', shadow: 'shadow-orange-600/25' },
    { icon: BarChart3, title: 'التقارير والتحليلات', desc: 'لوحة تحكم تفاعلية مع رسوم بيانية وتقارير مفصلة عن الأداء والإيرادات وحركة المرضى.', color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/25' },
    { icon: Building2, title: 'إدارة متعددة العيادات', desc: 'تحكم مركزي بعدة عيادات من حساب واحد مع صلاحيات مختلفة لكل فرع وفريق عمل مستقل.', color: 'from-orange-400 to-orange-700', shadow: 'shadow-orange-600/35' },
    { icon: Shield, title: 'صلاحيات متقدمة', desc: 'نظام أدوار مرن (مالك، مدير، طبيب، استقبال) مع تحكم دقيق في الصلاحيات لكل مستخدم.', color: 'from-rose-400 to-rose-700', shadow: 'shadow-rose-600/35' },
  ];

  const stats = [
    { value: '+1,000', label: 'عيادة نشطة', icon: Building2 },
    { value: '+50,000', label: 'موعد شهرياً', icon: CalendarDays },
    { value: '+200,000', label: 'مريض مسجل', icon: Users },
    { value: '99.9%', label: 'وقت التشغيل', icon: Zap },
  ];

  const steps = [
    { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حسابك في أقل من دقيقة واحدة وابدأ بإعداد عيادتك', icon: UserPlus },
    { num: '٢', title: 'أضف عيادتك', desc: 'سجّل بيانات عيادتك وفريق العمل والخدمات المتاحة', icon: Building2 },
    { num: '٣', title: 'ابدأ العمل', desc: 'استقبل المرضى وأدِر المواعيد والفواتير بكل سهولة', icon: HeartPulse },
  ];

  const testimonials = [
    { name: 'د. أحمد المنصور', role: 'طبيب أسنان', text: 'نظام عيادة غيّر طريقة إدارة عيادتي بالكامل. الآن أركز على المرضى بدلاً من الأوراق والمواعيد.', rating: 5 },
    { name: 'أ. سارة العتيبي', role: 'مديرة عيادة', text: 'إدارة ٣ فروع أصبحت أسهل بكثير. لوحة التحكم المركزية وفّرت علينا ساعات من العمل يومياً.', rating: 5 },
    { name: 'د. خالد الحربي', role: 'طبيب عام', text: 'نظام الفواتير التلقائي والربط مع المواعيد وفّر وقت كبير. أنصح به بشدة لكل طبيب.', rating: 5 },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" dir="rtl">
      {/* ============ NAVBAR ============ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-scrolled text-foreground' : 'bg-transparent text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/40 avatar-ring">
                <Syringe className="text-white" size={22} />
              </div>
              <span className="text-xl font-black tracking-tight">عيادة</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeSection === link.id ? 'text-teal-600 bg-teal-500/10' : 'text-current/75 hover:text-current hover:bg-current/8'}`}>
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="تبديل الوضع الليلي"
                className="p-2.5 text-foreground/70 hover:text-foreground rounded-xl border border-border/40 hover:border-border/80 hover:bg-muted/40 transition-all duration-300"
                title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={onLogin}
                className="px-5 py-2.5 text-sm font-semibold text-teal-600 hover:text-teal-800 border border-teal-400/40 hover:border-teal-500/70 rounded-xl hover:bg-teal-500/10 transition-all duration-300">
                تسجيل الدخول
              </button>
              <button onClick={onRegister}
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-l from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
                ابدأ مجاناً
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-current/70 hover:text-current">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200/50 animate-slide-down shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)}
                  className="w-full text-right px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-teal-50 transition-all text-sm">
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-200/50 space-y-2">
                <button onClick={onLogin}
                  className="w-full py-3 text-sm font-semibold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-all">
                  تسجيل الدخول
                </button>
                <button onClick={onRegister}
                  className="w-full py-3 text-sm font-semibold bg-gradient-to-l from-teal-600 to-teal-800 text-white rounded-xl shadow-lg shadow-teal-600/30 transition-all">
                  ابدأ مجاناً
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section id="hero" className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-teal-950 via-teal-950/50 to-teal-950 text-white hero-gradient">
        {/* Background decorations — animated gradient blobs + particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-blob hero-blob-1 absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px]" />
          <div className="hero-blob hero-blob-2 absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" />
          <div className="hero-blob hero-blob-3 absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[130px]" />
          <div className="absolute inset-0 pattern-dots opacity-30" />
          <Particles count={25} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-medium mb-8 animate-slide-up backdrop-blur-sm">
              <span className="dot-pulse"></span>
              <Sparkles size={16} />
              <span>نظام إدارة العيادات رقم ١ في المنطقة</span>
              <ArrowUpRight size={14} />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              أدِر عيادتك
              <br />
              <span className="gradient-text-enhanced">بذكاء وسهولة</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
              نظام متكامل لإدارة المواعيد والمرضى والفواتير. وفّر وقتك وركّز على ما يهم — رعاية مرضاك.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <button onClick={onRegister}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-teal-600 to-teal-800 hover:from-teal-800 hover:to-orange-600 text-white font-bold rounded-2xl shadow-2xl shadow-teal-600/40 hover:shadow-teal-600/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] text-lg flex items-center justify-center gap-2 cta-button-glow">
                ابدأ مجاناً الآن
                <ArrowLeft size={20} />
              </button>
              <button onClick={() => scrollTo('how-it-works')}
                className="w-full sm:w-auto px-8 py-4 text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-2xl hover:bg-white/5 transition-all duration-300 text-lg flex items-center justify-center gap-2 btn-ghost-enhanced">
                <Play size={18} />
                شاهد كيف يعمل
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 size={16} className="text-teal-400" />
                <span>إعداد في ٥ دقائق</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle2 size={16} className="text-teal-400" />
                <span>دعم متواصل</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 lg:mt-24 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="relative">
              {/* Glow behind the preview */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-950/40 via-orange-700/30 to-orange-500/25 rounded-3xl blur-2xl" />
              <div className="relative bg-teal-950/80 backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-teal-900/80 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-orange-500/70" />
                    <div className="w-3 h-3 rounded-full bg-orange-700/70" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-md mx-auto bg-teal-800/50 rounded-lg px-4 py-1.5 text-xs text-white/70 text-center">
                      app.eyada.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup content */}
                <div className="p-4 lg:p-6 space-y-4">
                  {/* Mock stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'المرضى', value: '١,٢٤٧', color: 'from-teal-950/40 to-teal-900/25', icon: Users },
                      { label: 'مواعيد اليوم', value: '٣٨', color: 'from-orange-700/30 to-orange-800/15', icon: CalendarDays },
                      { label: 'الإيرادات', value: '٤٥,٨٠٠ ر.س', color: 'from-orange-600/30 to-orange-700/15', icon: TrendingUp },
                      { label: 'المهام', value: '١٢', color: 'from-purple-500/30 to-purple-600/15', icon: ClipboardList },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className={`bg-gradient-to-br ${item.color} rounded-xl p-3 lg:p-4 border border-white/5`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={14} className="text-white/60" />
                            <span className="text-xs text-white/60">{item.label}</span>
                          </div>
                          <p className="text-lg lg:text-2xl font-bold text-white/90">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Mock chart and list */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                      <div className="text-xs text-white/55 mb-3">المواعيد خلال الأسبوع</div>
                      <div className="flex items-end gap-2 h-24">
                        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-teal-900/40 to-teal-500/70 rounded-t-md transition-all hover:from-teal-800/60 hover:to-teal-500/90" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                      <div className="text-xs text-white/55 mb-3">المواعيد القادمة</div>
                      <div className="space-y-2">
                        {[
                          { name: 'محمد أحمد', time: '٩:٠٠ ص' },
                          { name: 'فاطمة سعد', time: '١٠:٣٠ ص' },
                          { name: 'عبدالله خالد', time: '١٢:٠٠ م' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-white/90">{item.name}</span>
                            <span className="text-teal-400/80">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" data-animate className="relative py-20 lg:py-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-teal-100/60 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 border border-teal-200 text-teal-700 text-xs font-medium mb-4">
              <Zap size={14} />
              مميزات النظام
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 text-slate-900">
              كل ما تحتاجه <span className="gradient-text">في مكان واحد</span>
            </h2>
            <p className="text-slate-500 text-lg">أدوات متكاملة لإدارة عيادتك بكفاءة عالية من المواعيد حتى الفواتير</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i}
                  className="group relative bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-lg shadow-teal-100/50 hover:shadow-xl hover:shadow-teal-200/60 transition-all duration-500 hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${feature.shadow} feature-icon-float`}>
                    <Icon className="text-white" size={26} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-teal-700 transition-colors">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">{feature.desc}</p>
                  {/* Hover accent */}
                  <div className={`absolute -inset-px bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION (moved up — swapped with Offers) ============ */}
      <section id="pricing" data-animate className="relative py-20 lg:py-28 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-100/60 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 border border-teal-200 text-teal-700 text-xs font-medium mb-4">
              <Crown size={14} />
              باقات الاشتراك
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 text-slate-900">
              اختر الخطة <span className="gradient-text">المناسبة لعيادتك</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              خطط مرنة تناسب جميع أحجام العيادات — من العيادة الواحدة إلى السلاسل الطبية المتعددة
            </p>
          </div>
          <LandingPricing onRegister={onRegister} />
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section id="stats" data-animate className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-900 via-teal-950/60 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 via-teal-900/15 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4">
              أرقام <span className="gradient-text">تتحدث عنّا</span>
            </h2>
            <p className="text-white/70 text-lg">الآلاف يثقون بنظام عيادة لإدارة أعمالهم الصحية</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i}
                  className="relative text-center p-6 lg:p-8 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.08] transition-all duration-500 group stat-counter">
                  <div className="w-12 h-12 mx-auto mb-4 bg-teal-500/15 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon className="text-teal-400" size={24} />
                  </div>
                  <div className="text-3xl lg:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                  <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" data-animate className="relative py-20 lg:py-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-medium mb-4">
              <MousePointerClick size={14} />
              كيف يعمل النظام
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 text-slate-900">
              ابدأ في <span className="gradient-text">ثلاث خطوات</span>
            </h2>
            <p className="text-slate-500 text-lg">إعداد عيادتك لم يستغرق أكثر من خمس دقائق</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-l from-teal-200/60 via-orange-300/40 to-teal-200/60" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative text-center group">
                  {/* Step number with ring */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute w-24 h-24 bg-teal-200/40 rounded-full animate-ripple" style={{ animationDelay: `${i * 500}ms` }} />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/30 group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0">
                      <Icon className="text-white" size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-teal-600 rounded-full flex items-center justify-center text-sm font-black text-teal-700 shadow-sm">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section id="testimonials" data-animate className="relative py-20 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[350px] h-[350px] bg-orange-100/30 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4 text-slate-900">
              ماذا يقول <span className="gradient-text">عملاؤنا</span>
            </h2>
            <p className="text-slate-500 text-lg">آراء حقيقية من أطباء ومديري عيادات يستخدمون نظام عيادة يومياً</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i}
                className="bg-slate-50 border border-slate-100 hover:border-teal-200/60 rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-100/50 group testimonial-card">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={16} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm lg:text-base group-hover:text-slate-800 transition-colors">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-600/25">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OFFERS SECTION (moved down — swapped with Pricing) ============ */}
      <section id="offers" data-animate className="relative py-20 lg:py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-medium mb-4">
              <Gift size={14} />
              عروض خاصة
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 text-slate-900">
              عروض <span className="gradient-text">لا تفوّتها</span>
            </h2>
            <p className="text-slate-500 text-lg">استفد من عروضنا المحدودة واحصل على أفضل الأسعار</p>
          </div>
          <LandingOffers />
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section id="cta" data-animate className="relative py-20 lg:py-32 bg-gradient-to-b from-slate-900 to-teal-950 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-teal-950/25 to-orange-700/8 backdrop-blur-xl border border-teal-800/30 rounded-3xl p-8 lg:p-16 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-900/25 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-600/40">
                <Syringe className="text-white" size={28} />
              </div>
              <h2 className="text-3xl lg:text-5xl font-black mb-4">
                جاهز لبدء <span className="gradient-text">رحلة التميز؟</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                انضم لآلاف العيادات التي تثق بنظام عيادة. ابدأ مجاناً الآن.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={onRegister}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-l from-teal-600 to-teal-800 hover:from-teal-800 hover:to-orange-600 text-white font-bold rounded-2xl shadow-2xl shadow-teal-600/40 hover:shadow-teal-600/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] text-lg">
                  ابدأ مجاناً الآن
                </button>
                <button onClick={onLogin}
                  className="w-full sm:w-auto px-10 py-4 text-teal-400 hover:text-white border border-teal-400/40 hover:border-teal-500/70 rounded-2xl hover:bg-teal-500/10 transition-all duration-300 text-lg">
                  تسجيل الدخول
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative border-t border-white/10 py-12 lg:py-16 bg-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25">
                  <Syringe className="text-white" size={20} />
                </div>
                <span className="text-xl font-black">عيادة</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                نظام متكامل لإدارة العيادات والمواعيد والمرضى والفواتير. حل ذكي للرعاية الصحية.
              </p>
              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="تويتر" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-teal-600/30 border border-white/5 hover:border-teal-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="انستقرام" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-pink-600/30 border border-white/5 hover:border-pink-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="لينكدإن" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-600/30 border border-white/5 hover:border-blue-500/30 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Links — النظام */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/90">النظام</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">إدارة المواعيد</a></li>
                <li><a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">ملفات المرضى</a></li>
                <li><a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">الفواتير</a></li>
                <li><a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">التقارير</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/90">الشركة</h4>
              <ul className="space-y-2.5">
                <li><a href="#hero" className="text-white/60 hover:text-white text-sm transition-colors">من نحن</a></li>
                <li><a href="#testimonials" className="text-white/60 hover:text-white text-sm transition-colors">آراء العملاء</a></li>
                <li><a href="#how-it-works" className="text-white/60 hover:text-white text-sm transition-colors">كيف يعمل</a></li>
                <li><a href="mailto:911houssem@gmail.com" className="text-white/60 hover:text-white text-sm transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/90">الدعم</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:911houssem@gmail.com" className="text-white/60 hover:text-white text-sm transition-colors">مركز المساعدة</a></li>
                <li><a href="#pricing" className="text-white/60 hover:text-white text-sm transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#cta" className="text-white/60 hover:text-white text-sm transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#cta" className="text-white/60 hover:text-white text-sm transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/90 text-sm">© ٢٠٢٦ عيادة. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <span>صنع بـ</span>
              <HeartPulse size={12} className="text-teal-400" />
              <span>للرعاية الصحية</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============== CHAT WIDGET ==============
function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null); // partner user object
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat?mode=conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setAllUsers(data.allUsers || []);
        const unread = (data.conversations || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(unread);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch messages with a specific user
  const fetchMessages = useCallback(async (partnerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat?with=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Refresh conversations to update unread count
        fetchConversations();
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchConversations]);

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !activeChat) return;
    const receiverId = activeChat.id;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, message: newMsg.trim() }),
      });
      if (res.ok) {
        setNewMsg('');
        fetchMessages(receiverId);
      }
    } catch { /* ignore */ }
  };

  // Poll for new messages every 5s when chat is open
  useEffect(() => {
    if (!open) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [open, fetchConversations]);

  // Poll messages when in active chat
  useEffect(() => {
    if (!activeChat || !open) return;
    fetchMessages(activeChat.id);
    const interval = setInterval(() => fetchMessages(activeChat.id), 3000);
    return () => clearInterval(interval);
  }, [activeChat, open, fetchMessages]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  if (!user) return null;

  const isOwner = user.role === 'super_admin';

  // Find super_admin from allUsers for non-owner users to chat with
  const ownerUser = allUsers.find((u: any) => u.role === 'super_admin');

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'اليوم';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'أمس';
    return formatArabicDate(d, { month: 'short', day: true, year: false });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'المالك', admin: 'مدير', doctor: 'طبيب',
      reception: 'استقبال', accountant: 'محاسب', nurse: 'تمريض',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      doctor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      reception: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      accountant: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      nurse: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  // ===== RENDER =====
  return (
    <>
      {/* Floating Chat Button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full shadow-xl shadow-teal-600/40 hover:shadow-teal-600/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {totalUnread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{totalUnread > 9 ? '+9' : totalUnread}</span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {activeChat ? (
                <>
                  <button onClick={() => { setActiveChat(null); setMessages([]); setShowUserList(false); }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <ArrowRight size={18} />
                  </button>
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {activeChat.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{activeChat.fullName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${getRoleColor(activeChat.role).replace('dark:', 'hover:')}`}>
                      {getRoleLabel(activeChat.role)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <div>
                    <p className="text-sm font-bold">المحادثات</p>
                    <p className="text-[10px] text-white/70">{isOwner ? 'الرد على الرسائل' : 'تواصل مع المالك'}</p>
                  </div>
                </>
              )}
            </div>
            {isOwner && !activeChat && (
              <button onClick={() => setShowUserList(!showUserList)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="محادثة جديدة">
                <Plus size={18} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!activeChat ? (
              /* ===== CONVERSATION LIST ===== */
              <div className="flex-1 overflow-y-auto">
                {/* New chat user list (owner only) */}
                {showUserList && isOwner && (
                  <div className="border-b border-border p-2">
                    <div className="relative mb-2">
                      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input placeholder="ابحث عن مستخدم..." className="w-full pr-9 pl-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-xs outline-none focus:border-teal-500/50 transition-colors" />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {allUsers.map((u: any) => (
                        <button key={u.id} onClick={() => { setActiveChat(u); setShowUserList(false); }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted/60 transition-colors text-right">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.fullName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{u.fullName}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${getRoleColor(u.role)}`}>
                              {getRoleLabel(u.role)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversations list */}
                {conversations.length === 0 && !showUserList ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-3">
                      <MessageCircle size={28} className="text-teal-400" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">لا توجد محادثات</p>
                    <p className="text-xs text-muted-foreground">
                      {isOwner ? 'ابدأ محادثة جديدة مع المستخدمين' : 'اضغط للتواصل مع المالك'}
                    </p>
                    {!isOwner && (
                      <button onClick={() => {
                        // Find super_admin from conversations or create a temp one
                        const ownerConv = conversations.find((c: any) => c.partner?.role === 'super_admin');
                        if (ownerConv) {
                          setActiveChat(ownerConv.partner);
                        } else {
                          // Create a temp partner and start chat
                          setActiveChat({ id: 'owner', fullName: 'المالك', role: 'super_admin' });
                          // Fetch the actual owner
                          fetch('/api/chat?mode=conversations').then(r => r.json()).then(data => {
                            const owner = data.allUsers?.find((u: any) => u.role === 'super_admin');
                            if (owner) setActiveChat(owner);
                          });
                        }
                      }}
                        className="mt-4 px-5 py-2.5 bg-gradient-to-l from-teal-600 to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-2">
                        <MessageCircle size={16} />
                        تواصل مع المالك
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {conversations.map((conv: any) => (
                      <button key={conv.partnerId} onClick={() => setActiveChat(conv.partner)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-right relative">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {conv.partner?.fullName?.charAt(0)}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-0.5 -left-0.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount > 9 ? '+9' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{conv.partner?.fullName}</p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTime(conv.lastMessage?.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage?.senderId === user?.id ? 'أنت: ' : ''}{conv.lastMessage?.message}
                            </p>
                            {conv.unreadCount > 0 && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ===== ACTIVE CHAT ===== */
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw size={20} className="animate-spin text-teal-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-2">
                        <MessageCircle size={20} className="text-teal-400" />
                      </div>
                      <p className="text-xs text-muted-foreground">ابدأ المحادثة الآن</p>
                    </div>
                  ) : (
                    (() => {
                      let lastDate = '';
                      return messages.map((msg: any, i: number) => {
                        const isMine = msg.senderId === user?.id;
                        const msgDate = formatDate(msg.createdAt);
                        const showDateSeparator = msgDate !== lastDate;
                        lastDate = msgDate;

                        return (
                          <div key={msg.id}>
                            {showDateSeparator && (
                              <div className="flex items-center justify-center my-3">
                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">{msgDate}</span>
                              </div>
                            )}
                            <div className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[80%] ${isMine
                                ? 'bg-gradient-to-l from-teal-600 to-teal-700 text-white rounded-2xl rounded-bl-md'
                                : 'bg-card border border-border rounded-2xl rounded-br-md'
                              } px-4 py-2.5 shadow-sm`}>
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-start' : 'justify-end'}`}>
                                  <span className={`text-[9px] ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMine && msg.isRead && (
                                    <CheckCircle2 size={10} className="text-orange-300" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-2.5 border-t border-border bg-card shrink-0">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex items-center gap-2">
                    <input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder={isOwner ? "اكتب ردك..." : "اكتب رسالتك..."}
                      className="flex-1 px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder-muted-foreground/50"
                      autoFocus
                    />
                    <button type="submit" disabled={!newMsg.trim()}
                      className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-teal-600/30 shrink-0">
                      <Send size={16} className="rotate-180" />
                    </button>
                  </form>
                  {!isOwner && (
                    <p className="text-[10px] text-muted-foreground text-center mt-1.5">يمكن للمالك فقط الرد على رسائلك</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ============== IMPERSONATION BANNER ==============
function ImpersonationBanner() {
  const { isImpersonating, impersonatorName, user, returnToOwner } = useAuth();
  const [returning, setReturning] = useState(false);
  if (!isImpersonating) return null;

  const handleReturn = async () => {
    setReturning(true);
    await returnToOwner();
    setReturning(false);
  };

  return (
    <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-orange-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap shadow-md shadow-amber-900/20 animate-slide-up">
      <div className="flex items-center gap-2.5 text-sm">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <ArrowLeftRight size={14} />
        </div>
        <div className="leading-tight">
          <p className="font-bold">أنت تتصفح النظام كـ: {user?.fullName}</p>
          <p className="text-[11px] text-white/85">تم الدخول بواسطة حساب المالك ({impersonatorName || 'المالك'}). أي تغييرات ستُسجّل باسم هذا المستخدم.</p>
        </div>
      </div>
      <button
        onClick={handleReturn}
        disabled={returning}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-50 transition-all shadow-sm disabled:opacity-60">
        {returning ? <RefreshCw size={13} className="animate-spin" /> : <LogOut size={13} />}
        العودة إلى حساب المالك
      </button>
    </div>
  );
}

// ============== DATE FORMATTING HELPERS ==============
// Format dates with Arabic month/weekday names but English (Latin) digits
const AR_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// Currency labels map — code → Arabic name with symbol
const CURRENCY_LABELS: Record<string, string> = {
  SAR: 'ريال سعودي (ر.س)',
  QAR: 'ريال قطري (ر.ق)',
  AED: 'درهم إماراتي (د.إ)',
  EGP: 'جنيه مصري (ج.م)',
  KWD: 'دينار كويتي (د.ك)',
  BHD: 'دينار بحريني (د.ب)',
  OMR: 'ريال عماني (ر.ع)',
  JOD: 'دينار أردني (د.أ)',
  LBP: 'ليرة لبنانية (ل.ل)',
  IQD: 'دينار عراقي (د.ع)',
  SYP: 'ليرة سورية (ل.س)',
  YER: 'ريال يمني (ر.ي)',
  DZD: 'دينار جزائري (د.ج)',
  TND: 'دينار تونسي (د.ت)',
  MAD: 'درهم مغربي (د.م)',
  LYD: 'دينار ليبي (د.ل)',
  SDG: 'جنيه سوداني (ج.س)',
  MRU: 'أوقية موريتانية (أ.م)',
  SOS: 'شلن صومالي (ش.ص)',
  DJF: 'فرنك جيبوتي (ف.ج)',
  USD: 'دولار أمريكي ($)',
  EUR: 'يورو (€)',
  GBP: 'جنيه إسترليني (£)',
};
const getCurrencyLabel = (code: string): string => CURRENCY_LABELS[code] || code;
const AR_MONTHS_SHORT = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];

// Format date with English digits + Arabic labels (e.g. "الثلاثاء، 17 يونيو 2026")
function formatArabicDate(date: Date | string, opts?: { weekday?: 'long'; month?: 'long' | 'short'; year?: boolean; day?: boolean }): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts: string[] = [];
  if (opts?.weekday === 'long') parts.push(AR_WEEKDAYS[d.getDay()]);
  if (opts?.day !== false) parts.push(String(d.getDate()));
  if (opts?.month === 'short') parts.push(AR_MONTHS_SHORT[d.getMonth()]);
  else if (opts?.month === 'long' || opts?.month === undefined) parts.push(AR_MONTHS[d.getMonth()]);
  if (opts?.year !== false) parts.push(String(d.getFullYear()));
  return parts.join(' ');
}

// Format date as DD/MM/YYYY with English digits (no Arabic labels)
function formatDateEN(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Format date+time as DD/MM/YYYY, HH:MM with English digits
function formatDateTimeEN(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${formatDateEN(d)}, ${hh}:${min}`;
}

// ============== MAIN APP ==============
function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      if (prefersDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Keyboard shortcuts: Ctrl+K = quick actions, Ctrl+D = dark mode, Esc = back to landing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !e.shiftKey) {
        e.preventDefault();
        toggleDarkMode();
      }
      if (e.key === 'Escape' && !user) {
        setAuthView('landing');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [darkMode, user]);

  if (!user) {
    if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />;
    if (authView === 'register') return <RegisterPage onBack={() => setAuthView('landing')} onSwitchLogin={() => setAuthView('login')} />;
    return <LoginPage onBack={() => setAuthView('landing')} onSwitchRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="flex h-screen overflow-hidden pattern-dots gradient-bg-animated">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden bg-background/80 backdrop-blur-sm">
        <ImpersonationBanner />
        {/* Top bar with dark mode toggle */}
        <div className="flex items-center justify-end px-4 py-2 border-b border-border/30 bg-card/50 backdrop-blur-sm">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            title={darkMode ? 'التبديل للوضع النهاري (Ctrl+D)' : 'التبديل للوضع الليلي (Ctrl+D)'}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span>{darkMode ? 'نهاري' : 'ليلي'}</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'patients' && <PatientsView />}
          {currentView === 'appointments' && <AppointmentsView />}
          {currentView === 'records' && <RecordsView />}
          {currentView === 'invoices' && <InvoicesView />}
          {currentView === 'inventory' && <InventoryView />}
          {currentView === 'reports' && <ReportsView />}

          {currentView === 'tasks' && <TasksView />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'management' && <ManagementView />}
          {currentView === 'subscriptions' && <SubscriptionsView />}
          {currentView === 'offers' && <OffersView />}
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}

// ============== TOAST NOTIFICATIONS ==============
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}
const ToastContext = createContext<{ showToast: (msg: string, type?: ToastType) => void }>({ showToast: () => {} });
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, /* mark for exit */ } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  };
  const toastIcons = {
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
    info: <Info size={16} />,
    warning: <AlertTriangle size={16} />,
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-icon">{toastIcons[t.type]}</div>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============== SKELETON LOADER COMPONENTS ==============
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="skeleton skeleton-text skeleton-text-short" />
          <div className="skeleton skeleton-text skeleton-text-medium" style={{ height: '24px', marginTop: '8px' }} />
        </div>
        <div className="skeleton skeleton-circle" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
      <div className="flex-1">
        <div className="skeleton skeleton-text skeleton-text-medium" />
        <div className="skeleton skeleton-text skeleton-text-short" style={{ marginTop: '4px' }} />
      </div>
    </div>
  );
}

// ============== EMPTY STATE COMPONENT ==============
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: any; title: string; description?: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="empty-state-action">
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ============== PARTICLES BACKGROUND ==============
function Particles({ count = 25 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 15;
    return { id: i, size, left, duration, delay };
  });
  return (
    <div className="particles-container" aria-hidden>
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============== CURSOR TRAIL ==============
function CursorTrail() {
  const trailRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    let rafId: number;
    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const animate = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      if (trailRef.current) {
        trailRef.current.style.left = `${trailX}px`;
        trailRef.current.style.top = `${trailY}px`;
      }
      rafId = requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', handleMove);
    rafId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);
  return <div ref={trailRef} className="cursor-trail" style={{ width: '24px', height: '24px' }} aria-hidden />;
}

// ============== PAGE LOADER ==============
function PageLoader() {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`page-loader ${loaded ? 'loaded' : ''}`} aria-hidden={loaded}>
      <div className="page-loader-icon">
        <Syringe className="text-white" size={32} />
      </div>
      <div className="page-loader-spinner" />
      <div className="page-loader-text">عيادة — جاري التحميل...</div>
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <PageLoader />
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
