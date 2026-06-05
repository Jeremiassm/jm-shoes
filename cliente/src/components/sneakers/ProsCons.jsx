import { CheckCircle, XCircle } from "lucide-react";

export default function ProsCons({ pros, cons }) {
  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10">
      <div className="bg-zinc-900 rounded-3xl p-6 border border-green-500/20">
        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
          <CheckCircle className="text-green-500" size={22} />
          Pros
        </h2>
        <ul className="space-y-3">
          {(pros || []).map((pro, index) => (
            <li key={index} className="text-zinc-300 flex items-start gap-2">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-6 border border-red-500/20">
        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
          <XCircle className="text-red-500" size={22} />
          Contras
        </h2>
        <ul className="space-y-3">
          {(cons || []).map((con, index) => (
            <li key={index} className="text-zinc-300 flex items-start gap-2">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
