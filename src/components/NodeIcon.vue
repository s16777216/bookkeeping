<script lang="ts">
import {
  Landmark,
  Wallet,
  CreditCard,
  Coins,
  Banknote,
  PiggyBank,
  Utensils,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Apple,
  Bus,
  Car,
  Train,
  Fuel,
  Plane,
  Home,
  Zap,
  Smartphone,
  HeartPulse,
  Gift,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Tag,
} from "lucide-vue-next";
import type { Component } from "vue";

export const ICON_MAP: Record<string, Component> = {
  landmark: Landmark,
  wallet: Wallet,
  "credit-card": CreditCard,
  coins: Coins,
  banknote: Banknote,
  "piggy-bank": PiggyBank,
  utensils: Utensils,
  coffee: Coffee,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  apple: Apple,
  bus: Bus,
  car: Car,
  train: Train,
  fuel: Fuel,
  plane: Plane,
  home: Home,
  zap: Zap,
  smartphone: Smartphone,
  "heart-pulse": HeartPulse,
  gift: Gift,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  "gamepad-2": Gamepad2,
  tag: Tag,
};

export const AVAILABLE_ICON_KEYS = Object.keys(ICON_MAP);
</script>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    name?: string;
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
  }>(),
  {
    name: "tag",
    size: 20,
    strokeWidth: 1.75,
    color: "currentColor",
  }
);

const resolvedComponent = computed<Component>(() => {
  const key = props.name?.trim().toLowerCase();
  if (key && ICON_MAP[key]) {
    return ICON_MAP[key];
  }
  // Silent fallback to Tag icon
  return Tag;
});
</script>

<template>
  <component
    :is="resolvedComponent"
    :size="size"
    :stroke-width="strokeWidth"
    :color="color"
    :style="color ? { color } : undefined"
    class="node-icon-svg"
  />
</template>

<style scoped>
.node-icon-svg {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
