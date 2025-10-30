import React from 'react'
import { Button } from './ui/button'
import BackButton from './layout/backButton'
type ErrorBoundaryState = {
    hasError: boolean
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props)

        // Define a state variable to track whether is an error or not
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI

        return { hasError: true }
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can use your own error logging service here
        console.log({ error, errorInfo })
        document.getElementById('errorcode')!.innerHTML = error.toString()
        document.getElementById('errorinfo')!.innerHTML = errorInfo.componentStack!
    }
    render() {
        // Check if the error is thrown
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div>
                    <div className='text-xl font-extrabold p-6'>Oops, there is an error!</div>
                    <Button type='button' className='p-4' onClick={() => this.setState({ hasError: false })}>
                        Reload
                    </Button>
                    <BackButton route='/Dashboard' />
                    <div id='errorcode' className='p-4' />
                    <div id='errorinfo' className='p-4' />
                </div>
            )
        }

        // Return children components in case of no error

        return this.props.children
    }
}

export default ErrorBoundary
