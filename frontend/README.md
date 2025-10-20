# Physical Therapy SaaS - Frontend

A beautiful, minimal React frontend with **dynamic color theming** per clinic.

## 🎨 Features

### Multi-Tenant Color Theming
- Each clinic gets a **custom primary color**
- System **auto-generates** a complete 11-shade palette
- Colors applied in **real-time** using CSS custom properties
- Supports **hex color picker** and **preset colors**

### Technology Stack
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chroma.js** - Color palette generation
- **Lucide React** - Beautiful icons

## 🚀 Getting Started

### Start Development Server
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── pages/          # Page components
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── RegisterClinicPage.jsx
├── utils/          # Utility functions
│   ├── api.js              # API client
│   └── colorPalette.js     # Color generation
├── App.jsx         # Main app with routing
├── main.jsx        # Entry point
└── index.css       # Global styles + Tailwind

```

## 🎨 How Color Theming Works

### 1. System Admin Registers Clinic
- Chooses a primary color (e.g., `#A855F7` purple)
- System generates 11 shades automatically
- Stored in database: `clinics.primary_color`

### 2. User Logs In
- Backend returns clinic info with `primaryColor`
- Frontend generates palette using `chroma.js`
- Applies colors to CSS custom properties:
  ```css
  :root {
    --primary-50: #faf5ff;
    --primary-100: #f3e8ff;
    ...
    --primary-900: #581c87;
    --primary-950: #3b0764;
  }
  ```

### 3. UI Updates Automatically
- Tailwind classes use: `bg-primary-600`, `text-primary-700`, etc.
- All components adapt to new color scheme
- No page reload needed!

## 🎯 Login Credentials

### System Admin
```
Email: admin@system.com
Password: Admin123!
```

### Sample Clinics
```
Downtown PT:
  Email: admin@downtown-pt.com
  Password: Admin123!

Uptown Wellness:
  Email: admin@uptown-wellness.com
  Password: Admin123!
```

## 📚 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/dashboard` | All users | Main dashboard |
| `/register-clinic` | System Admin | Register new clinic with color picker |
| `/patients` | Coming soon | Patient management |
| `/sessions` | Coming soon | Session scheduling |

## 🎨 Color Palette Generation

The `colorPalette.js` utility provides:

```javascript
// Generate palette from one color
const palette = generateColorPalette('#A855F7');
// Returns: { 50: '#faf5ff', 100: '#f3e8ff', ... }

// Apply to UI
applyColorPalette('#A855F7');

// Get contrasting text color
const textColor = getContrastColor('#A855F7');
// Returns: '#FFFFFF' (white on purple)

// Generate chart colors
const chartColors = generateChartColors('#A855F7', 6);
```

## 🎯 Next Features to Implement

- [ ] Patients page with CRUD operations
- [ ] Sessions page with calendar view
- [ ] Session series creation wizard
- [ ] Cascade reschedule interface
- [ ] Staff management
- [ ] Real-time stats on dashboard
- [ ] Dark mode support
- [ ] Mobile responsive improvements

## 🛠️ Development Tips

### Testing Color Themes

1. Login as system admin
2. Click "Register New Clinic"
3. Try different colors from the preset picker
4. Watch the palette generate in real-time
5. Register the clinic and see it applied

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Protect with `<ProtectedRoute>` if needed
4. Use `useAuth()` hook for user/clinic data

### Styling Components

Use Tailwind classes with primary colors:
```jsx
<button className="bg-primary-600 hover:bg-primary-700">
  Button
</button>
```

The `primary-*` colors automatically adapt to the clinic's theme!

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.0.2",
  "axios": "^1.7.9",
  "chroma-js": "^3.1.2",
  "lucide-react": "^0.469.0",
  "tailwindcss": "^3.4.17"
}
```

## 🎨 Preset Colors

The registration page includes 10 preset colors:
- Blue, Purple, Pink, Red, Orange
- Yellow, Green, Teal, Cyan, Indigo

Each generates a beautiful, harmonious palette!

## 🚀 Performance

- **Fast**: Vite HMR for instant updates
- **Small**: Tree-shaking removes unused code
- **Optimized**: CSS purged in production
- **Responsive**: Tailwind's mobile-first approach

---

**Built with ❤️ for Physical Therapy clinics**
