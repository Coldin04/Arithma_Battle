export function generateQuestion(difficulty: number): { question: string, answer: number } {
  const ops = ['+', '-', '×', '÷'];

  const generateEasyAddition = (): { question: string, answer: number } => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return {
      question: `${a} + ${b}`,
      answer: a + b,
    };
  };

  const generateEasySubtraction = (): { question: string, answer: number } => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * a); // 保证 a > b
    return {
      question: `${a} - ${b}`,
      answer: a - b,
    };
  };

  const generateMultiplication = (): { question: string, answer: number } => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return {
      question: `${a} × ${b}`,
      answer: a * b,
    };
  };

  const generateMediumAddition = (): { question: string, answer: number } => {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    return {
      question: `${a} + ${b}`,
      answer: a + b,
    };
  };

  const generateMediumSubtraction = (): { question: string, answer: number } => {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * a); // 保证 a > b
    return {
      question: `${a} - ${b}`,
      answer: a - b,
    };
  };

  const generateMultiplicationDivision = (): { question: string, answer: number } => {
    const table = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 乘法表
    const a = table[Math.floor(Math.random() * table.length)];
    const b = table[Math.floor(Math.random() * table.length)];
    const result = a * b;

    return {
      question: `${result} ÷ ${a}`,
      answer: b,
    };
  };

  switch (difficulty) {
    case 1: // 10以内加减法
      return Math.random() < 0.5
        ? generateEasyAddition()
        : generateEasySubtraction();

    case 2: // 10以内乘法
      return generateMultiplication();

    case 3: // 100以内加减法
      return Math.random() < 0.5
        ? generateMediumAddition()
        : generateMediumSubtraction();

    case 4: // 乘法表除法
      return generateMultiplicationDivision();

    default:
      throw new Error('Invalid difficulty level');
  }
}
