import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Badge from '../../components/common/Badge';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Récupération des logs d'audit (Admin uniquement)
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/audit-logs');
      if (response.data && response.data.success) {
        // Dans notre api.php, nous avons paginé les logs.
        // On récupère le tableau d'items depuis l'objet paginé.
        setLogs(response.data.data.data || []);
      } else {
        setError('Impossible de récupérer les logs d\'audit.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur d\'accès aux journaux de sécurité.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Liste unique des utilisateurs présents dans les logs pour le sélecteur de filtre
  const usersList = useMemo(() => {
    const usersMap = {};
    logs.forEach(log => {
      if (log.user) {
        usersMap[log.user.id] = `${log.user.first_name} ${log.user.last_name}`;
      }
    });
    return Object.entries(usersMap).map(([id, name]) => ({ id, name }));
  }, [logs]);

  // Logs filtrés basés sur les critères saisis (côté client pour réactivité)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Filtrage par Action
      if (filterAction && log.action !== filterAction) return false;

      // 2. Filtrage par Utilisateur
      if (filterUser && (!log.user || String(log.user.id) !== filterUser)) return false;

      // 3. Filtrage par Date Range
      if (startDate) {
        const logDate = new Date(log.created_at);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const logDate = new Date(log.created_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [logs, filterAction, filterUser, startDate, endDate]);

  // Exportation des logs filtrés au format CSV (Conformité HDS)
  const exportToCSV = () => {
    if (!filteredLogs.length) return;

    // En-têtes CSV
    const headers = ['ID Log', 'Date de création', 'Auteur', 'Action', 'Table impactée', 'ID Enregistrement', 'Adresse IP', 'Navigateur (User Agent)'];
    
    // Contenu des lignes
    const rows = filteredLogs.map(log => {
      const authorName = log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Système/Seeder';
      return [
        log.id,
        log.created_at,
        authorName,
        log.action,
        log.table_affected,
        log.record_id || 'N/A',
        log.ip_address || '127.0.0.1',
        `"${(log.user_agent || '').replace(/"/g, '""')}"` // échapper les guillemets
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeType = (action) => {
    switch (action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'yellow';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports d'Audit & Sécurité (HDS)</h1>
          <p className="text-sm text-gray-500 mt-1">Consultez l'historique complet des écritures et modifications de données médicales.</p>
        </div>
        
        {/* Bouton Export CSV */}
        <button
          onClick={exportToCSV}
          disabled={!filteredLogs.length}
          className="inline-flex items-center justify-center rounded-md bg-medical-800 hover:bg-medical-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors space-x-2 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Exporter au format CSV</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchLogs} />}

      {/* Barre de filtrage */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-gray-700">
        
        {/* Filtrer par Action */}
        <div>
          <label className="block uppercase text-gray-500 mb-1">Filtrer par Action</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-medical-800"
          >
            <option value="">Toutes les actions</option>
            <option value="CREATE">CREATE (Création)</option>
            <option value="UPDATE">UPDATE (Modification)</option>
            <option value="DELETE">DELETE (Suppression)</option>
          </select>
        </div>

        {/* Filtrer par Auteur */}
        <div>
          <label className="block uppercase text-gray-500 mb-1">Filtrer par Auteur</label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-medical-800"
          >
            <option value="">Tous les auteurs</option>
            {usersList.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Date Début */}
        <div>
          <label className="block uppercase text-gray-500 mb-1">Date de début</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-medical-800"
          />
        </div>

        {/* Date Fin */}
        <div>
          <label className="block uppercase text-gray-500 mb-1">Date de fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-medical-800"
          />
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12"><LoadingSpinner message="Récupération des logs d'audit..." /></div>
        ) : !filteredLogs.length ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Aucun log d'audit ne correspond à vos critères de filtrage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Table Impactée</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Ligne</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredLogs.map((log) => {
                  const author = log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Système';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge type={getBadgeType(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono">
                        {log.table_affected}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {log.record_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
