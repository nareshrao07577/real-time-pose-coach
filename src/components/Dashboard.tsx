import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Target, Flame, Award, Calendar, TrendingUp } from 'lucide-react';

interface Stats {
  totalWorkouts: number;
  totalReps: number;
  averageAccuracy: number;
  currentStreak: number;
  totalPoints: number;
  currentLevel: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  earned_at?: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  target_value: number;
  current_progress: number;
  end_date: string;
  points_reward: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalReps: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    totalPoints: 0,
    currentLevel: 1
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchAchievements();
      fetchChallenges();
      fetchRecentWorkouts();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id);

    const totalWorkouts = workouts?.length || 0;
    const totalReps = workouts?.reduce((sum, w) => sum + (w.total_reps || 0), 0) || 0;
    const averageAccuracy = workouts?.reduce((sum, w) => sum + (w.average_accuracy || 0), 0) / Math.max(totalWorkouts, 1) || 0;

    setStats({
      totalWorkouts,
      totalReps,
      averageAccuracy: Math.round(averageAccuracy),
      currentStreak: 5, // TODO: Calculate actual streak
      totalPoints: profile?.total_points || 0,
      currentLevel: profile?.current_level || 1
    });
  };

  const fetchAchievements = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_achievements')
      .select(`
        earned_at,
        achievements:achievement_id (
          id,
          name,
          description,
          badge_icon
        )
      `)
      .eq('user_id', user.id);

    const achievementsList = data?.map(item => ({
      ...item.achievements,
      earned_at: item.earned_at
    })) || [];

    setAchievements(achievementsList as Achievement[]);
  };

  const fetchChallenges = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_challenges')
      .select(`
        current_progress,
        challenges:challenge_id (
          id,
          name,
          description,
          target_value,
          end_date,
          points_reward
        )
      `)
      .eq('user_id', user.id)
      .eq('completed', false);

    const challengesList = data?.map(item => ({
      ...item.challenges,
      current_progress: item.current_progress
    })) || [];

    setChallenges(challengesList as Challenge[]);
  };

  const fetchRecentWorkouts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentWorkouts(data || []);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Fitness Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || 'Athlete'}! 💪
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-sm text-muted-foreground">Workouts Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/20 rounded-full">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReps}</p>
                  <p className="text-sm text-muted-foreground">Total Reps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-400/20 bg-gradient-to-br from-card to-orange-400/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-400/20 rounded-full">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Level {stats.currentLevel}</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.totalPoints} / {stats.currentLevel * 1000} XP
                      </span>
                    </div>
                    <Progress value={(stats.totalPoints % 1000) / 10} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {1000 - (stats.totalPoints % 1000)} XP until next level
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Workouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentWorkouts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No workouts yet. Start your first session!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentWorkouts.map((workout) => (
                        <div key={workout.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{workout.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(workout.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {workout.average_accuracy}% accuracy
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No achievements yet. Complete workouts to earn badges!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-br from-card to-primary/5">
                        <div className="text-center space-y-2">
                          <div className="text-3xl">{achievement.badge_icon}</div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.earned_at && (
                            <p className="text-xs text-primary">
                              Earned {new Date(achievement.earned_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <Card>
              <CardHeader>
                <CardTitle>Active Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                {challenges.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No active challenges. Check back later for new challenges!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 border rounded-lg">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{challenge.name}</h3>
                              <p className="text-sm text-muted-foreground">{challenge.description}</p>
                            </div>
                            <Badge>{challenge.points_reward} XP</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{challenge.current_progress} / {challenge.target_value}</span>
                            </div>
                            <Progress value={(challenge.current_progress / challenge.target_value) * 100} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Ends: {new Date(challenge.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Progress charts and analytics coming soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;