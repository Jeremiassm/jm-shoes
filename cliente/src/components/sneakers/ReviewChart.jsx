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
        {
            subject: "Traccion",
            value: review.traction || 0,
        },
        {
            subject: "Amortiguacion",
            value: review.cushion || 0,
        },
        {
            subject: "Materiales",
            value: review.materials || 0,
        },
        {
            subject: "Durabilidad",
            value: review.durability || 0,
        },
        {
            subject: "Ajuste",
            value: review.fit || 0,
        },
    ];

    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
            <h2 className="text-2xl font-bold mb-8">
                Performance Review
            </h2>

            <div className="w-full h-80">
                <ResponsiveContainer>
                    <RadarChart data={data}>
                        <PolarGrid stroke="#444" />

                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "white", fontSize: 14 }}
                        />

                        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />

                        <Radar
                            name="Performance"
                            dataKey="value"
                            stroke="#dc2626"
                            fill="#dc2626"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
