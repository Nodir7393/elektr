# Podstansiya Boshqaruv Tizimi

Elektr hisoblagichlari va podstansiyalarni boshqarish uchun web-tizim. Tizim orqali podstansiyalar ma'lumotlarini kiritish, tahrirlash, o'chirish, filtrlash, statistikani ko'rish va Excel fayldan import qilish mumkin.

## Texnologiyalar

### Frontend
- **React 18** + **TypeScript** — UI komponentlar
- **Vite** — development server va build
- **Lucide React** — ikonkalar

### Backend
- **Laravel 12** — PHP 8.4 framework (RESTful API)
- **PostgreSQL 17** — ma'lumotlar bazasi
- **Redis** — cache / queue / session
- **Laravel Sanctum** — token-asosli autentifikatsiya
- **PhpSpreadsheet** — Excel import

### DevOps
- **Docker + docker-compose** — lokal stack (api, pwa, queue, db, redis)
- **GitHub Actions** — CI (api testlari + pwa build)
- **Zero-downtime deploy** — `server/` reliz-symlink skriptlari

## Loyiha tuzilmasi

```
qiyom/
├── pwa/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/           # UI komponentlar (Login, Table, Modal, Filters, ...)
│   │   ├── lib/api.ts            # API client (fetch + auth)
│   │   ├── types/database.ts     # TypeScript tiplar
│   │   └── App.tsx               # Asosiy komponent
│   └── vite.config.ts            # Vite + proxy sozlash
├── api/                          # Backend (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php        # Login/Logout
│   │   │   └── SubstationController.php  # CRUD + Import
│   │   └── Models/               # User, Substation
│   ├── database/
│   │   ├── migrations/           # Baza migratsiyalari
│   │   └── seeders/AdminSeeder.php   # Admin foydalanuvchi
│   └── routes/api.php            # API routelar
├── docker/
│   ├── backend/Dockerfile        # PHP 8.4 (yandex apt mirror fix)
│   └── frontend/Dockerfile       # Node 20
├── server/                       # Zero-downtime deploy skriptlari
│   ├── setup.sh · deploy.sh · rollback.sh
│   └── deploy.conf.example
├── .github/workflows/ci.yml      # CI: api testlari + pwa build
├── docker-compose.yml            # api · pwa · queue · db · redis
├── .env.template                 # docker-compose root env namunasi
└── .gitignore
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
cd api

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
cd pwa
npm install
```

## Ishga tushirish

### Docker bilan (eng oson)

Butun stack (api, pwa, queue, postgres, redis) bitta buyruq bilan:

```bash
cp .env.template .env
# APP_KEY generatsiya qiling va .env ga qo'ying:
docker compose run --rm api php artisan key:generate --show

docker compose up -d --build
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed --class=AdminSeeder
```

Portlar (konflikt bo'lmasligi uchun standart bo'lmagan):

| Xizmat | URL / port |
|--------|-----------|
| pwa (frontend) | http://localhost:5173 |
| api (backend)  | http://localhost:8001 |
| PostgreSQL     | localhost:5433 |
| Redis          | localhost:6380 |

### Development rejimi (Dockersiz)

```bash
# Terminal 1: Backend server
cd api && php artisan serve --port=8000

# Terminal 2: Frontend dev server
cd pwa && npm run dev
```

Brauzerda: [http://localhost:5173](http://localhost:5173)

### Production build

```bash
cd pwa && npm run build
```

Tayyor fayllar `pwa/dist/` papkasida hosil bo'ladi.

## Login

| Maydon | Qiymat |
|--------|--------|
| Email | `admin@qiyom.uz` |
| Parol | `Qiyomiddin123` |

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

## Deploy (server)

Zero-downtime deploy `server/` skriptlari orqali (reliz papkasi + `current` symlink):

```bash
cp server/deploy.conf.example server/deploy.conf   # PROJECT_NAME, REPO_URL, ... ni to'ldiring
bash server/setup.sh                                # bir marta: releases/ shared/ tuzilmasi
# shared/.env ichida APP_KEY va DB_PASSWORD ni to'ldiring

bash server/deploy.sh      # yangi reliz + migratsiya + atomik almashtirish + health-check
bash server/rollback.sh    # muammo bo'lsa oldingi relizga qaytish
```

### CI orqali avtomatik deploy

`.github/workflows/ci.yml` har bir push'da api testlari va pwa build'ini, `main`'ga push'da esa (testlar o'tsa) `deploy` job orqali serverda `server/deploy.sh` ni SSH bilan ishga tushiradi.

Kerakli **GitHub Secrets**: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH` (serverdagi bootstrap repo yo'li), ixtiyoriy `SSH_PORT`.

Serverda bir marta bootstrap: repo'ni `DEPLOY_PATH` ga clone qiling, `server/deploy.conf` ni to'ldiring va `bash server/setup.sh` ni ishga tushiring.

## Litsenziya

Bu loyiha xususiy foydalanish uchun mo'ljallangan.
