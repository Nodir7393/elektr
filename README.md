# Podstansiya Boshqaruv Tizimi

Elektr hisoblagichlari va podstansiyalarni boshqarish uchun web-tizim. Tizim orqali podstansiyalar ma'lumotlarini kiritish, tahrirlash, o'chirish, filtrlash, statistikani ko'rish va Excel fayldan import qilish mumkin.

## Texnologiyalar

### Frontend
- **React 18** + **TypeScript** — UI komponentlar
- **Vite** — development server va build
- **Lucide React** — ikonkalar

### Backend
- **Laravel 12** — PHP framework (RESTful API)
- **PostgreSQL 17** — ma'lumotlar bazasi
- **Laravel Sanctum** — token-asosli autentifikatsiya
- **PhpSpreadsheet** — Excel import

## Loyiha tuzilmasi

```
qiyom/
├── src/                          # Frontend (React)
│   ├── components/
│   │   ├── LoginPage.tsx         # Login sahifasi
│   │   ├── SubstationTable.tsx   # Ma'lumotlar jadvali
│   │   ├── SubstationModal.tsx   # Qo'shish/tahrirlash modal
│   │   ├── DeleteModal.tsx       # O'chirish tasdiqlash
│   │   ├── ImportModal.tsx       # Excel import modal
│   │   ├── Statistics.tsx        # Statistika kartochkalar
│   │   ├── Filters.tsx           # Filtrlash
│   │   └── Pagination.tsx        # Sahifalash (30 ta/sahifa)
│   ├── lib/
│   │   └── api.ts                # API client (fetch + auth)
│   ├── types/
│   │   └── database.ts           # TypeScript tiplar
│   └── App.tsx                   # Asosiy komponent
├── backend/                      # Backend (Laravel)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php        # Login/Logout
│   │   │   └── SubstationController.php  # CRUD + Import
│   │   └── Models/
│   │       ├── User.php
│   │       └── Substation.php
│   ├── database/
│   │   ├── migrations/           # Baza migratsiyalari
│   │   └── seeders/
│   │       └── AdminSeeder.php   # Admin foydalanuvchi
│   └── routes/
│       └── api.php               # API routelar
├── dist/                         # Production build
└── vite.config.ts                # Vite + proxy sozlash
```

## O'rnatish

### Talablar

- PHP >= 8.2
- Composer
- PostgreSQL >= 15
- Node.js >= 18
- npm

### 1. PostgreSQL bazani sozlash

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE qiyom;
CREATE USER qiyom_user WITH ENCRYPTED PASSWORD 'qiyom_secret';
GRANT ALL PRIVILEGES ON DATABASE qiyom TO qiyom_user;
ALTER DATABASE qiyom OWNER TO qiyom_user;
\q
```

### 2. Backend o'rnatish

```bash
cd backend

# Paketlarni o'rnatish
composer install

# .env faylni sozlash
cp .env.example .env
php artisan key:generate
```

`.env` fayldagi baza sozlamalarini o'zgartiring:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=qiyom
DB_USERNAME=qiyom_user
DB_PASSWORD=qiyom_secret
```

```bash
# Migratsiyalarni bajarish
php artisan migrate

# Admin foydalanuvchi yaratish
php artisan db:seed --class=AdminSeeder
```

### 3. Frontend o'rnatish

```bash
# Asosiy papkada
npm install
```

## Ishga tushirish

### Development rejimi

```bash
# Terminal 1: Backend server
cd backend && php artisan serve --port=8000

# Terminal 2: Frontend dev server
npm run dev
```

Brauzerda: [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm run build
```

Tayyor fayllar `dist/` papkasida hosil bo'ladi.

## Login

| Maydon | Qiymat |
|--------|--------|
| Email | `admin@qiyom.uz` |
| Parol | `admin123` |

> **Eslatma:** Parolni production muhitda albatta o'zgartiring.

## API endpointlar

Barcha endpointlar `/api` prefiksi bilan ishlaydi. Login bundan mustasno, qolgan barcha routelar `auth:sanctum` middleware bilan himoyalangan.

| Metod | Route | Tavsif |
|-------|-------|--------|
| `POST` | `/api/login` | Tizimga kirish (token olish) |
| `POST` | `/api/logout` | Tizimdan chiqish |
| `GET` | `/api/me` | Joriy foydalanuvchi |
| `GET` | `/api/substations` | Barcha podstansiyalar |
| `POST` | `/api/substations` | Yangi podstansiya qo'shish |
| `GET` | `/api/substations/{id}` | Bitta podstansiya |
| `PUT` | `/api/substations/{id}` | Podstansiyani yangilash |
| `DELETE` | `/api/substations/{id}` | Podstansiyani o'chirish |
| `POST` | `/api/substations/import` | Excel fayldan import |

## Excel import

Import modal orqali `.xlsx`, `.xls`, `.csv` formatdagi fayllarni yuklash mumkin. Excel jadval quyidagi ustunlar tartibida bo'lishi kerak:

| Ustun | Maydon |
|-------|--------|
| A | № (tartib raqami — o'tkaziladi) |
| B | MET filiali nomi |
| C | Podstansiya nomi |
| D | Tarmoq nomi |
| E | Kuchlanishi |
| F | Hisoblagich rusumi |
| G | Elektr hisoblagich zavod raqami |
| H | Nominal tok |
| I | Nominal kuchlanish |
| J | SIM karta raqami |
| K | TT |
| L | KT |
| M | Xisob koeffitsienti |
| N | Muhr raqami |
| O | Oqim yo'nalishi |
| P | Hisoblagich o'rnatish naryad raqami va sanasi |

> Birinchi qator (header) avtomatik o'tkazib yuboriladi.

## Asosiy funksiyalar

- **Autentifikatsiya** — login/logout, token-asosli himoya
- **CRUD** — podstansiyalarni qo'shish, ko'rish, tahrirlash, o'chirish
- **Filtrlash** — hisoblagich rusumi, nominal kuchlanish, kuchlanishi, nominal tok bo'yicha
- **Statistika** — parametrlar bo'yicha umumiy hisobot
- **Kategoriya** — 220-500 kV va 35-110 kV alohida tablar
- **Pagination** — 30 ta yozuv har sahifada
- **Excel import** — drag-and-drop bilan fayl yuklash

## Litsenziya

Bu loyiha xususiy foydalanish uchun mo'ljallangan.
