import { TourStep } from '@/hooks/useTour';

export const mainTourSteps: TourStep[] = [
  // Welcome & Orientation (Steps 1-3)
  {
    target: 'body',
    title: '🚀 Welcome to Venzip!',
    content: 'Welcome to your AI-powered compliance platform! This comprehensive tour will guide you through all the key features that will transform how you manage compliance requirements. Let\'s get started!',
    placement: 'center',
    showSkip: true,
  },
  {
    target: '[data-testid="app-sidebar"]',
    title: '🧭 Your Navigation Hub',
    content: 'This sidebar is your command center. You can access all main sections, track framework progress, and see completion percentages at a glance. Notice how each section is organized for optimal workflow.',
    placement: 'right',
    fallbackTarget: '[data-sidebar="sidebar"]',
  },
  {
    target: '[data-testid="nav-dashboard"]',
    title: '📊 Dashboard - Your Control Center',
    content: 'Let\'s start with the Dashboard - your compliance command center. Click here to see your overall status, risk scores, and AI-driven insights. This is where you\'ll monitor your compliance health.',
    placement: 'right',
    navigateTo: '/dashboard',
    fallbackTarget: '[href="/dashboard"]',
  },
  
  // Dashboard Deep Dive (Step 4)
  {
    target: '[data-testid="compliance-overview-card"]',
    title: '📈 Compliance Overview',
    content: 'Here you can see your overall compliance status across all frameworks. The visual indicators show your progress and highlight areas that need attention. This real-time view helps you prioritize your work.',
    placement: 'bottom',
    fallbackTarget: '.glass-card',
  },
  
  // Task Management (Steps 5-6)
  {
    target: '[data-testid="nav-tasks"]',
    title: '✅ Task Management',
    content: 'Now let\'s explore task management. This is where you\'ll create, assign, and track all your compliance tasks across different frameworks. Click to navigate to the tasks section.',
    placement: 'right',
    navigateTo: '/tasks',
    fallbackTarget: '[href="/tasks"]',
  },
  {
    target: '[data-testid="create-task-button"]',
    title: '➕ Creating Tasks',
    content: 'Use this button to create new compliance tasks. You can assign tasks to team members, set deadlines, link them to specific frameworks, and track progress. Tasks are the building blocks of your compliance program.',
    placement: 'bottom',
    fallbackTarget: 'button[class*="gradient"]',
  },
  
  // Evidence Management (Steps 7-8)
  {
    target: '[data-testid="nav-evidence"]',
    title: '📁 Evidence Management',
    content: 'Evidence management is crucial for compliance. This section handles all your compliance documents. Our AI will analyze and automatically map documents to relevant requirements.',
    placement: 'right',
    navigateTo: '/evidence',
    fallbackTarget: '[href="/evidence"]',
  },
  {
    target: '[data-testid="file-upload-area"]',
    title: '🤖 AI-Powered Document Analysis',
    content: 'Upload documents here and watch our AI work! It automatically analyzes content, identifies compliance mappings, suggests improvements, and tracks document completeness. This saves hours of manual work.',
    placement: 'top',
    fallbackTarget: '.border-dashed',
  },
  
  // Risk Management (Steps 9-10)
  {
    target: '[data-testid="nav-risks"]',
    title: '⚠️ Risk Management',
    content: 'Risk management is key to proactive compliance. Here you\'ll monitor compliance risks with our AI-driven scoring system and track mitigation progress.',
    placement: 'right',
    navigateTo: '/risks',
    fallbackTarget: '[href="/risks"]',
  },
  {
    target: '[data-testid="tab-dashboard"]',
    title: '🎯 Risk Scoring & Monitoring',
    content: 'Our AI continuously evaluates your compliance risks, considering factors like overdue tasks, missing evidence, and regulatory changes. This dashboard helps you focus on the highest-priority issues first.',
    placement: 'bottom',
    fallbackTarget: '[data-testid="summary-high-risk"]',
  },
  
  // Compliance Frameworks (Steps 11-12)
  {
    target: '[data-testid="nav-frameworks"]',
    title: '🛡️ Compliance Frameworks',
    content: 'This is where you\'ll find detailed analytics for each compliance framework. View progress, identify gaps, and get AI-powered recommendations for improvement.',
    placement: 'right',
    navigateTo: '/compliance-insights',
    fallbackTarget: '[href="/compliance-insights"]',
  },
  {
    target: '.glass-card',
    title: '📊 Framework Analytics & Gap Analysis',
    content: 'Get deep insights into your compliance posture. See completion percentages, identify gaps, track trends over time, and receive AI recommendations tailored to each framework\'s requirements.',
    placement: 'bottom',
    fallbackTarget: '.container',
  },
  
  // AI Assistant (Step 13)
  {
    target: '[data-testid="ai-chat-button"]',
    title: '🤖 Meet Claude - Your AI Compliance Expert',
    content: 'This is Claude, your AI assistant! Claude can answer compliance questions, analyze documents, provide regulatory guidance, and help with policy writing. Think of Claude as your 24/7 compliance consultant.',
    placement: 'left',
  },
  
  // Advanced Features (Steps 14-16)
  {
    target: '[data-testid="nav-audit-calendar"]',
    title: '📅 Audit Calendar',
    content: 'Stay ahead of deadlines with the audit calendar. Schedule compliance activities, track certification renewals, plan audits, and never miss important dates.',
    placement: 'right',
    navigateTo: '/audit-calendar',
  },
  {
    target: '[data-testid="nav-learning-hub"]',
    title: '📚 Learning Hub',
    content: 'Expand your compliance knowledge with curated resources, best practices, training materials, and industry-specific guidance. Continuous learning is key to staying compliant.',
    placement: 'right',
    navigateTo: '/learning-hub',
  },
  {
    target: '[data-testid="nav-company-profile"]',
    title: '⚙️ Company Settings',
    content: 'Configure your company profile, manage team members, set up integrations, and customize compliance preferences. This is where you tailor Venzip to your organization\'s needs.',
    placement: 'right',
    navigateTo: '/company-profile',
  },
  
  // Tour Completion (Step 17)
  {
    target: 'body',
    title: '🎉 You\'re Ready to Achieve Compliance Excellence!',
    content: 'Congratulations! You\'ve mastered Venzip\'s key features. Start by uploading your first document, creating a task, or asking Claude a question. Your journey to streamlined compliance begins now!',
    placement: 'center',
    showSkip: false,
  },
];

// Feature-specific mini-tours for contextual help
export const evidenceUploadTour: TourStep[] = [
  {
    target: '[data-testid="file-upload-area"]',
    title: '📄 Upload Your Documents',
    content: 'Drag and drop compliance documents here, or click to browse. Supported formats: PDFs, Word docs, Excel files, images. Our AI will analyze each document automatically.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="evidence-mapping-results"]',
    title: '🤖 AI Analysis Magic',
    content: 'Watch as our AI analyzes your document content, identifies compliance mappings, suggests gap remediation, and provides completeness scores. Review and confirm the AI suggestions.',
    placement: 'top',
  },
  {
    target: '[data-testid="evidence-suggestions"]',
    title: '💡 Smart Recommendations',
    content: 'Based on the analysis, see AI-generated suggestions for missing evidence, policy improvements, and compliance enhancements tailored to your frameworks.',
    placement: 'bottom',
    fallbackTarget: '.evidence-results',
  },
];

export const taskCreationTour: TourStep[] = [
  {
    target: '[data-testid="create-task-button"]',
    title: '➕ Create Smart Tasks',
    content: 'Create compliance tasks with AI assistance. Tasks automatically inherit framework requirements, get priority scoring, and include completion criteria.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="task-form-framework"]',
    title: '🎯 Framework Integration',
    content: 'Select frameworks to automatically populate relevant controls, requirements, and best practices. This ensures your tasks align with compliance standards.',
    placement: 'right',
  },
  {
    target: '[data-testid="task-ai-suggestions"]',
    title: '🤖 AI Task Enhancement',
    content: 'Get AI-powered suggestions for task descriptions, success criteria, timeline estimates, and resource requirements based on industry best practices.',
    placement: 'left',
    fallbackTarget: '.task-form',
  },
];

export const aiChatTour: TourStep[] = [
  {
    target: '[data-testid="ai-chat-interface"]',
    title: '🤖 Claude - Your Compliance Expert',
    content: 'Claude understands your company profile, current compliance status, and industry requirements. Get personalized, contextual guidance for any compliance question.',
    placement: 'left',
  },
  {
    target: '[data-testid="chat-input"]',
    title: '💬 Ask Anything Compliance',
    content: 'Ask about specific regulations, policy writing, audit preparation, risk assessment, or document analysis. Claude adapts responses to your industry and frameworks.',
    placement: 'top',
  },
  {
    target: '[data-testid="chat-suggestions"]',
    title: '💡 Smart Prompts',
    content: 'Use suggested prompts or ask custom questions. Claude can analyze your uploaded documents, recommend improvements, and provide implementation guidance.',
    placement: 'bottom',
    fallbackTarget: '.chat-container',
  },
];

// Quick tours for specific workflows
export const dashboardTour: TourStep[] = [
  {
    target: '[data-testid="compliance-score"]',
    title: '📊 Your Compliance Score',
    content: 'This AI-calculated score reflects your overall compliance posture across all frameworks. It considers task completion, evidence quality, and risk factors.',
    placement: 'bottom',
    fallbackTarget: '.dashboard-overview',
  },
  {
    target: '[data-testid="risk-trending"]',
    title: '📈 Risk Trends',
    content: 'Monitor how your risk profile changes over time. Spot patterns, identify emerging issues, and track the effectiveness of your mitigation efforts.',
    placement: 'top',
    fallbackTarget: '.risk-trends',
  },
];

export const riskAssessmentTour: TourStep[] = [
  {
    target: '[data-testid="risk-matrix"]',
    title: '🎯 Interactive Risk Matrix',
    content: 'Visualize risks by impact and likelihood. Click on any cell to see specific risks and their mitigation strategies. The AI continuously updates risk scores.',
    placement: 'bottom',
    fallbackTarget: '.risk-matrix',
  },
  {
    target: '[data-testid="risk-recommendations"]',
    title: '🔍 AI Risk Insights',
    content: 'Get intelligent recommendations for risk mitigation, including specific actions, timelines, and resource requirements based on your industry and frameworks.',
    placement: 'top',
    fallbackTarget: '.risk-recommendations',
  },
];