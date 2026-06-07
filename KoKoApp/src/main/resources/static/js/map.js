// === KOKO MAP ===

let map;

function initMap() {

  const daveyton = { lat: -26.1550, lng: 28.3840 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: daveyton,
  });

  //marker for Daveyton
  new google.maps.Marker({
    position: daveyton,
    map: map,
    title: "Daveyton"
  });

  //PLACES SERVICE (THIS SHOWS REAL BUSINESSES)
  const service = new google.maps.places.PlacesService(map);

  const allowedTypes = [
    "store",
    "supermarket",
    "shopping_mall",
    "restaurant",
    "cafe"
  ];

  allowedTypes.forEach(type => {

    service.nearbySearch(
      {
        location: location,
        radius: 200,
        type: type
      },
      (results, status) => {

        if (status === google.maps.places.PlacesServiceStatus.OK) {

          results.forEach(place => {

            // 🧠 extra safety filter (removes random junk)
            if (!place.geometry || !place.name) return;

            new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name
            });

          });

        }
      }
    );

  });

    // Pin design
  const marker = new google.maps.Marker({
  position: place.geometry.location,
  map: map,
  title: place.name
});

const info = new google.maps.InfoWindow({
  content: `<strong>${place.name}</strong>`
});

marker.addListener("click", () => {
  info.open(map, marker);
});
}




window.onload = initMap;
