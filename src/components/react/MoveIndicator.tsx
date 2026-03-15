import * as React from 'react';

export interface MoveIndicatorProps {
	moveNumber: number;
	onMoveIndexClick: () => void;
}

export function className(depth: number): string {
	const parts: string[] = [];
	parts.push('move-indicator');
	parts.push('center');
	parts.push('vertical-align');
	if (depth > -1) {
		parts.push(`variation-depth-${depth}`);
	}
	return parts.join(' ');
}

export const MoveIndicator = ({
	moveNumber,
	onMoveIndexClick,
}: MoveIndicatorProps) => {
	const ref = React.useRef<HTMLParagraphElement>(null);

	/*
	React.useEffect(() => {
		if (ref.current && isCurrentMove) {
			ref.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'end',
			});
		}
	}, [isCurrentMove]);
	*/

	return (
		<p
			className={className(-1)}
			ref={ref}
			onClick={(e) => {
				e.stopPropagation();
				onMoveIndexClick();
			}}
		>
			{`${moveNumber}`}
		</p>
	);
};
