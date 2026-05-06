export type PageProps<T = Record<string, any>> = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors: Record<string, string>;
} & T;

