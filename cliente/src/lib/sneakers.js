export function getReviewAverage(sneaker) {
  if (!sneaker) return 0;
  if (typeof sneaker.reviewAvg === "number" && Number.isFinite(sneaker.reviewAvg)) {
    return sneaker.reviewAvg;
  }
  const review = sneaker.review;
  if (!review || typeof review !== "object") return 0;
  const values = Object.values(review).filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function getSizeList(sneaker) {
  if (!sneaker || !Array.isArray(sneaker.sizes)) return [];
  if (sneaker.sizes.length === 0) return [];
  if (typeof sneaker.sizes[0] === "object") {
    return sneaker.sizes
      .map((s) => Number(s.size))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
  }
  return sneaker.sizes.filter((n) => Number.isFinite(Number(n))).map(Number);
}

export function isInStock(sneaker) {
  if (!sneaker || !Array.isArray(sneaker.sizes) || sneaker.sizes.length === 0) return true;
  if (typeof sneaker.sizes[0] !== "object") return true;
  return sneaker.sizes.some((s) => Number(s.stock) > 0);
}
