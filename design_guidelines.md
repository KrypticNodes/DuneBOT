# Design Guidelines: Solana Sniper Wallet Tracker

## Design Approach

**System Selected:** Material Design with inspiration from professional crypto analytics platforms (Dextools, Birdeye, DEXScreener)

**Rationale:** This is a data-intensive professional trading tool requiring exceptional information density, real-time data clarity, and rapid pattern recognition. Material Design's elevation system and structured data components provide the foundation, while crypto platform patterns inform specialized trading-focused interactions.

**Core Principles:**
- Information hierarchy over aesthetics
- Scan-ability and rapid comprehension
- Persistent visibility of critical data
- Zero friction for time-sensitive decisions

---

## Typography System

**Font Family:** 
- Primary: 'Inter' (Google Fonts) - exceptional readability for dense data
- Monospace: 'Roboto Mono' (Google Fonts) - wallet addresses, transaction hashes, numerical values

**Hierarchy:**
- Dashboard Title: text-2xl font-semibold
- Section Headers: text-lg font-medium  
- Card Titles: text-base font-medium
- Data Labels: text-sm font-medium uppercase tracking-wide
- Body/Data: text-sm font-normal
- Wallet Addresses/Hashes: text-xs font-mono
- Metadata/Timestamps: text-xs

---

## Layout System

**Spacing Units:** Consistently use Tailwind units of **2, 4, 6, 8** (e.g., p-4, gap-6, m-8)

**Grid Structure:**
- Full-width dashboard with sidebar navigation (w-64 fixed)
- Main content: max-w-7xl with p-6
- Card-based layouts with gap-6 between cards
- Data tables: full-width within containers

**Responsive Breakpoints:**
- Mobile: Stack all cards, collapsible sidebar
- Tablet (md:): 2-column card grids where appropriate
- Desktop (lg:): 3-column grids for wallet cards, full tables

---

## Component Library

### Navigation
**Sidebar (Fixed Left):**
- Width: w-64
- Sections: Dashboard, Sniper Wallets, Funding Wallets, Alerts, Settings
- Active state: Subtle left border indicator
- Icons: Heroicons (outline style)

### Dashboard Cards
**Wallet Overview Cards (3-column grid on desktop):**
- Elevation: Subtle shadow (shadow-md)
- Padding: p-6
- Header: Wallet nickname + truncated address (mono font)
- Body: Key metrics (balance, last activity, alert count)
- Footer: Quick action link ("View Details")
- Corner indicator for active alerts

### Data Tables
**Transaction Feed:**
- Sticky header row with sort indicators
- Columns: Timestamp, Type (Buy/Sell/Transfer), Token, Amount, Source/Destination, Status
- Row hover states for interactivity
- Inline badges for transaction types
- Pagination at bottom (showing 25/50/100 entries)
- Truncated addresses with copy-to-clipboard icon

**Funding Wallet Table:**
- Similar structure to transaction feed
- Additional column for relationship strength/confidence
- Expandable rows for detailed transaction paths

### Alert System
**Alert Panel (Fixed Right or Top Banner):**
- Compact notification cards: p-4
- Icon + Token Name + Brief description + Timestamp
- Dismiss button
- Click-through to detailed view
- Visual indicator for unread alerts

### Token Metadata Display
**Detailed Token View (Modal or Dedicated Page):**
- Two-column layout (md:grid-cols-2)
- Left: Mint address, supply, holders, creation date
- Right: Activity chart, first detection timestamp, related wallets
- Copy buttons for all addresses
- Link to external explorers (Solscan, Solana Explorer)

### Real-Time Feed
**Live Transaction Stream:**
- Auto-updating list with smooth entry animations (slide-in only)
- Latest 20 transactions visible
- Timestamp with "X seconds ago" format
- Badge indicators for new mints vs. known tokens

### Charts & Visualizations
**Wallet Activity Timeline:**
- Horizontal timeline with transaction markers
- Hover tooltips for details
- Filterable by date range
- Clean line-based visualization

**Funding Flow Diagram:**
- Node-based graph showing wallet relationships
- Lines connecting funding sources to sniper wallets
- Interactive zoom/pan for complex networks

### Form Elements & Inputs
**Wallet Address Input:**
- Full-width text input with monospace font
- Validation indicator (checkmark/error)
- Character count/format hint below
- Clear button for quick reset

**Filter Controls:**
- Dropdown selects for token filters, date ranges
- Checkbox groups for transaction types
- Search input for quick wallet/token lookup
- Apply/Reset buttons

### Status Indicators
**Badges:**
- Rounded: rounded-full px-3 py-1 text-xs
- Types: New Mint (prominent), Buy (success tone), Sell (warning tone), Transfer (neutral)

**Activity Dots:**
- Small circular indicators for live monitoring status
- Pulsing animation for active monitoring (subtle)

---

## Accessibility Implementation

- All form inputs: Clear labels, aria-labels for icon buttons
- Keyboard navigation: Full tab order through tables, cards, modals
- Focus indicators: Visible outline on all interactive elements
- Color contrast: Ensure text meets WCAG AA standards
- Screen reader: Announce new alerts, transaction updates

---

## Animation Guidelines

**Minimal, Purposeful Only:**
- New alert slide-in: 200ms ease-out
- Live transaction entry: 150ms fade + slide
- Active monitoring pulse: Subtle, slow (2s cycle)
- NO scroll animations, parallax, or decorative effects

---

## Icon Strategy

**Library:** Heroicons (outline for navigation, solid for inline indicators)
**CDN:** Include via CDN link in HTML head

**Key Icons:**
- Dashboard: ChartBarIcon
- Wallets: WalletIcon  
- Alerts: BellIcon
- New Mint: SparklesIcon
- Copy: ClipboardDocumentIcon
- External Link: ArrowTopRightOnSquareIcon
- Filter: FunnelIcon
- Settings: CogIcon

---

## Images

**No hero images required** - this is a professional dashboard tool that should immediately display functional data.

**Optional Graphics:**
- Empty state illustrations for "No alerts" or "No transactions found" (use simple SVG illustrations from unDraw or similar)
- Placeholder avatars for wallets (geometric patterns based on address hash)

---

## Page Structure

**Primary Dashboard View:**
1. Top Bar: App title, global search, user menu
2. Sidebar: Navigation (fixed left)
3. Main Content Area:
   - Status summary cards (3-column grid showing monitored wallets count, active alerts, recent activity)
   - Live transaction feed (full-width card)
   - Recent alerts panel (sidebar or integrated)

**Wallet Detail Page:**
1. Wallet header (address, nickname, key metrics)
2. Activity timeline chart
3. Full transaction history table
4. Funding sources section
5. Token holdings list

**Alerts Page:**
- Filterable list of all alerts (chronological)
- Quick action buttons for each alert
- Archive/dismiss functionality