import {
	Bookmark,
	BookmarkCheck,
	BookmarkMinus,
	BookmarkX,
	ChevronFirst,
	ChevronLast,
	ChevronLeft,
	ChevronRight,
	Clipboard,
	Copy,
	Save,
	// Settings,
	Undo2,
} from 'lucide-react';
import * as React from 'react';
import { ControlProps } from './ControlsProps';

export const Controls = (props: ControlProps) => {
	return (
		<React.Fragment>
			<div className="button-section">
				{props.disableNavigation ? null : (
					<React.Fragment>
						<button title="Begin" onClick={() => props.onBackButtonClick()}>
							<ChevronFirst strokeWidth={'2px'} />
						</button>
						<button title="Back" onClick={() => props.onBackButtonClick()}>
							<ChevronLeft strokeWidth={'2px'} />
						</button>
						<button title="Forward" onClick={() => props.onForwardButtonClick()}>
							<ChevronRight strokeWidth={'2px'} />
						</button>
						<button title="End" onClick={() => props.onForwardButtonClick()}>
							<ChevronLast strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
			</div>
			<div className="button-section">
				{props.disableCopy ? null : (
					<React.Fragment>
						<button title="Copy FEN" onClick={() => props.onCopyFenButtonClick()}>
							<Copy strokeWidth={'2px'} />
						</button>
						<button title="Copy PGN" onClick={() => props.onCopyPgnButtonClick()}>
							<Clipboard strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
				{props.readOnly ? null : (
					<button title="Save" onClick={() => props.onSaveButtonClick()}>
						<Save strokeWidth={'2px'} />
					</button>
				)}
				{props.readOnly ? null : (
					<button title="Undo" onClick={() => props.onUndoButtonClick()}>
						<Undo2 strokeWidth={'2px'} />
					</button>
				)}
			</div>
			<div className="button-section">
				{props.readOnly ? null : (
					<React.Fragment>
						<button title="Correct" onClick={() => props.onAnnotateMoveCorrect()}>
							<BookmarkCheck strokeWidth={'2px'} />
						</button>
						<button
							title="Inaccurate - ?!"
							onClick={() => props.onAnnotateMoveInaccurate()}
						>
							<Bookmark strokeWidth={'2px'} />
						</button>
						<button title="Mistake - ?" onClick={() => props.onAnnotateMoveMistake()}>
							<BookmarkMinus strokeWidth={'2px'} />
						</button>
						<button
							title="Blunder - ??"
							onClick={() => props.onAnnotateMoveBlunder()}
						>
							<BookmarkX strokeWidth={'2px'} />
						</button>
					</React.Fragment>
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
