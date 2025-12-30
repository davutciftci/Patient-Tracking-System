import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/client';
import './Dashboard.css';

interface DoctorInfo {
    id: number;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        gender: string;
    };
    speciality: string;
    clinic?: {
        name: string;
        address: string;
    };
}

const MyDoctor = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctorInfo();
    }, []);

    const fetchDoctorInfo = async () => {
        try {
            setLoading(true);
            const response = await getMe();


            const patientData = response.user?.roleData;

            if (patientData?.doctor) {
                setDoctor(patientData.doctor);
            } else {
                setError('Henüz bir doktor atanmamış.');
            }

        } catch (err: any) {
            setError('Doktor bilgisi yüklenemedi.');
        } finally {
            setLoading(false);
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
                    <h1>Doktorum</h1>
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
                ) : doctor ? (
                    <div className="doctor-profile-card">
                        <div className="doctor-header">
                            <div className="doctor-avatar">
                                {doctor.user.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                            </div>
                            <div className="doctor-main-info">
                                <h2>Dr. {doctor.user.firstName} {doctor.user.lastName}</h2>
                                <span className="speciality-badge">{doctor.speciality}</span>
                            </div>
                        </div>

                        <div className="doctor-details">
                            <div className="detail-item">
                                <span className="icon">🏥</span>
                                <div>
                                    <label>Klinik</label>
                                    <p>{doctor.clinic?.name || 'Atanmamış'}</p>
                                    <small>{doctor.clinic?.address}</small>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="icon">📧</span>
                                <div>
                                    <label>Email</label>
                                    <p>{doctor.user.email}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="icon">📱</span>
                                <div>
                                    <label>Telefon</label>
                                    <p>{doctor.user.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">👨‍⚕️</div>
                        <h3>Doktor Atanmamış</h3>
                        <p>Henüz size atanmış bir doktor bulunmamaktadır.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyDoctor;
