# Design System: Obsidian Pulse
**Theme: Multisig Command Center**

## 1. Visual Direction & Inspiration
- **Concept**: A high-security, ultra-modern sovereign layer for multi-party consensus.
- **Inspiration**: Fictional User Interfaces (FUI), Space Station control panels, Cyberpunk minimalism, and high-end automotive dashboards.
- **Mood**: Secure, Precise, Immersive, Elite.

## 2. Color Palette
### Base Colors
- **Void Black**: `#050505` (Main background)
- **Obsidian**: `#0D0D0D` (Surface layer 1)
- **Deep Slate**: `#1A1A1A` (Surface layer 2)

### Accent Colors
- **Pulse Cyan**: `#00F5FF` (Primary action, active states)
- **Neon Violet**: `#8B5CF6` (Secondary action, highlights)
- **Warning Amber**: `#FBBF24` (Pending signatures, alerts)
- **Critical Red**: `#EF4444` (Declined, error)
- **Success Green**: `#10B981` (Executed, confirmed)

### Gradients
- **Hyper-Flow**: `linear-gradient(135deg, #00F5FF 0%, #8B5CF6 100%)`
- **Glass Edge**: `linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`

## 3. Typography
- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter) (Variable) - Clean, readable, professional.
- **Display Font**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) - Futuristic, geometric headings.
- **Monospace**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) - For wallet addresses and transaction hashes.

### Hierarchy
- **H1 (Header)**: Space Grotesk, Semi-bold, Letter-spacing: -0.02em.
- **Body**: Inter, Regular/Medium.
- **Address**: JetBrains Mono, Medium, Opacity: 0.8.

## 4. Layout Principles (The "Bento Grid")
- **Modularity**: Use a grid system where each component is a self-contained "module".
- **Glassmorphism**: 
  - `backdrop-filter: blur(12px)`
  - `background: rgba(13, 13, 13, 0.7)`
  - `border: 1px solid rgba(255, 255, 255, 0.1)`
- **Padding**: Generous spacing (`2rem`+) to avoid clutter and emphasize focus.

## 5. Component Behavior
- **Buttons**:
  - Hover: Subtle outer glow (`drop-shadow`) and 2% scale up.
  - Active: 2% scale down, flash of primary color.
- **Cards**:
  - Hover: Border opacity increases from 0.1 to 0.3. Inner glow appears.
- **Inputs**:
  - Focus: Border glows with the primary accent color. Background darkens.

## 6. Animations & Transitions
- **Entry**: Subtle "fade-in + slide-up" (20px) for all modules.
- **Micro-interactions**: 
  - Pulsing glow for pending signatures.
  - Data "streaming" effect (shimmer) for loading states.
  - Smooth expansion for transaction details.
- **Transitions**: Global `cubic-bezier(0.4, 0, 0.2, 1)` for all property changes.

## 7. Multisig Specific Visuals
- **Threshold Visualizer**: A circular progress ring that "fills" as signatures are added.
- **Signer Status**: 
  - Signed: Solid Cyan pulse.
  - Pending: Blinking Amber dot.
  - Required: Empty ring.
- **Simulations**: Transaction results displayed in a "Holographic" side panel with technical details.

---
*Created for the Bondchain Multisig Protocol.*
