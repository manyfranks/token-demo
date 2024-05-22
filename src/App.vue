<!-- eslint-disable prettier/prettier -->
<template>
  <div id="app">
    <v-app>
      <Header />
      <v-main>
        <v-container fluid>
          <router-view />
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import Header from "./components/Header";

export default {
  name: "app",
  components: {
    Header
  }
};
</script>

<style scoped>
:root {
  --primary-color: #4caf50; /* Example primary color */
  --secondary-color: #ffc107; /* Example secondary color */
  --background-color: #ffffff; /* Default background color */
  --text-color: #333; /* Default text color */
  --font-family: "Nunito", sans-serif; /* Example font */
}

#app {
  font-family: var(--font-family);
  text-align: center;
  color: var(--text-color);
  background: #171920;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
	background-image: url('./assets/isobackgroundopacity25.png');
	background-position: top left;
	background-repeat: no-repeat;
	background-size: 15%;
}

@keyframes GradientFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

v-app, v-main, v-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
}
</style>
