# LOR Generator - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Professional Academic Interface

**Rationale:** This is a utility-focused productivity tool for academic document generation. The interface prioritizes clarity, trust, and efficiency over visual flair. We'll draw from Material Design principles with professional academic refinement, similar to Google Scholar, ResearchGate, or Grammarly's clean interfaces.

**Core Principles:**
1. Trust & Credibility - Professional academic aesthetic
2. Clarity & Efficiency - Clear information hierarchy for complex forms
3. Progress Visibility - Always show where users are in the process
4. Document-Centric - Preview and output are the stars

---

## Typography System

**Font Families:**
- Primary: Inter or Source Sans Pro (clean, professional sans-serif)
- Monospace: JetBrains Mono (for code/technical fields if needed)

**Hierarchy:**
- Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-2xl, font-semibold  
- Card/Component Titles: text-xl, font-medium
- Body Text: text-base, font-normal
- Helper Text/Labels: text-sm, font-medium
- Fine Print: text-xs

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency
- Component padding: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Form field gaps: gap-4 to gap-6
- Page margins: px-4 md:px-8

**Grid Structure:**
- Max width containers: max-w-7xl for full layouts, max-w-4xl for focused content
- Form wizard: max-w-3xl centered for optimal readability
- Two-column layouts for preview/edit modes: grid-cols-1 lg:grid-cols-2

---

## Component Library

### A. Navigation & Progress
**Header:**
- Fixed top navigation with university/app branding on left
- Minimal menu with "Dashboard," "New LOR," "Faculty Directory"
- User profile dropdown on right

**Progress Stepper (Multi-Step Form):**
- Horizontal step indicator showing: "Student Info" → "Questionnaire" → "Resume Upload" → "Faculty Selection" → "Review & Generate"
- Active step highlighted, completed steps with checkmarks
- Linear progression, no skipping ahead

### B. Form Components

**Input Fields:**
- Label above field (text-sm, font-medium)
- Input with border, rounded-lg, p-3
- Helper text below in muted tone (text-sm)
- Error states with inline validation messages
- Consistent spacing: space-y-1.5 for label-input-helper grouping

**Text Areas:**
- Large comfortable sizing (min-h-32 to min-h-48)
- Character count indicator when relevant
- Auto-resize capability for long responses

**File Upload:**
- Drag-and-drop zone with dashed border
- File type and size restrictions clearly shown
- Upload progress indicator
- Preview thumbnail after upload with remove option

**Select Dropdowns:**
- Faculty selection as searchable dropdown with avatar + name + department
- Standard dropdown for simple selections (purpose, semester, etc.)

### C. Cards & Containers

**Faculty Cards (Directory):**
- Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Card contains: Profile photo, name, designation, department, email, courses taught
- Hover state with subtle elevation
- "Select" button when choosing for LOR

**Questionnaire Section Cards:**
- Each section in a card with rounded-lg borders
- Section title at top
- Multiple questions grouped within
- Collapsible sections for completed areas

**LOR Preview Card:**
- Professional document mockup with letterhead simulation
- Proper document margins and spacing
- Distinct paragraphs with proper line-height (leading-relaxed)
- University header template at top
- Signature section at bottom

### D. Data Display

**Generated LOR Display:**
- Document-like presentation with max-w-3xl
- Typography mimicking formal letter: serif font option for preview
- Clear paragraph breaks
- Highlight customizable sections (hover to edit inline)

**Resume Data Extraction Display:**
- Parsed information shown in structured format
- Editable fields if extraction needs correction
- Accordion sections for: Academic Details, Projects, Internships, Skills, Achievements

### E. Actions & CTAs

**Primary Actions:**
- Large, prominent buttons: "Generate LOR," "Download PDF," "Download DOCX"
- Sized: px-6 py-3, text-base font-semibold, rounded-lg

**Secondary Actions:**
- "Save Draft," "Go Back," "Edit" buttons in muted treatment
- Smaller sizing: px-4 py-2

**Button States:**
- Loading state with spinner for "Generate LOR"
- Disabled state for incomplete forms
- Success state after generation

### F. Overlays & Modals

**Confirmation Dialogs:**
- "Confirm Faculty Selection" before proceeding
- "Discard Draft?" when navigating away
- max-w-md, centered, with overlay backdrop

**Success Modal:**
- After LOR generation: "Your LOR has been generated successfully!"
- Preview snippet with download actions
- Share options if applicable

---

## Page Layouts

### 1. Dashboard/Home
- Hero section with value proposition: "Generate Professional Academic LORs in Minutes"
- Stats cards: "LORs Generated," "Faculty Profiles," "Success Rate"
- Recent LORs table with status (Draft, Completed)
- CTA: "Create New LOR" button prominently placed

### 2. Multi-Step Form Wizard
- Progress stepper fixed at top
- Centered content area (max-w-3xl)
- Form sections with clear grouping
- Sticky footer with "Back" and "Next" navigation
- Auto-save indicator

### 3. Faculty Directory
- Search and filter bar at top
- Grid of faculty cards
- Add new faculty button (admin access)
- Pagination or infinite scroll

### 4. Preview & Download
- Two-column layout on desktop: Preview (left) | Actions panel (right)
- Single column on mobile: Preview on top, actions sticky at bottom
- Download format options clearly presented
- Edit/Regenerate options available

---

## Images

**Hero Section Image:**
- Professional academic imagery: graduation ceremony, university campus, or abstract education symbolism
- Placement: Right side of hero on desktop, background on mobile
- Treatment: Subtle overlay to ensure text readability

**Faculty Directory:**
- Profile photos for each faculty member (150x150, rounded)
- Placeholder avatars with initials for missing photos

**Empty States:**
- Illustration for "No LORs Yet" - encouragement to create first one
- "No Faculty Profiles" - prompt to add faculty

---

## Animations & Interactions

**Minimal Motion:**
- Smooth transitions between form steps (slide/fade)
- Loading spinner during LOR generation
- Subtle hover states on cards and buttons
- Success checkmark animation after generation

**Avoid:**
- Parallax effects
- Excessive scroll animations
- Distracting background animations

---

## Icon Library

**Icons:** Heroicons (outline for most UI, solid for filled states)
- Document icon for LORs
- User icon for faculty
- Upload icon for file uploads
- Download icon for export
- Checkmark for completed steps
- Pencil for edit actions