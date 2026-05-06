import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Vote {
    id_vote: number;
    date_vote: string;
    tour: number;
    user: { name: string; email: string };
    election: { titre: string };
    candidature: { user: { name: string } };
}

interface Props extends PageProps {
    votes: Vote[];
}

export default function VoteList() {
    const { votes } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Historique des Votes" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="text-orange-600" size={24} />
                            <CardTitle className="text-green-600">Historique des Votes</CardTitle>
                        </div>
                        <p className="text-muted-foreground">
                            Consultez l'historique de tous les votes enregistrés (consultation uniquement)
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4 border-orange-200 bg-orange-50">
                            <ShieldAlert className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                ⚖️ Protection intégrité : Aucune modification ou suppression de vote n'est possible. 
                                Les votes sont immuables pour garantir la transparence du scrutin.
                            </AlertDescription>
                        </Alert>

                        {votes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun vote enregistré pour le moment.
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <Badge variant="default">{votes.length} vote{votes.length > 1 ? 's' : ''}</Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Électeur</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Élection</TableHead>
                                                <TableHead>Candidat voté</TableHead>
                                                <TableHead>Tour</TableHead>
                                                <TableHead>Date du vote</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {votes.map((vote) => (
                                                <TableRow key={vote.id_vote}>
                                                    <TableCell className="font-medium">{vote.user.name}</TableCell>
                                                    <TableCell className="font-mono text-sm">{vote.user.email}</TableCell>
                                                    <TableCell>{vote.election.titre}</TableCell>
                                                    <TableCell className="font-medium">{vote.candidature.user.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">Tour {vote.tour}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {new Date(vote.date_vote).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/votes/${vote.id_vote}`}>
                                                                Détails
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
