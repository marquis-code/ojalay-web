<script setup lang="ts">
import { BarChart3, Boxes, CalendarDays, CircleHelp, Gift, Globe2, House, LayoutGrid, Package, Plus, ReceiptText, Scissors, Settings, ShoppingBag, Star, Ticket, UserRoundCog, Users, WalletCards, X } from 'lucide-vue-next';
const route = useRoute();
const businessStore = useBusinessStore();
const moreOpen = ref(false);
type Mode = 'products' | 'services' | 'hybrid';
const mode = computed<Mode>(() => businessStore.business?.businessMode || 'products');
interface NavItem { to: string; label: string; icon: typeof House; exact?: boolean; modes?: Mode[] }
const links: NavItem[] = [
  { to: '/app', label: 'Home', icon: House, exact: true },
  { to: '/app/bookings', label: 'Calendar', icon: CalendarDays, modes: ['services', 'hybrid'] },
  { to: '/app/orders', label: 'Orders', icon: ShoppingBag, modes: ['products', 'hybrid'] },
  { to: '/app/stock', label: 'Stock', icon: Boxes, modes: ['products', 'hybrid'] },
];
const more: NavItem[] = [
  { to: '/app/services', label: 'Services', icon: Scissors, modes: ['services', 'hybrid'] },
  { to: '/app/packages', label: 'Packages', icon: Ticket, modes: ['services', 'hybrid'] },
  { to: '/app/products', label: 'Products', icon: Package, modes: ['products', 'hybrid'] },
  { to: '/app/team', label: 'Team', icon: UserRoundCog, modes: ['services', 'hybrid'] },
  { to: '/app/sales', label: 'Sales', icon: ReceiptText },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/debts', label: 'Debts', icon: WalletCards },
  { to: '/app/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/reviews', label: 'Reviews', icon: Star, modes: ['services', 'hybrid'] },
  { to: '/app/website', label: 'My website', icon: Globe2 },
  { to: '/app/affiliates', label: 'Refer & earn', icon: Gift },
  { to: '/app/help', label: 'Help center', icon: CircleHelp },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];
const visible = (link: NavItem) => !link.modes || link.modes.includes(mode.value);
const primaryTo = computed(() => mode.value === 'services' ? '/app/bookings/new' : '/app/sales/new');
const primaryLabel = computed(() => mode.value === 'services' ? 'Book' : 'Sell');
const navLinks = computed(() => links.filter(visible));
const moreLinks = computed(() => more.filter(visible));
const columns = computed(() => navLinks.value.length + 2 >= 6 ? 'grid-cols-6' : navLinks.value.length + 2 === 5 ? 'grid-cols-5' : 'grid-cols-4');
const isActive = (to: string, exact = false) => exact ? route.path === to : route.path.startsWith(to);
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden safe-bottom" aria-label="App navigation">
    <div class="grid items-center px-2 pb-1 pt-2" :class="columns">
      <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold" :class="isActive(link.to, link.exact) ? 'text-brand-500' : 'text-muted'">
        <component :is="link.icon" class="h-5 w-5" :stroke-width="isActive(link.to, link.exact) ? 2.5 : 2" />{{ link.label }}
      </NuxtLink>
      <NuxtLink :to="primaryTo" class="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold" :class="isActive(primaryTo) ? 'text-brand-500' : 'text-muted'">
        <Plus class="h-5 w-5" :stroke-width="isActive(primaryTo) ? 2.5 : 2" /> {{ primaryLabel }}
      </NuxtLink>
      <button type="button" class="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold" :class="moreOpen ? 'text-brand-500' : 'text-muted'" @click="moreOpen = true">
        <LayoutGrid class="h-5 w-5" /> More
      </button>
    </div>
  </nav>

  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="moreOpen" class="fixed inset-0 z-[70] bg-forest-900/50 backdrop-blur-sm lg:hidden" @click="moreOpen = false">
        <div class="absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-line bg-surface p-5 pb-10" @click.stop>
          <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-display text-xl font-bold">More in Ojaly</h2>
            <button class="flex h-9 w-9 items-center justify-center rounded-full bg-raised" aria-label="Close" @click="moreOpen = false"><X class="h-4 w-4" /></button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <NuxtLink v-for="link in moreLinks" :key="link.to" :to="link.to" class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-raised/50 p-3.5 text-sm font-semibold" @click="moreOpen = false">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-surface"><component :is="link.icon" class="h-4 w-4" /></span>
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease; }
.sheet-leave-active > div, .sheet-enter-active > div { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from > div, .sheet-leave-to > div { transform: translateY(100%); }
</style>
