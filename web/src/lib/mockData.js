// Mock data layer for local/demo runs without Supabase or Google Sheets.
// Dates are generated relative to "now" so the dashboard always looks live.

function daysAgo(n, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const track = [
  {
    id: 'a1b2c3d4-0001',
    customer_name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '',
    service: 'Full-home cleaning',
    completion_date: daysAgo(12, 14),
    channel: 'email',
    status: 'reviewed',
    feedback_sent_at: daysAgo(11, 9),
    feedback_reply_at: daysAgo(10, 16),
    reply_text: 'Fantastic service, very thorough. Would absolutely recommend.',
    issue_flagged: 'FALSE',
    issue_summary: '',
    issue_resolved_at: '',
    review_link_id: 'a1b2c3d4-0001',
    review_sent_at: daysAgo(11, 9),
    review_click_count: 2,
    last_clicked_at: daysAgo(11, 12),
    review_posted: 'TRUE',
    review_rating: '5',
    review_text: 'Thorough and professional. Highly recommended.',
    review_url: 'https://maps.google.com/review/1',
    reminder_sent_at: '',
    created_at: daysAgo(11, 8),
    updated_at: daysAgo(10, 16),
  },
  {
    id: 'b2c3d4e5-0002',
    customer_name: 'Sofia Rossi',
    email: 'sofia.rossi@example.com',
    phone: '',
    service: 'Deep carpet clean',
    completion_date: daysAgo(9, 11),
    channel: 'email',
    status: 'replied',
    feedback_sent_at: daysAgo(8, 10),
    feedback_reply_at: daysAgo(7, 13),
    reply_text: 'Good job overall, the stains came out nicely.',
    issue_flagged: 'FALSE',
    issue_summary: '',
    issue_resolved_at: '',
    review_link_id: 'b2c3d4e5-0002',
    review_sent_at: daysAgo(8, 10),
    review_click_count: 1,
    last_clicked_at: daysAgo(8, 15),
    review_posted: 'FALSE',
    review_rating: '',
    review_text: '',
    review_url: '',
    reminder_sent_at: '',
    created_at: daysAgo(8, 9),
    updated_at: daysAgo(7, 13),
  },
  {
    id: 'c3d4e5f6-0003',
    customer_name: 'Liam Chen',
    email: 'liam.chen@example.com',
    phone: '',
    service: 'Window cleaning',
    completion_date: daysAgo(6, 9),
    channel: 'email',
    status: 'issue',
    feedback_sent_at: daysAgo(5, 9),
    feedback_reply_at: daysAgo(4, 18),
    reply_text: "The windows were cleaned but there are streaks left and one pane was scratched. Not happy.",
    issue_flagged: 'TRUE',
    issue_summary: 'Streaking and a scratched pane after window cleaning.',
    issue_resolved_at: '',
    review_link_id: 'c3d4e5f6-0003',
    review_sent_at: daysAgo(5, 9),
    review_click_count: 0,
    last_clicked_at: '',
    review_posted: 'FALSE',
    review_rating: '',
    review_text: '',
    review_url: '',
    reminder_sent_at: '',
    created_at: daysAgo(5, 8),
    updated_at: daysAgo(4, 18),
  },
  {
    id: 'd4e5f6a7-0004',
    customer_name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '',
    service: 'Oven degrease',
    completion_date: daysAgo(4, 13),
    channel: 'email',
    status: 'contacted',
    feedback_sent_at: daysAgo(3, 10),
    feedback_reply_at: '',
    reply_text: '',
    issue_flagged: 'FALSE',
    issue_summary: '',
    issue_resolved_at: '',
    review_link_id: 'd4e5f6a7-0004',
    review_sent_at: daysAgo(3, 10),
    review_click_count: 0,
    last_clicked_at: '',
    review_posted: 'FALSE',
    review_rating: '',
    review_text: '',
    review_url: '',
    reminder_sent_at: '',
    created_at: daysAgo(3, 9),
    updated_at: daysAgo(3, 10),
  },
  {
    id: 'e5f6a7b8-0005',
    customer_name: 'Noah Garcia',
    email: 'noah.garcia@example.com',
    phone: '',
    service: 'Pressure washing',
    completion_date: daysAgo(2, 10),
    channel: 'email',
    status: 'reminded',
    feedback_sent_at: daysAgo(6, 10),
    feedback_reply_at: '',
    reply_text: '',
    issue_flagged: 'FALSE',
    issue_summary: '',
    issue_resolved_at: '',
    review_link_id: 'e5f6a7b8-0005',
    review_sent_at: daysAgo(6, 10),
    review_click_count: 0,
    last_clicked_at: '',
    review_posted: 'FALSE',
    review_rating: '',
    review_text: '',
    review_url: '',
    reminder_sent_at: daysAgo(1, 10),
    created_at: daysAgo(6, 9),
    updated_at: daysAgo(1, 10),
  },
];

const issues = [
  {
    id: 'issue-c3d4e5f6-0003',
    track_id: 'c3d4e5f6-0003',
    customer_name: 'Liam Chen',
    email: 'liam.chen@example.com',
    summary: 'Streaking and a scratched pane after window cleaning.',
    severity: 'high',
    status: 'open',
    created_at: daysAgo(4, 18),
    resolved_at: '',
  },
];

const reviews = [
  {
    id: 'review-1',
    track_id: 'a1b2c3d4-0001',
    author: 'Aarav Mehta',
    rating: '5',
    text: 'Thorough and professional. Highly recommended.',
    url: 'https://maps.google.com/review/1',
    captured_at: daysAgo(10, 12),
    review_link_id: 'a1b2c3d4-0001',
    source: 'gbp_sync',   // auto-synced via SerpAPI
  },
  {
    id: 'review-2',
    track_id: '',
    author: 'Priya Sharma',
    rating: '5',
    text: 'Great people, quick and friendly service.',
    url: 'https://maps.google.com/review/2',
    captured_at: daysAgo(18, 9),
    review_link_id: '',
    source: 'gbp_sync',
  },
  {
    id: 'review-3',
    track_id: '',
    author: 'Marcus Lee',
    rating: '4',
    text: 'Solid work. Would book again.',
    url: 'https://maps.google.com/review/3',
    captured_at: daysAgo(25, 11),
    review_link_id: '',
    source: 'gbp_sync',
  },
];

const activity = [
  { id: 'a1', ts: daysAgo(0, 6), event: 'gbp_sync', track_id: '', detail: 'Google reviews synced via SerpAPI — 3 reviews on record' },
  { id: 'a2', ts: daysAgo(0, 9), event: 'reminder_sent', track_id: 'e5f6a7b8-0005', detail: 'Reminder sent to Noah Garcia' },
  { id: 'a3', ts: daysAgo(1, 18), event: 'issue_flagged', track_id: 'c3d4e5f6-0003', detail: 'Streaking and a scratched pane after window cleaning.' },
  { id: 'a4', ts: daysAgo(3, 10), event: 'email_sent', track_id: 'd4e5f6a7-0004', detail: 'Follow-up + review invite sent to Emma Wilson (email)' },
  { id: 'a5', ts: daysAgo(4, 16), event: 'click', track_id: 'c3d4e5f6-0003', detail: 'Review link clicked (1 total)' },
  { id: 'a6', ts: daysAgo(7, 13), event: 'reply_received', track_id: 'b2c3d4e5-0002', detail: 'Customer reply received' },
  { id: 'a7', ts: daysAgo(8, 12), event: 'click', track_id: 'b2c3d4e5-0002', detail: 'Review link clicked (1 total)' },
  { id: 'a8', ts: daysAgo(10, 12), event: 'review_captured', track_id: 'a1b2c3d4-0001', detail: 'New 5★ review from Aarav Mehta — auto-synced from Google' },
  { id: 'a9', ts: daysAgo(11, 9), event: 'email_sent', track_id: 'a1b2c3d4-0001', detail: 'Follow-up + review invite sent to Aarav Mehta (email)' },
];

// Mutable store so demo actions (resolve issue, etc.) work live.
const store = { track, issues, reviews, activity };

export function getMockSheet(sheet) {
  const rows = store[sheet] ?? [];
  return { rows: rows.map((r) => ({ ...r })) };
}

export function mockResolveIssue(issueId) {
  const issue = store.issues.find((r) => r.id === issueId);
  if (!issue) throw new Error('Issue not found');
  issue.status = 'resolved';
  issue.resolved_at = new Date().toISOString();
  const trackRow = store.track.find((r) => r.id === issue.track_id);
  if (trackRow) trackRow.issue_resolved_at = issue.resolved_at;
  return { ok: true };
}