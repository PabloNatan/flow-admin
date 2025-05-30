# Frontend Flow Builder - Complete Technical Orientation

## Overview

This document provides the frontend team with all necessary information to build a visual flow builder interface that integrates with the Flow API. The interface should allow users to create, edit, and manage sequential message flows through an intuitive drag-and-drop interface, similar to Typebot or ChatBot builders.

## API Base Information

**Base URL:** `http://localhost:3000` (development)
**Authentication:** API Key in header: `Authorization: Bearer {api-key}`
**Content-Type:** `application/json`

## Core Concepts

### Flow Structure

A **Flow** consists of:

- **Nodes**: Individual processing units (7 types available)
- **Edges**: Connections between nodes that define execution path
- **Variables**: Data storage that persists throughout flow execution
- **Sessions**: User interactions and progress tracking

### Node Types Available

1. **TRIGGER** - Entry point for flows
2. **MESSAGE** - Send messages/content to users (text, images, audio, JSON, files)
3. **INPUT** - Collect user responses (text, phone, email, numbers, files)
4. **CONDITION** - Branching logic based on conditions
5. **DELAY** - Time-based pauses between messages
6. **ACTION** - External API calls, webhooks, email, SMS
7. **END** - Flow completion

## API Endpoints for Frontend

### Authentication

```http
# Test API connection
GET /applications
Authorization: Bearer {api-key}
```

### Flow Management

#### List All Flows

```http
GET /flows?page=1&limit=10
Authorization: Bearer {api-key}
```

**Response:**

```json
{
  "data": [
    {
      "id": "flow-id",
      "name": "Welcome Flow",
      "description": "New user onboarding",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "nodeCount": 8,
      "sessionCount": 25
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Flow Details

```http
GET /flows/{flowId}
Authorization: Bearer {api-key}
```

**Response:**

```json
{
  "id": "flow-id",
  "name": "Welcome Flow",
  "description": "New user onboarding flow",
  "isActive": true,
  "nodes": [
    {
      "id": "node-1",
      "type": "TRIGGER",
      "position": { "x": 100, "y": 100 },
      "config": {
        "name": "Flow Start",
        "event": "webhook",
        "description": "Triggered when user signs up"
      }
    },
    {
      "id": "node-2",
      "type": "MESSAGE",
      "position": { "x": 300, "y": 100 },
      "config": {
        "name": "Welcome Message",
        "messageType": "TEXT",
        "content": "Hi {{user.name}}! Welcome to our platform! 👋"
      }
    },
    {
      "id": "node-3",
      "type": "DELAY",
      "position": { "x": 500, "y": 100 },
      "config": {
        "name": "Wait 2 seconds",
        "delayType": "FIXED",
        "delayMs": 2000,
        "description": "Brief pause before next message"
      }
    },
    {
      "id": "node-4",
      "type": "INPUT",
      "position": { "x": 700, "y": 100 },
      "config": {
        "name": "Collect Phone",
        "prompt": "What's your phone number? We'll use it for important updates.",
        "responseType": "PHONE",
        "required": true,
        "variableName": "user_phone"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "sourceId": "node-1",
      "targetId": "node-2"
    },
    {
      "id": "edge-2",
      "sourceId": "node-2",
      "targetId": "node-3"
    },
    {
      "id": "edge-3",
      "sourceId": "node-3",
      "targetId": "node-4"
    }
  ],
  "variables": [
    {
      "id": "var-1",
      "name": "user_phone",
      "type": "STRING",
      "defaultValue": null
    },
    {
      "id": "var-2",
      "name": "user_name",
      "type": "STRING",
      "defaultValue": "Friend"
    }
  ]
}
```

#### Create Flow

```http
POST /flows
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "name": "New Flow",
  "description": "Flow description",
  "nodes": [
    {
      "type": "TRIGGER",
      "position": { "x": 100, "y": 100 },
      "config": {
        "name": "Start",
        "event": "manual"
      }
    }
  ],
  "edges": [],
  "variables": []
}
```

#### Update Flow

```http
PUT /flows/{flowId}
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "name": "Updated Flow Name",
  "description": "Updated description",
  "nodes": [...],
  "edges": [...],
  "variables": [...]
}
```

#### Delete Flow

```http
DELETE /flows/{flowId}
Authorization: Bearer {api-key}
```

### Flow Validation

#### Validate Flow Structure

```http
POST /flows/{flowId}/validate
Authorization: Bearer {api-key}
```

**Response:**

```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Flow has no end node - users may get stuck"],
  "metrics": {
    "nodeCount": 8,
    "edgeCount": 7,
    "maxDepth": 5,
    "hasLoops": false,
    "unreachableNodes": []
  }
}
```

### Session Management

#### Get Active Sessions

```http
GET /flows/{flowId}/sessions?status=ACTIVE
Authorization: Bearer {api-key}
```

#### Get Session Details

```http
GET /sessions/{sessionId}
Authorization: Bearer {api-key}
```

**Response:**

```json
{
  "id": "session-123",
  "flowId": "flow-id",
  "userId": "user-456",
  "currentNodeId": "node-4",
  "status": "ACTIVE",
  "variables": {
    "user_name": "John Doe",
    "user_phone": "+1234567890"
  },
  "startedAt": "2024-01-01T10:00:00Z",
  "lastActiveAt": "2024-01-01T10:05:00Z",
  "messages": [
    {
      "id": "msg-1",
      "nodeId": "node-2",
      "type": "TEXT",
      "content": "Hi John Doe! Welcome to our platform! 👋",
      "sentAt": "2024-01-01T10:00:00Z"
    }
  ],
  "responses": [
    {
      "id": "resp-1",
      "nodeId": "node-4",
      "type": "PHONE",
      "content": "+1234567890",
      "receivedAt": "2024-01-01T10:05:00Z"
    }
  ]
}
```

## Node Configuration Schemas

Each node type has specific configuration requirements:

### 1. TRIGGER Node

```json
{
  "type": "TRIGGER",
  "position": { "x": 100, "y": 100 },
  "config": {
    "name": "Flow Start",
    "event": "manual" | "webhook" | "scheduled" | "user_action",
    "description": "When this flow should start",
    "webhookUrl": "https://api.example.com/webhook", // for webhook triggers
    "schedule": "0 9 * * *" // for scheduled triggers (cron format)
  }
}
```

### 2. MESSAGE Node

```json
{
  "type": "MESSAGE",
  "position": { "x": 300, "y": 100 },
  "config": {
    "name": "Send Message",
    "messageType": "TEXT" | "IMAGE" | "AUDIO" | "JSON" | "FILE",
    "content": "Message content with {{variables}}",

    // For IMAGE messages
    "fileUrl": "https://example.com/image.jpg",
    "fileName": "welcome-image.jpg",

    // For AUDIO messages
    "fileUrl": "https://example.com/audio.mp3",
    "fileName": "welcome-audio.mp3",

    // For FILE messages
    "fileUrl": "https://example.com/document.pdf",
    "fileName": "user-guide.pdf",
    "fileSize": 1024000,

    // For JSON messages
    "jsonData": {
      "type": "card",
      "title": "Welcome Card",
      "buttons": ["Get Started", "Learn More"]
    }
  }
}
```

### 3. INPUT Node

```json
{
  "type": "INPUT",
  "position": { "x": 500, "y": 100 },
  "config": {
    "name": "Collect Response",
    "prompt": "Please share your information:",
    "responseType": "TEXT" | "PHONE" | "EMAIL" | "NUMBER" | "JSON" | "FILE",
    "required": true,
    "variableName": "user_response", // where to store the response

    // Validation rules
    "validation": {
      "minLength": 2,
      "maxLength": 100,
      "pattern": "^[a-zA-Z\\s]+$", // regex pattern
      "errorMessage": "Please enter a valid name"
    },

    // For PHONE type
    "phoneFormat": "international", // "national" | "international"

    // For NUMBER type
    "numberType": "integer", // "integer" | "decimal"
    "min": 0,
    "max": 100,

    // For FILE type
    "allowedTypes": ["image/*", "application/pdf"],
    "maxFileSize": 5242880 // 5MB in bytes
  }
}
```

### 4. CONDITION Node

```json
{
  "type": "CONDITION",
  "position": { "x": 700, "y": 100 },
  "config": {
    "name": "Check Condition",
    "conditions": [
      {
        "id": "condition-1",
        "variable": "user_age",
        "operator": "greater_than",
        "value": 18,
        "label": "Adult Path"
      },
      {
        "id": "condition-2",
        "variable": "user_type",
        "operator": "equals",
        "value": "premium",
        "label": "Premium Path"
      }
    ],
    "defaultCondition": {
      "id": "default",
      "label": "Default Path"
    }
  }
}
```

**Available Operators:**

- `equals`, `not_equals`
- `greater_than`, `greater_than_or_equal`
- `less_than`, `less_than_or_equal`
- `contains`, `starts_with`, `ends_with`
- `in`, `not_in` (for arrays)
- `is_empty`, `is_not_empty`
- `regex`

### 5. DELAY Node

```json
{
  "type": "DELAY",
  "position": { "x": 900, "y": 100 },
  "config": {
    "name": "Wait",
    "delayType": "FIXED" | "VARIABLE",
    "delayMs": 5000, // for FIXED delays (milliseconds)
    "delayVariable": "wait_time", // for VARIABLE delays
    "description": "Wait 5 seconds before continuing"
  }
}
```

### 6. ACTION Node

```json
{
  "type": "ACTION",
  "position": { "x": 1100, "y": 100 },
  "config": {
    "name": "External Action",
    "actionType": "HTTP_REQUEST" | "WEBHOOK" | "EMAIL" | "SMS",

    // For HTTP_REQUEST and WEBHOOK
    "url": "https://api.example.com/endpoint",
    "method": "POST" | "GET" | "PUT" | "DELETE",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{api_token}}"
    },
    "body": {
      "user_id": "{{user.id}}",
      "message": "{{message_content}}"
    },

    // For EMAIL
    "to": "{{user.email}}",
    "subject": "Welcome {{user.name}}!",
    "htmlBody": "<h1>Welcome!</h1><p>Thanks for joining us.</p>",
    "textBody": "Welcome! Thanks for joining us.",

    // For SMS
    "phoneNumber": "{{user.phone}}",
    "message": "Welcome {{user.name}}! Your account is ready."
  }
}
```

### 7. END Node

```json
{
  "type": "END",
  "position": { "x": 1300, "y": 100 },
  "config": {
    "name": "Complete Flow",
    "message": "Thank you for completing the flow!",
    "returnData": {
      "success": true,
      "completedAt": "{{current_timestamp}}",
      "userResponses": "{{all_responses}}"
    }
  }
}
```

## Visual Flow Builder Requirements

### Canvas Features

- **Drag & Drop**: Drag nodes from palette to canvas
- **Node Connections**: Click and drag to create edges between nodes
- **Pan & Zoom**: Navigate large flows smoothly
- **Grid/Snap**: Align nodes for clean layouts
- **Undo/Redo**: Action history management
- **Multi-select**: Select multiple nodes for bulk operations
- **Auto-layout**: Automatic flow arrangement
- **Minimap**: Overview of entire flow

### Node Palette

Create a collapsible sidebar with draggable node types:

```javascript
const nodeTypes = [
  {
    type: "TRIGGER",
    icon: "🎯",
    label: "Trigger",
    description: "Start the flow",
    color: "#10B981", // Green
  },
  {
    type: "MESSAGE",
    icon: "💬",
    label: "Message",
    description: "Send content to users",
    color: "#3B82F6", // Blue
  },
  {
    type: "INPUT",
    icon: "📝",
    label: "Input",
    description: "Collect user responses",
    color: "#F59E0B", // Amber
  },
  {
    type: "CONDITION",
    icon: "🔀",
    label: "Condition",
    description: "Branch based on logic",
    color: "#8B5CF6", // Purple
  },
  {
    type: "DELAY",
    icon: "⏰",
    label: "Delay",
    description: "Wait for time period",
    color: "#EF4444", // Red
  },
  {
    type: "ACTION",
    icon: "⚡",
    label: "Action",
    description: "External integrations",
    color: "#06B6D4", // Cyan
  },
  {
    type: "END",
    icon: "🏁",
    label: "End",
    description: "Complete the flow",
    color: "#6B7280", // Gray
  },
];
```

### Node Property Panel

When a node is selected, show a right sidebar with:

1. **Node Header**

   - Node type icon and name
   - Node ID (read-only)
   - Delete node button

2. **Basic Properties**

   - Node name (editable)
   - Description (optional)
   - Position coordinates (read-only)

3. **Configuration Form**

   - Dynamic form based on node type
   - Real-time validation
   - Help text and examples
   - File upload widgets for media

4. **Variable Helper**

   - Searchable list of available variables
   - Variable syntax helper: `{{variable_name}}`
   - Auto-completion in text fields
   - Variable type indicators

5. **Preview Section**
   - Live preview of message content
   - Variable interpolation preview
   - Validation status indicators

### Connection Rules & Validation

**Connection Rules:**

- **TRIGGER**: Only outgoing connections (flow start)
- **END**: Only incoming connections (flow end)
- **MESSAGE**: One in, one out
- **INPUT**: One in, one out
- **DELAY**: One in, one out
- **ACTION**: One in, one out
- **CONDITION**: One in, multiple out (based on conditions)

**Visual Feedback:**

- **Valid connections**: Green connectors and smooth animations
- **Invalid connections**: Red indicators with error tooltips
- **Hover states**: Highlight compatible connection points
- **Connection preview**: Show connection path while dragging

**Validation Errors:**

- Orphaned nodes (no connections)
- Missing required configurations
- Invalid variable references
- Circular loops without exit conditions
- Multiple trigger nodes
- Unreachable nodes

## Flow Execution & Testing

### Test Flow Interface

Create a chat-like interface for testing flows:

```javascript
// Test execution endpoint
POST /flows/{flowId}/test
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "userId": "test-user-123",
  "initialVariables": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
}
```

**Response:**

```json
{
  "sessionId": "session-test-123",
  "status": "processing",
  "currentNode": {
    "id": "node-2",
    "type": "MESSAGE",
    "name": "Welcome Message"
  },
  "result": {
    "type": "message",
    "content": {
      "messageType": "TEXT",
      "content": "Hi John Doe! Welcome to our platform! 👋"
    }
  },
  "waitingForInput": false,
  "variables": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "nextAction": "continue" | "wait_for_input" | "completed"
}
```

### Continue Flow Execution

```http
POST /sessions/{sessionId}/continue
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "userResponse": {
    "type": "TEXT",
    "content": "My name is Jane"
  }
}
```

### Chat Testing Component Features

- **Message History**: Show all sent messages and user responses
- **Input Simulation**: Different input types (text, file upload, phone)
- **Variable Inspector**: Real-time variable state display
- **Execution Timeline**: Step-by-step flow progression
- **Error Display**: Clear error messages and retry options
- **Reset Button**: Restart flow testing

## Frontend Implementation Architecture

### Recommended Technology Stack

- **React Flow**: For visual flow builder (`reactflow` library)
- **React Hook Form**: For node configuration forms
- **React Query/TanStack Query**: For API state management
- **Zod**: For form validation schemas
- **Lucide React**: For consistent icons
- **Framer Motion**: For smooth animations
- **React Dropzone**: For file uploads
- **Monaco Editor**: For JSON/code editing

### Component Structure

```
src/
├── components/
│   ├── FlowBuilder/
│   │   ├── FlowCanvas.tsx          # Main canvas with React Flow
│   │   ├── NodePalette.tsx         # Draggable node types sidebar
│   │   ├── PropertyPanel.tsx       # Node configuration panel
│   │   ├── FlowToolbar.tsx         # Save, test, publish controls
│   │   ├── ValidationPanel.tsx     # Error and warning display
│   │   └── VariableHelper.tsx      # Variable management
│   ├── Nodes/
│   │   ├── BaseNode.tsx            # Common node wrapper
│   │   ├── TriggerNode.tsx
│   │   ├── MessageNode.tsx
│   │   ├── InputNode.tsx
│   │   ├── ConditionNode.tsx
│   │   ├── DelayNode.tsx
│   │   ├── ActionNode.tsx
│   │   └── EndNode.tsx
│   ├── Forms/
│   │   ├── NodeConfigForm.tsx      # Dynamic form renderer
│   │   ├── TriggerForm.tsx
│   │   ├── MessageForm.tsx
│   │   ├── InputForm.tsx
│   │   ├── ConditionForm.tsx
│   │   ├── DelayForm.tsx
│   │   ├── ActionForm.tsx
│   │   └── EndForm.tsx
│   ├── Chat/
│   │   ├── ChatInterface.tsx       # Flow testing chat
│   │   ├── MessageBubble.tsx
│   │   ├── InputWidget.tsx
│   │   ├── FileUpload.tsx
│   │   └── VariableInspector.tsx
│   └── Common/
│       ├── FileUpload.tsx
│       ├── CodeEditor.tsx
│       ├── VariablePicker.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useFlowBuilder.ts           # Flow building state
│   ├── useFlowExecution.ts         # Flow testing state
│   ├── useNodeValidation.ts        # Node validation logic
│   └── useFileUpload.ts            # File handling
├── types/
│   ├── flow.ts                     # Flow type definitions
│   ├── node.ts                     # Node type definitions
│   └── api.ts                      # API response types
└── utils/
    ├── flowValidation.ts           # Client-side validation
    ├── variableInterpolation.ts    # Variable replacement
    └── nodeHelpers.ts              # Node utility functions
```

### State Management Structure

```typescript
// Flow builder state
interface FlowBuilderState {
  flow: {
    id: string;
    name: string;
    description: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    variables: FlowVariable[];
  };

  // UI state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isLoading: boolean;
  isDirty: boolean;

  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];

  // Testing
  testSession: SessionState | null;
  chatMessages: ChatMessage[];
}

// Node configuration state
interface NodeFormState {
  nodeId: string;
  config: Record<string, any>;
  validation: {
    isValid: boolean;
    errors: FormError[];
  };
}
```

### Key User Interactions & Workflows

#### 1. Creating a New Flow

```typescript
const createFlowWorkflow = {
  steps: [
    'Click "New Flow" button',
    "Enter flow name and description",
    "Drag TRIGGER node to canvas",
    "Configure trigger settings",
    "Add MESSAGE/INPUT nodes sequentially",
    "Connect nodes with edges",
    "Configure each node",
    "Test flow execution",
    "Save and activate flow",
  ],
};
```

#### 2. Building Sequential Message Flow

```typescript
const messageFlowExample = {
  sequence: [
    { type: "TRIGGER", config: { event: "webhook" } },
    { type: "MESSAGE", config: { messageType: "TEXT", content: "Welcome!" } },
    { type: "DELAY", config: { delayMs: 2000 } },
    { type: "MESSAGE", config: { messageType: "IMAGE", fileUrl: "..." } },
    {
      type: "INPUT",
      config: { responseType: "PHONE", variableName: "user_phone" },
    },
    {
      type: "CONDITION",
      config: { variable: "user_phone", operator: "is_not_empty" },
    },
    { type: "END", config: { message: "Thank you!" } },
  ],
};
```

#### 3. Branching Logic Implementation

- Drag CONDITION node between other nodes
- Configure conditions with variable comparisons
- Create multiple outgoing edges with labels
- Connect each edge to different flow paths
- Test both paths during flow testing

#### 4. Loop Implementation

- Create condition that can loop back to previous node
- Add loop counter variable to prevent infinite loops
- Implement exit condition when counter reaches limit
- Visual loop indicators in the flow

## File Upload & Media Handling

### File Upload Component

```typescript
interface FileUploadProps {
  acceptedTypes: string[];
  maxFileSize: number;
  onUpload: (file: File, url: string) => void;
}

// Usage in MESSAGE node for images/audio
<FileUpload
  acceptedTypes={["image/*"]}
  maxFileSize={5 * 1024 * 1024} // 5MB
  onUpload={(file, url) => {
    updateNodeConfig({
      fileUrl: url,
      fileName: file.name,
      fileSize: file.size,
    });
  }}
/>;
```

### File Upload Endpoints

```http
# Upload file
POST /files/upload
Authorization: Bearer {api-key}
Content-Type: multipart/form-data

# Response
{
  "id": "file-123",
  "url": "https://cdn.example.com/files/image.jpg",
  "fileName": "image.jpg",
  "fileSize": 1024000,
  "mimeType": "image/jpeg"
}
```

## Error Handling & User Feedback

### Validation Error Display

```typescript
interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

// Display in UI
const ValidationMessage = ({ error }: { error: ValidationError }) => (
  <div
    className={`p-2 rounded ${
      error.severity === "error"
        ? "bg-red-50 text-red-700"
        : "bg-yellow-50 text-yellow-700"
    }`}
  >
    <span className="font-medium">{error.field}:</span> {error.message}
  </div>
);
```

### Success States

- **Auto-save**: "Changes saved automatically"
- **Flow published**: "Flow is now live and accepting users"
- **Test completed**: "Flow test completed successfully"
- **File uploaded**: "File uploaded successfully"

### Loading States

- **Saving flow**: Skeleton loaders for forms
- **Testing flow**: Progressive message display
- **Uploading files**: Progress bars
- **Loading flows**: Card skeletons

This comprehensive frontend orientation provides everything needed to build a professional flow builder interface that matches modern chat automation platforms. The architecture supports all the features from your requirements including sequential messaging, file handling, branching logic, loops, and delays.
