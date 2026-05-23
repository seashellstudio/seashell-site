import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_URL = "https://api.resend.com/emails";

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload?.record;

    const businessName: string | undefined = record?.business_name;
    const clientEmail: string | undefined = record?.email;

    if (!businessName || !clientEmail) {
      return new Response("Missing required fields — no email sent", { status: 200 });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response("RESEND_API_KEY secret not configured", { status: 500 });
    }

    const clientBody = `Hi ${businessName},

Thank you so much for filling out the onboarding form. We're excited to work with you!

Your submission has been received and I'll be personally reviewing everything you shared to get started on your project.

Here's what to expect next:

Once I've had a chance to put together an initial draft based on your information, I'll be reaching out with:
 - A rough draft for you to review and comment on
 - A client contract
 - An invoice

In the meantime, if you have any questions don't hesitate to reach out at support@seashellstudio.ca

We'll be in touch,

Tyler - Seashell Studio
seashellstudio.ca`;

    const authHeaders = {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    };

    const [clientResult, tylerResult] = await Promise.allSettled([
      fetch(RESEND_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          from: "noreply@seashellstudio.ca",
          to: clientEmail,
          subject: "Thanks for your submission — Seashell Studio",
          text: clientBody,
        }),
      }),
      fetch(RESEND_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          from: "noreply@seashellstudio.ca",
          to: "seashellstudiog@gmail.com",
          subject: `New onboarding submission from ${businessName}`,
          text: `New submission received from ${businessName} (${clientEmail}).`,
        }),
      }),
    ]);

    const clientJson =
      clientResult.status === "fulfilled"
        ? await clientResult.value.json()
        : { error: String(clientResult.reason) };

    const tylerJson =
      tylerResult.status === "fulfilled"
        ? await tylerResult.value.json()
        : { error: String(tylerResult.reason) };

    const allOk =
      clientResult.status === "fulfilled" &&
      clientResult.value.ok &&
      tylerResult.status === "fulfilled" &&
      tylerResult.value.ok;

    return new Response(
      JSON.stringify({ client: clientJson, tyler: tylerJson }),
      {
        status: allOk ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
