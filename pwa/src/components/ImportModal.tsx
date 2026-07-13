import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    activeCategory: '220-500kV' | '35-110kV';
}

interface ImportResult {
    success: boolean;
    imported?: number;
    errors?: string[];
    total_errors?: number;
    message?: string;
}

export function ImportModal({ isOpen, onClose, onImportComplete, activeCategory }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
            setFile(selectedFile);
            setResult(null);
        } else {
            alert('Faqat Excel (.xlsx, .xls) yoki CSV fayllar qabul qilinadi');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('voltage_category', activeCategory);

            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { Accept: 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const apiBase = (import.meta.env.VITE_API_URL || '') + '/api';
            const response = await fetch(`${apiBase}/substations/import`, {
                method: 'POST',
                headers,
                body: formData,
            });

            const data: ImportResult = await response.json();

            if (!response.ok) {
                setResult({
                    success: false,
                    message: data.message || 'Import xatolik bilan tugadi',
                });
            } else {
                setResult(data);
                if (data.imported && data.imported > 0) {
                    onImportComplete();
                }
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Server bilan bog\'lanishda xatolik yuz berdi',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Excel dan import qilish</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Kategoriya ko'rsatish */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Kategoriya:</span>{' '}
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                                {activeCategory === '220-500kV' ? '220-500 kV' : '35-110 kV'}
                            </span>
                            {' '}— import qilingan barcha podstansiyalar shu kategoriyaga qo'shiladi
                        </p>
                    </div>

                    {/* Fayl yuklash */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : file
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />
                        {file ? (
                            <div>
                                <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                <p className="text-green-800 font-medium">{file.name}</p>
                                <p className="text-green-600 text-sm mt-1">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                                <p className="text-gray-500 text-xs mt-2">Boshqa fayl tanlash uchun bosing</p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 font-medium">
                                    Excel faylni shu yerga tashlang yoki bosing
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    .xlsx, .xls, .csv formatlar qabul qilinadi
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Excel format ko'rsatma */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium mb-1">📋 Excel ustunlar tartibi:</p>
                        <p className="text-xs text-gray-500">
                            A: №, B: MET filiali, C: Podstansiya, D: Tarmoq, E: Kuchlanish,
                            F: Hisoblagich rusumi, G: Zavod raqami, H: Nominal tok,
                            I: Nominal kuchlanish, J: SIM karta, K: TT, L: KT,
                            M: Xisob koef, N: Muhr raqami, O: Oqim yo'nalishi, P: Naryad
                        </p>
                    </div>

                    {/* Natija */}
                    {result && (
                        <div
                            className={`border rounded-lg p-4 ${result.success
                                ? result.total_errors && result.total_errors > 0
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-green-50 border-green-300'
                                : 'bg-red-50 border-red-300'
                                }`}
                        >
                            {result.success ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-800">
                                            {result.imported} ta podstansiya muvaffaqiyatli import qilindi
                                        </span>
                                    </div>
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-yellow-800 text-sm font-medium mb-1">
                                                ⚠️ {result.total_errors} ta xatolik:
                                            </p>
                                            <div className="max-h-32 overflow-y-auto">
                                                {result.errors.map((err, i) => (
                                                    <p key={i} className="text-yellow-700 text-xs">
                                                        {err}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-red-800">{result.message}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tugmalar */}
                    <div className="flex gap-3 justify-end pt-2 border-t-2 border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium transition-colors"
                        >
                            Yopish
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            {loading ? 'Yuklanmoqda...' : 'Import qilish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
