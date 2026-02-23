'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageCarouselProps {
    images: string[]
    alt: string
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (images.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 italic text-gray-400">
                No images
            </div>
        )
    }

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="group relative h-full w-full overflow-hidden bg-slate-100">
            <AnimatePresence initial={false} mode="wait">
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={alt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full object-cover"
                />
            </AnimatePresence>

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-800 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 shadow-sm border border-slate-100"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-800 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 shadow-sm border border-slate-100"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1.5 px-2 py-1 bg-black/5 rounded-full">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 w-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-[#002B5B] w-4' : 'bg-black/20'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
