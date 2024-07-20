import Layout from '../../components/ui/Layout'
import Card from '../../components/ui/Card'

const Contact = () => {
    return (
        <Layout>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Contact
                </h1>
                <p>Please Contact Alex Pegg for assitance</p>
            </div>
        </Layout>
    );
};


export default Contact;