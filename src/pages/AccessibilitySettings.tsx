import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useColorBlindMode, ColorBlindType, FontSize } from '@/contexts/ColorBlindModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Eye, Type, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessibilitySettings = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    isColorBlindMode,
    colorBlindType,
    fontSize,
    reduceMotion,
    toggleColorBlindMode,
    setColorBlindType,
    setFontSize,
    setReduceMotion,
  } = useColorBlindMode();

  const content = {
    en: {
      title: 'Accessibility Settings',
      description: 'Customize your viewing experience',
      colorBlindMode: 'Color Blind Friendly Mode',
      colorBlindModeDesc: 'Enable high contrast colors optimized for color vision deficiencies',
      colorBlindType: 'Color Blind Type',
      colorBlindTypeDesc: 'Select your specific type of color vision deficiency',
      protanopia: 'Protanopia (Red-Blind)',
      deuteranopia: 'Deuteranopia (Green-Blind)',
      tritanopia: 'Tritanopia (Blue-Blind)',
      fontSize: 'Font Size',
      fontSizeDesc: 'Adjust text size for better readability',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      extraLarge: 'Extra Large',
      reduceMotion: 'Reduce Motion',
      reduceMotionDesc: 'Minimize animations and transitions',
      preview: 'Live Preview',
      previewDesc: 'See how your changes look',
      sampleText: 'This is a sample text to preview your accessibility settings.',
      back: 'Back',
    },
    ar: {
      title: 'إعدادات إمكانية الوصول',
      description: 'تخصيص تجربة المشاهدة الخاصة بك',
      colorBlindMode: 'وضع الألوان الملائم لعمى الألوان',
      colorBlindModeDesc: 'تمكين الألوان عالية التباين المحسّنة لنقص رؤية الألوان',
      colorBlindType: 'نوع عمى الألوان',
      colorBlindTypeDesc: 'حدد نوعك المحدد من نقص رؤية الألوان',
      protanopia: 'عمى الأحمر (Protanopia)',
      deuteranopia: 'عمى الأخضر (Deuteranopia)',
      tritanopia: 'عمى الأزرق (Tritanopia)',
      fontSize: 'حجم الخط',
      fontSizeDesc: 'ضبط حجم النص لتحسين القراءة',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير',
      extraLarge: 'كبير جداً',
      reduceMotion: 'تقليل الحركة',
      reduceMotionDesc: 'تقليل الرسوم المتحركة والانتقالات',
      preview: 'معاينة مباشرة',
      previewDesc: 'شاهد كيف تبدو تغييراتك',
      sampleText: 'هذا نص تجريبي لمعاينة إعدادات إمكانية الوصول الخاصة بك.',
      back: 'رجوع',
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.back}
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
          </div>

          {/* Color Blind Mode Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t.colorBlindMode}
              </CardTitle>
              <CardDescription>{t.colorBlindModeDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="color-blind-toggle" className="text-base">
                  {t.colorBlindMode}
                </Label>
                <Switch
                  id="color-blind-toggle"
                  checked={isColorBlindMode}
                  onCheckedChange={toggleColorBlindMode}
                />
              </div>

              {isColorBlindMode && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">{t.colorBlindType}</Label>
                  <p className="text-sm text-muted-foreground">{t.colorBlindTypeDesc}</p>
                  <RadioGroup
                    value={colorBlindType}
                    onValueChange={(value) => setColorBlindType(value as ColorBlindType)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="protanopia" id="protanopia" />
                      <Label htmlFor="protanopia" className="font-normal cursor-pointer">
                        {t.protanopia}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deuteranopia" id="deuteranopia" />
                      <Label htmlFor="deuteranopia" className="font-normal cursor-pointer">
                        {t.deuteranopia}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tritanopia" id="tritanopia" />
                      <Label htmlFor="tritanopia" className="font-normal cursor-pointer">
                        {t.tritanopia}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Font Size Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t.fontSize}
              </CardTitle>
              <CardDescription>{t.fontSizeDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={fontSize}
                onValueChange={(value) => setFontSize(value as FontSize)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="font-normal cursor-pointer text-sm">
                    {t.small}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal cursor-pointer text-base">
                    {t.medium}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="font-normal cursor-pointer text-lg">
                    {t.large}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extra-large" id="extra-large" />
                  <Label htmlFor="extra-large" className="font-normal cursor-pointer text-xl">
                    {t.extraLarge}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Motion Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t.reduceMotion}
              </CardTitle>
              <CardDescription>{t.reduceMotionDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="motion-toggle" className="text-base">
                  {t.reduceMotion}
                </Label>
                <Switch
                  id="motion-toggle"
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t.preview}</CardTitle>
              <CardDescription>{t.previewDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-2xl font-semibold mb-4">Sample Heading</h3>
                <p className="mb-4">{t.sampleText}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
