---
name: automation-architect
description: >
  Convert a plain-language automation requirement into an import-ready n8n workflow
  JSON document for a self-hosted n8n instance. Use for workflow design, n8n JSON
  generation, webhook or schedule automations, app integrations, branching, API
  calls, data transforms, and LLM-enabled flows. Verify every node type and
  node-specific parameter against source/registry.md before producing JSON. Flag a
  requested integration that is absent from the registry; never invent a node type,
  operation, parameter, credential type, or secret.
---

# n8n Automation Architect

## Purpose

Turn a clear automation request into one n8n workflow that can be imported into a
compatible n8n instance. Produce a safe, inspectable workflow definition, not an
untested sketch.

This skill targets self-hosted n8n deployments. Use native n8n nodes where
available, including n8n AI/LangChain nodes for LLM work. Use HTTP Request only
when there is no verified native node and the API contract is available.

## Required reference

Before emitting a workflow, read source/registry.md. Confirm every proposed node's
exact type, operation, current typeVersion, required parameters, and credential
key. The registry is the release-pinned source of truth.

If the requested integration is not in the registry, flag it. Offer an HTTP Request
alternative only when its API contract and authentication method are documented in
the registry. Otherwise, request that the integration be verified and added. Never
invent a node type, operation, parameter, or credential key from a remembered UI.

## Inputs

Identify or ask for:

- Trigger: webhook, schedule, manual, form, queue, or a verified app trigger.
- Source data and its expected shape.
- Ordered steps, decisions, retries, and terminal outputs.
- Accounts the client will configure as n8n credentials.
- Volume, latency, approval, and error-handling requirements.
- For LLM work: task, allowed model/provider, structured output, and fallback.

Ask targeted questions if an unknown detail changes behavior, access, or side
effects. Never assume a recipient, schedule, table ID, production endpoint, or
credential.

## Process

### 1. Normalize the request

Build this internal map:

~~~text
Trigger
  -> retrieve or receive data
  -> transform / enrich
  -> condition or route
  -> external action(s)
  -> success / failure outcome
~~~

Separate the trigger, steps, conditions, and outputs. Put validation and decisions
before side effects such as mail, record updates, or payments.

### 2. Map steps to verified n8n nodes

Use the registry to select exact node types:

| Need | Preferred node family |
| --- | --- |
| HTTP endpoint | Webhook / Respond to Webhook |
| Timed run | Schedule Trigger |
| API call | HTTP Request |
| Shape or rename data | Edit Fields (Set) |
| Custom deterministic logic | Code |
| Two-way decision | IF |
| Multi-route decision | Switch |
| Join streams | Merge |
| App action or trigger | The verified application node |
| LLM task | AI Agent or a LangChain chain with a connected chat model |

Use the smallest reliable graph. Use Code only where n8n expressions or nodes cannot
express the required deterministic logic. Code must never contain secrets.

For LLM work, use a registry-verified AI Agent or LangChain node and connect a
verified chat-model node through n8n's AI connection type (such as
ai_languageModel), not the ordinary main connection. Prefer structured output when
later steps depend on model fields.

### 3. Build workflow JSON

Emit one JSON object containing:

- A meaningful workflow name.
- A nodes array. Each node has a unique id, readable name, type, registry-verified
  typeVersion, position, and parameters.
- A connections object that wires every main and AI connection correctly.
- Only import-safe metadata needed by the n8n release pinned in the registry.

Use expressions for upstream data, for example: ={{ $json.customerEmail }}.

For every credential, use this placeholder shape:

~~~json
"credentials": {
  "<registryCredentialKey>": {
    "id": "__N8N_CREDENTIAL_ID__",
    "name": "__CONFIGURE_IN_N8N__"
  }
}
~~~

Replace registryCredentialKey only with the exact registry-verified key. The client
must attach their own credentials in n8n. Never include an API key, bearer token,
OAuth secret, database password, webhook secret, or real credential ID.

### 4. Validate before output

- [ ] Every node type exists exactly in source/registry.md.
- [ ] Every typeVersion, operation, parameter, and credential key matches the
      registry entry.
- [ ] Node names and IDs are unique; all connection targets exist.
- [ ] Every branch either terminates deliberately or rejoins the workflow.
- [ ] AI model nodes use the required AI connection type.
- [ ] Credential objects use placeholders and the JSON contains no literal secret.
- [ ] Expressions reference fields produced by an upstream path.
- [ ] Side-effecting steps have suitable failure behavior.
- [ ] The final object parses as JSON and conforms to the registry's n8n version.

If a check cannot pass, report the failure and what must be verified. Do not call
the workflow import-ready.

## Reusable sub-pattern: batch LLM classification

### Use case

Use this pattern for many similar records needing classification, extraction, or
scoring: survey responses, tickets, leads, or notes.

### Default graph

1. Retrieve rows.
2. Use Code to group 10–20 rows into one batch item.
3. Send each batch to a LangChain chain or AI Agent.
4. Require a JSON array that preserves each source row ID.
5. Parse and validate the model output in Code.
6. Write validated results to the destination.

Do not make one LLM call per row unless real-time, per-record context, or provider
limits require it. Reduce batch size for long source text or a large response.

### Batch-builder Code node

~~~javascript
const size = 15;
const rows = $input.all().map((item) => item.json);
const batches = [];

for (let index = 0; index < rows.length; index += size) {
  batches.push({
    json: {
      rows: rows.slice(index, index + size),
      batchNumber: index / size + 1,
    },
  });
}

return batches;
~~~

Require this model response shape:

~~~json
[
  { "row_id": "source-row-id", "label": "category", "confidence": 0.0 }
]
~~~

Before a write, validate that every returned row_id belongs to the corresponding
input batch. Route malformed or incomplete responses for review rather than
overwriting source data.

## Output format

Return, in this order:

1. A concise plain-English summary of the trigger, steps, routes, and outcomes.
2. A credential checklist naming each client account to configure in n8n.
3. One workflow JSON object in a json code block.
4. Any registry gaps, assumptions, or import limitations.

Do not return pseudo-JSON, secrets, unverified types, or unrelated deployment code.

## Worked examples

These examples demonstrate graph shape and safe credential stubs. Before importing,
validate every typeVersion, parameter schema, and credential key against
source/registry.md for the target n8n release.

### A. Google Sheets → LLM classification → Sheets write-back

**Summary:** Every hour, read survey responses, form 15-row batches, classify each
batch with a LangChain chain connected to an OpenRouter model, validate the returned
labels, and write them back to Google Sheets.

**Credentials to configure:** Google Sheets OAuth2 and OpenRouter API.

~~~json
{
  "name": "Classify Survey Responses in Batches",
  "nodes": [
    {
      "id": "schedule-trigger",
      "name": "Every Hour",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [-960, 0],
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 1 }] }
      }
    },
    {
      "id": "read-responses",
      "name": "Read Unclassified Responses",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "position": [-720, 0],
      "parameters": {
        "operation": "getAll",
        "documentId": "__GOOGLE_SHEET_ID__",
        "sheetName": "Responses"
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    },
    {
      "id": "make-batches",
      "name": "Make 15-Row Batches",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [-480, 0],
      "parameters": {
        "jsCode": "const size = 15;\nconst rows = $input.all().map((item) => item.json);\nconst batches = [];\nfor (let index = 0; index < rows.length; index += size) {\n  batches.push({ json: { rows: rows.slice(index, index + size), batchNumber: index / size + 1 } });\n}\nreturn batches;"
      }
    },
    {
      "id": "classify-batches",
      "name": "Classify Response Batches",
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1,
      "position": [-240, 0],
      "parameters": {
        "promptType": "define",
        "text": "=Classify this batch: {{ JSON.stringify($json.rows) }}. Return only a JSON array. Every item needs row_id, label, and confidence from 0 to 1."
      }
    },
    {
      "id": "openrouter-model",
      "name": "OpenRouter Chat Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
      "typeVersion": 1,
      "position": [-240, 220],
      "parameters": { "model": "__OPENROUTER_MODEL__" },
      "credentials": {
        "openRouterApi": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    },
    {
      "id": "validate-results",
      "name": "Validate Classification Results",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [0, 0],
      "parameters": {
        "jsCode": "const parsed = JSON.parse($json.text);\nif (!Array.isArray(parsed)) throw new Error('Expected an array from the classifier');\nreturn parsed.map((entry) => ({ json: entry }));"
      }
    },
    {
      "id": "write-results",
      "name": "Write Classifications",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "position": [240, 0],
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": "__GOOGLE_SHEET_ID__",
        "sheetName": "Responses",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "row_id": "={{ $json.row_id }}",
            "label": "={{ $json.label }}",
            "confidence": "={{ $json.confidence }}"
          }
        }
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    }
  ],
  "connections": {
    "Every Hour": {
      "main": [[{ "node": "Read Unclassified Responses", "type": "main", "index": 0 }]]
    },
    "Read Unclassified Responses": {
      "main": [[{ "node": "Make 15-Row Batches", "type": "main", "index": 0 }]]
    },
    "Make 15-Row Batches": {
      "main": [[{ "node": "Classify Response Batches", "type": "main", "index": 0 }]]
    },
    "OpenRouter Chat Model": {
      "ai_languageModel": [[{ "node": "Classify Response Batches", "type": "ai_languageModel", "index": 0 }]]
    },
    "Classify Response Batches": {
      "main": [[{ "node": "Validate Classification Results", "type": "main", "index": 0 }]]
    },
    "Validate Classification Results": {
      "main": [[{ "node": "Write Classifications", "type": "main", "index": 0 }]]
    }
  }
}
~~~

### B. Slack trigger → HTTP API → condition → email

**Summary:** A Slack event starts an API lookup. The workflow sends an email only
when the API returns a qualified status; the false branch stops with no email.

**Credentials to configure:** Slack OAuth2, a client API credential, and SMTP (or
the selected email-provider credential).

~~~json
{
  "name": "Escalate Qualified Slack Requests",
  "nodes": [
    {
      "id": "slack-trigger",
      "name": "Slack Request Received",
      "type": "n8n-nodes-base.slackTrigger",
      "typeVersion": 1,
      "position": [-720, 0],
      "parameters": { "event": "message.channels" },
      "credentials": {
        "slackOAuth2Api": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    },
    {
      "id": "lookup-api",
      "name": "Look Up Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [-480, 0],
      "parameters": {
        "method": "GET",
        "url": "=https://__CLIENT_API_HOST__/requests/{{ $json.event_id }}",
        "authentication": "predefinedCredentialType"
      },
      "credentials": {
        "httpHeaderAuth": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    },
    {
      "id": "is-qualified",
      "name": "Is Request Qualified?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [-240, 0],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict" },
          "conditions": [{
            "leftValue": "={{ $json.status }}",
            "rightValue": "qualified",
            "operator": { "type": "string", "operation": "equals" }
          }],
          "combinator": "and"
        }
      }
    },
    {
      "id": "send-email",
      "name": "Send Qualification Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [0, -80],
      "parameters": {
        "fromEmail": "__SENDER_EMAIL__",
        "toEmail": "={{ $json.owner_email }}",
        "subject": "=Qualified request: {{ $json.request_id }}",
        "emailFormat": "text",
        "text": "=Request {{ $json.request_id }} is qualified and ready for review."
      },
      "credentials": {
        "smtp": {
          "id": "__N8N_CREDENTIAL_ID__",
          "name": "__CONFIGURE_IN_N8N__"
        }
      }
    }
  ],
  "connections": {
    "Slack Request Received": {
      "main": [[{ "node": "Look Up Request", "type": "main", "index": 0 }]]
    },
    "Look Up Request": {
      "main": [[{ "node": "Is Request Qualified?", "type": "main", "index": 0 }]]
    },
    "Is Request Qualified?": {
      "main": [
        [{ "node": "Send Qualification Email", "type": "main", "index": 0 }],
        []
      ]
    }
  }
}
~~~

## Reference

- [n8n workflow and node documentation](https://docs.n8n.io/)
- [n8n LangChain and AI nodes](https://docs.n8n.io/advanced-ai/)
