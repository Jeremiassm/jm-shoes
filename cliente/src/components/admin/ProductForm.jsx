import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader, Eye, EyeOff } from "lucide-react";

import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import { useCatalog } from "../../hooks/useCatalog";
import { useSneakerForm } from "./useSneakerForm";
import SneakerFormPreview from "./SneakerFormPreview";
import GeneralSection from "./Sections/GeneralSection";
import ImagesSection from "./Sections/ImagesSection";
import VideoSection from "./Sections/VideoSection";
import ReviewSection from "./Sections/ReviewSection";
import ProsConsSection from "./Sections/ProsConsSection";

function ProductFormNotFound({ onBack }) {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <div className="pt-32 px-6 max-w-2xl mx-auto text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
          Producto no especificado
        </h1>
        <p className="text-zinc-400 mt-4">
          Volve al dashboard y selecciona un producto para editar.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-8 bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
        >
          Ir al dashboard
        </button>
      </div>
      <Footer />
    </div>
  );
}

function ProductFormBody({ isEdit, initialSneaker, onSubmit }) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);

  const {
    form,
    setForm,
    images,
    video,
    saving,
    uploadingImages,
    uploadingVideo,
    draggedIndex,
    imageInputRef,
    videoInputRef,
    previewSneaker,
    handleChange,
    handleImageUpload,
    removeImage,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleVideoUpload,
    removeVideo,
    handleSubmit,
  } = useSneakerForm({ initialSneaker, onSubmit });

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Volver al Dashboard
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="md:hidden flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
            aria-pressed={showPreview}
            aria-label={showPreview ? "Ocultar preview" : "Ver preview"}
          >
            {showPreview ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            {showPreview ? "Ocultar preview" : "Ver preview"}
          </button>
        </div>

        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-8">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>

        <div className="md:grid md:grid-cols-[1fr_360px] md:gap-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <GeneralSection
              form={form}
              setForm={setForm}
              handleChange={handleChange}
            />

            <ImagesSection
              images={images}
              uploadingImages={uploadingImages}
              draggedIndex={draggedIndex}
              imageInputRef={imageInputRef}
              onPickImages={() => imageInputRef.current?.click()}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />

            <VideoSection
              video={video}
              uploadingVideo={uploadingVideo}
              videoInputRef={videoInputRef}
              onPickVideo={() => videoInputRef.current?.click()}
              onUpload={handleVideoUpload}
              onRemove={removeVideo}
            />

            <ReviewSection
              review={form.review}
              onChange={handleChange}
            />

            <ProsConsSection
              pros={form.pros}
              cons={form.cons}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-full font-semibold flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={20} aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} aria-hidden="true" />
                  {isEdit ? "Guardar Cambios" : "Crear Producto"}
                </>
              )}
            </button>
          </form>

          {showPreview && <SneakerFormPreview sneaker={previewSneaker} />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProductForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { isAdmin } = useAuth();
  const { sneakers, addSneaker, updateSneaker } = useCatalog();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  if (isEdit && !routeId) {
    return <ProductFormNotFound onBack={() => navigate("/admin/dashboard")} />;
  }

  const sneakerToEdit =
    isEdit && routeId
      ? sneakers.find((s) => s.id === Number(routeId)) || null
      : null;

  if (isEdit && routeId && !sneakerToEdit) {
    return <ProductFormNotFound onBack={() => navigate("/admin/dashboard")} />;
  }

  return (
    <ProductFormBody
      key={sneakerToEdit?.id ?? "new"}
      isEdit={isEdit}
      initialSneaker={sneakerToEdit}
      onSubmit={isEdit ? (data) => updateSneaker(routeId, data) : addSneaker}
    />
  );
}
