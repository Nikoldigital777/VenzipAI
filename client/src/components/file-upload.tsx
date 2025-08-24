// client/src/components/file-upload.tsx
import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UploadResult = { id: string; filename: string; mimetype: string; size: number; url: string };

export default function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<UploadResult>;
    },
    onSuccess: (data) => {
      setLastResult(data);
      // if you later list docs with a query, invalidate it here
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    mutation.mutate(files[0]);
  }, [mutation]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.currentTarget.value = "";
  };

  return (
    <Card>
      <CardHeader><CardTitle>Upload evidence</CardTitle></CardHeader>
      <CardContent>
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          className={[
            "border-2 border-dashed rounded-xl p-8 text-center transition",
            dragActive ? "border-venzip-primary bg-venzip-primary/5" : "border-gray-300"
          ].join(" ")}
        >
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop a file here, or click to select
          </p>
          <label className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-venzip-primary text-white cursor-pointer">
            Choose file
            <input
              type="file"
              className="hidden"
              onChange={onInput}
            />
          </label>

          {mutation.isPending && (
            <div className="mt-4 text-sm text-gray-500">Uploading…</div>
          )}

          {lastResult && !mutation.isPending && (
            <div className="mt-6 text-left border rounded-lg p-4">
              <div className="font-medium">{lastResult.filename}</div>
              <div className="text-xs text-gray-500">{lastResult.mimetype} • {Math.round(lastResult.size / 1024)} KB</div>
              <a
                className="inline-block mt-2 text-sm text-venzip-primary underline"
                href={lastResult.url}
                target="_blank"
                rel="noreferrer"
              >
                View file
              </a>
            </div>
          )}
        </div>

        {mutation.isError && (
          <div className="mt-4 text-sm text-red-600">
            {(mutation.error as Error).message || "Upload failed"}
          </div>
        )}

        {lastResult && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => setLastResult(null)}>
              Upload another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}