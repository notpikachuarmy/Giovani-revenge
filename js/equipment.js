/* =========================================================================
   EQUIPMENT — comprar y equipar
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const MOD_NAMES = {
    critChance: v => `+${Math.round(v * 100)}% crítico`,
    dodgeWindow: v => `+${v.toFixed(2).replace('.', ',')} s esquiva`,
    trainGain: v => `+${Math.round(v * 100)}% entrenamiento`,
    maxEnergy: v => `+${v} energía máx.`,
    maxHp: v => `+${v} vida máx.`,
    allDmg: v => `+${Math.round(v * 100)}% daño`,
  };

  const Equipment = {
    get(id) { return GC.DATA.equipment.find(i => i.id === id); },
    bySlot(slot) { return GC.DATA.equipment.filter(i => i.slot === slot); },
    slot(id) { return GC.DATA.equipmentSlots.find(sl => sl.id === id); },
    visible(s, it) { return !it.unlockFlag || !!s.flags[it.unlockFlag] || s.owned.includes(it.id); },
    owns(s, id) { return s.owned.includes(id); },
    isEquipped(s, id) { const it = this.get(id); return !!it && s.equipped[it.slot] === id; },

    buy(s, id) {
      const it = this.get(id);
      if (!it) return { ok: false, reason: 'Objeto desconocido.' };
      if (this.owns(s, id)) return { ok: false, reason: 'Ya lo tienes.' };
      if (!this.visible(s, it)) return { ok: false, reason: 'No disponible.' };
      if (s.money < it.price) return { ok: false, reason: 'Ni Giovanni llega a tanto ahora mismo.' };
      s.money -= it.price;
      s.records.spent += it.price;
      s.owned.push(id);
      const autoEquip = !s.equipped[it.slot];
      if (autoEquip) s.equipped[it.slot] = id;
      GC.Player.clampVitals(s);
      return { ok: true, item: it, equipped: autoEquip };
    },

    equip(s, id) {
      const it = this.get(id);
      if (!it || !this.owns(s, id)) return { ok: false, reason: 'No lo tienes.' };
      s.equipped[it.slot] = id;
      GC.Player.clampVitals(s);
      return { ok: true, item: it };
    },

    unequip(s, slot) {
      delete s.equipped[slot];
      GC.Player.clampVitals(s);
      return { ok: true };
    },

    bonusText(it) {
      const parts = [];
      for (const k in it.bonus) {
        const v = it.bonus[k];
        if (GC.STAT_KEYS.includes(k)) parts.push(`${v > 0 ? '+' : ''}${v} ${GC.STAT_SHORT[k]}`);
        else if (MOD_NAMES[k]) parts.push(MOD_NAMES[k](v));
      }
      return parts.join(' · ');
    },
  };

  GC.Equipment = Equipment;
})();
