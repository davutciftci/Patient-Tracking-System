import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClinicById, getAllDoctors, updateDoctor } from '../../api/client';
import './Dashboard.css';

interface Clinic {
    id: number;
    name: string;
    address: string;
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

const ClinicDetail = () => {
    const { id } = useParams();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

    useEffect(() => {
        fetchClinicAndDoctors();
    }, [id]);

    const fetchClinicAndDoctors = async () => {
        try {
            setLoading(true);
            const [clinicRes, doctorsRes] = await Promise.all([
                getClinicById(parseInt(id!)),
                getAllDoctors()
            ]);
            setClinic(clinicRes.clinic);
            setDoctors(doctorsRes.doctors || []);
        } catch (err: any) {
            setError('Veriler yüklenemedi: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDoctor = async () => {
        if (!selectedDoctorId) return;
        try {
            await updateDoctor(parseInt(selectedDoctorId), { clinicId: parseInt(id!) });
            setSelectedDoctorId('');
            fetchClinicAndDoctors();
            alert('Doktor başarıyla atandı.');
        } catch (err: any) {
            alert('Atama başarısız: ' + (err.response?.data?.message || 'Hata oluştu'));
        }
    };

    const handleRemoveDoctor = async (doctorId: number) => {
        if (!window.confirm('Bu doktoru klinikten çıkarmak istediğinize emin misiniz?')) return;
        try {
            await updateDoctor(doctorId, { clinicId: null } as any);
            fetchClinicAndDoctors();
        } catch (err: any) {
            alert('Çıkarma başarısız');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!clinic) return <div className="error-message">Klinik bulunamadı.</div>;

    const assignedDoctors = doctors.filter(d => d.clinicId === clinic.id);
    const availableDoctors = doctors.filter(d => d.clinicId !== clinic.id);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate('/clinics')} className="back-btn">
                        ← Klinikler
                    </button>
                    <h1>{clinic.name}</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="detail-card">
                    <div className="detail-header">
                        <div className="detail-icon">🏥</div>
                        <div>
                            <h2>{clinic.name}</h2>
                            <p>📍 {clinic.address}</p>
                        </div>
                    </div>

                    <div className="detail-section">
                        <div className="section-header">
                            <h3>👨‍⚕️ Mevcut Doktorlar ({assignedDoctors.length})</h3>
                        </div>

                        {assignedDoctors.length === 0 ? (
                            <p className="no-data-text">Bu klinikte henüz doktor yok.</p>
                        ) : (
                            <div className="doctors-grid">
                                {assignedDoctors.map(doc => (
                                    <div key={doc.id} className="mini-doctor-card">
                                        <div className="doc-avatar">👨‍⚕️</div>
                                        <div className="doc-info">
                                            <strong>Dr. {doc.user.firstName} {doc.user.lastName}</strong>
                                            <span>{doc.speciality}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDoctor(doc.id)}
                                            className="btn-icon-danger"
                                            title="Klinikten Çıkar"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <div className="section-header">
                            <h3>➕ Doktor Ekle</h3>
                        </div>
                        <div className="assign-form">
                            <select
                                value={selectedDoctorId}
                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Doktor Seçiniz...</option>
                                {availableDoctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.user.firstName} {doc.user.lastName} ({doc.speciality})
                                        {doc.clinicId ? ' (Başka Klinikte)' : ' (Boşta)'}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAssignDoctor}
                                className="action-btn success"
                                disabled={!selectedDoctorId}
                            >
                                Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClinicDetail;
