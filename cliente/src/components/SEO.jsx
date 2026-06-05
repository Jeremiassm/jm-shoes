import { useEffect } from "react";

export default function SEO({ title, description, keywords, image, url }) {
  useEffect(() => {
    document.title = title || "JM Shoes - Zapatillas Exclusivas";

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      if (content) {
        element.setAttribute("content", content);
      }
    };

    setMeta("description", description || "Zapatillas exclusivas para jugadores que buscan rendimiento y estilo. Las mejores marcas y modelos.");
    setMeta("keywords", keywords || "zapatillas, sneakers, nike, basketball, calzado, jm shoes");
    
    setMeta("og:title", title || "JM Shoes - Zapatillas Exclusivas", true);
    setMeta("og:description", description || "Zapatillas exclusivas para jugadores que buscan rendimiento y estilo.", true);
    setMeta("og:image", image || "/og-image.svg", true);
    setMeta("og:url", url || window.location.href, true);
    setMeta("og:type", "website", true);
    
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title || "JM Shoes - Zapatillas Exclusivas");
    setMeta("twitter:description", description || "Zapatillas exclusivas para jugadores que buscan rendimiento y estilo.");
    setMeta("twitter:image", image || "/og-image.svg");

    const setLink = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      
      element.setAttribute("href", href);
    };

    setLink("canonical", url || window.location.href);

  }, [title, description, keywords, image, url]);

  return null;
}
