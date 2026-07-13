import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Substation } from '../types/database';

interface SubstationModalProps {
  isOpen: boolean;
  substation?: Substation;
  onClose: () => void;
  onSave: (data: Partial<Substation>) => Promise<void>;
}

export function SubstationModal({ isOpen, substation, onClose, onSave }: SubstationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Substation>>({
    met_filiali_nomi: '',
    podstansiya_nomi: '',
    tarmoq_nomi: '',
    kuchlanishi: 220,
    hisoblagich_rusumi: '',
    elektr_hisoblagich_zavod_raqami: '',
    nominal_tok: '',
    nominal_kuchlanish: '',
    sim_karta_raqami: '',
    tt: '',
    kt: '',
    xisob_koef: '',
    muhr_raqami: '',
    oqim_yonalishi: '',
    hisoblagich_matish_naryad: '',
    voltage_category: '220-500kV',
  });

  useEffect(() => {
    if (substation) {
      setFormData(substation);
    } else {
      setFormData({
        met_filiali_nomi: '',
        podstansiya_nomi: '',
        tarmoq_nomi: '',
        kuchlanishi: 220,
        hisoblagich_rusumi: '',
        elektr_hisoblagich_zavod_raqami: '',
        nominal_tok: '',
        nominal_kuchlanish: '',
        sim_karta_raqami: '',
        tt: '',
        kt: '',
        xisob_koef: '',
        muhr_raqami: '',
        oqim_yonalishi: '',
        hisoblagich_matish_naryad: '',
        voltage_category: '220-500kV',
      });
    }
  }, [substation, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'kuchlanishi' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {substation ? 'Podstansiyani tahrirlash' : 'Yangi podstansiya qo\'shish'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MET filiali nomi *
              </label>
              <input
                type="text"
                name="met_filiali_nomi"
                value={formData.met_filiali_nomi || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Podstansiya nomi *
              </label>
              <input
                type="text"
                name="podstansiya_nomi"
                value={formData.podstansiya_nomi || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarmoq nomi</label>
              <input
                type="text"
                name="tarmoq_nomi"
                value={formData.tarmoq_nomi || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kuchlanishi (V) *
              </label>
              <input
                type="number"
                name="kuchlanishi"
                value={formData.kuchlanishi || 220}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hisoblagich rusumi *
              </label>
              <input
                type="text"
                name="hisoblagich_rusumi"
                value={formData.hisoblagich_rusumi || ''}
                onChange={handleChange}
                required
                placeholder="EX 518, TE 73, DTS 546, SE-308..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elektr hisoblagich zavod raqami
              </label>
              <input
                type="text"
                name="elektr_hisoblagich_zavod_raqami"
                value={formData.elektr_hisoblagich_zavod_raqami || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal tok</label>
              <input
                type="text"
                name="nominal_tok"
                value={formData.nominal_tok || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominal kuchlanish
              </label>
              <input
                type="text"
                name="nominal_kuchlanish"
                value={formData.nominal_kuchlanish || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIM karta raqami
              </label>
              <input
                type="text"
                name="sim_karta_raqami"
                value={formData.sim_karta_raqami || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TT</label>
              <input
                type="text"
                name="tt"
                value={formData.tt || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KT</label>
              <input
                type="text"
                name="kt"
                value={formData.kt || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xisob koef</label>
              <input
                type="text"
                name="xisob_koef"
                value={formData.xisob_koef || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Muhr raqami</label>
              <input
                type="text"
                name="muhr_raqami"
                value={formData.muhr_raqami || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oqim yonalishi
              </label>
              <input
                type="text"
                name="oqim_yonalishi"
                value={formData.oqim_yonalishi || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hisoblagich matish naryad
              </label>
              <input
                type="text"
                name="hisoblagich_matish_naryad"
                value={formData.hisoblagich_matish_naryad || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategoriya *
              </label>
              <select
                name="voltage_category"
                value={formData.voltage_category || '220-500kV'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="220-500kV">220-500 kV</option>
                <option value="35-110kV">35-110 kV</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
