import React, { useState, useEffect } from 'react';
import { Key, Zap, Shield, Brain, Play, RotateCcw, ChevronRight, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

// Types
interface QubitData {
  aliceBit: number;
  aliceBasis: string;
  polarization: string;
  bobBasis: string;
  bobMeasurement: number | null;
  basesMatch: boolean;
  isNoisy: boolean;
  isIntercepted: boolean;
  isKept: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ExperimentConfig {
  name: string;
  description: string;
  qubits: number;
  noise: number;
  eavesdropping: number;
  color: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('theory');
  const [qubits, setQubits] = useState(20);
  const [noise, setNoise] = useState(10);
  const [eavesdropping, setEavesdropping] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepMode, setIsStepMode] = useState(false);
  const [stepData, setStepData] = useState<any>(null);

  // Pre-quiz state
  const [simulationData, setSimulationData] = useState<QubitData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [preQuizScore, setPreQuizScore] = useState<number | null>(null);
  const [preQuizAnswers, setPreQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [experimentResults, setExperimentResults] = useState<any[]>([]);
  const [qberData, setQberData] = useState<any>(null);

  const preQuizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What is a photon in simple terms?",
      options: [
        "A tiny particle of light",
        "A type of electron",
        "A sound wave",
        "A magnetic field"
      ],
      correct: 0,
      explanation: "A photon is the smallest unit of light - think of it as a tiny packet of light energy that travels at the speed of light."
    },
    {
      id: 2,
      question: "What does 'polarization' mean for light?",
      options: [
        "How bright the light is",
        "The direction the light wave vibrates",
        "How fast light travels",
        "The color of the light"
      ],
      correct: 1,
      explanation: "Polarization is like the orientation of a wave - imagine a rope being shaken up-down vs left-right. Light waves can vibrate in different directions."
    },
    {
      id: 3,
      question: "In quantum mechanics, what happens when you measure a quantum particle?",
      options: [
        "Nothing changes",
        "It gets destroyed",
        "It changes to match your measurement",
        "It becomes classical"
      ],
      correct: 2,
      explanation: "This is the key principle of quantum mechanics - measuring a quantum particle forces it to 'choose' a definite state, which might be different from what it was before."
    },
    {
      id: 4,
      question: "What is the main goal of quantum cryptography?",
      options: [
        "To make computers faster",
        "To create unbreakable secret communication",
        "To store more data",
        "To reduce internet costs"
      ],
      correct: 1,
      explanation: "Quantum cryptography uses the laws of physics to create communication that is theoretically impossible to hack without being detected."
    },
    {
      id: 5,
      question: "Why can't someone secretly copy quantum information?",
      options: [
        "It's too expensive",
        "The technology doesn't exist",
        "Quantum mechanics prevents perfect copying",
        "It's illegal"
      ],
      correct: 2,
      explanation: "The 'No-Cloning Theorem' in quantum mechanics states that you cannot make a perfect copy of an unknown quantum state - this is a fundamental law of physics."
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What happens when Alice (Transmitter) and Bob (Receiver) use different measurement bases?",
      options: [
        "The bit is always correct",
        "The bit has a 50% chance of being wrong",
        "The communication fails",
        "The bit is always wrong"
      ],
      correct: 1,
      explanation: "When bases don't match, quantum mechanics makes Bob's measurement random - he gets the right bit only 50% of the time, like flipping a coin."
    },
    {
      id: 2,
      question: "How do Alice and Bob detect if someone (Eve) is eavesdropping?",
      options: [
        "They use special detectors",
        "They compare some of their bits publicly",
        "They encrypt their messages",
        "They use quantum computers"
      ],
      correct: 1,
      explanation: "They sacrifice some bits by comparing them publicly. If there are more errors than expected from noise alone, someone was listening in."
    },
    {
      id: 3,
      question: "Why is the BB84 protocol considered secure?",
      options: [
        "It uses very complex mathematics",
        "It's based on the laws of quantum physics",
        "It uses long passwords",
        "It changes keys frequently"
      ],
      correct: 1,
      explanation: "BB84's security comes from quantum mechanics itself - any attempt to intercept the quantum states will disturb them, revealing the eavesdropper."
    },
    {
      id: 4,
      question: "What do Alice and Bob do with bits where their bases didn't match?",
      options: [
        "They keep them anyway",
        "They throw them away",
        "They guess the correct values",
        "They ask Eve for help"
      ],
      correct: 1,
      explanation: "They discard all bits where their measurement bases were different, keeping only the ones where they used the same basis."
    },
    {
      id: 5,
      question: "In a perfect world with no noise or eavesdropping, what percentage of bits become the final key?",
      options: [
        "100%",
        "75%",
        "50%",
        "25%"
      ],
      correct: 2,
      explanation: "About 50% of bits survive because Alice and Bob randomly choose bases independently, so they match about half the time."
    }
  ];

  const experiments: ExperimentConfig[] = [
    {
      name: "Perfect Channel",
      description: "Ideal conditions with no interference",
      qubits: 20,
      noise: 0,
      eavesdropping: 0,
      color: "bg-green-500"
    },
    {
      name: "Noisy Channel",
      description: "Channel with environmental noise",
      qubits: 25,
      noise: 15,
      eavesdropping: 0,
      color: "bg-yellow-500"
    },
    {
      name: "Eavesdropper Present",
      description: "Clean channel but Eve is listening",
      qubits: 30,
      noise: 0,
      eavesdropping: 25,
      color: "bg-red-500"
    },
    {
      name: "Real World Scenario",
      description: "Both noise and potential eavesdropping",
      qubits: 35,
      noise: 10,
      eavesdropping: 15,
      color: "bg-purple-500"
    }
  ];

  const steps = [
    "Alice generates random bits",
    "Alice chooses random bases",
    "Alice sends polarized photons",
    "Bob chooses random bases",
    "Bob measures photons",
    "Public basis comparison",
    "Key sifting complete"
  ];

  const generateRandomBit = () => Math.floor(Math.random() * 2);
  const generateRandomBasis = () => Math.random() < 0.5 ? 'rectilinear' : 'diagonal';

  const getPolarization = (bit: number, basis: string) => {
    if (basis === 'rectilinear') {
      return bit === 0 ? '↕' : '↔';
    } else {
      return bit === 0 ? '↗' : '↖';
    }
  };

  const measurePhoton = (polarization: string, basis: string, isNoisy: boolean, isIntercepted: boolean) => {
    const originalBasis = polarization === '↕' || polarization === '↔' ? 'rectilinear' : 'diagonal';
    
    if (isIntercepted) {
      // Eve's measurement disturbs the quantum state
      if (Math.random() < 0.5) {
        return Math.floor(Math.random() * 2);
      }
    }
    
    if (isNoisy) {
      return Math.floor(Math.random() * 2);
    }
    
    if (originalBasis === basis) {
      // Correct basis - should get original bit
      if (polarization === '↕' || polarization === '↗') return 0;
      if (polarization === '↔' || polarization === '↖') return 1;
    } else {
      // Wrong basis - random result
      return Math.floor(Math.random() * 2);
    }
    
    return Math.floor(Math.random() * 2);
  };

  const runSimulation = () => {
    setIsStepMode(false);
    setCurrentStep(0);
    setStepData(null);
    
    const aliceBits = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    const aliceBases = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    const bobBases = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    
    // Simulate Bob's measurements with noise and eavesdropping
    const bobBits = aliceBits.map((bit, i) => {
      let measuredBit = bit;
      
      // Apply eavesdropping effect
      if (Math.random() < eavesdropping / 100) {
        measuredBit = Math.random() < 0.5 ? 0 : 1;
      }
      
      // Apply noise effect
      if (Math.random() < noise / 100) {
        measuredBit = 1 - measuredBit;
      }
      
      // If bases don't match, result is random
      if (aliceBases[i] !== bobBases[i]) {
        measuredBit = Math.random() < 0.5 ? 0 : 1;
      }
      
      return measuredBit;
    });
    
    // Calculate matching bases
    const matchingBases = aliceBases.filter((base, i) => base === bobBases[i]).length;
    
    // Calculate errors (only for matching bases)
    let errors = 0;
    for (let i = 0; i < qubits; i++) {
      if (aliceBases[i] === bobBases[i] && aliceBits[i] !== bobBits[i]) {
        errors++;
      }
    }
    
    // Final key consists of bits where bases match and measurements agree
    const finalKey = [];
    for (let i = 0; i < qubits; i++) {
      if (aliceBases[i] === bobBases[i] && aliceBits[i] === bobBits[i]) {
        finalKey.push(aliceBits[i]);
      }
    }
    
    const result = {
      aliceBits,
      aliceBases,
      bobBases,
      bobBits,
      matchingBases,
      errors,
      finalKeyLength: finalKey.length,
      totalBits: qubits,
      finalKey
    };
    
    setSimulationResult(result);
  };

  const startStepByStep = () => {
    setIsStepMode(true);
    setCurrentStep(0);
    
    const aliceBits = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    const aliceBases = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    const bobBases = Array.from({ length: qubits }, () => Math.random() < 0.5 ? 0 : 1);
    
    // Generate polarizations based on Alice's bits and bases
    const polarizations = aliceBits.map((bit, i) => {
      const base = aliceBases[i];
      if (base === 0) { // Rectilinear basis
        return bit === 0 ? '↑' : '→';
      } else { // Diagonal basis
        return bit === 0 ? '↗' : '↖';
      }
    });
    
    // Bob's measurements with noise and eavesdropping
    const bobBits = aliceBits.map((bit, i) => {
      let finalBit = bit;
      
      // Apply eavesdropping
      if (Math.random() < eavesdropping / 100) {
        finalBit = Math.random() < 0.5 ? 0 : 1;
      }
      
      // Apply noise
      if (Math.random() < noise / 100) {
        finalBit = 1 - finalBit;
      }
      
      return finalBit;
    });
    
    // Determine which bits to keep (matching bases)
    const matchingBases = aliceBases.map((base, i) => base === bobBases[i]);
    
    setStepData({
      aliceBits,
      aliceBases,
      bobBases,
      bobBits,
      polarizations,
      matchingBases,
      totalSteps: qubits + 2 // +2 for basis comparison and final key
    });
  };

  const nextStep = () => {
    if (stepData && currentStep < stepData.totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetStepMode = () => {
    setIsStepMode(false);
    setCurrentStep(0);
    setStepData(null);
  };

  const getBasisVector = (basis: number, bit: number) => {
    if (basis === 0) { // Rectilinear basis
      return bit === 0 ? '|0⟩ = |↑⟩' : '|1⟩ = |→⟩';
    } else { // Diagonal basis
      return bit === 0 ? '|+⟩ = |↗⟩' : '|-⟩ = |↖⟩';
    }
  };

  const getBasisName = (basis: number) => {
    return basis === 0 ? 'Rectilinear (+)' : 'Diagonal (×)';
  };

  const calculateQBER = (result: any) => {
    if (result.matchingBases === 0) return 0;
    return (result.errors / result.matchingBases) * 100;
  };

  const runExperiment = (experiment: ExperimentConfig) => {
    setSelectedExperiment(experiment.name);
    setQubits(experiment.qubits);
    setNoise(experiment.noise);
    setEavesdropping(experiment.eavesdropping);
    setActiveTab('simulation');
    
    setTimeout(() => {
      runSimulation();
    }, 500);
  };

  const resetSimulation = () => {
    setSimulationData([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const calculateStats = () => {
    if (simulationData.length === 0) return { efficiency: 0, errorRate: 0, finalKeyLength: 0 };
    
    const keptBits = simulationData.filter(d => d.isKept).length;
    const errorBits = simulationData.filter(d => d.isIntercepted || d.isNoisy).length;
    
    return {
      efficiency: (keptBits / simulationData.length) * 100,
      errorRate: (errorBits / simulationData.length) * 100,
      finalKeyLength: keptBits
    };
  };

  const handlePreQuizSubmit = () => {
    let score = 0;
    preQuizAnswers.forEach((answer, index) => {
      if (answer === preQuizQuestions[index].correct) score++;
    });
    setPreQuizScore(score);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct) score++;
    });
    setQuizScore(score);
  };

  const TheorySection = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Brain className="mr-3 text-blue-600" />
          Understanding BB84: Quantum Magic Explained Simply
        </h2>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-3 text-blue-800">🌟 What is BB84?</h3>
            <p className="text-lg">
              BB84 is like a magical way to share secret codes using the weird rules of quantum physics. 
              Imagine Alice (Transmitter) wants to send a secret message to Bob (Receiver), but they're worried 
              someone might be listening. BB84 uses light particles (photons) in such a clever way that 
              if anyone tries to spy, Alice and Bob will know immediately!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-green-800">🔑 The Secret Ingredient: Quantum Mechanics</h3>
              <p>
                In our everyday world, if you look at something, it doesn't change. But in the quantum world 
                (the world of tiny particles), just looking at something changes it! This is like having a 
                magic coin that changes its face every time someone peeks at it.
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-purple-800">📡 How Does It Work?</h3>
              <p>
                Alice sends photons (light particles) to Bob, each carrying a bit of information (0 or 1). 
                She can send them in different "orientations" (like vertical, horizontal, or diagonal). 
                Bob tries to measure them, but he has to guess the right orientation!
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h3 className="text-xl font-semibold mb-3 text-yellow-800">🎭 The Players in Our Quantum Drama</h3>
            <div className="space-y-3">
              <p><strong>👩‍🔬 Alice (Transmitter):</strong> The sender who wants to share a secret key. She prepares photons with specific polarizations.</p>
              <p><strong>👨‍🔬 Bob (Receiver):</strong> The receiver who wants to get the secret key. He measures the photons Alice sends.</p>
              <p><strong>🕵️‍♀️ Eve (Eavesdropper):</strong> The spy who might try to intercept the communication. The protocol is designed to catch her!</p>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-indigo-800">🔄 The BB84 Protocol Steps (Simplified)</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                <div>
                  <h4 className="font-semibold">Alice Prepares Her Message</h4>
                  <p>Alice creates random bits (0s and 1s) and randomly chooses how to orient each photon (rectilinear ↕↔ or diagonal ↗↖).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                <div>
                  <h4 className="font-semibold">Alice Sends Quantum Light</h4>
                  <p>She sends each photon with its specific polarization through a quantum channel (like a special fiber optic cable).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                <div>
                  <h4 className="font-semibold">Bob Makes His Guesses</h4>
                  <p>Bob doesn't know which orientation Alice used, so he randomly chooses how to measure each photon.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
                <div>
                  <h4 className="font-semibold">Public Discussion</h4>
                  <p>Alice and Bob publicly compare which orientations they used (but not the actual bit values!).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</span>
                <div>
                  <h4 className="font-semibold">Key Sifting</h4>
                  <p>They keep only the bits where they used the same orientation - these form their secret key!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">6</span>
                <div>
                  <h4 className="font-semibold">Security Check</h4>
                  <p>They test some bits publicly to check for eavesdroppers. Too many errors = someone was spying!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <h3 className="text-xl font-semibold mb-3 text-red-800">🛡️ Why This is Unbreakable</h3>
            <p className="text-lg">
              The beauty of BB84 is that it uses the fundamental laws of physics. If Eve tries to measure 
              the photons to spy on them, she unavoidably disturbs them (quantum mechanics rule!). 
              This creates detectable errors that alert Alice and Bob to her presence. It's like having 
              a burglar alarm that's built into the laws of nature itself!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const PreQuizSection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <CheckCircle className="mr-3 text-green-600" />
          Pre-Quiz: Test Your Basic Understanding
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Before diving into the simulation, let's check if you understand the basic concepts. 
            Don't worry if you don't get everything right - this helps us know what to focus on!
          </p>
        </div>

        <div className="space-y-6">
          {preQuizQuestions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {index + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name={`prequiz-${question.id}`}
                      value={optionIndex}
                      onChange={(e) => {
                        const newAnswers = [...preQuizAnswers];
                        newAnswers[index] = parseInt(e.target.value);
                        setPreQuizAnswers(newAnswers);
                      }}
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              {preQuizScore !== null && (
                <div className={`mt-4 p-3 rounded ${preQuizAnswers[index] === question.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${preQuizAnswers[index] === question.correct ? 'text-green-800' : 'text-red-800'}`}>
                    {preQuizAnswers[index] === question.correct ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-gray-700 mt-2">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePreQuizSubmit}
            disabled={preQuizAnswers.length !== preQuizQuestions.length}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Pre-Quiz
          </button>
          
          {preQuizScore !== null && (
            <div className="text-right">
              <p className="text-lg font-semibold">
                Score: {preQuizScore}/{preQuizQuestions.length}
              </p>
              <p className={`text-sm ${preQuizScore >= 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                {preQuizScore >= 3 ? 'Great! You\'re ready for the simulation.' : 'Review the theory and try again!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ObjectiveSection = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Shield className="mr-3 text-green-600" />
          Learning Objectives
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">🎯 What You Will Learn</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Understand quantum key distribution principles</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Learn how photon polarization encodes information</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Explore the role of measurement bases in quantum communication</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Understand how eavesdropping is detected</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Analyze the effects of noise and interference</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">📚 Prerequisites</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Basic understanding of binary numbers (0s and 1s)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Elementary knowledge of light and waves</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Curiosity about quantum physics (no prior knowledge needed!)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">🚀 Learning Outcomes</h3>
        <p className="text-gray-700 mb-4">
          After completing this virtual lab, you will be able to:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Understand</span>
              <span>The fundamental principles of quantum cryptography</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Analyze</span>
              <span>How quantum mechanics ensures communication security</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center space-x-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Evaluate</span>
              <span>The impact of noise and eavesdropping on key generation</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Apply</span>
              <span>BB84 protocol in various experimental scenarios</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const SimulationSection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Simulation Controls</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Qubits: {qubits}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={qubits}
                    onChange={(e) => setQubits(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noise Level: {noise}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={noise}
                    onChange={(e) => setNoise(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eavesdropping: {eavesdropping}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={eavesdropping}
                    onChange={(e) => setEavesdropping(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={runSimulation}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Run Full Simulation
                </button>
                <button
                  onClick={startStepByStep}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Step-by-Step Mode
                </button>
              </div>
            </div>

            {/* Step-by-Step Simulation */}
            {isStepMode && stepData && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Step-by-Step BB84 Protocol
                  </h3>
                  <button
                    onClick={resetStepMode}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕ Exit Step Mode
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{currentStep + 1} / {stepData.totalSteps}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / stepData.totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-6">
                  {currentStep < qubits ? (
                    // Individual bit steps
                    <div className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
                      <h4 className="text-lg font-semibold mb-4 text-indigo-800">
                        Bit {currentStep + 1} Transmission
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Alice's Side */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Alice (Sender)
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bit Value:</span>
                              <span className="font-mono text-lg font-bold text-blue-600">
                                {stepData.aliceBits[currentStep]}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Basis:</span>
                              <span className="font-mono text-sm">
                                {getBasisName(stepData.aliceBases[currentStep])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Basis Vector:</span>
                              <span className="font-mono text-sm font-semibold text-blue-700">
                                {getBasisVector(stepData.aliceBases[currentStep], stepData.aliceBits[currentStep])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Polarization:</span>
                              <span className="text-2xl">
                                {stepData.polarizations[currentStep]}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bob's Side */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-800 mb-3 flex items-center">
                            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            Bob (Receiver)
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Measurement Basis:</span>
                              <span className="font-mono text-sm">
                                {getBasisName(stepData.bobBases[currentStep])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Basis Vector:</span>
                              <span className="font-mono text-sm font-semibold text-purple-700">
                                {getBasisVector(stepData.bobBases[currentStep], stepData.bobBits[currentStep])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Measured Bit:</span>
                              <span className="font-mono text-lg font-bold text-purple-600">
                                {stepData.bobBits[currentStep]}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bases Match:</span>
                              <span className={`font-semibold ${stepData.matchingBases[currentStep] ? 'text-green-600' : 'text-red-600'}`}>
                                {stepData.matchingBases[currentStep] ? '✓ Yes' : '✗ No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bit Status */}
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Bit Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            stepData.matchingBases[currentStep] 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stepData.matchingBases[currentStep] ? 'Kept for Key' : 'Discarded'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : currentStep === qubits ? (
                    // Basis comparison step
                    <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                      <h4 className="text-lg font-semibold mb-4 text-green-800">
                        Step {currentStep + 1}: Basis Comparison
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Alice and Bob publicly compare their measurement bases and keep only the bits where they used the same basis.
                      </p>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="grid grid-cols-8 gap-2 text-center text-sm">
                          <div className="font-semibold text-gray-600">Bit #</div>
                          <div className="font-semibold text-blue-600">Alice Basis</div>
                          <div className="font-semibold text-purple-600">Bob Basis</div>
                          <div className="font-semibold text-gray-600">Match?</div>
                          <div className="font-semibold text-blue-600">Alice Bit</div>
                          <div className="font-semibold text-purple-600">Bob Bit</div>
                          <div className="font-semibold text-gray-600">Error?</div>
                          <div className="font-semibold text-green-600">Keep?</div>
                          
                          {stepData.aliceBits.slice(0, Math.min(8, qubits)).map((_: any, i: number) => (
                            <React.Fragment key={i}>
                              <div className="py-1">{i + 1}</div>
                              <div className="py-1 font-mono">{getBasisName(stepData.aliceBases[i]).split(' ')[1]}</div>
                              <div className="py-1 font-mono">{getBasisName(stepData.bobBases[i]).split(' ')[1]}</div>
                              <div className={`py-1 ${stepData.matchingBases[i] ? 'text-green-600' : 'text-red-600'}`}>
                                {stepData.matchingBases[i] ? '✓' : '✗'}
                              </div>
                              <div className="py-1 font-mono font-bold text-blue-600">{stepData.aliceBits[i]}</div>
                              <div className="py-1 font-mono font-bold text-purple-600">{stepData.bobBits[i]}</div>
                              <div className={`py-1 ${stepData.aliceBits[i] !== stepData.bobBits[i] && stepData.matchingBases[i] ? 'text-red-600' : 'text-green-600'}`}>
                                {stepData.matchingBases[i] ? (stepData.aliceBits[i] !== stepData.bobBits[i] ? '✗' : '✓') : '-'}
                              </div>
                              <div className={`py-1 font-semibold ${stepData.matchingBases[i] ? 'text-green-600' : 'text-gray-400'}`}>
                                {stepData.matchingBases[i] ? '✓' : '✗'}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                        {qubits > 8 && (
                          <p className="text-center text-gray-500 mt-2 text-sm">
                            Showing first 8 bits. Total: {qubits} bits
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Final key generation step
                    <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                      <h4 className="text-lg font-semibold mb-4 text-purple-800">
                        Step {currentStep + 1}: Final Secure Key
                      </h4>
                      <p className="text-gray-700 mb-4">
                        The final secure key consists of bits where Alice and Bob used matching bases and measured the same values.
                      </p>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Secure Key Bits:</div>
                          <div className="font-mono text-2xl font-bold text-purple-600 bg-purple-100 p-3 rounded">
                            {stepData.aliceBits
                              .filter((_: any, i: number) => stepData.matchingBases[i] && stepData.aliceBits[i] === stepData.bobBits[i])
                              .join('')}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Key Length: {stepData.aliceBits.filter((_: any, i: number) => stepData.matchingBases[i] && stepData.aliceBits[i] === stepData.bobBits[i]).length} bits
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    {currentStep < qubits 
                      ? `Processing bit ${currentStep + 1} of ${qubits}`
                      : currentStep === qubits 
                        ? 'Comparing measurement bases'
                        : 'Generating final secure key'
                    }
                  </div>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= stepData.totalSteps - 1}
                    className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {currentStep >= stepData.totalSteps - 1 ? 'Complete' : 'Next Step →'}
                  </button>
                </div>
              </div>
            )}

            {/* Simulation Results */}
            {simulationResult && !isStepMode && (
              <div className="space-y-6">
                {/* QBER Analysis */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">QBER Analysis & Security Assessment</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{simulationResult.totalBits}</div>
                        <div className="text-sm text-gray-600">Total Bits</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{simulationResult.matchingBases}</div>
                        <div className="text-sm text-gray-600">Matching Bases</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{simulationResult.errors}</div>
                        <div className="text-sm text-gray-600">Errors</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{simulationResult.finalKeyLength}</div>
                        <div className="text-sm text-gray-600">Final Key Length</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* QBER Graph */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-gray-800">QBER Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current QBER</span>
                            <span className="font-mono">{calculateQBER(simulationResult).toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 relative">
                            <div 
                              className={`h-4 rounded-full transition-all duration-500 ${
                                calculateQBER(simulationResult) > 11 ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(calculateQBER(simulationResult), 50)}%` }}
                            ></div>
                            <div className="absolute top-0 left-[22%] w-0.5 h-4 bg-yellow-500"></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="text-yellow-600">11% (Threshold)</span>
                            <span>50%</span>
                          </div>
                          <div className={`text-center text-sm font-medium ${
                            calculateQBER(simulationResult) > 11 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {calculateQBER(simulationResult) > 11 ? '⚠️ Security Compromised' : '✅ Secure Communication'}
                          </div>
                        </div>
                      </div>

                      {/* Efficiency Graph */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-gray-800">Key Generation Efficiency</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-mono">{((simulationResult.finalKeyLength / simulationResult.totalBits) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${(simulationResult.finalKeyLength / simulationResult.totalBits) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                          <div className="text-center text-sm text-indigo-600 font-medium">
                            {simulationResult.finalKeyLength} / {simulationResult.totalBits} bits retained
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Assessment */}
                    <div className={`p-4 rounded-lg border-2 ${
                      calculateQBER(simulationResult) > 11 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${
                        calculateQBER(simulationResult) > 11 ? 'text-red-800' : 'text-green-800'
                      }`}>
                        Security Assessment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">QBER:</span>
                          <span className={`ml-2 font-mono font-bold ${
                            calculateQBER(simulationResult) > 11 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {calculateQBER(simulationResult).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Estimated Eavesdropping:</span>
                          <span className="ml-2 font-mono font-bold text-orange-600">
                            {Math.max(0, (calculateQBER(simulationResult) - noise) * 2).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 font-bold ${
                            calculateQBER(simulationResult) > 11 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {calculateQBER(simulationResult) > 11 ? 'COMPROMISED' : 'SECURE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bit Visualization */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Bit Transmission Visualization</h3>
                  
                  {/* Legend */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Legend:</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded mr-2"></span>
                        Alice's Data
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-purple-500 rounded mr-2"></span>
                        Bob's Data
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded mr-2"></span>
                        Matching Bases
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded mr-2"></span>
                        Noisy Bits
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded mr-2"></span>
                        Intercepted
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-max space-y-2">
                      {/* Alice's Bits */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-blue-600">Alice's Bits:</div>
                        {simulationResult.aliceBits.map((bit: number, i: number) => (
                          <div key={i} className="w-8 h-8 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-sm font-mono font-bold text-blue-700">
                            {bit}
                          </div>
                        ))}
                      </div>

                      {/* Alice's Bases */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-blue-600">Alice's Bases:</div>
                        {simulationResult.aliceBases.map((base: number, i: number) => (
                          <div key={i} className="w-8 h-8 bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-xs font-mono">
                            {base === 0 ? '+' : '×'}
                          </div>
                        ))}
                      </div>

                      {/* Polarization */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-indigo-600">Polarization:</div>
                        {simulationResult.aliceBits.map((bit: number, i: number) => {
                          const base = simulationResult.aliceBases[i];
                          const polarization = base === 0 ? (bit === 0 ? '↑' : '→') : (bit === 0 ? '↗' : '↖');
                          return (
                            <div key={i} className="w-8 h-8 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-lg">
                              {polarization}
                            </div>
                          );
                        })}
                      </div>

                      {/* Bob's Bases */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-purple-600">Bob's Bases:</div>
                        {simulationResult.bobBases.map((base: number, i: number) => (
                          <div key={i} className="w-8 h-8 bg-purple-50 border border-purple-200 rounded flex items-center justify-center text-xs font-mono">
                            {base === 0 ? '+' : '×'}
                          </div>
                        ))}
                      </div>

                      {/* Bob's Measurements */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-purple-600">Bob's Bits:</div>
                        {simulationResult.bobBits.map((bit: number, i: number) => {
                          const isMatching = simulationResult.aliceBases[i] === simulationResult.bobBases[i];
                          const isNoisy = simulationResult.aliceBits[i] !== bit && isMatching;
                          const isIntercepted = Math.random() < eavesdropping / 100;
                          
                          return (
                            <div 
                              key={i} 
                              className={`w-8 h-8 border rounded flex items-center justify-center text-sm font-mono font-bold ${
                                isIntercepted ? 'bg-red-100 border-red-300 text-red-700' :
                                isNoisy ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                                'bg-purple-100 border-purple-300 text-purple-700'
                              }`}
                            >
                              {bit}
                            </div>
                          );
                        })}
                      </div>

                      {/* Final Key */}
                      <div className="flex items-center space-x-1">
                        <div className="w-32 text-sm font-medium text-green-600">Final Key:</div>
                        {simulationResult.aliceBits.map((bit: number, i: number) => {
                          const isMatching = simulationResult.aliceBases[i] === simulationResult.bobBases[i];
                          const isCorrect = bit === simulationResult.bobBits[i];
                          const isKept = isMatching && isCorrect;
                          
                          return (
                            <div 
                              key={i} 
                              className={`w-8 h-8 border rounded flex items-center justify-center text-sm font-mono font-bold ${
                                isKept 
                                  ? 'bg-green-100 border-green-300 text-green-700' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}
                            >
                              {isKept ? bit : '·'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ExperimentsSection = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="mr-3 text-purple-600" />
          BB84 Experiments
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {experiments.map((experiment, index) => (
            <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${experiment.color}`}></div>
                <h3 className="text-xl font-semibold">{experiment.name}</h3>
              </div>
              <p className="text-gray-600 mb-4">{experiment.description}</p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p>📊 Qubits: {experiment.qubits}</p>
                <p>🔊 Noise: {experiment.noise}%</p>
                <p>🕵️ Eavesdropping: {experiment.eavesdropping}%</p>
              </div>
              <button
                onClick={() => runExperiment(experiment)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Run Experiment
              </button>
            </div>
          ))}
        </div>

        {/* Experiment Results Graph */}
        {experimentResults.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Experiment Results</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Efficiency Chart */}
                <div>
                  <h4 className="font-semibold mb-3">Key Generation Efficiency</h4>
                  <div className="space-y-2">
                    {experimentResults.map((result, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="w-24 text-sm">{result.experiment.split(' ')[0]}:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${result.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{result.efficiency.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Rate Chart */}
                <div>
                  <h4 className="font-semibold mb-3">Error Rate Analysis</h4>
                  <div className="space-y-2">
                    {experimentResults.map((result, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="w-24 text-sm">{result.experiment.split(' ')[0]}:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-red-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(result.errorRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{result.errorRate.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ReportsSection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            {simulationResult && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Experiment Report</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Aim</h4>
                      <p className="text-gray-600">
                        To demonstrate the BB84 quantum key distribution protocol and analyze its security 
                        characteristics under various noise and eavesdropping conditions.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Apparatus</h4>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Quantum Communication Simulator (BB84 Protocol)</li>
                        <li>• Photon polarization states (|0⟩, |1⟩, |+⟩, |-⟩)</li>
                        <li>• Rectilinear and Diagonal measurement bases</li>
                        <li>• Noise and eavesdropping simulation modules</li>
                        <li>• QBER calculation and analysis tools</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Theory</h4>
                      <p className="text-gray-600">
                        The BB84 protocol uses quantum mechanics principles to detect eavesdropping. 
                        Alice encodes bits using random polarization bases, Bob measures with random bases, 
                        and they publicly compare bases to generate a secure key. The Quantum Bit Error Rate (QBER) 
                        indicates potential eavesdropping when it exceeds the theoretical threshold of 11%.
                      </p>
                    </div>

                    {simulationResult && (
                      <>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-4">Experimental Data & Graphs</h4>
                          
                          {/* QBER Analysis Graph */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h5 className="font-medium mb-3">QBER vs Security Threshold</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Measured QBER</span>
                                <span className="font-mono">{calculateQBER(simulationResult).toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-6 relative">
                                <div 
                                  className={`h-6 rounded-full transition-all duration-500 ${
                                    calculateQBER(simulationResult) > 11 ? 'bg-red-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(calculateQBER(simulationResult) * 2, 100)}%` }}
                                ></div>
                                <div className="absolute top-0 left-[22%] w-1 h-6 bg-yellow-500"></div>
                                <div className="absolute top-0 left-[22%] -mt-6 text-xs text-yellow-600">11%</div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                              </div>
                            </div>
                          </div>

                          {/* Efficiency Graph */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-medium mb-3">Key Generation Efficiency</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Efficiency Rate</span>
                                <span className="font-mono">{((simulationResult.finalKeyLength / simulationResult.totalBits) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                  className="bg-indigo-500 h-6 rounded-full transition-all duration-500"
                                  style={{ width: `${(simulationResult.finalKeyLength / simulationResult.totalBits) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Observations</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Total Qubits Transmitted:</strong> {simulationResult.totalBits}
                              </div>
                              <div>
                                <strong>Matching Bases:</strong> {simulationResult.matchingBases}
                              </div>
                              <div>
                                <strong>Bit Errors Detected:</strong> {simulationResult.errors}
                              </div>
                              <div>
                                <strong>Final Key Length:</strong> {simulationResult.finalKeyLength} bits
                              </div>
                              <div>
                                <strong>QBER Measured:</strong> {calculateQBER(simulationResult).toFixed(2)}%
                              </div>
                              <div>
                                <strong>Security Status:</strong> 
                                <span className={calculateQBER(simulationResult) > 11 ? 'text-red-600 ml-1' : 'text-green-600 ml-1'}>
                                  {calculateQBER(simulationResult) > 11 ? 'COMPROMISED' : 'SECURE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Conclusion</h4>
                          <p className="text-gray-600">
                            {calculateQBER(simulationResult) > 11 
                              ? `The experiment shows a QBER of ${calculateQBER(simulationResult).toFixed(2)}%, which exceeds the security threshold of 11%. This indicates potential eavesdropping activity. The communication channel is compromised and the generated key should not be used for secure communication.`
                              : `The experiment successfully demonstrates secure quantum key distribution with a QBER of ${calculateQBER(simulationResult).toFixed(2)}%, which is below the security threshold of 11%. The generated ${simulationResult.finalKeyLength}-bit key can be safely used for cryptographic purposes.`
                            }
                            {' '}The efficiency of key generation was {((simulationResult.finalKeyLength / simulationResult.totalBits) * 100).toFixed(1)}%, 
                            which is typical for BB84 protocol implementations.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const QuizSection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Brain className="mr-3 text-purple-600" />
          Knowledge Assessment Quiz
        </h2>
        
        <div className="space-y-6">
          {quizQuestions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {index + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name={`quiz-${question.id}`}
                      value={optionIndex}
                      onChange={(e) => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = parseInt(e.target.value);
                        setQuizAnswers(newAnswers);
                      }}
                      className="text-purple-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              {quizScore !== null && (
                <div className={`mt-4 p-3 rounded ${quizAnswers[index] === question.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${quizAnswers[index] === question.correct ? 'text-green-800' : 'text-red-800'}`}>
                    {quizAnswers[index] === question.correct ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-gray-700 mt-2">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handleQuizSubmit}
            disabled={quizAnswers.length !== quizQuestions.length}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
          
          {quizScore !== null && (
            <div className="text-right">
              <p className="text-lg font-semibold">
                Score: {quizScore}/{quizQuestions.length}
              </p>
              <p className={`text-sm ${quizScore >= 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                {quizScore >= 4 ? 'Excellent understanding!' : 'Review the concepts and try again!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">KeyGenie: BB84 Magic</h1>
                <p className="text-gray-600">Quantum Key Distribution Simulator</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Department of Electronics and Telecommunication</p>
              <p className="text-xs text-gray-500">Quantum Communication Simulator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'theory', label: 'Theory', icon: Brain },
              { id: 'prequiz', label: 'Pre-Quiz', icon: CheckCircle },
              { id: 'objective', label: 'Objective', icon: Shield },
              { id: 'simulation', label: 'Simulation', icon: Zap },
              { id: 'experiments', label: 'Experiments', icon: BarChart3 },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'quiz', label: 'Quiz', icon: Brain }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-8">
        {activeTab === 'theory' && <TheorySection />}
        {activeTab === 'prequiz' && <PreQuizSection />}
        {activeTab === 'objective' && <ObjectiveSection />}
        {activeTab === 'simulation' && <SimulationSection />}
        {activeTab === 'experiments' && <ExperimentsSection />}
        {activeTab === 'reports' && <ReportsSection />}
        {activeTab === 'quiz' && <QuizSection />}
      </main>
    </div>
  );
};

export default App;