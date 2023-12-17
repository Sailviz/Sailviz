import Layout from '../components/Layout'
import Card from '../components/Card'

const About = () => {
    return (
        <Layout>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    About
                </h1>
                <p>This Will be populated with instructions on how to use it.</p>
            </div>
        </Layout>
    );
};


export default About;