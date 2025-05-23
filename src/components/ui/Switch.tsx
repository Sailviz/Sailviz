'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '../../lib/utils'

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
    startContent?: React.ReactNode
    endContent?: React.ReactNode
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(({ className, startContent, endContent, onCheckedChange, ...props }, ref) => {
    const isControlled = props.checked !== undefined

    const [internalChecked, setInternalChecked] = React.useState(props.defaultChecked ?? false)
    const isChecked = isControlled ? props.checked : internalChecked

    const handleCheckedChange = (checked: boolean) => {
        if (!isControlled) {
            setInternalChecked(checked)
        }
        if (onCheckedChange) {
            onCheckedChange(checked)
        }
    }

    const icon = isChecked ? startContent : endContent

    return (
        <SwitchPrimitives.Root
            className={cn(
                'peer inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
                className
            )}
            onCheckedChange={handleCheckedChange}
            {...props}
            checked={isChecked}
            ref={ref}
        >
            <SwitchPrimitives.Thumb
                className={cn(
                    'pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-10 data-[state=unchecked]:translate-x-0'
                )}
            >
                <span className='flex items-center justify-center'>{icon}</span>
            </SwitchPrimitives.Thumb>
        </SwitchPrimitives.Root>
    )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
