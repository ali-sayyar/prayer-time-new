const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let HijriYear = HijriJS.today().year;

async function getPrayerTimes(lat, lon) {
  lat = lat.toFixed(5);
  lon = lon.toFixed(5);
  try {
    // تأكد من أن الرابط صحيح
    const response = await fetch(
      `https://api.aladhan.com/v1/hijriCalendarByAddress/${HijriYear}?address=${lat},${lon}?x7xapikey=a40781aef9e97ae7af3e549fb6a4e5ed&method=4&timezonestring=${timeZone}`
    );
    const data = await response.json();
    console.log(data);
    console.log(
      `https://api.aladhan.com/v1/hijriCalendarByAddress/${HijriYear}?address=${lat},${lon}?x7xapikey=a40781aef9e97ae7af3e549fb6a4e5ed&method=4&timezonestring=${timeZone}`
    );
    return data.data;
  } catch (error) {
    throw new Error("Failed to fetch prayer times: " + error.message);
  }
}

// عرض مواقيت الصلاة
function displayPrayerTimes(timings, cityName) {
  console.log("display Payer Time");
  const prayers = [
    { name: "الفجر", key: "Fajr", element: "fajrTime" },
    { name: "الشروق", key: "Sunrise", element: "sunriseTime" },
    { name: "الظهر", key: "Dhuhr", element: "dhuhrTime" },
    { name: "العصر", key: "Asr", element: "asrTime" },
    { name: "المغرب", key: "Maghrib", element: "maghribTime" },
    { name: "العشاء", key: "Isha", element: "ishaTime" },
  ];
  prayers.forEach((prayer) => {
    const time = timings[prayer.key].split(" ")[0];
    document.getElementById(prayer.element).textContent = formatTime(time);
  });
  document.getElementById("cityName").textContent = cityName;
}

// تنسيق الوقت
function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "م" : "ص";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}
