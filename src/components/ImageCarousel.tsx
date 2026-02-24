'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
            <div className="relative h-full w-full">
                <img
                    src={images[currentIndex]}
                    alt={alt}
                    className="absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-300"
                />
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2 text-[#002B5B] transition-all hover:bg-white hover:scale-110 active:scale-90 shadow-md border border-slate-200 z-10"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2 text-[#002B5B] transition-all hover:bg-white hover:scale-110 active:scale-90 shadow-md border border-slate-200 z-10"
                    >
                        <ChevronRight className="h-5 w-5" />
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
