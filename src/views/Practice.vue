<template>
  <div class="practice-page">
    <header>
      <h1>单人练习</h1>
      <label for="difficulty">选择难度:</label>
      <select id="difficulty" v-model="selectedDifficulty">
        <option value="1">10以内加减法</option>
        <option value="2">10以内乘法</option>
        <option value="3">100以内加减法</option>
        <option value="4">乘法表除法</option>
      </select>
      <button @click="startGame">开始游戏</button>
    </header>
    <main v-if="isGameActive">
      <section class="question-section">
        <p>{{ currentQuestion.question }}</p>
        <input type="text" v-model="userAnswer" @keyup.enter="submitAnswer"
               :class="{'correct-answer': answerFeedback === 'correct',
                        'wrong-answer': answerFeedback === 'wrong'}" />
        <button @click="submitAnswer">提交答案</button>
      </section>
      <div class="feedback-container">
        <transition name="fade">
          <div v-if="answerFeedback === 'correct'" class="feedback correct">
            <span>✓ 回答正确!</span>
          </div>
        </transition>
        <transition name="fade">
          <div v-if="answerFeedback === 'wrong'" class="feedback wrong">
            <span>✗ 正确答案: {{ lastCorrectAnswer }}</span>
          </div>
        </transition>
      </div>
      <section class="timer-section">
        <p>剩余时间: {{ timeLeft }} 秒</p>
      </section>
      <section class="score-section">
        <p>得分: {{ score }}</p>
      </section>
    </main>
    <footer v-if="!isGameActive">
      <p>历史成绩:</p>
      <ul>
        <li v-for="(record, index) in historyRecords" :key="index">{{ record }}</li>
      </ul>
      <button @click="resetGame">重置历史记录</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { generateQuestion } from '@/utils/questionGenerator';

// 定义状态变量
const selectedDifficulty = ref('1'); // 初始难度
const isGameActive = ref(false);
const currentQuestion = ref<{ question: string, answer: number }>({ question: '', answer: 0 });
const userAnswer = ref('');
const timeLeft = ref(30); // 默认时间 30 秒
const score = ref(0);
const historyRecords = ref<string[]>([]);
const questionsGenerated = ref<number>(0); // 生成的题目数量
const answerFeedback = ref('none'); // 答题反馈: 'none', 'correct', 'wrong'
const lastCorrectAnswer = ref(''); // 存储上一题的正确答案

// 开始游戏
function startGame() {
  isGameActive.value = true;
  timeLeft.value = 30; // 重置时间
  score.value = 0;
  generateNewQuestion();
  startTimer();
}

// 生成新题目
function generateNewQuestion() {
  try {
    currentQuestion.value = generateQuestion(parseInt(selectedDifficulty.value));
  } catch (error) {
    console.error(error);
  }
}

// 提交答案
function submitAnswer() {
  const isCorrect = currentQuestion.value.answer.toString() === userAnswer.value;
  lastCorrectAnswer.value = currentQuestion.value.answer.toString();

  if (isCorrect) {
    score.value += 1;
    answerFeedback.value = 'correct';
  } else {
    answerFeedback.value = 'wrong';
  }

  questionsGenerated.value++;
  generateNewQuestion();
  userAnswer.value = '';

  // 设置短暂的反馈后恢复
  setTimeout(() => {
    answerFeedback.value = 'none';
  }, 1500);
}

// 启动计时器
function startTimer() {
  const intervalId = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(intervalId);
      endGame();
    }
  }, 1000);
}

// 游戏结束
function endGame() {
  isGameActive.value = false;
  historyRecords.value.push(`得分: ${score.value}, 生成题目数: ${questionsGenerated.value}`);
  saveHistoryToLocalStorage();
}

// 保存历史记录到 localStorage
function saveHistoryToLocalStorage() {
  const records = JSON.parse(localStorage.getItem('history') || '[]');
  records.push(`得分: ${score.value}, 生成题目数: ${questionsGenerated.value}`);
  localStorage.setItem('history', JSON.stringify(records));
}

// 重置历史记录
function resetGame() {
  historyRecords.value = [];
  localStorage.removeItem('history');
  questionsGenerated.value = 0;
}

// 初始化历史记录
onMounted(() => {
  historyRecords.value = JSON.parse(localStorage.getItem('history') || '[]');
});

// 清理定时器
onUnmounted(() => {
  timeLeft.value = 0;
});
</script>

<style scoped>
.practice-page {
  background: linear-gradient(135deg, #f7f9fc, #e2e7ed);
  max-width: 800px;
  margin: 2rem auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  padding: 2rem;
}

.practice-page h1 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

header label {
  margin-left: 1rem;
  font-weight: bold;
  color: #555;
}

header select {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 20px;
  border: 2px solid #ddd;
  background-color: #f8f9fa;
  color: #555;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

header select:focus {
  border-color: #007ACC;
  box-shadow: 0 0 0 2px rgba(0,122,204,0.2);
}

button {
  background: linear-gradient(90deg, #84b9ff, #32a8ff, #0faeff);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 0.5rem;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
  background: linear-gradient(90deg, #84b9ff, #32a8ff, #0faeff);
}

header button {
  margin-top: 1.5rem;
  padding: 0.7rem 1.8rem;
}

.question-section p {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 1.5rem 0;
  color: #333;
}

.question-section input {
  margin: 1rem 0;
  padding: 0.8rem;
  font-size: 1.1rem;
  border-radius: 20px;
  border: 2px solid #ddd;
  width: 200px;
  text-align: center;
  outline: none;
  transition: all 0.3s ease;
}

.question-section input:focus {
  border-color: #007ACC;
  box-shadow: 0 0 0 2px rgba(0,122,204,0.2);
}

.timer-section p {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e74c3c;
}

.score-section p {
  font-size: 1.4rem;
  font-weight: bold;
  color: #42b883;
}

footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ddd;
}

footer p {
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 1rem;
}

footer ul {
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
  max-height: 300px;
  overflow-y: auto;
  /* 移除背景色和内边距，使其更扁平 */
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

footer li {
  margin: 0;
  padding: 0.8rem 1rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  border-left: 3px solid #32a8ff;
}

footer li:hover {
  background-color: white;
  transform: translateX(2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

footer button {
  background: linear-gradient(90deg, #ff7675, #d63031);
  margin-top: 1.5rem;
  padding: 0.6rem 1.4rem;
}

footer button:hover {
  background: linear-gradient(90deg, #ff6b6b, #c0392b);
}

/* 答题反馈动画 */
.feedback-container {
  height: 30px;
  margin: 10px 0;
  position: relative;
}

.feedback {
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feedback.correct {
  background-color: rgba(66, 184, 131, 0.2);
  color: #2a8c5f;
  border: 1px solid #42b883;
}

.feedback.wrong {
  background-color: rgba(231, 76, 60, 0.2);
  color: #c0392b;
  border: 1px solid #e74c3c;
}

/* 输入框的反馈效果 */
.correct-answer {
  animation: pulse-green 0.5s;
  border-color: #42b883 !important;
}

.wrong-answer {
  animation: pulse-red 0.5s;
  border-color: #e74c3c !important;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) translateX(-50%);
}

/* 脉动动画效果 */
@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(66, 184, 131, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0); }
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
}
</style>
