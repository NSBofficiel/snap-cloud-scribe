
import { supabase } from "./client";
import { v4 as uuid } from "uuid";

export interface Photo {
  id?: string;
  user_id?: string;
  imageData: string;
  caption: string;
  visibility: 'private' | 'public';
}

export const photoService = {
  async uploadPhoto(photo: Omit<Photo, 'id' | 'user_id'>): Promise<Photo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        image_data: photo.imageData,
        caption: photo.caption,
        visibility: photo.visibility
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
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching photos:', error);
      return [];
    }

    return data;
  },

  async getSharedPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('visibility', 'public');

    if (error) {
      console.error('Error fetching shared photos:', error);
      return [];
    }

    return data;
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
  }
};
