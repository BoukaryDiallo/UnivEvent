import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function EnseignantLogin({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Connexion enseignant"
            description="Accédez à votre espace de disponibilités enseignant"
        >
            <Head title="Connexion enseignant" />

            <Form action="/enseignant/connexion" method="post" disableWhileProcessing className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-black">Adresse email</Label>
                                <Input id="email" name="email" type="email" required autoFocus placeholder="enseignant@universite.edu" className="text-black" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-black">Mot de passe</Label>
                                <PasswordInput id="password" name="password" required placeholder="Mot de passe" className="text-black" />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-black">
                                <input type="checkbox" name="remember" value="1" />
                                Se souvenir de moi
                            </label>

                            {status && <p className="text-sm text-green-600">{status}</p>}

                            <Button type="submit" className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700" disabled={processing}>
                                {processing && <Spinner />}
                                Se connecter comme enseignant
                            </Button>
                        </div>

                        <div className="text-center text-sm text-black">
                            Pas encore de compte ? <TextLink href="/enseignant/inscription">Créer un compte enseignant</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
