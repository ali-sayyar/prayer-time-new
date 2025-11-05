const changeLocation = document.getElementById("changeLocation");
const mapContainer = document.querySelector(".map-container");
const faDate = document.getElementById("faDate");
const hijriDate = document.getElementById("hijriDate");
const gregorianDate = document.getElementById("gregorianDate");

// تحديث الوقت الحالي
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("currentTime").textContent = timeString;

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  gregorianDate.innerHTML = now.toLocaleDateString("ar-EG", options);
  faDate.innerHTML = now.toLocaleDateString("fa-IR", options);
  hijriDate.innerHTML = now.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function closeMenu() {
  document.getElementById("sideMenu").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

// تحديث الوقت فور التحميل وبعد ذلك كل دقيقة
updateCurrentTime();
setInterval(updateCurrentTime, 60000);

// فتح وإغلاق القائمة الجانبية
document.getElementById("menuToggle").addEventListener("click", function () {
  document.getElementById("sideMenu").classList.add("active");
  document.getElementById("overlay").classList.add("active");
});

document.getElementById("closeMenu").addEventListener("click", function () {
  closeMenu();
});

document.getElementById("overlay").addEventListener("click", function () {
  closeMenu();
});

// تغيير الألوان
document.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", function () {
    document.querySelectorAll(".color-option").forEach((opt) => {
      opt.classList.remove("active");
    });
    this.classList.add("active");

    // في تطبيق حقيقي، هنا سيتم تغيير سمة الألوان
  });
});

changeLocation.addEventListener("click", () => {
  closeMenu();
  mapContainer.classList.add("active");
});
document.querySelector(".head-location-info").addEventListener("click", () => {
  mapContainer.classList.add("active");
});

document.getElementById("closeMapBtn").addEventListener("click", () => {
  mapContainer.classList.remove("active");
});
