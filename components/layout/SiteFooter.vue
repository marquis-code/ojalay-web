<script setup lang="ts">
import { Instagram, MessageCircle } from 'lucide-vue-next';
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line bg-forest-900 text-[#E8EFE9]">
    <div class="shell py-14">
      <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <LogoMark dark />
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#A8C0B4]">The trusted booking and payment layer for local service businesses. Lagos first — campus and community.</p>
          <div class="mt-5 flex flex-wrap gap-2"><a href="https://wa.me/2348052854256" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"><MessageCircle class="h-4 w-4" /> Chat on WhatsApp</a><a href="https://www.instagram.com/ojalyhq?vrfl=MTMwcHN5ajBicTdseQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Ojaly on Instagram" class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-[#E8EFE9] hover:bg-white/10"><Instagram class="h-4 w-4" /> Instagram</a></div>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">Product</p>
          <a href="#features" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Features</a>
          <a href="#templates" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Storefronts</a>
          <a href="#pricing" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Pricing</a>
          <NuxtLink to="/register" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Start free</NuxtLink>
          <NuxtLink to="/marketplace" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Marketplace · Lagos</NuxtLink>
          <NuxtLink to="/booking" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Track a booking</NuxtLink>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">Company</p>
          <a href="#faq" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">FAQ</a>
          <NuxtLink to="/login" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Sign in</NuxtLink>
          <a href="mailto:hello@ojaly.org" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">hello@ojaly.org</a>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">For businesses</p>
          <p class="text-sm leading-relaxed text-[#C7D8CE]">Free to start.<br>No card needed.<br>Built for Nigerian data.</p>
        </div>
      </div>
      <div class="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#7C9989] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>© 2026 Erranders Company Limited. All rights reserved.</p>
          <p class="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-[#A8C0B4]">Ojaly is a product of Erranders Company Limited.</p>
        </div>
        <p>Naira first. WhatsApp native. Trusted local providers.</p>
      </div>
    </div>
  </footer>
</template>
