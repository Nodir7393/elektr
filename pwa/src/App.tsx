import { useEffect, useState } from 'react';
import { Building2, Database, Plus, Upload, LogOut } from 'lucide-react';
import { api } from './lib/api';
import type { Substation } from './types/database';
import { Statistics } from './components/Statistics';
import { Filters } from './components/Filters';
import { SubstationTable } from './components/SubstationTable';
import { SubstationModal } from './components/SubstationModal';
import { DeleteModal } from './components/DeleteModal';
import { ImportModal } from './components/ImportModal';
import { Pagination } from './components/Pagination';
import { LoginPage } from './components/LoginPage';

type VoltageCategory = '220-500kV' | '35-110kV';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VoltageCategory>('220-500kV');
  const [filteredSubstations, setFilteredSubstations] = useState<Substation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubstation, setEditingSubstation] = useState<Substation | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Substation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Auth tekshirish
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.getMe()
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
        })
        .finally(() => setAuthChecking(false));
    } else {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubstations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const categorySubstations = substations.filter(
      (s) => s.voltage_category === activeTab
    );
    setFilteredSubstations(categorySubstations);
    setCurrentPage(1);
  }, [substations, activeTab]);

  async function fetchSubstations() {
    try {
      setLoading(true);
      const data = await api.getSubstations();
      setSubstations(data || []);
    } catch (error) {
      console.error('Error fetching substations:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (filtered: Substation[]) => {
    setFilteredSubstations(filtered);
    setCurrentPage(1);
  };

  const handleOpenModal = (substation?: Substation) => {
    setEditingSubstation(substation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSubstation(undefined);
    setIsModalOpen(false);
  };

  const handleSaveSubstation = async (data: Partial<Substation>) => {
    try {
      if (editingSubstation) {
        await api.updateSubstation(editingSubstation.id, data);
      } else {
        await api.createSubstation(data);
      }

      await fetchSubstations();
    } catch (error) {
      console.error('Error saving substation:', error);
      alert('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  const handleDeleteSubstation = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.deleteSubstation(deleteTarget.id);

      await fetchSubstations();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting substation:', error);
      alert('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore error
    }
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setSubstations([]);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Auth tekshirilayotgan paytda
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // Login sahifasi
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const currentSubstations = substations.filter(
    (s) => s.voltage_category === activeTab
  );

  const paginatedSubstations = filteredSubstations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Podstansiya Boshqaruv Tizimi
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Elektr hisoblagichlari va podstansiyalarni monitoring qilish
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-1 inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('220-500kV')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${activeTab === '220-500kV'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              220-500 kV Podstansiyalar
              <span className="ml-2 text-sm opacity-75">
                ({substations.filter((s) => s.voltage_category === '220-500kV').length} ta)
              </span>
            </button>
            <button
              onClick={() => setActiveTab('35-110kV')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${activeTab === '35-110kV'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              35-110 kV Podstansiyalar
              <span className="ml-2 text-sm opacity-75">
                ({substations.filter((s) => s.voltage_category === '35-110kV').length} ta)
              </span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all"
          >
            <Upload className="w-5 h-5" />
            Excel dan import
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Yangi podstansiya qo'shish
          </button>
        </div>

        {currentSubstations.length > 0 ? (
          <>
            <Statistics substations={filteredSubstations} />
            <Filters
              substations={currentSubstations}
              onFilterChange={handleFilterChange}
            />
            <div className="mb-4 text-sm text-gray-600">
              Jami: <span className="font-bold">{filteredSubstations.length}</span> ta podstansiya
            </div>
            <SubstationTable
              substations={paginatedSubstations}
              onEdit={handleOpenModal}
              onDelete={(substation) => setDeleteTarget(substation)}
              startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSubstations.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-gray-200">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {activeTab} kategoriyasida ma'lumot topilmadi
            </p>
            <p className="text-gray-500 text-sm">
              Ma'lumotlar bazasiga yangi podstansiyalar qo'shing
            </p>
          </div>
        )}

        <SubstationModal
          isOpen={isModalOpen}
          substation={editingSubstation}
          onClose={handleCloseModal}
          onSave={handleSaveSubstation}
        />

        <DeleteModal
          isOpen={!!deleteTarget}
          title={deleteTarget ? `${deleteTarget.podstansiya_nomi}` : ''}
          onConfirm={handleDeleteSubstation}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => fetchSubstations()}
          activeCategory={activeTab}
        />
      </div>
    </div>
  );
}

export default App;
