import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, updateMe } from '../../api/client';
import './Dashboard.css';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    gender: string;
    createdAt: string;
    roleData: any;
}

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        phoneNumber: '',
        birthDate: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getMe();
            // API returns { status: "success", user: {...} }
            // axios wraps this in response.data
            const userData = response.user || response.data?.user;
            console.log('API response:', response);
            console.log('User data:', userData);
            console.log('Gender value:', userData?.gender);
            setProfile(userData || null);
            if (userData) {
                const nameParts = userData.name?.split(' ') || [];
                setFormData({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: userData.email || '',
                    address: '',
                    phoneNumber: '',
                    birthDate: ''
                });
            }
        } catch (err: any) {
            console.error('Profile fetch error:', err);
            setError(err.response?.data?.message || 'Profil yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe(formData);
            setSuccessMessage('Profil başarıyla güncellendi!');
            setIsEditing(false);
            fetchProfile();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Profil güncellenemedi');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            doctor: 'Doktor',
            patient: 'Hasta',
            secretary: 'Sekreter'
        };
        return labels[role] || role;
    };

    const getRoleIcon = (role: string, gender?: string) => {
        const isFemale = gender === 'female';
        const icons: Record<string, { male: string; female: string }> = {
            doctor: { male: '👨‍⚕️', female: '👩‍⚕️' },
            patient: { male: '👨', female: '👩' },
            secretary: { male: '👨‍💼', female: '👩‍💼' }
        };
        const roleIcons = icons[role];
        if (!roleIcons) return '👤';
        return isFemale ? roleIcons.female : roleIcons.male;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Profilim</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : profile ? (
                    <div className="profile-container">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {getRoleIcon(profile.role, profile.gender)}
                            </div>
                            <div className="profile-info">
                                <h2>{profile.name}</h2>
                                <span className="role-badge">{getRoleLabel(profile.role)}</span>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="profile-details">
                                <div className="detail-item">
                                    <span className="detail-label">📧 Email</span>
                                    <span className="detail-value">{profile.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">📅 Kayıt Tarihi</span>
                                    <span className="detail-value">
                                        {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                {profile.roleData && (
                                    <div className="detail-item">
                                        <span className="detail-label">ℹ️ Rol Bilgisi</span>
                                        <span className="detail-value">
                                            {profile.role === 'doctor' && profile.roleData.speciality &&
                                                `Uzmanlık: ${profile.roleData.speciality}`}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="action-btn primary"
                                    style={{ marginTop: '20px' }}
                                >
                                    ✏️ Profili Düzenle
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ad</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Soyad</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Adres</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="submit-btn">
                                        💾 Kaydet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="cancel-btn"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>Profil bulunamadı</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
