import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Hasta Paneli</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="welcome-card">
                    <div className="welcome-icon patient-icon">{user?.gender === 'female' ? '👩' : '👨'}</div>
                    <h2>Hoş Geldiniz, {user?.firstName || 'Hasta'}!</h2>
                    <p>Hasta paneline başarıyla giriş yaptınız.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3>Randevularım</h3>
                        <p>Yaklaşan randevularınızı görüntüleyin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📋</div>
                        <h3>Muayene Geçmişi</h3>
                        <p>Geçmiş muayenelerinizi inceleyin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">👨‍⚕️</div>
                        <h3>Doktorum</h3>
                        <p>Doktor bilgilerinizi görüntüleyin</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">⚙️</div>
                        <h3>Profil Ayarları</h3>
                        <p>Kişisel bilgilerinizi güncelleyin</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
