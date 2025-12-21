import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const SecretaryDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Sekreter Paneli</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                <div className="welcome-card">
                    <div className="welcome-icon secretary-icon">{user?.gender === 'female' ? '👩‍💼' : '👨‍💼'}</div>
                    <h2>Hoş Geldiniz, {user?.firstName || 'Sekreter'}!</h2>
                    <p>Sekreter paneline başarıyla giriş yaptınız.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card" onClick={() => navigate('/appointments')}>
                        <div className="card-icon">📅</div>
                        <h3>Randevu Yönetimi</h3>
                        <p>Randevuları oluşturun ve yönetin</p>
                    </div>

                    <div className="dashboard-card" onClick={() => navigate('/patients')}>
                        <div className="card-icon">👥</div>
                        <h3>Hasta Kayıt</h3>
                        <p>Yeni hasta kaydı oluşturun</p>
                    </div>



                    <div className="dashboard-card" onClick={() => navigate('/clinics')}>
                        <div className="card-icon">🏥</div>
                        <h3>Klinik Bilgileri</h3>
                        <p>Klinikleri yönetin</p>
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

export default SecretaryDashboard;
