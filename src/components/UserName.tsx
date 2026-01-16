import React from 'react';

interface userNameProps {
	name: string;
}

export default function Username({ name }: userNameProps) {
	return (
		<div className="bg-[#002E5E] text-[#F6F8F9] rounded-lg p-6 shadow-md text-center">
			<h2 className="text-lg font-medium">{name}</h2>
		</div>
	);
}
