<template>
  <footer class="footer">
    <div class="container">
      <p>
        Copyright © Tessy | Tessy est développé et hébergé avec passion ❤️ en Europe 🇪🇺 | 
        <a href="/sitemap">Plan de site</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 1rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.footer a {
  color: #007bff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>