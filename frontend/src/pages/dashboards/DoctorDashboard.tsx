import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointmentsAsDoctor, getPatientsByDoctor, getMe } from '../../api/client';
import './Dashboard.css';

const DoctorDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayCount: 0,
        pendingCount: 0,
        totalPatients: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [doctorName, setDoctorName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await getMe();
            const userProfile = response.user || response; 
            setDoctorName(`Dr. ${userProfile.firstName} ${userProfile.lastName}`);
            const doctorId = userProfile.roleData?.id;

            if (doctorId) {
                
                const appointmentsRes = await getMyAppointmentsAsDoctor(doctorId);
                const appointments = appointmentsRes.appointments || [];

                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppts = appointments.filter((app: any) => {
                    const appDate = new Date(app.date);
                    return appDate >= today && appDate < tomorrow;
                });

                const pendingAppts = appointments.filter((app: any) => app.status === 'pending');

                
                const futureAppts = appointments
                    .filter((app: any) => new Date(app.date) >= new Date())
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5);

                setUpcomingAppointments(futureAppts);

                
                const patientsRes = await getPatientsByDoctor(doctorId);

                setStats({
                    todayCount: todayAppts.length,
                    pendingCount: pendingAppts.length,
                    totalPatients: patientsRes.patients?.length || 0
                });
            }
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Doktor Paneli</h1>
                    <p className="welcome-text">Hoş geldiniz, {doctorName}</p>
                </div>
                <div className="header-right">
                    <button onClick={() => navigate('/profile')} className="profile-btn">
                        👤 Profil & Ayarlar
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        Çıkış Yap
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Bugünkü Randevular</h3>
                            <div className="stat-value">{loading ? '...' : stats.todayCount}</div>
                        </div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>Bekleyen Onaylar</h3>
                            <div className="stat-value">{loading ? '...' : stats.pendingCount}</div>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Toplam Hasta</h3>
                            <div className="stat-value">{loading ? '...' : stats.totalPatients}</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {}
                    <div className="dashboard-column left">
                        <section className="dashboard-section">
                            <h2>Hızlı İşlemler</h2>
                            <div className="action-cards">
                                <div className="dashboard-card" onClick={() => navigate('/doctor-appointments')}>
                                    <div className="card-icon">📅</div>
                                    <h3>Randevuları Yönet</h3>
                                    <p>Tüm randevuları görüntüleyin ve düzenleyin</p>
                                </div>

                                <div className="dashboard-card" onClick={() => navigate('/my-patients')}>
                                    <div className="card-icon">👥</div>
                                    <h3>Hastalarım</h3>
                                    <p>Hasta listesi ve detayları</p>
                                </div>

                                <div className="dashboard-card" onClick={() => navigate('/examinations')}>
                                    <div className="card-icon">📝</div>
                                    <h3>Muayene Geçmişi</h3>
                                    <p>Muayene geçmişini yönetin</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {}
                    <div className="dashboard-column right">
                        <section className="dashboard-section">
                            <h2>Yaklaşan Randevular</h2>
                            {loading ? (
                                <div className="loading">Yükleniyor...</div>
                            ) : upcomingAppointments.length === 0 ? (
                                <p className="empty-text">Yaklaşan randevu bulunmuyor.</p>
                            ) : (
                                <div className="upcoming-list">
                                    {upcomingAppointments.map((app) => (
                                        <div key={app.id} className={`upcoming-item ${app.type === 'emergency' ? 'emergency' : ''}`}>
                                            <div className="upcoming-time">
                                                {new Date(app.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="upcoming-info">
                                                <h4>{app.patient?.user?.firstName} {app.patient?.user?.lastName}</h4>
                                                <p>{formatDate(app.date)}</p>
                                                {app.type === 'emergency' && <span className="badge emergency">ACİL</span>}
                                            </div>
                                            <div className={`status-badge ${app.status}`}>
                                                {app.status === 'pending' ? 'Bekliyor' :
                                                    app.status === 'confirmed' ? 'Onaylı' :
                                                        app.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                                            </div>
                                        </div>
                                    ))}
                                    <button className="view-all-btn" onClick={() => navigate('/doctor-appointments')}>
                                        Tümünü Gör →
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
