import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllDoctors, getAllClinics, updateDoctor } from '../../api/client';
import './Dashboard.css';

interface Doctor {
    id: number;
    speciality: string;
    clinicId: number | null;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    clinic?: {
        name: string;
    };
}

interface Clinic {
    id: number;
    name: string;
}

const Doctors = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedClinic, setSelectedClinic] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [doctorsRes, clinicsRes] = await Promise.all([
                getAllDoctors(),
                getAllClinics()
            ]);
            setDoctors(doctorsRes.doctors || []);
            setClinics(clinicsRes.clinics || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (doctorId: number) => {
        try {
            await updateDoctor(doctorId, { clinicId: parseInt(selectedClinic) });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Atama başarısız');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Doktor Yönetimi</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ad Soyad</th>
                                    <th>Uzmanlık</th>
                                    <th>Klinik</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>{doctor.id}</td>
                                        <td>Dr. {doctor.user.firstName} {doctor.user.lastName}</td>
                                        <td>{doctor.speciality}</td>
                                        <td>
                                            {editingId === doctor.id ? (
                                                <select
                                                    value={selectedClinic}
                                                    onChange={(e) => setSelectedClinic(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="">Klinik Seçiniz</option>
                                                    {clinics.map((clinic) => (
                                                        <option key={clinic.id} value={clinic.id}>
                                                            {clinic.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                doctor.clinic?.name || <span className="text-muted">Atanmamış</span>
                                            )}
                                        </td>
                                        <td>
                                            {editingId === doctor.id ? (
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleAssign(doctor.id)}
                                                        className="btn-save"
                                                        disabled={!selectedClinic}
                                                    >
                                                        💾 Kaydet
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="btn-cancel"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingId(doctor.id);
                                                        setSelectedClinic(doctor.clinicId?.toString() || '');
                                                    }}
                                                    className="btn-edit"
                                                >
                                                    🏥 Klinik Ata
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Doctors;
