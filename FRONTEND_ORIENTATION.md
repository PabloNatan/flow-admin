# Frontend Flow Builder - Technical Orientation Guide

## Overview

This document provides the frontend team with all necessary information to build a visual flow builder interface that integrates with the Flow API. The interface should allow users to create, edit, and manage flows through an intuitive drag-and-drop interface.

## API Base Information

**Base URL:** `http://localhost:3000` (development)
**Authentication:** Custom headers:
- `x-application-id: {application-id}`
- `x-api-key: {api-key}`
**Content-Type:** `application/json`

## Core Concepts

### Flow Structure
A **Flow** consists of:
- **Nodes**: Individual processing units (7 types available)
- **Edges**: Connections between nodes that define execution path
- **Variables**: Data storage that persists throughout flow execution

### Node Types Available

1. **TRIGGER** - Entry point for flows
2. **MESSAGE** - Send messages/content to users
3. **INPUT** - Collect user responses
4. **CONDITION** - Branching logic based on conditions
5. **DELAY** - Time-based pauses
6. **ACTION** - External API calls, webhooks, email, SMS
7. **END** - Flow completion

## API Endpoints for Frontend

### Authentication
```http
# Test API connection
GET /applications
x-application-id: {application-id}
x-api-key: {api-key}
```

### Flow Management

#### List All Flows
```http
GET /flows?currentPage=1&registersPerPage=10
x-application-id: {application-id}
x-api-key: {api-key}
```

**Response:**
```json
{
  "data": [
    {
      "id": "flow-id",
      "name": "My Flow",
      "description": "Flow description",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "nodeCount": 5,
      "lastModified": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "currentPage": 1,
    "registersPerPage": 10,
    "totalPages": 5
  }
}
```

#### Get Flow Details
```http
GET /flows/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}
```

**Response:**
```json
{
  "id": "flow-id",
  "name": "My Flow",
  "description": "Flow description",
  "isActive": true,
  "nodes": [
    {
      "id": "node-1",
      "type": "TRIGGER",
      "name": "Flow Start",
      "config": {
        "event": "user_signup"
      },
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "node-2", 
      "type": "MESSAGE",
      "name": "Welcome Message",
      "config": {
        "messageType": "TEXT",
        "content": "Welcome {{user.name}}!"
      },
      "position": { "x": 300, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "sourceId": "node-1",
      "targetId": "node-2"
    }
  ]
}
```

#### Create Flow
```http
POST /flows
x-application-id: {application-id}
x-api-key: {api-key}
Content-Type: application/json

{
  "name": "New Flow",
  "description": "Flow description",
  "nodes": [
    {
      "type": "TRIGGER",
      "name": "Start",
      "config": {
        "event": "manual"
      },
      "position": { "x": 100, "y": 100 }
    }
  ],
  "edges": []
}
```

#### Update Flow
```http
PATCH /flows/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}
Content-Type: application/json

{
  "name": "Updated Flow Name",
  "description": "Updated description",
  "nodes": [...],
  "edges": [...]
}
```

#### Delete Flow
```http
DELETE /flows/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}
```

### Flow Validation

#### Validate Flow Structure
```http
GET /flows/{flowId}/validate
x-application-id: {application-id}
x-api-key: {api-key}
```

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Flow has no end node"],
  "metrics": {
    "nodeCount": 5,
    "edgeCount": 4,
    "maxDepth": 3,
    "circularReferences": []
  }
}
```

## Node Configuration Schemas

Each node type has specific configuration requirements:

### 1. TRIGGER Node
```json
{
  "type": "TRIGGER",
  "name": "Flow Start",
  "config": {
    "event": "manual" | "webhook" | "scheduled" | "user_action",
    "description": "When this flow should start"
  }
}
```

### 2. MESSAGE Node
```json
{
  "type": "MESSAGE", 
  "name": "Send Message",
  "config": {
    "messageType": "TEXT" | "IMAGE" | "AUDIO" | "JSON" | "FILE",
    "content": "Message content with {{variables}}",
    "metadata": {
      "imageUrl": "https://example.com/image.jpg", // for IMAGE type
      "audioUrl": "https://example.com/audio.mp3", // for AUDIO type
      "fileName": "document.pdf", // for FILE type
      "jsonData": {} // for JSON type
    }
  }
}
```

### 3. INPUT Node
```json
{
  "type": "INPUT",
  "name": "Collect Response", 
  "config": {
    "prompt": "Please enter your email:",
    "responseType": "TEXT" | "PHONE" | "EMAIL" | "NUMBER" | "JSON" | "FILE",
    "required": true,
    "validation": {
      "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", // for email validation
      "minLength": 5,
      "maxLength": 100
    },
    "variableName": "user_email" // where to store the response
  }
}
```

### 4. CONDITION Node
```json
{
  "type": "CONDITION",
  "name": "Check Condition",
  "config": {
    "conditions": [
      {
        "variable": "user_age",
        "operator": "greater_than",
        "value": 18,
        "path": "adult_path" // which edge to follow if true
      },
      {
        "variable": "user_type", 
        "operator": "equals",
        "value": "premium",
        "path": "premium_path"
      }
    ],
    "defaultPath": "default_path" // edge to follow if no conditions match
  }
}
```

**Available Operators:**
- `equals`, `not_equals`
- `greater_than`, `less_than`
- `contains`, `starts_with`, `ends_with`

### 5. DELAY Node
```json
{
  "type": "DELAY",
  "name": "Wait",
  "config": {
    "delayType": "FIXED" | "VARIABLE",
    "delayMs": 5000, // for FIXED delays (milliseconds)
    "delayVariable": "wait_time", // for VARIABLE delays
    "description": "Wait 5 seconds"
  }
}
```

### 6. ACTION Node
```json
{
  "type": "ACTION",
  "name": "External Action",
  "config": {
    "actionType": "HTTP_REQUEST" | "WEBHOOK" | "EMAIL" | "SMS",
    "url": "https://api.example.com/endpoint", // for HTTP/WEBHOOK
    "method": "POST", // for HTTP requests
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{api_token}}"
    },
    "data": {
      "user_id": "{{user.id}}",
      "message": "{{message_content}}"
    },
    // Email specific config
    "to": "{{user.email}}",
    "subject": "Welcome!",
    "body": "Email content with {{variables}}",
    // SMS specific config  
    "phoneNumber": "{{user.phone}}",
    "message": "SMS content"
  }
}
```

### 7. END Node
```json
{
  "type": "END",
  "name": "Complete",
  "config": {
    "message": "Flow completed successfully",
    "returnData": {
      "success": true,
      "result": "{{final_result}}"
    }
  }
}
```

## Visual Flow Builder Requirements

### Canvas Features
- **Drag & Drop**: Drag nodes from palette to canvas
- **Node Connections**: Click and drag to create edges between nodes
- **Pan & Zoom**: Navigate large flows
- **Grid/Snap**: Align nodes for clean layouts
- **Undo/Redo**: Action history management

### Node Palette
Create a sidebar with draggable node types:

```javascript
const nodeTypes = [
  {
    type: 'TRIGGER',
    icon: '🎯',
    label: 'Trigger',
    description: 'Start the flow'
  },
  {
    type: 'MESSAGE', 
    icon: '💬',
    label: 'Message',
    description: 'Send content to users'
  },
  {
    type: 'INPUT',
    icon: '📝', 
    label: 'Input',
    description: 'Collect user responses'
  },
  {
    type: 'CONDITION',
    icon: '🔀',
    label: 'Condition', 
    description: 'Branch based on logic'
  },
  {
    type: 'DELAY',
    icon: '⏰',
    label: 'Delay',
    description: 'Wait for time period'
  },
  {
    type: 'ACTION',
    icon: '⚡',
    label: 'Action',
    description: 'External integrations'
  },
  {
    type: 'END',
    icon: '🏁',
    label: 'End',
    description: 'Complete the flow'
  }
];
```

### Node Property Panel
When a node is selected, show a properties panel with:

1. **Basic Properties**
   - Node name (editable)
   - Node type (display only)
   - Description

2. **Configuration Form**
   - Dynamic form based on node type
   - Validation for required fields
   - Help text for complex configurations

3. **Variable Helper**
   - List available variables: `{{user.name}}`, `{{user.email}}`, etc.
   - Suggest variables based on previous nodes
   - Syntax highlighting for variable interpolation

### Connection Rules

**Validation Rules:**
- TRIGGER nodes: Can only be starting points (no incoming edges)
- END nodes: Can only be ending points (no outgoing edges)
- CONDITION nodes: Can have multiple outgoing edges
- Other nodes: Typically one incoming, one outgoing edge

**Visual Indicators:**
- Valid connections: Green/blue connectors
- Invalid connections: Red indicators with error message
- Required connections: Highlight missing required edges

## Flow Testing & Execution

### Test Flow
```http
POST /processing/trigger
x-application-id: {application-id}
x-api-key: {api-key}
Content-Type: application/json

{
  "flowId": "flow-id",
  "userId": "test-user",
  "inputData": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Response:**
```json
{
  "sessionId": "session-123",
  "status": "processing",
  "result": {
    "type": "message",
    "content": {
      "messageType": "TEXT",
      "content": "Welcome John Doe!"
    }
  },
  "waitingForInput": false,
  "variables": {
    "user": {
      "name": "John Doe", 
      "email": "john@example.com"
    }
  }
}
```

### Monitor Execution
```http
GET /processing/sessions/{sessionId}/status
x-application-id: {application-id}
x-api-key: {api-key}
```

## Additional API Endpoints

### Node Management
```http
# Create individual node
POST /nodes
x-application-id: {application-id}
x-api-key: {api-key}

# Get nodes in flow
GET /nodes/flow/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}

# Get nodes by type
GET /nodes/flow/{flowId}/type/{nodeType}
x-application-id: {application-id}
x-api-key: {api-key}

# Get connected nodes
GET /nodes/{id}/connections
x-application-id: {application-id}
x-api-key: {api-key}

# Update node
PATCH /nodes/{id}
x-application-id: {application-id}
x-api-key: {api-key}

# Delete node
DELETE /nodes/{id}
x-application-id: {application-id}
x-api-key: {api-key}
```

### Variable Management
```http
# Get flow variables
GET /variables/flow/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}

# Create variable
POST /variables
x-application-id: {application-id}
x-api-key: {api-key}

# Update variable
PATCH /variables/{id}
x-application-id: {application-id}
x-api-key: {api-key}

# Delete variable
DELETE /variables/{id}
x-application-id: {application-id}
x-api-key: {api-key}

# Evaluate variable expressions
POST /variables/evaluate
x-application-id: {application-id}
x-api-key: {api-key}
```

### Webhook Management
```http
# Receive webhook
POST /webhook/flows/{flowId}
x-application-id: {application-id}
x-api-key: {api-key}

# Activate webhook
POST /webhook/flows/{flowId}/activate
x-application-id: {application-id}
x-api-key: {api-key}

# List active webhooks
GET /webhook/flows/active
x-application-id: {application-id}
x-api-key: {api-key}
```

### Analytics & Monitoring
```http
# Flow statistics
GET /analytics/flows/{flowId}/stats
x-application-id: {application-id}
x-api-key: {api-key}

# System metrics
GET /analytics/system/metrics
x-application-id: {application-id}
x-api-key: {api-key}

# Dashboard data
GET /analytics/application/dashboard
x-application-id: {application-id}
x-api-key: {api-key}
```

### Execution Management
```http
# Start flow execution
POST /execution/start-flow
x-application-id: {application-id}
x-api-key: {api-key}

# Respond to flow session
POST /execution/sessions/{sessionId}/respond
x-application-id: {application-id}
x-api-key: {api-key}
```

### Additional Flow Operations
```http
# Get active flows only
GET /flows/active
x-application-id: {application-id}
x-api-key: {api-key}

# Get inactive flows only
GET /flows/inactive
x-application-id: {application-id}
x-api-key: {api-key}

# Duplicate flow
POST /flows/{id}/duplicate
x-application-id: {application-id}
x-api-key: {api-key}
```

## Frontend Implementation Suggestions

### Recommended Libraries
- **React Flow** or **ReactJS Dagre** for visual flow builder
- **React Hook Form** for node configuration forms
- **React Query** for API state management
- **Zod** for form validation matching backend schemas
- **Lucide React** for consistent icons

### Component Structure
```
components/
├── FlowBuilder/
│   ├── FlowCanvas.tsx          # Main canvas area
│   ├── NodePalette.tsx         # Draggable node types
│   ├── PropertyPanel.tsx       # Node configuration
│   └── Toolbar.tsx             # Save, validate, test actions
├── Nodes/
│   ├── TriggerNode.tsx
│   ├── MessageNode.tsx
│   ├── InputNode.tsx
│   ├── ConditionNode.tsx
│   ├── DelayNode.tsx
│   ├── ActionNode.tsx
│   └── EndNode.tsx
└── Forms/
    ├── TriggerForm.tsx
    ├── MessageForm.tsx
    └── ... (config forms for each node type)
```

### State Management
```javascript
// Flow state structure
const flowState = {
  id: 'flow-id',
  name: 'My Flow',
  description: 'Flow description',
  nodes: [],
  edges: [],
  selectedNode: null,
  isValid: true,
  validationErrors: [],
  isDirty: false // for unsaved changes warning
};
```

### Key User Interactions

1. **Creating Flows**
   - Start with empty canvas + trigger node
   - Drag nodes from palette
   - Connect nodes by dragging from output to input ports
   - Configure each node via property panel

2. **Editing Flows**
   - Load existing flow onto canvas
   - Modify node configurations
   - Add/remove nodes and connections
   - Real-time validation feedback

3. **Testing Flows**
   - "Test Flow" button to execute with sample data
   - Show execution progress and results
   - Display any errors or validation issues

4. **Saving Flows**
   - Auto-save drafts locally
   - Validate before saving to server
   - Show unsaved changes indicator

## Error Handling

### Common API Errors
```json
{
  "error": "Validation failed",
  "message": "Flow validation errors",
  "details": [
    {
      "field": "nodes[1].config.content",
      "message": "Content is required for MESSAGE nodes"
    }
  ]
}
```

### User-Friendly Messages
- **"Missing required connection"** instead of technical validation errors
- **"Invalid email format"** for validation failures
- **"Flow saved successfully"** for success feedback
- **"Testing flow..."** for loading states

## Security Considerations

1. **Input Sanitization**: Sanitize all user inputs before sending to API
2. **XSS Prevention**: Escape HTML in node configurations
3. **API Key Management**: Secure storage of API keys
4. **Validation**: Client-side validation matching server-side rules

## Testing Flow Execution

For testing flows during development, you can use these sample payloads:

### Simple Test Data
```json
{
  "user": {
    "id": "123",
    "name": "Test User",
    "email": "test@example.com",
    "age": 25,
    "type": "premium"
  }
}
```

### Complex Test Data
```json
{
  "user": {
    "id": "456", 
    "name": "Jane Smith",
    "email": "jane@example.com",
    "preferences": {
      "notifications": true,
      "language": "en"
    }
  },
  "order": {
    "id": "order-789",
    "total": 99.99,
    "items": ["item1", "item2"]
  }
}
```

This orientation should provide your frontend team with everything needed to build a comprehensive flow builder interface. The API is fully functional and ready to support all these operations.