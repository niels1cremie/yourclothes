import { create } from 'zustand'
import { OnboardingState, User, WardrobeItem, Outfit } from '@/types'

interface AppStore {
  // Onboarding state
  onboardingState: OnboardingState
  setOnboardingState: (state: Partial<OnboardingState>) => void
  resetOnboarding: () => void
  
  // User profile
  user: User | null
  setUser: (user: User | null) => void
  
  // Wardrobe
  wardrobeItems: WardrobeItem[]
  setWardrobeItems: (items: WardrobeItem[]) => void
  addWardrobeItem: (item: WardrobeItem) => void
  updateWardrobeItem: (id: string, updates: Partial<WardrobeItem>) => void
  deleteWardrobeItem: (id: string) => void
  
  // Outfits
  outfits: Outfit[]
  setOutfits: (outfits: Outfit[]) => void
  addOutfit: (outfit: Outfit) => void
  deleteOutfit: (id: string) => void
}

const initialOnboardingState: OnboardingState = {
  step: 0,
  basicInfo: {
    name: '',
    age: 0,
    gender: '',
    styleTags: [],
  },
  measurements: {
    height: 0,
    weight: 0,
    sizeEU: '',
    sizeUS: '',
    bodyShape: '',
  },
  photos: {},
  wardrobeUploads: [],
  brandAccounts: [],
  styleGoals: [],
}

export const useStore = create<AppStore>((set) => ({
  onboardingState: initialOnboardingState,
  setOnboardingState: (newState) =>
    set((state) => ({
      onboardingState: { ...state.onboardingState, ...newState },
    })),
  resetOnboarding: () => set({ onboardingState: initialOnboardingState }),
  
  user: null,
  setUser: (user) => set({ user }),
  
  wardrobeItems: [],
  setWardrobeItems: (items) => set({ wardrobeItems: items }),
  addWardrobeItem: (item) =>
    set((state) => ({ wardrobeItems: [...state.wardrobeItems, item] })),
  updateWardrobeItem: (id, updates) =>
    set((state) => ({
      wardrobeItems: state.wardrobeItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  deleteWardrobeItem: (id) =>
    set((state) => ({
      wardrobeItems: state.wardrobeItems.filter((item) => item.id !== id),
    })),
  
  outfits: [],
  setOutfits: (outfits) => set({ outfits }),
  addOutfit: (outfit) =>
    set((state) => ({ outfits: [...state.outfits, outfit] })),
  deleteOutfit: (id) =>
    set((state) => ({
      outfits: state.outfits.filter((outfit) => outfit.id !== id),
    })),
}))
