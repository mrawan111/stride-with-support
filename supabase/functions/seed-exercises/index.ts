import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get disability types and categories
    const { data: disabilityTypes } = await supabaseClient
      .from("disability_types")
      .select("*");

    const { data: categories } = await supabaseClient
      .from("exercise_categories")
      .select("*");

    if (!disabilityTypes || !categories) {
      throw new Error("Missing disability types or categories");
    }

    // Create lookup maps
    const disabilityMap = Object.fromEntries(
      disabilityTypes.map((d) => [d.slug, d.id])
    );
    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.key, c.id])
    );

    // Sample exercises for intellectual disabilities
    const exercises = [
      // Strength exercises
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.strength,
        title_ar: "تمارين القرفصاء",
        title_en: "Squats",
        instructions_ar: "قف مع مباعدة قدميك بعرض الكتفين. انزل ببطء كما لو كنت تجلس على كرسي، ثم ارتفع مرة أخرى. كرر 8-10 مرات.",
        instructions_en: "Stand with feet shoulder-width apart. Slowly lower down as if sitting in a chair, then rise back up. Repeat 8-10 times.",
        difficulty: "easy",
        equipment: "none",
        duration_reps: "8-10 repetitions",
        safety_notes_ar: "حافظ على ظهرك مستقيماً وركبتيك خلف أصابع قدميك",
        safety_notes_en: "Keep your back straight and knees behind your toes",
      },
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.strength,
        title_ar: "تمارين ضغط الحائط",
        title_en: "Wall Push-ups",
        instructions_ar: "قف أمام الحائط على مسافة ذراع. ضع يديك على الحائط بعرض الكتفين. اثنِ مرفقيك وادفع نفسك للأمام والخلف.",
        instructions_en: "Stand arm's length from a wall. Place hands on wall at shoulder width. Bend elbows and push yourself forward and back.",
        difficulty: "easy",
        equipment: "wall",
        duration_reps: "10 repetitions",
        safety_notes_ar: "ابدأ ببطء وحافظ على جسمك مستقيماً",
        safety_notes_en: "Start slowly and keep your body straight",
      },
      // Endurance exercises
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.endurance,
        title_ar: "جري خفيف",
        title_en: "Light Jogging",
        instructions_ar: "جري خفيف في المكان أو في مساحة آمنة لمدة دقيقة واحدة. حافظ على وتيرة مريحة.",
        instructions_en: "Jog lightly in place or in a safe space for one minute. Maintain a comfortable pace.",
        difficulty: "easy",
        equipment: "none",
        duration_reps: "1 minute",
        safety_notes_ar: "توقف إذا شعرت بالتعب الشديد",
        safety_notes_en: "Stop if you feel overly tired",
      },
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.endurance,
        title_ar: "لعبة المطاردة",
        title_en: "Tag Game",
        instructions_ar: "العب لعبة المطاردة مع مرشد أو صديق في مساحة آمنة. استمر لمدة 3-5 دقائق.",
        instructions_en: "Play tag with a guide or friend in a safe space. Continue for 3-5 minutes.",
        difficulty: "easy",
        equipment: "open space",
        duration_reps: "3-5 minutes",
        safety_notes_ar: "تأكد من وجود مساحة آمنة خالية من العوائق",
        safety_notes_en: "Ensure a safe space free of obstacles",
      },
      // Flexibility exercises
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.flexibility,
        title_ar: "لمس أصابع القدم",
        title_en: "Toe Touches",
        instructions_ar: "قف مع مباعدة قدميك قليلاً. انحنِ ببطء للأمام وحاول لمس أصابع قدميك. ابقَ لمدة 10 ثوانٍ.",
        instructions_en: "Stand with feet slightly apart. Slowly bend forward and try to touch your toes. Hold for 10 seconds.",
        difficulty: "easy",
        equipment: "none",
        duration_reps: "3 repetitions",
        safety_notes_ar: "لا تجبر نفسك إذا شعرت بألم",
        safety_notes_en: "Don't force it if you feel pain",
      },
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.flexibility,
        title_ar: "استطالة الذراعين",
        title_en: "Arm Stretches",
        instructions_ar: "افتح ذراعيك على الجانبين ثم ارفعهما فوق رأسك. كرر ببطء 5 مرات.",
        instructions_en: "Open arms to the sides then raise them overhead. Repeat slowly 5 times.",
        difficulty: "easy",
        equipment: "none",
        duration_reps: "5 repetitions",
        safety_notes_ar: "حافظ على حركة سلسة وبطيئة",
        safety_notes_en: "Keep movements smooth and slow",
      },
      // Balance exercises
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.balance,
        title_ar: "الوقوف على قدم واحدة",
        title_en: "Single Leg Stand",
        instructions_ar: "قف على قدم واحدة والعد إلى 10. استخدم دعماً إذا لزم الأمر.",
        instructions_en: "Stand on one foot and count to 10. Use support if needed.",
        difficulty: "medium",
        equipment: "chair for support",
        duration_reps: "10 seconds each leg",
        safety_notes_ar: "احتفظ بكرسي قريب للدعم",
        safety_notes_en: "Keep a chair nearby for support",
      },
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.balance,
        title_ar: "المشي على أشكال مرسومة",
        title_en: "Walk on Drawn Shapes",
        instructions_ar: "ارسم مربعات أو دوائر على الأرض وامشِ عليها دون الخروج عن الخط.",
        instructions_en: "Draw squares or circles on the floor and walk on them without stepping outside the line.",
        difficulty: "easy",
        equipment: "tape or chalk",
        duration_reps: "5 minutes",
        safety_notes_ar: "ابدأ بأشكال كبيرة ثم صغِّرها",
        safety_notes_en: "Start with large shapes then make them smaller",
      },
      // Speed exercises
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.speed,
        title_ar: "الجري نحو لون معين",
        title_en: "Run to a Color",
        instructions_ar: "ضع بطاقات ملونة مختلفة في أماكن متفرقة. عندما ينادي المرشد باسم لون، اجرِ نحوه.",
        instructions_en: "Place different colored cards in various spots. When the guide calls a color, run to it.",
        difficulty: "easy",
        equipment: "colored cards",
        duration_reps: "10 minutes",
        safety_notes_ar: "تأكد من وجود مساحة آمنة",
        safety_notes_en: "Ensure a safe space",
      },
      {
        disability_type_id: disabilityMap.intellectual,
        category_id: categoryMap.speed,
        title_ar: "لعبة Simon Says",
        title_en: "Simon Says Game",
        instructions_ar: "العب لعبة Simon Says مع إشارات بصرية. نفذ الحركة بسرعة عندما ترى الإشارة.",
        instructions_en: "Play Simon Says with visual signals. Execute the movement quickly when you see the signal.",
        difficulty: "medium",
        equipment: "visual cards",
        duration_reps: "10 minutes",
        safety_notes_ar: "ابدأ بحركات بسيطة",
        safety_notes_en: "Start with simple movements",
      },

      // Visual impairment exercises
      {
        disability_type_id: disabilityMap.visual,
        category_id: categoryMap.balance,
        title_ar: "الوقوف على قدم واحدة مع إرشاد صوتي",
        title_en: "Single Leg Stand with Audio Guidance",
        instructions_ar: "قف على قدم واحدة مع الاستماع لصوت المرشد الذي يعد لك من 1 إلى 10.",
        instructions_en: "Stand on one foot while listening to a guide's voice counting from 1 to 10.",
        difficulty: "medium",
        equipment: "audio device",
        duration_reps: "10 seconds each leg",
        safety_notes_ar: "استخدم جداراً أو كرسياً للدعم إذا لزم الأمر",
        safety_notes_en: "Use a wall or chair for support if needed",
      },
      {
        disability_type_id: disabilityMap.visual,
        category_id: categoryMap.balance,
        title_ar: "المشي على خط ملموس",
        title_en: "Walk on Tactile Line",
        instructions_ar: "امشِ على حبل أو خط ملموس مثبت على الأرض، مع الاستماع لتعليمات صوتية.",
        instructions_en: "Walk on a rope or tactile line fixed on the floor, listening to audio instructions.",
        difficulty: "medium",
        equipment: "rope or tactile line",
        duration_reps: "5 meters",
        safety_notes_ar: "تأكد من خلو المسار من العوائق",
        safety_notes_en: "Ensure the path is clear of obstacles",
      },

      // Hearing impairment exercises
      {
        disability_type_id: disabilityMap.hearing,
        category_id: categoryMap.strength,
        title_ar: "تمارين المقاومة مع إشارات بصرية",
        title_en: "Resistance Exercises with Visual Cues",
        instructions_ar: "استخدم حزام مقاومة أو أوزان خفيفة. اتبع إشارات بصرية على شاشة أو من مرشد.",
        instructions_en: "Use a resistance band or light weights. Follow visual cues on a screen or from a guide.",
        difficulty: "medium",
        equipment: "resistance band",
        duration_reps: "10 repetitions",
        safety_notes_ar: "حافظ على الحركة البطيئة والمتحكم فيها",
        safety_notes_en: "Maintain slow and controlled movement",
      },
      {
        disability_type_id: disabilityMap.hearing,
        category_id: categoryMap.endurance,
        title_ar: "نط الحبل مع دعم بصري",
        title_en: "Jump Rope with Visual Support",
        instructions_ar: "انط الحبل مع مشاهدة مؤقت على الشاشة. استمر لمدة 30 ثانية.",
        instructions_en: "Jump rope while watching a timer on screen. Continue for 30 seconds.",
        difficulty: "medium",
        equipment: "jump rope, visual timer",
        duration_reps: "30 seconds",
        safety_notes_ar: "ارتدِ أحذية رياضية مناسبة",
        safety_notes_en: "Wear appropriate athletic shoes",
      },

      // Motor impairment exercises
      {
        disability_type_id: disabilityMap.motor,
        category_id: categoryMap.strength,
        title_ar: "تمارين الحبل المطاطي",
        title_en: "Resistance Band Exercises",
        instructions_ar: "استخدم حبل مطاطي خفيف. اسحبه ببطء باتجاهات مختلفة حسب قدرتك.",
        instructions_en: "Use a light resistance band. Pull it slowly in different directions as you're able.",
        difficulty: "easy",
        equipment: "light resistance band",
        duration_reps: "5 repetitions per direction",
        safety_notes_ar: "لا تمدد الحبل أكثر من اللازم",
        safety_notes_en: "Don't overstretch the band",
      },
      {
        disability_type_id: disabilityMap.motor,
        category_id: categoryMap.balance,
        title_ar: "التوازن مع دعم بسيط",
        title_en: "Balance with Light Support",
        instructions_ar: "قف بجانب كرسي أو حائط. حاول التوازن على قدم واحدة لبضع ثوانٍ، مع استخدام الدعم إذا لزم الأمر.",
        instructions_en: "Stand next to a chair or wall. Try to balance on one foot for a few seconds, using support if needed.",
        difficulty: "easy",
        equipment: "chair for support",
        duration_reps: "5 seconds each leg",
        safety_notes_ar: "لا تجبر نفسك",
        safety_notes_en: "Don't force yourself",
      },
    ];

    // Insert exercises
    const { error: insertError } = await supabaseClient
      .from("exercises")
      .insert(exercises);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ message: "Exercises seeded successfully", count: exercises.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding exercises:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
