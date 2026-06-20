import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, Pill, Calendar, Users, X } from 'lucide-react';
import api from '../services/api';

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        patients: [],
        consultations: [],
        prescriptions: [],
        users: [],
        appointments: []
    });
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [flatResults, setFlatResults] = useState([]);
    
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage on mount
    const [recentSearches, setRecentSearches] = useState([]);
    useEffect(() => {
        const stored = localStorage.getItem('clinops_recent_searches');
        if (stored) setRecentSearches(JSON.parse(stored));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
            setResults({ patients: [], consultations: [], prescriptions: [], users: [], appointments: [] });
            setActiveIndex(-1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ patients: [], consultations: [], prescriptions: [], users: [], appointments: [] });
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/search?q=${query}`);
                setResults(res.data);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    useEffect(() => {
        // Flatten results for keyboard navigation
        const flat = [];
        if (results.patients?.length) results.patients.forEach(p => flat.push({ ...p, _category: 'patients', _path: `/medecin/patients/${p.id}` }));
        if (results.appointments?.length) results.appointments.forEach(a => flat.push({ ...a, _category: 'appointments', _path: `/secretaire/agenda` }));
        if (results.consultations?.length) results.consultations.forEach(c => flat.push({ ...c, _category: 'consultations', _path: `/medecin/patients/${c.patient_id}` }));
        if (results.prescriptions?.length) results.prescriptions.forEach(p => flat.push({ ...p, _category: 'prescriptions', _path: `/medecin/patients/${p.patient_id}` }));
        if (results.users?.length) results.users.forEach(u => flat.push({ ...u, _category: 'users', _path: `/admin/users` })); // Assuming admin path
        
        setFlatResults(flat);
        setActiveIndex(-1);
    }, [results]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && flatResults[activeIndex]) {
                handleSelect(flatResults[activeIndex]);
            } else if (query.trim() && flatResults.length > 0) {
                handleSelect(flatResults[0]); // Select first by default if hit enter
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item) => {
        // Save to recent
        const newRecent = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('clinops_recent_searches', JSON.stringify(newRecent));
        
        onClose();
        navigate(item._path);
    };

    const highlightText = (text, highlight) => {
        if (!highlight || !text) return text;
        const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === highlight.toLowerCase() ? 
                <span key={index} className="bg-[var(--color-primary)]/30 text-[var(--color-primary)] px-0.5 rounded">{part}</span> : part
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/85 backdrop-blur-sm animate-fade-in px-4">
            <div 
                className="w-full max-w-[600px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-4 border-b border-[var(--color-border)]">
                    <Search className="text-[var(--color-text-muted)] mr-3" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher patients, ordonnances, RDV... (Ctrl+K)"
                        className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-[var(--color-text-muted)]"
                    />
                    <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white p-1 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {query.length < 2 ? (
                        <div className="p-6">
                            {recentSearches.length > 0 && (
                                <>
                                    <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Recherches Récentes</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((s, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setQuery(s)}
                                                className="px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : flatResults.length === 0 ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)]">
                            <p>Aucun résultat trouvé pour "{query}"</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Patients */}
                            {results.patients?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-tertiary)]/50 flex items-center">
                                        <User size={14} className="mr-2" /> PATIENTS
                                    </h3>
                                    {results.patients.map((item, idx) => {
                                        const flatIndex = flatResults.findIndex(f => f.id === item.id && f._category === 'patients');
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => handleSelect(flatResults[flatIndex])}
                                                className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${activeIndex === flatIndex ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            >
                                                <div className="font-medium text-white">{highlightText(`${item.first_name} ${item.last_name}`, query)}</div>
                                                <div className="text-xs text-[var(--color-text-secondary)] mt-1">CIN: {highlightText(item.social_security_number, query)} | Tél: {highlightText(item.phone, query)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Appointments */}
                            {results.appointments?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-tertiary)]/50 flex items-center">
                                        <Calendar size={14} className="mr-2" /> RENDEZ-VOUS
                                    </h3>
                                    {results.appointments.map((item) => {
                                        const flatIndex = flatResults.findIndex(f => f.id === item.id && f._category === 'appointments');
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => handleSelect(flatResults[flatIndex])}
                                                className={`px-4 py-3 cursor-pointer border-l-4 transition-colors flex justify-between items-center ${activeIndex === flatIndex ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            >
                                                <div>
                                                    <div className="font-medium text-white">{highlightText(`${item.patient?.first_name} ${item.patient?.last_name}`, query)}</div>
                                                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">Dr. {highlightText(item.doctor?.last_name, query)}</div>
                                                </div>
                                                <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-2 py-1 rounded">
                                                    {new Date(item.date_heure).toLocaleString('fr-FR')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Consultations */}
                            {results.consultations?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-tertiary)]/50 flex items-center">
                                        <FileText size={14} className="mr-2" /> CONSULTATIONS
                                    </h3>
                                    {results.consultations.map((item) => {
                                        const flatIndex = flatResults.findIndex(f => f.id === item.id && f._category === 'consultations');
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => handleSelect(flatResults[flatIndex])}
                                                className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${activeIndex === flatIndex ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            >
                                                <div className="font-medium text-white">{item.patient?.first_name} {item.patient?.last_name}</div>
                                                <div className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">
                                                    Motif: {highlightText(item.motif, query)} | Diag: {highlightText(item.diagnostic, query)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Prescriptions */}
                            {results.prescriptions?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-tertiary)]/50 flex items-center">
                                        <Pill size={14} className="mr-2" /> ORDONNANCES
                                    </h3>
                                    {results.prescriptions.map((item) => {
                                        const flatIndex = flatResults.findIndex(f => f.id === item.id && f._category === 'prescriptions');
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => handleSelect(flatResults[flatIndex])}
                                                className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${activeIndex === flatIndex ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            >
                                                <div className="font-medium text-white">{item.patient?.first_name} {item.patient?.last_name}</div>
                                                <div className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">
                                                    Médicaments: {highlightText(item.medications, query)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Users */}
                            {results.users?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-tertiary)]/50 flex items-center">
                                        <Users size={14} className="mr-2" /> UTILISATEURS (STAFF)
                                    </h3>
                                    {results.users.map((item) => {
                                        const flatIndex = flatResults.findIndex(f => f.id === item.id && f._category === 'users');
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => handleSelect(flatResults[flatIndex])}
                                                className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${activeIndex === flatIndex ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            >
                                                <div className="font-medium text-white">{highlightText(`${item.first_name} ${item.last_name}`, query)} <span className="text-xs text-[var(--color-text-muted)] ml-2 bg-[var(--color-bg-primary)] px-2 py-0.5 rounded">{item.role?.name}</span></div>
                                                <div className="text-xs text-[var(--color-text-secondary)] mt-1">{highlightText(item.email, query)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                    <div className="flex space-x-4">
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">↓</kbd> Naviguer</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">Enter</kbd> Ouvrir</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">Esc</kbd> Fermer</span>
                    </div>
                </div>
            </div>
            {/* Dark overlay click to close handled by parent or standard z-index */}
        </div>
    );
};

export default GlobalSearch;
