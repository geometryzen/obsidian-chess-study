import {
	Bookmark,
	BookmarkCheck,
	BookmarkMinus,
	BookmarkX,
	ClipboardPlus,
	ClipboardMinus,
	ArrowBigLeft,
	ArrowBigRight,
	Film,
	Camera,
	Save,
	// Settings,
	Delete,
} from 'lucide-react';
import * as React from 'react';
import { ControlProps } from './ControlsProps';

export const Controls = (props: ControlProps) => {
	return (
		<React.Fragment>
			<div className="button-section">
				{props.disableNavigation ? null : (
					<React.Fragment>
						<button title="Back" onClick={() => props.onBackButtonClick()}>
							<ArrowBigLeft strokeWidth={'2px'} />
						</button>
						<button title="Forward" onClick={() => props.onForwardButtonClick()}>
							<ArrowBigRight strokeWidth={'2px'} />
						</button>
						<button
							title="Increase Position Evaluation"
							onClick={() => props.onIncreasePositionEvaluation()}
						>
							<ClipboardPlus color="blue" strokeWidth={'2px'} />
						</button>
						<button
							title="Decrease Position Evaluation"
							onClick={() => props.onDecreasePositionEvaluation()}
						>
							<ClipboardMinus color="blue" strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
			</div>
			<div className="button-section">
				{props.readOnly ? null : (
					<React.Fragment>
						<button
							title="Annotate Move as Correct or Acceptable"
							onClick={() => props.onAnnotateMoveCorrect()}
						>
							<BookmarkCheck color="blue" strokeWidth={'2px'} />
						</button>
						<button
							title="Annotate Move as Inaccurate (?!)"
							onClick={() => props.onAnnotateMoveInaccurate()}
						>
							<Bookmark color="blue" strokeWidth={'2px'} />
						</button>
						<button
							title="Annotate Move as a Mistake (?)"
							onClick={() => props.onAnnotateMoveMistake()}
						>
							<BookmarkMinus color="blue" strokeWidth={'2px'} />
						</button>
						<button
							title="Annotate Move as a Blunder (??)"
							onClick={() => props.onAnnotateMoveBlunder()}
						>
							<BookmarkX color="blue" strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
			</div>
			<div className="button-section">
				{props.disableCopy ? null : (
					<React.Fragment>
						<button
							title="Copy FEN to Clipboard"
							onClick={() => props.onCopyFenButtonClick()}
						>
							<Camera color="green" strokeWidth={'2px'} />
						</button>
						<button
							title="Copy PGN to Clipboard"
							onClick={() => props.onCopyPgnButtonClick()}
						>
							<Film color="green" strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
				{props.readOnly ? null : (
					<button title="Save" onClick={() => props.onSaveButtonClick()}>
						<Save color="purple" strokeWidth={'2px'} />
					</button>
				)}
				{props.readOnly ? null : (
					<button
						title="Delete Current Move"
						onClick={() => props.onDeleteButtonClick()}
					>
						<Delete color="purple" strokeWidth={'2px'} />
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
