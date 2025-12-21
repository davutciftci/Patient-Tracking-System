import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExaminationsByPatient, getMe } from '../../api/client';
import './Dashboard.css';

interface Examination {
    id: number;
    diagnosis: string;
    treatment: string;
    notes: string;
    appointment: {
        date: string;
    };
    doctor: {
        user: {
            firstName: string;
            lastName: string;
        };
        speciality: string;
    };
}

const MyExaminations = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [examinations, setExaminations] = useState<Examination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatientIdAndExaminations();
    }, []);

    const fetchPatientIdAndExaminations = async () => {
        try {
            setLoading(true);
            const profileResponse = await getMe();
            const patientId = profileResponse.user?.roleData?.id;

            if (!patientId) {
                setError('Hasta bilgisi bulunamadı');
                setLoading(false);
                return;
            }

            const response = await getExaminationsByPatient(patientId);
            setExaminations(response.examinations || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Muayene geçmişi yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Muayene Geçmişim</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : examinations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Henüz muayene kaydınız yok</h3>
                        <p>Geçmiş muayeneleriniz burada listelenecektir.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {examinations.map((exam) => (
                            <div key={exam.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-date">
                                        <span className="date-icon">📅</span>
                                        <span>{formatDate(exam.appointment?.date)}</span>
                                    </div>
                                    <span className="status-badge status-completed">Tamamlandı</span>
                                </div>
                                <div className="appointment-body">
                                    <div className="doctor-info">
                                        <span className="doctor-icon">👨‍⚕️</span>
                                        <div>
                                            <strong>
                                                {exam.doctor?.user
                                                    ? `Dr. ${exam.doctor.user.firstName} ${exam.doctor.user.lastName}`
                                                    : 'Doktor Bilgisi Yok'}
                                            </strong>
                                            {exam.doctor?.speciality && (
                                                <span className="speciality">{exam.doctor.speciality}</span>
                                            )}
                                        </div>
                                    </div>
                                    <hr className="divider" />
                                    <div className="examination-details">
                                        <div className="detail-item">
                                            <h4>Tanı</h4>
                                            <p>{exam.diagnosis}</p>
                                        </div>
                                        <div className="detail-item">
                                            <h4>Tedavi</h4>
                                            <p>{exam.treatment}</p>
                                        </div>
                                        {exam.notes && (
                                            <div className="detail-item">
                                                <h4>Notlar</h4>
                                                <p>{exam.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyExaminations;
