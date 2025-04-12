
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

const AccountInfo = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user info from localStorage if available
  const getUserInfo = () => {
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    const username = localStorage.getItem("snapcloud_username") || (isGuest ? "Guest" : "User");
    return { 
      username, 
      isGuest,
      photoUrl: localStorage.getItem("snapcloud_photo") || undefined
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="container mx-auto max-w-md py-8 px-4 min-h-screen flex flex-col justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userInfo.photoUrl} />
              <AvatarFallback>
                <User size={40} />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{userInfo.username}</h2>
            {userInfo.isGuest && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                Guest Account
              </span>
            )}
          </div>
          
          {!userInfo.isGuest && (
            <div className="space-y-2">
              <h3 className="font-medium">Account Type</h3>
              <p className="text-muted-foreground">Standard Account</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountInfo;
