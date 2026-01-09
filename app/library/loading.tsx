import Container from '@/components/shared/containers/container';
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 border-b border-white/5">
                <Container className="relative py-12 md:py-16">
                    <div className="h-16 bg-zinc-900/50 rounded-2xl animate-pulse" />
                </Container>
            </div>
            <Container className="py-8 md:py-12">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Container>
        </div>
    );
}
