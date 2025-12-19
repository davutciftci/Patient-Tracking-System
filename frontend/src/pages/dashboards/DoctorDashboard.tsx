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
                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3>Bugünkü Randevular</h3>
                        <p>Bugünkü hasta randevularınız</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">👥</div>
                        <h3>Hastalarım</h3>
                        <p>Kayıtlı hastalarınızı görüntüleyin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📝</div>
                        <h3>Muayene Kayıtları</h3>
                        <p>Muayene geçmişini yönetin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📊</div>
                        <h3>İstatistikler</h3>
                        <p>Hasta ve randevu istatistikleri</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
