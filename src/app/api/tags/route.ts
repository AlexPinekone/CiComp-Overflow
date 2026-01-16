import { TagController } from '@/controller/TagController';

export async function GET() {
	return TagController.getAllTagsCatalog();
}
