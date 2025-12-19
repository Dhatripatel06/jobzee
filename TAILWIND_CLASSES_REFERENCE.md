# Custom Tailwind Classes - Quick Reference

## Button Classes

### `.btn-primary`
Primary action button with accent color
```jsx
<button className="btn-primary">Click Me</button>
```
**Styles:**
- Background: `#2d5649` (accent-500)
- Hover: Darker shade with shadow elevation
- Focus: Ring outline
- Active: Slight scale down
- Padding: `px-6 py-3`
- Rounded: `rounded-lg`

### `.btn-secondary`
Secondary action button with outline
```jsx
<button className="btn-secondary">Cancel</button>
```
**Styles:**
- Border: 2px solid `#2d5649`
- Text: `#2d5649`
- Hover: Fill with accent color, white text
- Focus: Ring outline
- Active: Slight scale down

## Form Input Classes

### `.input-field`
Standard form input styling
```jsx
<input type="text" className="input-field" />
```
**Styles:**
- Width: `w-full`
- Padding: `px-4 py-3`
- Border: `border border-gray-300`
- Border radius: `rounded-lg`
- Background: `bg-gray-50`
- Hover: `bg-white`
- Focus: Ring with accent color

## Layout Classes

### `.page-container`
Page content wrapper with max-width
```jsx
<div className="page-container">
  {/* Content */}
</div>
```
**Styles:**
- Container: `container mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8`
- Max-width: `max-w-7xl` (1280px)

### `.card`
Card component with shadow and hover effects
```jsx
<div className="card p-6">
  {/* Card content */}
</div>
```
**Styles:**
- Background: `bg-white`
- Border radius: `rounded-xl`
- Shadow: `shadow-md`
- Hover shadow: `shadow-xl`
- Hover transform: `-translate-y-1`
- Border: `border border-gray-100`

## Typography Classes

### `.section-title`
Large section heading
```jsx
<h2 className="section-title">Section Title</h2>
```
**Styles:**
- Size: `text-3xl md:text-4xl lg:text-5xl`
- Weight: `font-bold`
- Color: `text-secondary-900`
- Margin: `mb-6`

### `.section-subtitle`
Section description text
```jsx
<p className="section-subtitle">Description text</p>
```
**Styles:**
- Size: `text-lg md:text-xl`
- Color: `text-secondary-600`
- Margin: `mb-8`

## Utility Classes

### `.text-gradient`
Gradient text effect
```jsx
<span className="text-gradient">Gradient Text</span>
```
**Styles:**
- Gradient: `from-accent-500 to-primary-600`
- Background clip: `text`
- Text fill: `transparent`

## Color Palette

### Primary/Accent Colors
```
accent-50:  #f0fdf4  (Very light green)
accent-100: #dcfce7
accent-200: #bbf7d0
accent-300: #86efac
accent-400: #4ade80
accent-500: #2d5649  ⭐ (Main brand color)
accent-600: #1f3d33
accent-700: #16302a
```

### Secondary (Slate) Colors
```
secondary-50:  #f8fafc
secondary-100: #f1f5f9
secondary-200: #e2e8f0
secondary-300: #cbd5e1
secondary-400: #94a3b8
secondary-500: #64748b
secondary-600: #475569
secondary-700: #334155
secondary-800: #1e293b
secondary-900: #0f172a
```

### Primary (Green) Colors
```
primary-50:  #f0fdf4
primary-100: #dcfce7
primary-200: #bbf7d0
primary-300: #86efac
primary-400: #4ade80
primary-500: #22c55e
primary-600: #16a34a
primary-700: #15803d
primary-800: #166534
primary-900: #14532d
```

## Animation Classes

### Built-in Animations

#### `.animate-fade-in`
Fade in animation
```jsx
<div className="animate-fade-in">Content</div>
```
Duration: 0.5s

#### `.animate-slide-up`
Slide up from bottom
```jsx
<div className="animate-slide-up">Content</div>
```
Duration: 0.5s

#### `.animate-slide-down`
Slide down from top
```jsx
<div className="animate-slide-down">Content</div>
```
Duration: 0.5s

#### `.animate-scale-in`
Scale in from center
```jsx
<div className="animate-scale-in">Content</div>
```
Duration: 0.3s

## Common Component Patterns

### Navigation Link
```jsx
<Link
  to="/path"
  className="px-4 py-2 text-secondary-700 font-medium rounded-lg
             hover:bg-accent-50 hover:text-accent-600 
             transition-all duration-200"
>
  Link Text
</Link>
```

### Form Group
```jsx
<div className="mb-6">
  <label className="block text-sm font-semibold text-secondary-700 mb-2">
    Label Text
  </label>
  <input type="text" className="input-field" />
</div>
```

### Card with Icon
```jsx
<div className="card p-6 group cursor-pointer">
  <div className="text-accent-500 text-4xl mb-4 
                  group-hover:scale-110 transition-transform duration-300">
    {icon}
  </div>
  <h3 className="text-xl font-bold text-secondary-900 mb-2">Title</h3>
  <p className="text-secondary-600">Description</p>
</div>
```

### Modal Backdrop
```jsx
<div className="fixed inset-0 bg-black bg-opacity-75 
                flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl p-8 max-w-md">
    {/* Modal content */}
  </div>
</div>
```

### Empty State
```jsx
<div className="text-center py-12">
  <div className="text-accent-500 text-6xl mb-4">{icon}</div>
  <h3 className="text-2xl font-bold text-secondary-900 mb-2">
    No Items Found
  </h3>
  <p className="text-secondary-600">Description text</p>
</div>
```

## Responsive Breakpoints

```
sm:  640px   (Small devices)
md:  768px   (Medium devices)
lg:  1024px  (Large screens)
xl:  1280px  (Extra large)
2xl: 1536px  (2X Extra large)
```

### Usage Examples
```jsx
{/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Text: responsive sizing */}
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>

{/* Padding: responsive */}
<div className="p-4 md:p-6 lg:p-8">Content</div>
```

## Hover Effects

### Scale Up
```jsx
<div className="transform hover:scale-110 transition-transform duration-300">
```

### Shadow Grow
```jsx
<div className="shadow-md hover:shadow-xl transition-shadow duration-300">
```

### Color Transition
```jsx
<div className="text-secondary-700 hover:text-accent-500 transition-colors duration-200">
```

### Translate Up
```jsx
<div className="transform hover:-translate-y-1 transition-transform duration-300">
```

## Focus States

### Ring on Focus
```jsx
<button className="focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2">
```

### Custom Focus
```jsx
<input className="focus:border-accent-500 focus:ring-2 focus:ring-accent-500">
```

## Tips & Best Practices

1. **Always use responsive classes** for padding, margins, and text sizes
2. **Combine transitions** for smooth multi-property animations
3. **Use group hover** for parent-child interactive elements
4. **Maintain consistent spacing** using Tailwind's spacing scale
5. **Prefer utility classes** over custom CSS
6. **Use semantic colors** (accent for primary, secondary for text)
7. **Add focus states** to all interactive elements
8. **Use motion-reduce** for accessibility when needed

## Common Combinations

### Centered Container
```jsx
<div className="min-h-screen flex items-center justify-center">
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card p-6">...</div>
</div>
```

### Full-width Section
```jsx
<section className="bg-gradient-to-b from-accent-50 to-white py-16">
  <div className="page-container">
    {/* Content */}
  </div>
</section>
```

### Flex Between
```jsx
<div className="flex items-center justify-between">
```

### Absolute Positioning
```jsx
<div className="absolute top-4 right-4">
```
