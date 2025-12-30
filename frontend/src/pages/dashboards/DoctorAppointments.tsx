import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointmentsAsDoctor, updateAppointment, createAppointment, getPatientsByDoctor, getMe } from '../../api/client';
import './Dashboard.css';

const DoctorAppointments = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date: '',
        status: '',
        patientName: ''
    });
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [myPatients, setMyPatients] = useState<any[]>([]);
    const [emergencyData, setEmergencyData] = useState({
        patientId: '',
        date: '',
        time: '',
        notes: ''
    });
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [doctorSettings, setDoctorSettings] = useState<any>(null);
    const [doctorId, setDoctorId] = useState<number | null>(null);

    useEffect(() => {
        if (doctorId && emergencyData.date) {
            generateSlots();
        }
    }, [emergencyData.date, doctorId, appointments]);

    const generateSlots = async () => {
        if (!doctorSettings || !emergencyData.date) return;

        const { workingDays, dailySlots } = doctorSettings;
        const selectedDate = new Date(emergencyData.date);
        const dayOfWeek = selectedDate.getDay() || 7;

        if (!workingDays.includes(String(dayOfWeek))) {
            setAvailableSlots([]);
            return;
        }

        if (dailySlots) {
            
            const slots = (dailySlots as string).split(',').filter(s => s).sort();

            
            const available = slots.filter(slotTime => {
                const isTaken = appointments.some(app => {
                    const appDate = new Date(app.date);
                    if (appDate.toDateString() !== selectedDate.toDateString()) return false;
                    const appTime = appDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    return appTime === slotTime && app.status !== 'cancelled';
                });
                return !isTaken;
            });
            setAvailableSlots(available);
        } else {
            
            
            
            setAvailableSlots([]);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchAppointments();
        }
    }, [filters, doctorId]);

    const fetchInitialData = async () => {
        try {
            const profile = await getMe();
            const dId = profile.user?.roleData?.id;
            if (dId) {
                setDoctorId(dId);
                const patientsRes = await getPatientsByDoctor(dId);
                setMyPatients(patientsRes.patients || []);

                
                
                
                const settings = profile.doctorSettings || profile.user?.doctorSettings || profile.user?.roleData || {};
                setDoctorSettings({
                    workingDays: settings.workingDays || '1,2,3,4,5',
                    workingHourStart: settings.workingHourStart || '09:00',
                    workingHourEnd: settings.workingHourEnd || '17:00',
                    appointmentDuration: settings.appointmentDuration || 15,
                    dailySlots: settings.dailySlots || ''
                });
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchAppointments = async () => {
        if (!doctorId) return;
        setLoading(true);
        try {
            const filterParams: any = {};
            if (filters.date) filterParams.date = new Date(filters.date);
            if (filters.status) filterParams.status = filters.status;
            if (filters.patientName) filterParams.patientName = filters.patientName;

            const res = await getMyAppointmentsAsDoctor(doctorId, filterParams);
            setAppointments(res.appointments || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        if (!window.confirm(`Randevu durumunu '${newStatus}' olarak değiştirmek istiyor musunuz?`)) return;
        try {
            await updateAppointment(id, { status: newStatus });
            if (newStatus === 'completed') {
                navigate('/examinations', { state: { appointmentId: id } });
            } else {
                fetchAppointments();
            }
        } catch (error) {
            alert('Durum güncellenemedi');
        }
    };

    const handleEmergencySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorId) return;

        try {
            const dateTime = new Date(`${emergencyData.date}T${emergencyData.time}`).toISOString();
            await createAppointment({
                patientId: parseInt(emergencyData.patientId),
                doctorId: doctorId,
                date: dateTime,
                notes: emergencyData.notes,
                type: 'emergency',
                status: 'confirmed' 
            });
            alert('Acil randevu oluşturuldu.');
            setShowEmergencyModal(false);
            setEmergencyData({ patientId: '', date: '', time: '', notes: '' });
            fetchAppointments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Randevu oluşturulamadı');
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
                    <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">← Panel</button>
                    <h1>Randevu Yönetimi</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
            </header>

            <main className="dashboard-content">
                <div className="actions-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="filters" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            placeholder="Tarih"
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <select
                            className="form-control"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="pending">Bekleyen</option>
                            <option value="confirmed">Onaylı</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">İptal</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Hasta Adı Ara..."
                            value={filters.patientName}
                            onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <button className="action-btn primary" onClick={() => setShowEmergencyModal(true)}>
                        🚨 Acil Randevu Ekle
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tarih/Saat</th>
                                    <th>Hasta</th>
                                    <th>Tip</th>
                                    <th>Durum</th>
                                    <th>Notlar</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Randevu bulunamadı.</td>
                                    </tr>
                                ) : (
                                    appointments.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                {new Date(app.date).toLocaleDateString('tr-TR')} <br />
                                                <small>{new Date(app.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</small>
                                            </td>
                                            <td>
                                                {app.patient?.user?.firstName} {app.patient?.user?.lastName} <br />
                                                <small className="text-muted">Tel: {app.patient?.user?.phoneNumber}</small>
                                            </td>
                                            <td>
                                                {app.type === 'emergency' ? (
                                                    <span className="badge emergency">ACİL</span>
                                                ) : (
                                                    <span className="badge standard" style={{ background: '#e2e8f0', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7em' }}>Standart</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${app.status}`}>
                                                    {app.status === 'pending' ? 'Bekliyor' :
                                                        app.status === 'confirmed' ? 'Onaylı' :
                                                            app.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                                                </span>
                                            </td>
                                            <td><small>{app.notes || '-'}</small></td>
                                            <td>
                                                <div className="action-buttons">
                                                    {app.status === 'pending' && (
                                                        <>
                                                            <button title="Onayla" className="btn-confirm" onClick={() => handleStatusChange(app.id, 'confirmed')}>✓</button>
                                                            <button title="İptal Et" className="btn-cancel" onClick={() => handleStatusChange(app.id, 'cancelled')}>✕</button>
                                                        </>
                                                    )}
                                                    {app.status === 'confirmed' && (
                                                        <>
                                                            <button title="Tamamla ve Muayene Gir" className="btn-complete" onClick={() => handleStatusChange(app.id, 'completed')}>📝</button>
                                                            <button title="İptal Et" className="btn-cancel" onClick={() => handleStatusChange(app.id, 'cancelled')}>✕</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {}
            {showEmergencyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>🚨 Acil Randevu Oluştur</h3>
                        <form onSubmit={handleEmergencySubmit}>
                            <div className="form-group">
                                <label>Hasta Seçin</label>
                                <select
                                    required
                                    value={emergencyData.patientId}
                                    onChange={(e) => setEmergencyData({ ...emergencyData, patientId: e.target.value })}
                                >
                                    <option value="">Hasta Seçiniz</option>
                                    {myPatients.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.user.firstName} {p.user.lastName} ({p.user.tc_no})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tarih</label>
                                    <input
                                        type="date"
                                        required
                                        value={emergencyData.date}
                                        onChange={(e) => setEmergencyData({ ...emergencyData, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Saat</label>
                                    <div className="time-selection-mode" style={{ marginBottom: '10px' }}>
                                        {availableSlots.length > 0 ? (
                                            <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                {availableSlots.map(slot => (
                                                    <button
                                                        type="button"
                                                        key={slot}
                                                        onClick={() => setEmergencyData({ ...emergencyData, time: slot })}
                                                        className={`slot-btn ${emergencyData.time === slot ? 'selected' : ''}`}
                                                        style={{
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #cbd5e1',
                                                            background: emergencyData.time === slot ? '#2563eb' : '#f1f5f9',
                                                            color: emergencyData.time === slot ? '#fff' : '#334155',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-slots">
                                                <small style={{ color: '#dc2626' }}>Uygun slot bulunamadı. Manuel giriş yapınız.</small>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="time"
                                        required
                                        value={emergencyData.time}
                                        onChange={(e) => setEmergencyData({ ...emergencyData, time: e.target.value })}
                                        style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                    <small className="text-muted">Slot seçebilir veya manuel saat girebilirsiniz.</small>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Acil Notu / Şikayet</label>
                                <textarea
                                    value={emergencyData.notes}
                                    onChange={(e) => setEmergencyData({ ...emergencyData, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="button-group">
                                <button type="button" className="cancel-btn" onClick={() => setShowEmergencyModal(false)}>İptal</button>
                                <button type="submit" className="submit-btn" style={{ background: '#dc2626' }}>Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
