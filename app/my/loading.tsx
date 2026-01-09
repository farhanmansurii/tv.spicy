import Container from '@/components/shared/containers/container';
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            <Container className="py-8 md:py-12">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Container>
        </div>
    );
}
