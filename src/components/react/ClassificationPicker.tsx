import { X } from 'lucide-react';
import * as React from 'react';
import {
	CLASSIFICATION_ORDER,
	moveAnnotationMap,
	MoveAnnotation,
} from '../../lib/classification';

interface ClassificationPickerProps {
	classification: MoveAnnotation | null;
	onClassify: (classification: MoveAnnotation | null) => void;
	disabled: boolean;
}

export const ClassificationPicker = ({
	classification,
	onClassify,
	disabled,
}: ClassificationPickerProps) => {
	console.log('classification', classification, 'disabled', disabled);
	return (
		<div
			className="cs-classification-picker"
			role="group"
			aria-label="Move annotation"
		>
			{CLASSIFICATION_ORDER.map((key) => {
				const { label, glyph, color, shortcut } = moveAnnotationMap[key];
				const isActive = classification === key;

				return (
					<button
						key={key}
						className={`cs-classification-button${isActive ? ' is-active' : ''}`}
						style={{ '--cs-classification': color } as React.CSSProperties}
						title={`${label} (${shortcut})`}
						aria-label={label}
						aria-pressed={isActive}
						disabled={/*disabled*/ false}
						// Clicking the active label removes it, so one button both sets
						// and unsets.
						onClick={() => onClassify(isActive ? null : key)}
					>
						{glyph}
					</button>
				);
			})}
			<button
				className="cs-classification-button cs-classification-button--clear"
				title="Clear classification (0)"
				aria-label="Clear classification"
				disabled={disabled || !classification}
				onClick={() => onClassify(null)}
			>
				<X size={13} />
			</button>
		</div>
	);
};
