---
title: Dental Clinic Manager
emoji: 🦷
colorFrom: purple
colorTo: green
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# نظام إدارة عيادات الأسنان — Dental Clinic Manager

نظام متكامل لإدارة عيادات الأسنان: المواعيد، المرضى، الفواتير، المخزون، التقارير، الاشتراكات، والعروض.

## بيانات الدخول الافتراضية

- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`

يتم إنشاء حساب المالك (super_admin) تلقائياً عند أول تشغيل، ويتم ضمان وجوده دائماً عبر `start.sh` الذي يستدعي `/api/seed` بعد إقلاع الخادم.

## البنية التقنية

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Prisma ORM + SQLite (تخزين دائم في `/data`)
- Docker SDK على Hugging Face Spaces
- البناء standalone لتقليل حجم الصورة

## التخزين الدائم

قاعدة البيانات SQLite محفوظة في `/data/custom.db` على HF Spaces، مما يضمن بقاء البيانات بعد إعادة بناء الحاوية.
