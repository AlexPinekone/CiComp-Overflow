// utils/cloudinary.ts
import {
	v2 as cloudinary,
	UploadApiOptions,
	UploadApiResponse,
} from 'cloudinary';

class CloudinaryService {
	private static cloudinaryInstance = cloudinary;

	private static configure() {
		this.cloudinaryInstance.config({
			cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
			api_key: process.env.CLOUDINARY_API_KEY!,
			api_secret: process.env.CLOUDINARY_API_SECRET!,
			secure: true,
		});
	}

	public static getClient(): typeof cloudinary {
		this.configure();
		return this.cloudinaryInstance;
	}

	public static async uploadImage(
		file: File,
		options?: UploadApiOptions
	): Promise<UploadApiResponse> {
		this.configure();
		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const mimeType = file.type || 'image/jpeg';

			const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;

			const result = await this.cloudinaryInstance.uploader.upload(
				base64String,
				options
			);

			return result;
		} catch (error: any) {
			const message =
				error?.response?.data?.error?.message ||
				error?.message ||
				'Unknown error';
			console.log({ error });
			throw new Error(`Error uploading the image: ${message}`);
		}
	}

	public static async deleteImage(publicId: string): Promise<void> {
		this.configure();
		try {
			await this.cloudinaryInstance.uploader.destroy(publicId);
		} catch (error) {
			throw new Error(
				`Error deleting the image: ${(error as Error).message}`
			);
		}
	}

	public static async getImageUrl(publicId: string): Promise<string> {
		this.configure();
		try {
			const url = this.cloudinaryInstance.url(publicId, {
				secure: true,
			});
			return url;
		} catch (error) {
			throw new Error(
				`Error getting the image URL: ${(error as Error).message}`
			);
		}
	}

	public static async getImageMetadata(publicId: string): Promise<any> {
		this.configure();
		try {
			const metadata =
				await this.cloudinaryInstance.api.resource(publicId);
			return metadata;
		} catch (error) {
			throw new Error(
				`Error getting the image metadata: ${(error as Error).message}`
			);
		}
	}

	public static async getImageList(options?: any): Promise<any> {
		this.configure();
		try {
			const result = await this.cloudinaryInstance.api.resources(options);
			return result;
		} catch (error) {
			throw new Error(
				`Error getting the image list: ${(error as Error).message}`
			);
		}
	}
}

export default CloudinaryService;
