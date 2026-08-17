export type ImportSource = {
  name: string;
  url?: string;
};

export type RawJobListing = {
  externalId?: string;
  url?: string;
  text: string;
};

export type ImportRequest = {
  source: ImportSource;
  listings: RawJobListing[];
};

function optionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function parseImportRequest(value: unknown): ImportRequest {
  if (!value || typeof value !== "object")
    throw new Error("Import ma’lumoti noto‘g‘ri");
  const data = value as Record<string, unknown>;
  const sourceValue = data.source;
  if (!sourceValue || typeof sourceValue !== "object")
    throw new Error("Manba ma’lumoti kerak");
  const sourceData = sourceValue as Record<string, unknown>;
  const sourceName =
    typeof sourceData.name === "string"
      ? sourceData.name.trim().slice(0, 120)
      : "";
  if (!sourceName) throw new Error("Manba nomi kerak");
  if (!Array.isArray(data.listings) || !data.listings.length)
    throw new Error("Kamida bitta e’lon kerak");
  if (data.listings.length > 30)
    throw new Error("Bir so‘rovda 30 tadan ko‘p e’lon yuborib bo‘lmaydi");

  const listings = data.listings.map((listing) => {
    if (!listing || typeof listing !== "object")
      throw new Error("E’lon ma’lumoti noto‘g‘ri");
    const item = listing as Record<string, unknown>;
    const text =
      typeof item.text === "string" ? item.text.trim().slice(0, 8_000) : "";
    if (!text) throw new Error("E’lon matni kerak");
    return {
      externalId:
        typeof item.externalId === "string" && item.externalId.trim()
          ? item.externalId.trim().slice(0, 200)
          : undefined,
      url: optionalUrl(item.url),
      text,
    };
  });

  return {
    source: { name: sourceName, url: optionalUrl(sourceData.url) },
    listings,
  };
}
