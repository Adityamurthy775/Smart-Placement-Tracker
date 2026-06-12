// common.js - Incandescent Palette
// White-hot glow on black - minimalist monochrome with dramatic contrast

// ─── Core Colour Values ──────────────────────────────────────────────────────
export const black = '#080808'
export const charcoal = '#0f0f0f'
export const darkGrey = '#1a1a1a'
export const mediumGrey = '#2a2a2a'
export const lightGrey = '#737373'
export const silver = '#a3a3a3'
export const platinum = '#d4d4d4'
export const offWhite = '#e5e5e5'
export const white = '#fafafa'
export const pureWhite = '#ffffff'

// ─── Apple Light Design System Tokens ────────────────────────────────────────
export const primaryText = 'text-[#080808]'
export const mutedText = 'text-[#737373]'
export const subtleText = 'text-[#a3a3a3]'
export const accentText = 'text-[#fafafa]'
export const strongAccentText = 'text-[#ffffff]'
export const errorText = 'text-[#0f0f0f]'

export const pageBg = 'bg-[#ffffff]'
export const surfaceBg = 'bg-[#fafafa]'
export const cardSurfaceBg = 'bg-[#f5f5f5]'
export const hoverSurfaceBg = 'hover:bg-[#f0f0f0]'
export const accentBg = 'bg-[#fafafa]'
export const accentBgHover = 'hover:bg-[#e5e5e5]'
export const strongAccentBg = 'bg-[#080808]'
export const strongAccentBgHover = 'hover:bg-[#0f0f0f]'
export const errorBg = 'bg-[#080808]/[0.06]'
export const errorBgHover = 'hover:bg-[#080808]/[0.12]'

export const defaultBorder = 'border border-[#e5e5e5]'
export const defaultBorderColor = 'border-[#e5e5e5]'
export const subtleBorderColor = 'border-[#d4d4d8]'
export const strongBorderColor = 'border-[#a3a3a3]'
export const errorBorderColor = 'border-[#080808]/[0.18]'

export const placeholderText = 'placeholder:text-[#a3a3a3]'
export const loadingText = 'text-[#737373]/60'

export const accentBorderFocus = 'focus:border-[#080808]'
export const accentRingFocus = 'focus:ring-2 focus:ring-[#080808]/10'

// Semantic (using monochrome scale)
export const successText = 'text-[#0f0f0f]'
export const successBg = 'bg-[#d4d4d4]'
export const warningText = 'text-[#737373]'
export const warningBg = 'bg-[#a3a3a3]'

// ─── Dashboard (dark monochrome) Tokens ──────────────────────────────────────
export const dashboardBgColor = 'bg-[#080808]'
export const dashboardSurfaceColor = 'bg-[#0f0f0f]'
export const dashboardSurfaceHover = 'hover:bg-[#1a1a1a]'
export const dashboardTextColor = 'text-[#fafafa]'
export const dashboardMutedColor = 'text-[#a3a3a3]'
export const dashboardBorderColor = 'border-[#2a2a2a]'
export const dashboardPrimaryBg = 'bg-[#fafafa]'
export const dashboardPrimaryBgHover = 'hover:bg-[#e5e5e5]'
export const dashboardPrimaryText = 'text-[#080808]'

// ─── Layout ──────────────────────────────────────────────────────────────────
export const pageBackground = `${pageBg} min-h-screen`
export const pageWrapper = 'max-w-6xl mx-auto px-6 py-16'
export const sectionWrapper = 'max-w-6xl mx-auto px-6'

// ─── Home / Hero ─────────────────────────────────────────────────────────────
export const homeWrapper = `${surfaceBg} min-h-screen`
export const heroSection = 'flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto px-6 py-20'
export const heroHeading = `text-5xl font-bold ${primaryText} leading-tight mb-5 tracking-tight`
export const heroSubheading = `text-lg ${mutedText} mb-8 leading-relaxed`
export const heroEmailRow = 'flex gap-3 flex-col sm:flex-row'
export const heroEmailInput = `${defaultBorder} rounded-xl px-4 py-3 text-sm ${primaryText} ${placeholderText} focus:outline-none ${accentBorderFocus} ${accentRingFocus} transition`
export const heroSignupBtn = `${strongAccentBg} text-white font-semibold px-6 py-3 rounded-xl ${strongAccentBgHover} transition-colors text-sm whitespace-nowrap shadow-lg`
export const heroPrivacyNote = `text-xs ${mutedText} mt-3`
export const heroVideo = 'rounded-2xl shadow-2xl w-full max-w-lg'

// ─── Feature highlights (Home page cards row) ────────────────────────────────
export const featureHighlights = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 py-12'
export const featureCard = `${cardSurfaceBg} rounded-2xl p-7 ${hoverSurfaceBg} transition-colors duration-200 cursor-pointer border ${defaultBorderColor}`
export const featureCardIcon = `text-3xl ${primaryText} mb-4 block`
export const featureCardTitle = `text-base font-bold ${primaryText} mb-2`
export const featureCardDesc = `text-sm ${mutedText} leading-relaxed`

// ─── Features page grid ──────────────────────────────────────────────────────
export const featuresGrid = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
export const featureItemCard = `${pageBg} rounded-2xl p-8 border ${defaultBorderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`
export const featureItemIcon = `text-4xl ${primaryText} mb-4 block`
export const featureItemTitle = `text-lg font-bold ${primaryText} mb-2`
export const featureItemDesc = `text-sm ${mutedText} leading-relaxed`

// ─── Auth (Login / Register) ─────────────────────────────────────────────────
export const loginContainer = `min-h-screen ${pageBg} flex items-center justify-center px-4 py-12`
export const loginBox = `${surfaceBg} rounded-2xl shadow-sm border ${defaultBorderColor} p-8 w-full max-w-sm flex flex-col gap-3`
export const loginInput = `w-full ${defaultBorder} rounded-xl px-4 py-2.5 text-sm ${primaryText} ${placeholderText} focus:outline-none ${accentBorderFocus} ${accentRingFocus} transition`
export const loginBtn = `w-full ${strongAccentBg} text-white font-semibold py-2.5 rounded-full ${strongAccentBgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm`
export const errorClass = `text-xs ${errorText} mt-0.5`

// ─── Notifications page ──────────────────────────────────────────────────────
export const notifPage = 'max-w-2xl mx-auto px-4 py-8'
export const notifHeader = 'flex items-center justify-between mb-4'
export const notifTitle = `text-xl font-bold ${primaryText}`
export const notifList = 'flex flex-col divide-y divide-[#f2f2f7]'
export const notifItem = 'flex items-start gap-3 px-4 py-3.5 hover:bg-[#f9f9f9] transition-colors cursor-pointer'
export const notifItemUnread = 'flex items-start gap-3 px-4 py-3.5 bg-[#080808]/[0.04] hover:bg-[#080808]/[0.08] transition-colors cursor-pointer'
export const notifItemAvatar = `w-8 h-8 rounded-full ${pageBg} border ${defaultBorderColor} flex items-center justify-center shrink-0 mt-0.5`
export const notifItemBody = 'flex-1 min-w-0'
export const notifItemText = `text-xs leading-relaxed ${primaryText}`
export const notifItemTime = 'text-[10px] text-[#a3a3a3] mt-0.5'
export const notifEmptyState = 'flex flex-col items-center justify-center py-20 text-center'

// ─── User Profile ────────────────────────────────────────────────────────────
export const profilePage = `min-h-screen ${pageBg} flex items-start justify-center px-4 py-12`
export const profileCard = `${surfaceBg} rounded-2xl shadow-sm border ${defaultBorderColor} p-8 w-full max-w-lg flex flex-col items-center`
export const profileAvatarWrap = 'flex flex-col items-center mb-2'
export const profileAvatar = ''
export const profileName = `text-xl font-bold ${primaryText} mt-3`
export const profileEmail = `text-sm ${mutedText}`
export const profileSection = 'w-full'
export const profileSectionTitle = `text-sm font-semibold ${primaryText}`
export const profileFormGroup = 'flex flex-col gap-1'
export const profileLabel = `text-xs font-medium ${mutedText}`
export const profileInput = `w-full ${defaultBorder} rounded-xl px-3 py-2.5 text-sm ${primaryText} ${placeholderText} focus:outline-none ${accentBorderFocus} disabled:bg-[#ffffff] disabled:border-transparent disabled:cursor-default transition`
export const profileSaveBtn = `${strongAccentBg} ${strongAccentBgHover} disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-full transition-colors cursor-pointer text-sm`

// ─── General buttons ─────────────────────────────────────────────────────────
export const primaryBtn = `${strongAccentBg} text-white font-semibold px-5 py-2 rounded-full ${strongAccentBgHover} transition-colors cursor-pointer text-sm`
export const secondaryBtn = `${defaultBorder} ${primaryText} font-medium px-5 py-2 rounded-full hover:bg-[#fafafa] transition-colors cursor-pointer text-sm`
export const dangerBtn = `bg-[#0f0f0f] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#080808] transition-colors cursor-pointer text-sm`

// ─── Cards / containers ──────────────────────────────────────────────────────
export const cardClass = `${pageBg} border ${defaultBorderColor} rounded-2xl p-7 ${hoverSurfaceBg} transition-colors duration-200 cursor-pointer`
export const cardTitle = `text-base font-bold ${primaryText} mb-1`
export const cardDesc = `text-sm ${mutedText} leading-relaxed`

// ─── Form helpers ────────────────────────────────────────────────────────────
export const formCard = `${pageBg} rounded-2xl p-10 max-w-4xl mx-auto border ${defaultBorderColor}`
export const formTitle = `text-2xl font-bold ${primaryText} tracking-tight text-center mb-7`
export const formGroup = 'mb-4'
export const labelClass = `text-xs font-medium ${mutedText} mb-1.5 block`
export const inputClass = `w-full ${surfaceBg} ${defaultBorder} rounded-xl px-4 py-2.5 ${primaryText} text-sm ${placeholderText} focus:outline-none ${accentBorderFocus} ${accentRingFocus} transition`
export const submitBtn = `w-full ${strongAccentBg} text-white font-semibold py-2.5 rounded-full ${strongAccentBgHover} transition-colors cursor-pointer mt-2 text-sm`

// ─── Feedback / status ───────────────────────────────────────────────────────
export const loadingClass = `${loadingText} text-sm animate-pulse text-center py-10`
export const emptyState = `text-center py-20 ${mutedText} text-sm`

// ─── Dashboard (monochrome dark) ─────────────────────────────────────────────
export const dashboardBg = dashboardBgColor
export const dashboardCard = `${dashboardSurfaceColor} rounded-xl ${dashboardSurfaceHover} transition-colors`
export const dashboardText = dashboardTextColor
export const dashboardMuted = dashboardMutedColor
export const dashboardBorder = `border ${dashboardBorderColor}`
export const dashboardBtn = `flex items-center gap-1.5 px-3 h-8 rounded text-xs ${dashboardTextColor} border ${dashboardBorderColor} ${dashboardSurfaceHover} hover:text-white transition-colors`
export const dashboardPrimaryBtn = `flex items-center gap-2 px-4 h-9 rounded ${dashboardPrimaryBg} ${dashboardPrimaryBgHover} ${dashboardPrimaryText} text-sm font-semibold transition-colors`

// ─── Board workspace ─────────────────────────────────────────────────────────
export const projectFallbackBg = dashboardBgColor
export const projectHeader = 'flex items-center justify-between px-4 py-2 bg-black/20 backdrop-blur-sm shrink-0'
export const projectHeaderBtn = 'text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1'
export const projectHeaderTitle = 'text-white font-bold text-base'
export const projectShareBtn = 'flex items-center gap-1.5 px-3 h-7 rounded bg-[#f4f4f5]/10 hover:bg-[#f4f4f5]/20 text-white text-xs font-medium transition-colors'
export const projectCanvas = 'flex-1 overflow-x-auto overflow-y-hidden px-4 py-3'
export const projectListRow = 'flex gap-3 h-full items-start'

// ─── Pricing page ────────────────────────────────────────────────────────────
export const pricingCard = `${surfaceBg} rounded-2xl border ${defaultBorderColor} p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1`
export const pricingCardFeatured = `${strongAccentBg} rounded-2xl p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-white`

// ─── Sidebar (dark) ──────────────────────────────────────────────────────────
export const sidebarLink = `flex items-center gap-2.5 px-3 h-9 rounded text-sm font-medium w-full text-left transition-colors ${dashboardTextColor} ${dashboardSurfaceHover} hover:text-white`
export const sidebarLinkActive = `flex items-center gap-2.5 px-3 h-9 rounded text-sm font-medium w-full text-left transition-colors bg-[#ffffff]/10 text-white`

// ─── Navbar (dark) ───────────────────────────────────────────────────────────
export const navbarWrap = `flex items-center h-12 px-2 gap-1 ${dashboardBgColor} border-b ${dashboardBorderColor} sticky top-0 z-40`
export const navbarBtn = `flex items-center gap-1 px-2.5 h-8 rounded ${dashboardTextColor} ${dashboardSurfaceHover} hover:text-white text-sm font-medium transition-colors`
export const navbarCreateBtn = `flex items-center gap-1.5 px-3 h-8 rounded ${dashboardPrimaryBg} ${dashboardPrimaryBgHover} ${dashboardPrimaryText} text-sm font-semibold transition-colors`
export const navbarIconBtn = `flex items-center justify-center w-8 h-8 rounded ${dashboardSurfaceHover} ${dashboardMutedColor} hover:text-white transition-colors`

// ─── Workspace / Templates (dark pages) ──────────────────────────────────────
export const darkPageWrap = `flex h-screen w-screen overflow-hidden ${dashboardBgColor}`
export const darkSidebar = `w-56 shrink-0 border-r ${dashboardBorderColor} py-4 overflow-y-auto`
export const darkSidebarLink = `text-left px-3 py-1.5 rounded text-sm transition-colors ${dashboardMutedColor} ${dashboardSurfaceHover} hover:text-white`
export const darkSidebarLinkActive = `text-left px-3 py-1.5 rounded text-sm transition-colors bg-[#ffffff]/10 text-white font-medium`
export const darkMain = 'flex-1 overflow-y-auto px-8 py-6'
