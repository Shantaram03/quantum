import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Eye, Radio, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [aliceBits, setAliceBits] = useState<number[]>([]);
  const [aliceBases, setAliceBases] = useState<number[]>([]);
  const [bobBases, setBobBases] = useState<number[]>([]);
  const [bobMeasurements, setBobMeasurements] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationPhase, setSimulationPhase] = useState<'setup' | 'transmission' | 'comparison' | 'results'>('setup');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isStepMode, setIsStepMode] = useState(true);

  const basisVectors = {
    0: { name: 'Rectilinear', vectors: ['|0⟩', '|1⟩'], polarizations: ['↑', '→'] },
    1: { name: 'Diagonal', vectors: ['|+⟩', '|-⟩'], polarizations: ['↗', '↖'] }
  };

  const generateSimulationData = () => {
    const bits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2));
    const aliceBasisChoices = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2));
    const bobBasisChoices = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2));
    
    const measurements = bits.map((bit, i) => {
      if (aliceBasisChoices[i] === bobBasisChoices[i]) {
        return Math.random() < 0.1 ? 1 - bit : bit; // 10% error rate
      } else {
        return Math.floor(Math.random() * 2); // Random for different bases
      }
    });

    setAliceBits(bits);
    setAliceBases(aliceBasisChoices);
    setBobBases(bobBasisChoices);
    setBobMeasurements(measurements);
    setCurrentStep(0);
    setSimulationPhase('transmission');
  };

  const nextStep = async () => {
    if (simulationPhase === 'setup') {
      generateSimulationData();
      return;
    }

    if (simulationPhase === 'transmission') {
      if (currentStep < aliceBits.length - 1) {
        setIsTransmitting(true);
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setIsTransmitting(false);
        }, 1000);
      } else {
        setSimulationPhase('comparison');
      }
    } else if (simulationPhase === 'comparison') {
      setSimulationPhase('results');
    }
  };

  const prevStep = () => {
    if (simulationPhase === 'transmission' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSimulation = () => {
    setSimulationPhase('setup');
    setCurrentStep(0);
    setAliceBits([]);
    setAliceBases([]);
    setBobBases([]);
    setBobMeasurements([]);
  };

  const runQuickSimulation = () => {
    generateSimulationData();
    setSimulationPhase('results');
  };

  const calculateQBER = () => {
    if (aliceBits.length === 0) return 0;
    
    let matchingBases = 0;
    let errors = 0;
    
    for (let i = 0; i < aliceBits.length; i++) {
      if (aliceBases[i] === bobBases[i]) {
        matchingBases++;
        if (aliceBits[i] !== bobMeasurements[i]) {
          errors++;
        }
      }
    }
    
    return matchingBases > 0 ? (errors / matchingBases) * 100 : 0;
  };

  const getFinalKey = () => {
    const key: number[] = [];
    for (let i = 0; i < aliceBits.length; i++) {
      if (aliceBases[i] === bobBases[i] && aliceBits[i] === bobMeasurements[i]) {
        key.push(aliceBits[i]);
      }
    }
    return key;
  };

  const getCurrentBit = () => {
    if (simulationPhase !== 'transmission' || aliceBits.length === 0) return null;
    return {
      bit: aliceBits[currentStep],
      aliceBasis: aliceBases[currentStep],
      bobBasis: bobBases[currentStep],
      measurement: bobMeasurements[currentStep],
      basesMatch: aliceBases[currentStep] === bobBases[currentStep]
    };
  };

  const currentBit = getCurrentBit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">KeyGenie: BB84 Magic</h1>
                <p className="text-sm text-gray-600">Department of Electronics and Telecommunication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Theory Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Understanding Quantum Communication</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Classical vs Quantum Bits */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Classical Bit Transmission</span>
              </h3>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    Alice
                  </div>
                  <div className="flex-1 mx-4 relative">
                    <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-600 font-mono">
                      1 0 1 1 0 1 0 0
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Eye className="w-6 h-6 text-red-500 animate-bounce" />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    Bob
                  </div>
                </div>
                <p className="text-center text-gray-700 text-sm">
                  ⚠️ Can be intercepted and copied without detection
                </p>
              </div>
            </div>

            {/* Quantum Channel */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-purple-600 flex items-center space-x-2">
                <Radio className="w-5 h-5" />
                <span>Quantum Channel</span>
              </h3>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    Alice
                  </div>
                  <div className="flex-1 mx-4 relative">
                    <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-600 font-mono">
                      |0⟩ |+⟩ |-⟩ |1⟩ |0⟩ |+⟩
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Shield className="w-6 h-6 text-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    Bob
                  </div>
                </div>
                <p className="text-center text-gray-700 text-sm">
                  ✅ Any interception disturbs quantum states - detectable!
                </p>
              </div>
            </div>
          </div>

          {/* Basis Vectors Explanation */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-4">BB84 Basis Vectors:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-blue-600">Rectilinear Basis (+)</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">|0⟩</span>
                    <span className="text-2xl">↑</span>
                    <span className="text-gray-600">Vertical polarization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">|1⟩</span>
                    <span className="text-2xl">→</span>
                    <span className="text-gray-600">Horizontal polarization</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-purple-600">Diagonal Basis (×)</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono bg-purple-100 px-2 py-1 rounded">|+⟩</span>
                    <span className="text-2xl">↗</span>
                    <span className="text-gray-600">45° polarization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono bg-purple-100 px-2 py-1 rounded">|-⟩</span>
                    <span className="text-2xl">↖</span>
                    <span className="text-gray-600">135° polarization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">BB84 Protocol Simulation</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isStepMode}
                  onChange={(e) => setIsStepMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Step-by-step mode</span>
              </label>
              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {simulationPhase === 'setup' && (
            <div className="text-center py-12">
              <div className="mb-6">
                <Radio className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Start BB84 Simulation</h3>
                <p className="text-gray-600">
                  {isStepMode ? 'Step through each bit transmission' : 'Run complete simulation instantly'}
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                {isStepMode ? (
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Step-by-Step</span>
                  </button>
                ) : (
                  <button
                    onClick={runQuickSimulation}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Quick Run</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step-by-step transmission */}
          {simulationPhase === 'transmission' && isStepMode && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Transmission Progress</span>
                  <span className="text-sm text-gray-600">{currentStep + 1} / {aliceBits.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / aliceBits.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Bit Transmission */}
              {currentBit && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200">
                  <h3 className="text-xl font-semibold text-center mb-6">
                    Transmitting Bit #{currentStep + 1}
                  </h3>
                  
                  {/* Alice and Bob with Quantum Channel */}
                  <div className="flex items-center justify-between mb-8">
                    {/* Alice */}
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        Alice
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="text-sm text-gray-600 mb-2">Preparing:</div>
                        <div className="text-lg font-mono">
                          Bit: <span className="font-bold text-blue-600">{currentBit.bit}</span>
                        </div>
                        <div className="text-lg font-mono">
                          Basis: <span className="font-bold text-blue-600">{basisVectors[currentBit.aliceBasis].name}</span>
                        </div>
                        <div className="text-lg font-mono">
                          State: <span className="font-bold text-blue-600">
                            {basisVectors[currentBit.aliceBasis].vectors[currentBit.bit]}
                          </span>
                        </div>
                        <div className="text-2xl text-center mt-2">
                          {basisVectors[currentBit.aliceBasis].polarizations[currentBit.bit]}
                        </div>
                      </div>
                    </div>

                    {/* Quantum Channel */}
                    <div className="flex-1 mx-8 relative">
                      <div className="h-4 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full relative overflow-hidden">
                        {isTransmitting && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-sm text-gray-600">Quantum Channel</span>
                        {isTransmitting && (
                          <div className="text-xs text-purple-600 animate-pulse">Transmitting photon...</div>
                        )}
                      </div>
                      
                      {/* Photon animation */}
                      {isTransmitting && (
                        <div className="absolute top-1 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                      )}
                    </div>

                    {/* Bob */}
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        Bob
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="text-sm text-gray-600 mb-2">Measuring with:</div>
                        <div className="text-lg font-mono">
                          Basis: <span className="font-bold text-purple-600">{basisVectors[currentBit.bobBasis].name}</span>
                        </div>
                        <div className="text-lg font-mono">
                          Result: <span className="font-bold text-purple-600">{currentBit.measurement}</span>
                        </div>
                        <div className={`text-sm mt-2 px-2 py-1 rounded ${
                          currentBit.basesMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {currentBit.basesMatch ? '✓ Bases Match' : '✗ Bases Differ'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Analysis */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">Step Analysis:</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>1. Preparation:</strong> Alice encodes bit {currentBit.bit} using {basisVectors[currentBit.aliceBasis].name} basis as state {basisVectors[currentBit.aliceBasis].vectors[currentBit.bit]}
                      </p>
                      <p>
                        <strong>2. Transmission:</strong> Photon with polarization {basisVectors[currentBit.aliceBasis].polarizations[currentBit.bit]} sent through quantum channel
                      </p>
                      <p>
                        <strong>3. Measurement:</strong> Bob measures using {basisVectors[currentBit.bobBasis].name} basis and gets {currentBit.measurement}
                      </p>
                      <p className={currentBit.basesMatch ? 'text-green-700' : 'text-red-700'}>
                        <strong>4. Result:</strong> {currentBit.basesMatch 
                          ? `Bases match! This bit ${currentBit.bit === currentBit.measurement ? 'will be kept' : 'shows channel error'}`
                          : 'Bases differ - this bit will be discarded during sifting'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <span className="text-gray-600">
                  Step {currentStep + 1} of {aliceBits.length}
                </span>
                
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <span>{currentStep === aliceBits.length - 1 ? 'Analyze Results' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Results Phase */}
          {simulationPhase === 'results' && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{aliceBits.length}</div>
                  <div className="text-sm text-gray-600">Total Bits Sent</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {aliceBits.filter((_, i) => aliceBases[i] === bobBases[i]).length}
                  </div>
                  <div className="text-sm text-gray-600">Matching Bases</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{getFinalKey().length}</div>
                  <div className="text-sm text-gray-600">Final Key Length</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">{calculateQBER().toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">QBER</div>
                </div>
              </div>

              {/* Detailed Results Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Transmission Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bit #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alice's Bit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alice's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantum State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Polarization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bob's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bob's Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {aliceBits.map((bit, index) => {
                        const basesMatch = aliceBases[index] === bobBases[index];
                        const bitsMatch = bit === bobMeasurements[index];
                        const isError = basesMatch && !bitsMatch;
                        
                        return (
                          <tr key={index} className={`hover:bg-gray-50 ${
                            index === currentStep && simulationPhase === 'transmission' ? 'bg-indigo-50' : ''
                          }`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{bit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded text-xs ${
                                aliceBases[index] === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {basisVectors[aliceBases[index]].name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {basisVectors[aliceBases[index]].vectors[bit]}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center text-xl">
                              {basisVectors[aliceBases[index]].polarizations[bit]}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded text-xs ${
                                bobBases[index] === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {basisVectors[bobBases[index]].name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{bobMeasurements[index]}</td>
                            <td className="px-4 py-3 text-sm">
                              {!basesMatch ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Discard</span>
                              ) : isError ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Error</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Keep</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <span>{currentStep === aliceBits.length - 1 ? 'Analyze Results' : 'Next Bit'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick simulation results */}
          {simulationPhase === 'results' && !isStepMode && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{aliceBits.length}</div>
                  <div className="text-sm text-gray-600">Total Bits Sent</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {aliceBits.filter((_, i) => aliceBases[i] === bobBases[i]).length}
                  </div>
                  <div className="text-sm text-gray-600">Matching Bases</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{getFinalKey().length}</div>
                  <div className="text-sm text-gray-600">Final Key Length</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600">{calculateQBER().toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">QBER</div>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Complete Transmission Results</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bit #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alice's Bit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alice's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantum State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Polarization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bob's Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bob's Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {aliceBits.map((bit, index) => {
                        const basesMatch = aliceBases[index] === bobBases[index];
                        const bitsMatch = bit === bobMeasurements[index];
                        const isError = basesMatch && !bitsMatch;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{bit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded text-xs ${
                                aliceBases[index] === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {basisVectors[aliceBases[index]].name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {basisVectors[aliceBases[index]].vectors[bit]}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center text-xl">
                              {basisVectors[aliceBases[index]].polarizations[bit]}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded text-xs ${
                                bobBases[index] === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {basisVectors[bobBases[index]].name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">{bobMeasurements[index]}</td>
                            <td className="px-4 py-3 text-sm">
                              {!basesMatch ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Discard</span>
                              ) : isError ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Error</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Keep</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Final Analysis */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Final Shared Key:</h4>
                    <div className="bg-white p-4 rounded-lg font-mono text-lg">
                      {getFinalKey().join('')}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Security Status:</h4>
                    <div className={`p-4 rounded-lg ${
                      calculateQBER() <= 11 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {calculateQBER() <= 11 ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Secure - QBER within acceptable threshold</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5" />
                          <span>Insecure - QBER too high, possible eavesdropping</span>
                        </div>
                      )}
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

export default App;