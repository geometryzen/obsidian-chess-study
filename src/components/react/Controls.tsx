import {
	ArrowBigLeft,
	ArrowBigRight,
	BookmarkMinus,
	BookmarkPlus,
	Camera,
	ClipboardMinus,
	ClipboardPlus,
	Delete,
	Film,
	RotateCcw,
	Save,
	ThumbsDown,
	ThumbsUp,
} from 'lucide-react';
import * as React from 'react';
import { ControlProps } from './ControlsProps';
import {
	CHESS_STUDY_KIND_GAME,
	CHESS_STUDY_KIND_LEGACY,
	CHESS_STUDY_KIND_MEMORIZE,
	CHESS_STUDY_KIND_POSITION,
	CHESS_STUDY_KIND_PUZZLE,
	CHESS_STUDY_KIND_REPERTOIRE,
	ChessStudyKind,
} from '../../lib/config/ChessStudyKind';

function has_reset_feature(chessStudyKind: ChessStudyKind): boolean {
	switch (chessStudyKind) {
		case CHESS_STUDY_KIND_REPERTOIRE:
		case CHESS_STUDY_KIND_MEMORIZE:
		case CHESS_STUDY_KIND_PUZZLE: {
			return true;
		}
		case CHESS_STUDY_KIND_GAME:
		case CHESS_STUDY_KIND_LEGACY:
		case CHESS_STUDY_KIND_POSITION: {
			return false;
		}
		default: {
			return false;
		}
	}
}

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
					</React.Fragment>
				)}
				{has_reset_feature(props.chessStudyKind) ? (
					<React.Fragment>
						<button title="Reset" onClick={() => props.onResetButtonClick()}>
							<RotateCcw strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				) : null}
				{props.readOnly ? null : (
					<React.Fragment>
						<button
							title="Promote Line"
							disabled={false}
							onClick={() => props.onPromoteLine()}
						>
							<ThumbsUp strokeWidth={'2px'} />
						</button>
						<button
							title="Demote Line"
							disabled={false}
							onClick={() => props.onDemoteLine()}
						>
							<ThumbsDown strokeWidth={'2px'} />
						</button>
					</React.Fragment>
				)}
			</div>
			{props.readOnly ? null : (
				<div className="button-section">
					<button
						title="Increase Move Annotation"
						onClick={() => props.onIncreaseMoveAnnotation()}
					>
						<BookmarkPlus color="blue" strokeWidth={'2px'} />
					</button>
					<button
						title="Decrease Move Annotation"
						onClick={() => props.onDecreaseMoveAnnotation()}
					>
						<BookmarkMinus color="blue" strokeWidth={'2px'} />
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
				</div>
			)}
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
				{props.disableSave || props.readOnly ? null : (
					<button title="Save" onClick={() => props.onSaveButtonClick()}>
						<Save color="purple" strokeWidth={'2px'} />
					</button>
				)}
				{props.readOnly ? null : (
					<button
						title="Delete Current Move"
						onClick={() => props.onDeleteButtonClick(props.currentMoveId as string)}
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
