# NYC3 Console - Acil Komutlar

## Durum
- Console'a bağlanıldı ✅
- Ancak `nf_conntrack: table full` hatası var ⚠️
- Sürekli UFW BLOCK mesajları görünüyor
- Network stack aşırı yüklü

## Acil Yapılacaklar

### 1. Console'da Komut Çalıştırmayı Dene

Console penceresine tıkla ve Enter'a bas. Eğer prompt görünüyorsa, şu komutları çalıştır:

```bash
# System load kontrolü
uptime

# Network connections sayısı
ss -tn | wc -l

# nf_conntrack durumu
cat /proc/sys/net/netfilter/nf_conntrack_max
cat /proc/sys/net/netfilter/nf_conntrack_count
```

### 2. nf_conntrack Limitlerini Artır

Eğer komut çalıştırabiliyorsan:

```bash
# nf_conntrack limitini artır
sysctl -w net.netfilter.nf_conntrack_max=1048576
echo "net.netfilter.nf_conntrack_max=1048576" >> /etc/sysctl.conf

# Timeout'u artır
sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=1200
echo "net.netfilter.nf_conntrack_tcp_timeout_established=1200" >> /etc/sysctl.conf

sysctl -p
```

### 3. Saldırı Hedefine Giden Trafiği Engelle

```bash
# Attack target IP'ye giden trafiği engelle
ufw deny out to 171.225.223.108

# UFW durumunu kontrol et
ufw status verbose
```

### 4. Şüpheli Process'leri Kontrol Et

```bash
# CPU kullanan process'ler
ps aux --sort=-%cpu | head -10

# Memory kullanan process'ler
ps aux --sort=-%mem | head -10

# Attack target'e bağlantı var mı?
ss -tn | grep "171.225.223.108"
```

### 5. Eğer Komut Çalıştıramıyorsan: Droplet'i Reboot Et

Console'da komut çalıştıramıyorsan (network stack çok yüklü), DigitalOcean Dashboard'dan:

1. **Droplet detay sayfasına git**
2. **"Power" menüsüne tıkla**
3. **"Power Off" seçeneğini seç**
4. **30 saniye bekle**
5. **"Power On" seçeneğini seç**
6. **2-3 dakika bekle**
7. **Console'a tekrar bağlan ve komutları çalıştır**

### 6. Reboot Sonrası Acil Güvenlik Önlemleri

Reboot sonrası hemen şunları yap:

```bash
# 1. nf_conntrack limitlerini artır
sysctl -w net.netfilter.nf_conntrack_max=1048576
echo "net.netfilter.nf_conntrack_max=1048576" >> /etc/sysctl.conf
sysctl -p

# 2. Attack target'e giden trafiği engelle
ufw deny out to 171.225.223.108

# 3. Outbound trafiği kısıtla (sadece gerekli servisler)
ufw default deny outgoing
ufw allow out 22/tcp   # SSH
ufw allow out 53/udp   # DNS
ufw allow out 80/tcp   # HTTP
ufw allow out 443/tcp  # HTTPS
ufw allow out 8080/tcp # Backend

# 4. Şüpheli process'leri kontrol et ve durdur
ps aux | grep -E "(miner|crypto|ddos|bot)" || echo "No obvious malicious processes"

# 5. Cron job'ları kontrol et
crontab -l
ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/
```

## Öncelik Sırası

1. **Console'da komut çalıştırmayı dene** (Enter'a bas, prompt görünüyor mu?)
2. **Çalışmıyorsa → Droplet'i reboot et** (Dashboard'dan)
3. **Reboot sonrası → Acil güvenlik önlemlerini uygula**
4. **Şüpheli process'leri durdur**
5. **DigitalOcean Support'a durumu bildir**

## Notlar

- `nf_conntrack: table full` hatası network stack'in aşırı yüklü olduğunu gösterir
- Bu durum genellikle DDoS saldırısı veya port scan flood'u nedeniyle olur
- Reboot geçici bir çözümdür; kalıcı çözüm için güvenlik önlemleri gerekir
- Eğer droplet tamamen compromise edilmişse, yeniden oluşturmayı düşün
