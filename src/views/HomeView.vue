<template>
  <transition name="fade">
  <div class="home">
    <h1>欢迎来到 Arithma Battle！</h1>
    <p>这里是心算竞技平台，快来挑战你的数学能力吧！</p>
    <p>准备好练习你的数学计算能力，或者与他人一决高下了吗？</p>
    <div class="actions">
      <router-link to="/practice" class="btn btn-dopamine">单人练习</router-link>
      <router-link to="/pk" class="btn btn-dopamine">在线比赛</router-link>
    </div>
  </div>
  </transition>
</template>


<script setup lang="ts">
// 这里可以添加首页的逻辑代码
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.home {
  text-align: center;
  padding: 2rem;
  position: relative;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.6rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem; /* 控制按钮之间的间距 */
}

.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem; /* 统一按钮大小 */
  font-size: 1rem;
  color: #fff;
  border-radius: 30px; /* 圆弧形 */
  text-decoration: none;
  transition: background-color 0.3s, transform 0.3s;
}

/* 多巴胺蓝色系按钮 */
.btn-dopamine {
  background: linear-gradient(90deg, #84b9ff, #32a8ff, #0faeff); /* 霓虹蓝色渐变 */
}

.btn-dopamine:hover {
  transform: scale(1.05); /* 按钮放大效果 */
  box-shadow: 0 10px 20px rgba(0, 123, 255, 0.4); /* 增加阴影效果 */
}


</style>
