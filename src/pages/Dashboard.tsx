import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Dumbbell, Heart, Zap, Scale, Target, Globe, LogOut, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ColorBlindModeToggle } from '@/components/ColorBlindModeToggle';

const categoryIcons = {
  strength: Dumbbell,
  endurance: Heart,
  flexibility: Scale,
  balance: Target,
  speed: Zap,
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserData();
    fetchCategories();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('*, disability_types(*)')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      toast.error(t('error'));
      return;
    }

    // If no profile exists yet, create a basic one and fetch again
    if (!data) {
      const name = user.email === 'admin@fitness.com'
        ? 'Admin'
        : user.email?.split('@')[0] || 'User';

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        toast.error(t('error'));
        return;
      }

      const { data: newData, error: newError } = await supabase
        .from('users')
        .select('*, disability_types(*)')
        .eq('id', user.id)
        .maybeSingle();

      if (newError) {
        console.error('Error fetching user data after insert:', newError);
        toast.error(t('error'));
      } else {
        setUserData(newData);
      }

      return;
    }

    setUserData(data);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('exercise_categories')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* <Activity className="h-6 w-6 text-primary" /> */}
            <img src="favicon.ico" className="h-8 w-8 text-primary"/>
            <h1 className="text-xl font-bold">FitAccess</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/exercises')}
              >
                <Settings className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إدارة' : 'Admin'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الملف' : 'Profile'}
            </Button>
            <ColorBlindModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {t('welcomeBack')}, {userData?.name}
          </h2>
          <p className="text-muted-foreground">
            {userData?.disability_types
              ? language === 'ar'
                ? userData.disability_types.title_ar
                : userData.disability_types.title_en
              : ''}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{t('selectCategory')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.key as keyof typeof categoryIcons] || Activity;
            return (
              <Card
                key={category.id}
                className="hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/exercises/${category.key}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>
                      {language === 'ar' ? category.title_ar : category.title_en}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {language === 'ar' ? 'استعراض التمارين' : 'View Exercises'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
