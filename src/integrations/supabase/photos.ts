
import { supabase } from "./client";
import type { Tables, TablesInsert } from "./types";

export type Photo = Tables<'photos'>;
export type PhotoInsert = TablesInsert<'photos'>;

export const photoService = {
  async uploadPhoto(photo: Omit<PhotoInsert, 'id' | 'user_id' | 'created_at'>): Promise<Photo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    
    // For local storage only, we'll use a fixed user ID for guests
    const userId = user ? user.id : (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
    
    if (!userId) return null;

    // Set default visibility based on user type
    const defaultVisibility = isGuest ? 'public' : 'private';
    const visibility = photo.visibility || defaultVisibility;

    const { data, error } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        image_data: photo.image_data,
        caption: photo.caption,
        visibility: visibility as 'public' | 'private'
      })
      .select()
      .single();

    if (error) {
      console.error('Error uploading photo:', error);
      return null;
    }

    return data;
  },

  async getMyPhotos(): Promise<Photo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    
    // For guest users, we'll use a fixed ID for local storage
    const userId = user ? user.id : (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
    
    if (!userId) return [];

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return [];
    }

    return data || [];
  },

  async getSharedPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shared photos:', error);
      return [];
    }

    return data || [];
  },

  async updatePhotoVisibility(photoId: string, visibility: 'private' | 'public'): Promise<Photo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    
    // For guest users, we'll use a fixed ID for local storage
    const userId = user ? user.id : (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
    
    if (!userId) return null;

    const { data, error } = await supabase
      .from('photos')
      .update({ visibility })
      .eq('id', photoId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo visibility:', error);
      return null;
    }

    return data;
  },
  
  async deletePhoto(photoId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    
    // For guest users, we'll use a fixed ID for local storage
    const userId = user ? user.id : (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
    
    if (!userId) return false;

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }

    return true;
  }
};
