import React, { useState, useEffect } from 'react';
import { Key, Zap, Shield, Brain, Play, RotateCcw, ChevronRight, CheckCircle, XCircle, BarChart3, ChevronLeft, Radio } from 'lucide-react';

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
  const [noise, setNoise] = useState(0);
  const [eavesdropping, setEavesdropping] = useState(0);
  const [simulationData, setSimulationData] = useState<QubitData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [preQuizScore, setPreQuizScore] = useState<number | null>(null);
  const [preQuizAnswers, setPreQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [experimentResults, setExperimentResults] = useState<any[]>([]);
  const [qberData, setQberData] = useState<any>(null);
  const [stepMode, setStepMode] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

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

  const getBasisVector = (bit: number, basis: number) => {
    if (basis === 0) { // Rectilinear basis
      return bit === 0 ? '|0⟩' : '|1⟩';
    } else { // Diagonal basis
      return bit === 0 ? '|+⟩' : '|-⟩';
    }
  };

  const getPolarizationFromBasis = (bit: number, basis: number) => {
    if (basis === 0) { // Rectilinear basis
      return bit === 0 ? '↑' : '→';
    } else { // Diagonal basis
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

  const startStepSimulation = () => {
    resetSimulation();
    setStepMode(true);
    setCurrentStep(0);
    
    // Generate data for step simulation
    const data: QubitData[] = [];
    
    for (let i = 0; i < qubits; i++) {
      const aliceBit = generateRandomBit();
      const aliceBasis = generateRandomBasis();
      const polarization = getPolarization(aliceBit, aliceBasis);
      const bobBasis = generateRandomBasis();
      
      const isNoisy = Math.random() < (noise / 100);
      const isIntercepted = Math.random() < (eavesdropping / 100);
      
      const bobMeasurement = measurePhoton(polarization, bobBasis, isNoisy, isIntercepted);
      const basesMatch = aliceBasis === bobBasis;
      const isKept = basesMatch && !isNoisy;
      
      data.push({
        aliceBit,
        aliceBasis,
        polarization,
        bobBasis,
        bobMeasurement,
        basesMatch,
        isNoisy,
        isIntercepted,
        isKept
      });
    }
    
    setSimulationData(data);
  };

  const nextStep = () => {
    if (currentStep < simulationData.length) {
      setIsTransmitting(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransmitting(false);
      }, 1500);
    } else {
      // Calculate QBER and finish
      let totalErrors = 0;
      let totalComparisons = 0;
      
      simulationData.forEach(data => {
        if (data.aliceBasis === data.bobBasis) {
          totalComparisons++;
          if (data.bobMeasurement !== data.aliceBit) {
            totalErrors++;
          }
        }
      });
      
      const qber = totalComparisons > 0 ? (totalErrors / totalComparisons) * 100 : 0;
      const securityThreshold = 11;
      const isSecure = qber < securityThreshold;

      const qberAnalysis = {
        qber: qber,
        totalBits: qubits,
        matchingBases: totalComparisons,
        errors: totalErrors,
        correctBits: totalComparisons - totalErrors,
        finalKeyLength: simulationData.filter(d => d.isKept).length,
        efficiency: (simulationData.filter(d => d.isKept).length / qubits) * 100,
        isSecure: isSecure,
        securityThreshold: securityThreshold,
        estimatedEavesdropping: Math.max(0, (qber - noise) * 2),
      };

      setQberData(qberAnalysis);
      setStepMode(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const runSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    const data: QubitData[] = [];
    let totalErrors = 0;
    let totalComparisons = 0;
    
    for (let i = 0; i < qubits; i++) {
      const aliceBit = generateRandomBit();
      const aliceBasis = generateRandomBasis();
      const polarization = getPolarization(aliceBit, aliceBasis);
      const bobBasis = generateRandomBasis();
      
      const isNoisy = Math.random() < (noise / 100);
      const isIntercepted = Math.random() < (eavesdropping / 100);
      
      const bobMeasurement = measurePhoton(polarization, bobBasis, isNoisy, isIntercepted);
      const basesMatch = aliceBasis === bobBasis;
      const isKept = basesMatch && !isNoisy;
      
      if (aliceBasis === bobBasis) {
        totalComparisons++;
        if (bobMeasurement !== aliceBit) {
          totalErrors++;
        }
      }
      
      data.push({
        aliceBit,
        aliceBasis,
        polarization,
        bobBasis,
        bobMeasurement,
        basesMatch,
        isNoisy,
        isIntercepted,
        isKept
      });
    }
    
    setSimulationData(data);

    // Calculate QBER
    const qber = totalComparisons > 0 ? (totalErrors / totalComparisons) * 100 : 0;
    const securityThreshold = 11; // Standard BB84 security threshold
    const isSecure = qber < securityThreshold;

    // Generate QBER analysis data
    const qberAnalysis = {
      qber: qber,
      totalBits: qubits,
      matchingBases: totalComparisons,
      errors: totalErrors,
      correctBits: totalComparisons - totalErrors,
      finalKeyLength: data.filter(d => d.isKept).length,
      efficiency: (data.filter(d => d.isKept).length / qubits) * 100,
      isSecure: isSecure,
      securityThreshold: securityThreshold,
      estimatedEavesdropping: Math.max(0, (qber - noise) * 2), // Rough estimate
    };

    setQberData(qberAnalysis);
    
    // Animate through steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
        
        // Store experiment results
        if (selectedExperiment) {
          const keptBits = data.filter(d => d.isKept).length;
          const errorRate = data.filter(d => d.isIntercepted || d.isNoisy).length / data.length;
          
          setExperimentResults(prev => [...prev, {
            experiment: selectedExperiment,
            totalBits: qubits,
            keptBits,
            efficiency: (keptBits / qubits) * 100,
            errorRate: errorRate * 100,
            noise,
            eavesdropping,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      }
    }, 800);
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
    setStepMode(false);
    setIsTransmitting(false);
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
    const stats = calculateStats();
    
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <Zap className="mr-3 text-yellow-600" />
            Interactive BB84 Simulation
          </h2>
          
          {/* Control Panel */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Number of Qubits: {qubits}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={qubits}
                onChange={(e) => setQubits(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning || stepMode}
              />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Noise Level: {noise}%
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={noise}
                onChange={(e) => setNoise(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning || stepMode}
              />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Eavesdropping: {eavesdropping}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={eavesdropping}
                onChange={(e) => setEavesdropping(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning || stepMode}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={startStepSimulation}
              disabled={isRunning || stepMode}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Step-by-Step</span>
            </button>
            
            <button
              onClick={runSimulation}
              disabled={isRunning || stepMode}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>{isRunning ? 'Running...' : 'Quick Run'}</span>
            </button>
            
            <button
              onClick={resetSimulation}
              disabled={isRunning}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Progress Indicator */}
          {(isRunning || simulationData.length > 0) && !stepMode && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Protocol Progress</h3>
                <span className="text-sm text-gray-600">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 overflow-x-auto pb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < currentStep ? 'bg-green-500 text-white' : 
                      index === currentStep ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm whitespace-nowrap ${
                      index < currentStep ? 'text-green-600' : 
                      index === currentStep ? 'text-blue-600' : 
                      'text-gray-500'
                    }`}>
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Simulation */}
          {stepMode && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Radio className="w-6 h-6 mr-3 text-blue-500" />
                  Step-by-Step BB84 Protocol
                </h3>
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {simulationData.length + 1}
                </div>
              </div>

              {currentStep < simulationData.length ? (
                <div className="space-y-6">
                  {/* Current Bit Transmission */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Transmitting Bit #{currentStep + 1}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Alice's Side */}
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="font-semibold text-blue-600 mb-3 flex items-center">
                          👩‍🔬 Alice (Sender)
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bit to send:</span>
                            <span className="font-mono font-bold text-lg">{simulationData[currentStep].aliceBit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Chosen basis:</span>
                            <span className="font-mono">{simulationData[currentStep].aliceBasis === 'rectilinear' ? 'Rectilinear (+)' : 'Diagonal (×)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Basis vector:</span>
                            <span className="font-mono text-purple-600 font-bold">
                              {getBasisVector(simulationData[currentStep].aliceBit, simulationData[currentStep].aliceBasis === 'rectilinear' ? 0 : 1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Polarization:</span>
                            <span className="text-2xl">
                              {simulationData[currentStep].polarization}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bob's Side */}
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="font-semibold text-green-600 mb-3 flex items-center">
                          🔬 Bob (Receiver)
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Chosen basis:</span>
                            <span className="font-mono">{simulationData[currentStep].bobBasis === 'rectilinear' ? 'Rectilinear (+)' : 'Diagonal (×)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Measurement vector:</span>
                            <span className="font-mono text-purple-600 font-bold">
                              {getBasisVector(0, simulationData[currentStep].bobBasis === 'rectilinear' ? 0 : 1)} / {getBasisVector(1, simulationData[currentStep].bobBasis === 'rectilinear' ? 0 : 1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Measured bit:</span>
                            <span className="font-mono font-bold text-lg">{simulationData[currentStep].bobMeasurement}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bases match:</span>
                            <span className={`font-semibold ${simulationData[currentStep].basesMatch ? 'text-green-600' : 'text-orange-600'}`}>
                              {simulationData[currentStep].basesMatch ? '✓ Yes' : '✗ No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantum Transmission Visualization */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl">👩‍🔬</span>
                          </div>
                          <div className="text-sm font-medium">Alice</div>
                          <div className="text-xs text-gray-500">Prepares qubit</div>
                        </div>
                        
                        <div className="flex-1 mx-4 relative">
                          <div className="h-1 bg-gray-200 rounded-full relative overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1500 ${isTransmitting ? 'w-full' : 'w-0'}`}
                            ></div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className={`text-2xl transition-all duration-1500 ${isTransmitting ? 'animate-pulse' : ''}`}>
                              {simulationData[currentStep].polarization}
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <div className="text-xs text-gray-500">Quantum Channel</div>
                            <div className="text-xs font-mono text-purple-600">
                              {getBasisVector(simulationData[currentStep].aliceBit, simulationData[currentStep].aliceBasis === 'rectilinear' ? 0 : 1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl">🔬</span>
                          </div>
                          <div className="text-sm font-medium">Bob</div>
                          <div className="text-xs text-gray-500">Measures qubit</div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h6 className="font-semibold text-gray-800 mb-2">Analysis:</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Alice encodes bit <strong>{simulationData[currentStep].aliceBit}</strong> using <strong>{simulationData[currentStep].aliceBasis}</strong> basis</p>
                        <p>• Bob measures using <strong>{simulationData[currentStep].bobBasis}</strong> basis</p>
                        <p>• Bases {simulationData[currentStep].basesMatch ? '<strong>match</strong> - bit will be kept for final key' : '<strong>don\'t match</strong> - bit will be discarded'}</p>
                        {(simulationData[currentStep].isNoisy || simulationData[currentStep].isIntercepted) && (
                          <p className="text-red-600">• <strong>Error detected!</strong> This contributes to QBER</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Progress</div>
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentStep + 1) / (simulationData.length + 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={nextStep}
                      disabled={isTransmitting}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {currentStep < simulationData.length - 1 ? 'Next Bit' : 'Finish'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    🎉 Transmission Complete!
                  </h4>
                  <p className="text-gray-600 mb-4">
                    All {simulationData.length} qubits have been transmitted. Click "View Results" to see the analysis.
                  </p>
                  <button
                    onClick={nextStep}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Results & QBER Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Horizontal Bit Visualization */}
          {simulationData.length > 0 && !stepMode && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Bit Transmission Visualization</h3>
              
              {/* Legend */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Legend:</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Alice's Data</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Bases</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Bob's Data</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Noisy</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Intercepted</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                    <span>Final Key</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-max space-y-3">
                  {/* Alice's Bits Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-blue-600">Alice's Bits:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 
                        data.isNoisy ? 'bg-yellow-100 text-yellow-800' :
                        data.isIntercepted ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {data.isKept ? data.aliceBit : data.basesMatch ? data.aliceBit : '·'}
                      </div>
                    ))}
                  </div>

                  {/* Alice's Bases Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-purple-600">Alice's Bases:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {data.aliceBasis === 'rectilinear' ? '+' : '×'}
                      </div>
                    ))}
                  </div>

                  {/* Polarization Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-indigo-600">Polarization:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-lg font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 
                        data.isNoisy ? 'bg-yellow-100 text-yellow-800' :
                        data.isIntercepted ? 'bg-red-100 text-red-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {data.polarization}
                      </div>
                    ))}
                  </div>

                  {/* Bob's Bases Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-green-600">Bob's Bases:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 
                        data.basesMatch ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {data.bobBasis === 'rectilinear' ? '+' : '×'}
                      </div>
                    ))}
                  </div>

                  {/* Bob's Measurements Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-green-600">Bob's Results:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 
                        data.basesMatch ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {data.isKept ? data.bobMeasurement : data.basesMatch ? data.bobMeasurement : '·'}
                      </div>
                    ))}
                  </div>

                  {/* Final Key Row */}
                  <div className="flex items-center space-x-1">
                    <div className="w-32 text-sm font-semibold text-indigo-600">Final Key:</div>
                    {simulationData.map((data, index) => (
                      <div key={index} className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                        data.isKept ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {data.isKept ? data.aliceBit : '·'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QBER Analysis */}
          {simulationData.length > 0 && qberData && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                📊 QBER Analysis & Security Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">QBER (Quantum Bit Error Rate):</span>
                    <span className={`font-bold ${qberData.qber > qberData.securityThreshold ? 'text-red-600' : 'text-green-600'}`}>
                      {qberData.qber.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Security Status:</span>
                    <span className={`font-bold ${qberData.isSecure ? 'text-green-600' : 'text-red-600'}`}>
                      {qberData.isSecure ? '✅ SECURE' : '❌ COMPROMISED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Security Threshold:</span>
                    <span className="font-bold text-gray-700">{qberData.securityThreshold}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Estimated Eavesdropping:</span>
                    <span className="font-bold text-orange-600">{qberData.estimatedEavesdropping.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Qubits Sent:</span>
                    <span className="font-bold text-blue-600">{qberData.totalBits}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Matching Bases:</span>
                    <span className="font-bold text-blue-600">{qberData.matchingBases}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Correct Measurements:</span>
                    <span className="font-bold text-green-600">{qberData.correctBits}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="font-medium">Error Count:</span>
                    <span className="font-bold text-red-600">{qberData.errors}</span>
                  </div>
                </div>
              </div>
              
              {/* QBER Visualization Graph */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">QBER Visualization</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-end space-x-2 h-32">
                    {/* Correct Bits Bar */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="bg-green-500 rounded-t w-16 transition-all duration-1000"
                        style={{ height: `${(qberData.correctBits / qberData.matchingBases) * 100}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-center">Correct<br/>({qberData.correctBits})</span>
                    </div>
                    {/* Error Bits Bar */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="bg-red-500 rounded-t w-16 transition-all duration-1000"
                        style={{ height: `${(qberData.errors / qberData.matchingBases) * 100}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-center">Errors<br/>({qberData.errors})</span>
                    </div>
                    {/* QBER Threshold Line */}
                    <div className="flex flex-col items-center ml-4">
                      <div className="relative h-32 w-1">
                        <div 
                          className="absolute w-8 h-0.5 bg-orange-500 -left-4"
                          style={{ bottom: `${qberData.securityThreshold}%` }}
                        ></div>
                        <span 
                          className="absolute text-xs text-orange-600 -left-12 whitespace-nowrap"
                          style={{ bottom: `${qberData.securityThreshold - 2}%` }}
                        >
                          {qberData.securityThreshold}% Threshold
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      QBER: <span className="font-bold">{qberData.qber.toFixed(2)}%</span> 
                      {qberData.isSecure ? ' (Below threshold - Secure)' : ' (Above threshold - Compromised)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {simulationData.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Key Efficiency</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.efficiency.toFixed(1)}%</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800">Error Rate</h4>
                <p className="text-2xl font-bold text-red-600">{stats.errorRate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Final Key Length</h4>
                <p className="text-2xl font-bold text-green-600">{stats.finalKeyLength} bits</p>
              </div>
            </div>
          )}
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
    const stats = calculateStats();
    
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <BarChart3 className="mr-3 text-indigo-600" />
            Experiment Report
          </h2>

          {experimentResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Run some experiments to generate reports!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Graph Section */}
              {qberData && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Experimental Graphs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* QBER vs Security Threshold Graph */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-center">QBER vs Security Threshold</h4>
                      <div className="relative h-48 flex items-end justify-center space-x-8">
                        <div className="flex flex-col items-center">
                          <div 
                            className="bg-blue-500 rounded-t w-12 transition-all duration-1000"
                            style={{ height: `${Math.min((qberData.qber / 20) * 100, 100)}%` }}
                          ></div>
                          <span className="text-xs mt-2">Current QBER<br/>{qberData.qber.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className="bg-orange-500 rounded-t w-12"
                            style={{ height: `${(qberData.securityThreshold / 20) * 100}%` }}
                          ></div>
                          <span className="text-xs mt-2">Threshold<br/>{qberData.securityThreshold}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Efficiency Graph */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-center">Key Generation Efficiency</h4>
                      <div className="relative h-48 flex items-end justify-center">
                        <div className="w-32 bg-gray-200 rounded">
                          <div 
                            className="bg-gradient-to-t from-green-500 to-green-400 rounded transition-all duration-1000"
                            style={{ height: `${qberData.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-center mt-2 text-sm">
                        Efficiency: <span className="font-bold">{qberData.efficiency.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aim */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-2">🎯 Aim</h3>
                <p className="text-gray-700">
                  To study the BB84 quantum key distribution protocol and analyze the effects of channel noise 
                  and eavesdropping on QBER (Quantum Bit Error Rate) and security.
                </p>
              </section>

              {/* Apparatus */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-green-500 pb-2">🔬 Apparatus</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Quantum photon source (Alice's transmitter)</li>
                  <li>• Polarization modulators (rectilinear and diagonal bases)</li>
                  <li>• Quantum channel (fiber optic communication link)</li>
                  <li>• Photon detectors with basis selection (Bob's receiver)</li>
                  <li>• Classical communication channel for basis comparison</li>
                  <li>• Noise simulation and eavesdropping detection system</li>
                </ul>
              </section>

              {/* Theory */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-purple-500 pb-2">📚 Theory</h3>
                <p className="text-gray-700 mb-4">
                  The BB84 protocol uses quantum mechanics principles to establish a secure cryptographic key. 
                  Alice (Transmitter) encodes random bits using photon polarization in randomly chosen bases. 
                  Bob (Receiver) measures these photons using randomly chosen bases. Due to quantum mechanics, 
                  measurements in the wrong basis yield random results.
                </p>
                <p className="text-gray-700">
                  Security is guaranteed by the no-cloning theorem and the measurement disturbance principle. 
                  Any eavesdropping attempt by Eve introduces detectable errors in the transmission.
                </p>
              </section>

              {/* Observations */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-red-500 pb-2">👁️ Observations</h3>
                {qberData ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">Experimental Results:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Total Qubits Transmitted:</strong> {qberData.totalBits}</p>
                        <p><strong>Matching Basis Count:</strong> {qberData.matchingBases}</p>
                        <p><strong>Error Count:</strong> {qberData.errors}</p>
                        <p><strong>QBER:</strong> {qberData.qber.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p><strong>Final Key Length:</strong> {qberData.finalKeyLength} bits</p>
                        <p><strong>Key Efficiency:</strong> {qberData.efficiency.toFixed(1)}%</p>
                        <p><strong>Security Status:</strong> 
                          <span className={qberData.isSecure ? 'text-green-600' : 'text-red-600'}>
                            {qberData.isSecure ? ' SECURE' : ' COMPROMISED'}
                          </span>
                        </p>
                        <p><strong>Estimated Eavesdropping:</strong> {qberData.estimatedEavesdropping.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">Run a simulation to see detailed observations and QBER analysis.</p>
                  </div>
                )}
              </section>

              {/* Conclusion */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-indigo-500 pb-2">🎓 Conclusion</h3>
                {qberData ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">
                      The BB84 protocol simulation demonstrates:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>QBER of {qberData.qber.toFixed(2)}% {qberData.isSecure ? 'indicates secure communication' : 'suggests potential eavesdropping'}</li>
                      <li>Key generation efficiency of {qberData.efficiency.toFixed(1)}% from {qberData.totalBits} transmitted qubits</li>
                      <li>{qberData.matchingBases} qubits had matching bases, yielding {qberData.finalKeyLength} secure key bits</li>
                      <li>
                        {qberData.isSecure 
                          ? 'The communication channel is secure for cryptographic use' 
                          : 'The high error rate indicates potential security compromise - key should be discarded'
                        }
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      Run a simulation to generate detailed conclusions based on experimental data and QBER analysis.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
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