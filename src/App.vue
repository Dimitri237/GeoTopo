<script setup>
import Sidebar from './components/SidebarPage.vue'
</script>

<template>
  <div class="layout">
    <Sidebar v-if="$route.path !== '/'" />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
