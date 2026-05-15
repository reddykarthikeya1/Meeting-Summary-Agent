import { create } from "zustand";
import type { Meeting, ViewMode, SortOption, SortDirection } from "@/lib/types";

interface MeetingState {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  viewMode: ViewMode;
  sortBy: SortOption;
  sortDirection: SortDirection;
  filterStatus: string | null;
  filterDateRange: { start: string; end: string } | null;
  searchQuery: string;
  isLoading: boolean;

  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setFilterStatus: (status: string | null) => void;
  setFilterDateRange: (range: { start: string; end: string } | null) => void;
  setSearchQuery: (query: string) => void;
  toggleStarred: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredMeetings: () => Meeting[];
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  selectedMeeting: null,
  viewMode: "grid",
  sortBy: "date",
  sortDirection: "desc",
  filterStatus: null,
  filterDateRange: null,
  searchQuery: "",
  isLoading: false,

  setMeetings: (meetings) => set({ meetings }),
  addMeeting: (meeting) => set((state) => ({ meetings: [meeting, ...state.meetings] })),
  updateMeeting: (id, updates) =>
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      selectedMeeting:
        state.selectedMeeting?.id === id
          ? { ...state.selectedMeeting, ...updates }
          : state.selectedMeeting,
    })),
  deleteMeeting: (id) =>
    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== id),
      selectedMeeting: state.selectedMeeting?.id === id ? null : state.selectedMeeting,
    })),
  setSelectedMeeting: (meeting) => set({ selectedMeeting: meeting }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterDateRange: (range) => set({ filterDateRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleStarred: (id) =>
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === id ? { ...m, tags: m.tags } : m)),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  getFilteredMeetings: () => {
    const { meetings, filterStatus, searchQuery, sortBy, sortDirection } = get();
    let filtered = [...meetings];

    if (filterStatus) {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.participants.some((p) => p.name.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "duration":
          comparison = (a.duration_sec || 0) - (b.duration_sec || 0);
          break;
        case "participants":
          comparison = a.participants.length - b.participants.length;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  },
}));
