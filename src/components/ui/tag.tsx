import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const tagVariants = cva(
	'inline-block rounded-full px-2 py-1 text-xs font-medium transition-colors',
	{
		variants: {
			variant: {
				default: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
				secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
				destructive: 'bg-red-100 text-red-600 hover:bg-red-200',
				outline:
					'border text-gray-600 border-gray-400 hover:bg-gray-200',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export interface TagProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof tagVariants> {
	label: string;
}

export default function Tag({ className, variant, label, ...props }: TagProps) {
	return (
		<span className={cn(tagVariants({ variant }), className)} {...props}>
			{label}
		</span>
	);
}
