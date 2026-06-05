import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCatalog } from "../../hooks/useCatalog";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { ArrowLeft, Save, Plus, X, Video, Loader } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const DEFAULT_FORM = {
  name: "",
  brand: "",
  price: "",
  description: "",
  sizes: "",
  review: {
    traction: 5,
    cushion: 5,
    materials: 5,
    durability: 5,
    fit: 5,
  },
  pros: "",
  cons: "",
};

function buildFormFromSneaker(sneaker) {
  if (!sneaker) return DEFAULT_FORM;
  return {
    name: sneaker.name || "",
    brand: sneaker.brand || "",
    price: sneaker.price || "",
    description: sneaker.description || "",
    sizes: sneaker.sizes?.join(", ") || "",
    review: sneaker.review || DEFAULT_FORM.review,
    pros: sneaker.pros?.join(", ") || "",
    cons: sneaker.cons?.join(", ") || "",
  };
}

export default function ProductForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { isAdmin } = useAuth();
  const { sneakers, addSneaker, updateSneaker } = useCatalog();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
  }, [isAdmin, navigate]);

  if (isEdit && !routeId) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="pt-32 px-6 max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Producto no especificado</h1>
          <p className="text-zinc-400 mt-4">Volvé al dashboard y seleccioná un producto para editar.</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mt-8 bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
          >
            Ir al dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const sneakerToEdit =
    isEdit && routeId
      ? sneakers.find((s) => s.id === Number(routeId)) || null
      : null;

  return (
    <ProductFormBody
      key={sneakerToEdit?.id ?? "new"}
      isEdit={isEdit}
      initialSneaker={sneakerToEdit}
      onSubmit={isEdit ? (data) => updateSneaker(routeId, data) : addSneaker}
    />
  );
}

function ProductFormBody({ isEdit, initialSneaker, onSubmit }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState(initialSneaker?.images || []);
  const [video, setVideo] = useState(initialSneaker?.video || null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [form, setForm] = useState(() => buildFormFromSneaker(initialSneaker));
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const results = await Promise.all(files.map((file) => api.uploadFile(file)));
      const newUrls = results.map((res) => res.data.url);
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Error al subir imágenes");
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const response = await api.uploadFile(file);
      setVideo(response.data.url);
    } catch (err) {
      console.error("Error uploading video:", err);
      alert("Error al subir video");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sizesArray = form.sizes
        .split(",")
        .map((s) => parseFloat(s.trim().replace(",", ".")))
        .filter((n) => !isNaN(n));
      const prosArray = form.pros
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const consArray = form.cons
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const sneakerData = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price),
        description: form.description,
        images,
        video,
        sizes: sizesArray,
        review: form.review,
        pros: prosArray,
        cons: consArray,
      };

      await onSubmit(sneakerData);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error saving:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Tu sesión expiró. Por favor, iniciá sesión nuevamente.");
        localStorage.removeItem("jmshoes_admin");
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
      } else {
        alert(`Error al guardar el producto: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("review_")) {
      const key = name.replace("review_", "");
      const numValue = value.replace(",", ".");
      setForm({ ...form, review: { ...form.review, [key]: parseFloat(numValue) || 0 } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-8">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
              Información General
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="GT Cut 4"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Marca</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="Nike"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Precio (ARS)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="260000"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Talles (separados por coma)</label>
                <input
                  type="text"
                  name="sizes"
                  value={form.sizes}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="8, 8.5, 9, 10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition resize-none"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
              Imágenes (WebP recomendado)
            </h2>
            <p className="text-zinc-500 text-sm">Formatos recomendados: WebP (menor tamaño) o JPEG. Arrastrá las imágenes para reordenarlas.</p>

            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden cursor-move transition-all ${
                    draggedIndex === index ? "opacity-50 scale-95" : "opacity-100"
                  } ${draggedIndex !== null && draggedIndex !== index ? "hover:border-2 hover:border-red-500" : ""}`}
                >
                  <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 rounded-full p-1 hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs text-center py-1">
                      Principal
                    </div>
                  )}
                </div>
              ))}

              {uploadingImages ? (
                <div className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center">
                  <Loader className="animate-spin text-zinc-400" size={24} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center hover:border-red-500 transition"
                >
                  <Plus size={24} className="text-zinc-400" />
                  <span className="text-xs text-zinc-400 mt-1">Agregar</span>
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

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
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-red-600 rounded-full p-2 hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : uploadingVideo ? (
              <div className="w-full border-2 border-dashed border-zinc-600 rounded-lg py-8 flex items-center justify-center">
                <Loader className="animate-spin text-zinc-400" size={32} />
                <span className="text-zinc-400 ml-2">Subiendo video...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-600 rounded-lg py-8 flex flex-col items-center justify-center hover:border-red-500 transition"
              >
                <Video size={32} className="text-zinc-400" />
                <span className="text-zinc-400 mt-2">Agregar video</span>
              </button>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
              Review (1-10)
            </h2>
            <p className="text-zinc-500 text-sm">Podés usar decimales: 8.5, 9.5, etc.</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["traction", "cushion", "materials", "durability", "fit"].map((key) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">{key}</label>
                  <input
                    type="number"
                    name={`review_${key}`}
                    value={form.review[key]}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    step="0.1"
                    required
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-300 uppercase tracking-tight">
              Pros y Contras
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Pros (separados por coma)</label>
              <input
                type="text"
                name="pros"
                value={form.pros}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                placeholder="Excelente amortiguación, Muy estable"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Contras (separados por coma)</label>
              <input
                type="text"
                name="cons"
                value={form.cons}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                placeholder="Más pesada que otras opciones"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-full font-semibold flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={20} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEdit ? "Guardar Cambios" : "Crear Producto"}
              </>
            )}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
