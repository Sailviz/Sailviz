'use client'
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import cookie from 'js-cookie'
import { mutate } from 'swr';
export default function BackButton({ demoMode = false }) {
    const Router = useRouter();
    const handleClick = async () => {
        if (!demoMode) {
            Router.back()
            return
        }
        //copy user data in local storage to cookies
        cookie.set('userId', localStorage.getItem('userId')!, { expires: 7 });
        cookie.set('clubId', localStorage.getItem('clubId')!, { expires: 7 });
        cookie.set('token', localStorage.getItem('token')!, { expires: 7 });
        //revalidate user data
        await mutate('/api/user')
        await mutate('/api/club')
        Router.back()
    }
    return (
        <Button onClick={() => handleClick()}> Back </Button>

    );
};