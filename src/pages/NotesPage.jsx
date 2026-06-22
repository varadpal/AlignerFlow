import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './NotesPage.css';

const PRESET_TAGS = ['Pain', 'Lost Tray', 'Checkup', 'Milestone', 'General'];

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState('All');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'notes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleTagSelection = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'notes'), {
        text: newNoteText.trim(),
        tags: selectedTags,
        createdAt: serverTimestamp()
      });
      setNewNoteText('');
      setSelectedTags([]);
      setIsComposing(false);
    } catch (err) {
      console.error('Error adding note: ', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
    } catch (err) {
      console.error('Error deleting note: ', err);
    }
  };

  const filteredNotes = filterTag === 'All'
    ? notes
    : notes.filter(note => note.tags?.includes(filterTag));

  const allTagsUsed = ['All', ...new Set(notes.flatMap(n => n.tags || []))];

  return (
    <div className="notes-page animate-fade-in" id="notes-page">
      <Header />
      <div className="page">
        <div className="page-inner">
          <header className="notes-page__header">
            <h1 className="notes-page__title">Journal</h1>
            <p className="notes-page__subtitle">Document your smile journey</p>
          </header>

          {/* Filter Tags */}
          {notes.length > 0 && !isComposing && (
            <div className="notes-page__filters scroll-hide">
              {allTagsUsed.map(tag => (
                <button
                  key={tag}
                  className={`notes-page__filter-chip ${filterTag === tag ? 'active' : ''}`}
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Composer Section */}
          {isComposing ? (
            <div className="notes-composer glass-panel animate-fade-in-up">
              <textarea
                className="notes-composer__input"
                placeholder="What's on your mind? (e.g. Tray 8 feels tight today)"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                autoFocus
              />
              <div className="notes-composer__tags">
                <p className="text-caption">Select Tags:</p>
                <div className="notes-composer__tags-list">
                  {PRESET_TAGS.map(tag => (
                    <button
                      key={tag}
                      className={`notes-composer__tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTagSelection(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="notes-composer__actions">
                <button className="btn btn--secondary" onClick={() => setIsComposing(false)}>Cancel</button>
                <button className="btn btn--primary" onClick={handleSaveNote} disabled={!newNoteText.trim()}>Save Note</button>
              </div>
            </div>
          ) : (
            <div className="notes-page__fab-container">
              <button className="notes-page__fab" onClick={() => setIsComposing(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Write Entry
              </button>
            </div>
          )}

          {/* Notes List */}
          <div className="notes-list">
            {!isComposing && filteredNotes.length === 0 && (
              <div className="notes-list__empty">
                <div className="notes-list__empty-icon">📝</div>
                <p>No journal entries found.</p>
                <p className="text-caption">Tap 'Write Entry' to document your progress.</p>
              </div>
            )}

            {filteredNotes.map(note => (
              <div key={note.id} className="note-card animate-fade-in-up">
                <div className="note-card__header">
                  <span className="note-card__date">
                    {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                  </span>
                  <button className="note-card__delete" onClick={() => handleDeleteNote(note.id)} aria-label="Delete note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <p className="note-card__text">{note.text}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-card__tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="note-card__tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
