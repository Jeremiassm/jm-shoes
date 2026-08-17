const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const filtersUrl = pathToFileURL(
  path.resolve(__dirname, "../../cliente/src/lib/filters.js")
).href;

const filtersPromise = import(filtersUrl);

test("hasActiveFilters returns false for empty filters", async () => {
  const { hasActiveFilters } = await filtersPromise;
  assert.equal(hasActiveFilters({}), false);
});

test("hasActiveFilters returns true when search is set", async () => {
  const { hasActiveFilters } = await filtersPromise;
  assert.equal(hasActiveFilters({ search: "nike" }), true);
});

test("hasActiveFilters returns true when any of the filter keys is set", async () => {
  const { hasActiveFilters } = await filtersPromise;
  assert.equal(hasActiveFilters({ brand: "adidas" }), true);
  assert.equal(hasActiveFilters({ minPrice: 10 }), true);
  assert.equal(hasActiveFilters({ maxPrice: 100 }), true);
  assert.equal(hasActiveFilters({ minRating: 4 }), true);
});

test("cleanFilters strips empty strings and nullish values", async () => {
  const { cleanFilters } = await filtersPromise;
  const out = cleanFilters({ search: "nike", brand: "" });
  assert.deepEqual(out, { search: "nike" });
});

test("cleanFilters returns empty object when all values are empty", async () => {
  const { cleanFilters } = await filtersPromise;
  assert.deepEqual(cleanFilters({ search: "", brand: "", minPrice: "" }), {});
});

test("filtersToParams strips empty strings and nullish values", async () => {
  const { filtersToParams } = await filtersPromise;
  const out = filtersToParams({ search: "nike", brand: "" });
  assert.deepEqual(out, { search: "nike" });
});

test("filtersToParams keeps non-empty values", async () => {
  const { filtersToParams } = await filtersPromise;
  const out = filtersToParams({
    search: "nike",
    brand: "Nike",
    minPrice: 10,
    maxPrice: 100,
    minRating: 4,
    sortBy: "price",
    order: "asc",
  });
  assert.deepEqual(out, {
    search: "nike",
    brand: "Nike",
    minPrice: 10,
    maxPrice: 100,
    minRating: 4,
    sortBy: "price",
    order: "asc",
  });
});

test("readFiltersFromParams returns defaults for empty params", async () => {
  const { readFiltersFromParams, DEFAULT_FILTERS } = await filtersPromise;
  const out = readFiltersFromParams(new URLSearchParams(""));
  assert.equal(out.search, "");
  assert.equal(out.brand, "");
  assert.equal(out.minPrice, "");
  assert.equal(out.maxPrice, "");
  assert.equal(out.minRating, "");
  assert.equal(out.sortBy, DEFAULT_FILTERS.sortBy);
  assert.equal(out.order, DEFAULT_FILTERS.order);
});

test("readFiltersFromParams reads values from URLSearchParams", async () => {
  const { readFiltersFromParams } = await filtersPromise;
  const params = new URLSearchParams(
    "search=nike&brand=adidas&sortBy=price&order=asc"
  );
  const out = readFiltersFromParams(params);
  assert.equal(out.search, "nike");
  assert.equal(out.brand, "adidas");
  assert.equal(out.sortBy, "price");
  assert.equal(out.order, "asc");
});

test("debounce does not call fn immediately", async () => {
  const { debounce } = await filtersPromise;
  let called = 0;
  const fn = () => called++;
  const d = debounce(fn, 100);
  d();
  d();
  d();
  assert.equal(called, 0);
  await new Promise((r) => setTimeout(r, 150));
  assert.equal(called, 1);
});

test("debounce only fires once for rapid calls within delay", async () => {
  const { debounce } = await filtersPromise;
  let called = 0;
  const fn = () => called++;
  const d = debounce(fn, 80);
  d("a");
  await new Promise((r) => setTimeout(r, 30));
  d("b");
  await new Promise((r) => setTimeout(r, 30));
  d("c");
  await new Promise((r) => setTimeout(r, 120));
  assert.equal(called, 1);
});

test("debounce passes the latest args to fn", async () => {
  const { debounce } = await filtersPromise;
  let received = null;
  const fn = (x) => {
    received = x;
  };
  const d = debounce(fn, 60);
  d("first");
  await new Promise((r) => setTimeout(r, 10));
  d("second");
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(received, "second");
});
