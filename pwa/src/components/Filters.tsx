import { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import type { Substation } from '../types/database';

interface FiltersProps {
  substations: Substation[];
  onFilterChange: (filtered: Substation[]) => void;
}

export function Filters({ substations, onFilterChange }: FiltersProps) {
  const [selectedCounterType, setSelectedCounterType] = useState('');
  const [selectedNominalVoltage, setSelectedNominalVoltage] = useState('');
  const [selectedVoltage, setSelectedVoltage] = useState('');
  const [selectedNominalCurrent, setSelectedNominalCurrent] = useState('');

  const uniqueCounterTypes = useMemo(
    () => [...new Set(substations.map((s) => s.hisoblagich_rusumi))].sort(),
    [substations]
  );

  const uniqueNominalVoltages = useMemo(
    () =>
      [...new Set(substations.map((s) => s.nominal_kuchlanish).filter((v): v is string => v !== null && v !== undefined))].sort(),
    [substations]
  );

  const uniqueVoltages = useMemo(
    () => [...new Set(substations.map((s) => s.kuchlanishi))].sort((a, b) => a - b),
    [substations]
  );

  const uniqueNominalCurrents = useMemo(
    () => [...new Set(substations.map((s) => s.nominal_tok).filter((v): v is string => v !== null && v !== undefined))].sort(),
    [substations]
  );

  const applyFilters = (
    counterType: string,
    nominalVoltage: string,
    voltage: string,
    nominalCurrent: string
  ) => {
    let filtered = substations;

    if (counterType) {
      filtered = filtered.filter((s) => s.hisoblagich_rusumi === counterType);
    }

    if (nominalVoltage) {
      filtered = filtered.filter((s) => s.nominal_kuchlanish === nominalVoltage);
    }

    if (voltage) {
      filtered = filtered.filter((s) => s.kuchlanishi === parseInt(voltage));
    }

    if (nominalCurrent) {
      filtered = filtered.filter((s) => s.nominal_tok === nominalCurrent);
    }

    onFilterChange(filtered);
  };

  const handleCounterTypeChange = (value: string) => {
    setSelectedCounterType(value);
    applyFilters(value, selectedNominalVoltage, selectedVoltage, selectedNominalCurrent);
  };

  const handleNominalVoltageChange = (value: string) => {
    setSelectedNominalVoltage(value);
    applyFilters(selectedCounterType, value, selectedVoltage, selectedNominalCurrent);
  };

  const handleVoltageChange = (value: string) => {
    setSelectedVoltage(value);
    applyFilters(selectedCounterType, selectedNominalVoltage, value, selectedNominalCurrent);
  };

  const handleNominalCurrentChange = (value: string) => {
    setSelectedNominalCurrent(value);
    applyFilters(selectedCounterType, selectedNominalVoltage, selectedVoltage, value);
  };

  const clearFilters = () => {
    setSelectedCounterType('');
    setSelectedNominalVoltage('');
    setSelectedVoltage('');
    setSelectedNominalCurrent('');
    onFilterChange(substations);
  };

  const hasActiveFilters =
    selectedCounterType || selectedNominalVoltage || selectedVoltage || selectedNominalCurrent;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtrlash</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Tozalash
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hisoblagich rusumi
          </label>
          <select
            value={selectedCounterType}
            onChange={(e) => handleCounterTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hammasi</option>
            {uniqueCounterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nominal kuchlanish
          </label>
          <select
            value={selectedNominalVoltage}
            onChange={(e) => handleNominalVoltageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hammasi</option>
            {uniqueNominalVoltages.map((voltage) => (
              <option key={voltage} value={voltage}>
                {voltage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kuchlanishi</label>
          <select
            value={selectedVoltage}
            onChange={(e) => handleVoltageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hammasi</option>
            {uniqueVoltages.map((voltage) => (
              <option key={voltage} value={voltage}>
                {voltage}V
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal tok</label>
          <select
            value={selectedNominalCurrent}
            onChange={(e) => handleNominalCurrentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hammasi</option>
            {uniqueNominalCurrents.map((current) => (
              <option key={current} value={current}>
                {current}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
