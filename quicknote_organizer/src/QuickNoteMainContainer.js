import React, { useState, useRef } from "react";

/* === COLOR PALETTE & SKEUOMORPHIC DESIGN === */
const COLORS = {
  primary: "#4A90E2",
  secondary: "#FFFFFF",
  accent: "#F5A623",
  background: "#f5f0e6", // Off-white, faux paper
  text: "#232019",
  card: "#fffbe7",      // Cream notebook page
  border: "#E7DAB0",    // Faded tan, like real paper edges
  fabShadow: "0 6px 22px rgba(158,133,52,0.20)",
  paperLines: "#ede5bc" // Notebook page ruling
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
                background: getCategoryColor(cat, allCategories),
                boxShadow:
                  "0 2px 7px #e3c55e33, 0 1px 0 #fff9e4 inset",
                textShadow: "0 1px 0 #f6e4b8"
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
                background: "linear-gradient(180deg,#ffe993 60%,#e3c96a 100%)",
                border: "1.2px solid #dfc66a"
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
                background: "linear-gradient(180deg,#ffe993 60%,#e3c96a 100%)",
                border: "1.2px solid #dfc66a"
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

/* === PURE CSS-IN-JS SKEUOMORPHIC STYLES === */
const styles = {
  root: {
    fontFamily: "'Inter',serif",
    background: `repeating-linear-gradient(135deg, #f9f6ed 0 6px, #f5f0e6 8px 32px), url("data:image/svg+xml;utf8,<svg width='16' height='16' xmlns='http://www.w3.org/2000/svg'><rect fill='%23ede5bc' width='1' height='16'/></svg>")`,
    minHeight: "100vh",
    paddingTop: 46,
    paddingBottom: 0,
    position: "relative",
    boxShadow: "inset 0 8px 40px 0 #e9debe55"
  },
  searchBarContainer: {
    background: "rgba(250,247,233,0.9)",
    padding: "22px 0 12px 0",
    boxShadow: "0 2px 0 #e1dbc4",
    position: "sticky",
    top: 0,
    zIndex: 9,
    borderBottom: "2px solid #eedfa2"
  },
  searchInput: {
    width: "96%",
    margin: "0 auto",
    display: "block",
    height: 44,
    border: "1.5px solid #e7d9b0",
    borderRadius: 22,
    outline: "none",
    fontSize: 19,
    fontWeight: 400,
    padding: "0 18px",
    boxSizing: "border-box",
    background: "rgba(255,252,241,0.87)",
    color: "#6E5236",
    boxShadow: "0 1px 8px #e6dcc390"
  },
  categoryTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "10px 26px 4px 26px"
  },
  categoryTab: {
    fontSize: 13,
    color: "#fffefa",
    fontWeight: 500,
    borderRadius: 18,
    padding: "7px 19px 7px 19px",
    marginBottom: 2,
    background: "linear-gradient(180deg,#ffefad 70%,#e6c76c 100%)",
    boxShadow: "0 2px 7px #e3c55e33,0 1px 0 #fff9e4 inset",
    border: "1.5px solid #ecd078",
    cursor: "pointer",
    textShadow: "0 1px 0 #f6e4b8"
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(265px, 1fr))",
    gap: "26px",
    padding: "30px",
    marginBottom: 34
  },
  card: {
    background:
      `repeating-linear-gradient(to bottom, transparent, transparent 21px, ${COLORS.paperLines} 22px),` +
      `radial-gradient(ellipse 110% 85% at 50% 90%, #f6eac4 50%, #fffbe7 100%)`,
    boxShadow:
      "0 7px 28px rgba(207,194,124,0.19), 0 2px 0 #ece3bb inset, 0 0 0 3px #f3ecda",
    border: "2.5px solid #ebdcc3",
    borderRadius: 22,
    padding: "22px 19px 20px 24px",
    transition: "box-shadow .21s cubic-bezier(.4,0,.2,1)",
    display: "flex",
    flexDirection: "column",
    minHeight: 150,
    wordBreak: "break-word",
    position: "relative",
    boxSizing: "border-box",
    overflow: "hidden"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    borderBottom: "2px dashed #ede5bc",
    paddingBottom: 6
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: "#b09864",
    lineHeight: "1.1",
    textShadow: "0 1px 0 #fffad2"
  },
  cardContent: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 11,
    flex: "1 0 auto",
    fontFamily: "'Comic Sans MS', 'Inter', 'serif'",
    letterSpacing: "0.01em",
    background: "none"
  },
  categoryLabels: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 6
  },
  categoryLabel: {
    color: "#6E5236",
    fontSize: 12,
    borderRadius: 13,
    padding: "3.5px 12px 3.5px 10px",
    marginRight: 3,
    marginBottom: 3,
    background: "linear-gradient(180deg,#ffe993 60%,#e3c96a 100%)",
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    boxShadow: "0 1.5px 3px #e2c95b1a",
    border: "1.2px solid #dfc66a"
  },
  labelCloseBtn: {
    marginLeft: 8,
    background: "none",
    color: "#d4a12a",
    border: "none",
    fontSize: "1.05em",
    cursor: "pointer",
    outline: "none",
    padding: 0,
    lineHeight: 1.1,
    fontWeight: 400,
    textShadow: "0 1px 1px #fffab9"
  },
  iconBtn: {
    background: "linear-gradient(160deg,#fff 90%,#ecd29e 100%)",
    border: "1.2px solid #cab36e",
    color: "#d1b259",
    cursor: "pointer",
    fontSize: 18,
    marginLeft: 11,
    padding: 5,
    borderRadius: 8,
    boxShadow: "0 2px 2px #e3c55e22, 0 1px 0 #fff5db inset",
    opacity: 0.9,
    transition: "background 0.11s"
  },
  dateInfo: {
    fontSize: 11,
    color: "#bba665",
    marginTop: 11,
    textAlign: "right"
  },
  emptyMsg: {
    color: "#d5bd7e",
    fontSize: 19,
    fontWeight: 400,
    textAlign: "center",
    marginTop: 90,
    fontFamily: "'Brush Script MT',cursive"
  },
  fab: {
    position: "fixed",
    right: 34,
    bottom: 36,
    background:
      "linear-gradient(140deg, #fffbe7 74%, #ffeEC3 100%)," +
      "radial-gradient(ellipse 70% 56% at 64% 43%, #fae07b 0%, #ffdf63 81%)",
    color: "#b98f1e",
    borderRadius: "25% 35% 42% 25%/30% 60% 30% 60%",
    width: 74,
    height: 74,
    fontSize: 41,
    border: "2.5px solid #feefc1",
    boxShadow:
      "0 8px 36px #f3d87c5d, 0 2px 0 #fff9e4 inset, 0 9px 12px #dbc26630",
    cursor: "pointer",
    zIndex: 500,
    transition: "box-shadow 0.18s, transform 0.13s linear",
    fontFamily: "'Comic Sans MS', 'Arial', cursive",
    fontWeight: 700,
    outline: "none",
    filter: "drop-shadow(0 2px 8px #fff5cc8b)"
  },
  // Modal styles (notebook sheet appearance)
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(228,214,180,0.21)",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    background:
      "repeating-linear-gradient(to bottom, transparent, transparent 28px, #efe7c5 29px)",
    minWidth: 342,
    maxWidth: 480,
    width: "98vw",
    borderRadius: 20,
    boxShadow:
      "0 8px 24px 0 #fde6a4cc, 0 2px 0 #fff9e4 inset",
    padding: "34px 32px 16px 38px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    position: "relative",
    border: "2.3px solid #edd98c",
    fontFamily: "'Comic Sans MS', 'Inter', 'serif'",
    color: "#574b28"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
    paddingBottom: 7,
    borderBottom: "1.5px dashed #e6c76c"
  },
  input: {
    fontSize: 17,
    padding: "10px 13px",
    border: "1.6px solid #f1e4b8",
    borderRadius: 8,
    color: "#856d37",
    background: "#fffbe9",
    marginBottom: 12,
    boxShadow: "0 1px 8px #f9edcc73"
  },
  textarea: {
    fontFamily: "'Comic Sans MS', 'Inter', serif",
    fontSize: 15,
    borderRadius: 8,
    padding: "11px 14px",
    border: "1.7px solid #efdca7",
    minHeight: 92,
    resize: "vertical",
    color: "#746526",
    background: "#fffbe7",
    marginBottom: 10,
    boxShadow: "0 1px 8px #f7eaba93"
  },
  catPickerContainer: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    margin: "8px 0 0 0"
  },
  btn: {
    background: "linear-gradient(90deg, #eed18b 85%, #fdf6d4 100%)",
    color: "#644813",
    border: "1.2px solid #c9b46d",
    borderRadius: 8,
    padding: "8.5px 22px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 9,
    marginTop: 5,
    boxShadow: "0 2.5px 10px #e1c87e2a",
    transition: "background 0.14s, box-shadow 0.14s"
  },
  primaryBtn: {
    background: "linear-gradient(80deg,#fdeab3 70%,#f7ca42 100%)",
    color: "#9d8027"
  },
  dangerBtn: {
    background: "linear-gradient(90deg, #ffe9bc 70%,#e3b561 100%)",
    color: "#b32f0d",
    border: "1.2px solid #ea9392"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 11,
    marginTop: 6
  }
};

export default QuickNoteMainContainer;
