import { Edit2, Trash2 } from 'lucide-react';
import type { Substation } from '../types/database';

interface SubstationTableProps {
  substations: Substation[];
  onEdit: (substation: Substation) => void;
  onDelete: (substation: Substation) => void;
  startIndex?: number;
}

export function SubstationTable({ substations, onEdit, onDelete, startIndex = 0 }: SubstationTableProps) {
  if (substations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
        <p className="text-gray-500">Ma'lumot topilmadi</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border-2 border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Amallar
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              №
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              MET filiali nomi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Podstansiya nomi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tarmoq nomi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Kuchlanishi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Hisoblagich rusumi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Zavod raqami
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Nominal tok
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Nominal kuchlanish
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              SIM karta
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              TT
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              KT
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {substations.map((substation, index) => (
            <tr key={substation.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(substation)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(substation)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.met_filiali_nomi}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.podstansiya_nomi}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.tarmoq_nomi || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.kuchlanishi}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {substation.hisoblagich_rusumi}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {substation.elektr_hisoblagich_zavod_raqami || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.nominal_tok || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.nominal_kuchlanish || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {substation.sim_karta_raqami || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.tt || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {substation.kt || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
