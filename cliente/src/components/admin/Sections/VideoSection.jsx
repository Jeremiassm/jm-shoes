import { Video, X, Loader } from "lucide-react";

export default function VideoSection({
  video,
  uploadingVideo,
  videoInputRef,
  onPickVideo,
  onUpload,
  onRemove,
}) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
        Video (opcional)
      </h2>
      <p className="text-zinc-500 text-sm">Formatos recomendados: MP4 o WebM.</p>

      {video ? (
        <div className="relative w-full bg-zinc-800 rounded-lg overflow-hidden">
          <video src={video} controls className="w-full h-48 object-contain" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-600 rounded-full p-2 hover:bg-red-700"
            aria-label="Eliminar video"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : uploadingVideo ? (
        <div
          className="w-full border-2 border-dashed border-zinc-600 rounded-lg py-8 flex items-center justify-center"
          aria-label="Subiendo video"
        >
          <Loader className="animate-spin text-zinc-400" size={32} aria-hidden="true" />
          <span className="text-zinc-400 ml-2">Subiendo video...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPickVideo}
          className="w-full border-2 border-dashed border-zinc-600 rounded-lg py-8 flex flex-col items-center justify-center hover:border-red-500 transition"
          aria-label="Agregar video"
        >
          <Video size={32} className="text-zinc-400" aria-hidden="true" />
          <span className="text-zinc-400 mt-2">Agregar video</span>
        </button>
      )}

      <input
        ref={videoInputRef}
        id="product-video"
        type="file"
        accept="video/mp4,video/webm,video/*"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );
}
