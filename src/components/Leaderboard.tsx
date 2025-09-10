import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, TrendingUp, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  current_level: number;
  total_workouts?: number;
  average_accuracy?: number;
}

const Leaderboard = () => {
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [workoutsLeaderboard, setWorkoutsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [accuracyLeaderboard, setAccuracyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    
    // Fetch points leaderboard
    const { data: pointsData } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, total_points, current_level')
      .order('total_points', { ascending: false })
      .limit(20);

    // Get all profiles first, then count workouts
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, avatar_url, total_points, current_level');

    const { data: workoutCounts } = await supabase
      .from('workout_sessions')
      .select('user_id');

    // Process workout stats
    const workoutCountMap = workoutCounts?.reduce((acc: any, session) => {
      acc[session.user_id] = (acc[session.user_id] || 0) + 1;
      return acc;
    }, {}) || {};

    const workoutsRanking = profilesData
      ?.map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_points: profile.total_points,
        current_level: profile.current_level,
        total_workouts: workoutCountMap[profile.user_id] || 0
      }))
      .filter(profile => profile.total_workouts > 0)
      .sort((a, b) => b.total_workouts - a.total_workouts)
      .slice(0, 20) || [];

    // Fetch accuracy leaderboard
    const { data: accuracyData } = await supabase
      .from('workout_sessions')
      .select('user_id, average_accuracy')
      .not('average_accuracy', 'is', null);

    // Process accuracy stats
    const accuracyMap = accuracyData?.reduce((acc: any, session) => {
      if (!acc[session.user_id]) {
        acc[session.user_id] = {
          total_accuracy: 0,
          session_count: 0
        };
      }
      acc[session.user_id].total_accuracy += session.average_accuracy;
      acc[session.user_id].session_count++;
      return acc;
    }, {}) || {};

    const accuracyRanking = profilesData
      ?.map(profile => {
        const userAccuracy = accuracyMap[profile.user_id];
        if (!userAccuracy) return null;
        
        return {
          id: profile.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          total_points: profile.total_points,
          current_level: profile.current_level,
          average_accuracy: Math.round(userAccuracy.total_accuracy / userAccuracy.session_count)
        };
      })
      .filter(profile => profile !== null)
      .sort((a: any, b: any) => b.average_accuracy - a.average_accuracy)
      .slice(0, 20) || [];

    setPointsLeaderboard(pointsData || []);
    setWorkoutsLeaderboard(workoutsRanking as LeaderboardEntry[]);
    setAccuracyLeaderboard(accuracyRanking as LeaderboardEntry[]);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const LeaderboardTable = ({ 
    data, 
    valueKey, 
    valueLabel, 
    suffix = '' 
  }: { 
    data: LeaderboardEntry[];
    valueKey: keyof LeaderboardEntry;
    valueLabel: string;
    suffix?: string;
  }) => (
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No data available yet. Start working out to appear on the leaderboard!
        </p>
      ) : (
        data.map((entry, index) => (
          <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
            index < 3 ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20' : 'bg-muted/50'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getRankIcon(index + 1)}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar_url} />
                <AvatarFallback>
                  {entry.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{entry.display_name || 'Anonymous'}</p>
                <p className="text-sm text-muted-foreground">Level {entry.current_level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {entry[valueKey] as number}{suffix}
              </p>
              <p className="text-xs text-muted-foreground">{valueLabel}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Compete with athletes worldwide and climb the rankings! 🏆
          </p>
        </div>

        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Accuracy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Top Athletes by Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={pointsLeaderboard}
                  valueKey="total_points"
                  valueLabel="Total Points"
                  suffix=" XP"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Most Active Athletes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={workoutsLeaderboard}
                  valueKey="total_workouts"
                  valueLabel="Workouts Completed"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accuracy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Highest Accuracy Athletes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={accuracyLeaderboard}
                  valueKey="average_accuracy"
                  valueLabel="Average Accuracy"
                  suffix="%"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;