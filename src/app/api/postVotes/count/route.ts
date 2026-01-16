import { PostVoteController } from '@/controller/PostVoteController';

export async function GET() {
	return await PostVoteController.countLastMonthVotes();
}
