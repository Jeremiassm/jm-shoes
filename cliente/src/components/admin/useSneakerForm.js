import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/useToast";

export const DEFAULT_FORM = {
  name: "",
  brand: "",
  price: "",
  description: "",
  sizes: [],
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
    sizes: Array.isArray(sneaker.sizes) ? [...sneaker.sizes] : [],
    review: sneaker.review || DEFAULT_FORM.review,
    pros: sneaker.pros?.join(", ") || "",
    cons: sneaker.cons?.join(", ") || "",
  };
}

function splitList(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function useSneakerForm({ initialSneaker, onSubmit }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(() => buildFormFromSneaker(initialSneaker));
  const [images, setImages] = useState(initialSneaker?.images || []);
  const [video, setVideo] = useState(initialSneaker?.video || null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.startsWith("review_")) {
      const key = name.replace("review_", "");
      const numValue = value.replace(",", ".");
      setForm((prev) => ({
        ...prev,
        review: { ...prev.review, [key]: parseFloat(numValue) || 0 },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageUpload = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setUploadingImages(true);
      try {
        const uploaded = await api.uploadFiles(files);
        const list = Array.isArray(uploaded) ? uploaded : uploaded?.items || [];
        const newUrls = list.map((item) => item.url).filter(Boolean);
        if (newUrls.length === 0) throw new Error("Respuesta de upload vacia");
        setImages((prev) => [...prev, ...newUrls]);
        showToast("Imagenes subidas correctamente", "success");
      } catch (err) {
        console.error("Error uploading images:", err);
        showToast("Error al subir imagenes", "error");
      } finally {
        setUploadingImages(false);
        if (imageInputRef.current) imageInputRef.current.value = "";
      }
    },
    [showToast]
  );

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e, index) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      setImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(index, 0, moved);
        return next;
      });
      setDraggedIndex(index);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleVideoUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingVideo(true);
      try {
        const uploaded = await api.uploadFile(file);
        const url = uploaded?.url;
        if (!url) throw new Error("Respuesta de upload vacia");
        setVideo(url);
        showToast("Video subido correctamente", "success");
      } catch (err) {
        console.error("Error uploading video:", err);
        showToast("Error al subir el video", "error");
      } finally {
        setUploadingVideo(false);
        if (videoInputRef.current) videoInputRef.current.value = "";
      }
    },
    [showToast]
  );

  const removeVideo = useCallback(() => {
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setSaving(true);
      try {
        const sneakerData = {
          name: form.name,
          brand: form.brand,
          price: Number(form.price),
          description: form.description,
          images,
          video,
          sizes: form.sizes,
          review: form.review,
          pros: splitList(form.pros),
          cons: splitList(form.cons),
        };

        await onSubmit(sneakerData);
        showToast("Producto guardado correctamente", "success");
        navigate("/admin/dashboard");
      } catch (err) {
        console.error("Error saving:", err);
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          showToast("Tu sesion expiro. Volve a iniciar sesion.", "error");
          localStorage.removeItem("jmshoes_admin");
          localStorage.removeItem("accessToken");
          navigate("/admin/login");
          return;
        }
        const backendMessage = err.response?.data?.error;
        showToast(
          backendMessage ? `Error: ${backendMessage}` : "Error al guardar el producto",
          "error"
        );
      } finally {
        setSaving(false);
      }
    },
    [form, images, video, onSubmit, navigate, showToast]
  );

  const previewSneaker = useMemo(
    () => ({
      id: "preview",
      name: form.name || "Nombre del producto",
      brand: form.brand || "Marca",
      price: Number(form.price) || 0,
      images,
    }),
    [form.name, form.brand, form.price, images]
  );

  return {
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
  };
}
