import { UserService } from '@/service/UserService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export class UserController {
	static async registerUser(req: NextRequest) {
		try {
			const {
				name,
				lastName,
				mail,
				password: unhashed,
				role,
			} = await req.json();

			const salt = await bcryptjs.genSalt(10);
			const password = await bcryptjs.hash(unhashed, salt);

			const user = await UserService.registerUser({
				name,
				lastName,
				mail,
				password,
				role,
			});

			return NextResponse.json(user, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async loginUser(req: NextRequest) {
		try {
			const { email, password } = await req.json();
			return NextResponse.json({}, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getUserPostsById(req: NextRequest, id: string) {
		try {
			const posts = await UserService.getUserPostsById(id);
			return NextResponse.json(posts, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getUserPostsByIdPaginated(
		req: NextRequest,
		id: string,
		orderBy: 'newest' | 'oldest',
		page: number,
		limit: number
	) {
		try {
			const posts = await UserService.getUserPostsByIdPaginated(
				id,
				orderBy,
				page,
				limit
			);
			return NextResponse.json(posts, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countActiveUsers() {
		try {
			const count = await UserService.countActiveUsers();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
