import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function DeleteModal({ isOpen, title, onConfirm, onCancel, loading }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">O'chirish tasdiqlash</h3>
          <p className="text-gray-600 mb-6">
            Siz {title} o'chirishni xohlaysiz? Bu amalni bekor qilib bo'lmaydi.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'O\'chirilmoqda...' : 'Ha, o\'chirish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
