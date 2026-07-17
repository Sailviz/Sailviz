import { getFiveStartSequence, getThreeStartSequence } from '@components/helpers/startSequence'
import { useState, useEffect, useRef } from 'react'
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
    onFlagChange: (current: FlagStatusType[], next: FlagStatusType[]) => void
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

    const [timeLeftState, setTimeLeftState] = useState({ time: largestStep, countingUp: false })
    const timeLeftRef = useRef(timeLeftState)
    timeLeftRef.current = timeLeftState

    const sequenceStepsRef = useRef<StartSequenceStep[]>([])
    const currentStepRef = useRef<StartSequenceStep | null>(null)
    const fleetOffsetRef = useRef(0)
    const warningCompletedRef = useRef(false)
    const sequenceFinishedRef = useRef(false)
    const pendingChangesRef = useRef(false)
    const suppressNextHootRef = useRef(false)
    const raceRef = useRef(race)
    raceRef.current = race

    const lastSequenceStartTimeRef = useRef<number | undefined>(undefined)
    const lastRaceStateRef = useRef<raceStateType | null>(null)
    const fleetStartSignature = race.fleets.map(fleet => `${fleet.id}:${fleet.startTime}`).join('|')

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

    type FleetType = (typeof race.fleets)[number]

    const getSequenceStepsForFleet = (fleet: FleetType) =>
        race.series?.startSequence === '541go'
            ? getFiveStartSequence(fleet.id, fleet.fleetSettings.classFlag, fleet.fleetSettings.preparatoryFlag)
            : getThreeStartSequence(fleet.id, fleet.fleetSettings.classFlag, fleet.fleetSettings.preparatoryFlag)

    const getSortedFleets = () => [...raceRef.current.fleets].sort((a, b) => a.startTime - b.startTime)

    const getNextFleetAfter = (time: number) => getSortedFleets().find(fleet => fleet.startTime > time)

    const buildFlagStatus = (flagStatus: FlagStatusType, status: boolean): FlagStatusType => ({
        flag: flagStatus.flag,
        status
    })

    const buildNextFlagStatuses = (nextStep: StartSequenceStep, followingFleet?: FleetType) => {
        if (nextStep.fleetStart && followingFleet != undefined) {
            return [
                buildFlagStatus(nextStep.classFlagStatus, nextStep.classFlagStatus.status),
                buildFlagStatus(nextStep.prepFlagStatus, nextStep.prepFlagStatus.status),
                { flag: followingFleet.fleetSettings.classFlag, status: true }
            ]
        }

        return [nextStep.classFlagStatus, nextStep.prepFlagStatus]
    }

    useEffect(() => {
        const enteredSequenceHold = raceState == raceStateType.sequenceHold && lastRaceStateRef.current != raceStateType.sequenceHold
        if (enteredSequenceHold) {
            pendingChangesRef.current = true
        }
        if (raceState == raceStateType.reset) {
            setTimeLeftState({ time: largestStep, countingUp: false })
            timeLeftRef.current = { time: largestStep, countingUp: false }
            sequenceStepsRef.current = []
            currentStepRef.current = null
            fleetOffsetRef.current = 0
            warningCompletedRef.current = false
            sequenceFinishedRef.current = false
            pendingChangesRef.current = false
            lastSequenceStartTimeRef.current = race.sequenceStartTime
            lastRaceStateRef.current = raceState
            return
        }

        if (!(raceState == raceStateType.running || raceState == raceStateType.sequenceHold)) return

        let activeSequenceSteps = sequenceStepsRef.current
        let activeCurrentStep = currentStepRef.current
        let activeFleetOffset = fleetOffsetRef.current
        let activeSequenceFinished = sequenceFinishedRef.current
        let activeWarningCompleted = warningCompletedRef.current
        let activePendingChanges = pendingChangesRef.current

        const shouldInitializeSequence =
            raceState == raceStateType.running &&
            (pendingChangesRef.current ||
                currentStepRef.current == null ||
                sequenceStepsRef.current.length === 0 ||
                lastSequenceStartTimeRef.current !== race.sequenceStartTime)

        if (shouldInitializeSequence) {
            const currentTime = new Date().getTime() / 1000

            const nextFleet = getNextFleetAfter(currentTime)
            if (!nextFleet) {
                if (getSortedFleets().some(fleet => fleet.startTime === 0)) {
                    lastRaceStateRef.current = raceState
                    return
                }
                console.log('No upcoming fleets, finishing sequence')
                sequenceFinishedRef.current = true
                lastSequenceStartTimeRef.current = race.sequenceStartTime
                return
            }

            console.log('Starting fleet ' + nextFleet.fleetSettings.name)
            onFleetCountdownStart(nextFleet.id)

            const steps = getSequenceStepsForFleet(nextFleet)

            activeSequenceSteps = steps
            sequenceStepsRef.current = steps

            activeCurrentStep = steps[1]!
            currentStepRef.current = activeCurrentStep
            onFlagChange([steps[0].classFlagStatus, steps[0].prepFlagStatus], [steps[1].classFlagStatus, steps[1].prepFlagStatus])

            if (pendingChangesRef.current) {
                const offset = timeLeftRef.current.time + 15 + (race.series!.startSequence === '541go' ? 5 * 60 : 1 * 60)
                console.log('Setting fleet offset to', offset)
                console.log('sequence start time', race.sequenceStartTime)
                console.log('current time', currentTime)
                activeFleetOffset = offset
                activeSequenceFinished = false
                activeWarningCompleted = false
                fleetOffsetRef.current = offset
                sequenceFinishedRef.current = false
                warningCompletedRef.current = false
            } else if (race.series?.settings.maintainSequence == false) {
                activeFleetOffset = 0
                fleetOffsetRef.current = 0
                pendingChangesRef.current = false
            } else {
                activeFleetOffset = 0
                fleetOffsetRef.current = 0
            }

            activePendingChanges = false
            pendingChangesRef.current = false
            lastSequenceStartTimeRef.current = race.sequenceStartTime
        }

        const timer = setInterval(() => {
            //this is offset by 1 second to account for rounding issues
            const time = calculateTimeLeft()
            if (activeCurrentStep == null) {
                console.log('No current step')
                return
            }
            const currentStepSnapshot = activeCurrentStep

            timeLeftRef.current = time
            setTimeLeftState(time)
            //warning signals
            if (
                currentStepSnapshot.time + 6 >= Math.abs(time.time - activeFleetOffset) &&
                activeWarningCompleted === false &&
                !activeSequenceFinished &&
                raceState == raceStateType.running &&
                activePendingChanges === false
            ) {
                onWarning()
                activeWarningCompleted = true
                warningCompletedRef.current = true
            }
            // Check if any sequence step matches the current time
            if (
                currentStepSnapshot.time + 1 >= Math.abs(time.time - activeFleetOffset) &&
                !activeSequenceFinished &&
                raceState == raceStateType.running &&
                activePendingChanges == false
            ) {
                if (suppressNextHootRef.current) {
                    suppressNextHootRef.current = false
                } else if (currentStepSnapshot.hoot > 0) {
                    onHoot(currentStepSnapshot.hoot)
                }
                if (currentStepSnapshot.fleetStart) {
                    onFleetStart(currentStepSnapshot.fleetStart)
                }
                const nextStep = activeSequenceSteps.find(step => step.order == currentStepSnapshot.order + 1)
                if (nextStep != undefined) {
                    const currentRace = raceRef.current
                    const sortedFleets = getSortedFleets()
                    const currentFleet = nextStep.fleetStart ? currentRace.fleets.find(fleet => fleet.id == nextStep.fleetStart) : undefined
                    const followingFleet = currentFleet ? sortedFleets.find(fleet => fleet.startTime > currentFleet.startTime) : undefined

                    onFlagChange([currentStepSnapshot.classFlagStatus, currentStepSnapshot.prepFlagStatus], buildNextFlagStatuses(nextStep, followingFleet))
                    console.log(`Current step: ${JSON.stringify(currentStepSnapshot)}, Next step: ${nextStep ? JSON.stringify(nextStep) : 'None'}`)
                    activeCurrentStep = nextStep
                    currentStepRef.current = nextStep
                    activeWarningCompleted = false
                    warningCompletedRef.current = false
                } else {
                    const now = new Date().getTime() / 1000
                    const sortedFleets = getSortedFleets()
                    const nextFleet = sortedFleets.find(fleet => fleet.startTime > now + 20) // add buffer to ensure we don't accidently grab the current fleet
                    if (nextFleet == undefined) {
                        console.log('No more fleets to start, finishing sequence')
                        activeSequenceFinished = true
                        sequenceFinishedRef.current = true
                        onSequenceEnd()
                        return
                    }
                    console.log('Starting fleet ' + nextFleet.fleetSettings.name)
                    const newSequenceSteps = getSequenceStepsForFleet(nextFleet)
                    console.log('New sequence steps', newSequenceSteps)
                    activeSequenceSteps = newSequenceSteps
                    sequenceStepsRef.current = newSequenceSteps
                    const followingFleetAfterStart = sortedFleets.find(fleet => fleet.startTime > nextFleet.startTime)
                    const activeFleetCurrentStep = newSequenceSteps[1]
                    const activeFleetPreviewStep = newSequenceSteps[2]

                    if (activeFleetCurrentStep != undefined && activeFleetPreviewStep != undefined) {
                        onFlagChange(
                            [activeFleetCurrentStep.classFlagStatus, activeFleetCurrentStep.prepFlagStatus],
                            buildNextFlagStatuses(activeFleetPreviewStep, followingFleetAfterStart)
                        )
                    }
                    const nextStep = activeFleetCurrentStep
                    console.log('Next step', nextStep)
                    activeCurrentStep = nextStep
                    currentStepRef.current = nextStep
                    const numberFleetsStarted = race.fleets.filter(fleet => fleet.startTime < now + 20).length + race.fleets.reduce((acc, curr) => curr.recalls + acc, 0)
                    console.log('Number of fleets started', numberFleetsStarted)
                    const newFleetOffset = race.series!.startSequence === '541go' ? 5 * 60 + activeFleetOffset : 1 * 60 + activeFleetOffset
                    console.log('Setting fleet offset to', newFleetOffset)
                    activeFleetOffset = newFleetOffset
                    fleetOffsetRef.current = newFleetOffset
                    onFleetCountdownStart(nextFleet.id)
                    suppressNextHootRef.current = true

                    if (nextStep != undefined) {
                        activeCurrentStep = nextStep
                        currentStepRef.current = nextStep
                    }

                    activeWarningCompleted = true
                    warningCompletedRef.current = true
                }
            }
            // Add a prop to pass the updated time to the parent component
            onTimeUpdate(Math.abs(time.time - activeFleetOffset))
        }, 100)

        lastRaceStateRef.current = raceState

        return () => clearInterval(timer)
    }, [raceState, startTime, race.sequenceStartTime, race.series?.startSequence, race.series?.settings.maintainSequence, fleetStartSignature])

    return (
        <>{`${timeLeftState.countingUp ? '+' : '-'}${Math.floor(timeLeftState.time / 60)
            .toString()
            .padStart(2, '00')}:${Math.floor(timeLeftState.time % 60) // Ensure seconds are rounded up, looks nicer
            .toString()
            .padStart(2, '00')}`}</>
    )
}

export default RaceTimer
