import * as React from 'react';
import { NumericAnnotationGlyph } from '../../lib/NumericAnnotationGlyphs';
import { move_text } from './move_text';

export const MoveItem = ({
	isCurrentMove,
	san,
	nags,
	onMoveItemClick,
}: {
	isCurrentMove: boolean;
	san: string;
	nags: NumericAnnotationGlyph[];
	onMoveItemClick: () => void;
}) => {
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
			className={`move-item ${(isCurrentMove && 'active') || ''} vertical-align`}
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
