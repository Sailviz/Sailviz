'use client'
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
    const Router = useRouter();
    return (
        <Button onClick={() => Router.back()}> Back </Button>

    );
};