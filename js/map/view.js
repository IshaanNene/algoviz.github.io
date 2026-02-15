/* ============================================
   MAP PATHFINDING VIEW
   Leaflet + OpenStreetMap + OSRM routing
   ============================================ */
const MapView = {
    map: null, startMarker: null, endMarker: null,
    routeLine: null, clickCount: 0,
    currentProfile: 'driving',

    mount(container) {
        container.innerHTML = `
      <div class="map-view">
        <div class="page-header">
          <h2 class="page-title">Map <span class="title-accent">Pathfinding</span></h2>
          <div class="toolbar-group">
            <select id="map-profile" class="brutal-select">
              <option value="driving" selected>🚗 Driving</option>
              <option value="walking">🚶 Walking</option>
              <option value="cycling">🚴 Cycling</option>
            </select>
          </div>
        </div>
        <div class="toolbar">
          <button id="map-clear" class="brutal-btn danger small">Clear Route</button>
          <div class="toolbar-separator"></div>
          <span class="brutal-label" style="margin:0">Click the map to place Start → End</span>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group" id="map-stats" style="display:none">
            <span class="stat-badge">Distance: <span class="stat-value" id="map-dist">—</span></span>
            <span class="stat-badge">Duration: <span class="stat-value" id="map-dur">—</span></span>
          </div>
        </div>
        <div class="map-container" id="map-container"></div>
      </div>`;

        this._initMap();
        this._bindEvents();
    },

    _initMap() {
        this.map = L.map('map-container', {
            center: [28.6139, 77.2090], // Default: New Delhi
            zoom: 13,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);

        // Custom icons
        this.startIcon = L.divIcon({
            className: 'map-marker-start',
            html: '<div class="map-pin start-pin">A</div>',
            iconSize: [30, 30], iconAnchor: [15, 30]
        });
        this.endIcon = L.divIcon({
            className: 'map-marker-end',
            html: '<div class="map-pin end-pin">B</div>',
            iconSize: [30, 30], iconAnchor: [15, 30]
        });

        this.map.on('click', (e) => this._handleMapClick(e));

        // Try to center on user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
                },
                () => { } // Ignore errors, keep default
            );
        }
    },

    _bindEvents() {
        const self = this;
        document.getElementById('map-profile').addEventListener('change', function () {
            self.currentProfile = this.value;
            if (self.startMarker && self.endMarker) {
                self._fetchRoute();
            }
        });

        document.getElementById('map-clear').addEventListener('click', () => {
            this._clearRoute();
        });
    },

    _handleMapClick(e) {
        const latlng = e.latlng;

        if (this.clickCount === 0) {
            // Place start
            this._clearRoute();
            this.startMarker = L.marker(latlng, { icon: this.startIcon, draggable: true }).addTo(this.map);
            this.startMarker.on('dragend', () => { if (this.endMarker) this._fetchRoute(); });
            this.clickCount = 1;
        } else if (this.clickCount === 1) {
            // Place end
            this.endMarker = L.marker(latlng, { icon: this.endIcon, draggable: true }).addTo(this.map);
            this.endMarker.on('dragend', () => this._fetchRoute());
            this.clickCount = 2;
            this._fetchRoute();
        } else {
            // Reset and start over
            this._clearRoute();
            this.startMarker = L.marker(latlng, { icon: this.startIcon, draggable: true }).addTo(this.map);
            this.startMarker.on('dragend', () => { if (this.endMarker) this._fetchRoute(); });
            this.clickCount = 1;
        }
    },

    async _fetchRoute() {
        if (!this.startMarker || !this.endMarker) return;

        const s = this.startMarker.getLatLng();
        const e = this.endMarker.getLatLng();
        const profile = this.currentProfile === 'walking' ? 'foot' :
            this.currentProfile === 'cycling' ? 'bike' : 'car';

        const url = `https://router.project-osrm.org/route/v1/${profile}/${s.lng},${s.lat};${e.lng},${e.lat}?overview=full&geometries=geojson&steps=true`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                this._showStats('No route', '—');
                return;
            }

            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

            // Remove old line
            if (this.routeLine) this.map.removeLayer(this.routeLine);

            // Animate route drawing
            this.routeLine = L.polyline([], {
                color: '#845EC2', weight: 5, opacity: 0.85,
                lineCap: 'round', lineJoin: 'round'
            }).addTo(this.map);

            this._animateRoute(coords);
            this.map.fitBounds(L.latLngBounds(coords).pad(0.1));

            // Stats
            const distKm = (route.distance / 1000).toFixed(1);
            const durMin = Math.ceil(route.duration / 60);
            this._showStats(distKm + ' km', durMin + ' min');

        } catch (err) {
            this._showStats('Error', '—');
        }
    },

    _animateRoute(coords) {
        let i = 0;
        const batchSize = Math.max(1, Math.floor(coords.length / 60));
        const tick = () => {
            const end = Math.min(i + batchSize, coords.length);
            for (; i < end; i++) {
                this.routeLine.addLatLng(coords[i]);
            }
            if (i < coords.length) {
                requestAnimationFrame(tick);
            }
        };
        tick();
    },

    _showStats(dist, dur) {
        const statsEl = document.getElementById('map-stats');
        if (statsEl) {
            statsEl.style.display = 'flex';
            document.getElementById('map-dist').textContent = dist;
            document.getElementById('map-dur').textContent = dur;
        }
    },

    _clearRoute() {
        if (this.startMarker) { this.map.removeLayer(this.startMarker); this.startMarker = null; }
        if (this.endMarker) { this.map.removeLayer(this.endMarker); this.endMarker = null; }
        if (this.routeLine) { this.map.removeLayer(this.routeLine); this.routeLine = null; }
        this.clickCount = 0;
        const statsEl = document.getElementById('map-stats');
        if (statsEl) statsEl.style.display = 'none';
    },

    unmount() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.startMarker = null; this.endMarker = null;
        this.routeLine = null; this.clickCount = 0;
    }
};
window.MapView = MapView;
