import { useState, useEffect } from 'react'
interface RaceTimerProps {
    sequence: StartSequenceStep[]
    startTime?: number // Unix timestamp when race starts
    onFlagChange: (flag: FlagStatusType[], next: FlagStatusType[]) => void
    onHoot: (time: number) => void
    onSequenceEnd: () => void
    onWarning: () => void
    onFleetStart: (fleetSettingsId: string) => void
    timerActive: boolean
    reset: boolean
}

const RaceTimer: React.FC<RaceTimerProps> = ({ sequence, startTime, onFlagChange, onHoot, onSequenceEnd, onWarning, onFleetStart, timerActive, reset }) => {
    const largestStep = sequence.reduce((max, step) => (step.time > max ? step.time : max), 0) // Find the largest time in the sequence

    // Initialize timeLeft with the largest step time
    const [timeLeft, setTimeLeft] = useState({ time: largestStep, countingUp: false })
    // Initialize currentStep to the highest order in the sequence
    const [currentStep, setCurrentStep] = useState<StartSequenceStep>(sequence[1]!) // Assuming the first step is always the initial step
    const [warningCompleted, setWarningCompleted] = useState(false)
    const [sequenceFinished, setSequenceFinished] = useState(false)

    const calculateTimeLeft = () => {
        let countingUp = false
        let difference = (startTime || 0) - new Date().getTime() / 1000
        if (difference < 0) {
            difference = Math.abs(difference)
            countingUp = true
        }
        let time = {
            time: difference,
            countingUp: countingUp
        }

        return time
    }

    useEffect(() => {
        if (!timerActive) return
        const timer = setTimeout(() => {
            //this is offset by 1 second to account for rounding issues
            const time = calculateTimeLeft()
            setTimeLeft(time)
            //warning signals
            if (currentStep.time + 6 >= time.time && warningCompleted === false && !sequenceFinished) {
                onWarning()
                setWarningCompleted(true)
            }
            // Check if any sequence step matches the current time
            if (currentStep.time + 1 >= time.time && !sequenceFinished) {
                if (currentStep.hoot > 0) {
                    onHoot(currentStep.hoot)
                }
                if (currentStep.fleetStart) {
                    onFleetStart(currentStep.fleetStart)
                }
                const nextStep = sequence.find(step => step.order == currentStep.order + 1)
                onFlagChange(currentStep.flagStatus, nextStep?.flagStatus!)
                console.log(`Current step: ${JSON.stringify(currentStep)}, Next step: ${nextStep ? JSON.stringify(nextStep) : 'None'}`)
                if (nextStep) {
                    setCurrentStep(nextStep)
                    setWarningCompleted(false)
                } else {
                    setSequenceFinished(true)
                    onSequenceEnd()
                }
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [timerActive, timeLeft, startTime])

    useEffect(() => {
        if (reset) {
            setTimeLeft({ time: largestStep, countingUp: false })
        }
    }, [reset])

    return (
        <>{`${timeLeft.countingUp ? '+' : '-'}${Math.floor(timeLeft.time / 60)
            .toString()
            .padStart(2, '00')}:${Math.floor(timeLeft.time % 60) // Ensure seconds are rounded up, looks nicer
            .toString()
            .padStart(2, '00')}`}</>
    )
}

export default RaceTimer
