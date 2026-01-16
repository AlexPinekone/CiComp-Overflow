import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/service/CommentService';
import { Comment } from '@/model/Comment';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { decrypt, getCurrentSessionFromCookies } from '@/lib/session';

export class CommentController {
	static async getCommentsByPostId(req: NextRequest, postId: string) {
		try {
			if (!postId) {
				return NextResponse.json(
					{ error: 'Post ID is required' },
					{ status: 400 }
				);
			}

			const sortBy = req.nextUrl.searchParams.get('sortBy') || 'date';
			const order = req.nextUrl.searchParams.get('order') || 'desc';

			const comments = await CommentService.getCommentsByPost(
				postId,
				sortBy,
				order
			);

			return NextResponse.json(comments, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getCommentById(req: NextRequest, id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Comment ID is required' },
				{ status: 400 }
			);
		}

		try {
			const comment = await CommentService.getCommentById(id);
			if (!comment) {
				return NextResponse.json(
					{ error: 'Comment not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(comment, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async createComment(req: NextRequest, postId: string) {
		try {
			const { body } = await req.json();
			if (!body?.trim() || !postId) {
				return NextResponse.json(
					{ error: 'Body and postId are required' },
					{ status: 400 }
				);
			}

			// Obtener userId desde el token de sesión (Authorization header o cookie)
			const headerToken = req.headers.get('Authorization') ?? undefined;
			let payload = await decrypt(headerToken);
			if (!payload) {
				const cookieSession = await getCurrentSessionFromCookies();
				payload = await decrypt(cookieSession ?? undefined);
			}
			const userId = (payload as any)?.userId as string | undefined;
			if (!userId) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				);
			}

			const newComment = await CommentService.createComment({
				body,
				postId,
				userId,
			} as Comment & { userId: string });

			return NextResponse.json(newComment, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updateComment(req: NextRequest, id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Comment ID is required' },
				{ status: 400 }
			);
		}

		try {
			const { body } = await req.json();

			if (!body?.trim()) {
				return NextResponse.json(
					{ error: 'Body is required' },
					{ status: 400 }
				);
			}

			const updatedComment = await CommentService.updateComment({
				commentId: id,
				body,
			} as Comment);

			return NextResponse.json(updatedComment, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteComment(req: NextRequest, commentId: string) {
		if (!commentId) {
			return NextResponse.json(
				{ error: 'Comment ID is required' },
				{ status: 400 }
			);
		}

		try {
			const result = await CommentService.deleteComment(commentId);
			return NextResponse.json(
				{
					success: true,
					commentAuthorId: result.userId,
				},
				{ status: 200 }
			);
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteAllComment(req: NextRequest, postId: string) {
		if (!postId) {
			return NextResponse.json(
				{ error: 'Post ID is required' },
				{ status: 400 }
			);
		}
		try {
			await CommentService.deleteAllComments(postId);
			return new NextResponse(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countLastMonthComments() {
		try {
			const count = await CommentService.countLastMonthComments();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
