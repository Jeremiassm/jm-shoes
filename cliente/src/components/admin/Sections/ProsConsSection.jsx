export default function ProsConsSection({ pros, cons, onChange, errors = {} }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
        Pros y Contras
      </h2>

      <div>
        <label
          htmlFor="product-pros"
          className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
        >
          Pros (separados por coma)
        </label>
        <input
          id="product-pros"
          type="text"
          name="pros"
          value={pros}
          onChange={onChange}
          aria-invalid={Boolean(errors.pros)}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
          placeholder="Excelente amortiguacion, Muy estable"
        />
      </div>

      <div>
        <label
          htmlFor="product-cons"
          className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
        >
          Contras (separados por coma)
        </label>
        <input
          id="product-cons"
          type="text"
          name="cons"
          value={cons}
          onChange={onChange}
          aria-invalid={Boolean(errors.cons)}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
          placeholder="Mas pesada que otras opciones"
        />
      </div>
    </div>
  );
}
