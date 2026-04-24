// ==============================================
// EDEBİYAT ATLASI - ANA JAVASCRIPT (Aile Teması Vurgulu)
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

    // ---------- HARİTA KONTROL ----------
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
    locateBtn.addEventListener('click', () => { map.locate({setView: true, maxZoom: 12}); });
    resetViewBtn.addEventListener('click', () => { map.setView([39.0, 35.0], 6); });

    map.on('locationfound', (e) => {
        L.marker(e.latlng).addTo(map).bindPopup('📍 Buradasınız').openPopup();
    });
    map.on('locationerror', () => {
        alert('Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.');
    });

    if (closePanelBtn) closePanelBtn.addEventListener('click', () => infoPanel.classList.add('panel-hidden'));
    if (mobileToggle) mobileToggle.addEventListener('click', () => infoPanel.classList.remove('panel-hidden'));

    // ---------- PANEL İÇERİK OLUŞTURUCU (YENİ ALANLARLA) ----------
    function renderCityPanel(cityData) {
        if (!cityData) return;
        const cityName = cityData.sehir;
        const eserler = cityData.eserler || [];
        selectedCityName.textContent = cityName;

        let html = `
            <div class="city-info-header">
                <h3><i class="fas fa-location-dot" style="color:#d4a373;"></i> ${cityName}</h3>
                <div class="work-count">Bu şehirde ${eserler.length} eser bulundu</div>
            </div>`;

        if (eserler.length === 0) {
            html += `<p style="color:#8b7b6e; text-align:center; padding:30px;">Bu şehir için henüz eser eklenmemiş.</p>`;
        } else {
            eserler.forEach(eser => {
                html += `
                <div class="work-card">
                    <div class="work-title">${eser.baslik}</div>
                    <div class="work-author">
                        <span class="work-author-name"><i class="fas fa-feather-alt"></i> ${eser.yazar}</span>
                        <span class="work-type-badge">${eser.tur || 'Öykü'}</span>
                    </div>
                    <div class="work-summary">${eser.ozet}</div>`;

                // Yeni alanlar: Aile teması, karakter ilişkileri, değerler
                if (eser.aileTemasi) {
                    html += `<div class="theme-box">
                        <i class="fas fa-home"></i> <strong>Aile Teması:</strong> ${eser.aileTemasi}
                    </div>`;
                }
                if (eser.karakterIliskileri) {
                    html += `<div class="theme-box">
                        <i class="fas fa-users"></i> <strong>Karakter İlişkileri:</strong> ${eser.karakterIliskileri}
                    </div>`;
                }
                if (eser.degerler) {
                    html += `<div class="theme-box">
                        <i class="fas fa-heart"></i> <strong>Öne Çıkan Değerler:</strong> ${eser.degerler}
                    </div>`;
                }

                // Yazar biyografisi (varsa)
                if (eser.yazarBio) {
                    html += `<div class="author-bio">
                        <div class="author-bio-header" onclick="this.nextElementSibling.classList.toggle('show'); this.querySelector('i').classList.toggle('fa-chevron-down'); this.querySelector('i').classList.toggle('fa-chevron-up');">
                            <i class="fas fa-chevron-down"></i> Yazar Biyografisi
                        </div>
                        <div class="author-bio-text">${eser.yazarBio}</div>
                    </div>`;
                }

                html += `</div>`; // work-card kapanışı
            });
        }

        panelContent.innerHTML = html;
        if (window.innerWidth <= 768) infoPanel.classList.remove('panel-hidden');
    }

    // ---------- VERİ YÜKLEME VE MARKER ----------
    let cityDataList = [];
    let markersLayer = L.layerGroup().addTo(map);

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

    async function loadRealData() {
        try {
            const response = await fetch('data/edebiyat.json?v=' + Math.random());
            const data = await response.json();
            cityDataList = data;
            addCityMarkers(cityDataList);
            console.log('📚 Gerçek veriler yüklendi: ' + data.length + ' şehir.');
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            panelContent.innerHTML = `<div style="text-align:center; padding:40px;"><i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#d4a373;"></i><h3>Veri Yüklenemedi</h3><p>Lütfen data/edebiyat.json dosyasını kontrol edin.</p></div>`;
        }
    }

    window.addEventListener('load', loadRealData);
})();
