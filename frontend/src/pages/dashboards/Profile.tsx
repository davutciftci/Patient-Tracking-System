import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, updateMe, changePassword } from '../../api/client';
import './Dashboard.css';

interface UserProfile {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    birthDate: string;
    role: string;
    gender: string;
    createdAt: string;
    roleData: any;
    notifySms: boolean;
    notifyEmail: boolean;
    notifyApp: boolean;
    emergencyName: string | null;
    emergencyPhone: string | null;
    emergencyRelation: string | null;
    doctorSettings?: {
        speciality: string;
        workingDays: string;
        workingHourStart: string;
        workingHourEnd: string;
        appointmentDuration: number;
    };
}

type TabType = 'profile' | 'password' | 'notifications' | 'emergency' | 'settings';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', address: '', phoneNumber: '', birthDate: '', speciality: ''
    });


    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });


    const [notificationData, setNotificationData] = useState({ notifySms: true, notifyEmail: true, notifyApp: true });


    const [emergencyData, setEmergencyData] = useState({ emergencyName: '', emergencyPhone: '', emergencyRelation: '' });
    const [isEditingEmergency, setIsEditingEmergency] = useState(false);


    const [doctorSettingsData, setDoctorSettingsData] = useState({
        workingDays: '1,2,3,4,5',
        workingHourStart: '09:00',
        workingHourEnd: '17:00',
        appointmentDuration: 15,
        dailySlots: ''
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getMe();
            const userData = response.user || response.data?.user;
            setProfile(userData || null);
            if (userData) {
                setFormData({
                    firstName: userData.firstName || '', lastName: userData.lastName || '',
                    email: userData.email || '', address: userData.address || '',
                    phoneNumber: userData.phoneNumber || '',
                    birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '',
                    speciality: userData.role === 'doctor' ? userData.roleData?.speciality || '' : ''
                });
                setNotificationData({
                    notifySms: userData.notifySms ?? true,
                    notifyEmail: userData.notifyEmail ?? true,
                    notifyApp: userData.notifyApp ?? true
                });
                setEmergencyData({
                    emergencyName: userData.emergencyName || '',
                    emergencyPhone: userData.emergencyPhone || '',
                    emergencyRelation: userData.emergencyRelation || ''
                });

                if (userData.role === 'doctor') {


                    const settings = userData.doctorSettings || {};
                    setDoctorSettingsData({
                        workingDays: settings.workingDays || '1,2,3,4,5',
                        workingHourStart: settings.workingHourStart || '09:00',
                        workingHourEnd: settings.workingHourEnd || '17:00',
                        appointmentDuration: settings.appointmentDuration || 15,
                        dailySlots: settings.dailySlots || ''
                    });
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Profil yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe(formData);
            showSuccess('Profil güncellendi!');
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Profil güncellenemedi');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Yeni şifreler eşleşmiyor');
            return;
        }
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            showSuccess('Şifre değiştirildi!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Şifre değiştirilemedi');
        }
    };

    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe(notificationData);
            showSuccess('Bildirim tercihleri güncellendi!');
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tercihler güncellenemedi');
        }
    };

    const handleEmergencySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe(emergencyData);
            showSuccess('Acil durum kişisi güncellendi!');
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Bilgiler güncellenemedi');
        }
    };

    const handleDoctorSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMe({
                workingDays: doctorSettingsData.workingDays,
                workingHourStart: doctorSettingsData.workingHourStart,
                workingHourEnd: doctorSettingsData.workingHourEnd,
                appointmentDuration: Number(doctorSettingsData.appointmentDuration),
                dailySlots: doctorSettingsData.dailySlots
            });
            showSuccess('Muayene ayarları güncellendi!');
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ayarlar güncellenemedi');
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getRoleLabel = (role: string) => ({ doctor: 'Doktor', patient: 'Hasta', secretary: 'Sekreter' }[role] || role);

    const getRoleIcon = (role: string, gender?: string) => {
        const isFemale = gender === 'female';
        const icons: Record<string, { male: string; female: string }> = {
            doctor: { male: '👨‍⚕️', female: '👩‍⚕️' },
            patient: { male: '👨', female: '👩' },
            secretary: { male: '👨‍💼', female: '👩‍💼' }
        };
        return icons[role] ? (isFemale ? icons[role].female : icons[role].male) : '👤';
    };

    const tabs = [
        { id: 'profile' as TabType, label: '👤 Profil', icon: '👤' },
        { id: 'password' as TabType, label: '🔒 Şifre', icon: '🔒' },
        { id: 'notifications' as TabType, label: '🔔 Bildirimler', icon: '🔔' },
        { id: 'emergency' as TabType, label: '🚨 Acil Durum', icon: '🚨' }
    ];

    if (profile?.role === 'doctor') {
        tabs.push({ id: 'settings' as TabType, label: '🩺 Ayarlar', icon: '🩺' });
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">← Geri</button>
                    <h1>Profilim</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : profile ? (
                    <div className="profile-container" style={{ maxWidth: '800px' }}>
                        <div className="profile-header">
                            <div className="profile-avatar">{getRoleIcon(profile.role, profile.gender)}</div>
                            <div className="profile-info">
                                <h2>{profile.name}</h2>
                                <span className="role-badge">{getRoleLabel(profile.role)}</span>
                            </div>
                        </div>

                        { }
                        <div className="profile-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => { setActiveTab(tab.id); setError(''); }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        { }
                        {activeTab === 'profile' && (
                            !isEditing ? (
                                <div className="profile-details">
                                    <div className="detail-item"><span className="detail-label">📧 Email</span><span className="detail-value">{profile.email}</span></div>
                                    <div className="detail-item"><span className="detail-label">📞 Telefon</span><span className="detail-value">{profile.phoneNumber || 'Belirtilmemiş'}</span></div>
                                    <div className="detail-item"><span className="detail-label">📍 Adres</span><span className="detail-value">{profile.address || 'Belirtilmemiş'}</span></div>
                                    <div className="detail-item"><span className="detail-label">🎂 Doğum Tarihi</span><span className="detail-value">{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</span></div>
                                    <button onClick={() => setIsEditing(true)} className="action-btn primary" style={{ marginTop: '20px' }}>✏️ Düzenle</button>
                                </div>
                            ) : (
                                <form onSubmit={handleProfileSubmit} className="profile-form">
                                    <div className="form-row">
                                        <div className="form-group"><label>Ad</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></div>
                                        <div className="form-group"><label>Soyad</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                                    <div className="form-group"><label>Adres</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                                    <div className="form-group"><label>Telefon</label><input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
                                    <div className="form-group"><label>Doğum Tarihi</label><input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} /></div>
                                    <div className="button-group">
                                        <button type="submit" className="submit-btn">💾 Kaydet</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">İptal</button>
                                    </div>
                                </form>
                            )
                        )}

                        { }
                        {activeTab === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="profile-form">
                                <div className="form-group"><label>Mevcut Şifre</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required /></div>
                                <div className="form-group"><label>Yeni Şifre</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={6} /></div>
                                <div className="form-group"><label>Yeni Şifre (Tekrar)</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required /></div>
                                <button type="submit" className="submit-btn">🔒 Şifreyi Değiştir</button>
                            </form>
                        )}

                        { }
                        {activeTab === 'notifications' && (
                            <form onSubmit={handleNotificationSubmit} className="profile-form">
                                <div className="notification-options">
                                    <label className="toggle-label">
                                        <input type="checkbox" checked={notificationData.notifySms} onChange={(e) => setNotificationData({ ...notificationData, notifySms: e.target.checked })} />
                                        <span>📱 SMS Bildirimleri</span>
                                    </label>
                                    <label className="toggle-label">
                                        <input type="checkbox" checked={notificationData.notifyEmail} onChange={(e) => setNotificationData({ ...notificationData, notifyEmail: e.target.checked })} />
                                        <span>📧 E-posta Bildirimleri</span>
                                    </label>
                                    <label className="toggle-label">
                                        <input type="checkbox" checked={notificationData.notifyApp} onChange={(e) => setNotificationData({ ...notificationData, notifyApp: e.target.checked })} />
                                        <span>🔔 Uygulama Bildirimleri</span>
                                    </label>
                                </div>
                                <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>💾 Tercihleri Kaydet</button>
                            </form>
                        )}

                        { }
                        {activeTab === 'emergency' && (
                            profile.emergencyName && !isEditingEmergency ? (
                                <div className="profile-details">
                                    <h4 style={{ marginBottom: '16px', color: '#dc2626' }}>🚨 Acil Durum Kişisi Bilgileri</h4>
                                    <div className="detail-item"><span className="detail-label">👤 Kişi Adı</span><span className="detail-value">{profile.emergencyName}</span></div>
                                    <div className="detail-item"><span className="detail-label">📞 Telefon</span><span className="detail-value">{profile.emergencyPhone}</span></div>
                                    <div className="detail-item"><span className="detail-label">👥 Yakınlık</span><span className="detail-value">{profile.emergencyRelation}</span></div>
                                    <button onClick={() => setIsEditingEmergency(true)} className="action-btn primary" style={{ marginTop: '20px' }}>✏️ Düzenle</button>
                                </div>
                            ) : (
                                <form onSubmit={(e) => { handleEmergencySubmit(e); setIsEditingEmergency(false); }} className="profile-form">
                                    <h4 style={{ marginBottom: '16px', color: '#dc2626' }}>{profile.emergencyName ? '🚨 Acil Durum Kişisini Düzenle' : '🚨 Acil Durum Kişisi Ekle'}</h4>
                                    <div className="form-group"><label>Kişi Adı</label><input type="text" value={emergencyData.emergencyName} onChange={(e) => setEmergencyData({ ...emergencyData, emergencyName: e.target.value })} placeholder="Örn: Ahmet Yılmaz" required /></div>
                                    <div className="form-group"><label>Telefon Numarası</label><input type="tel" value={emergencyData.emergencyPhone} onChange={(e) => setEmergencyData({ ...emergencyData, emergencyPhone: e.target.value })} placeholder="Örn: 0532 123 45 67" required /></div>
                                    <div className="form-group"><label>Yakınlık Derecesi</label><input type="text" value={emergencyData.emergencyRelation} onChange={(e) => setEmergencyData({ ...emergencyData, emergencyRelation: e.target.value })} placeholder="Örn: Eş, Anne, Kardeş" required /></div>
                                    <div className="button-group">
                                        <button type="submit" className="submit-btn">💾 Kaydet</button>
                                        {profile.emergencyName && <button type="button" onClick={() => setIsEditingEmergency(false)} className="cancel-btn">İptal</button>}
                                    </div>
                                </form>
                            )
                        )}

                        { }
                        {activeTab === 'settings' && (
                            <form onSubmit={handleDoctorSettingsSubmit} className="profile-form">

                                <div className="form-group">
                                    <label>Çalışma Günleri</label>
                                    <div className="days-selection" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {[
                                            { id: '1', label: 'Pzt' }, { id: '2', label: 'Sal' }, { id: '3', label: 'Çar' },
                                            { id: '4', label: 'Per' }, { id: '5', label: 'Cum' }, { id: '6', label: 'Cmt' }, { id: '7', label: 'Paz' }
                                        ].map(day => (
                                            <label key={day.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={doctorSettingsData.workingDays.split(',').includes(day.id)}
                                                    onChange={(e) => {
                                                        const current = doctorSettingsData.workingDays.split(',').filter(d => d);
                                                        let next;
                                                        if (e.target.checked) {
                                                            next = [...current, day.id].sort();
                                                        } else {
                                                            next = current.filter(d => d !== day.id);
                                                        }
                                                        setDoctorSettingsData({ ...doctorSettingsData, workingDays: next.join(',') });
                                                    }}
                                                />
                                                {day.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                { }
                                <div className="form-group">
                                    <label>Randevu Saatleri</label>
                                    <div className="slots-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px' }}>
                                        { }
                                        {Array.from({ length: 20 }, (_, i) => {
                                            const baseTime = new Date();
                                            baseTime.setHours(8, 0, 0, 0);
                                            baseTime.setMinutes(baseTime.getMinutes() + (i * 30));
                                            const timeStr = baseTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                            if (baseTime.getHours() >= 18) return null;


                                            const isSelected = doctorSettingsData.dailySlots.split(',').includes(timeStr);

                                            return (
                                                <label key={timeStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '5px', background: isSelected ? '#eff6ff' : '#f8fafc', border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '6px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const current = doctorSettingsData.dailySlots.split(',').filter(s => s);
                                                            let next;
                                                            if (e.target.checked) {
                                                                next = [...current, timeStr].sort();
                                                            } else {
                                                                next = current.filter(s => s !== timeStr);
                                                            }
                                                            setDoctorSettingsData({ ...doctorSettingsData, dailySlots: next.join(',') });
                                                        }}
                                                        style={{ marginBottom: '4px' }}
                                                    />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '600' : '400', color: isSelected ? '#1d4ed8' : '#64748b' }}>{timeStr}</span>
                                                </label>
                                            );
                                        }).filter(Boolean)}
                                    </div>
                                    <small style={{ color: '#64748b' }}>Hepsini Seç / Temizle işlemleri için yukarıdaki kutucukları kullanın.</small>
                                </div>

                                <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>💾 Ayarları Kaydet</button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="empty-state"><div className="empty-icon">👤</div><h3>Profil bulunamadı</h3></div>
                )
                }
            </main >
        </div >
    );
};

export default Profile;
