import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen justify-center flex-col gap-10 items-center bg-white p-6 text-[#1b1b18] lg:justify-center lg:p-8 ">
                    
                    <div className='text-4xl'>Bienvenue sur la plateforme UnivEvent</div>
                    
                    <div className="flex flex-col items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-2xl leading-normal text-blue-600 hover:border-[#19140035] "
                                >
                                    Se connecter
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-2xl leading-normal text-blue-600 hover:border-[#1915014a] "
                                    >
                                        S'inscrire
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
