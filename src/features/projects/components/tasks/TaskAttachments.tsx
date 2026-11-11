"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { notifyApiError } from "@/lib/errorHandling";

type Attachment = { id: number; name: string; size: number; uploadedBy: number | null };

export function TaskAttachments({ taskId, userId, canManage }: { taskId: number; userId?: number; canManage: boolean }) {
 const [busy, setBusy] = useState(false);
 const client = useQueryClient();
 const key = ["task-attachments", taskId];
 const endpoint = `/tasks/${taskId}/attachments`;
 const { data: files = [], isLoading, isError, refetch } = useQuery({ queryKey: key, queryFn: async () => (await api.get<{data: Attachment[]}>(endpoint, { skipSuccessToast: true })).data.data });
 const refresh = () => client.invalidateQueries({ queryKey: key });
 const upload = async (file: File) => {
  if (file.size > 25 * 1024 * 1024 || !/\.(pdf|ppt|pptx)$/i.test(file.name)) { toast.error("Choose a PDF or PowerPoint file up to 25 MB."); return; }
  setBusy(true);
  try { const form = new FormData(); form.append("file", file); await api.post(endpoint, form, { skipSuccessToast: true }); await refresh(); toast.success("Document uploaded"); } catch (error) { notifyApiError(error); } finally { setBusy(false); }
 };
 const download = async (file: Attachment) => {
  try { const response = await api.get(`${endpoint}/${file.id}/download`, { responseType: "blob", skipSuccessToast: true }); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (error) { notifyApiError(error); }
 };
 const remove = async (id: number) => { setBusy(true); try { await api.delete(`${endpoint}/${id}`, { skipSuccessToast: true }); await refresh(); } catch (error) { notifyApiError(error); } finally { setBusy(false); } };
 return <section className="rounded-md border p-3 text-sm">
  <h4 className="font-medium">Documents</h4>
  {isLoading ? <p className="mt-2 text-muted-foreground">Loading documents...</p> : isError ? <button type="button" className="mt-2 underline" onClick={() => void refetch()}>Could not load documents. Try again.</button> : files.length ? <ul className="mt-2 space-y-2">{files.map(file => <li key={file.id} className="flex items-center gap-3"><button type="button" className="min-w-0 truncate text-primary underline" onClick={() => void download(file)}>{file.name}</button><span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>{(canManage || file.uploadedBy === userId) && <button type="button" disabled={busy} className="ml-auto text-destructive" aria-label={`Remove ${file.name}`} onClick={() => void remove(file.id)}>×</button>}</li>)}</ul> : <p className="mt-2 text-muted-foreground">No documents yet.</p>}
  {canManage && <label className="mt-3 block text-muted-foreground">PDF or PowerPoint · up to 25 MB each · 10 files maximum<input aria-label="Add task document" type="file" accept=".pdf,.ppt,.pptx" disabled={busy || isError || files.length >= 10} className="mt-1 block w-full text-xs" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} /></label>}
 </section>;
}
