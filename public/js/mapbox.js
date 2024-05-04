const mapEl = document.getElementById('map');

const locations = JSON.parse(mapEl.dataset.locations);

const map = L.map('map', { scrollWheelZoom: false, zoomControl: false });

const bounds = L.latLngBounds();

const coords = locations.map((loc) => {
  const [lng, lat] = loc.coordinates;
  return [lat, lng];
});

for (let coord of coords) {
  bounds.extend(coord);
}

map.fitBounds(bounds);

L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const myIcon = L.icon({
  iconUrl: '../img/pin.png',
  iconSize: [32, 40],
  iconAnchor: [22, 94],
  popupAnchor: [-6, -88],
});

locations.forEach((loc) => {
  const [lng, lat] = loc.coordinates;

  L.marker([lat, lng], { icon: myIcon })
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'mapboxgl-popup-content',
      }),
    )
    .setPopupContent(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .openPopup();
});
