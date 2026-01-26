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
import { ControlProps } from './ControlsProps';

export const Controls = (props: ControlProps) => {
	return (
		<React.Fragment>
			<div className="button-section">
				<button title="Back" onClick={() => props.onBackButtonClick()}>
					<ArrowBigLeft />
				</button>
				<button title="Forward" onClick={() => props.onForwardButtonClick()}>
					<ArrowBigRight />
				</button>
				{props.readOnly ? null : (
					<button title="Save" onClick={() => props.onSaveButtonClick()}>
						<Save strokeWidth={'1px'} />
					</button>
				)}
			</div>
			<div className="button-section">
				<button title="Copy FEN" onClick={() => props.onCopyFenButtonClick()}>
					<Copy strokeWidth={'1px'} />
				</button>
				<button title="Copy PGN" onClick={() => props.onCopyPgnButtonClick()}>
					<Clipboard strokeWidth={'1px'} />
				</button>
				{props.readOnly ? null : (
					<button title="Undo" onClick={() => props.onUndoButtonClick()}>
						<Undo2 />
					</button>
				)}
			</div>
		</React.Fragment>
	);
};
// In theory you can add more button-section(s) and they appear as rows in the output.
// However, they spill over the comments section, so two rows is the maximum.
// <button title="Settings" onClick={() => props.onSettingsButtonClick()}>
//	<Settings />
// </button>
