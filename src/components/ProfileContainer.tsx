import React from 'react';

interface AdminContainerProps {
	title: string;
	value: number;
}

export default function AdminContainer({ title, value }: AdminContainerProps) {
	return (
		<div className="bg-[#002E5E] text-[#F6F8F9] rounded-lg p-6 shadow-md text-center">
			<h2 className="text-lg font-medium">{title}</h2>
			<p className="text-3xl font-bold mt-2">{value}</p>
		</div>
	);
}
