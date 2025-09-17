import { lazy, Suspense } from 'react';

// Lazy load the AIChat component to prevent performance issues during app initialization
const AIChat = lazy(() => import('./ai-chat'));

export default function LazyAIChat() {
  return (
    <Suspense fallback={null}>
      <AIChat />
    </Suspense>
  );
}