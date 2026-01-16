import Image from 'next/image';

interface PictureProfileProps {
	imageUrl: string;
	altText?: string;
	size?: number;
}

const PictureProfile: React.FC<PictureProfileProps> = ({
	imageUrl,
	altText = 'User profile',
	size = 50,
}) => {
	return (
		<Image
			src={imageUrl}
			alt={altText}
			width={size}
			height={size}
			className="rounded-full object-cover"
		/>
	);
};

export default PictureProfile;
