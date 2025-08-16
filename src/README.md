# DBlocks Code Pro - Source Code Organization

## 📁 Folder Structure

```
src/
├── block-variations/           # Block editor functionality
│   ├── component/              # Block editor components
│   │   ├── BlockControls.js   # Toolbar controls
│   │   ├── CustomIcon.js      # Block icon
│   │   ├── InspectorControlsComponent.js # Sidebar settings
│   │   └── Languages.js       # Language definitions
│   ├── utils/                  # Utility functions
│   │   └── editor-utils.js    # Editor helper functions
│   ├── Edit.js                 # Main block editor component
│   ├── save.js                 # Block save/rendering logic
│   ├── transforms.js           # Block transformations
│   ├── editor.scss             # Editor-specific styles
│   ├── style.scss              # Block styles
│   └── index.js                # Block registration entry point
│
├── frontend/                   # Frontend functionality
│   └── view.js                 # Frontend interactions (copy button, etc.)
│
├── admin-settings/             # Admin settings page
│   ├── tabs/                   # Settings tab components
│   │   ├── EditorTab.js        # HTML Code Editor settings
│   │   └── SyntaxTab.js        # Syntax Highlighter settings
│   └── AdminSettings.js        # Main settings component
│
├── index.js                    # Main entry point
├── admin-settings.js           # Admin settings entry point
├── admin-settings.scss         # Admin settings styles
└── block.json                  # Block metadata
```

## 🎯 Organization Benefits

### **✅ Clear Separation of Concerns:**
- **`block-variations/`**: Everything related to the block editor
- **`frontend/`**: Everything related to frontend functionality
- **`admin-settings/`**: Everything related to admin configuration

### **✅ Easy to Navigate:**
- **Block functionality** is all in one place
- **Frontend code** is isolated and easy to find
- **Admin settings** are organized by tabs

### **✅ Better Maintainability:**
- **Developers** can focus on specific areas
- **Code reviews** are easier with focused folders
- **Bug fixes** are isolated to specific functionality

### **✅ Future-Proof:**
- **Easy to add** new block variations
- **Simple to extend** admin settings
- **Clean structure** for new features

## 🔧 Development Workflow

### **Adding New Block Features:**
1. Add components to `block-variations/component/`
2. Update `block-variations/Edit.js` if needed
3. Add styles to `block-variations/editor.scss` or `block-variations/style.scss`

### **Adding New Admin Settings:**
1. Create new tab component in `admin-settings/tabs/`
2. Update `admin-settings/AdminSettings.js` to include new tab
3. Add styles to `admin-settings.scss` if needed

### **Adding Frontend Features:**
1. Update `frontend/view.js` with new functionality
2. Add any necessary styles or scripts

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `BlockControls.js`)
- **Utilities**: camelCase (e.g., `editor-utils.js`)
- **Styles**: kebab-case (e.g., `editor.scss`)
- **Folders**: kebab-case (e.g., `block-variations/`)

## 🚀 Build Process

The webpack configuration automatically handles:
- **Block editor**: `src/block-variations/` → `build/index.js`
- **Frontend**: `src/frontend/` → `build/view.js`
- **Admin settings**: `src/admin-settings/` → `build/admin-settings.js`
