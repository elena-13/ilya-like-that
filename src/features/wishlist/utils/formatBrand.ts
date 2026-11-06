// Shows brand names in a consistent "Asobu" / "Little Dutch" style,
// whatever casing they were typed in ("LITTLE DUTCH", "asobu", …).
export function formatBrand(brand: string) {
  return brand
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s\-&/])(\p{L})/gu,
      (_, sep: string, letter: string) => sep + letter.toUpperCase(),
    );
}
