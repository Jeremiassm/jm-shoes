function reviewAvg(review) {
  if (!review || typeof review !== "object") return null;
  const values = Object.values(review).filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function toRelativeUploadsUrl(url) {
  if (typeof url !== "string") return url;
  const idx = url.indexOf("/uploads/");
  if (idx > 0) return url.slice(idx);
  return url;
}

function mapSneakerRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    brand: row.brand_name || row.brand || null,
    brandId: row.brand_id || null,
    price: row.price != null ? parseFloat(row.price) : null,
    description: row.description,
    images: Array.isArray(row.images) ? row.images.map(toRelativeUploadsUrl) : [],
    video: toRelativeUploadsUrl(row.video),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    review: row.review || {},
    reviewAvg: row.review_avg != null ? parseFloat(row.review_avg) : reviewAvg(row.review),
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { mapSneakerRow, reviewAvg };
