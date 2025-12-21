import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Doktor Paneli</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="welcome-card">
                    <div className="welcome-icon doctor-icon">{user?.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}</div>
                    <h2>Hoş Geldiniz, Dr. {user?.firstName || 'Doktor'}!</h2>
                    <p>Doktor paneline başarıyla giriş yaptınız.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card" onClick={() => navigate('/appointments')}>
                        <div className="card-icon">📅</div>
                        <h3>Randevular</h3>
                        <p>Randevularınızı yönetin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">👥</div>
                        <h3>Hastalarım</h3>
                        <p>Kayıtlı hastalarınızı görüntüleyin</p>
                    </div>

                    <div className="dashboard-card" onClick={() => navigate('/examinations')}>
                        <div className="card-icon">📝</div>
                        <h3>Muayene Kayıtları</h3>
                        <p>Muayene geçmişini yönetin</p>
                    </div>

                    <div className="dashboard-card" onClick={() => navigate('/profile')}>
                        <div className="card-icon">⚙️</div>
                        <h3>Profil Ayarları</h3>
                        <p>Kişisel bilgilerinizi güncelleyin</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
