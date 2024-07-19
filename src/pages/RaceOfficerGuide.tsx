import Dashboard from '../components/Dashboard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
const RaceOfficerGuide = () => {

    const router = useRouter()
    return (
        <Dashboard>
            <div className='w-full'>
                <div className=' w-11/12 h-full mx-auto my-3'>
                    <embed
                        src="/0.2 Race Sign On Guide.pdf#toolbar=0"
                        height="750" width={1450}
                    />
                </div>
            </div>
        </Dashboard>
    );
};


export default RaceOfficerGuide;