import SizesInput from "../SizesInput";

export default function GeneralSection({ form, setForm, handleChange, errors = {} }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
        Informacion General
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="product-name"
            className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
          >
            Nombre
          </label>
          <input
            id="product-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            aria-invalid={Boolean(errors.name)}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
            placeholder="GT Cut 4"
          />
        </div>

        <div>
          <label
            htmlFor="product-brand"
            className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
          >
            Marca
          </label>
          <input
            id="product-brand"
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            required
            aria-invalid={Boolean(errors.brand)}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
            placeholder="Nike"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="product-price"
            className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
          >
            Precio (ARS)
          </label>
          <input
            id="product-price"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            aria-invalid={Boolean(errors.price)}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
            placeholder="260000"
          />
        </div>

        <div>
          <label
            htmlFor="product-sizes"
            className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
          >
            Talles
          </label>
          <SizesInput
            id="product-sizes"
            value={form.sizes}
            onChange={(sizes) => setForm((prev) => ({ ...prev, sizes }))}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="product-description"
          className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
        >
          Descripcion
        </label>
        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          aria-invalid={Boolean(errors.description)}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition resize-none"
          placeholder="Descripcion del producto..."
        />
      </div>
    </div>
  );
}
