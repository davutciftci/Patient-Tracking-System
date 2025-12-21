import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllAppointments, createAppointment, updateAppointment, getAllPatients, getAllDoctors } from '../../api/client';
import './Dashboard.css';

interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    date: string;
    status: string;
    notes?: string;
    patient?: { user?: { firstName: string; lastName: string } };
    doctor?: { user?: { firstName: string; lastName: string } };
}

interface UserSelect {
    id: number;
    user: {
        firstName: string;
        lastName: string;
    };
}

const Appointments = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<UserSelect[]>([]);
    const [doctors, setDoctors] = useState<UserSelect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
                getAllAppointments(),
                getAllPatients(),
                getAllDoctors()
            ]);
            setAppointments(appointmentsRes.appointments || []);
            setPatients(patientsRes.patients || []);
            setDoctors(doctorsRes.doctors || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await getAllAppointments();
            setAppointments(response.appointments || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevular güncellenemedi');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
            await createAppointment({
                patientId: parseInt(formData.patientId),
                doctorId: parseInt(formData.doctorId),
                date: dateTime,
                notes: formData.notes || undefined
            });
            setShowForm(false);
            setFormData({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
            fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevu oluşturulamadı');
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateAppointment(id, { status });
            fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevu güncellenemedi');
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
                    <h1>Randevu Yönetimi</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="actions-bar">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="action-btn primary"
                    >
                        {showForm ? 'İptal' : '+ Yeni Randevu'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h3>Yeni Randevu Oluştur</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hasta Seçin</label>
                                    <select
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Hasta Seçiniz</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.user.firstName} {patient.user.lastName} (ID: {patient.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Doktor Seçin</label>
                                    <select
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Doktor Seçiniz</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.user.firstName} {doctor.user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tarih</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Saat</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notlar</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Randevu notları (isteğe bağlı)"
                                    rows={2}
                                />
                            </div>
                            <button type="submit" className="submit-btn">
                                Kaydet
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>Henüz randevu yok</h3>
                        <p>Yeni bir randevu oluşturmak için yukarıdaki butonu kullanın.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tarih</th>
                                    <th>Hasta</th>
                                    <th>Doktor</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>{apt.id}</td>
                                        <td>{formatDate(apt.date)}</td>
                                        <td>
                                            {apt.patient?.user
                                                ? `${apt.patient.user.firstName} ${apt.patient.user.lastName}`
                                                : `Hasta #${apt.patientId}`}
                                        </td>
                                        <td>
                                            {apt.doctor?.user
                                                ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`
                                                : `Doktor #${apt.doctorId}`}
                                        </td>
                                        <td>{getStatusBadge(apt.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                            className="btn-confirm"
                                                            title="Onayla"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                            className="btn-cancel"
                                                            title="İptal Et"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                        className="btn-complete"
                                                        title="Tamamla"
                                                    >
                                                        ✔
                                                    </button>
                                                )}
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

export default Appointments;
