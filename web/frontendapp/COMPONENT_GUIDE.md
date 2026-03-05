# UI Component Guide

All components are theme-aware and use the Spotify-inspired design system.

## Button

```tsx
import { Button } from '@/components';

// Primary button
<Button variant="primary" size="md">
  Click Me
</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Disabled
<Button isDisabled>Disabled</Button>

// Sizes: sm | md | lg
<Button size="lg">Large Button</Button>
```

---

## Card

```tsx
import { Card } from '@/components';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Hoverable card (lifts on hover)
<Card hoverable>
  Hover over me!
</Card>

// Interactive card (clickable)
<Card interactive onClick={() => console.log('clicked')}>
  Click me!
</Card>
```

---

## Input

```tsx
import { Input } from '@/components';

// Basic input
<Input placeholder="Enter text..." />

// With label
<Input label="Email" type="email" placeholder="your@email.com" />

// With error
<Input
  label="Password"
  type="password"
  error="Password is required"
/>

// With helper text
<Input
  label="Username"
  helperText="3-20 characters"
/>

// Sizes: sm | md | lg
<Input size="lg" placeholder="Large input" />
```

---

## Avatar

```tsx
import { Avatar } from '@/components';

// Image avatar
<Avatar src="/user.jpg" alt="John Doe" size="md" />

// Initials (fallback)
<Avatar alt="John Doe" initials="JD" size="md" />

// Sizes: sm | md | lg | xl
<Avatar alt="User" initials="AB" size="xl" />
```

---

## Badge

```tsx
import { Badge } from '@/components';

// Variants: success | warning | danger | info | default
<Badge variant="success">Active</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">New</Badge>

// Sizes: sm | md | lg
<Badge size="lg" variant="success">Large Badge</Badge>
```

---

## Container

```tsx
import { Container } from '@/components';

// Centered container with max-width
<Container maxWidth="lg" padding="md">
  <h1>Page content</h1>
  <p>This is centered with responsive padding</p>
</Container>

// Max widths: sm | md | lg | xl | full
<Container maxWidth="xl">Full content</Container>

// Padding: none | sm | md | lg
<Container padding="lg">Lots of padding</Container>
```

---

## Header

```tsx
import { Header } from '@/components';

// Simple header
<Header title="Page Title" />

// With subtitle and action
<Header
  title="Dashboard"
  subtitle="Welcome back!"
  action={<Button>Export</Button>}
/>
```

---

## Loading

```tsx
import { Loading } from '@/components';

// Centered spinner
<Loading size="md" />

// Full screen overlay
<Loading fullScreen size="lg" />

// Custom color
<Loading color="#1DB954" size="sm" />

// Sizes: sm | md | lg
```

---

## Modal

```tsx
import { Modal, Button } from '@/components';
import { useState } from 'react';

function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to do this?</p>
      </Modal>
    </>
  );
}
```

---

## Complete Example

```tsx
import {
  Button,
  Card,
  Container,
  Header,
  Input,
  Avatar,
  Badge,
} from '@/components';

export function UserProfile() {
  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="User Profile"
        action={<Button size="sm">Edit</Button>}
      />

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Avatar
            src="/user.jpg"
            alt="John Doe"
            size="lg"
          />
          <div>
            <h3>John Doe</h3>
            <Badge variant="success">Active</Badge>
          </div>
        </div>

        <Input
          label="Email"
          value="john@example.com"
          disabled
        />
        <Input
          label="Username"
          value="johndoe"
        />

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <Button variant="primary">Save</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </Container>
  );
}
```

---

## Import Convention

```tsx
// Import all at once
import {
  Button,
  Card,
  Input,
  // ...
} from '@/components';

// Or individual imports
import Button from '@/components/Button';
import Card from '@/components/Card';
```

---

## Component Props

All components support standard HTML attributes and are fully typed with TypeScript. Check the component source files for full prop definitions.

### Common Props
- `style?: React.CSSProperties` - Inline styles
- `className?: string` - CSS class names
- Standard HTML attributes (id, data-*, aria-*)

---

## Styling

Components use inline styles from the theme system. To customize globally, update `src/theme/theme.ts`:

```typescript
const theme = {
  colors: { ... },
  spacing: { ... },
  typography: { ... },
};
```

All components reference these theme values automatically.

---

**Happy building!** 🚀
