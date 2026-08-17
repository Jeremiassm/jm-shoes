const REVIEW_KEYS = ["traction", "cushion", "materials", "durability", "fit"];

export default function ReviewSection({ review, onChange, errors = {} }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
        Review (1-10)
      </h2>
      <p className="text-zinc-500 text-sm">Podes usar decimales: 8.5, 9.5, etc.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {REVIEW_KEYS.map((key) => (
          <div key={key}>
            <label
              htmlFor={`review-${key}`}
              className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold"
            >
              {key}
            </label>
            <input
              id={`review-${key}`}
              type="number"
              name={`review_${key}`}
              value={review[key]}
              onChange={onChange}
              min="1"
              max="10"
              step="0.1"
              required
              aria-invalid={Boolean(errors[key])}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
