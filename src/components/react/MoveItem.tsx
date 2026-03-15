import * as React from 'react';
import { NumericAnnotationGlyph } from '../../lib/NumericAnnotationGlyphs';
import { move_text } from './move_text';

export interface MoveItemProps {
	isCurrentMove: boolean;
	ancestor: boolean;
	mainline: boolean;
	depth: number;
	san: string;
	nags: NumericAnnotationGlyph[];
	onMoveItemClick: () => void;
}

function className(
	isCurrentMove: boolean,
	ancestor: boolean,
	mainline: boolean,
	depth: number,
): string {
	const parts: string[] = [];
	parts.push('move-item');
	if (isCurrentMove) {
		parts.push('active');
	}
	parts.push('vertical-align');
	if (ancestor) {
		parts.push('ancestor');
	}
	if (mainline) {
		parts.push('mainline');
	}
	if (depth > -1) {
		parts.push(`variation-depth-${depth}`);
	}
	return parts.join(' ');
}

export const MoveItem = ({
	isCurrentMove,
	ancestor,
	mainline,
	depth,
	san,
	nags,
	onMoveItemClick,
}: MoveItemProps) => {
	const ref = React.useRef<HTMLParagraphElement>(null);

	React.useEffect(() => {
		if (ref.current && isCurrentMove) {
			ref.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'end',
			});
		}
	}, [isCurrentMove]);

	return (
		<p
			className={className(isCurrentMove, ancestor, mainline, depth)}
			ref={ref}
			onClick={(e) => {
				e.stopPropagation();
				onMoveItemClick();
			}}
		>
			{move_text(san, nags)}
		</p>
	);
};

export const VariantMoveItem = ({
	isCurrentMove,
	san,
	nags,
	onMoveItemClick,
	moveIndicator = null,
}: {
	isCurrentMove: boolean;
	san: string;
	nags: NumericAnnotationGlyph[];
	onMoveItemClick: () => void;
	moveIndicator?: string | null;
}) => {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (ref.current && isCurrentMove) {
			ref.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'end',
			});
		}
	}, [isCurrentMove]);

	return (
		<div
			className={`variant-move-item ${(isCurrentMove && 'active') || ''}`}
			onClick={(e) => {
				e.stopPropagation();
				onMoveItemClick();
			}}
			ref={ref}
		>
			<span className={'variant-move-indicator'}>{moveIndicator}</span>
			{move_text(san, nags)}
		</div>
	);
};
