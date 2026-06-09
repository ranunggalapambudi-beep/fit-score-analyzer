import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ContactMessageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(2000),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const parsed = ContactMessageSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const { name, email, subject, message } = parsed.data;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = subject ? escapeHtml(subject) : "";
    const safeMessage = escapeHtml(message);
    
    // Admin email to notify
    const adminEmail = "nafisa.arifp@gmail.com";
    
    // Send notification to admin
    const emailResponse = await resend.emails.send({
      from: "HiroCross Measure <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `[HiroCross] Pesan Baru dari ${name}: ${subject || 'Tanpa Subjek'}`.slice(0, 250),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: 600; color: #374151; margin-bottom: 5px; font-size: 14px; }
            .field-value { background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #3B82F6; }
            .message-box { background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; white-space: pre-wrap; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .btn { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Pesan Kontak Baru</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Nama Pengirim</div>
                <div class="field-value">${safeName}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${safeEmail}</div>
              </div>
              <div class="field">
                <div class="field-label">Subjek</div>
                <div class="field-value">${safeSubject || 'Tidak ada subjek'}</div>
              </div>
              <div class="field">
                <div class="field-label">Pesan</div>
                <div class="message-box">${safeMessage}</div>
              </div>
              <center>
                <a href="mailto:${safeEmail}" class="btn">Balas Email</a>
              </center>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis dari HiroCross Measure</p>
              <p>© 2025 HiroCross Measure - Platform Pengukuran Biomotor</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-admin-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
