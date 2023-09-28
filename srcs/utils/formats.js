export default function formatDateToJson(timestamp) {
  const dateObj = new Date(timestamp);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  const minutesFormat = minutes < 10 ? `0${minutes}` : `${minutes}`;

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutesFormat}`;

  return formattedDate;
}
