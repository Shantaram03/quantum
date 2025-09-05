import React, { useState, useEffect } from 'react';
import { Key, Play, RotateCcw, ChevronRight, ChevronLeft, Users, Shield, Zap, BookOpen, CheckCircle, XCircle, ArrowRight, Lightbulb, Target, Brain } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the smallest unit of digital information in a computer?",
    options: ["Byte", "Bit", "Qubit", "File"],
    correct: 1,
    explanation: "A bit is the smallest unit of digital information, representing either 0 or 1."
  },
  {
    id: 2,
    question: "What is the main purpose of cryptography?",
    options: ["To make communication faster", "To keep information secure", "To store data in small space", "To improve computer speed"],
    correct: 1,
    explanation: "Cryptography's primary purpose is to secure information and protect it from unauthorized access."
  },
  {
    id: 3,
    question: "Which of these is an example of classical encryption?",
    options: ["RSA", "AES", "Quantum Key Distribution", "Blockchain"],
    correct: 1,
    explanation: "AES (Advanced Encryption Standard) is a widely used classical encryption algorithm."
  },
  {
    id: 4,
    question: "What is a 'key' in cryptography?",
    options: ["A password that locks and unlocks information", "A file used to increase speed", "A type of software", "A physical USB stick"],
    correct: 0,
    explanation: "A cryptographic key is like a password that encrypts and decrypts information."
  },
  {
    id: 5,
    question: "Why is randomness important in generating secure keys?",
    options: ["To avoid predictable patterns", "To make encryption faster", "To reduce memory usage", "To simplify algorithms"],
    correct: 0,
    explanation: "Randomness prevents attackers from predicting or guessing the encryption keys."
  },
  {
    id: 6,
    question: "What is one main challenge of classical cryptography today?",
    options: ["It is too slow on the internet", "It can be broken by powerful computers", "It cannot be used on mobile phones", "It needs photons to work"],
    correct: 1,
    explanation: "Powerful quantum computers could potentially break current classical encryption methods."
  },
  {
    id: 7,
    question: "What is a qubit?",
    options: ["A basic unit of classical information", "A binary digit that is only 0 or 1", "A quantum unit that can be in a mix of 0 and 1", "A type of encryption key"],
    correct: 2,
    explanation: "A qubit is a quantum bit that can exist in superposition of both 0 and 1 states simultaneously."
  },
  {
    id: 8,
    question: "What does 'superposition' mean in quantum mechanics?",
    options: ["A particle is always fixed in one state", "A particle can be in multiple states at once", "A particle is destroyed when measured", "A particle cannot interact with others"],
    correct: 1,
    explanation: "Superposition allows quantum particles to exist in multiple states simultaneously until measured."
  },
  {
    id: 9,
    question: "What does 'entanglement' mean?",
    options: ["Two qubits instantly affect each other's states", "Two qubits exist independently", "Two particles collide and merge", "Two particles have the same speed"],
    correct: 0,
    explanation: "Quantum entanglement creates an instant connection between particles, regardless of distance."
  },
  {
    id: 10,
    question: "Why do we need secure communication methods today?",
    options: ["To reduce internet bills", "To watch movies faster", "To protect privacy and prevent hacking", "To improve Wi-Fi range"],
    correct: 2,
    explanation: "Secure communication protects our personal data, financial information, and privacy from cyber threats."
  }
];

interface BitTransmission {
  aliceBit: number;
  aliceBasis: string;
  alicePolarization: string;
  bobBasis: string;
  bobMeasurement: number;
  basisMatch: boolean;
  kept: boolean;
  error: boolean;
}

const App: React.Component = () => {
  const [currentPage, setCurrentPage] = useState<'quiz' | 'theory' | 'simulation'>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(10).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Theory simulations
  const [classicalBitDemo, setClassicalBitDemo] = useState(0);
  const [quantumBitDemo, setQuantumBitDemo] = useState('superposition');
  const [channelDemo, setChannelDemo] = useState('classical');
  
  // Simulation state
  const [keyLength, setKeyLength] = useState(8);
  const [transmissions, setTransmissions] = useState<BitTransmission[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationMode, setSimulationMode] = useState<'step' | 'auto'>('step');
  const [showResults, setShowResults] = useState(false);
  const [animatingBit, setAnimatingBit] = useState(false);

  // Quiz functions
  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    const score = quizAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quizQuestions[index].correct ? 1 : 0);
    }, 0);
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizAnswers(new Array(10).fill(-1));
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Theory simulation effects
  useEffect(() => {
    const interval = setInterval(() => {
      setClassicalBitDemo(prev => prev === 0 ? 1 : 0);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const states = ['superposition', '0', '1', 'superposition'];
    let index = 0;
    const interval = setInterval(() => {
      setQuantumBitDemo(states[index]);
      index = (index + 1) % states.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulation functions
  const generateRandomBit = () => Math.random() < 0.5 ? 0 : 1;
  const generateRandomBasis = () => Math.random() < 0.5 ? 'rectilinear' : 'diagonal';

  const getBasisSymbol = (basis: string) => basis === 'rectilinear' ? '+' : '×';
  const getBasisVectors = (basis: string) => 
    basis === 'rectilinear' ? ['|0⟩', '|1⟩'] : ['|+⟩', '|-⟩'];
  
  const getPolarization = (bit: number, basis: string) => {
    if (basis === 'rectilinear') return bit === 0 ? '↑' : '→';
    return bit === 0 ? '↗' : '↖';
  };

  const measureBit = (aliceBit: number, aliceBasis: string, bobBasis: string) => {
    if (aliceBasis === bobBasis) {
      return Math.random() < 0.95 ? aliceBit : 1 - aliceBit;
    }
    return generateRandomBit();
  };

  const runSimulation = () => {
    const newTransmissions: BitTransmission[] = [];
    
    for (let i = 0; i < keyLength; i++) {
      const aliceBit = generateRandomBit();
      const aliceBasis = generateRandomBasis();
      const bobBasis = generateRandomBasis();
      const bobMeasurement = measureBit(aliceBit, aliceBasis, bobBasis);
      const basisMatch = aliceBasis === bobBasis;
      const error = basisMatch && aliceBit !== bobMeasurement;
      
      newTransmissions.push({
        aliceBit,
        aliceBasis,
        alicePolarization: getPolarization(aliceBit, aliceBasis),
        bobBasis,
        bobMeasurement,
        basisMatch,
        kept: basisMatch,
        error
      });
    }
    
    setTransmissions(newTransmissions);
    setCurrentStep(0);
    setShowResults(false);
  };

  const nextStep = async () => {
    if (currentStep < transmissions.length) {
      setAnimatingBit(true);
      setTimeout(() => {
        setAnimatingBit(false);
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowResults(false);
    }
  };

  const resetSimulation = () => {
    setTransmissions([]);
    setCurrentStep(0);
    setShowResults(false);
    setIsRunning(false);
  };

  const runAutoSimulation = async () => {
    setIsRunning(true);
    runSimulation();
    
    for (let i = 0; i <= keyLength; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(i);
    }
    
    setShowResults(true);
    setIsRunning(false);
  };

  const getCurrentTransmission = () => {
    if (currentStep === 0 || transmissions.length === 0) return null;
    return transmissions[currentStep - 1];
  };

  const getQBER = () => {
    const matchedBits = transmissions.filter(t => t.basisMatch);
    const errors = matchedBits.filter(t => t.error);
    return matchedBits.length > 0 ? (errors.length / matchedBits.length) * 100 : 0;
  };

  const getFinalKey = () => {
    return transmissions
      .filter(t => t.basisMatch && !t.error)
      .map(t => t.aliceBit)
      .join('');
  };

  // Quiz Page
  if (currentPage === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
                <Key className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to KeyGenie! 🔐
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Let's start with a quick knowledge check to see what you already know about cryptography and quantum mechanics!
            </p>
          </div>

          {!quizSubmitted ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center mb-8">
                  <Brain className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Pre-Assessment Quiz</h2>
                </div>
                
                <div className="space-y-8">
                  {quizQuestions.map((q, index) => (
                    <div key={q.id} className="border-l-4 border-blue-500 pl-6 py-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Q{q.id}. {q.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleQuizAnswer(index, optionIndex)}
                            className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                              quizAnswers[index] === optionIndex
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={submitQuiz}
                    disabled={quizAnswers.includes(-1)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                  {quizScore >= 7 ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  ) : (
                    <Target className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Quiz Complete! 🎉
                </h2>
                
                <div className="text-6xl font-bold text-blue-600 mb-4">
                  {quizScore}/10
                </div>
                
                <p className="text-lg text-gray-600 mb-8">
                  {quizScore >= 8 ? "Excellent! You have a strong foundation." :
                   quizScore >= 6 ? "Good job! You're ready to learn more." :
                   "No worries! Let's explore these concepts together."}
                </p>

                <div className="space-y-4 mb-8">
                  {quizQuestions.map((q, index) => (
                    <div key={q.id} className={`p-4 rounded-lg ${
                      quizAnswers[index] === q.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center mb-2">
                        {quizAnswers[index] === q.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        )}
                        <span className="font-semibold">Q{q.id}</span>
                      </div>
                      <p className="text-sm text-gray-600">{q.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetQuiz}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setCurrentPage('theory')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    Continue Learning <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Theory Page
  if (currentPage === 'theory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full shadow-lg">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Understanding Quantum Communication 🌟
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Let's explore how information travels from classical bits to quantum magic!
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Classical vs Quantum Bits */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Lightbulb className="w-8 h-8 text-yellow-500 mr-3" />
                Classical Bits vs Quantum Bits
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Classical Bit */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Classical Bit</h3>
                  <div className="bg-gray-100 rounded-lg p-8 mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white transition-all duration-500 ${
                      classicalBitDemo === 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {classicalBitDemo}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Always definite: either <span className="font-bold text-red-500">0</span> or <span className="font-bold text-green-500">1</span>
                  </p>
                </div>

                {/* Quantum Bit */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-purple-600">Quantum Bit (Qubit)</h3>
                  <div className="bg-gray-100 rounded-lg p-8 mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white transition-all duration-500 ${
                      quantumBitDemo === 'superposition' ? 'bg-gradient-to-r from-red-500 to-green-500 animate-pulse' :
                      quantumBitDemo === '0' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {quantumBitDemo === 'superposition' ? '0+1' : quantumBitDemo}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Can be in <span className="font-bold text-purple-500">superposition</span>: both 0 and 1 simultaneously!
                  </p>
                </div>
              </div>
            </div>

            {/* Communication Channels */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Zap className="w-8 h-8 text-orange-500 mr-3" />
                Communication Channels
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setChannelDemo('classical')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      channelDemo === 'classical' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Classical Channel
                  </button>
                  <button
                    onClick={() => setChannelDemo('quantum')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      channelDemo === 'quantum' 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Quantum Channel
                  </button>
                </div>
              </div>

              {channelDemo === 'classical' ? (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                        A
                      </div>
                      <p className="text-sm font-semibold">Alice</p>
                    </div>
                    
                    <div className="flex-1 mx-8">
                      <div className="relative">
                        <div className="h-2 bg-blue-300 rounded-full"></div>
                        <div className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-center mt-2 text-sm text-gray-600">Electrical signals / Radio waves</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                        B
                      </div>
                      <p className="text-sm font-semibold">Bob</p>
                    </div>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Security Risk:</strong> Eavesdroppers can intercept without detection!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                        A
                      </div>
                      <p className="text-sm font-semibold">Alice</p>
                    </div>
                    
                    <div className="flex-1 mx-8">
                      <div className="relative">
                        <div className="h-2 bg-purple-300 rounded-full"></div>
                        <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-center mt-2 text-sm text-gray-600">Quantum photons ✨</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                        B
                      </div>
                      <p className="text-sm font-semibold">Bob</p>
                    </div>
                  </div>
                  <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✅ <strong>Quantum Security:</strong> Any eavesdropping attempt disturbs the quantum state and gets detected!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* BB84 Protocol Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Shield className="w-8 h-8 text-green-500 mr-3" />
                The BB84 Protocol Magic ✨
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">How It Works:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 mt-1">1</div>
                      <div>
                        <p className="font-semibold">Alice prepares qubits</p>
                        <p className="text-sm text-gray-600">Random bits in random bases (+ or ×)</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 mt-1">2</div>
                      <div>
                        <p className="font-semibold">Quantum transmission</p>
                        <p className="text-sm text-gray-600">Photons travel through quantum channel</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 mt-1">3</div>
                      <div>
                        <p className="font-semibold">Bob measures randomly</p>
                        <p className="text-sm text-gray-600">Uses random bases to measure</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 mt-1">4</div>
                      <div>
                        <p className="font-semibold">Basis comparison</p>
                        <p className="text-sm text-gray-600">Keep bits where bases match</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">Basis Vectors:</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-blue-600 mb-2">Rectilinear Basis (+):</p>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl">↑</div>
                          <div className="text-sm">|0⟩</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">→</div>
                          <div className="text-sm">|1⟩</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-purple-600 mb-2">Diagonal Basis (×):</p>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl">↗</div>
                          <div className="text-sm">|+⟩</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">↖</div>
                          <div className="text-sm">|-⟩</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentPage('quiz')}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back to Quiz
                </button>
                <button
                  onClick={() => setCurrentPage('simulation')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  Try the Simulation! <Play className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simulation Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full shadow-lg">
              <Key className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            BB84 Quantum Key Distribution Simulator 🔬
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch quantum magic happen as Alice and Bob create a secure key using quantum mechanics!
          </p>
        </div>

        {/* Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Key Length:
                </label>
                <select
                  value={keyLength}
                  onChange={(e) => setKeyLength(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRunning}
                >
                  <option value={4}>4 bits</option>
                  <option value={8}>8 bits</option>
                  <option value={12}>12 bits</option>
                  <option value={16}>16 bits</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    runSimulation();
                    setSimulationMode('step');
                  }}
                  disabled={isRunning}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Step-by-Step
                </button>
                
                <button
                  onClick={() => {
                    setSimulationMode('auto');
                    runAutoSimulation();
                  }}
                  disabled={isRunning}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Run
                </button>
                
                <button
                  onClick={resetSimulation}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {transmissions.length > 0 && (
          <>
            {/* Step Navigation */}
            {simulationMode === 'step' && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Step {currentStep} of {keyLength}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextStep}
                        disabled={showResults}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / keyLength) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantum Channel Visualization */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  Quantum Communication Channel
                </h3>
                
                <div className="flex items-center justify-between">
                  {/* Alice */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg">
                      A
                    </div>
                    <p className="font-semibold text-gray-800">Alice</p>
                    <p className="text-sm text-gray-600">Sender</p>
                    
                    {getCurrentTransmission() && (
                      <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                        <div className="text-sm space-y-1">
                          <p><strong>Bit:</strong> {getCurrentTransmission()!.aliceBit}</p>
                          <p><strong>Basis:</strong> {getBasisSymbol(getCurrentTransmission()!.aliceBasis)}</p>
                          <p><strong>State:</strong> {getBasisVectors(getCurrentTransmission()!.aliceBasis)[getCurrentTransmission()!.aliceBit]}</p>
                          <p><strong>Polarization:</strong> <span className="text-2xl">{getCurrentTransmission()!.alicePolarization}</span></p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantum Channel */}
                  <div className="flex-1 mx-8">
                    <div className="relative">
                      <div className="h-4 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 rounded-full shadow-inner"></div>
                      {animatingBit && (
                        <div className="absolute top-0 left-0 w-6 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"
                             style={{
                               animation: 'movePhoton 1.5s ease-in-out forwards'
                             }}>
                        </div>
                      )}
                    </div>
                    <p className="text-center mt-2 text-sm text-gray-600 font-medium">
                      ✨ Quantum Photon Channel ✨
                    </p>
                    {getCurrentTransmission() && (
                      <div className="text-center mt-2">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Transmitting: {getBasisVectors(getCurrentTransmission()!.aliceBasis)[getCurrentTransmission()!.aliceBit]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bob */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg">
                      B
                    </div>
                    <p className="font-semibold text-gray-800">Bob</p>
                    <p className="text-sm text-gray-600">Receiver</p>
                    
                    {getCurrentTransmission() && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm space-y-1">
                          <p><strong>Basis:</strong> {getBasisSymbol(getCurrentTransmission()!.bobBasis)}</p>
                          <p><strong>Measured:</strong> {getCurrentTransmission()!.bobMeasurement}</p>
                          <p><strong>Match:</strong> 
                            <span className={`ml-1 font-bold ${getCurrentTransmission()!.basisMatch ? 'text-green-600' : 'text-red-600'}`}>
                              {getCurrentTransmission()!.basisMatch ? '✓' : '✗'}
                            </span>
                          </p>
                          {getCurrentTransmission()!.error && (
                            <p className="text-red-600 font-bold">⚠️ QBER Event!</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Analysis */}
                {getCurrentTransmission() && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Step Analysis:</h4>
                    <p className="text-sm text-gray-700">
                      Alice sent bit <strong>{getCurrentTransmission()!.aliceBit}</strong> using 
                      <strong> {getCurrentTransmission()!.aliceBasis}</strong> basis 
                      ({getBasisVectors(getCurrentTransmission()!.aliceBasis)[getCurrentTransmission()!.aliceBit]}, {getCurrentTransmission()!.alicePolarization}). 
                      Bob measured using <strong>{getCurrentTransmission()!.bobBasis}</strong> basis and got 
                      <strong> {getCurrentTransmission()!.bobMeasurement}</strong>. 
                      {getCurrentTransmission()!.basisMatch ? (
                        <span className="text-green-600 font-semibold"> Bases match - this bit will be kept!</span>
                      ) : (
                        <span className="text-red-600 font-semibold"> Bases don't match - this bit will be discarded.</span>
                      )}
                      {getCurrentTransmission()!.error && (
                        <span className="text-red-600 font-semibold"> However, there was a quantum error (QBER event)!</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Table */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Transmission Results</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bit #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alice's Bit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alice's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantum State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Polarization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bob's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bob's Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transmissions.slice(0, currentStep).map((transmission, index) => (
                        <tr key={index} className={`${
                          transmission.error ? 'bg-red-50' : 
                          transmission.basisMatch ? 'bg-green-50' : 'bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {transmission.aliceBit}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getBasisSymbol(transmission.aliceBasis)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {getBasisVectors(transmission.aliceBasis)[transmission.aliceBit]}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-xl">
                            {transmission.alicePolarization}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getBasisSymbol(transmission.bobBasis)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {transmission.bobMeasurement}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {transmission.error ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                QBER Error
                              </span>
                            ) : transmission.basisMatch ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Kept
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Discarded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Final Results */}
            {showResults && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎉 Simulation Complete!
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {transmissions.filter(t => t.basisMatch).length}
                      </div>
                      <p className="text-sm text-gray-600">Matching Bases</p>
                    </div>
                    
                    <div className="text-center p-6 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {getQBER().toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">QBER</p>
                    </div>
                    
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {getFinalKey().length}
                      </div>
                      <p className="text-sm text-gray-600">Final Key Length</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Final Secure Key:</h4>
                    <div className="font-mono text-lg bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
                      {getFinalKey() || 'No secure bits generated'}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Security Analysis:</h4>
                    <p className="text-sm text-blue-700">
                      {getQBER() < 11 ? (
                        <>
                          ✅ <strong>Secure!</strong> QBER is {getQBER().toFixed(1)}% (below 11% threshold). 
                          The key can be used safely for encryption.
                        </>
                      ) : (
                        <>
                          ⚠️ <strong>Potentially Compromised!</strong> QBER is {getQBER().toFixed(1)}% (above 11% threshold). 
                          This suggests possible eavesdropping - the key should be discarded.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('theory')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center mx-auto"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Theory
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes movePhoton {
          0% { left: 0%; }
          100% { left: calc(100% - 24px); }
        }
      `}</style>
    </div>
  );
};

export default App;