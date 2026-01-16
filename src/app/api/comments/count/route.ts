import { CommentController } from '@/controller/CommentController';

export async function GET() {
	return await CommentController.countLastMonthComments();
}
