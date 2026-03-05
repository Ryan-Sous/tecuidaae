// ============================================
// TECUIDAÊ - MAPA INTERATIVO DE UBSs
// RF03, RF04, RF06
// ============================================

// Dados das UBSs de Manaus (RF04)
const ubsData = [
    {
        id: 1,
        name: "UBS Dr. Luiz Montenegro",
        address: "Rua Pico das Águas, s/n - Lago Azul",
        cep: "69018-000",
        phone: "(92) 3182-4567",
        region: "norte",
        hours: "07:00 - 17:00 (Seg-Sex)",
        saturday: true,
        services: ["Teste rápido", "Tratamento", "Pré-natal"],
        penicillin: true,
        lat: -3.0422,
        lng: -60.0214,
        status: "open",
        rating: 4.5
    },
    {
        id: 2,
        name: "UBS Carmen Nicolau",
        address: "Rua Santa Tereza Davila, s/n - Lago Azul",
        cep: "69018-500",
        phone: "(92) 3182-8901",
        region: "norte",
        hours: "07:00 - 17:00 (Seg-Sex)",
        saturday: false,
        services: ["Teste rápido", "Acompanhamento"],
        penicillin: true,
        lat: -3.0450,
        lng: -60.0250,
        status: "open",
        rating: 4.2
    },
    {
        id: 3,
        name: "UBS Coroado",
        address: "Av. Cosme Ferreira, 1234 - Coroado",
        cep: "69080-000",
        phone: "(92) 3182-2345",
        region: "leste",
        hours: "07:00 - 17:00 (Seg-Sex)",
        saturday: true,
        services: ["Teste rápido", "Tratamento", "Pré-natal"],
        penicillin: false,
        lat: -3.0892,
        lng: -59.9789,
        status: "open",
        urgent: true,
        rating: 3.8
    },
    {
        id: 4,
        name: "UBS Compensa",
        address: "Rua da Compensa, 567 - Compensa",
        cep: "69030-000",
        phone: "(92) 3182-6789",
        region: "oeste",
        hours: "07:00 - 17:00 (Seg-Sex)",
        saturday: false,
        services: ["Teste rápido", "Tratamento"],
        penicillin: true,
        lat: -3.0078,
        lng: -60.0598,
        status: "closed",
        rating: 4.0
    },
    {
        id: 5,
        name: "UBS Centro",
        address: "Rua Barroso, 100 - Centro",
        cep: "69010-000",
        phone: "(92) 3182-1111",
        region: "centro",
        hours: "24 horas",
        saturday: true,
        services: ["Teste rápido", "Tratamento", "Pré-natal", "Emergência"],
        penicillin: true,
        lat: -3.1317,
        lng: -60.0233,
        status: "open",
        rating: 4.7
    },
    {
        id: 6,
        name: "UBS Adrianópolis",
        address: "Av. Umberto Calderaro, 789 - Adrianópolis",
        cep: "69057-000",
        phone: "(92) 3182-9999",
        region: "sul",
        hours: "07:00 - 17:00 (Seg-Sex)",
        saturday: true,
        services: ["Teste rápido", "Tratamento"],
        penicillin: true,
        lat: -3.0967,
        lng: -60.0089,
        status: "open",
        rating: 4.3
    }
];

let map;
let markers = [];
let currentRegion = 'all';
let userLocation = null;

function initMap() {
    // Centro de Manaus
    map = L.map('map').setView([-3.0446, -60.0286], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    renderUBSs();
}

function renderUBSs() {
    // Limpar marcadores existentes
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    const listContainer = document.getElementById('ubsList');
    listContainer.innerHTML = '';

    // Filtrar por região
    let filtered = currentRegion === 'all' 
        ? ubsData 
        : ubsData.filter(u => u.region === currentRegion);

    // Ordenar por proximidade se tiver localização do usuário (RF06)
    if (userLocation) {
        filtered = filtered.sort((a, b) => {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
            return distA - distB;
        });
    }

    filtered.forEach(ubs => {
        // Adicionar marcador ao mapa
        const color = ubs.urgent ? '#FF6B6B' : '#0D7377';
        const marker = L.circleMarker([ubs.lat, ubs.lng], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);

        const distance = userLocation 
            ? calculateDistance(userLocation.lat, userLocation.lng, ubs.lat, ubs.lng).toFixed(1)
            : (Math.random() * 5 + 0.5).toFixed(1);

        const popupContent = `
            <div style="font-family: 'Segoe UI', sans-serif; min-width: 280px;">
                <h3 style="color: #0D7377; margin-bottom: 0.5rem; font-size: 1.1rem;">${ubs.name}</h3>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    ${Array(5).fill(0).map((_, i) => 
                        `<span style="color: ${i < Math.floor(ubs.rating) ? '#FFD700' : '#ddd'};">★</span>`
                    ).join('')}
                    <span style="font-size: 0.85rem; color: #666;">(${ubs.rating})</span>
                </div>
                <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>📍</strong> ${ubs.address}</p>
                <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>📞</strong> <a href="tel:${ubs.phone}" style="color: #0D7377;">${ubs.phone}</a></p>
                <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>🕐</strong> ${ubs.hours}</p>
                ${ubs.saturday ? '<p style="margin: 0.3rem 0; font-size: 0.9rem; color: #4CAF50;"><strong>✓</strong> Abre aos sábados</p>' : ''}
                <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>Serviços:</strong> ${ubs.services.join(', ')}</p>
                <p style="margin: 0.5rem 0; padding: 0.5rem; background: ${ubs.penicillin ? '#e8f5e9' : '#ffebee'}; border-radius: 4px; font-size: 0.85rem; border-left: 3px solid ${ubs.penicillin ? '#4CAF50' : '#f44336'};">
                    ${ubs.penicillin ? '✅ Penicilina disponível' : '⚠️ Estoque de penicilina crítico - Ligar antes'}
                </p>
                <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${ubs.lat},${ubs.lng}" 
                       target="_blank" 
                       style="flex: 1; text-align: center; background: #0D7377; color: white; padding: 0.5rem; border-radius: 4px; text-decoration: none; font-size: 0.85rem;">
                        🚗 Como chegar
                    </a>
                    <a href="tel:${ubs.phone}" 
                       style="flex: 1; text-align: center; background: #e0f2f1; color: #0D7377; padding: 0.5rem; border-radius: 4px; text-decoration: none; font-size: 0.85rem;">
                        📞 Ligar
                    </a>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);

        // Adicionar card à sidebar
        const card = document.createElement('div');
        card.className = 'ubs-card';
        card.innerHTML = `
            <div class="ubs-header">
                <div class="ubs-name">${ubs.name}</div>
                <div class="ubs-distance">${distance} km</div>
            </div>
            <div class="ubs-info">
                📍 ${ubs.address}<br>
                📞 ${ubs.phone}<br>
                🕐 ${ubs.hours}
            </div>
            <div class="ubs-tags">
                ${ubs.services.map(s => `<span class="tag">${s}</span>`).join('')}
                ${ubs.urgent ? '<span class="tag urgent">⚠️ Estoque crítico</span>' : ''}
                ${ubs.saturday ? '<span class="tag">Sábado</span>' : ''}
            </div>
            <div class="status-indicator">
                <span class="status-dot ${ubs.status}"></span>
                <span>${ubs.status === 'open' ? 'Aberto agora' : 'Fechado'}</span>
            </div>
        `;
        
        card.onclick = () => {
            map.setView([ubs.lat, ubs.lng], 16);
            marker.openPopup();
            document.querySelectorAll('.ubs-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Fechar sidebar no mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        };
        
        listContainer.appendChild(card);
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function filterRegion(region) {
    currentRegion = region;
    
    // Atualizar botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(region) || 
            (region === 'all' && btn.textContent === 'Todas')) {
            btn.classList.add('active');
        }
    });
    
    renderUBSs();
}

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = { lat: latitude, lng: longitude };
                
                map.setView([latitude, longitude], 15);
                
                // Adicionar marcador do usuário
                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup('📍 Você está aqui')
                    .openPopup();
                
                // Re-renderizar com ordenação por proximidade
                renderUBSs();
            },
            (error) => {
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            }
        );
    } else {
        alert('Geolocalização não suportada pelo navegador.');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Busca
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.ubs-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
});

// Inicializar
window.onload = initMap;
