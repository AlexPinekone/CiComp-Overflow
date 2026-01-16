import { PostDateFilter } from '@/constants/post';

export abstract class PostUtils {
	public static getDateFilterRange(filter: PostDateFilter): [Date, Date] {
		const now = new Date();
		let startDate: Date;

		switch (filter) {
			case PostDateFilter.LAST_24_HOURS:
				startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				break;
			case PostDateFilter.LAST_WEEK:
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case PostDateFilter.LAST_MONTH:
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case PostDateFilter.LAST_YEAR:
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			case PostDateFilter.ALL:
			default:
				startDate = new Date(0); // Epoch time
				break;
		}

		return [startDate, now];
	}
}
