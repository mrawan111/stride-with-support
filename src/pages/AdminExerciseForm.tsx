import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

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

export default function AdminExerciseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { language } = useLanguage();
  const isEdit = !!id;

  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    disability_type_id: '',
    category_id: '',
    title_ar: '',
    title_en: '',
    instructions_ar: '',
    instructions_en: '',
    difficulty: '',
    equipment: '',
    duration_reps: '',
    safety_notes_ar: '',
    safety_notes_en: '',
    media_url: '',
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, id]);

  async function fetchData() {
    try {
      const [disabilityTypesRes, categoriesRes] = await Promise.all([
        supabase.from('disability_types').select('*'),
        supabase.from('exercise_categories').select('*'),
      ]);

      if (disabilityTypesRes.error) throw disabilityTypesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setDisabilityTypes(disabilityTypesRes.data || []);
      setCategories(categoriesRes.data || []);

      if (isEdit && id) {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setFormData({
          disability_type_id: data.disability_type_id,
          category_id: data.category_id,
          title_ar: data.title_ar,
          title_en: data.title_en,
          instructions_ar: data.instructions_ar,
          instructions_en: data.instructions_en,
          difficulty: data.difficulty || '',
          equipment: data.equipment || '',
          duration_reps: data.duration_reps || '',
          safety_notes_ar: data.safety_notes_ar || '',
          safety_notes_en: data.safety_notes_en || '',
          media_url: data.media_url || '',
        });
      }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.disability_type_id || !formData.category_id || !formData.title_ar || 
        !formData.title_en || !formData.instructions_ar || !formData.instructions_en) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        difficulty: formData.difficulty || null,
        equipment: formData.equipment || null,
        duration_reps: formData.duration_reps || null,
        safety_notes_ar: formData.safety_notes_ar || null,
        safety_notes_en: formData.safety_notes_en || null,
        media_url: formData.media_url || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('exercises')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert(payload);

        if (error) throw error;
      }

      toast({
        title: language === 'ar' ? 'نجح' : 'Success',
        description: isEdit
          ? language === 'ar' ? 'تم تحديث التمرين بنجاح' : 'Exercise updated successfully'
          : language === 'ar' ? 'تم إضافة التمرين بنجاح' : 'Exercise added successfully',
      });

      navigate('/admin/exercises');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/exercises')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit
              ? language === 'ar' ? 'تعديل التمرين' : 'Edit Exercise'
              : language === 'ar' ? 'إضافة تمرين جديد' : 'Add New Exercise'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disability_type_id">
                {language === 'ar' ? 'نوع الإعاقة' : 'Disability Type'} *
              </Label>
              <Select
                value={formData.disability_type_id}
                onValueChange={(value) => setFormData({ ...formData, disability_type_id: value })}
              >
                <SelectTrigger id="disability_type_id">
                  <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {disabilityTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {language === 'ar' ? dt.title_ar : dt.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">
                {language === 'ar' ? 'الفئة' : 'Category'} *
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.title_ar : cat.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ar">{language === 'ar' ? 'العنوان بالعربية' : 'Title (Arabic)'} *</Label>
            <Input
              id="title_ar"
              value={formData.title_ar}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_en">{language === 'ar' ? 'العنوان بالإنجليزية' : 'Title (English)'} *</Label>
            <Input
              id="title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions_ar">
              {language === 'ar' ? 'التعليمات بالعربية' : 'Instructions (Arabic)'} *
            </Label>
            <Textarea
              id="instructions_ar"
              value={formData.instructions_ar}
              onChange={(e) => setFormData({ ...formData, instructions_ar: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions_en">
              {language === 'ar' ? 'التعليمات بالإنجليزية' : 'Instructions (English)'} *
            </Label>
            <Textarea
              id="instructions_en"
              value={formData.instructions_en}
              onChange={(e) => setFormData({ ...formData, instructions_en: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">{language === 'ar' ? 'المستوى' : 'Difficulty'}</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">{language === 'ar' ? 'سهل' : 'Easy'}</SelectItem>
                  <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
                  <SelectItem value="hard">{language === 'ar' ? 'صعب' : 'Hard'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">{language === 'ar' ? 'المعدات' : 'Equipment'}</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_reps">{language === 'ar' ? 'المدة/التكرار' : 'Duration/Reps'}</Label>
              <Input
                id="duration_reps"
                value={formData.duration_reps}
                onChange={(e) => setFormData({ ...formData, duration_reps: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety_notes_ar">
              {language === 'ar' ? 'ملاحظات السلامة بالعربية' : 'Safety Notes (Arabic)'}
            </Label>
            <Textarea
              id="safety_notes_ar"
              value={formData.safety_notes_ar}
              onChange={(e) => setFormData({ ...formData, safety_notes_ar: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety_notes_en">
              {language === 'ar' ? 'ملاحظات السلامة بالإنجليزية' : 'Safety Notes (English)'}
            </Label>
            <Textarea
              id="safety_notes_en"
              value={formData.safety_notes_en}
              onChange={(e) => setFormData({ ...formData, safety_notes_en: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media_url">{language === 'ar' ? 'رابط الوسائط' : 'Media URL'}</Label>
            <Input
              id="media_url"
              type="url"
              value={formData.media_url}
              onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              placeholder="https://"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving
                ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                : isEdit
                ? language === 'ar' ? 'تحديث' : 'Update'
                : language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/exercises')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
