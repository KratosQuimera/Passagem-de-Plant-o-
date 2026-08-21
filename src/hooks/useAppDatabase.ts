import { useEffect, useState } from 'react';
import { dbStore } from '../data/dbStore';
import { AppDatabase, UserProfile } from '../types';

export function useAppDatabase() {
  const [db, setDb] = useState<AppDatabase>(dbStore.getDatabase());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(dbStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = dbStore.subscribe(() => {
      setDb({ ...dbStore.getDatabase() });
      setCurrentUser(dbStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  return {
    db,
    currentUser,
    tickets: db.tickets,
    activeTickets: db.tickets.filter((t) => !t.arquivado),
    archivedTickets: db.tickets.filter((t) => t.arquivado),
    history: db.history,
    users: db.users,
    areas: db.areas.filter((a) => a.ativo),
    allAreas: db.areas,
    responsibles: db.responsibles.filter((r) => r.ativo),
    allResponsibles: db.responsibles,
    statuses: db.statuses.filter((s) => s.ativo),
    allStatuses: db.statuses,
    priorities: db.priorities.filter((p) => p.ativo),
    allPriorities: db.priorities,
    shifts: db.shifts,
    settings: db.settings,
    // Operations
    createTicket: dbStore.createTicket.bind(dbStore),
    updateTicket: dbStore.updateTicket.bind(dbStore),
    concludeTicket: dbStore.concludeTicket.bind(dbStore),
    reopenTicket: dbStore.reopenTicket.bind(dbStore),
    getHistoryForTicket: dbStore.getHistoryForTicket.bind(dbStore),
    addArea: dbStore.addArea.bind(dbStore),
    updateArea: dbStore.updateArea.bind(dbStore),
    deleteArea: dbStore.deleteArea.bind(dbStore),
    toggleAreaActive: dbStore.toggleAreaActive.bind(dbStore),
    addResponsible: dbStore.addResponsible.bind(dbStore),
    updateResponsible: dbStore.updateResponsible.bind(dbStore),
    deleteResponsible: dbStore.deleteResponsible.bind(dbStore),
    toggleResponsibleActive: dbStore.toggleResponsibleActive.bind(dbStore),
    addStatus: dbStore.addStatus.bind(dbStore),
    updateSettings: dbStore.updateSettings.bind(dbStore),
    saveShiftReport: dbStore.saveShiftReport.bind(dbStore),
    setCurrentUser: dbStore.setCurrentUser.bind(dbStore),
    logout: dbStore.logout.bind(dbStore),
    addUser: dbStore.addUser.bind(dbStore),
    updateUser: dbStore.updateUser.bind(dbStore),
    deleteUser: dbStore.deleteUser.bind(dbStore),
    resetToDefaults: dbStore.resetToDefaults.bind(dbStore),
  };
}
