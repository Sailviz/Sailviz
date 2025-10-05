import { Link } from '@tanstack/react-router'

export default function NotFound() {
    return (
        <div>
            <h1>Not found – 404!</h1>
            <div>
                <Link to='/'>Go back to Home</Link>
            </div>
        </div>
    )
}
