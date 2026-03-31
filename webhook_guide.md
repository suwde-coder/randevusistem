# Jenkins - GitHub Webhook Yapılandırma Rehberi

GitHub'daki her `push` işleminin Jenkins boru hattını otomatik olarak tetiklemesi için aşağıdaki adımları sırasıyla uygulayın.

## 1. Jenkins Hazırlığı
1. Jenkins yönetim paneline (Dashboard) gidin.
2. **Manage Jenkins > Plugins** kısmından **GitHub Plugin**'in yüklü olduğunu doğrulayın.
3. Projenizin (Pipeline) ayarlarına gidin.
4. **Build Triggers** bölümünde **GitHub hook trigger for GITScm polling** seçeneğinin işaretli olduğundan emin olun.

## 2. GitHub Webhook Ayarları
1. GitHub deponuzun (repository) **Settings** sekmesine gidin.
2. Sol menüden **Webhooks** seçeneğine tıklayın.
3. **Add webhook** butonuna basın.
4. Aşağıdaki bilgileri doldurun:
    - **Payload URL:** `http://<JENKINS_URL>/github-webhook/` (Sondaki eğik çizgiyi `/` unutmayın).
    - **Content type:** `application/json`
    - **Which events would you like to trigger this webhook?** `Just the push event.` seçeneğini işaretleyin.
5. **Add webhook** diyerek kaydedin.

## 3. Doğrulama
- GitHub Webhooks sayfasında oluşturduğunuz webhook'un yanında yeşil bir tik işareti görmelisiniz.
- Yerel bilgisayarınızda küçük bir değişiklik yapıp `git push` yapın. Jenkins üzerinde yeni bir build'in otomatik olarak başladığını göreceksiniz.

---

> [!IMPORTANT]
> Jenkins sunucunuzun dış dünyaya (veya en azından GitHub'ın IP adreslerine) açık olması gerekir. Yerel bir makinede çalışıyorsanız **ngrok** gibi bir servis kullanarak geçici bir URL alabilirsiniz.

> [!TIP]
> Webhook URL'sini test etmek için GitHub Webhooks sayfasındaki **Recent Deliveries** sekmesini kullanabilirsiniz. Hata alıyorsanız Jenkins loglarını kontrol edin.
