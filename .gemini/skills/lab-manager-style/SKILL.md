---
name: lab-manager-style
description: Provides the visual identity, design tokens, and UI patterns extracted from the "Lab Manager Dashboard" Figma project. Use this skill to ensure consistency in subsequent UI iterations, focusing on clinical, clean, and data-driven dashboards for LIMS environments.
---

# Lab Manager Style Guide

This skill encapsulates the "Lab Manager Dashboard" design style, which is a modern, clinical, and data-centric aesthetic designed for laboratory operations.

## 1. Visual Identity & Principles

- **Clarity & Precision**: Use clear typography and ample white space to reduce cognitive load during data entry and review.
- **Status-Driven UI**: Visual indicators (badges, borders, icons) must immediately communicate the state of a sample, instrument, or process.
- **Glassmorphism & Depth**: Utilize subtle backdrops, soft shadows, and border-accented containers (shadcn/ui style).
- **Responsive Clinical Design**: Prioritize readability on various screen sizes, ensuring critical metrics are always visible.

## 2. Design Tokens (Colors & Typography)

### Color Palette (Tailwind Utility Classes)
- **Primary (Action/Brand)**: `blue-600` (Main actions), `blue-50` (Active states).
- **Surface**: `slate-50` (Background), `white` (Cards/Modals).
- **Status Colors**:
  - **Success (Approved/Passed)**: `emerald-500` text, `emerald-50` background.
  - **Destructive (Rejected/OOS)**: `rose-500` text, `rose-50` background.
  - **Warning (Pending/Review)**: `amber-500` text, `amber-50` background.
  - **Neutral (Draft/Inactive)**: `slate-400` text, `slate-50` background.

### Typography
- **Font**: Inter or Geist (Sans-serif).
- **Headers**: `font-bold tracking-tight text-slate-900`.
- **Subtext**: `text-sm text-slate-500 leading-relaxed`.

## 3. Core Components (Recreation Patterns)

### 3.1 StatusBadge
Use for Sample Units, Analysis Results, and Equipment states.
```jsx
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
  Approved
</span>
```

### 3.2 MetricCard
Use for Dashboard KPIs.
```jsx
<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center gap-4">
    <div className="p-2 bg-blue-50 rounded-lg">
      <LucideIcon className="h-5 w-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
</div>
```

### 3.3 OOS Alert (Out of Specification)
Critical for LIMS. High visibility.
```jsx
<div className="border-l-4 border-rose-500 bg-rose-50 p-4 rounded-r-lg">
  <div className="flex">
    <AlertCircle className="h-5 w-5 text-rose-500" />
    <div className="ml-3">
      <h3 className="text-sm font-bold text-rose-800">Out of Specification detected</h3>
      <div className="mt-1 text-sm text-rose-700">{details}</div>
    </div>
  </div>
</div>
```

### 3.4 DataEntry Table
Clean borders, zebra-striping, and hover effects.
```jsx
<table className="w-full text-left text-sm border-separate border-spacing-0">
  <thead>
    <tr className="bg-slate-50/50">
      <th className="border-b border-slate-200 p-4 font-semibold">Parameter</th>
      <th className="border-b border-slate-200 p-4 font-semibold">Value</th>
      <th className="border-b border-slate-200 p-4 font-semibold text-right">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="p-4 border-b border-slate-100 font-medium">Appearance</td>
      <td className="p-4 border-b border-slate-100">Clear Liquid</td>
      <td className="p-4 border-b border-slate-100 text-right">...</td>
    </tr>
  </tbody>
</table>
```

## 4. Layout Rules
1. **Sidebar Navigation**: Fixed left-side with collapsible state. Use icons + labels.
2. **Breadcrumbs**: Always show path above the Page Title.
3. **Action Header**: Page title on the left, primary actions (buttons) on the right.
4. **Grid System**: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for metrics.

## 5. Compliance Elements
- **Electronic Signature**: Use a modal with clear "Sign" intent, password verification, and reason for signature (GAMP 5 compliance).
- **Audit Trail Indicators**: Subtle "last modified by" labels on critical data blocks.
