"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { addComment, deleteComment, getCommentsByMarbleId, updateComment } from "@/services/marbles"
import type { Comment } from "@/types/comment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"

export function CommentsSection({ marbleId }: { marbleId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [rating, setRating] = useState<number>(5)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>(undefined)
  const [editingText, setEditingText] = useState("")

  const meId = user?.id
  const meName = user?.name || user?.email || "User"

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getCommentsByMarbleId(marbleId)
      .then((data) => {
        if (mounted) setComments(data)
      })
      .catch((e) => {
        if (mounted) setError(e?.message || "Failed to load comments")
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [marbleId])

  const canSubmit = useMemo(() => !!meId && text.trim().length > 0, [meId, text])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meId) return
    setSubmitting(true)
    try {
      const created = await addComment({
        userId: meId,
        userName: meName,
        text,
        marbleId,
        rating,
      })
      setComments((prev) => [created, ...prev])
      setText("")
      setRating(5)
      toast.success("Your comment was added", "Comment Added")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to add comment", "Error")
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id?: string) => {
    if (!id) return
    const cid = id
    try {
      await deleteComment(cid)
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== cid))
      toast.success("Comment deleted", "Deleted")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to delete comment", "Error")
    }
  }

  const startEdit = (c: Comment) => {
    setEditingId(String(c.id || c._id))
    setEditingText(c.text)
  }

  const onSave = async () => {
    if (!editingId) return
    try {
      const updated = await updateComment(editingId, editingText)
      setComments((prev) => prev.map((c) => (String(c.id || c._id) === editingId ? updated : c)))
      setEditingId(undefined)
      toast.success("Comment updated", "Updated")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to update comment", "Error")
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {/* New comment */}
      <form onSubmit={onSubmit} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <Label htmlFor="comment-text" className="sr-only">Comment</Label>
            <Input
              id="comment-text"
              placeholder="Share your thoughts..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!meId}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="rating" className="text-sm">Rating</Label>
            <select
              id="rating"
              className="h-9 rounded-md border bg-transparent px-2"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={!meId}
            >
              {[5,4,3,2,1].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Button type="submit" disabled={!canSubmit || submitting}>Add</Button>
          </div>
        </div>
        {!meId && (
          <p className="text-xs text-muted-foreground">Please login to add a comment.</p>
        )}
      </form>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const cid = String(c.id || c._id)
            const mine = meId && c.userId === meId
            return (
              <li key={cid} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{c.userName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(c.createdAt ?? Date.now()).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-sm">
                  {editingId === cid ? (
                    <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                  ) : (
                    c.text
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs">Rating: {c.rating}</div>
                  {mine && (
                    <div className="flex gap-2">
                      {editingId === cid ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(undefined)}>Cancel</Button>
                          <Button size="sm" onClick={onSave}>Save</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(c)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(cid)}>Delete</Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
