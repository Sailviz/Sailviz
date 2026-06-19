import { getFiveStartSequence, getThreeStartSequence } from '@components/helpers/startSequence'
import { useState, useEffect } from 'react'
import * as Types from '@sailviz/types'

enum raceStateType {
    running,
    sequenceHold,
    stopped,
    reset,
    calculate,
    retire
}

interface RaceTimerProps {
    startTime?: number // Unix timestamp when race starts
    race: Types.RaceType
    onFlagChange: (flag: FlagStatusType[], next: FlagStatusType[]) => void
    onHoot: (time: number) => void
    onSequenceEnd: () => void
    onWarning: () => void
    onFleetStart: (fleetSettingsId: string) => void
    onFleetCountdownStart: (fleetId: string) => void
    raceState: raceStateType
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
    raceState,
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
    const [pendingChanges, setPendingChanges] = useState(false)

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
        if (raceState != raceStateType.running) return
        race.fleets.sort((a, b) => a.startTime - b.startTime)
        console.log(race.fleets)
        const currentTime = new Date().getTime() / 1000

        const nextFleet = race.fleets.find(fleet => fleet.startTime > currentTime)
        if (!nextFleet) {
            console.log('No upcoming fleets, finishing sequence')
            setSequenceFinished(true)
            return
        }
        console.log('Starting fleet ' + nextFleet.fleetSettings.name)
        console.log('starting at ' + new Date(nextFleet.startTime * 1000).toLocaleString())
        console.log('current time ' + new Date(currentTime * 1000).toLocaleString())
        onFleetCountdownStart(nextFleet.id)
        const steps = race.series?.startSequence === '541go' ? getFiveStartSequence(nextFleet.id) : getThreeStartSequence(nextFleet.id)
        setSequenceSteps(steps)
        setCurrentStep(steps[1]!) // Assuming the first step is always the initial step
        if (pendingChanges) {
            //calculate the offset from the race start
            const now = new Date().getTime() / 1000
            const offset = timeLeft.time + 15 + (race.series!.startSequence === '541go' ? 5 * 60 : 1 * 60) // one start sequence is the first one that happened
            console.log('Setting fleet offset to', offset)
            console.log('sequence start time', race.sequenceStartTime)
            console.log('current time', now)
            setFleetOffset(offset)
            setSequenceFinished(false) // just in case it was the last fleet was recalled
            setWarningCompleted(false)
        } else {
            //assume we are at the start of the race
            setFleetOffset(0)
        }
        setPendingChanges(false)
    }, [raceState, race])

    useEffect(() => {
        if (raceState == raceStateType.sequenceHold) {
            setPendingChanges(true)
        }
        if (!(raceState == raceStateType.running || raceState == raceStateType.sequenceHold)) return
        const timer = setTimeout(() => {
            //this is offset by 1 second to account for rounding issues
            const time = calculateTimeLeft()

            setTimeLeft(time)
            //warning signals
            if (
                currentStep.time + 6 >= Math.abs(time.time - fleetOffset) &&
                warningCompleted === false &&
                !sequenceFinished &&
                raceState == raceStateType.running &&
                pendingChanges === false
            ) {
                onWarning()
                setWarningCompleted(true)
            }
            // Check if any sequence step matches the current time
            if (currentStep.time + 1 >= Math.abs(time.time - fleetOffset) && !sequenceFinished && raceState == raceStateType.running && pendingChanges == false) {
                if (currentStep.hoot > 0) {
                    onHoot(currentStep.hoot)
                }
                if (currentStep.fleetStart) {
                    onFleetStart(currentStep.fleetStart)
                }
                const nextStep = sequenceSteps.find(step => step.order == currentStep.order + 1)
                if (nextStep != undefined) {
                    onFlagChange(currentStep.flagStatus, nextStep.flagStatus)
                    console.log(`Current step: ${JSON.stringify(currentStep)}, Next step: ${nextStep ? JSON.stringify(nextStep) : 'None'}`)
                    setCurrentStep(nextStep)
                    setWarningCompleted(false)
                } else {
                    const currentTime = new Date().getTime() / 1000
                    race.fleets.sort((a, b) => a.startTime - b.startTime)
                    const nextFleet = race.fleets.find(fleet => fleet.startTime > currentTime + 20) // add buffer to ensure we don't accidently grab the current fleet
                    if (nextFleet == undefined) {
                        console.log('No more fleets to start, finishing sequence')
                        setSequenceFinished(true)
                        onSequenceEnd()
                        return
                    }
                    console.log('Starting fleet ' + nextFleet.fleetSettings.name)
                    const newSequenceSteps = race.series?.startSequence === '541go' ? getFiveStartSequence(nextFleet.id) : getThreeStartSequence(nextFleet.id)
                    console.log('New sequence steps', newSequenceSteps)
                    setSequenceSteps(newSequenceSteps)
                    const nextStep = newSequenceSteps[2]
                    console.log('Next step', nextStep)
                    setCurrentStep(nextStep)
                    const numberFleetsStarted =
                        race.fleets.filter(fleet => fleet.startTime < currentTime + 20).length + race.fleets.reduce((acc, curr) => curr.recalls + acc, 0)
                    console.log('Number of fleets started', numberFleetsStarted)
                    const newFleetOffset = race.series!.startSequence === '541go' ? 5 * 60 + fleetOffset : 1 * 60 + fleetOffset
                    console.log('Setting fleet offset to', newFleetOffset)
                    setFleetOffset(newFleetOffset)
                    onFleetCountdownStart(nextFleet.id)

                    setWarningCompleted(false)
                }
            }
            // Add a prop to pass the updated time to the parent component
            onTimeUpdate(Math.abs(time.time - fleetOffset))
        }, 100)

        return () => clearTimeout(timer)
    }, [raceState, timeLeft, startTime])

    useEffect(() => {
        if (raceState == raceStateType.reset) {
            setTimeLeft({ time: largestStep, countingUp: false })
        }
    }, [raceState])

    return (
        <>{`${timeLeft.countingUp ? '+' : '-'}${Math.floor(timeLeft.time / 60)
            .toString()
            .padStart(2, '00')}:${Math.floor(timeLeft.time % 60) // Ensure seconds are rounded up, looks nicer
            .toString()
            .padStart(2, '00')}`}</>
    )
}

export default RaceTimer
