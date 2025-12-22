# DigitalOcean Console Erişim Rehberi

## NYC3 Droplet'ine Console Erişimi

### Adım 1: Droplet Detaylarına Git

1. Dashboard'da `debian-s-4vcpu-8gb-240gb-intel-nyc3-01` droplet'ine **tıkla**
2. Droplet detay sayfası açılacak

### Adım 2: Console Butonunu Bul

Droplet detay sayfasında şu seçenekleri görürsün:

1. **"Console" Butonu:**
   - Genellikle sayfanın üst kısmında veya sağ üstte
   - "Access" veya "Console" yazıyor olabilir
   - Bu butona tıkla

2. **"Recovery Console" Seçeneği:**
   - Eğer normal console çalışmıyorsa
   - "Recovery" sekmesine git
   - "Launch Recovery Console" butonuna tıkla

### Adım 3: Console Açılmazsa

Eğer console açılmıyor veya bağlanamıyorsa:

1. **Sayfayı yenile (F5 veya Cmd+R)**
2. **Farklı tarayıcı dene** (Chrome, Firefox, Safari)
3. **Tarayıcı cache'ini temizle**
4. **Incognito/Private modda dene**

### Adım 4: Hata Mesajlarını Kontrol Et

Console açılmaya çalışırken şu hatalardan birini görebilirsin:

- **"Connection failed"** → DigitalOcean tarafından izole edilmiş olabilir
- **"Droplet is locked"** → Güvenlik nedeniyle kilitlenmiş
- **"Timeout"** → Ağ sorunu veya droplet yanıt vermiyor
- **"Access denied"** → İzin sorunu

### Adım 5: Droplet Durumunu Kontrol Et

Droplet detay sayfasında şunları kontrol et:

1. **Status:** "Running" mi, "Stopped" mi, "Locked" mı?
2. **Uyarılar:** Kırmızı veya sarı uyarı mesajı var mı?
3. **Actions:** "Power Off", "Reboot", "Lock" gibi butonlar aktif mi?

### Adım 6: DigitalOcean Support'a Başvur

Eğer hiçbir yöntem çalışmıyorsa:

1. **Support sayfasına git:** https://cloud.digitalocean.com/support
2. **"Create Ticket"** butonuna tıkla
3. **Hazırladığım ticket şablonunu kullan:** `scripts/deployment/digitalocean_support_ticket.md`

## Alternatif Yöntemler

### Yöntem 1: Droplet'i Reboot Et

1. Droplet detay sayfasında **"Power"** menüsüne git
2. **"Reboot"** seçeneğini seç
3. Birkaç dakika bekle
4. Console erişimini tekrar dene

### Yöntem 2: Droplet'i Power Cycle Et

1. **"Power Off"** yap
2. 30 saniye bekle
3. **"Power On"** yap
4. Console erişimini tekrar dene

### Yöntem 3: SSH Key Kontrolü

1. Droplet detay sayfasında **"Settings"** sekmesine git
2. **"SSH Keys"** bölümünü kontrol et
3. SSH key'in ekli olduğundan emin ol

## Notlar

- Console erişimi genellikle anında çalışır
- Eğer console açılmıyorsa, bu genellikle DigitalOcean'ın güvenlik önlemi anlamına gelir
- DDoS saldırısı nedeniyle droplet izole edilmiş olabilir
- Support ekibiyle işbirliği yapmak kritik

## İletişim

- **DigitalOcean Support:** https://cloud.digitalocean.com/support
- **Ticket #11390435** - Referans olarak kullan
