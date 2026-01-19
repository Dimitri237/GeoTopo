<template>
  <div class="splash">
    <div class="container">
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="text">loading</div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    // Cacher le splash screen après une durée spécifique
    setTimeout(() => {
      this.$router.push('/auth');
    }, 10000); // Durée en millisecondes (10 secondes dans cet exemple)
  },
};
</script>
<style scoped>
.splash {
  background-color: #06283D !important;
  height: 100vh;
  margin: 0;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-top: 300px;
}

.text {
  color: white;
  font-family: sans-serif;
}

.ring {
  position: absolute;
  width: 190px;
  height: 190px;
  border: 1px solid transparent;
  border-radius: 50%;
  --color: #ff8df9;
  border-bottom: 8px solid var(--color);
  animation: rotate1 2s linear infinite;
}

@keyframes rotate1 {
  from {
    transform: rotateX(50deg) rotateZ(110deg);
  }

  to {
    transform: rotateX(50deg) rotateZ(470deg);
  }
}

.ring:nth-child(2) {
  --color: #ff8d8d;
  animation-name: rotate2;
}

@keyframes rotate2 {
  from {
    transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg);
  }

  to {
    transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg);
  }
}

.ring:nth-child(3) {
  --color: #8dc8ff;
  animation-name: rotate3;
}

@keyframes rotate3 {
  from {
    transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg);
  }

  to {
    transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg);
  }
}

.ring:nth-child(4) {
  --color: #1bd84a;
  animation-name: rotate4;
}

@keyframes rotate4 {
  from {
    transform: rotateX(70deg) rotateZ(270deg);
  }

  to {
    transform: rotateX(70deg) rotateZ(630deg);
  }
}
</style>