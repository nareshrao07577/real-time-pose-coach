import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Dumbbell, 
  Trophy, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: "home" | "exercises" | "workout" | "dashboard" | "leaderboard" | "profile" | "settings") => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view as "home" | "exercises" | "workout" | "dashboard" | "leaderboard" | "profile" | "settings");
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MotionX
              </h1>
              <div className="flex space-x-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => handleViewChange(item.id as any)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Level {profile?.current_level || 1} • {profile?.total_points || 0} XP
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.display_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleViewChange('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              MotionX
            </h1>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Lv.{profile?.current_level || 1}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur pt-16">
            <div className="px-4 py-6 space-y-6">
              {/* Navigation Items */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => handleViewChange(item.id)}
                    className="w-full justify-start text-left h-12"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* User Section */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.display_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{profile?.total_points || 0} XP</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleViewChange('profile')}
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleViewChange('settings')}
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-600/10"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-20" />
    </>
  );
};

export default Navigation;