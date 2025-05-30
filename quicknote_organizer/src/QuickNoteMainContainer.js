import React, { useState, useRef } from "react";

/* === COLOR PALETTE === */
const COLORS = {
  primary: "#4A90E2",
  secondary: "#FFFFFF",
  accent: "#F5A623",
  background: "#F7Fafd",
  text: "#222",
  card: "#fff",
  border: "#e3e8ee",
  fabShadow: "0 4px 18px rgba(74,144,226,.15)"
};

const CATEGORY_COLORS = [
  "#4A90E2", // Blue
  "#F5A623", // Orange
  "#7ED321", // Green
  "#D0021B", // Red
  "#8B572A", // Brown
  "#9013FE"  // Purple
];

/* === MAIN CONTAINER COMPONENT === */
/**
 * PUBLIC_INTERFACE
 * QuickNoteMainContainer is the primary component for QuickNote Organizer.
 * Handles the note CRUD, search, and categorization logic.
 */
function QuickNoteMainContainer() {
  // Notes: {id, title, content, categories []}
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Welcome to QuickNote!",
      content: "Start adding your notes. You can tag notes, edit them & search.",
      categories: ["Getting Started"],
      createdAt: Date.now()
    }
  ]);
  const [search, setSearch] = useState("");
  const [editingNote, setEditingNote] = useState(null); // {id, ...}
  const [showEditor, setShowEditor] = useState(false);

  const nextId = useRef(2);

  // --- CRUD OPERATIONS ---

  // PUBLIC_INTERFACE
  function handleCreateNote(newNote) {
    setNotes((prev) => [
      {
        ...newNote,
        id: nextId.current++,
        createdAt: Date.now()
      },
      ...prev
    ]);
    setShowEditor(false);
  }

  // PUBLIC_INTERFACE
  function handleUpdateNote(updatedNote) {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? { ...note, ...updatedNote } : note))
    );
    setShowEditor(false);
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    if (window.confirm("Delete this note?")) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      setShowEditor(false);
      setEditingNote(null);
    }
  }

  // PUBLIC_INTERFACE
  function handleEditNoteRequest(note) {
    setEditingNote(note);
    setShowEditor(true);
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // Filter notes by search (title/content/category match)
  const displayedNotes = notes.filter((note) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      note.title.toLowerCase().includes(s) ||
      note.content.toLowerCase().includes(s) ||
      note.categories.some((cat) => cat.toLowerCase().includes(s))
    );
  });

  // Get all categories in use
  const allCategories = Array.from(
    new Set(notes.flatMap((note) => note.categories || []))
  );

  // --- RENDER ---
  return (
    <div style={styles.root}>
      {/* SEARCH BAR */}
      <div style={styles.searchBarContainer}>
        <input
          style={styles.searchInput}
          placeholder="Search notes..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search notes"
        />
      </div>

      {/* CATEGORY TABS */}
      {allCategories.length > 0 && (
        <div style={styles.categoryTabs}>
          {allCategories.map((cat, i) => (
            <span
              key={cat}
              style={{
                ...styles.categoryTab,
                background: getCategoryColor(cat, allCategories)
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* NOTES LIST */}
      <div style={styles.noteGrid}>
        {displayedNotes.length === 0 ? (
          <div style={styles.emptyMsg}>No notes found.</div>
        ) : (
          displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => handleEditNoteRequest(note)}
              onDelete={() => handleDeleteNote(note.id)}
              allCategories={allCategories}
            />
          ))
        )}
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        style={styles.fab}
        title="Add new note"
        onClick={() => {
          setShowEditor(true);
          setEditingNote(null);
        }}
        aria-label="Add note"
      >
        +
      </button>

      {/* NOTE EDITOR MODAL */}
      {showEditor && (
        <NoteEditorModal
          note={editingNote}
          onSave={editingNote ? handleUpdateNote : handleCreateNote}
          onCancel={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
          allCategories={allCategories}
        />
      )}
    </div>
  );
}

/* === NOTE CARD COMPONENT === */
/**
 * PUBLIC_INTERFACE
 * Displays note as a card. Shows title, content snippet, categories/tags, with edit/delete actions.
 */
function NoteCard({ note, onEdit, onDelete, allCategories }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>{note.title}</div>
        <div>
          <button
            style={styles.iconBtn}
            title="Edit"
            aria-label="Edit note"
            onClick={onEdit}
          >
            <span role="img" aria-label="edit">✏️</span>
          </button>
          <button
            style={styles.iconBtn}
            title="Delete"
            aria-label="Delete note"
            onClick={onDelete}
          >
            <span role="img" aria-label="delete">🗑️</span>
          </button>
        </div>
      </div>
      <div style={styles.cardContent}>
        {snippet(note.content, 120)}
      </div>
      <div style={styles.categoryLabels}>
        {note.categories &&
          note.categories.map((cat, idx) => (
            <span
              key={cat}
              style={{
                ...styles.categoryLabel,
                background: getCategoryColor(cat, allCategories)
              }}
            >
              {cat}
            </span>
          ))}
      </div>
      <div style={styles.dateInfo}>
        {note.createdAt && new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

/* === NOTE EDITOR MODAL === */
/**
 * PUBLIC_INTERFACE
 * Modal for creating/editing notes.
 */
function NoteEditorModal({ note, onSave, onCancel, allCategories }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [categories, setCategories] = useState(note ? note.categories.slice() : []);

  const [newCategory, setNewCategory] = useState("");

  // Returns true if form can be saved
  const canSave = title.trim().length > 0 && content.trim().length > 0;

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (canSave) {
      onSave({
        ...note,
        title: title.trim(),
        content: content.trim(),
        categories: categories.filter((c) => c)
      });
    }
  }

  function handleAddCategory() {
    const cat = newCategory.trim();
    if (cat && !categories.includes(cat)) {
      setCategories((prev) => [...prev, cat]);
      setNewCategory("");
    }
  }

  function handleRemoveCategory(cat) {
    setCategories((prev) => prev.filter((c) => c !== cat));
  }

  return (
    <div style={styles.modalOverlay}>
      <form style={styles.modal} onSubmit={handleSubmit}>
        <div style={styles.modalHeader}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            {note ? "Edit Note" : "New Note"}
          </div>
          <button
            type="button"
            style={styles.iconBtn}
            title="Cancel"
            aria-label="Cancel"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <input
          autoFocus
          style={styles.input}
          placeholder="Title"
          value={title}
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          style={styles.textarea}
          rows={5}
          minLength={1}
          maxLength={1000}
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* CATEGORY PICKER */}
        <div style={styles.catPickerContainer}>
          {categories.map((cat) => (
            <span
              key={cat}
              style={{
                ...styles.categoryLabel,
                background: getCategoryColor(cat, allCategories)
              }}
            >
              {cat}
              <button
                style={styles.labelCloseBtn}
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                aria-label={`Remove ${cat}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add category"
            value={newCategory}
            style={{ ...styles.input, width: 120, marginRight: 7, marginBottom: 0 }}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory();
              }
            }}
          />
          <button
            type="button"
            style={{ ...styles.btn, padding: "5px 14px", marginBottom: 0 }}
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
          >
            Add
          </button>
        </div>

        <div style={styles.modalActions}>
          <button
            type="submit"
            style={{ ...styles.btn, ...styles.primaryBtn, marginRight: 12 }}
            disabled={!canSave}
          >
            Save
          </button>
          {note && (
            <button
              type="button"
              style={{ ...styles.btn, ...styles.dangerBtn }}
              onClick={() => onSave({ ...note, deleted: true })}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* === UTILS === */
function snippet(str, maxLen) {
  return str && str.length > maxLen
    ? str.slice(0, maxLen - 1) + "…"
    : str || "";
}
function getCategoryColor(cat, allCategories) {
  const idx = allCategories.findIndex((c) => c === cat);
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length] || COLORS.accent;
}

/* === PURE CSS-IN-JS STYLES === */
const styles = {
  root: {
    fontFamily: "'Inter',sans-serif",
    background: COLORS.background,
    minHeight: "100vh",
    paddingTop: 46,
    paddingBottom: 0,
    position: "relative"
  },
  searchBarContainer: {
    background: COLORS.secondary,
    padding: "22px 0 12px 0",
    boxShadow: "0 1px 0 " + COLORS.border,
    position: "sticky",
    top: 0,
    zIndex: 9
  },
  searchInput: {
    width: "96%",
    margin: "0 auto",
    display: "block",
    height: 44,
    border: "1px solid " + COLORS.border,
    borderRadius: 22,
    outline: "none",
    fontSize: 18,
    fontWeight: 400,
    padding: "0 18px",
    boxSizing: "border-box",
    background: COLORS.secondary,
    color: COLORS.text
  },
  categoryTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "10px 26px 4px 26px"
  },
  categoryTab: {
    fontSize: 13,
    color: "#fff",
    fontWeight: 500,
    borderRadius: 24,
    padding: "4px 16px",
    marginBottom: 2,
    background: COLORS.accent,
    cursor: "default"
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    padding: "24px",
    marginBottom: 30
  },
  card: {
    background: COLORS.card,
    boxShadow: "0 1px 6px 0 rgba(44, 71, 130,0.06)",
    border: "1px solid " + COLORS.border,
    borderRadius: 14,
    padding: 18,
    transition: "box-shadow .17s cubic-bezier(.4,0,.2,1)",
    display: "flex",
    flexDirection: "column",
    minHeight: 132,
    wordBreak: "break-word",
    position: "relative"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 17,
    color: COLORS.primary,
    lineHeight: "1.2"
  },
  cardContent: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 9,
    flex: "1 0 auto"
  },
  categoryLabels: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 12,
    borderRadius: 20,
    padding: "2px 10px",
    marginRight: 4,
    marginBottom: 3,
    background: COLORS.primary,
    display: "flex",
    alignItems: "center"
  },
  labelCloseBtn: {
    marginLeft: 7,
    background: "none",
    color: "#fff",
    border: "none",
    fontSize: "1em",
    cursor: "pointer",
    outline: "none",
    padding: 0,
    lineHeight: 1.1
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: 18,
    marginLeft: 7,
    padding: 3
  },
  dateInfo: {
    fontSize: 11,
    color: "#bbb",
    marginTop: 8,
    textAlign: "right"
  },
  emptyMsg: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: 400,
    textAlign: "center",
    marginTop: 80
  },
  fab: {
    position: "fixed",
    right: 32,
    bottom: 32,
    background: COLORS.primary,
    color: "#fff",
    borderRadius: "50%",
    width: 64,
    height: 64,
    fontSize: 38,
    border: "none",
    boxShadow: COLORS.fabShadow,
    cursor: "pointer",
    zIndex: 500,
    transition: "background 0.19s"
  },
  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(80,90,110,0.19)",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    background: "#fff",
    minWidth: 320,
    maxWidth: 460,
    width: "98vw",
    borderRadius: 13,
    boxShadow: "0 4px 16px rgba(74,144,226,.15)",
    padding: "28px 28px 16px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 15,
    position: "relative"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  input: {
    fontSize: 16,
    padding: "9px 12px",
    border: "1px solid #d4e0f7",
    borderRadius: 7,
    color: COLORS.text,
    background: "#fafcff",
    marginBottom: 10
  },
  textarea: {
    fontFamily: "inherit",
    fontSize: 15,
    borderRadius: 7,
    padding: "10px 12px",
    border: "1px solid #d4e0f7",
    minHeight: 84,
    resize: "vertical",
    color: COLORS.text,
    background: "#fafcff",
    marginBottom: 8
  },
  catPickerContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    margin: "6px 0 0 0"
  },
  btn: {
    background: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "8px 18px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: 7,
    marginTop: 4,
    transition: "background 0.18s"
  },
  primaryBtn: {
    background: COLORS.primary
  },
  dangerBtn: {
    background: "#D0021B"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6
  }
};

export default QuickNoteMainContainer;
