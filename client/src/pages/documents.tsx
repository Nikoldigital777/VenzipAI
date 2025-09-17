// client/src/pages/documents.tsx
import FileUpload from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIChat from "@/components/ai-chat";
import { FileText, Upload } from "lucide-react";

export default function Documents() {
  return (
    <>
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-5xl mx-auto px-4 py-12 grid gap-6">
          <FileUpload />

          {/* Placeholder: future list of uploaded docs */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">Your recent uploads will appear here</p>
              <p className="text-xs text-gray-400">Upload documents using the form above to get started</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <AIChat />
    </>
  );
}