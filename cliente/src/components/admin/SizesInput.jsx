import { useRef } from "react";
import { X } from "lucide-react";

export default function SizesInput({ id = "sizes-input", value, onChange }) {
  const inputRef = useRef(null);

  const addSize = (raw) => {
    const cleaned = raw.trim().replace(",", ".");
    if (cleaned === "") return;
    const num = parseFloat(cleaned);
    if (Number.isNaN(num) || num <= 0 || num >= 20) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (value.includes(num)) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange([...value, num].sort((a, b) => a - b));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSize(e.currentTarget.value);
    } else if (e.key === "Backspace" && e.currentTarget.value === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = (e) => {
    if (e.target.value) addSize(e.target.value);
  };

  const removeSize = (size) => {
    onChange(value.filter((s) => s !== size));
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((size) => (
            <span
              key={size}
              className="bg-zinc-800 border border-white/10 rounded-full pl-4 pr-1 py-1 text-sm font-medium flex items-center gap-2"
            >
              {size} US
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="w-5 h-5 rounded-full bg-zinc-700 hover:bg-red-600 flex items-center justify-center transition"
                aria-label={`Quitar talle ${size}`}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Escribi un talle y presiona Enter (ej: 9 o 9.5)"
        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
      />
      <p className="text-xs text-zinc-500 mt-2">
        Presiona Enter o coma para agregar. Backspace para borrar el ultimo.
      </p>
    </div>
  );
}
