'use client';

import React, { useState, useEffect } from 'react';
import {
  Syringe, CalendarDays, User, Phone, Mail, Clock,
  CheckCircle, AlertCircle, ChevronLeft, Loader2
} from 'lucide-react';

interface ClinicInfo {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  slotDuration: number;
  currency: string;
}

interface Doctor {
  id: string;
  fullName: string;
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientGender: 'male',
    patientAge: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/booking/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Clinic not found');
        return r.json();
      })
      .then(data => {
        setClinic(data.clinic);
        setDoctors(data.doctors || []);
        setLoading(false);
      })
      .catch(() => {
        setError('لم يتم العثور على العيادة أو الحجز غير مفعل');
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const startTime = `${form.date}T${form.time}:00`;
      const res = await fetch(`/api/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName,
          patientPhone: form.patientPhone,
          patientEmail: form.patientEmail || undefined,
          patientGender: form.patientGender,
          patientAge: form.patientAge || undefined,
          doctorId: form.doctorId,
          startTime,
          title: 'حجز من الرابط العام',
          notes: form.notes || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'حدث خطأ في الحجز');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-violet-600" size={32} />
          <p className="text-gray-500 text-sm">جاري تحميل بيانات العيادة...</p>
        </div>
      </div>
    );
  }

  if (error && !clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">عذراً</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-md space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">تم الحجز بنجاح!</h1>
          <p className="text-gray-500">تم حجز موعدك في عيادة {clinic?.name}. سيتم التواصل معك للتأكيد.</p>
          <button onClick={() => { setSubmitted(false); setForm({ patientName: '', patientPhone: '', patientEmail: '', patientGender: 'male', patientAge: '', doctorId: '', date: '', time: '', notes: '' }); }} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
            حجز موعد آخر
          </button>
        </div>
      </div>
    );
  }

  // Generate time slots
  const timeSlots = [];
  for (let h = 9; h <= 21; h++) {
    for (let m = 0; m < 60; m += (clinic?.slotDuration || 15)) {
      const hour = h > 12 ? h - 12 : h;
      const period = h >= 12 ? 'م' : 'ص';
      timeSlots.push({ value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, label: `${hour}:${String(m).padStart(2, '0')} ${period}` });
    }
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-emerald-50/20" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-violet-700 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Syringe className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{clinic?.name}</h1>
            {clinic?.address && <p className="text-xs text-gray-500">{clinic.address}</p>}
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={28} className="text-violet-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">احجز موعدك</h2>
            <p className="text-gray-500 text-sm mt-1">أدخل بياناتك واختر الموعد المناسب</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-violet-500" /> بيانات المريض
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الاسم الكامل *</label>
                  <input required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" placeholder="أدخل اسمك الكامل" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">رقم الجوال *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" placeholder="05xxxxxxxx" value={form.patientPhone} onChange={e => setForm({ ...form, patientPhone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" placeholder="email@example.com" dir="ltr" value={form.patientEmail} onChange={e => setForm({ ...form, patientEmail: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الجنس</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" value={form.patientGender} onChange={e => setForm({ ...form, patientGender: e.target.value })}>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">العمر</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" placeholder="25" value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <CalendarDays size={16} className="text-emerald-500" /> تفاصيل الموعد
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الطبيب *</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">التاريخ *</label>
                  <input required type="date" min={minDate} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الوقت *</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
                    <option value="">اختر الوقت</option>
                    {timeSlots.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ملاحظات</label>
                  <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all resize-none" rows={3} placeholder="أي ملاحظات إضافية..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">{error}</div>
            )}

            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-l from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 text-base">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> جاري الحجز...
                </span>
              ) : 'تأكيد الحجز'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">نظام إدارة العيادات - عيادة © {new Date().getFullYear()}</p>
      </main>
    </div>
  );
}
