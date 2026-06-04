import { getFiveStartSequence, getThreeStartSequence } from '@components/helpers/startSequence'
import { useState, useEffect } from 'react'
import * as Types from '@sailviz/types'
interface RaceTimerProps {
    startTime?: number // Unix timestamp when race starts
    race: Types.RaceType
    onFlagChange: (flag: FlagStatusType[], next: FlagStatusType[]) => void
    onHoot: (time: number) => void
    onSequenceEnd: () => void
    onWarning: () => void
    onFleetStart: (fleetSettingsId: string) => void
    onFleetCountdownStart: (fleetId: string) => void
    timerActive: boolean
    reset: boolean
    onTimeUpdate: (time: number) => void
}

const RaceTimer: React.FC<RaceTimerProps> = ({
    race,
    startTime,
    onFlagChange,
    onHoot,
    onSequenceEnd,
    onWarning,
    onFleetStart,
    onFleetCountdownStart,
    timerActive,
    reset,
    onTimeUpdate
}) => {
    let largestStep = 0
    switch (race.series!.startSequence) {
        case '541go':
            largestStep = 5 * 60 + 15
            break
        case '321go':
            largestStep = 75 //3 * 60 + 15
    }

    race.fleets.sort((a, b) => a.startTime - b.startTime)

    const [sequenceSteps, setSequenceSteps] = useState<StartSequenceStep[]>(
        race.series?.startSequence === '541go' ? getFiveStartSequence(race.fleets[0].id) : getThreeStartSequence(race.fleets[0].id)
    )

    // Initialize timeLeft with the largest step time
    const [timeLeft, setTimeLeft] = useState({ time: largestStep, countingUp: false })
    // Initialize currentStep to the highest order in the sequence
    const [currentStep, setCurrentStep] = useState<StartSequenceStep>(sequenceSteps[1]!) // Assuming the first step is always the initial step
    const [warningCompleted, setWarningCompleted] = useState(false)
    const [sequenceFinished, setSequenceFinished] = useState(false)
    const [fleetOffset, setFleetOffset] = useState(0)

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
            if (currentStep.time + 6 >= Math.abs(time.time - fleetOffset) && warningCompleted === false && !sequenceFinished) {
                onWarning()
                setWarningCompleted(true)
            }
            // Check if any sequence step matches the current time
            if (currentStep.time + 1 >= Math.abs(time.time - fleetOffset) && !sequenceFinished) {
                if (currentStep.hoot > 0) {
                    onHoot(currentStep.hoot)
                }
                if (currentStep.fleetStart) {
                    onFleetStart(currentStep.fleetStart)
                }
                const nextStep = sequenceSteps.find(step => step.order == currentStep.order + 1)
                if (nextStep) {
                    onFlagChange(currentStep.flagStatus, nextStep.flagStatus)
                    console.log(`Current step: ${JSON.stringify(currentStep)}, Next step: ${nextStep ? JSON.stringify(nextStep) : 'None'}`)
                    setCurrentStep(nextStep)
                    setWarningCompleted(false)
                } else {
                    const currentTime = new Date().getTime() / 1000
                    const nextFleet = race.fleets.find(fleet => fleet.startTime > currentTime + 20) // add buffer to ensure we don't accidently grab the current fleet
                    if (nextFleet == undefined) {
                        console.log('No more fleets to start, finishing sequence')
                        setSequenceFinished(true)
                        onSequenceEnd()
                        return
                    }
                    const newSequenceSteps = race.series?.startSequence === '541go' ? getFiveStartSequence(nextFleet.id) : getThreeStartSequence(nextFleet.id)
                    console.log('New sequence steps', newSequenceSteps)
                    setSequenceSteps(newSequenceSteps)
                    const nextStep = newSequenceSteps[2]
                    console.log('Next step', nextStep)
                    setCurrentStep(nextStep)
                    const numberFleetsStarted = race.fleets.filter(fleet => fleet.startTime < currentTime + 20).length
                    const newFleetOffset = race.series!.startSequence === '541go' ? 5 * 60 * numberFleetsStarted : 1 * 60 * numberFleetsStarted
                    setFleetOffset(newFleetOffset)
                    onFleetCountdownStart(nextFleet.id)

                    setWarningCompleted(false)
                }
            }
            // Add a prop to pass the updated time to the parent component
            onTimeUpdate(time.time)
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
