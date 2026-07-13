import { BarChart3, Zap, Gauge } from 'lucide-react';
import type { Substation } from '../types/database';

interface StatisticsProps {
  substations: Substation[];
}

export function Statistics({ substations }: StatisticsProps) {
  const counterTypes = substations.reduce((acc, s) => {
    acc[s.hisoblagich_rusumi] = (acc[s.hisoblagich_rusumi] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const nominalVoltages = substations.reduce((acc, s) => {
    if (s.nominal_kuchlanish) {
      acc[s.nominal_kuchlanish] = (acc[s.nominal_kuchlanish] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const voltages = substations.reduce((acc, s) => {
    const voltage = s.kuchlanishi + 'V';
    acc[voltage] = (acc[voltage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const nominalCurrents = substations.reduce((acc, s) => {
    if (s.nominal_tok) {
      acc[s.nominal_tok] = (acc[s.nominal_tok] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Hisoblagich rusumi"
        icon={<BarChart3 className="w-6 h-6" />}
        data={counterTypes}
        color="blue"
      />
      <StatCard
        title="Nominal kuchlanish"
        icon={<Zap className="w-6 h-6" />}
        data={nominalVoltages}
        color="green"
      />
      <StatCard
        title="Kuchlanishi"
        icon={<Gauge className="w-6 h-6" />}
        data={voltages}
        color="orange"
      />
      <StatCard
        title="Nominal tok"
        icon={<Gauge className="w-6 h-6" />}
        data={nominalCurrents}
        color="purple"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, icon, data, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span className="font-bold">{value} ta</span>
            </div>
          ))}
      </div>
    </div>
  );
}
