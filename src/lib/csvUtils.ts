interface ExerciseExportData {
  disability_type_id: string;
  disability_type: string;
  category_id: string;
  category: string;
  title_ar: string;
  title_en: string;
  instructions_ar: string;
  instructions_en: string;
  difficulty: string | null;
  equipment: string | null;
  duration_reps: string | null;
  safety_notes_ar: string | null;
  safety_notes_en: string | null;
  media_url: string | null;
}

export function exportToCSV(data: ExerciseExportData[], filename: string) {
  // CSV headers
  const headers = [
    'disability_type_id',
    'disability_type',
    'category_id',
    'category',
    'title_ar',
    'title_en',
    'instructions_ar',
    'instructions_en',
    'difficulty',
    'equipment',
    'duration_reps',
    'safety_notes_ar',
    'safety_notes_en',
    'media_url',
  ];

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => escapeCSV(row[header as keyof ExerciseExportData])).join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToJSON(data: ExerciseExportData[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

interface ExerciseImportData {
  disability_type_id: string;
  category_id: string;
  title_ar: string;
  title_en: string;
  instructions_ar: string;
  instructions_en: string;
  difficulty?: string | null;
  equipment?: string | null;
  duration_reps?: string | null;
  safety_notes_ar?: string | null;
  safety_notes_en?: string | null;
  media_url?: string | null;
}

export function parseCSV(csvContent: string): ExerciseImportData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const exercises: ExerciseImportData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    // Parse CSV line handling quoted values
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    const exercise: any = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Only include import-relevant fields
      if (header === 'disability_type_id' || header === 'category_id' || 
          header === 'title_ar' || header === 'title_en' ||
          header === 'instructions_ar' || header === 'instructions_en' ||
          header === 'difficulty' || header === 'equipment' ||
          header === 'duration_reps' || header === 'safety_notes_ar' ||
          header === 'safety_notes_en' || header === 'media_url') {
        exercise[header] = value || null;
      }
    });

    exercises.push(exercise);
  }

  return exercises;
}

export function parseJSON(jsonContent: string): ExerciseImportData[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of exercises');
    }

    // Extract only import-relevant fields
    return data.map((item: any) => ({
      disability_type_id: item.disability_type_id,
      category_id: item.category_id,
      title_ar: item.title_ar,
      title_en: item.title_en,
      instructions_ar: item.instructions_ar,
      instructions_en: item.instructions_en,
      difficulty: item.difficulty || null,
      equipment: item.equipment || null,
      duration_reps: item.duration_reps || null,
      safety_notes_ar: item.safety_notes_ar || null,
      safety_notes_en: item.safety_notes_en || null,
      media_url: item.media_url || null,
    }));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
