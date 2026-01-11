import {
	ArrowBigLeft,
	ArrowBigRight,
	Clipboard,
	Copy,
	Save,
	Settings,
	Undo2,
} from 'lucide-react';
import * as React from 'react';

export interface ControlActions {
	onUndoButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onSaveButtonClick: () => void;
	onCopyFenButtonClick: () => void;
	onCopyPgnButtonClick: () => void;
	onSettingsButtonClick: () => void;
}

export const Controls = (props: ControlActions) => {
	return (
		<div>
			<div className="button-section">
				<button title="Back" onClick={() => props.onBackButtonClick()}>
					<ArrowBigLeft />
				</button>
				<button title="Forward" onClick={() => props.onForwardButtonClick()}>
					<ArrowBigRight />
				</button>
				<button title="Save" onClick={() => props.onSaveButtonClick()}>
					<Save strokeWidth={'1px'} />
				</button>
			</div>
			<div className="button-section">
				<button title="Copy FEN" onClick={() => props.onCopyFenButtonClick()}>
					<Copy strokeWidth={'1px'} />
				</button>
				<button title="Copy PGN" onClick={() => props.onCopyPgnButtonClick()}>
					<Clipboard strokeWidth={'1px'} />
				</button>
				<button title="Undo" onClick={() => props.onUndoButtonClick()}>
					<Undo2 />
				</button>
				<button title="Settings" onClick={() => props.onSettingsButtonClick()}>
					<Settings />
				</button>
			</div>
		</div>
	);
};
