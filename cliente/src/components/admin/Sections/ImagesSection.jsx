import { Plus, X, Loader } from "lucide-react";

export default function ImagesSection({
  images,
  uploadingImages,
  draggedIndex,
  imageInputRef,
  onPickImages,
  onUpload,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
        Imagenes (WebP recomendado)
      </h2>
      <p className="text-zinc-500 text-sm">
        Formatos recomendados: WebP (menor tamano) o JPEG. Arrastra las imagenes para reordenarlas.
      </p>

      <div className="flex flex-wrap gap-4">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className={`relative w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden cursor-move transition-all ${
              draggedIndex === index ? "opacity-50 scale-95" : "opacity-100"
            } ${draggedIndex !== null && draggedIndex !== index ? "hover:border-2 hover:border-red-500" : ""}`}
            aria-label={`Reordenar imagen ${index + 1}`}
          >
            <img
              src={img}
              alt={`Vista previa ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-700"
              aria-label={`Eliminar imagen ${index + 1}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs text-center py-1">
                Principal
              </div>
            )}
          </div>
        ))}

        {uploadingImages ? (
          <div
            className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center"
            aria-label="Subiendo imagenes"
          >
            <Loader className="animate-spin text-zinc-400" size={24} aria-hidden="true" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onPickImages}
            className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center hover:border-red-500 transition"
            aria-label="Agregar imagenes"
          >
            <Plus size={24} className="text-zinc-400" aria-hidden="true" />
            <span className="text-xs text-zinc-400 mt-1">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={imageInputRef}
        id="product-images"
        type="file"
        accept="image/webp,image/jpeg,image/png"
        multiple
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );
}
