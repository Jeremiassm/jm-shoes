export const WHATSAPP_NUMBER = "+5493624905096";
export const EMAIL = "jm.shoes.ventas@gmail.com";
export const BRAND_NAME = "JM Shoes";
export const BRAND_TAGLINE = "Zapatillas exclusivas para basketball";
export const LOCATION = "Buenos Aires, Argentina";

export const getWhatsAppLink = (message = "") => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encoded}`;
};

export const getEmailLink = (subject = "", body = "") => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${EMAIL}${query ? `?${query}` : ""}`;
};

export const formatPrice = (value, currency = "ARS") => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};
