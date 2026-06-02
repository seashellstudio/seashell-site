# Resend Onboarding Email Automation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a client confirmation email and a Tyler notification email via Resend every time a row is inserted into `onboarding_submissions` in Supabase.

**Architecture:** A PostgreSQL trigger (using `pg_net`) fires on every INSERT into `onboarding_submissions` and POSTs the new row to a Supabase Edge Function named `send-onboarding-email`. The Edge Function calls the Resend API to send two emails in parallel. No frontend changes.

**Tech Stack:** Supabase Edge Functions (Deno / TypeScript), pg_net (PostgreSQL HTTP extension), Resend API, PostgreSQL trigger + `apply_migration`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `Seashell_studio_website/supabase/functions/send-onboarding-email/index.ts` | Create | Edge Function — receives trigger payload, sends both emails via Resend |

No changes to `main.js`, `index.html`, or any CSS files.

---

### Task 1: Create the Edge Function file

**Files:**
- Create: `Seashell_studio_website/supabase/functions/send-onboarding-email/index.ts`

- [ ] **Step 1: Write the function**

Create `Seashell_studio_website/supabase/functions/send-onboarding-email/index.ts` with this exact content:

```typescript
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
          from: "support@seashellstudio.ca",
          to: clientEmail,
          subject: "Thanks for your submission — Seashell Studio",
          text: clientBody,
        }),
      }),
      fetch(RESEND_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          from: "support@seashellstudio.ca",
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
```

- [ ] **Step 2: Commit**

Run from `Seashell_studio_website/`:
```bash
git add supabase/functions/send-onboarding-email/index.ts
git commit -m "feat: add resend onboarding email edge function"
```

---

### Task 2: Add the RESEND_API_KEY secret in Supabase *(manual step — must be done before deployment)*

**Files:** None — this is done in the Supabase dashboard by Tyler

The Edge Function reads `RESEND_API_KEY` from `Deno.env`. Without this secret set in Supabase, every function invocation will fail with "RESEND_API_KEY secret not configured".

- [ ] **Step 1: Direct Tyler to the Supabase secrets page**

Ask Tyler to open this URL:
```
https://app.supabase.com/project/gqnrotkkoibtnmjgtkpt/settings/functions
```

- [ ] **Step 2: Give Tyler these exact instructions**

1. Scroll down to the **"Secrets Management"** section on that page
2. Click **"Add new secret"** (or "New secret")
3. In the **Name** field, type exactly: `RESEND_API_KEY`
4. In the **Value** field, paste the API key from the file at `C:\Users\tyler\Desktop\Seashell Studio\Code\Business\new-client-draft\Email template` (it starts with `re_`)
5. Click **Save**

- [ ] **Step 3: Confirm Tyler has saved the secret before continuing**

Ask Tyler: *"Has the secret been saved in Supabase?"* Do not proceed to Task 3 until confirmed.

---

### Task 3: Deploy the Edge Function

**Files:** None modified — reads the file created in Task 1

- [ ] **Step 1: Read the function file**

Read `Seashell_studio_website/supabase/functions/send-onboarding-email/index.ts`.

- [ ] **Step 2: Deploy using the Supabase MCP tool**

Call `mcp__claude_ai_Supabase__deploy_edge_function` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "name": "send-onboarding-email",
  "entrypoint_path": "index.ts",
  "verify_jwt": true,
  "files": [
    {
      "name": "index.ts",
      "content": "<exact content of the file you just read>"
    }
  ]
}
```

Expected: a success response from Supabase. If it fails, check the error message — a `404` means the project ID is wrong; a `403` means authentication failed.

---

### Task 4: Create the database trigger

**Files:** None — SQL applied via MCP tool

The trigger uses `pg_net` to make an HTTP POST to the Edge Function every time a row is inserted. The anon key is used as the Bearer token — it is already public (hardcoded in `main.js`) and provides a valid Supabase JWT for the function to accept.

- [ ] **Step 1: Enable the pg_net extension**

Call `mcp__claude_ai_Supabase__apply_migration` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "name": "enable_pg_net",
  "query": "CREATE EXTENSION IF NOT EXISTS pg_net;"
}
```

Expected: success. If `pg_net` is already enabled this is a no-op — no error.

- [ ] **Step 2: Create the trigger function**

Call `mcp__claude_ai_Supabase__apply_migration` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "name": "create_onboarding_email_trigger_function",
  "query": "CREATE OR REPLACE FUNCTION public.trigger_send_onboarding_email()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nBEGIN\n  PERFORM net.http_post(\n    url := 'https://gqnrotkkoibtnmjgtkpt.supabase.co/functions/v1/send-onboarding-email',\n    headers := jsonb_build_object(\n      'Content-Type', 'application/json',\n      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxbnJvdGtrb2lidG5tamd0a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NjE2MDEsImV4cCI6MjA5MDIzNzYwMX0.kagTDYzlTfhAqhRuVw6D3Si6MRcdGe7F_X-lRyhFN3M'\n    ),\n    body := jsonb_build_object(\n      'type', 'INSERT',\n      'table', 'onboarding_submissions',\n      'record', row_to_json(NEW)::jsonb\n    )\n  );\n  RETURN NEW;\nEND;\n$$;"
}
```

Expected: `CREATE FUNCTION` — no error.

- [ ] **Step 3: Attach the trigger to the table**

Call `mcp__claude_ai_Supabase__apply_migration` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "name": "create_onboarding_email_trigger",
  "query": "DROP TRIGGER IF EXISTS send_onboarding_email_trigger ON public.onboarding_submissions;\nCREATE TRIGGER send_onboarding_email_trigger\n  AFTER INSERT ON public.onboarding_submissions\n  FOR EACH ROW\n  EXECUTE FUNCTION public.trigger_send_onboarding_email();"
}
```

Expected: `DROP TRIGGER`, `CREATE TRIGGER` — no error.

- [ ] **Step 4: Verify the trigger exists**

Call `mcp__claude_ai_Supabase__execute_sql` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "query": "SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE event_object_table = 'onboarding_submissions';"
}
```

Expected: one row — `trigger_name = send_onboarding_email_trigger`, `event_manipulation = INSERT`, `action_timing = AFTER`.

If the row is missing, Task 4 Step 3 failed silently — recheck the SQL and re-run.

---

### Task 5: End-to-end test

**Files:** None

- [ ] **Step 1: Insert a test row**

Call `mcp__claude_ai_Supabase__execute_sql` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "query": "INSERT INTO public.onboarding_submissions (business_name, email, main_customers, location) VALUES ('Test Business', 'seashellstudiog@gmail.com', 'test customers', 'Waterloo, ON');"
}
```

Both emails go to Tyler's inbox for this test (the client email field is set to Tyler's address so both arrive in one place).

- [ ] **Step 2: Check the Edge Function logs**

Wait 10 seconds, then call `mcp__claude_ai_Supabase__get_logs` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "service": "edge-function"
}
```

**If the log shows status 200** and the response body contains Resend email IDs (e.g. `{"client":{"id":"abc123..."},"tyler":{"id":"def456..."}}`) — emails sent successfully. Proceed to Step 3.

**If the log shows `RESEND_API_KEY secret not configured`** — the secret in Task 2 was not saved. Ask Tyler to redo Task 2 and re-run the test insert.

**If there are no logs at all** — the trigger didn't fire or pg_net isn't active. Re-run Task 4 Steps 1–3 and try the test insert again.

**If status is 500 with a Resend error** — check the Resend error message. A `403` means the API key is wrong. A `422` means the from-address domain isn't verified.

- [ ] **Step 3: Ask Tyler to check their inbox**

Ask Tyler: *"Can you check seashellstudiog@gmail.com? You should see two new emails — one with subject 'Thanks for your submission — Seashell Studio' and one with subject 'New onboarding submission from Test Business'."*

If both arrive: success. If neither arrives but logs show 200, check the spam folder.

- [ ] **Step 4: Delete the test row**

Call `mcp__claude_ai_Supabase__execute_sql` with:

```json
{
  "project_id": "gqnrotkkoibtnmjgtkpt",
  "query": "DELETE FROM public.onboarding_submissions WHERE business_name = 'Test Business' AND email = 'seashellstudiog@gmail.com';"
}
```

Done. The next real client submission will now automatically send both emails.
