const timeZone = "Asia/Tashkent";

export function formatJobSchedule(startsAt: string, endsAt: string) {
  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });

  return `${dateFormatter.format(new Date(startsAt))} · ${timeFormatter.format(
    new Date(startsAt),
  )}–${timeFormatter.format(new Date(endsAt))}`;
}

export function formatJobDateTime(value: string) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}
