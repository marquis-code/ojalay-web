<script setup lang="ts">
import { ArrowRight, BadgeCheck, CalendarCheck, Check, ChevronLeft, ChevronRight, Receipt, Star } from 'lucide-vue-next';

const auth = useAuthStore();
const cards = [
  { image: '/images/business/barber.webp', alt: 'A Nigerian barber at work', business: 'Kola Cuts', area: 'Yaba · Lagos', category: 'Barbering', service: 'Fresh fade', price: '₦4,000', rating: '4.9', position: 'center 32%' },
  { image: '/images/business/baker.webp', alt: 'A Nigerian baker packing food', business: 'Mama T Kitchen', area: 'Surulere · Lagos', category: 'Food', service: 'Small chops tray', price: '₦18,000', rating: '4.8', position: 'center 40%' },
  { image: '/images/business/website-founder.webp', alt: 'A Nigerian designer working on a laptop', business: 'Studio 23', area: 'Lagos', category: 'Design', service: 'Brand identity', price: '₦85,000', rating: '5.0', position: 'center 35%' },
  { image: '/images/business/market-trader.webp', alt: 'A Nigerian trader at a market stall', business: 'Tola Thrift', area: 'Lagos', category: 'Thrift', service: 'Weekend drop', price: '₦12,000', rating: '4.7', position: 'center 42%' },
];
const active = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
const paused = ref(false);
const current = computed(() => cards[active.value]);
function go(index: number) { active.value = (index + cards.length) % cards.length; }
function next() { go(active.value + 1); }
function previous() { go(active.value - 1); }
onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  timer = setInterval(() => { if (!paused.value) next(); }, 4600);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<template>
  <section class="relative overflow-hidden border-b border-line bg-canvas">
    <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
    <div class="shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600"><span class="h-1.5 w-1.5 rounded-full bg-brand-500" /> Lagos · local service businesses</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1.5 text-[10px] font-bold text-accent"><BadgeCheck class="h-3 w-3" /> Verified providers</span>
        </div>
        <h1 class="mt-6 max-w-3xl font-display text-[clamp(2.9rem,7vw,5.8rem)] font-bold leading-[0.91] tracking-[-0.06em] text-ink">The trusted way to book local services.</h1>
        <p class="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">Discover verified hair, food, nails, printing, laundry, design and repair businesses across Lagos — book a real time and pay securely. No DMs. No transfer screenshots. No guessing.</p>
        <div class="mt-7 flex flex-col gap-2 sm:flex-row">
          <BaseButton to="/marketplace" size="lg">Browse the marketplace <ArrowRight class="h-4 w-4" /></BaseButton>
          <BaseButton :to="auth.isAuthenticated ? '/app' : '/register'" variant="secondary" size="lg">{{ auth.isAuthenticated ? 'Open dashboard' : 'List your service free' }}</BaseButton>
        </div>
        <div class="mt-6 grid max-w-xl grid-cols-2 gap-2 text-[11px] font-semibold text-muted sm:grid-cols-4">
          <span class="inline-flex items-start gap-1.5"><Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Verified providers</span>
          <span class="inline-flex items-start gap-1.5"><Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Real availability</span>
          <span class="inline-flex items-start gap-1.5"><Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Paystack deposits</span>
          <span class="inline-flex items-start gap-1.5"><Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Reviews after every visit</span>
        </div>
        <div class="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-white p-2.5 text-forest-900 shadow-sm">
          <div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-raised"><Transition name="hero-thumb" mode="out-in"><img :key="current.image" :src="current.image" :alt="current.alt" class="h-full w-full object-cover" :style="{ objectPosition: current.position }"></Transition></div>
          <div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-600">Now on Ojaly</p><Transition name="hero-text" mode="out-in"><div :key="current.business"><p class="truncate text-xs font-bold">{{ current.business }} · {{ current.category }}</p><p class="truncate text-[10px] text-forest-900/60">{{ current.service }} · {{ current.price }} · {{ current.area }}</p></div></Transition></div>
          <div class="flex items-center gap-1"><button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted hover:bg-raised" aria-label="Previous featured business" @click="previous"><ChevronLeft class="h-3.5 w-3.5" /></button><button type="button" class="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted hover:bg-raised" aria-label="Next featured business" @click="next"><ChevronRight class="h-3.5 w-3.5" /></button></div>
        </div>
        <p class="mt-4 max-w-xl text-[11px] leading-relaxed text-muted">Ojaly is for trusted local service businesses — campus or not. Every booking becomes a customer, deposit, receipt and review.</p>
      </div>

      <div class="relative mx-auto w-full max-w-md [perspective:1200px] lg:max-w-none" @mouseenter="paused = true" @mouseleave="paused = false">
        <div class="absolute -inset-2 rotate-2 rounded-[2.2rem] border-2 border-ink bg-accent" />
        <div class="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-ink bg-surface shadow-[8px_8px_0_0_#06231A]">
          <div v-for="(card, index) in cards" :key="card.image" class="hero-card absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [backface-visibility:hidden]" :class="{ 'hero-card-active': index === active }" :style="{ opacity: index === active ? 1 : index === (active + 1) % cards.length ? 0.45 : 0, transform: index === active ? 'rotateY(0deg) scale(1)' : index === (active + 1) % cards.length ? 'rotateY(10deg) scale(.96) translateX(18px)' : 'rotateY(-18deg) scale(.9) translateX(-22px)', zIndex: index === active ? 3 : index === (active + 1) % cards.length ? 2 : 1 }">
            <img :src="card.image" :alt="card.alt" class="h-full w-full object-cover" :style="{ objectPosition: card.position }">
            <div class="absolute inset-0 bg-gradient-to-t from-forest-900/65 via-transparent to-transparent" />
            <div class="absolute left-3 top-3 flex gap-1.5"><span class="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-forest-900"><BadgeCheck class="h-3 w-3 text-success" /> Verified</span><span class="inline-flex items-center gap-1 rounded-full bg-forest-900/70 px-2.5 py-1 text-[9px] font-bold text-white"><Star class="h-3 w-3 fill-accent text-accent" /> {{ card.rating }}</span></div>
            <div class="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 text-forest-900 shadow-lg backdrop-blur">
              <div class="flex items-center justify-between gap-2"><div class="min-w-0"><p class="truncate text-xs font-bold text-forest-900">{{ card.business }}</p><p class="truncate text-[9px] text-forest-900/60">{{ card.category }} · {{ card.area }}</p></div><p class="shrink-0 text-[10px] font-bold text-brand-600">{{ card.price }}</p></div>
              <div class="mt-2 flex items-center gap-1.5 rounded-lg bg-forest-900/5 px-2 py-1.5 text-[9px] font-semibold text-forest-900/60"><CalendarCheck class="h-3 w-3 text-success" /> {{ card.service }} · real slot</div>
              <div class="mt-1.5 flex items-center gap-1.5 rounded-lg bg-forest-900 px-2 py-1.5 text-[9px] font-semibold text-white"><Receipt class="h-3 w-3 text-accent" /> Receipt + record created</div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full border border-line bg-surface px-2 py-1.5 shadow-sm"><button v-for="(card, index) in cards" :key="card.business" type="button" class="h-1.5 rounded-full transition-all" :class="index === active ? 'w-5 bg-brand-500' : 'w-1.5 bg-line'" :aria-label="`Show ${card.business}`" @click="go(index)" /></div>
      </div>
    </div>
    <div class="border-t border-line bg-forest-900 py-2.5 text-white"><div class="flex w-max gap-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"><span v-for="i in 2" :key="i" class="flex gap-8"><span>Verified local providers</span><span>·</span><span>Book &amp; pay in one flow</span><span>·</span><span>Deposits</span><span>·</span><span>Receipts</span><span>·</span><span>Reviews</span><span>·</span><span>Rebook</span><span>·</span><span>Lagos</span><span>·</span></span></div></div>
  </section>
</template>

<style scoped>
.hero-card { transform-origin: center center; }
.hero-card-active { animation: hero-flip .72s cubic-bezier(.2,.8,.2,1); }
@keyframes hero-flip { 0% { transform: rotateY(-72deg) scale(.94); opacity: .15; } 65% { transform: rotateY(7deg) scale(1.015); opacity: 1; } 100% { transform: rotateY(0deg) scale(1); opacity: 1; } }
.hero-thumb-enter-active, .hero-thumb-leave-active, .hero-text-enter-active, .hero-text-leave-active { transition: opacity .35s ease, transform .35s ease; }
.hero-thumb-enter-from, .hero-thumb-leave-to, .hero-text-enter-from, .hero-text-leave-to { opacity: 0; transform: translateY(4px); }
</style>
