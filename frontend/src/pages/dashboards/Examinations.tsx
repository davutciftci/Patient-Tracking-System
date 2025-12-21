import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllExaminations, createExamination, deleteExamination, getAiSuggestions } from '../../api/client';
import './Dashboard.css';

interface Examination {
    id: number;
    appointmentId: number;
    doctorId: number;
    diagnosis: string;
    treatment: string;
    notes: string;
}

const Examinations = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [examinations, setExaminations] = useState<Examination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        appointmentId: '',
        diagnosis: '',
        treatment: '',
        notes: ''
    });

    useEffect(() => {
        fetchExaminations();
        if (location.state?.appointmentId) {
            setFormData(prev => ({ ...prev, appointmentId: location.state.appointmentId }));
            setShowForm(true);
        }
    }, [location.state]);

    const handleAskAI = async () => {
        if (!formData.notes) return;

        try {
            setLoading(true);
            const response = await getAiSuggestions(formData.notes);
            if (response.data) {
                setFormData(prev => ({
                    ...prev,
                    diagnosis: response.data.diagnosis,
                    treatment: response.data.treatment
                }));
            }
        } catch (err: any) {
            setError('AI önerisi alınamadı: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchExaminations = async () => {
        try {
            setLoading(true);
            const response = await getAllExaminations();
            setExaminations(response.data?.examinations || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Muayeneler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExamination({
                appointmentId: parseInt(formData.appointmentId),
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                notes: formData.notes
            });
            setShowForm(false);
            setFormData({ appointmentId: '', diagnosis: '', treatment: '', notes: '' });
            fetchExaminations();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Muayene oluşturulamadı');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu muayene kaydını silmek istediğinizden emin misiniz?')) {
            try {
                await deleteExamination(id);
                fetchExaminations();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Muayene silinemedi');
            }
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
                    <h1>Muayene Kayıtları</h1>
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
                        {showForm ? 'İptal' : '+ Yeni Muayene'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h3>Yeni Muayene Kaydı</h3>
                        <div className="ai-assistant-tip">
                            💡 İpucu: Şikayetleri "Notlar" kısmına yazıp "🤖 AI'ya Sor" butonuna basarak teşhis önerisi alabilirsiniz.
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Randevu ID</label>
                                <input
                                    type="number"
                                    value={formData.appointmentId}
                                    onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                                    required
                                    placeholder="Randevu numarası"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tanı</label>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    required
                                    placeholder="Hastanın tanısı"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tedavi</label>
                                <textarea
                                    value={formData.treatment}
                                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    required
                                    placeholder="Uygulanan tedavi"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notlar / Şikayetler</label>
                                <div className="input-with-button">
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Hasta şikayetlerini buraya yazın..."
                                        rows={3}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAskAI}
                                        className="ai-btn"
                                        disabled={!formData.notes}
                                        title="Yapay zeka önerisi al"
                                    >
                                        🤖 AI'ya Sor
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">
                                Kaydet
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : examinations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Henüz muayene kaydı yok</h3>
                        <p>Yeni bir muayene kaydı oluşturmak için yukarıdaki butonu kullanın.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Randevu ID</th>
                                    <th>Tanı</th>
                                    <th>Tedavi</th>
                                    <th>Notlar</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examinations.map((exam) => (
                                    <tr key={exam.id}>
                                        <td>{exam.id}</td>
                                        <td>{exam.appointmentId}</td>
                                        <td>{exam.diagnosis}</td>
                                        <td>{exam.treatment}</td>
                                        <td>{exam.notes || '-'}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(exam.id)}
                                                className="delete-btn"
                                            >
                                                🗑️
                                            </button>
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

export default Examinations;
