'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'
import slugify from 'slugify'

function SortableRow({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category
  onEdit: (cat: Category) => void
  onDelete: (id: string, name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#f9f9f7' : 'white',
      }}
      className="px-5 py-3 flex items-center gap-3 border-b border-gray-50 last:border-0"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        tabIndex={-1}
        title="Déplacer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect y="1" width="14" height="1.5" rx="1" />
          <rect y="6" width="14" height="1.5" rx="1" />
          <rect y="11" width="14" height="1.5" rx="1" />
        </svg>
      </button>

      {/* Name + slug */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{cat.name}</p>
        <p className="text-xs text-gray-400">/{cat.slug}</p>
      </div>

      {/* Actions */}
      <button
        onClick={() => onEdit(cat)}
        title="Modifier"
        className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button
        onClick={() => onDelete(cat.id, cat.name)}
        title="Supprimer"
        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  )
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient()

  const sorted = [...initialCategories].sort((a, b) => a.sort_order - b.sort_order)
  const [categories, setCategories] = useState<Category[]>(sorted)

  // Create form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit modal
  const [editing, setEditing] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const slug = slugify(name, { lower: true, strict: true, locale: 'fr' })
    const sort_order = categories.length
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug, description: description.trim() || null, sort_order })
      .select()
      .single()
    if (error) {
      setError(error.message)
    } else if (data) {
      setCategories([...categories, data])
      setName('')
      setDescription('')
    }
    setSaving(false)
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Supprimer la catégorie "${catName}" ?\nLes articles associés ne seront pas supprimés.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) setCategories(categories.filter((c) => c.id !== id))
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setEditName(cat.name)
    setEditDescription(cat.description ?? '')
    setEditError('')
  }

  async function handleEditSave() {
    if (!editing || !editName.trim()) return
    setEditSaving(true)
    setEditError('')
    const newSlug = slugify(editName, { lower: true, strict: true, locale: 'fr' })
    const { data, error } = await supabase
      .from('categories')
      .update({ name: editName.trim(), slug: newSlug, description: editDescription.trim() || null })
      .eq('id', editing.id)
      .select()
      .single()
    if (error) {
      setEditError(error.message)
    } else if (data) {
      setCategories(categories.map((c) => (c.id === editing.id ? data : c)))
      setEditing(null)
    }
    setEditSaving(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({ ...c, sort_order: i }))
    setCategories(reordered)

    // Persist all updated positions
    await Promise.all(
      reordered.map((c) =>
        supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id)
      )
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Nouvelle catégorie</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Actualités"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {name && (
                <p className="text-xs text-gray-400 mt-1">
                  Slug : {slugify(name, { lower: true, strict: true, locale: 'fr' })}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Création…' : 'Créer la catégorie'}
            </button>
          </form>
        </div>

        {/* Sortable list */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Catégories ({categories.length})</h2>
            <p className="text-xs text-gray-400">Glisser pour réordonner</p>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div>
                {categories.map((cat) => (
                  <SortableRow key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />
                ))}
                {!categories.length && (
                  <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune catégorie.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Modifier la catégorie</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                {editName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Nouveau slug : {slugify(editName, { lower: true, strict: true, locale: 'fr' })}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <p className="text-xs text-gray-400">
                Les articles assignés à cette catégorie restent affectés après modification.
              </p>
              {editError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{editError}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editName.trim()}
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {editSaving ? 'Sauvegarde…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
