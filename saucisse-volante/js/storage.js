// ─────────────────────────────────────────────────────────────────────────────
// storage.js — Persistance des listes via localStorage + hook React
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useEffect } = React;

const PREFIX = "sv_";

// Petite couche d'abstraction au-dessus de localStorage
export const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? { value: v } : null;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { value };
    } catch (e) {
      return null;
    }
  },
  delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { deleted: true };
    } catch (e) {
      return null;
    }
  },
};

// Hook React qui gère les listes sauvegardées (chargement, ajout, suppression)
export function useSavedLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const res = storage.get("lists");
      if (res) setLists(JSON.parse(res.value));
    } catch (e) {
      /* ignore */
    }
    setLoading(false);
  }, []);

  function persist(updated) {
    setLists(updated);
    storage.set("lists", JSON.stringify(updated));
  }

  function saveList(name, soldiers) {
    const updated = [
      ...lists.filter((l) => l.name !== name),
      { name, soldiers, savedAt: new Date().toLocaleDateString("fr-FR") },
    ];
    persist(updated);
    return Promise.resolve();
  }

  function deleteList(name) {
    persist(lists.filter((l) => l.name !== name));
    return Promise.resolve();
  }

  return { lists, loading, saveList, deleteList };
}
