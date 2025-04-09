"use client"

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({ images }: { images: string[]}) => {
    const [currentImage, setCurrentImage] = useState(0);
    return ( 
        <div className='space-y-4'>
            <Image src={images[currentImage]} alt="Product Image" width={1000} height={1000} className="min-h-[300px] object-cover object-center"/>
            <div className='flex'>
                {images.map((image, index) => (
                    <div key={index} className={cn('border mr-2 cursor-pointer rounded-sm overflow-hidden hover:border-orange-600', currentImage === index && 'border-orange-500')} onClick={() => setCurrentImage(index)}>
                        <Image src={image} alt="Product Image" width={300} height={300} className="min-h-[100px] object-cover object-center cursor-pointer"/>
                    </div>
                ))}
            </div>
        </div>
    );
}
 
export default ProductImages;