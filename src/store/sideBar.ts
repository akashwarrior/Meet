import { create } from "zustand"

interface SidebarOpenStore {
    sidebarOpen: boolean
    activeTab: string
    setSidebarOpen: (open: boolean) => void
    setActiveTab: (tab: string) => void
}

const useSidebarOpenStore = create<SidebarOpenStore>()((set) => ({
    sidebarOpen: false,
    activeTab: "participants",
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setActiveTab: (activeTab) => set({ activeTab })
}))

export default useSidebarOpenStore