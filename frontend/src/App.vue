<template>
  <section>
    <RouterView />
  </section>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { RouterView, RouterLink } from "vue-router";
</script>
