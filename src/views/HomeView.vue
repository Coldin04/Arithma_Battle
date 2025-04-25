<template>
  <div class="home">
    <h1>欢迎来到 ArithmaBattle！</h1>
    <p>这里是心算竞技平台，快来挑战你的数学能力吧！</p>
    <div class="actions">
      <router-link to="/practice" class="btn">单人练习</router-link>
      <router-link to="/pk" class="btn">在线PK</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加首页的逻辑代码
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #666;
}

.actions {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  margin: 0 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #fff;
  background-color: #42b983;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #3aa876;
}
</style>