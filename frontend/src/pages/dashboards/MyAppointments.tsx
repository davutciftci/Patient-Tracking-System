import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointmentsAsPatient, getMe } from '../../api/client';
import './Dashboard.css';

interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    date: string;
    status: string;
    notes?: string;
    doctor?: {
        user?: { firstName: string; lastName: string };
        speciality?: string;
    };
}

const MyAppointments = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatientIdAndAppointments();
    }, []);

    const fetchPatientIdAndAppointments = async () => {
        try {
            setLoading(true);
            // Get user profile to find patientId
            const profileResponse = await getMe();
            const patientId = profileResponse.user?.roleData?.id;

            if (!patientId) {
                setError('Hasta bilgisi bulunamadı');
                setLoading(false);
                return;
            }

            const appointmentsResponse = await getMyAppointmentsAsPatient(patientId);
            setAppointments(appointmentsResponse || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevular yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: 'Bekliyor', className: 'status-pending' },
            confirmed: { label: 'Onaylandı', className: 'status-confirmed' },
            cancelled: { label: 'İptal', className: 'status-cancelled' },
            completed: { label: 'Tamamlandı', className: 'status-completed' }
        };
        const statusInfo = statusMap[status] || { label: status, className: '' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
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
                    <h1>Randevularım</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>Henüz randevunuz yok</h3>
                        <p>Randevu almak için sekreteryamız ile iletişime geçin.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-date">
                                        <span className="date-icon">📅</span>
                                        <span>{formatDate(apt.date)}</span>
                                    </div>
                                    {getStatusBadge(apt.status)}
                                </div>
                                <div className="appointment-body">
                                    <div className="doctor-info">
                                        <span className="doctor-icon">👨‍⚕️</span>
                                        <div>
                                            <strong>
                                                {apt.doctor?.user
                                                    ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`
                                                    : `Doktor #${apt.doctorId}`}
                                            </strong>
                                            {apt.doctor?.speciality && (
                                                <span className="speciality">{apt.doctor.speciality}</span>
                                            )}
                                        </div>
                                    </div>
                                    {apt.notes && (
                                        <div className="appointment-notes">
                                            <span className="notes-icon">📝</span>
                                            <span>{apt.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyAppointments;
