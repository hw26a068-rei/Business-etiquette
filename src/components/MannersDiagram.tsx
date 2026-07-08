import React, { useState } from 'react';
import { DiagramType, DragDropConfig, DragDropItem, DragDropSlot } from '../types';
import { Check, X, RotateCcw, Info, User, HelpCircle, CornerDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { playSe } from '../utils/sound';

const getCharacterIllustration = (item: { id: string; name: string; role: string }) => {
  return null;
};

const renderAvatar = (item: { id: string; name: string; role: string; avatar: string }, sizeClass: string = "w-6 h-6") => {
  const imgSrc = getCharacterIllustration(item);
  if (imgSrc) {
    const idLower = item.id.toLowerCase();
    const nameLower = item.name.toLowerCase();
    const roleLower = item.role.toLowerCase();
    const isDirector = idLower === 'director' || nameLower.includes('部長') || roleLower.includes('部長');

    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-xs shrink-0`}>
        <img
          src={imgSrc}
          alt={item.name}
          className={`absolute max-w-none object-cover object-top transition-transform duration-300 hover:scale-105 ${
            isDirector 
              ? 'w-[90%] h-[90%] top-[2.5%]' 
              : 'w-[95%] h-[95%] top-[2%]'
          }`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }
  return <span className={sizeClass === "w-6 h-6" ? "text-sm" : "text-base"}>{item.avatar}</span>;
};

interface MannersDiagramProps {
  type?: DiagramType;
  selectedAnswerIndex?: number | null;
  isAnswered?: boolean;
  correctAnswerIndex?: number;
  dragDropConfig?: DragDropConfig;
  placement?: Record<string, string>; // slotId -> itemId
  onPlacementChange?: (placement: Record<string, string>, isComplete: boolean) => void;
}

export const MannersDiagram: React.FC<MannersDiagramProps> = ({
  type,
  selectedAnswerIndex,
  isAnswered,
  correctAnswerIndex,
  dragDropConfig,
  placement: externalPlacement,
  onPlacementChange
}) => {
  if (!type) return null;

  // Local state for placement as backup if not controlled from parent
  const [localPlacement, setLocalPlacement] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const placement = externalPlacement || localPlacement;

  const updatePlacement = (newPlacement: Record<string, string>) => {
    if (isAnswered) return;
    if (onPlacementChange && dragDropConfig) {
      // Check if all items in config are placed
      const placedItemIds = Object.values(newPlacement).filter(Boolean);
      const requiredItemIds = dragDropConfig.items.map(i => i.id);
      const isComplete = requiredItemIds.every(id => placedItemIds.includes(id));
      onPlacementChange(newPlacement, isComplete);
    } else {
      setLocalPlacement(newPlacement);
    }
  };

  const handlePlace = (itemId: string, slotId: string) => {
    if (isAnswered) return;
    
    // Create shallow copy of current placement
    const newPlacement = { ...placement };

    // If this item was placed in another slot, clear that slot first
    Object.keys(newPlacement).forEach(key => {
      if (newPlacement[key] === itemId) {
        newPlacement[key] = '';
      }
    });

    // If the target slot already had an item, return it to the bench (clear it)
    const existingItemAtSlot = newPlacement[slotId];
    
    // Assign new item to slot
    newPlacement[slotId] = itemId;

    updatePlacement(newPlacement);
    setSelectedItemId(null); // Clear selection after placing

    // Play drag-and-drop placement sound effect
    playSe('/ドラックアンドドロップ.wav');
  };

  const handleRemove = (slotId: string) => {
    if (isAnswered) return;
    const newPlacement = { ...placement };
    newPlacement[slotId] = '';
    updatePlacement(newPlacement);
    setSelectedItemId(null);
  };

  const handleReset = () => {
    if (isAnswered) return;

    // Play click sound
    playSe('/クリック.wav');

    updatePlacement({});
    setSelectedItemId(null);
  };

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnswered) return;

    // Play click sound
    playSe('/クリック.wav');

    if (selectedItemId === itemId) {
      // Toggle selection off
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  const handleSlotClick = (slotId: string) => {
    if (isAnswered) return;

    if (selectedItemId) {
      // Place selected item here (this will play the drag-and-drop sound)
      handlePlace(selectedItemId, slotId);
    } else if (placement[slotId]) {
      // Play click sound when selecting an already placed item
      playSe('/クリック.wav');

      // Clicked a filled slot - select the item to move or allow removal
      setSelectedItemId(placement[slotId]);
    }
  };

  // Get items that are not yet placed in any slot
  const placedItemIds = Object.values(placement).filter(Boolean);
  const unplacedItems = dragDropConfig?.items.filter(item => !placedItemIds.includes(item.id)) || [];

  // Card exchange does not use drag and drop, it is static illustration
  const renderCardExchange = () => {
    return (
      <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
        <span className="text-xs font-bold text-slate-500 mb-2 font-sans">【名刺交換のビジュアルイメージ】</span>
        
        <div className="relative w-full max-w-sm h-40 bg-white border border-slate-150 rounded-xl p-3 flex flex-col justify-between shadow-xs">
          {/* Top Hand: Recipient / Customer */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold font-sans">
              {isAnswered ? '【取引先・お客様】(高めの位置でキープ)' : '【取引先・お客様】'}
            </span>
            <div className="mt-0.5 w-32 h-10 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center shadow-2xs">
              <div className="w-26 h-6.5 bg-slate-100 border border-slate-400 rounded-md p-1.5 flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-700 font-bold">PRESIDENT CARD</span>
                <span className="text-[7px] bg-slate-300 px-1 rounded text-slate-700">相手</span>
              </div>
            </div>
          </div>

          {/* Spacer / Direction label */}
          <div className="flex justify-center items-center gap-1 my-0.5 min-h-[22px]">
            <CornerDownRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
            {isAnswered && (
              <span className="text-[10px] text-sky-800 font-extrabold bg-sky-50 px-2 py-0.5 rounded border border-sky-100 animate-fade-in">
                相手の名刺の下にくぐらせて差し出す
              </span>
            )}
          </div>

          {/* Bottom Hand: Yourself */}
          <div className="flex flex-col items-center">
            <div className={`w-32 h-10 rounded-lg flex items-center justify-center border shadow-2xs transition-all ${
              isAnswered
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-sky-50 border-sky-300 animate-pulse'
            }`}>
              <div className="w-26 h-6.5 bg-white border border-sky-400 rounded-md p-1.5 flex items-center justify-between">
                <span className="text-[8px] font-mono text-sky-800 font-bold">MY BUSINESS CARD</span>
                <span className="text-[7px] bg-sky-150 px-1 rounded text-sky-800 font-bold">自分</span>
              </div>
            </div>
            <span className="text-[10px] text-sky-900 font-extrabold mt-0.5 font-sans">
              {isAnswered ? '【自分】(両手で持ちつつ相手より低い位置で)' : '【自分】'}
            </span>
          </div>
        </div>

        {isAnswered && (
          <p className="text-[11px] text-slate-500 mt-2.5 text-center leading-relaxed font-sans max-w-xs animate-fade-in">
            名刺を同時に交換する場合は、**右手で自分の名刺を差し出し、左手で相手の名刺を同時に受け取る**のが実務上のスマートなマナーです。
          </p>
        )}
      </div>
    );
  };

  // Helper to render placed item in a slot
  const renderPlacedItem = (itemId: string, slotId: string) => {
    const item = dragDropConfig?.items.find(i => i.id === itemId);
    if (!item) return null;

    const isSlotCorrect = isAnswered && dragDropConfig?.slots.find(s => s.id === slotId)?.correctItemId === itemId;
    const isSlotIncorrect = isAnswered && !isSlotCorrect;

    return (
      <motion.div
        layoutId={`item-${item.id}`}
        onClick={(e) => {
          e.stopPropagation();
          handleRemove(slotId);
        }}
        className={`w-full h-full p-1 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all relative ${item.colorClass} ${
          isSlotCorrect ? 'ring-3 ring-emerald-500 ring-offset-1 bg-emerald-50/95 border-emerald-400' : ''
        } ${
          isSlotIncorrect ? 'ring-3 ring-rose-500 ring-offset-1 bg-rose-50/95 border-rose-300' : ''
        }`}
        title={isAnswered ? '' : 'クリックでベンチに戻す'}
      >
        <div className="flex flex-col items-center justify-center leading-none">
          {renderAvatar(item, "w-10 h-10")}
          <span className="text-[10px] font-extrabold text-slate-900 truncate max-w-[95px] mt-1">{item.name}</span>
        </div>
        <span className="text-[8px] text-slate-500 font-bold truncate max-w-[95px] leading-none mt-0.5">{item.role}</span>
        
        {/* Answer verification icons overlay */}
        {isAnswered && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs z-20">
            {isSlotCorrect ? (
              <div className="bg-emerald-600 rounded-full p-0.5"><Check className="w-3 h-3 stroke-[3]" /></div>
            ) : (
              <div className="bg-rose-600 rounded-full p-0.5"><X className="w-3 h-3 stroke-[3]" /></div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // If there's no drag-and-drop config, fallback to card exchange or static templates
  if (!dragDropConfig) {
    if (type === 'card_exchange') return renderCardExchange();
    return null;
  }

  // Check correct status for current slot
  const getSlotFeedbackStyle = (slot: DragDropSlot) => {
    if (!isAnswered) return 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50';
    
    const userPlacedId = placement[slot.id] || '';
    const isCorrect = userPlacedId === slot.correctItemId;

    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-50/40 text-emerald-950 border-2';
    } else {
      return 'border-rose-400 bg-rose-50/40 text-rose-950 border-2';
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full">
      {/* Interactive Title & Tutorial Banner */}
      <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Info className="w-4 h-4 text-slate-500" />
          <span>
            {isAnswered ? 'マナー配置の正誤結果' : '人物をドラッグ or タップして正しい位置に配置してください'}
          </span>
        </div>
        {!isAnswered && placedItemIds.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white border border-slate-200 px-2 py-1 rounded shadow-3xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            配置をリセット
          </button>
        )}
      </div>

      {/* Bench of Unplaced People (Items) */}
      {!isAnswered && (
        <div className="w-full bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            待機中の人物リスト ({unplacedItems.length}名)
          </span>
          <div className="flex flex-wrap gap-2.5 min-h-[44px]">
            {unplacedItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-lg py-2.5 text-[11px] font-medium text-slate-400 bg-slate-50">
                🎉 全員を配置しました！下の「回答を確定する」を押してください。
              </div>
            ) : (
              unplacedItems.map(item => {
                const isSelected = selectedItemId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layoutId={`item-${item.id}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', item.id);
                    }}
                    onClick={(e) => handleItemClick(item.id, e)}
                    className={`px-3.5 py-2 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all select-none shadow-xs ${item.colorClass} ${
                      isSelected 
                        ? 'ring-3 ring-slate-800 ring-offset-1 border-slate-800 scale-105 font-bold animate-pulse' 
                        : 'hover:scale-[1.03] hover:shadow-md'
                    }`}
                  >
                    {renderAvatar(item, "w-12 h-12")}
                    <div className="text-left">
                      <p className="text-sm font-extrabold leading-tight text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{item.role}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ILLUSTRATION CANVAS AREA */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[220px]">
        
        {/* Background visual graphics based on selection */}
        
        {/* 1. TAXI DIAGRAM */}
        {dragDropConfig.backgroundType === 'taxi' && (
          <div className="relative w-full max-w-sm aspect-[4/3] md:aspect-video bg-slate-100/50 border-4 border-slate-300 rounded-[32px] p-4 flex flex-col justify-between shadow-inner">
            {/* Front windshield line */}
            <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-slate-300"></div>
            
            {/* FRONT ROW (Driver and Passenger/Helper seat) */}
            <div className="flex justify-between items-center w-full px-4 z-10">
              {/* Front Left Slot: Passenger Seat (助手席) */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'passenger_seat')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-28 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div className="p-1">
                        <span className="text-[9px] font-bold block text-slate-400">助手席</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-200 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Front Right: Static occupied Driver seat */}
              <div className="w-24 h-18 bg-slate-200 border border-slate-300/80 rounded-xl flex flex-col items-center justify-center text-center shadow-3xs text-slate-500 font-sans">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-xs">👔</span>
                  <span className="text-xs font-bold text-slate-700">運転席</span>
                </div>
                <span className="text-[8px] font-bold text-slate-500 mt-0.5">(プロ)</span>
              </div>
            </div>

            {/* BACK ROW */}
            <div className="flex justify-between items-center w-full gap-2 px-1 z-10">
              {/* Back Left Slot */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'back_left')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative flex-1 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div className="p-1">
                        <span className="text-[9px] font-bold block text-slate-400">後部左</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Back Center Slot */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'back_center')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative flex-1 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div className="p-1">
                        <span className="text-[9px] font-bold block text-slate-400">後部中央</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Back Right Slot */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'back_right')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative flex-1 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div className="p-1">
                        <span className="text-[9px] font-bold block text-slate-400">後部右</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}
            </div>
            
            <div className="absolute top-1 right-5 text-[8px] font-bold text-slate-400">▼ 前・進行方向</div>
          </div>
        )}

        {/* 2. ROUND TABLE / ZASHIKI DIAGRAM */}
        {dragDropConfig.backgroundType === 'round_table' && (
          <div className="relative w-full max-w-sm h-[260px] bg-amber-50/20 border-2 border-amber-900/10 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xs">
            
            {/* Top Seat: Farthest from entry (Kamiza) */}
            {(() => {
              const slot = dragDropConfig.slots.find(s => s.id === 'farthest')!;
              const placedItemId = placement[slot.id];
              return (
                <div
                  onClick={() => handleSlotClick(slot.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const itemId = e.dataTransfer.getData('text/plain');
                    handlePlace(itemId, slot.id);
                  }}
                  className={`relative w-36 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all z-10 ${getSlotFeedbackStyle(slot)}`}
                >
                  {!placedItemId ? (
                    <div>
                      <span className="text-[9px] font-bold block text-slate-500">床の間側・奥席</span>
                      <span className="text-[8px] text-slate-600 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                        {slot.rankLabel}
                      </span>
                    </div>
                  ) : (
                    renderPlacedItem(placedItemId, slot.id)
                  )}
                </div>
              );
            })()}

            {/* Circular table and surrounding side seats */}
            <div className="flex justify-between items-center w-full px-1">
              
              {/* Left Side Seat */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'left_side');
                if (!slot) return <div className="w-24"></div>;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-24 h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all z-10 ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-500">左席</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-200 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Central Round Desk with beautiful plate decoration */}
              <div className="w-16 h-16 rounded-full bg-amber-100/40 border-2 border-amber-600/30 flex items-center justify-center text-center shadow-inner z-0">
                <div className="w-12 h-12 rounded-full border border-dashed border-amber-700/20 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-amber-900 font-extrabold leading-none">卓・お膳</span>
                  <span className="text-[7px] text-amber-700/60 font-bold mt-0.5">円卓料理</span>
                </div>
              </div>

              {/* Right Side Seat */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'right_side');
                if (!slot) return <div className="w-24"></div>;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-24 h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all z-10 ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-400">右席</span>
                        <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-1 rounded border border-slate-200 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Row: Near entry door (Shimoza) */}
            <div className="flex justify-between items-center w-full px-4">
              {/* Bottom Seat (Door Side) */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'near_door')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-36 h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all z-10 ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-500">出入り口近・手前席</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-200 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Door Visual */}
              <div className="w-16 h-5 bg-slate-200 border-x border-b border-slate-400 rounded-b flex items-center justify-center">
                <span className="text-[8px] font-extrabold text-slate-600">襖・出入り口</span>
              </div>
            </div>
            
            <div className="absolute top-2 left-3 text-[8px] text-amber-900/60 font-bold">【和室・床の間側】</div>
          </div>
        )}

        {/* 3. MEETING ROOM DIAGRAM */}
        {dragDropConfig.backgroundType === 'meeting_room' && (
          <div className="relative w-full max-w-sm h-[270px] bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            
            {/* Top Display Area (Windshield/Whiteboard style) */}
            <div className="flex justify-between items-center w-full px-2">
              <div className="w-16 h-5 bg-sky-50 border border-sky-300 rounded flex items-center justify-center text-[8px] text-sky-700 font-bold">
                プロジェクター
              </div>
              <div className="w-20 h-6 bg-slate-200 border border-slate-350 rounded flex items-center justify-center text-[9px] text-slate-700 font-extrabold">
                議長席（ホワイトボード側）
              </div>
              <div className="w-16 h-5 bg-sky-50 border border-sky-300 rounded flex items-center justify-center text-[8px] text-sky-700 font-bold">
                ホワイトボード
              </div>
            </div>

            {/* Long rectangular desk and side seats */}
            <div className="flex justify-between items-center w-full gap-2">
              {/* Left Side: Slots 1 & 3 */}
              <div className="flex flex-col gap-2 w-28">
                {/* Slot: Farthest Left */}
                {(() => {
                  const slot = dragDropConfig.slots.find(s => s.id === 'farthest_left')!;
                  const placedItemId = placement[slot.id];
                  return (
                    <div
                      onClick={() => handleSlotClick(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData('text/plain');
                        handlePlace(itemId, slot.id);
                      }}
                      className={`relative h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                    >
                      {!placedItemId ? (
                        <div>
                          <span className="text-[9px] font-bold block text-slate-500">左奥席 (司会近)</span>
                          <span className="text-[8px] text-slate-600 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                            {slot.rankLabel}
                          </span>
                        </div>
                      ) : (
                        renderPlacedItem(placedItemId, slot.id)
                      )}
                    </div>
                  );
                })()}

                {/* Slot: Near Left */}
                {(() => {
                  const slot = dragDropConfig.slots.find(s => s.id === 'near_left')!;
                  const placedItemId = placement[slot.id];
                  return (
                    <div
                      onClick={() => handleSlotClick(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData('text/plain');
                        handlePlace(itemId, slot.id);
                      }}
                      className={`relative h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                    >
                      {!placedItemId ? (
                        <div>
                          <span className="text-[9px] font-bold block text-slate-400">左手前席</span>
                          <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                            {slot.rankLabel}
                          </span>
                        </div>
                      ) : (
                        renderPlacedItem(placedItemId, slot.id)
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Central Wood Table */}
              <div className="flex-1 h-34 bg-amber-50/50 border border-amber-200 rounded-lg flex flex-col items-center justify-center text-center shadow-inner select-none">
                <span className="text-[10px] font-extrabold text-amber-900/60 font-sans">会議長机</span>
                <span className="text-[7px] text-slate-400 mt-1 font-bold">資料等</span>
              </div>

              {/* Right Side: Slots 2 & 4 */}
              <div className="flex flex-col gap-2 w-28">
                {/* Slot: Farthest Right */}
                {(() => {
                  const slot = dragDropConfig.slots.find(s => s.id === 'farthest_right')!;
                  const placedItemId = placement[slot.id];
                  return (
                    <div
                      onClick={() => handleSlotClick(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData('text/plain');
                        handlePlace(itemId, slot.id);
                      }}
                      className={`relative h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                    >
                      {!placedItemId ? (
                        <div>
                          <span className="text-[9px] font-bold block text-slate-500">右奥席</span>
                          <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                            {slot.rankLabel}
                          </span>
                        </div>
                      ) : (
                        renderPlacedItem(placedItemId, slot.id)
                      )}
                    </div>
                  );
                })()}

                {/* Slot: Near Right */}
                {(() => {
                  const slot = dragDropConfig.slots.find(s => s.id === 'near_right')!;
                  const placedItemId = placement[slot.id];
                  return (
                    <div
                      onClick={() => handleSlotClick(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData('text/plain');
                        handlePlace(itemId, slot.id);
                      }}
                      className={`relative h-16 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                    >
                      {!placedItemId ? (
                        <div>
                          <span className="text-[9px] font-bold block text-slate-500">右手前席</span>
                          <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                            {slot.rankLabel}
                          </span>
                        </div>
                      ) : (
                        renderPlacedItem(placedItemId, slot.id)
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom: Door entrance */}
            <div className="flex justify-end w-full px-2">
              <div className="w-20 h-5 bg-slate-200 border-x border-b border-slate-400 rounded-b flex items-center justify-center">
                <span className="text-[8px] font-extrabold text-slate-600">出入り口（ドア）</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. ELEVATOR DIAGRAM */}
        {dragDropConfig.backgroundType === 'elevator' && (
          <div className="relative w-full max-w-xs h-[300px] bg-slate-100 border-2 border-slate-350 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
            
            {/* Back row spots */}
            <div className="flex justify-between items-center w-full px-1">
              {/* Slot: Back Left */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'back_left')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-28 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-500">奥側・左</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Slot: Back Right */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'back_right')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-28 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-500">奥側・右 (最深)</span>
                        <span className="text-[8px] text-slate-600 font-bold bg-amber-50 px-1 rounded border border-amber-200 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Central spacing element - showing mirror visual */}
            <div className="w-full flex justify-center py-1">
              <div className="w-4/5 h-4 bg-sky-100/50 border border-sky-300 rounded flex items-center justify-center text-[7px] text-sky-700/80 font-bold">
                ⬜ 化粧鏡 (奥の鏡面壁)
              </div>
            </div>

            {/* Front row spots */}
            <div className="flex justify-between items-center w-full px-1">
              {/* Slot: Front Left */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'front_left')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-28 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-500">手前左 (操作盤前)</span>
                        <span className="text-[8px] text-slate-500 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}

              {/* Slot: Front Right */}
              {(() => {
                const slot = dragDropConfig.slots.find(s => s.id === 'front_right')!;
                const placedItemId = placement[slot.id];
                return (
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const itemId = e.dataTransfer.getData('text/plain');
                      handlePlace(itemId, slot.id);
                    }}
                    className={`relative w-28 h-18 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${getSlotFeedbackStyle(slot)}`}
                  >
                    {!placedItemId ? (
                      <div>
                        <span className="text-[9px] font-bold block text-slate-400">手前右</span>
                        <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-1 rounded border border-slate-250 mt-0.5 inline-block">
                          {slot.rankLabel}
                        </span>
                      </div>
                    ) : (
                      renderPlacedItem(placedItemId, slot.id)
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Front control panel & elevator sliding door */}
            <div className="w-full space-y-1 mt-2">
              <div className="flex justify-between items-center px-1">
                <div className="w-5 h-3 bg-slate-800 rounded-xs flex items-center justify-center text-[5px] text-white font-mono">
                  [◎]
                </div>
                <div className="text-[6px] font-bold text-slate-400">操作盤側 ◀</div>
              </div>
              <div className="border-t-2 border-slate-400 flex justify-center py-1 bg-slate-250 rounded-b">
                <div className="w-2/3 h-4 bg-slate-300 border border-slate-400 rounded-xs flex items-center justify-center text-[8px] text-slate-600 font-bold select-none">
                  ◀ エレベーターのドア ▶
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Answer Legend / Helper during quiz review */}
      {isAnswered && (
        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-sans shadow-2xs space-y-3.5">
          <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>【答えの比較】あなたの配置 vs 正しい配置</span>
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2 px-2">席の位置・役割</th>
                  <th className="py-2 px-2">あなたの配置</th>
                  <th className="py-2 px-2">正しい配置</th>
                  <th className="py-2 px-1 text-center">判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dragDropConfig.slots.map((slot) => {
                  const userPlacedItemId = placement[slot.id] || '';
                  const userPlacedItem = dragDropConfig.items.find(item => item.id === userPlacedItemId);
                  const correctItem = dragDropConfig.items.find(item => item.id === slot.correctItemId);
                  const isCorrect = userPlacedItemId === slot.correctItemId;

                  return (
                    <tr key={slot.id} className={`transition-colors hover:bg-slate-50/30 ${!isCorrect ? 'bg-rose-50/10' : ''}`}>
                      {/* Slot info */}
                      <td className="py-2.5 px-2 font-semibold text-slate-700">
                        <div className="flex flex-col">
                          <span>{slot.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({slot.rankLabel})</span>
                        </div>
                      </td>

                      {/* User placed item */}
                      <td className="py-2.5 px-2">
                        {userPlacedItem ? (
                          <span className={`inline-flex items-center gap-2 font-bold ${!isCorrect ? 'text-rose-600' : 'text-slate-700'}`}>
                            {renderAvatar(userPlacedItem, "w-8 h-8")}
                            <div className="flex flex-col justify-center leading-tight">
                              <span>{userPlacedItem.name}</span>
                              <span className="text-[9px] font-normal text-slate-500 mt-0.5">{userPlacedItem.role}</span>
                            </div>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">（空席）</span>
                        )}
                      </td>

                      {/* Correct item */}
                      <td className="py-2.5 px-2">
                        {correctItem ? (
                          <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                            {renderAvatar(correctItem, "w-8 h-8")}
                            <div className="flex flex-col justify-center leading-tight">
                              <span>{correctItem.name}</span>
                              <span className="text-[9px] font-normal text-slate-500 mt-0.5">{correctItem.role}</span>
                            </div>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">（空席）</span>
                        )}
                      </td>

                      {/* Verdict */}
                      <td className="py-2.5 px-1 text-center">
                        {isCorrect ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold" title="正解">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold" title="間違い">
                            ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Correct seating sequence helper description */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/50">
            <span className="font-extrabold text-slate-700 block mb-0.5">💡 配置ルールのおさらい</span>
            <p className="leading-normal">
              最も格式の高い席（上座・席次第1位）から順に、主賓や目上の人が座ります。
              自分や自社メンバー（下座・最下位）は最も入り口に近い席、または操作盤（エレベーターの場合）や乗降口（タクシーの場合）の前に配置するのが基本的なマナーです。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
