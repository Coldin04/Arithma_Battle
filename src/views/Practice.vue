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

<style scoped src="../assets/practice.css"></style>
