import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NewMessageModal = ({ isOpen, onClose, onMessageSent, replyTo = null }) => {
    const [recipientQuery, setRecipientQuery] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [priority, setPriority] = useState('normal');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRecipientQuery('');
            setRecipients([]);
            setSelectedRecipient(null);
            setSubject('');
            setBody('');
            setPriority('normal');

            if (replyTo) {
                // If replying, pre-fill recipient and subject
                setSelectedRecipient(replyTo.sender);
                setSubject(replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
            }
        }
    }, [isOpen, replyTo]);

    useEffect(() => {
        if (!replyTo && recipientQuery.length > 1) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const res = await api.get(`/api/messages/search-users?q=${recipientQuery}`);
                    setRecipients(res.data);
                } catch (e) {
                    console.error("Error searching users", e);
                }
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [recipientQuery, replyTo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipient || !body) return;

        setLoading(true);
        try {
            if (replyTo) {
                await api.post(`/api/messages/${replyTo.id}/reply`, { body });
            } else {
                await api.post('/api/messages', {
                    receiver_id: selectedRecipient.id,
                    subject: subject || '(Sans objet)',
                    body,
                    priority
                });
            }
            onMessageSent();
            onClose();
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 animate-fade-in">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                    <h2 className="text-lg font-semibold text-white">
                        {replyTo ? 'Répondre au message' : 'Nouveau Message'}
                    </h2>
                    <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                    
                    {!replyTo && (
                        <div className="relative">
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">À :</label>
                            {selectedRecipient ? (
                                <div className="flex items-center justify-between bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                                    <span className="text-white text-sm">
                                        {selectedRecipient.first_name} {selectedRecipient.last_name} ({selectedRecipient.role?.name || 'Patient'})
                                    </span>
                                    <button type="button" onClick={() => setSelectedRecipient(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">✕</button>
                                </div>
                            ) : (
                                <div>
                                    <input 
                                        type="text" 
                                        value={recipientQuery}
                                        onChange={(e) => setRecipientQuery(e.target.value)}
                                        placeholder="Chercher un destinataire..."
                                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                    {recipients.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {recipients.map(r => (
                                                <div 
                                                    key={r.id} 
                                                    onClick={() => setSelectedRecipient(r)}
                                                    className="px-3 py-2 hover:bg-[var(--color-bg-primary)] cursor-pointer text-sm text-white border-b border-[var(--color-border)] last:border-0"
                                                >
                                                    {r.first_name} {r.last_name} <span className="text-[var(--color-text-muted)] text-xs ml-2">({r.role?.name})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {replyTo && (
                        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                            <span className="font-medium text-[var(--color-text-muted)]">À :</span> {selectedRecipient?.first_name} {selectedRecipient?.last_name}
                        </div>
                    )}

                    {!replyTo && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Sujet :</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    )}

                    {!replyTo && (
                        <div className="flex items-center space-x-3 mt-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Priorité :</label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="priority" value="normal" checked={priority === 'normal'} onChange={() => setPriority('normal')} className="text-[var(--color-primary)]" />
                                <span className="text-sm text-white">Normale</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="priority" value="urgent" checked={priority === 'urgent'} onChange={() => setPriority('urgent')} className="text-[var(--color-error)]" />
                                <span className="text-sm text-[var(--color-error)]">Urgente</span>
                            </label>
                        </div>
                    )}

                    <div className="flex-1 mt-4">
                        <textarea 
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            className="w-full h-48 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[var(--color-border)] mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-3 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !selectedRecipient || !body.trim()} 
                            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-opacity-90 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {loading ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NewMessageModal;
