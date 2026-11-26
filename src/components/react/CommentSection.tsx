import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { MoveClassification } from '../../lib/classification';
import { ClassificationPicker } from './ClassificationPicker';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { hasComment } from '../../lib/comments';

interface CommentSectionProps {
	currentComment: JSONContent | null;
	setComments: (comment: JSONContent) => void;
	/** Which move the note belongs to, e.g. `4... h6`. */
	moveLabel: string | null;
	defaultOpen: boolean;
	classification: MoveClassification | null;
	onClassify: (classification: MoveClassification | null) => void;
	/** Read-only: the note is shown but cannot be written to. */
	isLocked: boolean;
}

export const CommentSection = React.memo(
	({
		currentComment,
		setComments,
		moveLabel,
		defaultOpen,
		classification,
		onClassify,
		isLocked,
	}: CommentSectionProps) => {
		const [isOpen, setIsOpen] = useState(defaultOpen);

		// The root position has no move to hang a note on, and a locked
		// repertoire has no note it will accept. The chip in the header says
		// which of the two it is, since the placeholder can only speak for the
		// first: it is read when the editor is built, so it cannot answer for a
		// lock put on afterwards.
		const isEditable = Boolean(moveLabel) && !isLocked;

		const editor = useEditor({
			extensions: [
				StarterKit.configure({
					/*
					placeholder: ({ editor: instance }) =>
						instance.isEditable
							? 'Add a note for this move…'
							: 'Select a move to add a note to it.',
					*/
					// The prompt is the panel's only content when there is no note,
					// so it has to be there before the cursor is, and when the panel
					// is read-only because no move is selected.
					// showOnlyCurrent: false,
					// showOnlyWhenEditable: false,
					// Disable the ordered list extension because of conflicts with move numbers.
					orderedList: false,
				}),
			],
			onUpdate: (state) => {
				const comment = state.editor.getJSON();
				if (comment) setComments(comment);
			},
		});

		useEffect(() => {
			if (!editor) return;
			const { from, to } = editor.state.selection;
			if (currentComment) {
				// TODO: How to upgrade from 2.x to 3.x?
				/*
				editor.commands.setContent(currentComment, false, {
					preserveWhitespace: true,
				});
				*/
				editor.commands.setContent(currentComment, {
					// Loading a note into the editor is not an edit of it. Left to
					// emit, the load is reported as a change and written straight
					// back, which is how a note was lost on the way out of a drill.
					emitUpdate: false,
					parseOptions: { preserveWhitespace: true },
				});
			} else {
				editor.commands.clearContent();
			}
			editor.commands.setTextSelection({ from, to });
		}, [currentComment, editor]);

		const hasNote = hasComment(currentComment);

		return (
			<div className={`cs-notes ${isOpen ? 'is-open' : 'is-collapsed'}`}>
				<button
					className="cs-notes-header"
					onClick={() => setIsOpen((open) => !open)}
					aria-expanded={isOpen}
					title={isOpen ? 'Hide notes' : 'Show notes'}
				>
					{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					<span className="cs-notes-title">Notes</span>
					{moveLabel && <span className="cs-notes-chip">{moveLabel}</span>}
					{isLocked && <span className="cs-notes-chip">Locked</span>}
					{hasNote && !isOpen && <span className="cs-notes-dot" />}
				</button>
				{isOpen && (
					<>
						<ClassificationPicker
							classification={classification}
							onClassify={onClassify}
							disabled={!isEditable}
						/>
						<div className={`cs-notes-body${isEditable ? '' : ' is-disabled'}`}>
							<EditorContent editor={editor} />
						</div>
					</>
				)}
			</div>
		);
	},
);

CommentSection.displayName = 'CommentSection';
