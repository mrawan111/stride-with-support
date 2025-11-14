import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowLeft, Clock, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function ExerciseList() {
  const { category } = useParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchExercises();
  }, [user, category, navigate]);

  const fetchExercises = async () => {
    if (!user) return;

    // Get user's disability type
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('disability_type_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      toast.error(t('error'));
      setLoading(false);
      return;
    }

    // Get category data
    const { data: catData, error: catError } = await supabase
      .from('exercise_categories')
      .select('*')
      .eq('key', category)
      .single();

    if (catError) {
      console.error('Error fetching category:', catError);
    } else {
      setCategoryData(catData);
    }

    // Get exercises for this category and user's disability type
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('disability_type_id', userData.disability_type_id)
      .eq('category_id', catData?.id)
      .order('title_ar');

    if (error) {
      console.error('Error fetching exercises:', error);
      toast.error(t('error'));
    } else {
      setExercises(data || []);
    }

    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-primary/20 text-primary';
      case 'medium':
        return 'bg-accent/20 text-accent-foreground';
      case 'hard':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={language === 'ar' ? 'ml-auto' : 'mr-auto'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('dashboard')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {categoryData
              ? language === 'ar'
                ? categoryData.title_ar
                : categoryData.title_en
              : ''}
          </h2>
          <p className="text-muted-foreground">
            {exercises.length}{' '}
            {language === 'ar' ? 'تمرين متاح' : 'exercises available'}
          </p>
        </div>

        {exercises.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('noExercises')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/exercise/${exercise.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">
                      {language === 'ar' ? exercise.title_ar : exercise.title_en}
                    </CardTitle>
                    {exercise.difficulty && (
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {t(exercise.difficulty)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {language === 'ar'
                      ? exercise.instructions_ar
                      : exercise.instructions_en}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exercise.duration_reps && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{exercise.duration_reps}</span>
                      </div>
                    )}
                    {exercise.equipment && exercise.equipment !== 'none' && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Wrench className="h-3 w-3" />
                        <span>{exercise.equipment}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
