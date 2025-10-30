import { DialogContent, Dialog } from '@components/ui/dialog'
import { Input } from '@components/ui/input'

export default function EditResultDialog({ result, fleet }: { result: ResultDataType; fleet: FleetDataType }) {
    return (
        <Dialog open={true}>
            <DialogContent className='max-w-8/12'>
                <div className='flex w-full flex-col'>
                    <div className='flex w-10/12'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Helm</p>
                            <Input type='text' value={result.Helm} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Crew</p>
                            <Input type='text' value={result.Crew} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Class</p>
                            <Input type='text' value={result.boat.name} />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Sail Number</p>

                            <Input type='text' value={result.SailNumber} />
                        </div>
                    </div>
                    <div className='flex flex-row mt-2'>
                        <div className='flex flex-col px-6 w-1/4'>
                            <p className='text-2xl font-bold'>Finish Code</p>

                            <Input type='number' value={result.resultCode} />
                        </div>
                    </div>
                    <div>
                        <div className='flex flex-row'>
                            <p className='text-4xl font-extrabold p-6'>Lap Info</p>
                        </div>
                        <div className='flex flex-row w-full flex-wrap' id='LapData'>
                            {result.laps.map((lap: LapDataType, index: number) => {
                                return (
                                    <div className='flex flex-col px-6 w-min' key={lap.time + index}>
                                        {new Date(Math.max(0, (lap.time - fleet!.startTime) * 1000)).toISOString().substring(11, 19)}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
