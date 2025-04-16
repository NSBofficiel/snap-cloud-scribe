
import { supabase } from "./client";

// Interface for login history record
interface LoginHistoryRecord {
  id: string;
  user_id: string;
  login_timestamp: string;
  logout_timestamp: string | null;
  user_agent: string;
  ip_address: string;
}

// Interface for user profile
interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  updated_at: string;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Use RPC function instead of directly querying the profiles table
      const { data, error } = await supabase
        .rpc('get_profile', { user_id: userId });
      
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
  
  async updateProfile(profile: { username?: string, avatar_url?: string }): Promise<UserProfile | null> {
    try {
      // Use RPC function instead of directly updating the profiles table
      const { data, error } = await supabase
        .rpc('update_profile', { 
          profile_username: profile.username, 
          profile_avatar_url: profile.avatar_url 
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
  
  async getLoginHistory(): Promise<LoginHistoryRecord[]> {
    try {
      // Use RPC function instead of directly querying the login_history table
      const { data, error } = await supabase
        .rpc('get_login_history');
      
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
