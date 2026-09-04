# n8n Node and Integration Registry

**Snapshot:** v2026-08 · reviewed 2026-08-09  
**Scope:** Official n8n catalog, official n8n GitHub node packages, and a curated
set of popular community/partner packages.

## Registry markers

| Marker | Availability | Generation rule |
| --- | --- | --- |
| **CORE** | Bundled in official n8n base nodes. | Available on a compatible current instance. |
| **AI CORE** | Bundled official n8n AI/LangChain nodes. | Confirm the target instance includes the AI package. |
| **COMMUNITY** | Separate npm package. | Stop and warn: administrator review and explicit installation are required. |
| **HTTP FALLBACK** | No verified built-in node is required. | Use HTTP Request only after verifying the API contract. |

The official catalog is large and changes often. At review, it listed about 1,905
integrations overall and 949 partner/community integrations. This is a grouped,
curated validation registry, not a claim that every marketplace integration is
bundled.

## Mandatory validation

Before producing an import-ready workflow:

1. Record the exact target n8n version and installed node packages.
2. Confirm every node type in this registry and the target instance's node list.
3. Confirm each exact typeVersion, operation, parameter schema, credential key, and
   AI connection type from the target instance. Do not guess these from this summary.
4. For a COMMUNITY entry, warn about package installation, security review, and
   non-production testing before generating workflow JSON.
5. If an integration is absent, flag it as unverified. Do not invent a node type.
   Use HTTP FALLBACK only when the third-party API is verified.

## Core

All entries below are **CORE** unless marked otherwise.

| Capability | Built-in node or family | Typical type |
| --- | --- | --- |
| Incoming HTTP | Webhook; Respond to Webhook | n8n-nodes-base.webhook; n8n-nodes-base.respondToWebhook |
| Timed execution | Schedule Trigger | n8n-nodes-base.scheduleTrigger |
| Testing | Manual Trigger | n8n-nodes-base.manualTrigger |
| Form intake | Form Trigger; Form | n8n-nodes-base.formTrigger; n8n-nodes-base.form |
| Generic API | HTTP Request | n8n-nodes-base.httpRequest |
| Field mapping | Edit Fields (Set) | n8n-nodes-base.set |
| Deterministic custom logic | Code | n8n-nodes-base.code |
| Conditional routing | If; Switch; Filter | n8n-nodes-base.if; n8n-nodes-base.switch; n8n-nodes-base.filter |
| Stream joins | Merge; Compare Datasets | n8n-nodes-base.merge; n8n-nodes-base.compareDatasets |
| Batching | Loop Over Items (Split In Batches) | n8n-nodes-base.splitInBatches |
| Delay/resume | Wait | n8n-nodes-base.wait |
| Subworkflows | Execute Sub-workflow; sub-workflow trigger | n8n-nodes-base.executeWorkflow; n8n-nodes-base.executeWorkflowTrigger |
| Failure path | Error Trigger; Stop And Error | n8n-nodes-base.errorTrigger; n8n-nodes-base.stopAndError |
| Data utilities | Aggregate; Sort; Limit; Summarize; Remove Duplicates | Verify exact local types |
| File and protocol utilities | Read/Write Files; FTP; SSH; SFTP; RSS | Verify exact local types |
| Databases and queues | Postgres; MySQL; Microsoft SQL; MongoDB; Redis; RabbitMQ; Kafka | Verify exact local types |
| Storage | AWS S3; Azure Blob Storage; Google Cloud Storage; Dropbox; Box | Verify exact local types |

## AI and media

| Integration/capability | Availability | Node/package guidance |
| --- | --- | --- |
| AI Agent | **AI CORE** | @n8n/n8n-nodes-langchain.agent |
| Basic LLM Chain | **AI CORE** | @n8n/n8n-nodes-langchain.chainLlm |
| OpenAI Chat Model | **AI CORE** | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| OpenRouter Chat Model | **AI CORE** | @n8n/n8n-nodes-langchain.lmChatOpenRouter |
| Anthropic, Gemini, Ollama chat models | **AI CORE** | Confirm local node type and credential key. |
| Memory, embeddings, vector stores, retrievers, output parsers, tools | **AI CORE** | Use only locally verified AI connector types, such as ai_languageModel, ai_memory, and ai_tool. |
| Image, video, audio providers | **HTTP FALLBACK** or verified node | Do not assume a provider node exists. |
| Tavily search | **COMMUNITY** | Package: @tavily/n8n-nodes-tavily |
| Apify actors/scraping | **COMMUNITY** | Package: @apify/n8n-nodes-apify |
| You.com search | **COMMUNITY** | Package: @youdotcom-oss/n8n-nodes-youdotcom |
| Agent700 agent/context tools | **COMMUNITY** | Package: @a700/n8n-nodes-agent700 |

## Google

| Integration | Availability | Notes |
| --- | --- | --- |
| Gmail and Gmail Trigger | **CORE** | Mail, thread, label, and trigger operations |
| Google Sheets and Sheets Trigger | **CORE** | Spreadsheet/document/row operations and trigger |
| Google Drive | **CORE** | File and folder operations |
| Google Calendar and Calendar Trigger | **CORE** | Event/calendar operations and trigger |
| Google Docs; Google Slides | **CORE** | Document and presentation operations |
| Google Contacts; Google Tasks; Google Forms | **CORE** | Confirm current supported operation locally |
| BigQuery; Google Analytics; Search Console; Google Ads | **CORE** | Reporting/data operations |
| Google Chat | **CORE** | Message and space operations |
| Unsupported Google API | **HTTP FALLBACK** | Verify OAuth scopes and API contract |

## Microsoft

| Integration | Availability | Notes |
| --- | --- | --- |
| Outlook and Outlook Trigger | **CORE** | Mail, calendar, contact, and event operations |
| Teams | **CORE** | Channel/chat/message operations |
| OneDrive; SharePoint | **CORE** | File, list, and site operations |
| Excel 365 | **CORE** | Workbook/table/row operations |
| To Do; OneNote | **CORE** | Task and note operations |
| Dynamics 365; Power BI | **CORE** | Verify current local operation support |
| Unrepresented Microsoft Graph API | **HTTP FALLBACK** | Verify OAuth credential and Graph contract |

## Messaging

| Integration | Availability | Notes |
| --- | --- | --- |
| Slack and Slack Trigger | **CORE** | Channel/message/user operations and event trigger |
| Discord | **CORE** | Message/channel operations |
| Telegram and Telegram Trigger | **CORE** | Bot messaging/files and trigger |
| Twilio | **CORE** | SMS, voice, and messaging operations |
| WhatsApp Business Cloud | **CORE** | Business messaging operations |
| Gmail; SMTP; Send Email; SendGrid; IMAP | **CORE** | Outbound/inbound email operations |
| Zoom; Webex | **CORE** | Verify target-instance capabilities |
| Line; MessageBird; Pushover; Mattermost | **CORE** when present | Confirm type and credential key locally |

## CRM and support

| Integration | Availability | Notes |
| --- | --- | --- |
| HubSpot | **CORE** | CRM object, engagement, and marketing operations |
| Salesforce | **CORE** | Object/query operations |
| Pipedrive; Zoho CRM | **CORE** | CRM module operations |
| Freshdesk; Zendesk; Intercom; Help Scout | **CORE** | Ticket/contact/conversation operations |
| ServiceNow | **CORE** | Verify table/incident operation locally |
| Close; Attio; Copper; Front; Crisp | **HTTP FALLBACK** unless verified locally | Marketplace listing does not mean bundled availability |

## Work management and developer tools

| Integration | Availability | Notes |
| --- | --- | --- |
| Notion; Airtable | **CORE** | Page/database and record/table operations |
| ClickUp; Asana; Trello; Monday.com; Linear; Todoist | **CORE** | Project, board, list, and task operations |
| Jira and Jira Trigger | **CORE** | Issue/project operations and trigger |
| GitHub and GitHub Trigger; GitLab and GitLab Trigger; Bitbucket | **CORE** | Repository and developer-workflow operations |
| Confluence; Coda; Smartsheet | **CORE** | Content/table/sheet operations |
| n8n | **CORE** | Instance/workflow calls require explicit permissions |

## Payments and commerce

| Integration | Availability | Notes |
| --- | --- | --- |
| Stripe and Stripe Trigger | **CORE** | Payments, customers, subscriptions, invoices, and trigger |
| PayPal; Square | **CORE** | Payment and catalog/customer operations |
| Shopify and Shopify Trigger; WooCommerce and trigger | **CORE** | Store/order/product operations and trigger |
| QuickBooks Online; Xero | **CORE** | Accounting objects and reports |
| Chargebee | **CORE** when present | Verify exact local node/version |
| Razorpay; Mollie; Paddle; Braintree | **HTTP FALLBACK** unless verified locally | Verify idempotency and payment side effects |

## Marketing, forms, and data

| Integration | Availability | Notes |
| --- | --- | --- |
| Mailchimp; ActiveCampaign; ConvertKit; Brevo | **CORE** | Audience/contact/campaign operations |
| Facebook Lead Ads Trigger; Facebook Pages/Graph API | **CORE** | Lead event and page/post operations |
| Instagram; LinkedIn | **CORE** or **HTTP FALLBACK** | Verify target operation and permission scope |
| Typeform and trigger; Jotform and trigger | **CORE** | Form response operations and trigger |
| SurveyMonkey | **CORE** when present | Verify exact local node |
| Webflow; WordPress | **CORE** | CMS and media operations |
| PostHog | **CORE** when present | Verify event schema locally |
| Supabase | **CORE** or Postgres/HTTP fallback | Use a non-browser, least-privilege credential |
| PostgreSQL; MySQL; MongoDB | **CORE** | Network and credential review required |
| CSV; JSON; XML; spreadsheet files | **CORE** | Use native data/file utilities |
| Baserow; NocoDB | **CORE** when present | Verify exact local node |

## Community-node installation gate

For a requested **COMMUNITY** node, show this warning before JSON:

~~~text
This integration is a community node and is not automatically available on a standard
n8n installation.

Required package: <package name>
Required action: an n8n administrator must review, install, and test this package on
the target self-hosted instance before the workflow can be imported.
Fallback: use HTTP Request only if the provider API and authentication contract are
verified.
~~~

Do not install a community package while generating a workflow. Require explicit
approval. Review source provenance, license, update cadence, permissions, and
compatibility; test in a non-production instance first.

## Refresh procedure

1. Record the target n8n version and installed packages.
2. Review the official built-in catalog and base-node package.
3. Review the official partner-built catalog for verified community packages.
4. Test requested nodes outside production and capture type, typeVersion, operations,
   credential key, and export shape.
5. Update the snapshot date and only add observed facts.

## Sources

- [n8n integrations catalog](https://n8n.io/integrations/)
- [n8n verified community and partner integrations](https://n8n.io/integrations/partner-built/)
- [official n8n base-nodes package](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base)
- [n8n community-node installation guidance](https://docs.n8n.io/integrations/community-nodes/installation/)
