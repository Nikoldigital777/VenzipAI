import { TourStep } from '@/hooks/useTour';

export const mainTourSteps: TourStep[] = [
  // Welcome & Orientation (Steps 1-3)
  {
    target: 'body',
    title: 'Welcome to Venzip!',
    content: 'Welcome to your AI-powered compliance platform! This quick tour will show you the key features that will help you manage your compliance requirements effortlessly.',
    placement: 'center',
    showSkip: true,
  },
  {
    target: '[data-sidebar]',
    title: 'Navigation Sidebar',
    content: 'This is your navigation hub. Here you can access all the main sections: Dashboard, Tasks, Evidence, Risks, and more. You can also see your framework completion progress.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-dashboard"]',
    title: 'Dashboard Overview',
    content: 'Your compliance command center! The Dashboard shows your overall compliance status, risk scores, recent activities, and AI-driven insights.',
    placement: 'right',
  },
  
  // Core Workflows (Steps 4-12)
  {
    target: '[data-testid="nav-tasks"]',
    title: 'Task Management',
    content: 'Manage all your compliance tasks here. Create, assign, and track progress on tasks across different frameworks like ISO 27001, SOC 2, HIPAA, and GDPR.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-evidence"]',
    title: 'Evidence Upload',
    content: 'Upload and manage your compliance documents here. Our AI will automatically analyze and map your documents to the relevant compliance requirements.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-frameworks"]',
    title: 'Compliance Frameworks',
    content: 'View detailed analytics for each compliance framework. See your progress, identify gaps, and get AI-powered recommendations for improvement.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-risks"]',
    title: 'Risk Management',
    content: 'Monitor and manage compliance risks with our AI-driven risk scoring system. Track mitigation progress and get early warnings about potential issues.',
    placement: 'right',
  },
  
  // Advanced Features (Steps 8-12)
  {
    target: '[data-testid="ai-chat-button"]',
    title: 'AI Assistant (Claude)',
    content: 'Meet your compliance expert! Click here anytime to chat with Claude, our AI assistant who can answer questions, analyze documents, and provide tailored guidance.',
    placement: 'top',
  },
  {
    target: '[data-testid="nav-audit-calendar"]',
    title: 'Audit Calendar',
    content: 'Stay on top of important deadlines and schedule your compliance activities. Plan audits, track certification renewals, and never miss a deadline.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-learning-hub"]',
    title: 'Learning Hub',
    content: 'Expand your compliance knowledge with curated resources, best practices, and training materials tailored to your industry and frameworks.',
    placement: 'right',
  },
  {
    target: '[data-testid="nav-company-profile"]',
    title: 'Company Settings',
    content: 'Configure your company profile, manage team members, and customize your compliance preferences and notification settings.',
    placement: 'right',
  },
  
  // Tour Completion
  {
    target: 'body',
    title: 'You\'re All Set!',
    content: 'Congratulations! You now know the key features of Venzip. Start by uploading your first document or creating a task. Remember, Claude is always here to help if you have questions!',
    placement: 'center',
    showSkip: false,
  },
];

// Feature-specific mini-tours
export const evidenceUploadTour: TourStep[] = [
  {
    target: '[data-testid="file-upload-area"]',
    title: 'Upload Your Documents',
    content: 'Drag and drop your compliance documents here, or click to browse. We support PDFs, Word docs, Excel files, and images.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="evidence-mapping-results"]',
    title: 'AI Analysis Results',
    content: 'After upload, our AI analyzes your document and maps it to relevant compliance requirements. Review the suggestions and confirm the mappings.',
    placement: 'top',
  },
];

export const taskCreationTour: TourStep[] = [
  {
    target: '[data-testid="create-task-button"]',
    title: 'Create New Task',
    content: 'Click here to create a new compliance task. You can assign it to team members, set deadlines, and link it to specific framework requirements.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="task-form-framework"]',
    title: 'Select Framework',
    content: 'Choose which compliance framework this task relates to. This helps with tracking progress and generating framework-specific reports.',
    placement: 'right',
  },
];

export const aiChatTour: TourStep[] = [
  {
    target: '[data-testid="ai-chat-interface"]',
    title: 'Claude AI Assistant',
    content: 'Ask Claude anything about compliance! From specific regulatory questions to document analysis, Claude provides expert guidance tailored to your needs.',
    placement: 'left',
  },
  {
    target: '[data-testid="chat-input"]',
    title: 'Ask Your Questions',
    content: 'Type your compliance questions here. Claude can help with everything from policy writing to audit preparation and risk assessment.',
    placement: 'top',
  },
];