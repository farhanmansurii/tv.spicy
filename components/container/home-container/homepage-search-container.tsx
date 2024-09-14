'use client'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { Motiondiv } from "@/components/common/MotionDiv"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"

export default function HomeSearchContainer() {
    const getRandomImageUrl = () => {
        const randomId = Math.floor(Math.random() * 1000) + 1
        return `https://picsum.photos/id/${randomId}/1920/1080`
    }

    return (

        <div className="relative  max-h-full text-white overflow-hidden">
            <ShootingStars />
            <StarsBackground />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />

            <div className="relative z-10 flex flex-col min-h-screen p-6">
                <Motiondiv
                    className="flex-grow flex flex-col items-center w-full justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Motiondiv
                        className="text-6xl mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Find movies & TV shows
                    </Motiondiv>
                    <Motiondiv
                        className="text-xl font-light mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Discover where and how to stream movies and TV shows
                    </Motiondiv>
                    <motion.div
                        className="relative w-full max-w-xl mb-24"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <Input
                            type="text"
                            placeholder="What are you looking for?"
                            className="w-full py-4 placeholder:text-white border-0 pl-12 h-14 pr-4 text-white bg-white/10 backdrop-blur-md rounded-full text-lg"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-6 h-6" />
                    </motion.div>
                </Motiondiv>
            </div>
        </div>
    )
}
