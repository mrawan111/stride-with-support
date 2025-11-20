import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Exercise {
  id: string;
  title_ar: string;
  title_en: string;
  difficulty: string | null;
  created_at: string;
  disability_type_id: string;
  category_id: string;
  disability_types: { title_ar: string; title_en: string } | null;
  exercise_categories: { title_ar: string; title_en: string } | null;
}

interface DisabilityType {
  id: string;
  title_ar: string;
  title_en: string;
}

interface Category {
  id: string;
  title_ar: string;
  title_en: string;
}

export default function AdminExercises() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { language, t } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisability, setFilterDisability] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, filterDisability, filterCategory, filterDifficulty, exercises]);

  async function fetchData() {
    try {
      const [exercisesRes, disabilityTypesRes, categoriesRes] = await Promise.all([
        supabase
          .from('exercises')
          .select(`
            *,
            disability_types (title_ar, title_en),
            exercise_categories (title_ar, title_en)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('disability_types').select('*'),
        supabase.from('exercise_categories').select('*'),
      ]);

      if (exercisesRes.error) throw exercisesRes.error;
      if (disabilityTypesRes.error) throw disabilityTypesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setExercises(exercisesRes.data || []);
      setDisabilityTypes(disabilityTypesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function filterExercises() {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(
        (ex) =>
          ex.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.title_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDisability !== 'all') {
      filtered = filtered.filter((ex) => ex.disability_type_id === filterDisability);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((ex) => ex.category_id === filterCategory);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter((ex) => ex.difficulty === filterDifficulty);
    }

    setFilteredExercises(filtered);
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from('exercises').delete().eq('id', deleteId);

      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف التمرين بنجاح' : 'Exercise deleted successfully',
      });

      setExercises(exercises.filter((ex) => ex.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة التمارين' : 'Exercise Management'}
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/exercises/new')}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إضافة تمرين' : 'Add Exercise'}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterDisability} onValueChange={setFilterDisability}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'ar' ? 'جميع الإعاقات' : 'All Disabilities'}
              </SelectItem>
              {disabilityTypes.map((dt) => (
                <SelectItem key={dt.id} value={dt.id}>
                  {language === 'ar' ? dt.title_ar : dt.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {language === 'ar' ? cat.title_ar : cat.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'ar' ? 'جميع المستويات' : 'All Difficulties'}
              </SelectItem>
              <SelectItem value="easy">{language === 'ar' ? 'سهل' : 'Easy'}</SelectItem>
              <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
              <SelectItem value="hard">{language === 'ar' ? 'صعب' : 'Hard'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exercise Table */}
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                <TableHead>{language === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                <TableHead>{language === 'ar' ? 'نوع الإعاقة' : 'Disability'}</TableHead>
                <TableHead>{language === 'ar' ? 'المستوى' : 'Difficulty'}</TableHead>
                <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExercises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد تمارين' : 'No exercises found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? exercise.title_ar : exercise.title_en}
                    </TableCell>
                    <TableCell>
                      {exercise.exercise_categories
                        ? language === 'ar'
                          ? exercise.exercise_categories.title_ar
                          : exercise.exercise_categories.title_en
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {exercise.disability_types
                        ? language === 'ar'
                          ? exercise.disability_types.title_ar
                          : exercise.disability_types.title_en
                        : '-'}
                    </TableCell>
                    <TableCell>{exercise.difficulty || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/exercises/${exercise.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'هل أنت متأكد من حذف هذا التمرين؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this exercise? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
