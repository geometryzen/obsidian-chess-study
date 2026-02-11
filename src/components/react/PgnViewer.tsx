import * as React from 'react';
import { useMemo } from 'react';
import { chunkArray } from '../../lib/lang/chunkArray';
import { Controls } from './Controls';
import { MoveItem, VariantMoveItem } from './MoveItem';
import { PgnViewerProps } from './PgnViewerProps';

export const VariantMoveItemContainer = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <div className="variant-move-item-container">{children}</div>;
};

export const VariantContainer = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <div className="variant-container">{children}</div>;
};

export const VariantsContainer = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <div className="variants-container">{children}</div>;
};

export const PgnViewer = React.memo((props: PgnViewerProps) => {
	const {
		history,
		currentMoveId,
		initialPlayer,
		initialMoveNumber,
		isVisible,
		onMoveItemClick,
		...controlActions
	} = props;

	// Split the moves into [White, Black] pairs.
	// Notice that chunkArray does not give quite the result you might expect for the first pair when the initial player is Black.
	// The first element in such a case contains a single move which is really Black's, but it is in the first position.
	// This requires us
	const main_move_pairs = useMemo(
		() => chunkArray(history, 2, initialPlayer === 'b'),
		[initialPlayer, history],
	);

	return (
		<div className="height-width-100">
			{isVisible && (
				<div className="move-item-section">
					<div className="move-item-container">
						{main_move_pairs.map((pair, main_move_pairs_index) => {
							// In general this pair correctly contains White and Black moves.
							// However, for the first move when Black is the initial player,
							// bMove will be empty and wMove will contain the move by the Black player
							const [white_main_move, black_main_move] = pair;
							// console.lg("wMove", JSON.stringify(wMove,null,2))
							// console.lg("bMove", JSON.stringify(bMove,null,2))

							return (
								<React.Fragment
									key={
										white_main_move.san + black_main_move?.san + main_move_pairs_index
									}
								>
									<p className="move-indicator center">
										{main_move_pairs_index + initialMoveNumber}
									</p>
									{
										// Special logic here because of the chunking into pairs.
										initialPlayer === 'b' &&
											!black_main_move &&
											main_move_pairs_index === 0 && (
												<MoveItem
													san={'...'}
													nags={[]}
													isCurrentMove={false}
													onMoveItemClick={() => {}}
												/>
											)
									}
									<MoveItem
										san={white_main_move.san}
										nags={white_main_move.nags}
										isCurrentMove={white_main_move.moveId === currentMoveId}
										onMoveItemClick={() => onMoveItemClick(white_main_move.moveId)}
									/>
									{!!white_main_move?.variants.length && (
										<React.Fragment>
											<MoveItem
												san={'...'}
												nags={[]}
												isCurrentMove={false}
												onMoveItemClick={() => {}}
											/>
											<VariantsContainer>
												<VariantContainer>
													{white_main_move.variants.map((variant) => {
														return (
															<VariantMoveItemContainer key={variant.variantId}>
																{chunkArray(variant.moves, 2).map((pair, wMoveVarianti) => {
																	const [white_variation_move, black_variation_move] = pair;

																	return (
																		<React.Fragment
																			key={
																				white_variation_move.san +
																				black_variation_move?.san +
																				main_move_pairs_index
																			}
																		>
																			<VariantMoveItem
																				isCurrentMove={
																					white_variation_move.moveId === currentMoveId
																				}
																				san={white_variation_move.san}
																				nags={white_variation_move.nags}
																				onMoveItemClick={() =>
																					onMoveItemClick(white_variation_move.moveId)
																				}
																				moveIndicator={`${
																					main_move_pairs_index +
																					initialMoveNumber +
																					0 +
																					wMoveVarianti
																				}. `}
																			/>
																			{
																				// Black's move in a white variation never needs a move indicator.
																				black_variation_move && (
																					<VariantMoveItem
																						isCurrentMove={
																							black_variation_move.moveId === currentMoveId
																						}
																						san={black_variation_move.san}
																						nags={black_variation_move.nags}
																						onMoveItemClick={() =>
																							onMoveItemClick(black_variation_move.moveId)
																						}
																					/>
																				)
																			}
																		</React.Fragment>
																	);
																})}
															</VariantMoveItemContainer>
														);
													})}
												</VariantContainer>
											</VariantsContainer>
										</React.Fragment>
									)}
									{black_main_move && !!white_main_move?.variants.length && (
										<React.Fragment>
											<p className="move-indicator center">
												{main_move_pairs_index + initialMoveNumber}
											</p>
											<MoveItem
												san={'...'}
												nags={[]}
												isCurrentMove={false}
												onMoveItemClick={() => {}}
											/>
										</React.Fragment>
									)}
									{black_main_move && (
										<MoveItem
											san={black_main_move.san}
											nags={black_main_move.nags}
											isCurrentMove={black_main_move.moveId === currentMoveId}
											onMoveItemClick={() => onMoveItemClick(black_main_move.moveId)}
										/>
									)}
									{!!black_main_move?.variants.length && (
										<VariantsContainer>
											{!!black_main_move?.variants.length && (
												<VariantContainer>
													{black_main_move.variants.map((variant) => {
														return (
															<VariantMoveItemContainer key={variant.variantId}>
																{chunkArray(variant.moves, 2).map((pair, bMoveVarianti) => {
																	const [black_variation_move, white_variation_move] = pair;
																	return (
																		<React.Fragment
																			key={
																				black_variation_move.san +
																				white_variation_move?.san +
																				main_move_pairs_index
																			}
																		>
																			<VariantMoveItem
																				isCurrentMove={
																					black_variation_move.moveId === currentMoveId
																				}
																				san={black_variation_move.san}
																				nags={black_variation_move.nags}
																				onMoveItemClick={() =>
																					onMoveItemClick(black_variation_move.moveId)
																				}
																				moveIndicator={
																					bMoveVarianti === 0
																						? `${
																								main_move_pairs_index +
																								initialMoveNumber +
																								0 /* was 1 */ +
																								bMoveVarianti
																							}... `
																						: null
																				}
																			/>
																			{
																				// White's moves in a Black variation
																				white_variation_move && (
																					<VariantMoveItem
																						isCurrentMove={
																							white_variation_move.moveId === currentMoveId
																						}
																						san={white_variation_move.san}
																						nags={white_variation_move.nags}
																						onMoveItemClick={() =>
																							onMoveItemClick(white_variation_move.moveId)
																						}
																						moveIndicator={`${
																							main_move_pairs_index +
																							initialMoveNumber +
																							1 +
																							bMoveVarianti
																						}. `}
																					/>
																				)
																			}
																		</React.Fragment>
																	);
																})}
															</VariantMoveItemContainer>
														);
													})}
												</VariantContainer>
											)}
										</VariantsContainer>
									)}
								</React.Fragment>
							);
						})}
					</div>
				</div>
			)}
			<Controls {...controlActions} />
		</div>
	);
});

PgnViewer.displayName = 'PgnViewer';
