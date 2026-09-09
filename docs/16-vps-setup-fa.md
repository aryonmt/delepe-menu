# راه‌اندازی روی VPS اوبونتو

این چک‌لیست برای تحویل به کارفرماست: یک سرور اوبونتو ۲۴٫۰۴، داکر، دامنه (اختیاری در ابتدا)، SSL خودکار با Caddy، منوی خالی که مالک از پنل ادمین پر می‌کند، و QR به آدرس عمومی.

مشخصات فنی انگلیسی در [`12-deployment.md`](12-deployment.md) است. اگر این فایل با آن تعارض داشت، این راهنمای عملیاتی را با کد هم‌خوان کنید و سند انگلیسی را هم به‌روز کنید.

ریپو: `https://github.com/aryonmt/delepe-menu.git`

---

## چه چیزی تحویل می‌دهید

| چیز | توضیح |
| --- | --- |
| منوی عمومی | `https://دامنه/` یا `http://آی‌پی/` — ابتدا خالی است |
| پنل مالک | `https://دامنه/login` |
| دیتابیس و عکس‌ها | ولوم‌های داکر؛ بکاپ روزانه روی دیسک سرور |
| QR | خود پروژه QR نمی‌سازد. یک QR چاپی به همان URL منو می‌زنید |

---

## صفر — از لپ‌تاپ خودتان (قبل از سرور)

کد نهایی باید روی GitHub باشد (سرور از آنجا clone/pull می‌کند):

```bash
git status
git add -A
git commit -m "chore: production bind, empty seed, deploy hardening"
git push origin main
```

اگر ریپو خصوصی است، روی GitHub یک Personal Access Token با دسترسی `repo` بسازید؛ روی سرور به‌جای پسورد از آن استفاده می‌کنید.

از پنل ابری آی‌پی عمومی VPS را یادداشت کنید. در این راهنما می‌نویسم:

```text
VPS_IP=203.0.113.10
```

خودتان عدد واقعی را جای آن بگذارید.

---

## ۱) ورود SSH و کاربر deploy

به‌عنوان root (یا کاربر اولیه ابری):

```bash
ssh root@203.0.113.10
```

اوبونتو و به‌روزرسانی:

```bash
cat /etc/os-release
apt update && apt upgrade -y
timedatectl set-timezone Asia/Tehran
```

کاربر غیرroot با sudo:

```bash
adduser deploy
usermod -aG sudo deploy
```

کلید SSH خودتان را برای `deploy` بگذارید (از **لپ‌تاپ**):

```bash
ssh-copy-id deploy@203.0.113.10
```

بعد با `deploy` وارد شوید و ورود root با رمز را ببندید (اختیاری ولی توصیه‌شده):

```bash
ssh deploy@203.0.113.10
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl reload ssh
```

---

## ۲) فایروال

فقط ۲۲ (SSH)، ۸۰ و ۴۴۳ باید از اینترنت باز باشند. Postgres روی `127.0.0.1` است و نباید روی اینترنت publish شود.

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

اگر SSH روی پورت دیگری است، همان را allow کنید قبل از `ufw enable`.

---

## ۳) نصب Docker روی اوبونتو ۲۴٫۰۴

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deploy
```

خروجی و ورود دوباره تا گروه `docker` اعمال شود:

```bash
exit
ssh deploy@203.0.113.10
docker version
docker compose version
```

---

## ۴) کلون پروژه

```bash
sudo mkdir -p /opt
sudo chown deploy:deploy /opt
cd /opt
git clone https://github.com/aryonmt/delepe-menu.git
cd /opt/delepe-menu
```

اگر از قبل کلون کرده‌اید:

```bash
cd /opt/delepe-menu
git fetch origin
git checkout main
git pull origin main
```

---

## ۵) فایل `.env` — حتماً سکرت واقعی

```bash
cd /opt/delepe-menu
cp .env.example .env
nano .env
```

مقادیر را **جایگزین** کنید. در حالت Docker Compose اگر `SESSION_SECRET` همان متن نمونه باشد یا `ADMIN_PASSWORD=change-me-now` بماند، کانتینر `app` بالا نمی‌آید.

تولید کلید نشست:

```bash
openssl rand -base64 48
```

رمز دیتابیس:

```bash
openssl rand -base64 24
```

نمونهٔ `.env` روی سرور (مقادیر ساختگی؛ مال خودتان را بگذارید):

```env
DATABASE_URL="postgresql://delepe:LOCAL_ONLY@localhost:5432/delepe"
SESSION_SECRET="خروجی-openssl-rand-base64-48"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="یک-رمز-قوی-برای-مالک"
POSTGRES_PASSWORD="خروجی-openssl-رمز-دیتابیس"
# CADDY_SITE را فعلاً نگذارید تا روی آی‌پی با HTTP کار کند
# CADDY_SITE=menu.example.com
```

نکات:

- `DATABASE_URL` روی localhost بماند. سرویس `app` داخل Compose آن را به `db:5432` عوض می‌کند و همان `POSTGRES_PASSWORD` را در URL می‌گذارد.
- `MASTER_USERNAME` / `MASTER_PASSWORD` را خالی بگذارید مگر برای بازیابی اضطراری.
- `CADDY_SITE` را تا وقتی دامنه به این آی‌پی اشاره نکرده ست نکنید.

---

## ۶) بیلد و بالا آوردن استک

```bash
cd /opt/delepe-menu
docker compose up -d --build
```

زمان بیلد چند دقیقه است. مرحله `pnpm build` فونت‌های Lalezar و Vazirmatn را از Google می‌گیرد (فقط موقع بیلد؛ در مرورگر مهمان به گوگل وصل نمی‌شود). اگر این مرحله timeout شد، روی سرور outbound به گوگل را باز کنید یا موقتاً از VPN سرور استفاده کنید، بعد دوباره `--build`.

صبر کنید تا healthy شود:

```bash
docker compose ps
docker compose logs app --tail=80
```

باید `app` و `db` و `caddy` **Up** باشند و `app` برابر `healthy`.

تست سلامت از خود سرور:

```bash
curl -sf http://127.0.0.1/api/health
```

باید چاپ شود: `{"ok":true,"db":true}`

اگر `app` unhealthy بود ولی لاگ `Ready` داشت، این را بزنید (باید JSON برگردد؛ اگر `ECONNREFUSED` بود یعنی بایند `HOSTNAME` اعمال نشده — کد فعلی `HOSTNAME=0.0.0.0` را در entrypoint می‌گذارد):

```bash
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"
```

---

## ۷) سید اولیه (منوی خالی + ادمین)

```bash
docker compose exec app ./node_modules/.bin/prisma db seed
```

این دستور دسته و محصول نمی‌سازد. فقط تنظیمات پیش‌فرض و کاربر ادمین (اگر هنوز هیچ ادمینی نباشد).

از مرورگر لپ‌تاپ:

```text
http://203.0.113.10/
```

باید صفحهٔ خالی منو («منو به‌زودی تکمیل می‌شود») را ببینید.

ورود پنل:

```text
http://203.0.113.10/login
```

با `ADMIN_USERNAME` و `ADMIN_PASSWORD` که در `.env` گذاشتید. بعد از ورود، از تنظیمات ادمین **رمز را عوض کنید**.

اگر لاگین cookie را نگه نداشت، کش مرورگر را خالی کنید و با HTTP خالص (نه HTTPS اشتباه) باز کنید. روی HTTP کوکی `Secure` ست نمی‌شود؛ بعد از SSL ست می‌شود.

---

## ۸) دامنه و SSL (Let's Encrypt از طریق Caddy)

Caddy وقتی آدرس سایت یک **hostname** باشد (نه `http://:80`) گواهی را خودکار می‌گیرد. طبق مستند Caddy، پیشوند `http://` یعنی TLS خاموش؛ دامنهٔ خالی یعنی HTTPS خودکار.

### ۸٫۱ DNS

در پنل دامنه یک رکورد **A** بگذارید:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` یا `menu` | آی‌پی VPS | 300 |

مثال: `menu.example.com` → `203.0.113.10`

صبر کنید تا از اینترنت resolve شود:

```bash
# از لپ‌تاپ یا سرور
dig +short menu.example.com
```

باید همان آی‌پی VPS باشد. پورت ۸۰ و ۴۴۳ باید از اینترنت به سرور برسند (فایروال ابری + ufw).

### ۸٫۲ فعال‌کردن TLS در Compose

```bash
cd /opt/delepe-menu
nano .env
```

این خط را اضافه یا از کامنت درآورید (بدون `https://` و بدون اسلش انتهایی):

```env
CADDY_SITE=menu.example.com
```

سپس فقط Caddy را با env جدید بالا بیاورید:

```bash
docker compose up -d caddy
docker compose logs caddy --tail=50
```

بعد از یک تا دو دقیقه:

```bash
curl -sfI https://menu.example.com/api/health
curl -sf https://menu.example.com/api/health
```

باید `200` و `{"ok":true,"db":true}` باشد. مرورگر قفل HTTPS نشان می‌دهد.

اگر گواهی نگرفت:

- DNS هنوز به این سرور نرسیده
- پورت ۸۰ از بیرون بسته است (چالش ACME)
- `CADDY_SITE` با نام DNS یکی نیست (www را جدا حساب کنید)

برای `www` و ریشه هر دو، یا دو رکورد A بگذارید و در Caddy فقط یکی را به‌عنوان `CADDY_SITE` استفاده کنید، یا بعداً سایت دوم را به Caddyfile اضافه کنید. برای v1 یک hostname کافی است.

ورود ادمین بعد از SSL:

```text
https://menu.example.com/login
```

---

## ۹) QR کد برای میزها

پروژه ابزار ساخت QR ندارد. QR باید به **همان URL منوی عمومی** اشاره کند، نه به `/login`.

- با دامنه: `https://menu.example.com/`
- بدون دامنه: `http://203.0.113.10/` (کم‌پایدار؛ آی‌پی عوض شود QR می‌میرد)

ساختن QR:

1. از هر سازندهٔ QR معتبر (مثلاً سایت بانک/چاپخانه، یا `https://goqr.me`) URL را وارد کنید.
2. خروجی PNG/SVG با کیفیت چاپ بگیرید.
3. روی میز، شیشه، و اینستاگرام همان لینک را بگذارید.

بعد از خرید دامنه، QRهای قدیمی با آی‌پی را عوض کنید.

تست واقعی: با موبایل (اینترنت همراه، نه فقط وای‌فای رستوران) QR را اسکن کنید و منو را ورق بزنید.

---

## ۱۰) کارفرما منو را چطور پر می‌کند

1. `https://دامنه/login`
2. دسته‌ها: حداکثر دو سطح (مثلاً «غذای اصلی» و زیرش «پیتزا»)
3. محصول فقط روی دستهٔ برگ (بدون زیرشاخه)
4. عکس مربع؛ قیمت به تومان
5. ذخیره → منوی عمومی همان را نشان می‌دهد

سید را دوباره نزنید که «داده نمونه» بیاید؛ سید تولید منو نمی‌سازد.

---

## ۱۱) بکاپ روزانه

```bash
sudo mkdir -p /backups
sudo chown deploy:deploy /backups
chmod +x /opt/delepe-menu/scripts/backup.sh /opt/delepe-menu/scripts/restore.sh
```

تست یک‌باره:

```bash
cd /opt/delepe-menu
BACKUP_DIR=/backups ./scripts/backup.sh
ls -lh /backups
```

کرون ساعت ۳:۱۵ بامداد:

```bash
crontab -e
```

این خط را بگذارید:

```cron
15 3 * * * BACKUP_DIR=/backups /opt/delepe-menu/scripts/backup.sh >> /backups/backup.log 2>&1
```

بازیابی (مخرب است؛ استک باید بالا باشد):

```bash
cd /opt/delepe-menu
./scripts/restore.sh /backups/db-TIMESTAMP.dump /backups/storage-TIMESTAMP.tgz
curl -sf http://127.0.0.1/api/health
```

فایل‌های بکاپ را گاهی روی سیستم دیگری هم کپی کنید (خارج از همین VPS).

---

## ۱۲) فراموشی رمز ادمین

```bash
cd /opt/delepe-menu
docker compose exec app ./node_modules/.bin/tsx scripts/admin-reset.ts --username admin --password 'رمز-جدید-قوی'
```

---

## ۱۳) به‌روزرسانی بعدی

```bash
cd /opt/delepe-menu
git pull origin main
docker compose up -d --build
docker compose exec app ./node_modules/.bin/prisma db seed
```

سید دوباره رمز ادمین و تنظیمات ذخیره‌شده را عوض نمی‌کند.

لاگ‌ها:

```bash
docker compose logs -f --tail=100 app
docker compose logs -f --tail=50 caddy
```

---

## ۱۴) عیب‌یابی سریع

| علامت | کار |
| --- | --- |
| `app` unhealthy، `Ready` در لاگ | `fetch` به `127.0.0.1:3000`؛ باید `HOSTNAME=0.0.0.0` باشد |
| `EACCES ... /nonexistent/.cache/node/corepack` | سید را با `./node_modules/.bin/prisma db seed` بزنید نه `pnpm` |
| بیلد روی دانلود فونت گیر می‌کند | دسترسی خروجی به Google Fonts در بیلد |
| کانتینر با خطای SESSION_SECRET / ADMIN_PASSWORD نمی‌آید | جای placeholder در `.env` را عوض کنید، بعد `docker compose up -d` |
| SSL نمی‌آید | DNS A، پورت ۸۰ از اینترنت، `CADDY_SITE` دقیقاً همان hostname |
| لاگین روی HTTP نمی‌ماند | کوکی Secure فقط روی HTTPS؛ روی آی‌پی باید HTTP باشد نه HTTPS خودامضا مگر Caddy آن را بدهد |
| منو خالی است | طبیعی است تا مالک از ادمین دسته و محصول بسازد |

وضعیت پورت‌های گوش‌دادن روی خود VPS:

```bash
sudo ss -tlnp | grep -E ':80|:443|:5432|:3000'
```

باید ۸۰ و ۴۴۳ روی Caddy باشد. `5432` فقط `127.0.0.1`. پورت `3000` اپ نباید روی اینترنت publish شده باشد.

---

## ۱۵) چک‌لیست تحویل به کارفرما

- [ ] `https://دامنه/` (یا HTTP آی‌پی) صفحهٔ خالی منو را نشان می‌دهد
- [ ] `/api/health` برابر `{"ok":true,"db":true}`
- [ ] لاگین ادمین کار می‌کند؛ رمز اولیه عوض شده
- [ ] یک دسته و یک محصول تست با عکس ذخیره شده و روی منوی عمومی دیده می‌شود
- [ ] QR چاپ‌شده همان URL عمومی را باز می‌کند (موبایل اینترنت همراه)
- [ ] بکاپ دستی یک‌بار موفق شده؛ کرون ثبت شده
- [ ] `SESSION_SECRET` و `POSTGRES_PASSWORD` و رمز ادمین از مقادیر نمونه نیستند
- [ ] `MASTER_*` در `.env` خاموش است
- [ ] فایروال فقط ۲۲/۸۰/۴۴۳
