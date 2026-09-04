# Google Sheets Template for Review Engine

Create one spreadsheet with these five tabs, names exact (case-sensitive). Share the
spreadsheet with the service-account email used in the `sheets-proxy` Edge Function.

## Tab: `Track` — header row (staff add service-completion rows)

```
id | customer_name | email | phone | service | completion_date | channel | status | feedback_sent_at | feedback_reply_at | reply_text | issue_flagged | issue_summary | issue_resolved_at | review_link_id | review_sent_at | review_click_count | last_clicked_at | review_posted | review_rating | review_text | review_url | reminder_sent_at | created_at | updated_at
```

- `id`: any unique value (staff may paste a UUID or leave blank; n8n/W5 assigns).
- `channel`: default `email` (future `whatsapp`).
- `status`: leave blank; n8n writes `needs_info` / `contacted` / `replied` / `issue` /
  `reminded` / `reviewed` / `failed`.
- `review_link_id`: leave blank; W1 generates/persists it.
- The workflows also reference `business_name` in email templates — add a
  `business_name` column if you want it in the email body, otherwise the templates fall
  back to "The Team".

## Tab: `Issues` — header row (written by n8n W2, resolved via dashboard)

```
id | track_id | customer_name | email | summary | severity | status | created_at | resolved_at
```

## Tab: `Reviews` — header row (written by n8n W4 or Manual)

```
id | track_id | author | rating | text | url | captured_at | review_link_id
```

## Tab: `Activity` — header row (event log written by n8n)

```
id | ts | event | track_id | detail
```

Fixed `event` vocabulary: `email_sent`, `reply_received`, `issue_flagged`, `click`,
`reminder_sent`, `review_captured`, `failed`.

## Tab: `Manual` — fallback review intake (owner/staff enter; n8n consumes)

```
review_link_id | email | author | rating | text | url | captured_at
```

Used only while the Google Business Profile API (W4) is unverified — see
`n8n/CREDENTIALS.md`.