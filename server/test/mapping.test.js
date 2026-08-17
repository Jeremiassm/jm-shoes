const test = require("node:test");
const assert = require("node:assert/strict");
const { mapSneakerRow, reviewAvg } = require("../lib/mapping");

test("mapSneakerRow returns null for null row", () => {
  assert.equal(mapSneakerRow(null), null);
  assert.equal(mapSneakerRow(undefined), null);
});

test("mapSneakerRow maps a full row to API shape", () => {
  const row = {
    id: 1,
    name: "Air Jordan 1",
    brand_name: "Nike",
    brand_id: 2,
    price: "199.99",
    description: "Classic sneaker",
    images: ["/uploads/a.webp"],
    video: "/uploads/v.mp4",
    sizes: [40, 41, 42],
    review: { traction: 8, cushion: 7, materials: 9, durability: 8, fit: 7 },
    pros: ["comfortable"],
    cons: ["expensive"],
    slug: "air-jordan-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  };

  const mapped = mapSneakerRow(row);

  assert.equal(mapped.id, 1);
  assert.equal(mapped.name, "Air Jordan 1");
  assert.equal(mapped.brand, "Nike");
  assert.equal(mapped.brandId, 2);
  assert.equal(mapped.price, 199.99);
  assert.equal(mapped.description, "Classic sneaker");
  assert.deepEqual(mapped.images, ["/uploads/a.webp"]);
  assert.equal(mapped.video, "/uploads/v.mp4");
  assert.deepEqual(mapped.sizes, [40, 41, 42]);
  assert.deepEqual(mapped.review, row.review);
  assert.equal(mapped.pros.length, 1);
  assert.equal(mapped.cons.length, 1);
  assert.equal(mapped.slug, "air-jordan-1");
  assert.equal(mapped.createdAt, row.created_at);
  assert.equal(mapped.updatedAt, row.updated_at);
});

test("mapSneakerRow falls back to brand when brand_name is missing", () => {
  const mapped = mapSneakerRow({ id: 1, name: "X", brand: "Adidas", price: 10 });
  assert.equal(mapped.brand, "Adidas");
  assert.equal(mapped.brandId, null);
});

test("mapSneakerRow returns null price when price is null", () => {
  const mapped = mapSneakerRow({ id: 1, name: "X", price: null });
  assert.equal(mapped.price, null);
});

test("mapSneakerRow coerces non-array fields to safe defaults", () => {
  const mapped = mapSneakerRow({ id: 1, name: "X", price: 10 });
  assert.deepEqual(mapped.images, []);
  assert.deepEqual(mapped.sizes, []);
  assert.deepEqual(mapped.pros, []);
  assert.deepEqual(mapped.cons, []);
  assert.deepEqual(mapped.review, {});
});

test("reviewAvg averages numeric values and rounds to 1 decimal", () => {
  const avg = reviewAvg({ traction: 8, cushion: 7, materials: 9, durability: 8, fit: 7 });
  assert.equal(avg, 7.8);
});

test("reviewAvg returns null for empty review object", () => {
  assert.equal(reviewAvg({}), null);
});

test("reviewAvg ignores non-numeric values", () => {
  const avg = reviewAvg({ traction: 10, cushion: "bad", materials: null, durability: undefined, fit: NaN });
  assert.equal(avg, 10);
});

test("reviewAvg returns null for null or non-object", () => {
  assert.equal(reviewAvg(null), null);
  assert.equal(reviewAvg(undefined), null);
  assert.equal(reviewAvg("x"), null);
  assert.equal(reviewAvg(5), null);
});

test("mapSneakerRow uses cached review_avg when present", () => {
  const row = {
    id: 1,
    name: "X",
    price: 10,
    review: { traction: 0, cushion: 0, materials: 0, durability: 0, fit: 0 },
    review_avg: "4.5",
  };
  const mapped = mapSneakerRow(row);
  assert.equal(mapped.reviewAvg, 4.5);
});

test("mapSneakerRow caches review_avg over computed when both exist", () => {
  const row = {
    id: 1,
    name: "X",
    price: 10,
    review: { traction: 10, cushion: 10, materials: 10, durability: 10, fit: 10 },
    review_avg: "9.9",
  };
  const mapped = mapSneakerRow(row);
  assert.equal(mapped.reviewAvg, 9.9);
});
