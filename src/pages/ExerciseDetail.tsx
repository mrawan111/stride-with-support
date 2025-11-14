import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowLeft, Clock, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ExerciseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchExercise();
    checkIfCompleted();
  }, [user, id, navigate]);

  const fetchExercise = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*, disability_types(*), exercise_categories(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      toast.error(t('error'));
    } else {
      setExercise(data);
    }

    setLoading(false);
  };

  const checkIfCompleted = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('exercise_id', id)
      .gte('completed_at', today)
      .limit(1);

    if (!error && data && data.length > 0) {
      setIsCompleted(true);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        exercise_id: id,
      });

    if (error) {
      console.error('Error marking complete:', error);
      toast.error(t('error'));
    } else {
      setIsCompleted(true);
      toast.success(t('completed'));
    }
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

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('error')}</p>
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
            onClick={() => navigate(-1)}
            className={language === 'ar' ? 'ml-auto' : 'mr-auto'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-elevated">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-2xl">
                {language === 'ar' ? exercise.title_ar : exercise.title_en}
              </CardTitle>
              {exercise.difficulty && (
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {t(exercise.difficulty)}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {exercise.duration_reps && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{exercise.duration_reps}</span>
                </div>
              )}
              {exercise.equipment && (
                <div className="flex items-center gap-1">
                  <Wrench className="h-4 w-4" />
                  <span>{exercise.equipment === 'none' ? t('none') : exercise.equipment}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t('instructions')}
              </h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {language === 'ar' ? exercise.instructions_ar : exercise.instructions_en}
              </p>
            </div>

            {(exercise.safety_notes_ar || exercise.safety_notes_en) && (
              <div className="bg-accent/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-accent-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  {t('safetyNotes')}
                </h3>
                <p className="text-foreground leading-relaxed">
                  {language === 'ar' ? exercise.safety_notes_ar : exercise.safety_notes_en}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted}
                className="w-full"
                size="lg"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t('completed')}
                  </>
                ) : (
                  t('markComplete')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
