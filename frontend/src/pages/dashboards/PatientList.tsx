import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients, register as apiRegister } from '../../api/client';
import './Dashboard.css';
import '../Auth.css';

interface Patient {
    id: number;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        tc_no: string;
        phoneNumber: string;
        birthDate: string;
        gender: string;
    };
}

const PatientList = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient' as const,
        gender: 'male' as 'male' | 'female',
        tc_no: '',
        address: '',
        phoneNumber: '',
        birthDate: '',
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await getAllPatients();
            setPatients(response.patients || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Hastalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            await apiRegister(registerData);
            alert('Hasta kaydı başarıyla oluşturuldu.');
            setShowForm(false);
            setFormData({
                firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
                role: 'patient', gender: 'male', tc_no: '', address: '', phoneNumber: '', birthDate: ''
            });
            fetchPatients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kayıt yapılamadı');
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
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Geri
                    </button>
                    <h1>Hasta Yönetimi</h1>
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
                        {showForm ? 'İptal' : '+ Yeni Hasta Kaydı'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {}
                {showForm && (
                    <div className="form-card">
                        <h3>Yeni Hasta Kaydı</h3>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ad</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleRegisterChange} required placeholder="Ad" />
                                </div>
                                <div className="form-group">
                                    <label>Soyad</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleRegisterChange} required placeholder="Soyad" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleRegisterChange} required placeholder="Email" />
                                </div>
                                <div className="form-group">
                                    <label>TC No</label>
                                    <input name="tc_no" value={formData.tc_no} onChange={handleRegisterChange} required placeholder="TC Kimlik No" maxLength={11} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleRegisterChange} required placeholder="0555..." />
                                </div>
                                <div className="form-group">
                                    <label>Doğum Tarihi</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cinsiyet</label>
                                    <select name="gender" value={formData.gender} onChange={handleRegisterChange} className="form-select">
                                        <option value="male">Erkek</option>
                                        <option value="female">Kadın</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Adres</label>
                                    <input name="address" value={formData.address} onChange={handleRegisterChange} required placeholder="Adres" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Şifre (Geçici)</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleRegisterChange} required placeholder="******" minLength={6} />
                                </div>
                                <div className="form-group">
                                    <label>Şifre Tekrar</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleRegisterChange} required placeholder="******" minLength={6} />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Henüz kayıtlı hasta yok</h3>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ad Soyad</th>
                                    <th>TC No</th>
                                    <th>İletişim</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>{patient.id}</td>
                                        <td>
                                            {patient.user.firstName} {patient.user.lastName}
                                            <small style={{ display: 'block', color: '#666' }}>{patient.user.gender === 'female' ? 'Kadın' : 'Erkek'}, {new Date(patient.user.birthDate).toLocaleDateString()}</small>
                                        </td>
                                        <td>{patient.user.tc_no}</td>
                                        <td>
                                            <div>📧 {patient.user.email}</div>
                                            <div>📱 {patient.user.phoneNumber}</div>
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

export default PatientList;
