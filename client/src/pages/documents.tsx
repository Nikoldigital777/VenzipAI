// client/src/pages/documents.tsx
import FileUpload from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documents() {
  return (
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
  );
}