
// Define proper types for our custom RPC functions
export interface CustomSupabaseRpcFunctions {
  record_login: (args: { user_agent_str: string }) => Promise<any>;
  record_logout: () => Promise<void>;
  get_profile: (args: { user_id: string }) => Promise<any>;
  update_profile: (args: { profile_username?: string; profile_avatar_url?: string }) => Promise<any>;
  get_login_history: () => Promise<any>;
}

// Helper function to properly type RPC calls
export function typedRpc<T extends keyof CustomSupabaseRpcFunctions>(
  functionName: T,
  args?: Parameters<CustomSupabaseRpcFunctions[T]>[0]
): ReturnType<CustomSupabaseRpcFunctions[T]> {
  // This function doesn't actually do anything at runtime
  // It just helps TypeScript understand the types
  return {} as any;
}
