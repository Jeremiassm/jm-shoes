export const DEFAULT_FILTERS = Object.freeze({
  search: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sortBy: "created_at",
  order: "desc",
});

export const SORT_OPTIONS = [
  { value: "created_at", label: "Mas recientes" },
  { value: "price", label: "Precio" },
  { value: "name", label: "Nombre" },
  { value: "rating", label: "Puntuacion" },
];

export function readFiltersFromParams(searchParams) {
  return {
    search: searchParams.get("search") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    sortBy: searchParams.get("sortBy") || DEFAULT_FILTERS.sortBy,
    order: searchParams.get("order") || DEFAULT_FILTERS.order,
  };
}

export function filtersToParams(filters) {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  }
  return params;
}

export function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
}

export function hasActiveFilters(filters) {
  return Boolean(
    filters.search || filters.brand || filters.minPrice || filters.maxPrice || filters.minRating
  );
}

export function debounce(fn, delay = 300) {
  let timer;
  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}
