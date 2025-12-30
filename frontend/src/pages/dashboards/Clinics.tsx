import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllClinics, createClinic, updateClinic, deleteClinic, getAllDoctors } from '../../api/client';
import './Dashboard.css';

interface Clinic {
    id: number;
    name: string;
    address: string;
    doctors?: any[];
}

interface Doctor {
    id: number;
    clinicId?: number;
    user: {
        firstName: string;
        lastName: string;
    };
    speciality: string;
}

const Clinics = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        address: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clinicsRes, doctorsRes] = await Promise.all([
                getAllClinics(),
                getAllDoctors()
            ]);
            setClinics(clinicsRes.clinics || []);
            setDoctors(doctorsRes.doctors || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchOnlyData = async () => {
        const [clinicsRes, doctorsRes] = await Promise.all([
            getAllClinics(),
            getAllDoctors()
        ]);
        setClinics(clinicsRes.clinics || []);
        setDoctors(doctorsRes.doctors || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateClinic(editingId, formData);
            } else {
                await createClinic(formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', address: '' });
            fetchOnlyData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'İşlem başarısız');
        }
    };



    const handleEdit = (clinic: Clinic) => {
        setEditingId(clinic.id);
        setFormData({ name: clinic.name, address: clinic.address });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu kliniği silmek istediğinizden emin misiniz?')) {
            try {
                await deleteClinic(id);
                fetchOnlyData();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Klinik silinemedi');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', address: '' });
    };


    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Klinik Yönetimi</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="actions-bar">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            if (showForm) handleCancel();
                        }}
                        className="action-btn primary"
                    >
                        {showForm ? 'İptal' : '+ Yeni Klinik'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                { }
                {showForm && (
                    <div className="form-card">
                        <h3>{editingId ? 'Klinik Düzenle' : 'Yeni Klinik Ekle'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Klinik Adı</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Klinik adını girin"
                                />
                            </div>
                            <div className="form-group">
                                <label>Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="Klinik adresini girin"
                                    rows={3}
                                />
                            </div>
                            <div className="button-group">
                                <button type="submit" className="submit-btn">
                                    {editingId ? '💾 Güncelle' : '💾 Kaydet'}
                                </button>
                                <button type="button" onClick={handleCancel} className="cancel-btn">
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : clinics.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏥</div>
                        <h3>Henüz klinik yok</h3>
                        <p>Yeni bir klinik eklemek için yukarıdaki butonu kullanın.</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {clinics.map((clinic) => (
                            <div key={clinic.id} className="clinic-card">
                                <div className="clinic-icon">🏥</div>
                                <h3>{clinic.name}</h3>
                                <p className="clinic-address">📍 {clinic.address}</p>
                                <div className="clinic-stats">
                                    <span>👨‍⚕️ {doctors.filter(d => d.clinicId === clinic.id).length} Doktor</span>
                                </div>
                                <div className="clinic-actions">
                                    <button
                                        onClick={() => navigate(`/clinics/${clinic.id}`)}
                                        className="btn-manage"
                                    >
                                        👨‍⚕️ Yönet / Detay
                                    </button>
                                    <button
                                        onClick={() => handleEdit(clinic)}
                                        className="btn-edit"
                                    >
                                        ✏️ Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(clinic.id)}
                                        className="btn-delete"
                                    >
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Clinics;
