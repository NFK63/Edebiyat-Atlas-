// ==============================================
// EDEBİYAT ATLASI - ANA JAVASCRIPT DOSYASI
// ==============================================

(function() {
    'use strict';

    // ---------- HARİTA BAŞLATMA ----------
    // Türkiye merkezli harita
    const map = L.map('map', {
        center: [39.0, 35.0],
        zoom: 6,
        zoomControl: false,       // Kendi butonlarımızı kullanacağız
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true
    });

    // Açık kaynak harita katmanı (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları',
        maxZoom: 19,
        minZoom: 5
    }).addTo(map);

    // Türkiye sınırlarını kısıtla (isteğe bağlı)
    map.setMaxBounds([[36.0, 26.0], [42.2, 45.0]]);

    // ---------- DOM ELEMENTLERİ ----------
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const locateBtn = document.getElementById('locateBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const panelContent = document.getElementById('panelContent');
    const selectedCityName = document.getElementById('selectedCityName');
    const cityCountSpan = document.getElementById('cityCount');
    const workCountSpan = document.getElementById('workCount');

    // ---------- HARİTA KONTROL BUTONLARI ----------
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
    
    locateBtn.addEventListener('click', () => {
        map.locate({setView: true, maxZoom: 12});
    });

    resetViewBtn.addEventListener('click', () => {
        map.setView([39.0, 35.0], 6);
    });

    // Konum bulunca göster
    map.on('locationfound', (e) => {
        L.marker(e.latlng).addTo(map)
            .bindPopup('📍 Buradasınız').openPopup();
    });

    map.on('locationerror', () => {
        alert('Konumunuz alınamadı. Lütfen cihaz konum izinlerini kontrol edin.');
    });

    // ---------- VERİ YÜKLEME (Şimdilik boş - sonra JSON'dan dolduracağız) ----------
    // Bu kısmı bir sonraki adımda edebiyat.json ile birleştireceğiz.
    // Şu an sadece harita çalışıyor olsun diye boş bırakıyorum.
    
    // Geçici olarak hoş geldin mesajı zaten panelde var.
    // İstatistikleri sıfır göster.
    cityCountSpan.textContent = '0';
    workCountSpan.textContent = '0';

    // Panel kapatma butonu (mobil için)
    const closePanelBtn = document.getElementById('closePanelBtn');
    const infoPanel = document.getElementById('infoPanel');
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            infoPanel.classList.add('panel-hidden');
        });
    }

    // Mobil panel açma butonu (henüz HTML'de yoksa ekleyelim mi? Yok, var zaten index'te.)
    const mobileToggle = document.getElementById('mobilePanelToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            infoPanel.classList.remove('panel-hidden');
        });
    }

    // ---------- ÖRNEK MARKER (Test için - sonra silinecek) ----------
    // Bu kısmı sadece haritanın çalıştığını görmek için ekliyorum.
    // JSON'u yüklediğimizde burayı kaldıracağız.
    const testMarker = L.marker([39.9334, 32.8597]).addTo(map)
        .bindPopup('<b>Ankara</b><br>Başkent. Eserler yakında eklenecek.');
    
    console.log('✅ Harita başarıyla yüklendi. Sırada edebiyat.json var.');

})();
