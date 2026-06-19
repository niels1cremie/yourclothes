import { supabase } from './supabase'
import { User, WardrobeItem, Outfit } from '@/types'

// User operations
export async function createUser(user: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Wardrobe operations
export async function getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createWardrobeItem(item: Partial<WardrobeItem>): Promise<WardrobeItem> {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateWardrobeItem(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteWardrobeItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Outfit operations
export async function getOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
  const { data, error } = await supabase
    .from('outfits')
    .insert(outfit)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteOutfit(id: string): Promise<void> {
  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
