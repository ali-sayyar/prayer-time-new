let lat = 21.422505;
let lng = 39.82619;
let prayerData = [];
let hijriDay = HijriJS.today().day;
let hijriMonth = HijriJS.today().month;

function updateLatLng(vLat, vLng) {
  lat = parseFloat(vLat);
  lng = parseFloat(vLng);
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve([position.coords.latitude, position.coords.longitude]),
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

async function getLocationByIP() {
  try {
    const response = await fetch("https://ipinfo.io/json?token=63aa0d58f61eed");
    const data = await response.json();
    const [lat, lon] = data.loc.split(",").map(Number);
    return [lat, lon];
  } catch (error) {
    throw new Error("Failed to get location by IP: " + error.message);
  }
}

// async function getLocationByIP() {
//   try {
//     const response = await fetch(
//       "https://api.geoapify.com/v1/ipinfo?&apiKey=7f37461c05904e0ba345251c8310f070"
//     );
//     const data = await response.json();
//     return [
//       data.location.latitude.toFixed(5),
//       data.location.longitude.toFixed(5),
//     ];
//   } catch (error) {
//     throw new Error("Failed to get location by IP: " + error.message);
//   }
// }

// دالة موحدة للحصول على الموقع

async function getLocation() {
  document.getElementById("location-name").textContent = "الموقع الحالي";
  try {
    // أولاً نحاول الحصول على الموقع الدقيق
    return await getCurrentLocation();
  } catch (error) {
    console.error("Error getting precise location:", error);
    try {
      return await getLocationByIP();
    } catch (error) {
      document.getElementById("location-name").textContent = "مكة المكرمة";
      return [21.422505, 39.82619];
    }
  }
}

// تهيئة الخريطة
const map = L.map("map").setView([lat, lng], 10); // مركز على الرياض افتراضياً
const map2 = L.map("map2").setView([lat, lng], 10); // مركز على الرياض افتراضياً

// إضافة طبقة الخريطة
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map2);

// إضافة خدمة البحث الجغرافي
const geocoder = L.Control.Geocoder.nominatim();

// إضافة عنصر تحكم البحث إلى الخريطة
L.Control.geocoder({
  defaultMarkGeocode: false,
  position: "topleft",
  placeholder: "ابحث عن موقع...",
  errorMessage: "لم يتم العثور على الموقع",
})
  .on("markgeocode", function (e) {
    const { center, name } = e.geocode;
    updateMapMark(center);
    updateLatLng(center.lat, center.lng);
    console.log(e.geocode);
    document.getElementById("location-name").textContent =
      e.geocode.properties.address.city ||
      e.geocode.properties.address.state ||
      e.geocode.properties.name;
  })
  .addTo(map);

// إضافة علامة قابلة للسحب
let marker = L.marker([lat, lng], { draggable: true }).addTo(map);

// تحديث الإحداثيات عند تحريك العلامة
marker.on("dragend", function (event) {
  const position = marker.getLatLng();
  getLocationName(position.lat, position.lng);
  updateLatLng(position.lat, position.lng);
  console.log(marker);
});

// تحديث الإحداثيات عند النقر على الخريطة
map.on("click", function (event) {
  const { lat, lng } = event.latlng;
  marker.setLatLng([lat, lng]);
  getLocationName(lat, lng);
  updateLatLng(lat, lng);
  console.log(marker);
});

function updateMapMark(center) {
  map.setView(center, 13);
  map2.setView(center, 13);
  marker.setLatLng(center);
}

// دالة للحصول على اسم الموقع باستخدام خدمة عكسية للجغرافيا
function getLocationName(lat, lng) {
  const locationName = document.getElementById("location-name");

  locationName.textContent = "جاري التحميل...";

  // استخدام خدمة Nominatim للحصول على اسم الموقع
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.display_name) {
        let city =
          data.address.city ||
          data.address.town ||
          data.address.state ||
          data.address.country;
        locationName.textContent = `${city}, ${data.name}`;
        console.log(data);
      } else {
        locationName.textContent = "موقع غير معروف";
      }
    })
    .catch((error) => {
      console.error("Error fetching location name:", error);
      locationName.textContent = "خطأ في جلب اسم الموقع";
    });
}

async function saveLocationToStorage(lat, lng) {
  const locationName = document.getElementById("location-name").textContent;
  const savedLocations =
    JSON.parse(localStorage.getItem("savedPrayerLocations")) || [];

  // تجنب التكرار
  const existingIndex = savedLocations.findIndex(
    (loc) => loc.lat === lat.toFixed(5) && loc.lng === lng.toFixed(5)
  );

  let data = {};

  if (existingIndex === -1) {
    console.log("save new item in loc");
    let prayerTimings = await getPrayerTimes(lat, lng);
    data = {
      name: locationName,
      lat: Number(lat).toFixed(5),
      lng: Number(lng).toFixed(5),
      timestamp: new Date().toISOString(),
      prayerTimes: prayerTimings,
    };
    // الاحتفاظ بحد أقصى 10 مواقع
    if (savedLocations.length > 10) {
      savedLocations.pop();
    }
  } else {
    data = savedLocations[existingIndex];
    savedLocations.splice(existingIndex, 1);
    console.log(savedLocations[existingIndex], existingIndex);
  }
  prayerData = data;
  savedLocations.unshift(data);
  localStorage.setItem("savedPrayerLocations", JSON.stringify(savedLocations));
  loadSavedLocations();
  displayPrayerTimes(
    prayerData.prayerTimes[hijriMonth][hijriDay].timings,
    prayerData.name
  );
}

function loadSavedLocations() {
  const savedLocations =
    JSON.parse(localStorage.getItem("savedPrayerLocations")) || [];
  const savedLocationsList = document.getElementById("saved-locations-list");
  savedLocationsList.innerHTML = "";
  if (savedLocations.length === 0) {
    savedLocationsList.innerHTML = "<p>لا توجد مواقع محفوظة</p>";
    return;
  }
  savedLocations.forEach((location, index) => {
    const locationItem = document.createElement("div");
    locationItem.className = "location-item";
    locationItem.innerHTML = `
                      <span>${location.name}</span>
                      <button class="delete-btn" data-index="${index}">×</button>
                  `;
    locationItem.addEventListener("click", function (e) {
      if (!e.target.classList.contains("delete-btn")) {
        console.log(e.target);
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lng);
        updateLatLng(lat, lng);
        map.setView([lat, lng], 13);
        marker.setLatLng([lat, lng]);
        document.getElementById("location-name").textContent = location.name;
      }
    });
    savedLocationsList.appendChild(locationItem);
  });
  // إضافة أحداث لحذف المواقع
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const index = parseInt(this.getAttribute("data-index"));
      deleteSavedLocation(index);
    });
  });
}

function deleteSavedLocation(index) {
  const savedLocations =
    JSON.parse(localStorage.getItem("savedPrayerLocations")) || [];
  savedLocations.splice(index, 1);
  localStorage.setItem("savedPrayerLocations", JSON.stringify(savedLocations));
  loadSavedLocations();
}

// إضافة حدث للنقر على زر الحصول على أوقات الصلاة
document
  .getElementById("get-prayer-times")
  .addEventListener("click", function () {
    saveLocationToStorage(lat, lng);
    map2.setView([lat, lng]);
    mapContainer.classList.remove("active");
  });

// تحميل المواقع المحفوظة عند بدء التشغيل
loadSavedLocations();
async function updateDataAfterGetLocation() {
  [lat, lng] = await getLocation();
  updateMapMark([lat, lng]);
  saveLocationToStorage(lat, lng);
  getLocationName(lat, lng);
  console.log("from updateDataAfterGetLocation:", lat, lng);
}

if (!localStorage.getItem("savedPrayerLocations")) {
  updateDataAfterGetLocation();
  console.log("frist vio ", lat, lng);
} else {
  prayerData = JSON.parse(localStorage.getItem("savedPrayerLocations"))[0];
  console.log(prayerData, lat, lng);
  updateLatLng(prayerData.lat, prayerData.lng);
  updateMapMark([lat, lng]);
  document.getElementById("location-name").textContent = prayerData.name;
  displayPrayerTimes(
    prayerData.prayerTimes[hijriMonth][hijriDay - 1].timings,
    prayerData.name
  );
}
