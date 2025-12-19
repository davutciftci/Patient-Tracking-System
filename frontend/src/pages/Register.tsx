import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/client';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient' as 'patient' | 'doctor' | 'secretary',
        gender: 'male' as 'male' | 'female',
        tc_no: '',
        address: '',
        phoneNumber: '',
        birthDate: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await apiRegister(registerData);
            alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
            navigate('/login', { state: { message: 'Kayıt başarılı! Giriş yapabilirsiniz.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kayıt yapılamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>Hasta Takip Sistemi</h1>
                    <p>Yeni hesap oluşturun</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">Ad</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Adınız"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Soyad</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Soyadınız"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tc_no">TC Kimlik No</label>
                        <input
                            type="text"
                            id="tc_no"
                            name="tc_no"
                            value={formData.tc_no}
                            onChange={handleChange}
                            placeholder="12345678901"
                            maxLength={11}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Rol</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="patient">Hasta</option>
                            <option value="doctor">Doktor</option>
                            <option value="secretary">Sekreter</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Cinsiyet</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Telefon</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="05551234567"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Adres</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Şehir, İlçe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthDate">Doğum Tarihi</label>
                        <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Şifre Tekrar</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
