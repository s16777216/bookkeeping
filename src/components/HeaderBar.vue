<script setup lang="ts">
import { computed } from "vue";

const formattedDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
  const weekday = weekdays[d.getDay()];
  return `${year}.${month}.${day} ${weekday}`;
});
</script>

<template>
  <header class="header-bar">
    <div class="header-left">
      <div class="brand-row">
        <img src="/icon.png" alt="Bookeeping Logo" class="brand-logo" />
        <span class="logo-text">BOOKEEPING</span>
      </div>
      <div class="date-text font-mono">{{ formattedDate }}</div>
    </div>
    <div class="header-right"></div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-logo {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm, 6px);
  object-fit: cover;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-primary);
}

.date-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-container);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  color: var(--accent-income);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-income);
  box-shadow: 0 0 6px rgba(45, 90, 39, 0.4);
}

.reset-btn {
  background: none;
  border: 1px solid var(--border-light);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

.reset-btn:active {
  transform: scale(0.96);
}
</style>
