# CustomPanel Component

A custom component that replaces WordPress's `Panel` and `PanelBody` components with custom styling and no collapse functionality.

## Usage

```jsx
import CustomPanel from '../components/CustomPanel';

// Basic usage
<CustomPanel title="Your Panel Title">
    <p>Your content goes here</p>
    <button>Action Button</button>
</CustomPanel>

// With custom className
<CustomPanel title="Custom Styled Panel" className="my-custom-class">
    <div>Custom styled content</div>
</CustomPanel>
```

## Props

- **title** (string, required): The title displayed in the panel header
- **children** (ReactNode, required): The content to display inside the panel
- **className** (string, optional): Additional CSS classes to apply

## Features

- ✅ **No collapse functionality** - Content is always visible
- ✅ **Custom styling** - Beautiful gradient header with custom colors
- ✅ **Responsive design** - Works well on all screen sizes
- ✅ **Consistent spacing** - Proper margins and padding for form controls
- ✅ **Modern appearance** - Rounded corners, shadows, and gradients

## Styling

The component includes:
- Gradient header background (blue to purple)
- White content area with proper padding
- Subtle shadows and borders
- Responsive spacing for form controls
- Custom typography for labels and help text
