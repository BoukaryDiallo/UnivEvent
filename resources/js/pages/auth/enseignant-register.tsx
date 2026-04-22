import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function EnseignantRegister() {
    return (
        <AuthLayout title="Inscription enseignant" description="Creez un compte enseignant complet pour le module disponibilite">
            <Head title="Inscription enseignant" />

            <Form
                action="/enseignant/inscription"
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="nom" className="text-black">Nom</Label>
                                    <Input id="nom" name="nom" type="text" required autoFocus placeholder="Ouattara" className="text-black" />
                                    <InputError message={errors.nom} className="mt-2" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="prenom" className="text-black">Prenom</Label>
                                    <Input id="prenom" name="prenom" type="text" required placeholder="Aminata" className="text-black" />
                                    <InputError message={errors.prenom} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="telephone" className="text-black">Telephone</Label>
                                    <Input id="telephone" name="telephone" type="text" required placeholder="+226 00 00 00 00" className="text-black" />
                                    <InputError message={errors.telephone} className="mt-2" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="specialite" className="text-black">Specialite</Label>
                                    <Input id="specialite" name="specialite" type="text" required placeholder="Mathematiques" className="text-black" />
                                    <InputError message={errors.specialite} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-black">Adresse email</Label>
                                <Input id="email" name="email" type="email" required placeholder="enseignant@universite.edu" className="text-black" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-black">Mot de passe</Label>
                                <PasswordInput id="password" name="password" required placeholder="Mot de passe" className="text-black" />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-black">Confirmation</Label>
                                <PasswordInput id="password_confirmation" name="password_confirmation" required placeholder="Confirmer le mot de passe" className="text-black" />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <Button type="submit" className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700" disabled={processing}>
                                {processing && <Spinner />}
                                Creer mon compte enseignant
                            </Button>
                        </div>

                        <div className="text-center text-sm text-black">
                            Deja enseignant ? <TextLink href="/enseignant/connexion">Se connecter</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
