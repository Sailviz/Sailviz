import { useState, useEffect } from 'react'

const StartSequence = ({ sequence }: { sequence: StartSequenceStep[] }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(sequence[0]?.time || 0)

    useEffect(() => {
        if (currentStep >= sequence.length) return

        const timer = setInterval(() => {
            if (timeRemaining > 0) {
                setTimeRemaining(prev => prev - 1)
            } else {
                clearInterval(timer)
                setCurrentStep(prev => prev + 1)
                setTimeRemaining(sequence[currentStep + 1]?.time || 0)
            }
        }, 1000) // Runs every second

        return () => clearInterval(timer) // Cleanup on unmount
    }, [timeRemaining, currentStep, sequence])

    return (
        <div>
            <h2>Start Sequence</h2>
            {currentStep < sequence.length ? (
                <p>
                    {sequence[currentStep]!.name}: {timeRemaining}s
                </p>
            ) : (
                <p>Go!</p>
            )}
        </div>
    )
}

export default StartSequence
