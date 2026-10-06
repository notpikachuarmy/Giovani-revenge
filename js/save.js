/* =========================================================================
   SAVE — guardado automático en localStorage
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

  /** Rellena claves que falten (útil si una versión nueva añade campos). */
  function mergeDefaults(base, data) {
    for (const k in base) {
      if (data[k] === undefined) data[k] = base[k];
      else if (isObj(base[k]) && isObj(data[k]) && k !== 'skills' && k !== 'equipped' && k !== 'flags') {
        mergeDefaults(base[k], data[k]);
      }
    }
    return data;
  }

  GC.Save = {
    KEY: 'giovanni_vs_chansey_save_v1',

    exists() {
      try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; }
    },
    save(s) {
      try { localStorage.setItem(this.KEY, JSON.stringify(s)); return true; }
      catch (e) { console.warn('No se pudo guardar:', e); return false; }
    },
    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return null;
        return mergeDefaults(GC.State.createNew(), JSON.parse(raw));
      } catch (e) {
        console.warn('Partida corrupta:', e);
        return null;
      }
    },
    clear() {
      try { localStorage.removeItem(this.KEY); } catch (e) { /* nada */ }
    },
  };
})();
