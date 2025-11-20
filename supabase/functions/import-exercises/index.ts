import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Import exercises function called');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Parse request body
    const { exercises } = await req.json();

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid exercises data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing ${exercises.length} exercises for import`);

    // Validate required fields
    const errors: string[] = [];
    const validatedExercises: ExerciseImportData[] = [];

    exercises.forEach((exercise: any, index: number) => {
      if (!exercise.disability_type_id) {
        errors.push(`Row ${index + 1}: Missing disability_type_id`);
      }
      if (!exercise.category_id) {
        errors.push(`Row ${index + 1}: Missing category_id`);
      }
      if (!exercise.title_ar) {
        errors.push(`Row ${index + 1}: Missing title_ar`);
      }
      if (!exercise.title_en) {
        errors.push(`Row ${index + 1}: Missing title_en`);
      }
      if (!exercise.instructions_ar) {
        errors.push(`Row ${index + 1}: Missing instructions_ar`);
      }
      if (!exercise.instructions_en) {
        errors.push(`Row ${index + 1}: Missing instructions_en`);
      }

      if (errors.length === 0 || errors.filter(e => e.startsWith(`Row ${index + 1}:`)).length === 0) {
        validatedExercises.push({
          disability_type_id: exercise.disability_type_id,
          category_id: exercise.category_id,
          title_ar: exercise.title_ar,
          title_en: exercise.title_en,
          instructions_ar: exercise.instructions_ar,
          instructions_en: exercise.instructions_en,
          difficulty: exercise.difficulty || null,
          equipment: exercise.equipment || null,
          duration_reps: exercise.duration_reps || null,
          safety_notes_ar: exercise.safety_notes_ar || null,
          safety_notes_en: exercise.safety_notes_en || null,
          media_url: exercise.media_url || null,
        });
      }
    });

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return new Response(
        JSON.stringify({ error: 'Validation errors', details: errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert exercises
    const { data, error: insertError } = await supabaseClient
      .from('exercises')
      .insert(validatedExercises)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to import exercises', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully imported ${data?.length || 0} exercises`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: data?.length || 0,
        message: `Successfully imported ${data?.length || 0} exercises`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
