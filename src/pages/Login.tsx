
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CameraIcon, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Create account with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split("@")[0],
            },
          },
        });
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Account created successfully",
          description: "You may now log in with your credentials.",
        });
        
        // Switch to login view after successful signup
        setIsSignUp(false);
        setIsLoading(false);
      } else {
        // Regular login
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Login successful",
            description: "Welcome to A.Eye!",
          });
          navigate("/");
        } else {
          toast({
            title: "Login failed",
            description: "Please check your credentials and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsLoading(true);
    try {
      const success = await login("guest@example.com", "guest");
      
      if (success) {
        toast({
          title: "Guest access granted",
          description: "Welcome to A.Eye as a guest user!",
        });
        navigate("/");
      } else {
        toast({
          title: "Guest access failed",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Guest access failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-8 px-4 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CameraIcon size={40} className="text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          A.Eye
        </h1>
        <p className="text-muted-foreground">Capture, store, remember.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create an account to start storing your photos" 
              : "Enter your credentials to access your photos"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username (optional)</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your preferred username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? "Creating Account..." : "Logging in...") 
                : (isSignUp ? "Create Account" : "Login")}
            </Button>
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleGuestAccess}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue as Guest"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                {isSignUp ? (
                  "Back to Login"
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
