import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Auth
    welcome: 'مرحباً بك',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    age: 'العمر',
    selectDisability: 'اختر نوع الإعاقة',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    
    // Navigation
    dashboard: 'الرئيسية',
    exercises: 'التمارين',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    
    // Exercise Categories
    strength: 'القوة العضلية',
    endurance: 'التحمل',
    flexibility: 'المرونة',
    balance: 'التوازن والتنسيق',
    speed: 'السرعة ورد الفعل',
    
    // Disability Types
    intellectual: 'الإعاقات الذهنية',
    hearing: 'الإعاقات السمعية',
    motor: 'الإعاقات الحركية الجزئية',
    visual: 'الإعاقات البصرية',
    
    // Common
    difficulty: 'المستوى',
    equipment: 'المعدات',
    duration: 'المدة',
    instructions: 'التعليمات',
    safetyNotes: 'ملاحظات السلامة',
    markComplete: 'وضع علامة مكتمل',
    completed: 'مكتمل',
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
    none: 'لا يوجد',
    
    // Messages
    welcomeBack: 'مرحباً بعودتك',
    selectCategory: 'اختر فئة التمارين',
    noExercises: 'لا توجد تمارين متاحة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    
    // Accessibility
    highContrast: 'تباين عالي',
    largeText: 'نص كبير',
    audioGuidance: 'إرشاد صوتي',
  },
  en: {
    // Auth
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    age: 'Age',
    selectDisability: 'Select Disability Type',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Navigation
    dashboard: 'Dashboard',
    exercises: 'Exercises',
    profile: 'Profile',
    logout: 'Logout',
    
    // Exercise Categories
    strength: 'Muscular Strength',
    endurance: 'Endurance',
    flexibility: 'Flexibility',
    balance: 'Balance & Coordination',
    speed: 'Speed & Reaction',
    
    // Disability Types
    intellectual: 'Intellectual Disabilities',
    hearing: 'Hearing Impairments',
    motor: 'Motor Impairments',
    visual: 'Visual Impairments',
    
    // Common
    difficulty: 'Difficulty',
    equipment: 'Equipment',
    duration: 'Duration',
    instructions: 'Instructions',
    safetyNotes: 'Safety Notes',
    markComplete: 'Mark Complete',
    completed: 'Completed',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    none: 'None',
    
    // Messages
    welcomeBack: 'Welcome Back',
    selectCategory: 'Select Exercise Category',
    noExercises: 'No exercises available',
    loading: 'Loading...',
    error: 'An error occurred',
    
    // Accessibility
    highContrast: 'High Contrast',
    largeText: 'Large Text',
    audioGuidance: 'Audio Guidance',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
