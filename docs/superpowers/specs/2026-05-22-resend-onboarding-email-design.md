# Design: Resend Onboarding Email Automation

**Date:** 2026-05-22
**Status:** Approved

---

## Overview

Automatically send two emails whenever a client completes the onboarding form and their submission lands in Supabase:

1. A confirmation email to the client
2. A ping notification to Tyler

No changes to the frontend. The trigger and sending are entirely server-side.

---

## Architecture

```
Client submits form
       ↓
main.js inserts row into onboarding_submissions (Supabase)
       ↓
Supabase Database Webhook fires on INSERT
       ↓
Edge Function: send-onboarding-email (Deno, hosted on Supabase)
       ↓
Resend API → two emails sent independently
```

---

## Components

### 1. Supabase Database Webhook

- **Table:** `onboarding_submissions`
- **Event:** `INSERT`
- **Target:** The `send-onboarding-email` Edge Function URL
- **Payload:** Full new row data including `business_name` and `email`
- Configured in the Supabase dashboard under Database → Webhooks

### 2. Edge Function: `send-onboarding-email`

- **Runtime:** Deno (Supabase Edge Functions default)
- **Location:** `supabase/functions/send-onboarding-email/index.ts`
- **Trigger:** HTTP POST from the database webhook

Responsibilities:
1. Parse the webhook payload and extract `business_name` and `email` from the new row
2. Exit early (no-op) if either field is missing
3. Send the client confirmation email via Resend
4. Send Tyler's notification email via Resend
5. Both sends are independent — a failure in one does not block the other
6. Return HTTP 200 on success; non-200 on failure (triggers Supabase webhook retry)

### 3. Resend API Secret

- **Secret name:** `RESEND_API_KEY`
- Stored in Supabase project secrets (not in any code file)
- Value: the key from the Email Template file
- Injected into the Edge Function as `Deno.env.get('RESEND_API_KEY')`

---

## Email Specifications

### Client Confirmation Email

| Field | Value |
|---|---|
| From | `support@seashellstudio.ca` |
| To | Client's submitted email |
| Subject | `Thanks for your submission — Seashell Studio` |
| Body | Template below (plain text) |

**Body template** (`[Client Name]` replaced with the `business_name` field):

```
Hi [Client Name],

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
seashellstudio.ca
```

### Tyler's Notification Email

| Field | Value |
|---|---|
| From | `support@seashellstudio.ca` |
| To | `seashellstudiog@gmail.com` |
| Subject | `New onboarding submission from [Business Name]` |
| Body | `New submission received from [Business Name] ([client email]).` |

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Resend API call fails | Function returns non-200; Supabase retries the webhook automatically |
| `business_name` or `email` missing from row | Function exits early with 200 (no retry needed — bad data won't improve) |
| One email fails, the other succeeds | Both are sent in independent try/catch blocks; partial success is acceptable |
| Form submission itself fails | Webhook never fires — email never sent. Correct behaviour. |

Client-facing form flow is unaffected by any email failure. The client always lands on `thank-you.html` once the Supabase insert succeeds.

---

## Out of Scope

- HTML/styled emails (plain text only for now)
- Including full submission details in Tyler's notification
- Stripe or contract automation
- Email open/click tracking
