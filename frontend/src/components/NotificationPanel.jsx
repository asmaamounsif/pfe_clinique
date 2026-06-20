import React from 'react';

const NotificationPanel = ({ isOpen, notifications, unreadCount, onMarkRead, onMarkAllRead, onClose }) => {
    if (!isOpen) return null;

    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (seconds < 60) return "à l'instant";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `il y a ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `il y a ${hours}h`;
        return `il y a ${Math.floor(hours / 24)}j`;
    };

    const getIcon = (type) => {
        switch(type) {
            case 'nouveau_rdv': return '📅';
            case 'rdv_confirme': return '✅';
            case 'rdv_annule': return '❌';
            case 'nouveau_patient': return '👤';
            case 'rappel_rdv': return '⏰';
            case 'resultat_examen': return '🔬';
            case 'message_medecin': return '💬';
            default: return '🔔';
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md shadow-xl z-50 overflow-hidden animate-slide-down">
            <div className="p-3 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-tertiary)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Notifications {unreadCount > 0 && <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full ml-2">{unreadCount}</span>}
                </h3>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllRead} className="text-xs text-[var(--color-primary)] hover:underline">
                        Tout marquer lu
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Aucune notification</div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            onClick={() => !notif.read_at && onMarkRead(notif.id)}
                            className={`p-3 border-b border-[var(--color-border)] flex items-start space-x-3 cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors ${!notif.read_at ? 'bg-[#1e2532]' : ''}`}
                        >
                            <div className="text-xl">{getIcon(notif.type)}</div>
                            <div className="flex-1">
                                <h4 className={`text-sm ${!notif.read_at ? 'font-semibold text-white' : 'text-[var(--color-text-primary)]'}`}>{notif.title}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{notif.message}</p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">{timeAgo(notif.created_at)}</p>
                            </div>
                            {!notif.read_at && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1"></div>}
                        </div>
                    ))
                )}
            </div>
            <div className="p-2 text-center border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                <button onClick={onClose} className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors">Fermer</button>
            </div>
        </div>
    );
};

export default NotificationPanel;
