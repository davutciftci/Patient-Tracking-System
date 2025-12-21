import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByDoctor, getMe } from '../../api/client';
import './Dashboard.css';

interface Patient {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        gender: string;
        birthDate: string;
    };
}

const MyPatients = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const profile = await getMe();
            const doctorId = profile.user?.roleData?.id;

            if (!doctorId) {
                setError('Doktor bilgisi bulunamadı.');
                setLoading(false);
                return;
            }

            const response = await getPatientsByDoctor(doctorId);
            setPatients(response.patients || []);
        } catch (err: any) {
            setError('Hastalar yüklenemedi: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Hastalarım</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Henüz kayıtlı hasta yok</h3>
                        <p>Muayene ettiğiniz hastalar burada listelenecektir.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>Cinsiyet</th>
                                    <th>Yaş</th>
                                    <th>İletişim</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span>{patient.user.gender === 'female' ? '👩' : '👨'}</span>
                                                {patient.user.firstName} {patient.user.lastName}
                                            </div>
                                        </td>
                                        <td>{patient.user.gender === 'male' ? 'Erkek' : 'Kadın'}</td>
                                        <td>{calculateAge(patient.user.birthDate)}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <small>📱 {patient.user.phoneNumber}</small>
                                                <small>📧 {patient.user.email}</small>
                                            </div>
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

export default MyPatients;
