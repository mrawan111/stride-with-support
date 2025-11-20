import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface DisabilityType {
  id: string;
  title_ar: string;
  title_en: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    age: string;
    disability_type_id: string;
    language_pref: 'ar' | 'en';
  }>({
    name: '',
    age: '',
    disability_type_id: '',
    language_pref: language,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate]);

  async function fetchData() {
    try {
      const [profileRes, disabilityTypesRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user!.id).single(),
        supabase.from('disability_types').select('*'),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (disabilityTypesRes.error) throw disabilityTypesRes.error;

      setFormData({
        name: profileRes.data.name,
        age: profileRes.data.age?.toString() || '',
        disability_type_id: profileRes.data.disability_type_id || '',
        language_pref: (profileRes.data.language_pref || 'ar') as 'ar' | 'en',
      });

      setDisabilityTypes(disabilityTypesRes.data || []);
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

    if (!formData.name || !formData.age || !formData.disability_type_id) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          age: parseInt(formData.age),
          disability_type_id: formData.disability_type_id,
          language_pref: formData.language_pref,
        })
        .eq('id', user!.id);

      if (error) throw error;

      // Update language context
      if (formData.language_pref === 'ar' || formData.language_pref === 'en') {
        setLanguage(formData.language_pref);
      }

      toast({
        title: language === 'ar' ? 'نجح' : 'Success',
        description: language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully',
      });

      navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="name">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">{language === 'ar' ? 'العمر' : 'Age'}</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              min="1"
              max="150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disability_type_id">
              {language === 'ar' ? 'نوع الإعاقة' : 'Disability Type'}
            </Label>
            <Select
              value={formData.disability_type_id}
              onValueChange={(value) => setFormData({ ...formData, disability_type_id: value })}
            >
              <SelectTrigger id="disability_type_id">
                <SelectValue placeholder={language === 'ar' ? 'اختر نوع الإعاقة' : 'Select disability type'} />
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
            <Label htmlFor="language_pref">{language === 'ar' ? 'اللغة' : 'Language'}</Label>
            <Select
              value={formData.language_pref}
              onValueChange={(value: 'ar' | 'en') => setFormData({ ...formData, language_pref: value })}
            >
              <SelectTrigger id="language_pref">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving
                ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                : language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
