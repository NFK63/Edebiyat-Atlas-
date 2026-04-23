// ==============================================
// EDEBİYAT ATLASI - ANA JAVASCRIPT DOSYASI
// Türkiye sınırlı, tam etkileşimli harita
// ==============================================

(function() {
    'use strict';

    // ---------- HARİTA BAŞLATMA (SADECE TÜRKİYE) ----------
    const map = L.map('map', {
        center: [39.0, 35.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
        minZoom: 5,
        maxBounds: [[35.8, 25.5], [42.5, 45.0]],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 5
    }).addTo(map);

    // ---------- DOM ELEMENTLERİ ----------
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const locateBtn = document.getElementById('locateBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const panelContent = document.getElementById('panelContent');
    const selectedCityName = document.getElementById('selectedCityName');
    const cityCountSpan = document.getElementById('cityCount');
    const workCountSpan = document.getElementById('workCount');
    const infoPanel = document.getElementById('infoPanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const mobileToggle = document.getElementById('mobilePanelToggle');

    // ---------- HARİTA KONTROL BUTONLARI ----------
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
    
    locateBtn.addEventListener('click', () => {
        map.locate({setView: true, maxZoom: 12});
    });

    resetViewBtn.addEventListener('click', () => {
        map.setView([39.0, 35.0], 6);
    });

    map.on('locationfound', (e) => {
        L.marker(e.latlng).addTo(map).bindPopup('📍 Buradasınız').openPopup();
    });

    map.on('locationerror', () => {
        alert('Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.');
    });

    // Panel kapatma/açma (mobil)
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            infoPanel.classList.add('panel-hidden');
        });
    }
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            infoPanel.classList.remove('panel-hidden');
        });
    }

    // ---------- YARDIMCI FONKSİYON: Panel İçeriğini Oluştur ----------
    function renderCityPanel(cityData) {
        if (!cityData) return;
        
        const cityName = cityData.sehir;
        const eserler = cityData.eserler || [];
        
        selectedCityName.textContent = cityName;
        
        let html = `
            <div class="city-info-header">
                <h3><i class="fas fa-location-dot" style="color:#d4a373; margin-right:8px;"></i>${cityName}</h3>
                <div class="work-count">Bu şehirde ${eserler.length} eser bulundu</div>
            </div>
        `;
        
        if (eserler.length === 0) {
            html += `<p style="color:#8b7b6e; text-align:center; padding:30px;">Bu şehir için henüz eser eklenmemiş.</p>`;
        } else {
            eserler.forEach(eser => {
                html += `
                    <div class="work-card">
                        <div class="work-title">${eser.baslik}</div>
                        <div class="work-author">
                            <span class="work-author-name"><i class="fas fa-feather-alt" style="margin-right:6px;"></i>${eser.yazar}</span>
                            <span class="work-type-badge">${eser.tur || 'Öykü'}</span>
                        </div>
                        <div class="work-summary">${eser.ozet}</div>
                        <div class="author-bio">
                            <div class="author-bio-header" onclick="this.nextElementSibling.classList.toggle('show'); this.querySelector('i').classList.toggle('fa-chevron-down'); this.querySelector('i').classList.toggle('fa-chevron-up');">
                                <i class="fas fa-chevron-down"></i> Yazar Biyografisi
                            </div>
                            <div class="author-bio-text">${eser.yazarBio || 'Biyografi bilgisi yakında eklenecek.'}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        panelContent.innerHTML = html;
        
        // Mobilde paneli otomatik aç
        if (window.innerWidth <= 768) {
            infoPanel.classList.remove('panel-hidden');
        }
    }

    // Biyografi aç/kapat için global fonksiyon (butonda onclick ile çağrılır)
    window.toggleBio = function(headerElement) {
        const textDiv = headerElement.nextElementSibling;
        const icon = headerElement.querySelector('i');
        textDiv.classList.toggle('show');
        if (textDiv.classList.contains('show')) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    };

    // ---------- VERİ YÜKLEME VE MARKER EKLEME ----------
    // NOT: Bu kısım gerçek JSON gelince çalışacak. Şimdilik test verisi ile gösteriyoruz.
    
    let cityDataList = []; // Tüm şehir verileri burada tutulacak
    let markersLayer = L.layerGroup().addTo(map);
    
    // Örnek test verisi (JSON gelene kadar)
    const testCity = {
        sehir: "Ankara",
        koordinat: [39.9334, 32.8597],
        eserler: [
            {
                baslik: "Ankara (Roman)",
                yazar: "Yakup Kadri Karaosmanoğlu",
                tur: "Roman",
                ozet: "Milli Mücadele yıllarından Cumhuriyet'in ilk dönemlerine kadar Ankara'nın ve Türk toplumunun geçirdiği değişimi anlatan önemli bir eserdir.",
                yazarBio: "Yakup Kadri Karaosmanoğlu (1889-1974), Türk roman, öykü ve deneme yazarı, diplomattır. Eserlerinde toplumsal değişimi işlemiştir."
            },
            {
                baslik: "Eskici",
                yazar: "Refik Halit Karay",
                tur: "Hikaye",
                ozet: "Gurbetteki bir çocuğun memleket özlemini ve bir eskiciyle kurduğu kısa ama anlamlı diyaloğu anlatır.",
                yazarBio: "Refik Halit Karay (1888-1965), Anadolu'yu ve sürgün yıllarını en iyi anlatan yazarlardandır. 'Memleket Hikayeleri' ünlüdür."
            }
        ]
    };
    
    function addCityMarkers(cities) {
        markersLayer.clearLayers();
        let totalWorks = 0;
        
        cities.forEach(city => {
            const marker = L.marker(city.koordinat).addTo(markersLayer);
            marker.bindPopup(`<b>${city.sehir}</b><br>${city.eserler.length} eser`);
            
            marker.on('click', () => {
                renderCityPanel(city);
                map.setView(city.koordinat, map.getZoom());
            });
            
            totalWorks += city.eserler.length;
        });
        
        cityCountSpan.textContent = cities.length;
        workCountSpan.textContent = totalWorks;
    }
    
    // Şimdilik test verisini yükle
    cityDataList = [testCity];
    addCityMarkers(cityDataList);
    
    // Hoşgeldin mesajı için varsayılan panel içeriği (ilk yüklemede)
    // Panelde zaten HTML olarak var, dokunmuyoruz.
    
    console.log('✅ Harita başarıyla yüklendi. Sınırlar: Türkiye. Veri: Ankara test.');
    
    // ---------- GERÇEK JSON ENTEGRASYONU İÇİN HAZIRLIK ----------
    // Bu fonksiyon daha sonra fetch ile edebiyat.json'u çekip yukarıdaki test verisini değiştirecek.
    async function loadRealData() {
        try {const response = await fetch('data/edebiyat.json?t=' + new Date().getTime());
            const data = await response.json();
            cityDataList = data;
            addCityMarkers(cityDataList);
            console.log('📚 Gerçek veriler yüklendi.');
        } catch (error) {
            console.warn('JSON henüz eklenmedi, test verisi gösteriliyor.');
        }
    }
    
    // Sayfa yüklendiğinde gerçek veriyi yüklemeyi dene
    window.addEventListener('load', () => {
        loadRealData();
    });

})();
