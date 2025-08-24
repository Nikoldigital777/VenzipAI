// client/src/pages/documents.tsx
import FileUpload from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";

export default function Documents() {
  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-5xl mx-auto px-4 py-12 grid gap-6">
          <FileUpload />

          {/* Placeholder: future list of uploaded docs */}
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-500">
              Your recent uploads will appear here.
            </CardContent>
          </Card>
        </div>
      </div>
      <AIChat />
    </>
  );
}