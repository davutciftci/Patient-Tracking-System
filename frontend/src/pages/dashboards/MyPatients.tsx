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
        tc_no: string;
        email: string;
        phoneNumber: string;
        gender: string;
        birthDate: string;
        emergencyName: string | null;
        emergencyPhone: string | null;
        emergencyRelation: string | null;
    };
}

const MyPatients = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPatients = patients.filter(patient => {
        const term = searchTerm.toLowerCase();
        return (
            patient.user.firstName.toLowerCase().includes(term) ||
            patient.user.lastName.toLowerCase().includes(term) ||
            (patient.user.tc_no && patient.user.tc_no.includes(term)) ||
            (patient.user.phoneNumber && patient.user.phoneNumber.includes(term))
        );
    });

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
                <div className="actions-bar">
                    <input
                        type="text"
                        placeholder="Hasta Ara (Ad, TC, Telefon)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{
                            padding: '12px',
                            width: '100%',
                            maxWidth: '400px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Sonuç bulunamadı</h3>
                        <p>Arama kriterlerinize uygun hasta bulunamadı.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>Doğum Tarihi</th>
                                    <th>Cinsiyet</th>
                                    <th>Yaş</th>
                                    <th>İletişim</th>
                                    <th>🚨 Acil Durum Kişisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                                {patient.user.firstName} {patient.user.lastName} <br />

                                            </div>
                                        </td>
                                        <td>{new Date(patient.user.birthDate).toLocaleDateString('en-GB')}</td>
                                        <td>{patient.user.gender === 'male' ? 'Erkek' : 'Kadın'}</td>
                                        <td>{calculateAge(patient.user.birthDate)}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <small>📱 {patient.user.phoneNumber}</small>
                                                <small>📧 {patient.user.email}</small>
                                            </div>
                                        </td>
                                        <td>
                                            {patient.user.emergencyName ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <small><strong>{patient.user.emergencyName}</strong></small>
                                                    <small>📞 {patient.user.emergencyPhone}</small>
                                                    <small style={{ color: '#64748b' }}>({patient.user.emergencyRelation})</small>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>Belirtilmemiş</span>
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

export default MyPatients;
