import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointmentsAsPatient, getMe, createAppointment, getAllClinics, getAllDoctors, updateAppointment, getMyAppointmentsAsDoctor } from '../../api/client';
import './Dashboard.css';

interface Clinic {
    id: number;
    name: string;
}

interface UserSelect {
    id: number;
    clinicId?: number;
    workingDays?: string;
    workingHourStart?: string;
    workingHourEnd?: string;
    dailySlots?: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

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
    const [showForm, setShowForm] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        clinicId: '',
        doctorId: '',
        date: '',
        time: '',
        notes: ''
    });
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [doctors, setDoctors] = useState<UserSelect[]>([]);
    const [patientId, setPatientId] = useState<number | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const profileResponse = await getMe();
            const pId = profileResponse.user?.roleData?.id;

            if (!pId) {
                setError('Hasta bilgisi bulunamadı');
                return;
            }
            setPatientId(pId);

            const [appointmentsRes, clinicsRes, doctorsRes] = await Promise.all([
                getMyAppointmentsAsPatient(pId),
                getAllClinics(),
                getAllDoctors()
            ]);

            setAppointments(appointmentsRes.appointments || []);
            setClinics(clinicsRes.clinics || []);
            setDoctors(doctorsRes.doctors || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        if (!patientId) return;
        try {
            const response = await getMyAppointmentsAsPatient(patientId);
            setAppointments(response.appointments || []);
        } catch (err: any) {
            setError('Randevular güncellenemedi');
        }
    };

    const generateSlots = async (doctorId: string, dateStr: string) => {
        setAvailableSlots([]);
        if (!doctorId || !dateStr) return;

        const doctor = doctors.find(d => d.id === parseInt(doctorId));
        if (!doctor) return;

        setLoadingSlots(true);
        try {
            const selectedDate = new Date(dateStr);
            const dayOfWeek = selectedDate.getDay() || 7;

            
            if (doctor.workingDays && !doctor.workingDays.split(',').includes(String(dayOfWeek))) {
                setAvailableSlots([]); 
                setLoadingSlots(false);
                return;
            }

            
            const takenRes = await getMyAppointmentsAsDoctor(doctor.id, { date: selectedDate });
            const takenAppointments = takenRes.appointments || [];

            const takenTimes = takenAppointments
                .filter((app: any) => app.status !== 'cancelled')
                .map((app: any) => {
                    const d = new Date(app.date);
                    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                });

            let slots: string[] = [];

            
            if (doctor.dailySlots && doctor.dailySlots.length > 0) {
                slots = doctor.dailySlots.split(',').filter(s => s).sort();
            }
            
            else if (doctor.workingHourStart && doctor.workingHourEnd) {
                const [startH, startM] = doctor.workingHourStart.split(':').map(Number);
                const [endH, endM] = doctor.workingHourEnd.split(':').map(Number);
                let current = new Date(selectedDate);
                current.setHours(startH, startM, 0, 0);
                const end = new Date(selectedDate);
                end.setHours(endH, endM, 0, 0);

                while (current < end) {
                    slots.push(current.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
                    current.setMinutes(current.getMinutes() + 15); 
                }
            }

            
            const finalSlots = slots.filter(time => !takenTimes.includes(time));
            setAvailableSlots(finalSlots);

        } catch (error) {
            console.error("Slot generation error", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (formData.doctorId && formData.date) {
            generateSlots(formData.doctorId, formData.date);
        }
    }, [formData.doctorId, formData.date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) return;

        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

            if (editingAppointmentId) {
                
                await updateAppointment(editingAppointmentId, {
                    doctorId: parseInt(formData.doctorId),
                    date: dateTime,
                    notes: formData.notes || undefined
                });
                setEditingAppointmentId(null);
                alert('Randevu güncellendi.');
            } else {
                
                await createAppointment({
                    patientId: patientId,
                    doctorId: parseInt(formData.doctorId),
                    date: dateTime,
                    notes: formData.notes || undefined
                });
                alert('Randevu talebiniz alındı.');
            }

            setShowForm(false);
            setFormData({ clinicId: '', doctorId: '', date: '', time: '', notes: '' });
            fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevu işlemi başarısız');
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

    const handleCancelAppointment = async (appointmentId: number) => {
        if (!window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) return;
        try {
            await updateAppointment(appointmentId, { status: 'cancelled' });
            fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Randevu iptal edilemedi');
        }
    };

    const handleEditAppointment = (apt: Appointment) => {
        const aptDate = new Date(apt.date);
        const doctor = doctors.find(d => d.id === apt.doctorId);
        const clinicId = doctor?.clinicId?.toString() || '';

        setFormData({
            clinicId: clinicId,
            doctorId: apt.doctorId.toString(),
            date: aptDate.toISOString().split('T')[0],
            time: aptDate.toTimeString().slice(0, 5),
            notes: apt.notes || ''
        });
        setEditingAppointmentId(apt.id);
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setShowForm(false);
        setEditingAppointmentId(null);
        setFormData({ clinicId: '', doctorId: '', date: '', time: '', notes: '' });
    };

    const filteredDoctors = formData.clinicId
        ? doctors.filter(d => d.clinicId === parseInt(formData.clinicId))
        : [];

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
                <div className="actions-bar">
                    <button
                        onClick={() => {
                            if (showForm) {
                                handleCancelEdit();
                            } else {
                                setShowForm(true);
                            }
                        }}
                        className="action-btn primary"
                    >
                        {showForm ? 'İptal' : '+ Yeni Randevu Al'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h3>{editingAppointmentId ? 'Randevu Düzenle' : 'Yeni Randevu Oluştur'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Klinik Seçin</label>
                                    <select
                                        value={formData.clinicId}
                                        onChange={(e) => setFormData({ ...formData, clinicId: e.target.value, doctorId: '' })}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Klinik Seçiniz</option>
                                        {clinics.map((clinic) => (
                                            <option key={clinic.id} value={clinic.id}>
                                                {clinic.name}
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
                                        disabled={!formData.clinicId}
                                    >
                                        <option value="">
                                            {formData.clinicId ? 'Doktor Seçiniz' : 'Önce Klinik Seçiniz'}
                                        </option>
                                        {filteredDoctors.map((doctor) => (
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
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                                        required
                                    />
                                </div>
                            </div>

                            {formData.date && formData.doctorId && (
                                <div className="form-group">
                                    <label>Müsait Saatler</label>
                                    {loadingSlots ? (
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Saatler yükleniyor...</div>
                                    ) : availableSlots.length === 0 ? (
                                        <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>Seçilen tarihte uygun saat bulunmuyor.</div>
                                    ) : (
                                        <div className="slots-grid" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                            gap: '10px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '5px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}>
                                            {availableSlots.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, time })}
                                                    className={`slot-btn ${formData.time === time ? 'selected' : ''}`}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: formData.time === time ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                        background: formData.time === time ? '#eff6ff' : '#fff',
                                                        color: formData.time === time ? '#1d4ed8' : '#334155',
                                                        cursor: 'pointer',
                                                        fontWeight: formData.time === time ? '600' : '400'
                                                    }}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-row" style={{ display: 'none' }}>
                                <div className="form-group">
                                    <label>Saat (Gizli)</label>
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
                                {editingAppointmentId ? 'Güncelle' : 'Randevu Oluştur'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>Henüz randevunuz yok</h3>
                        <p>Yeni bir randevu oluşturmak için yukarıdaki butonu kullanın.</p>
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
                                    {apt.status === 'pending' && (
                                        <div className="appointment-actions">
                                            <button
                                                onClick={() => handleEditAppointment(apt)}
                                                className="btn-edit-appointment"
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleCancelAppointment(apt.id)}
                                                className="btn-cancel-appointment"
                                            >
                                                İptal Et
                                            </button>
                                        </div>
                                    )}
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
