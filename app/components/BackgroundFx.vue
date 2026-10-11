<script setup lang="ts">
// Slow, soft animated backdrop (drifting blurred blobs + a panning dot grid). Purely decorative,
// GPU-friendly (transform only) and frozen for visitors who prefer reduced motion (see main.css).
</script>

<template>
  <div class="bg-fx" aria-hidden="true">
    <div class="bg-fx-grid animate-grid-pan" />
    <div class="bg-fx-blob animate-blob-a -left-[12vw] -top-[10vh] h-[42vw] min-h-72 w-[42vw] min-w-72 bg-accent-ring/35" />
    <div class="bg-fx-blob animate-blob-b -right-[10vw] top-[28vh] h-[38vw] min-h-64 w-[38vw] min-w-64 bg-accent/15" />
    <div class="bg-fx-blob animate-blob-c -bottom-[14vh] left-[20vw] h-[34vw] min-h-64 w-[34vw] min-w-64 bg-gold/20" />
  </div>
</template>
