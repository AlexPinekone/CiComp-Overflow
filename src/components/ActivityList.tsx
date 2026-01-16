import Activity from './Activity';
import { activities } from '@/constants/activities';

export default function ActivityList() {
	return (
		<div className="space-y-4">
			{activities.map((activity) => (
				<Activity
					key={activity.id}
					authorName={activity.authorName}
					activity={activity.activity}
					dateModify={activity.dateModify}
					dateOriginal={activity.dateOriginal}
				/>
			))}
		</div>
	);
}
