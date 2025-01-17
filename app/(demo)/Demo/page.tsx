'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import cookie from 'js-cookie';

export default function DemoPage({ params }: { params: { slug: string } }) {
    const router = useRouter();

    useEffect(() => {
        // Set a cookie

        //we want to sign the user in as an account for a sailing club, then feed fake data to the page

        //set cookies
        cookie.set('clubId', '2ad3c0f0-1a54-4e49-bef1-50256d5ce9e9', { expires: 2 });
        cookie.set('userId', '45e5f7be-d6d3-4f9c-b4fd-6a0704895e3f', { expires: 2 })

        // Redirect to another page
        router.push('/Demo/Race');
    }, [router]);

    return (
        <div>
            <p>Setting cookies and redirecting...</p>
        </div>
    );
};