import nikeLogo from "../../assets/brands/Nike.png";
import jordanLogo from "../../assets/brands/jordan.png";
import adidasLogo from "../../assets/brands/adidas.png";
import underArmourLogo from "../../assets/brands/underarmour.png";
import liNingLogo from "../../assets/brands/li-ning.png";
import threeSixtyOneLogo from "../../assets/brands/361.png";
import pumaLogo from "../../assets/brands/Puma.png";

const brands = [
  { name: "Nike", logo: nikeLogo },
  { name: "Jordan", logo: jordanLogo },
  { name: "adidas", logo: adidasLogo },
  { name: "Puma", logo: pumaLogo },
  { name: "Under Armour", logo: underArmourLogo },
  { name: "Li-Ning", logo: liNingLogo },
  { name: "361°", logo: threeSixtyOneLogo },
];

export default function Brands() {
  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">
            Las mejores marcas, encontralas acá
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            Trabajamos con las marcas líderes del básquet para traerte modelos exclusivos.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="bg-zinc-950 hover:bg-zinc-900 transition p-6 flex items-center justify-center group min-h-[180px]"
              title={brand.name}
              aria-label={brand.name}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
