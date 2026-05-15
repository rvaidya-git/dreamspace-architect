import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role key so this works regardless of RLS state
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: profile } = await supabaseAdmin
      .from('player_profiles')
      .select('username_display')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    // Always return success — don't reveal whether the email was found
    if (!profile) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    // Update RESEND_FROM_EMAIL in Supabase secrets to use your own verified sender.
    // For testing you can use: onboarding@resend.dev
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `DreamSpace Architect <${fromEmail}>`,
        to: [email.trim()],
        subject: 'Your DreamSpace Architect username',
        html: `
          <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 40px 20px; text-align: center;">
            <div style="font-size: 56px; margin-bottom: 8px;">🏗️</div>
            <h2 style="color: #1a1a2e; margin-bottom: 4px;">Your username is:</h2>
            <div style="background: #f0fdf4; border: 2px solid #4ade80; border-radius: 14px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 30px; font-weight: 800; color: #166534; margin: 0; letter-spacing: -0.5px;">
                ${profile.username_display}
              </p>
            </div>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Head back to the game, click <strong>Log In With Username</strong>, and type the username above to continue designing!
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error: ${body}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
