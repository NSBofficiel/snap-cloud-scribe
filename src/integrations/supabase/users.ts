
import { supabase } from "./client";

export const userService = {
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },
  
  async updateProfile(profile: { username?: string, avatar_url?: string }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  },
  
  async getLoginHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      // Use custom query to avoid TypeScript errors
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('login_timestamp', { ascending: false });
        
      if (error) {
        console.error('Error fetching login history:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getLoginHistory:', error);
      return [];
    }
  }
};
