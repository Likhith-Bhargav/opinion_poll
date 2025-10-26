# Opinion Poll Platform - UI Themes

This application now supports multiple UI themes that can be easily switched at runtime. The theme system is designed to be modular, maintainable, and easily extensible.

## Available Themes

### 🌈 Modern Theme
- **Description**: Glass morphism design with gradient backgrounds
- **Features**: Translucent elements, blur effects, vibrant gradients
- **Best for**: Modern, colorful interfaces

### ✨ Classic Theme
- **Description**: Elegant dark design with creative animations
- **Features**: Dark background, gold accents, sophisticated animations
- **Best for**: Professional, timeless interfaces

## How to Switch Themes

### Runtime Switching
Users can switch between themes using the theme switcher button located in the top-right corner of the application.

### Programmatic Switching
```javascript
import { useTheme } from './themes/ThemeContext';

function MyComponent() {
  const { currentTheme, switchTheme } = useTheme();

  const handleThemeSwitch = () => {
    switchTheme('classic'); // Switch to classic theme
  };

  return (
    // Your component JSX
  );
}
```

## Theme Structure

Each theme contains:
- **Components**: React components with theme-specific styling
- **Styles**: CSS files with animations and visual effects
- **Configuration**: Theme metadata and component mappings

```
frontend/src/themes/
├── ThemeContext.js          # React context for theme management
├── ThemeSwitcher.js         # Theme switcher component
├── ThemeSwitcher.css        # Theme switcher styles
├── themeConfig.js           # Theme configuration system
├── ModernApp.js             # Modern theme app wrapper
└── classic/                 # Classic theme directory
    ├── ClassicApp.js        # Classic theme app wrapper
    ├── ClassicTheme.css     # Classic theme styles
    ├── Auth.js              # Classic auth component
    ├── Auth.css             # Classic auth styles
    ├── PollList.js          # Classic poll list component
    ├── PollList.css         # Classic poll list styles
    ├── CreatePoll.js        # Classic create poll component
    ├── CreatePoll.css       # Classic create poll styles
    ├── PollDetail.js        # Classic poll detail component
    └── PollDetail.css       # Classic poll detail styles
```

## Creating a New Theme

1. **Create Theme Directory**
```bash
mkdir -p frontend/src/themes/your-theme-name/
```

2. **Add Theme Configuration**
```javascript
// In themeConfig.js
your_theme: {
  name: 'Your Theme',
  description: 'Description of your theme',
  icon: '🎨',
  components: {
    App: 'YourApp',
    Auth: 'Auth',
    PollList: 'PollList',
    CreatePoll: 'CreatePoll',
    PollDetail: 'PollDetail'
  },
  paths: {
    App: './themes/your-theme-name/YourApp',
    Auth: './themes/your-theme-name/Auth',
    // ... other components
  },
  styles: {
    main: './themes/your-theme-name/YourTheme.css',
    auth: './themes/your-theme-name/Auth.css',
    // ... other styles
  }
}
```

3. **Create Components**
Create your themed versions of each component in your theme directory.

4. **Add Styles**
Create corresponding CSS files with your theme's visual design.

## Theme Features

### Animation System
The classic theme includes a comprehensive animation system:
- `fadeInUp`: Smooth upward fade-in animation
- `slideInRight`: Right-to-left slide animation
- `glow`: Pulsing glow effect
- `shimmer`: Moving shimmer effect
- `float`: Gentle floating animation
- `pulse`: Breathing pulse effect

### Color Scheme
Classic theme uses a sophisticated color palette:
- **Primary Dark**: `#0a0a0a` - Deep black
- **Secondary Dark**: `#1a1a1a` - Rich dark gray
- **Accent Dark**: `#2d2d2d` - Medium dark gray
- **Gold**: `#d4af37` - Elegant gold accent
- **Gold Light**: `#f4e192` - Soft gold highlight

### Responsive Design
Both themes are fully responsive with:
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Optimized typography scaling

## Best Practices

1. **Consistency**: Maintain consistent styling patterns across components
2. **Performance**: Use CSS transforms and opacity for animations
3. **Accessibility**: Ensure proper contrast ratios and focus states
4. **Testing**: Test themes across different devices and screen sizes

## Customization

### Adding New Animations
```css
@keyframes yourAnimation {
  from { /* initial state */ }
  to { /* final state */ }
}
```

### Modifying Colors
Update the CSS custom properties in your theme's CSS file:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* ... other variables */
}
```

## Troubleshooting

### Theme Not Loading
- Check that all component files exist in the theme directory
- Verify theme configuration in `themeConfig.js`
- Ensure CSS imports are correct

### Styling Issues
- Check for CSS specificity conflicts
- Verify animation timing and delays
- Test responsive breakpoints

### Performance Issues
- Minimize reflows with transform-based animations
- Use CSS containment where appropriate
- Optimize animation frame rates

## Contributing

When adding new themes:
1. Follow the established file structure
2. Maintain component API compatibility
3. Include comprehensive CSS documentation
4. Test across different browsers and devices
5. Update this README with theme details
