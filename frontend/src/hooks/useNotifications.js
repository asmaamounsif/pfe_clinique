import { useState, useCallback } from 'react';

export const useNotifications = () => {
    const [notifications] = useState([]);
    const [unreadCount] = useState(0);

    const markRead = useCallback(async () => {}, []);
    const markAllRead = useCallback(async () => {}, []);

    return { notifications, unreadCount, markRead, markAllRead };
};
