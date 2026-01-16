import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/service/TagService';
import { ErrorHandler } from '@/utils/ErrorHandler';

export class TagController {
	static async getAllTagsCatalog() {
		try {
			const tags = await TagService.getAllTagsCatalog();
			return NextResponse.json(tags, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getTagByNameFromTagsCatalog(req: NextRequest) {
		try {
			const { name } = await req.json();

			if (!name || typeof name !== 'string') {
				return NextResponse.json(
					{ error: 'Tag name is required and must be a string' },
					{ status: 400 }
				);
			}

			const tag = await TagService.getTagByNameFromTagsCatalog(name);

			if (!tag) {
				return NextResponse.json(
					{ error: 'Tag not found in catalog' },
					{ status: 404 }
				);
			}

			return NextResponse.json(tag, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
