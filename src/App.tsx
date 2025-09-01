import React, { useState, useEffect } from 'react';
import { Key, Shield, Eye, RotateCcw, ChevronRight, ChevronLeft, Play, BarChart3 } from 'lucide-react';

interface BitData {
  bit: number;
  aliceBasis: number;
  bobBasis: number;
  polarization: string;
  bobMeasurement: number;
  isMatching: boolean;
  isNoisy: boolean;
  isIntercepted: boolean;
  basisVector: string;
  measurementBasisVector: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('theory');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Simulation parameters
  const [numQubits, setNumQubits] = useState(20);
  const [noiseLevel, setNoiseLevel] = useState(10);
  const [eavesdropping, setEavesdropping] = useState(0);
  
  // Step-by-step simulation state
  const [simulationData, setSimulationData] = useState<BitData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationPhase, setSimulationPhase] = useState('setup'); // setup, transmission, comparison, key
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  const quizQuestions = [
    {
      question: "What is the main purpose of quantum key distribution?",
      options: [
        "To send messages faster",
        "To create unbreakable encryption keys",
        "To reduce internet costs",
        "To improve computer speed"
      ],
      correct: 1,
      explanation: "Quantum key distribution creates encryption keys that are theoretically unbreakable due to quantum mechanics principles."
    },
    {
      question: "What happens when someone tries to intercept quantum information?",
      options: [
        "Nothing changes",
        "The message gets copied",
        "The quantum state gets disturbed",
        "The internet stops working"
      ],
      correct: 2,
      explanation: "Due to the quantum no-cloning theorem, any attempt to measure or copy quantum information disturbs the quantum state, alerting the communicating parties."
    },
    {
      question: "In BB84, what are the two types of measurement bases used?",
      options: [
        "Fast and slow",
        "Big and small",
        "Rectilinear and diagonal",
        "Left and right"
      ],
      correct: 2,
      explanation: "BB84 uses rectilinear basis (measuring horizontally/vertically) and diagonal basis (measuring at 45-degree angles)."
    },
    {
      question: "What is QBER in quantum cryptography?",
      options: [
        "Quantum Bit Error Rate - measures transmission errors",
        "Quick Bit Encryption Rate",
        "Quantum Base Error Reading",
        "Quality Bit Evaluation Ratio"
      ],
      correct: 0,
      explanation: "QBER (Quantum Bit Error Rate) measures the percentage of errors in the quantum key distribution, helping detect eavesdropping."
    },
    {
      question: "When is a quantum key considered secure?",
      options: [
        "When QBER is above 25%",
        "When QBER is below 11%",
        "When QBER is exactly 50%",
        "QBER doesn't matter for security"
      ],
      correct: 1,
      explanation: "A QBER below 11% is generally considered the security threshold for BB84. Higher error rates may indicate eavesdropping."
    }
  ];

  const generateSimulationData = () => {
    const data: BitData[] = [];
    
    for (let i = 0; i < numQubits; i++) {
      const bit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? 1 : 0; // 0: rectilinear, 1: diagonal
      const bobBasis = Math.random() > 0.5 ? 1 : 0;
      
      let bobMeasurement = bit;
      let isNoisy = false;
      let isIntercepted = false;
      
      // Apply eavesdropping
      if (Math.random() * 100 < eavesdropping) {
        isIntercepted = true;
        // Eve's measurement disturbs the state
        if (Math.random() > 0.5) {
          bobMeasurement = 1 - bit;
        }
      }
      
      // Apply noise only to matching bases
      if (aliceBasis === bobBasis && Math.random() * 100 < noiseLevel) {
        isNoisy = true;
        bobMeasurement = 1 - bit;
      }
      
      // Different basis means random measurement
      if (aliceBasis !== bobBasis) {
        bobMeasurement = Math.random() > 0.5 ? 1 : 0;
      }
      
      const getBasisVector = (bit: number, basis: number) => {
        if (basis === 0) { // Rectilinear
          return bit === 0 ? '|0⟩' : '|1⟩';
        } else { // Diagonal
          return bit === 0 ? '|+⟩' : '|-⟩';
        }
      };
      
      const getPolarization = (bit: number, basis: number) => {
        if (basis === 0) { // Rectilinear
          return bit === 0 ? '↑' : '→';
        } else { // Diagonal
          return bit === 0 ? '↗' : '↖';
        }
      };
      
      data.push({
        bit,
        aliceBasis,
        bobBasis,
        polarization: getPolarization(bit, aliceBasis),
        bobMeasurement,
        isMatching: aliceBasis === bobBasis,
        isNoisy,
        isIntercepted,
        basisVector: getBasisVector(bit, aliceBasis),
        measurementBasisVector: getBasisVector(bobMeasurement, bobBasis)
      });
    }
    
    return data;
  };

  const startSimulation = () => {
    const data = generateSimulationData();
    setSimulationData(data);
    setCurrentStep(0);
    setSimulationPhase('setup');
    setIsSimulationActive(true);
  };

  const nextStep = () => {
    if (simulationPhase === 'setup') {
      setSimulationPhase('transmission');
      setCurrentStep(0);
    } else if (simulationPhase === 'transmission') {
      if (currentStep < simulationData.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setSimulationPhase('comparison');
        setCurrentStep(0);
      }
    } else if (simulationPhase === 'comparison') {
      setSimulationPhase('key');
    }
  };

  const prevStep = () => {
    if (simulationPhase === 'transmission' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (simulationPhase === 'comparison') {
      setSimulationPhase('transmission');
      setCurrentStep(simulationData.length - 1);
    } else if (simulationPhase === 'key') {
      setSimulationPhase('comparison');
    }
  };

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setCurrentStep(0);
    setSimulationPhase('setup');
    setSimulationData([]);
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    let score = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizCompleted(true);
  };

  const calculateQBER = () => {
    const matchingBases = simulationData.filter(d => d.isMatching);
    if (matchingBases.length === 0) return 0;
    
    const errors = matchingBases.filter(d => d.isNoisy || d.isIntercepted).length;
    return (errors / matchingBases.length) * 100;
  };

  const getCurrentBit = () => simulationData[currentStep];
  const qber = calculateQBER();
  const isSecure = qber < 11;
  const finalKey = simulationData.filter(d => d.isMatching && !d.isNoisy && !d.isIntercepted);

  const renderTheorySection = () => (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Shield className="mr-3 text-blue-600" />
        BB84 Quantum Key Distribution Protocol
      </h2>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-semibold mb-3 text-blue-800">What is BB84?</h3>
          <p>
            BB84 is a quantum key distribution protocol that allows two parties (Alice and Bob) to create a shared secret key 
            that is guaranteed to be secure by the laws of quantum mechanics. Any attempt to eavesdrop will be detected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <h3 className="text-xl font-semibold mb-3 text-green-800">Key Concepts</h3>
            <ul className="space-y-2">
              <li><strong>Quantum States:</strong> Information encoded in photon polarizations</li>
              <li><strong>Measurement Bases:</strong> Rectilinear (↑→) and Diagonal (↗↖)</li>
              <li><strong>No-Cloning:</strong> Quantum states cannot be perfectly copied</li>
              <li><strong>QBER:</strong> Quantum Bit Error Rate indicates security</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold mb-3 text-purple-800">Protocol Steps</h3>
            <ol className="space-y-2">
              <li><strong>1.</strong> Alice encodes bits using random bases</li>
              <li><strong>2.</strong> Bob measures using random bases</li>
              <li><strong>3.</strong> They compare bases publicly</li>
              <li><strong>4.</strong> Keep bits where bases match</li>
              <li><strong>5.</strong> Check for eavesdropping via QBER</li>
            </ol>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="text-xl font-semibold mb-3 text-yellow-800">Security Guarantee</h3>
          <p>
            The security of BB84 comes from quantum mechanics: any eavesdropper (Eve) must measure the quantum states 
            to gain information, but this measurement disturbs the states and introduces detectable errors. If the 
            Quantum Bit Error Rate (QBER) exceeds 11%, the key is discarded as potentially compromised.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPreQuizSection = () => (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <BarChart3 className="mr-3 text-purple-600" />
        Pre-Simulation Quiz
      </h2>
      
      {!quizCompleted ? (
        <div className="space-y-6">
          <p className="text-gray-600 mb-6">
            Test your understanding before starting the simulation. Answer all questions to proceed.
          </p>
          
          {quizQuestions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {qIndex + 1}. {q.question}
              </h3>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => (
                  <label key={oIndex} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={oIndex}
                      onChange={() => handleQuizAnswer(qIndex, oIndex)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          <button
            onClick={submitQuiz}
            disabled={quizAnswers.length !== quizQuestions.length}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Quiz Completed! Score: {quizScore}/{quizQuestions.length}
            </h3>
            <p className="text-green-700">
              {quizScore >= 4 ? "Excellent! You're ready for the simulation." : "Good effort! Review the theory and try the simulation."}
            </p>
          </div>
          
          <div className="space-y-4">
            {quizQuestions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg text-left">
                <p className="font-semibold text-gray-800 mb-2">{index + 1}. {q.question}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Your answer: <span className={quizAnswers[index] === q.correct ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {q.options[quizAnswers[index]]}
                  </span>
                </p>
                <p className="text-sm text-blue-600">{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSimulationSection = () => (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Key className="mr-3 text-green-600" />
        BB84 Step-by-Step Simulation
      </h2>

      {/* Simulation Controls */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Simulation Parameters</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Qubits: {numQubits}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={numQubits}
              onChange={(e) => setNumQubits(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isSimulationActive}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Noise Level: {noiseLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isSimulationActive}
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
              disabled={isSimulationActive}
            />
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={startSimulation}
            disabled={isSimulationActive}
            className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Play className="mr-2 w-4 h-4" />
            Start Simulation
          </button>
          <button
            onClick={resetSimulation}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Step-by-Step Simulation */}
      {isSimulationActive && (
        <div className="space-y-6">
          {/* Phase Indicator */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">
                {simulationPhase === 'setup' && 'Phase 1: Protocol Setup'}
                {simulationPhase === 'transmission' && `Phase 2: Bit Transmission (${currentStep + 1}/${simulationData.length})`}
                {simulationPhase === 'comparison' && 'Phase 3: Basis Comparison'}
                {simulationPhase === 'key' && 'Phase 4: Final Key & Analysis'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  disabled={simulationPhase === 'setup' || (simulationPhase === 'transmission' && currentStep === 0)}
                  className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextStep}
                  disabled={simulationPhase === 'key'}
                  className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Setup Phase */}
          {simulationPhase === 'setup' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Protocol Initialization</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Alice (Sender)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Generates {numQubits} random bits</li>
                    <li>• Chooses random measurement bases</li>
                    <li>• Encodes bits as quantum states</li>
                    <li>• Sends photons to Bob</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Bob (Receiver)</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Chooses random measurement bases</li>
                    <li>• Measures incoming photons</li>
                    <li>• Records measurement results</li>
                    <li>• Waits for basis comparison</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Environment:</strong> Noise Level: {noiseLevel}%, Eavesdropping: {eavesdropping}%
                </p>
              </div>
            </div>
          )}

          {/* Transmission Phase */}
          {simulationPhase === 'transmission' && getCurrentBit() && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Bit Transmission #{currentStep + 1}
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Alice's Side */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                    Alice Prepares
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bit Value:</span>
                      <span className="font-mono font-bold text-lg">{getCurrentBit().bit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chosen Basis:</span>
                      <span className="font-mono">{getCurrentBit().aliceBasis === 0 ? 'Rectilinear' : 'Diagonal'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Basis Vector:</span>
                      <span className="font-mono text-lg font-bold text-blue-600">{getCurrentBit().basisVector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Polarization:</span>
                      <span className="text-2xl">{getCurrentBit().polarization}</span>
                    </div>
                  </div>
                </div>

                {/* Quantum Channel */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                  <h4 className="font-semibold text-gray-800 mb-3">Quantum Channel</h4>
                  <div className="text-4xl mb-2">📡</div>
                  <div className="text-center text-sm text-gray-600">
                    <div>Photon traveling...</div>
                    {getCurrentBit().isIntercepted && (
                      <div className="text-red-600 font-semibold mt-1">
                        <Eye className="w-4 h-4 inline mr-1" />
                        Intercepted by Eve!
                      </div>
                    )}
                    {getCurrentBit().isNoisy && (
                      <div className="text-yellow-600 font-semibold mt-1">
                        ⚡ Noise detected
                      </div>
                    )}
                  </div>
                </div>

                {/* Bob's Side */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                    Bob Measures
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Chosen Basis:</span>
                      <span className="font-mono">{getCurrentBit().bobBasis === 0 ? 'Rectilinear' : 'Diagonal'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Measurement Vector:</span>
                      <span className="font-mono text-lg font-bold text-purple-600">{getCurrentBit().measurementBasisVector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Measured Bit:</span>
                      <span className="font-mono font-bold text-lg">{getCurrentBit().bobMeasurement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bases Match:</span>
                      <span className={`font-semibold ${getCurrentBit().isMatching ? 'text-green-600' : 'text-red-600'}`}>
                        {getCurrentBit().isMatching ? 'Yes ✓' : 'No ✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Step Analysis</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Encoding:</strong> Alice encodes bit {getCurrentBit().bit} using {getCurrentBit().aliceBasis === 0 ? 'rectilinear' : 'diagonal'} basis 
                    as quantum state {getCurrentBit().basisVector} with polarization {getCurrentBit().polarization}
                  </p>
                  <p>
                    <strong>Measurement:</strong> Bob measures using {getCurrentBit().bobBasis === 0 ? 'rectilinear' : 'diagonal'} basis 
                    and gets result {getCurrentBit().bobMeasurement}
                  </p>
                  <p>
                    <strong>Outcome:</strong> 
                    {getCurrentBit().isMatching ? (
                      <span className="text-green-600 font-semibold"> Bases match - bit will be kept for final key</span>
                    ) : (
                      <span className="text-red-600"> Bases don't match - bit will be discarded</span>
                    )}
                  </p>
                  {(getCurrentBit().isNoisy || getCurrentBit().isIntercepted) && (
                    <p className="text-red-600 font-semibold">
                      <strong>Security Alert:</strong> 
                      {getCurrentBit().isIntercepted && ' Eavesdropping detected!'}
                      {getCurrentBit().isNoisy && ' Transmission noise detected!'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comparison Phase */}
          {simulationPhase === 'comparison' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Basis Comparison</h3>
              <p className="text-gray-600 mb-4">
                Alice and Bob publicly compare their measurement bases and keep only the bits where bases matched.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Bit #</th>
                      <th className="border border-gray-300 p-2">Alice's Bit</th>
                      <th className="border border-gray-300 p-2">Alice's Basis</th>
                      <th className="border border-gray-300 p-2">Alice's Vector</th>
                      <th className="border border-gray-300 p-2">Bob's Basis</th>
                      <th className="border border-gray-300 p-2">Bob's Vector</th>
                      <th className="border border-gray-300 p-2">Bob's Result</th>
                      <th className="border border-gray-300 p-2">Keep?</th>
                      <th className="border border-gray-300 p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationData.map((bit, index) => (
                      <tr key={index} className={bit.isMatching ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="border border-gray-300 p-2 text-center font-mono">{index + 1}</td>
                        <td className="border border-gray-300 p-2 text-center font-mono font-bold">{bit.bit}</td>
                        <td className="border border-gray-300 p-2 text-center">{bit.aliceBasis === 0 ? 'Rect' : 'Diag'}</td>
                        <td className="border border-gray-300 p-2 text-center font-mono text-blue-600 font-bold">{bit.basisVector}</td>
                        <td className="border border-gray-300 p-2 text-center">{bit.bobBasis === 0 ? 'Rect' : 'Diag'}</td>
                        <td className="border border-gray-300 p-2 text-center font-mono text-purple-600 font-bold">{bit.measurementBasisVector}</td>
                        <td className="border border-gray-300 p-2 text-center font-mono font-bold">{bit.bobMeasurement}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          {bit.isMatching ? (
                            <span className="text-green-600 font-semibold">✓ Yes</span>
                          ) : (
                            <span className="text-red-600">✗ No</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center text-xs">
                          {bit.isIntercepted && <span className="text-red-600">🕵️ Eve</span>}
                          {bit.isNoisy && <span className="text-yellow-600">⚡ Noise</span>}
                          {!bit.isIntercepted && !bit.isNoisy && <span className="text-green-600">✓ Clean</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Key Phase */}
          {simulationPhase === 'key' && (
            <div className="space-y-6">
              {/* QBER Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">QBER Analysis & Security Assessment</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Key Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Qubits Sent:</span>
                          <span className="font-mono">{simulationData.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Matching Bases:</span>
                          <span className="font-mono">{simulationData.filter(d => d.isMatching).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Errors Detected:</span>
                          <span className="font-mono">{simulationData.filter(d => d.isMatching && (d.isNoisy || d.isIntercepted)).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Final Key Length:</span>
                          <span className="font-mono">{finalKey.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isSecure ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <h4 className={`font-semibold mb-2 ${isSecure ? 'text-green-800' : 'text-red-800'}`}>
                        Security Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>QBER:</span>
                          <span className={`font-mono font-bold ${isSecure ? 'text-green-600' : 'text-red-600'}`}>
                            {qber.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Threshold:</span>
                          <span className="font-mono">11.00%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-semibold ${isSecure ? 'text-green-600' : 'text-red-600'}`}>
                            {isSecure ? '🔒 SECURE' : '⚠️ COMPROMISED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QBER Graph */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4">QBER vs Security Threshold</h4>
                    <div className="relative h-32 bg-white rounded border">
                      <div className="absolute inset-0 p-4">
                        <div className="h-full flex items-end justify-center space-x-8">
                          {/* QBER Bar */}
                          <div className="flex flex-col items-center">
                            <div 
                              className={`w-12 rounded-t transition-all duration-1000 ${isSecure ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ height: `${Math.min(qber * 3, 100)}%` }}
                            ></div>
                            <span className="text-xs mt-1 font-mono">{qber.toFixed(1)}%</span>
                            <span className="text-xs text-gray-600">QBER</span>
                          </div>
                          
                          {/* Threshold Line */}
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-12 bg-orange-400 rounded-t"
                              style={{ height: '33%' }}
                            ></div>
                            <span className="text-xs mt-1 font-mono">11.0%</span>
                            <span className="text-xs text-gray-600">Threshold</span>
                          </div>
                        </div>
                        
                        {/* Threshold line across graph */}
                        <div 
                          className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400"
                          style={{ bottom: '33%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Key Display */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Generated Secure Key</h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="font-mono text-lg break-all">
                    {finalKey.length > 0 ? (
                      finalKey.map(bit => bit.bit).join('')
                    ) : (
                      <span className="text-red-600">No secure key generated - QBER too high!</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Key Length: {finalKey.length} bits | Efficiency: {((finalKey.length / simulationData.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Experiment Report */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Experiment Report</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Aim:</h4>
                    <p className="text-gray-700">
                      To demonstrate the BB84 quantum key distribution protocol and analyze its security through QBER measurement.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Apparatus:</h4>
                    <p className="text-gray-700">
                      Virtual quantum communication simulator with {numQubits} qubits, noise level {noiseLevel}%, eavesdropping level {eavesdropping}%.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Theory:</h4>
                    <p className="text-gray-700">
                      BB84 protocol uses quantum mechanics principles to detect eavesdropping. The security is based on the quantum no-cloning theorem 
                      and the fact that measurement disturbs quantum states.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Observations:</h4>
                    <ul className="text-gray-700 space-y-1 ml-4">
                      <li>• Total qubits transmitted: {simulationData.length}</li>
                      <li>• Matching bases: {simulationData.filter(d => d.isMatching).length}</li>
                      <li>• QBER measured: {qber.toFixed(2)}%</li>
                      <li>• Final key length: {finalKey.length} bits</li>
                      <li>• Key generation efficiency: {((finalKey.length / simulationData.length) * 100).toFixed(1)}%</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Conclusion:</h4>
                    <p className="text-gray-700">
                      {isSecure ? (
                        `The quantum key distribution was successful with QBER of ${qber.toFixed(2)}% below the security threshold of 11%. 
                        The generated key of ${finalKey.length} bits can be considered secure for cryptographic use.`
                      ) : (
                        `The quantum key distribution detected potential eavesdropping with QBER of ${qber.toFixed(2)}% above the security threshold. 
                        The key should be discarded and the protocol restarted.`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Help */}
          <div className="text-center text-sm text-gray-500">
            Use the arrow buttons to navigate through the simulation steps
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KeyGenie: BB84 Magic
                </h1>
                <p className="text-lg text-gray-600 mt-2">Quantum Communication Simulator</p>
              </div>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">Department of Electronics and Telecommunication</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'theory', label: 'Theory', icon: Shield },
              { id: 'prequiz', label: 'Pre-Quiz', icon: BarChart3 },
              { id: 'simulation', label: 'Simulation', icon: Key }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'theory' && renderTheorySection()}
        {activeTab === 'prequiz' && renderPreQuizSection()}
        {activeTab === 'simulation' && renderSimulationSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-300">
            © 2025 Department of Electronics and Telecommunication | Quantum Cryptography Virtual Laboratory
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;