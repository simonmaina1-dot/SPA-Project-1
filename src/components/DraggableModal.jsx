import { useEffect, useRef, useState } from "react";

export default function DraggableModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: null,
  });

  useEffect(() => {
    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    dragState.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current.dragging) {
      return;
    }
    const nextX = dragState.current.originX + (event.clientX - dragState.current.startX);
    const nextY = dragState.current.originY + (event.clientY - dragState.current.startY);
    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (event) => {
    dragState.current.dragging = false;
    if (dragState.current.pointerId !== null) {
      event.currentTarget.releasePointerCapture(dragState.current.pointerId);
    }
    dragState.current.pointerId = null;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal draggable-modal"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="modal-header draggable-header"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <h3>{title}</h3>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            x
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}
