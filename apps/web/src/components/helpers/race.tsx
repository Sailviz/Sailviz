import type { RaceType, ResultType } from '@sailviz/types'

export async function calculateResults(race: RaceType, updateResultMutation: { mutateAsync: (result: ResultType) => Promise<any> }) {
    console.log('Calculating results for race:')
    //most nuber of laps.
    console.log(race)
    for (const fleet of race.fleets) {
        if (fleet.results == undefined) {
            return
        }
        const maxLaps = Math.max.apply(
            null,
            fleet.results.map(function (o: ResultType) {
                return o.numberLaps
            })
        )
        console.log(maxLaps)
        if (!(maxLaps >= 0)) {
            console.log('max laps not more than one')
            continue
        }
        const resultsData = race.fleets.flatMap(fleet => fleet.results)

        //calculate corrected time
        for (const result of resultsData) {
            if (result == undefined) {
                return
            }
            console.log(result)
            //if we don't have a number of laps, set it to the number of laps
            if (result.numberLaps == 0) {
                result.numberLaps = result.laps.length
            }
            if (result.finishTime == 0) {
                result.CorrectedTime = 0
                continue
            }
            console.log(result.numberLaps)
            let seconds = result.finishTime - fleet.startTime
            result.CorrectedTime = (seconds * 1000 * (maxLaps / result.numberLaps)) / result.boat.py
            result.CorrectedTime = Math.round(result.CorrectedTime * 10) / 10
        }

        //calculate finish position

        const sortedResults = fleet.results.sort((a, b) => {
            if (a.resultCode != '') {
                return 1
            }
            if (b.resultCode != '') {
                return -1
            }
            if (a.CorrectedTime > b.CorrectedTime) {
                return 1
            }
            if (a.CorrectedTime < b.CorrectedTime) {
                return -1
            }
            return 0
        })

        console.log(sortedResults)

        sortedResults.forEach((result, index) => {
            if (result.resultCode != '') {
                console.log(result)
                result.HandicapPosition = fleet.results!.length
            } else {
                result.HandicapPosition = index + 1
            }
        })

        // Await all DB updates
        await Promise.all(sortedResults.map(result => updateResultMutation.mutateAsync(result)))

        console.log(sortedResults)
    }
}
