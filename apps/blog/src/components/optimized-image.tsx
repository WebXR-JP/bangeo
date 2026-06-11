import Image from "next/image";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

type OptimizedImageProps = {
	alt: string;
	src: string;
	className?: string;
	priority?: boolean;
	sizes?: string;
} & (
	| { fill: true; width?: never; height?: never }
	| { fill?: false; width: number; height: number }
);

export function OptimizedImage({
	alt,
	src,
	className,
	priority = false,
	sizes = CARD_IMAGE_SIZES,
	fill,
	width,
	height,
}: OptimizedImageProps) {
	if (fill) {
		return (
			<Image
				src={src}
				alt={alt}
				fill
				sizes={sizes}
				priority={priority}
				className={className}
			/>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={width}
			height={height}
			sizes={sizes}
			priority={priority}
			className={className}
		/>
	);
}
