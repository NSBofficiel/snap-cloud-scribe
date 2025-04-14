
import { supabase } from "./client";
import type { Tables, TablesInsert } from "./types";

export type Photo = Tables<'photos'>;
export type PhotoInsert = TablesInsert<'photos'>;

export const photoService = {
  async uploadPhoto(photo: Omit<PhotoInsert, 'id' | 'user_id' | 'created_at'>): Promise<Photo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        image_data: photo.image_data,
        caption: photo.caption,
        visibility: photo.visibility as 'public' | 'private'
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
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
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
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('photos')
      .update({ visibility })
      .eq('id', photoId)
      .eq('user_id', user.id)
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
    
    if (!user) return false;

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }

    return true;
  }
};
