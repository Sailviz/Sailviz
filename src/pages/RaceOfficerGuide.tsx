import Layout from '../components/Layout'
import Card from '../components/Card'
import Dashboard from '../components/Dashboard';

const RaceOfficerGuide = () => {
    return (
        <Dashboard>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Dashboard Page
                </p>
                <p>This Will be populated with instructions on how to use it.</p>
                <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Handicap Racing
                </p>
                <p>This Will be populated with instructions on how to use it.</p>
                <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Pursuit Racing
                </p>
                <p>This Will be populated with instructions on how to use it.</p>
            </div>
        </Dashboard>
    );
};


export default RaceOfficerGuide;