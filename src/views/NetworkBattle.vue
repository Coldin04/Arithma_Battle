<template>
  <div class="network-battle-page">
    <header>
      <h1>局域网对战</h1>
      <div v-if="!isConnected && !isGameActive" class="connection-section">
        <div class="connection-type">
          <button @click="mode = 'host'" :class="{ active: mode === 'host' }">创建房间</button>
          <button @click="mode = 'join'" :class="{ active: mode === 'join' }">加入房间</button>
        </div>

        <div v-if="mode === 'host'" class="host-section">
          <div v-if="localPeerId" class="local-info">
            <p>你的房间ID: <span class="peer-id">{{ localPeerId }}</span></p>
            <button @click="copyToClipboard(localPeerId)" class="copy-button">复制房间ID</button>
          </div>
          <p v-if="connectionStatus">{{ connectionStatus }}</p>
        </div>

        <div v-if="mode === 'join'" class="join-section">
          <div class="input-group">
            <label for="remotePeerId">输入房间ID:</label>
            <input id="remotePeerId" v-model="remotePeerId" placeholder="输入对方的房间ID" />
          </div>
          <button @click="connectToPeer" :disabled="!remotePeerId">连接</button>
          <p v-if="connectionStatus">{{ connectionStatus }}</p>
        </div>
      </div>

      <div v-if="isConnected && !isGameActive" class="game-settings">
        <label for="difficulty">选择难度:</label>
        <select id="difficulty" v-model="selectedDifficulty">
          <option value="1">10以内加减法</option>
          <option value="2">10以内乘法</option>
          <option value="3">100以内加减法</option>
          <option value="4">乘法表除法</option>
        </select>
        <button @click="startGame">开始游戏</button>
      </div>
    </header>

    <main v-if="isGameActive">
      <div class="players-info">
        <div class="player local" :class="{ 'player-turn': localPlayerTurn }">
          <h3>我方</h3>
          <p class="score">得分: {{ localScore }}</p>
        </div>
        <div class="player remote" :class="{ 'player-turn': !localPlayerTurn }">
          <h3>对方</h3>
          <p class="score">得分: {{ remoteScore }}</p>
        </div>
      </div>

      <section class="question-section">
        <p>{{ currentQuestion.question }}</p>
        <input type="text" v-model="userAnswer" @keyup.enter="submitAnswer"
               :class="{'correct-answer': answerFeedback === 'correct',
                        'wrong-answer': answerFeedback === 'wrong'}"
               :disabled="!isGameActive || !localPlayerTurn" />
        <button @click="submitAnswer" :disabled="!isGameActive || !localPlayerTurn">提交答案</button>
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

      <div class="game-messages">
        <div v-if="gameMessage" class="game-message" :class="gameMessageType">
          {{ gameMessage }}
        </div>
      </div>
    </main>

    <div v-if="gameEnded" class="game-result-overlay">
      <div class="game-result">
        <h2>游戏结束</h2>
        <div class="final-scores">
          <p>我方得分: {{ localScore }}</p>
          <p>对方得分: {{ remoteScore }}</p>
        </div>
        <h3 class="result-message" :class="{ 'win': localScore > remoteScore, 'lose': localScore < remoteScore, 'draw': localScore === remoteScore }">
          {{ resultMessage }}
        </h3>
        <button @click="resetGame">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { generateQuestion } from '@/utils/questionGenerator';
import Peer, { DataConnection } from 'peerjs';

// WebRTC连接相关
const mode = ref<'host' | 'join'>('host');
const peer = ref<Peer | null>(null);
const connection = ref<DataConnection | null>(null);
const localPeerId = ref<string>('');
const remotePeerId = ref<string>('');
const isConnected = ref<boolean>(false);
const connectionStatus = ref<string>('');

// 游戏状态
const isGameActive = ref<boolean>(false);
const gameEnded = ref<boolean>(false);
const selectedDifficulty = ref<string>('1');
const currentQuestion = ref<{ question: string, answer: number }>({ question: '', answer: 0 });
const userAnswer = ref<string>('');
const timeLeft = ref<number>(30);
const localScore = ref<number>(0);
const remoteScore = ref<number>(0);
const localPlayerTurn = ref<boolean>(true);
const answerFeedback = ref<'none' | 'correct' | 'wrong'>('none');
const lastCorrectAnswer = ref<string>('');
const timerInterval = ref<number | null>(null);
const gameMessage = ref<string>('');
const gameMessageType = ref<string>('');

// 生成结果信息
const resultMessage = computed(() => {
  if (localScore.value > remoteScore.value) {
    return '你赢了!';
  } else if (localScore.value < remoteScore.value) {
    return '你输了!';
  } else {
    return '平局!';
  }
});

// 初始化PeerJS
onMounted(() => {
  initPeer();
});

// 清理工作
onUnmounted(() => {
  if (connection.value) {
    connection.value.close();
  }
  if (peer.value) {
    peer.value.destroy();
  }
  clearTimerInterval();
});

// 实现复制到剪贴板功能
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      showGameMessage('已复制到剪贴板', 'success');
    })
    .catch(err => {
      console.error('复制失败:', err);
      showGameMessage('复制失败，请手动复制', 'error');
    });
}

// 初始化PeerJS
function initPeer() {
  peer.value = new Peer({
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });

  peer.value.on('open', (id) => {
    localPeerId.value = id;
    connectionStatus.value = '准备就绪，等待连接...';
  });

  peer.value.on('connection', (conn) => {
    handleConnection(conn);
  });

  peer.value.on('error', (err) => {
    console.error('PeerJS错误:', err);
    connectionStatus.value = `连接错误: ${err}`;
    showGameMessage('连接错误，请重试', 'error');
  });
}

// 连接到对方
function connectToPeer() {
  if (!peer.value || !remotePeerId.value) return;

  connectionStatus.value = '正在连接...';

  try {
    const conn = peer.value.connect(remotePeerId.value, {
      reliable: true
    });

    handleConnection(conn);
  } catch (error) {
    console.error('连接失败:', error);
    connectionStatus.value = '连接失败，请重试';
  }
}

// 处理连接
function handleConnection(conn: DataConnection) {
  connection.value = conn;

  conn.on('open', () => {
    isConnected.value = true;
    connectionStatus.value = '连接成功!';
    showGameMessage('连接成功!', 'success');

    // 如果是加入方，等待主机发送游戏设置
    if (mode.value === 'join') {
      localPlayerTurn.value = false;
    }
  });

  conn.on('data', (data: any) => {
    handleReceivedData(data);
  });

  conn.on('close', () => {
    isConnected.value = false;
    connectionStatus.value = '连接已关闭';
    if (isGameActive.value) {
      showGameMessage('对方已断开连接', 'error');
      endGame();
    }
  });

  conn.on('error', (err) => {
    console.error('连接错误:', err);
    connectionStatus.value = `连接错误: ${err}`;
    showGameMessage('连接错误', 'error');
  });
}

// 开始游戏
function startGame() {
  if (!isConnected.value || !connection.value) return;

  // 发送游戏设置给对方
  connection.value.send({
    type: 'game-settings',
    difficulty: selectedDifficulty.value
  });

  // 开始倒计时
  timeLeft.value = 30;
  localScore.value = 0;
  remoteScore.value = 0;
  isGameActive.value = true;
  gameEnded.value = false;
  localPlayerTurn.value = mode.value === 'host'; // 主机先手

  // 生成第一题
  generateNewQuestion();

  // 启动计时器
  startTimer();

  // 通知对方游戏已开始
  connection.value.send({
    type: 'game-started'
  });
}

// 生成新题目
function generateNewQuestion() {
  try {
    currentQuestion.value = generateQuestion(parseInt(selectedDifficulty.value));

    // 如果自己是当前回合玩家，发送题目给对方
    if (localPlayerTurn.value && connection.value) {
      connection.value.send({
        type: 'new-question',
        question: currentQuestion.value.question,
        answer: currentQuestion.value.answer
      });
    }
  } catch (error) {
    console.error(error);
    showGameMessage('生成题目出错', 'error');
  }
}

// 提交答案
function submitAnswer() {
  if (!isGameActive.value || !localPlayerTurn.value) return;

  const isCorrect = currentQuestion.value.answer.toString() === userAnswer.value;
  lastCorrectAnswer.value = currentQuestion.value.answer.toString();

  if (isCorrect) {
    localScore.value += 1;
    answerFeedback.value = 'correct';
  } else {
    answerFeedback.value = 'wrong';
  }

  // 发送答题结果给对方
  if (connection.value) {
    connection.value.send({
      type: 'answer-result',
      isCorrect,
      score: localScore.value
    });
  }

  // 交换回合
  localPlayerTurn.value = false;

  // 生成新题目给对方
  generateNewQuestion();
  userAnswer.value = '';

  // 设置短暂的反馈后恢复
  setTimeout(() => {
    answerFeedback.value = 'none';
  }, 1500);
}

// 启动计时器
function startTimer() {
  clearTimerInterval();

  timerInterval.value = window.setInterval(() => {
    timeLeft.value--;

    if (timeLeft.value <= 0) {
      clearTimerInterval();
      endGame();

      // 通知对方游戏结束
      if (connection.value) {
        connection.value.send({
          type: 'game-ended'
        });
      }
    }
  }, 1000);
}

// 清除定时器
function clearTimerInterval() {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

// 游戏结束
function endGame() {
  isGameActive.value = false;
  gameEnded.value = true;
  clearTimerInterval();
}

// 重置游戏
function resetGame() {
  localScore.value = 0;
  remoteScore.value = 0;
  timeLeft.value = 30;
  isGameActive.value = false;
  gameEnded.value = false;
  userAnswer.value = '';
  answerFeedback.value = 'none';
}

// 处理接收到的数据
function handleReceivedData(data: any) {
  console.log('收到数据:', data);

  switch (data.type) {
    case 'game-settings':
      // 接收到游戏设置
      selectedDifficulty.value = data.difficulty;
      break;

    case 'game-started':
      // 游戏开始
      isGameActive.value = true;
      gameEnded.value = false;
      timeLeft.value = 30;
      startTimer();
      break;

    case 'new-question':
      // 接收到新题目
      currentQuestion.value = {
        question: data.question,
        answer: data.answer
      };
      // 接收到新题目意味着轮到我方回答
      localPlayerTurn.value = true;
      break;

    case 'answer-result':
      // 对方答题结果
      remoteScore.value = data.score;
      if (data.isCorrect) {
        showGameMessage('对方答对了!', 'info');
      } else {
        showGameMessage('对方答错了!', 'info');
      }
      // 对方答完题后轮到我方出题
      localPlayerTurn.value = true;
      generateNewQuestion();
      break;

    case 'game-ended':
      // 游戏结束
      endGame();
      break;
  }
}

// 显示游戏消息
function showGameMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  gameMessage.value = message;
  gameMessageType.value = type;

  setTimeout(() => {
    gameMessage.value = '';
  }, 3000);
}
</script>

<style scoped src="../assets/network-bettle.css"></style>
