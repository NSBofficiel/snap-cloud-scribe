
import { supabase } from "./client";

export const userService = {
  async getProfile(userId: string) {
    try {
      // Use custom query to avoid TypeScript errors
      const { data, error } = await supabase
        .rpc('get_profile', { user_id: userId })
        .catch(error => {
          console.error('Error in RPC get_profile:', error);
          return { data: null, error };
        });
        
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
        .rpc('update_profile', { 
          profile_username: profile.username, 
          profile_avatar_url: profile.avatar_url 
        })
        .catch(error => {
          console.error('Error in RPC update_profile:', error);
          return { data: null, error };
        });
        
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
      
      const { data, error } = await supabase
        .rpc('get_login_history')
        .catch(error => {
          console.error('Error in RPC get_login_history:', error);
          return { data: [], error };
        });
        
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
