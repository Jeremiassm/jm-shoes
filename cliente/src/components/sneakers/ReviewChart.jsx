import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

export default function ReviewChart({ review }) {
    if (!review) {
        return null;
    }

    const data = [
        { subject: "Traccion", value: review.traction || 0 },
        { subject: "Amortiguacion", value: review.cushion || 0 },
        { subject: "Materiales", value: review.materials || 0 },
        { subject: "Durabilidad", value: review.durability || 0 },
        { subject: "Ajuste", value: review.fit || 0 },
    ];

    const average = (
        data.reduce((sum, d) => sum + d.value, 0) / data.length
    ).toFixed(1);

    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Performance Review</h2>
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                        Promedio
                    </span>
                    <span className="font-display text-2xl font-bold text-red-500">
                        {average}/10
                    </span>
                </div>
            </div>
            <p className="text-zinc-500 text-xs mb-4">
                Escala 0–10 basada en review del producto.
            </p>

            <div className="w-full h-80">
                <ResponsiveContainer>
                    <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />

                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "white", fontSize: 13 }}
                        />

                        <PolarRadiusAxis
                            domain={[0, 10]}
                            tick={{ fill: "#71717a", fontSize: 10 }}
                            tickCount={6}
                            axisLine={{ stroke: "#3f3f46" }}
                        />

                        <Radar
                            name="Performance"
                            dataKey="value"
                            stroke="#dc2626"
                            fill="#dc2626"
                            fillOpacity={0.45}
                            dot={{ r: 3, fill: "#dc2626", stroke: "#fff", strokeWidth: 1 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs">
                {data.map((d) => (
                    <li
                        key={d.subject}
                        className="flex items-center justify-between gap-2 bg-zinc-800/50 rounded-lg px-3 py-2"
                    >
                        <span className="text-zinc-300">{d.subject}</span>
                        <span
                            className={`font-bold ${
                                d.value >= 8
                                    ? "text-green-500"
                                    : d.value >= 6
                                      ? "text-yellow-500"
                                      : "text-red-500"
                            }`}
                        >
                            {d.value}/10
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
