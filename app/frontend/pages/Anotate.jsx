import { useEffect, useRef, useState } from "react";

const MARKER_TEXT = "pregúntarle a la autora";
const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;

const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.content;

async function apiCreateMarker({ page, x, y }) {
  const response = await fetch("/anotate/markers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken(),
      Accept: "application/json",
    },
    body: JSON.stringify({ pdf_marker: { page, x, y } }),
  });
  if (!response.ok) throw new Error(`create failed: ${response.status}`);
  return response.json();
}

async function apiDeleteMarker(id) {
  const response = await fetch(`/anotate/markers/${id}`, {
    method: "DELETE",
    headers: { "X-CSRF-Token": csrfToken(), Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`delete failed: ${response.status}`);
}

const markerClasses =
  "absolute -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap " +
  "text-sm font-semibold text-red-600 underline";

function Marker({ marker, onDelete }) {
  const pending = marker.pending === true;

  return (
    <span
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (!pending) onDelete(marker);
      }}
      className={`${markerClasses} ${
        pending ? "cursor-default opacity-70" : "cursor-pointer"
      }`}
      style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
    >
      {MARKER_TEXT}
    </span>
  );
}

function Page({ page, aspect, markers, onPlace, onDelete }) {
  const containerRef = useRef(null);
  const pressRef = useRef(null);
  const pointerRef = useRef(null);
  const draggingRef = useRef(false);
  const [provisional, setProvisional] = useState(null);

  useEffect(
    () => () => {
      if (pressRef.current) clearTimeout(pressRef.current.timer);
      pressRef.current = null;
      pointerRef.current = null;
      draggingRef.current = false;
    },
    []
  );

  // While dragging a provisional marker, block touch scrolling so the
  // drag tracks the finger instead of panning the document.
  useEffect(() => {
    if (!provisional) return undefined;
    const block = (e) => e.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });
    return () => document.removeEventListener("touchmove", block);
  }, [provisional]);

  const fractionFor = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    return {
      x: clamp((clientX - rect.left) / rect.width),
      y: clamp((clientY - rect.top) / rect.height),
    };
  };

  const clearInteraction = () => {
    if (pressRef.current) clearTimeout(pressRef.current.timer);
    pressRef.current = null;
    draggingRef.current = false;
    setProvisional(null);

    const pointerId = pointerRef.current;
    pointerRef.current = null;
    if (
      pointerId !== null &&
      containerRef.current?.hasPointerCapture(pointerId)
    ) {
      containerRef.current.releasePointerCapture(pointerId);
    }
  };

  const handlePointerDown = (e) => {
    if (pointerRef.current !== null) return;
    const { clientX, clientY, pointerId } = e;
    containerRef.current.setPointerCapture(pointerId);
    pointerRef.current = pointerId;
    pressRef.current = {
      startX: clientX,
      startY: clientY,
      timer: setTimeout(() => {
        if (pointerRef.current !== pointerId) return;
        pressRef.current = null;
        draggingRef.current = true;
        setProvisional(fractionFor(clientX, clientY));
      }, LONG_PRESS_MS),
    };
  };

  const handlePointerMove = (e) => {
    if (e.pointerId !== pointerRef.current) return;
    if (draggingRef.current) {
      setProvisional(fractionFor(e.clientX, e.clientY));
    } else if (pressRef.current) {
      const dx = e.clientX - pressRef.current.startX;
      const dy = e.clientY - pressRef.current.startY;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearInteraction();
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerId !== pointerRef.current) return;
    const position = draggingRef.current
      ? fractionFor(e.clientX, e.clientY)
      : null;
    clearInteraction();
    if (position) onPlace(page, position);
  };

  const handlePointerCancel = (e) => {
    if (e.pointerId === pointerRef.current) clearInteraction();
  };

  const handleLostPointerCapture = (e) => {
    if (e.pointerId === pointerRef.current) clearInteraction();
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ aspectRatio: `1 / ${aspect}`, WebkitTouchCallout: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={`/anotate/pages/${page}`}
        loading="lazy"
        alt={`Página ${page}`}
        draggable="false"
        className="pointer-events-none h-full w-full select-none"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} marker={marker} onDelete={onDelete} />
      ))}
      {provisional && (
        <span
          className={`${markerClasses} pointer-events-none opacity-70`}
          style={{
            left: `${provisional.x * 100}%`,
            top: `${provisional.y * 100}%`,
          }}
        >
          {MARKER_TEXT}
        </span>
      )}
    </div>
  );
}

export default function Anotate({ pageCount, pageAspect, markers: initialMarkers }) {
  const [markers, setMarkers] = useState(initialMarkers);

  const place = async (page, { x, y }) => {
    const temp = { id: `temp-${Date.now()}`, page, x, y, pending: true };
    setMarkers((current) => [...current, temp]);
    try {
      const saved = await apiCreateMarker({ page, x, y });
      setMarkers((current) =>
        current.map((m) => (m.id === temp.id ? saved : m))
      );
    } catch {
      setMarkers((current) => current.filter((m) => m.id !== temp.id));
      alert("No se pudo guardar el marcador");
    }
  };

  const remove = async (marker) => {
    if (marker.pending) return;
    setMarkers((current) => current.filter((m) => m.id !== marker.id));
    try {
      await apiDeleteMarker(marker.id);
    } catch {
      setMarkers((current) => [...current, marker]);
      alert("No se pudo borrar el marcador");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <Page
          key={page}
          page={page}
          aspect={pageAspect}
          markers={markers.filter((m) => m.page === page)}
          onPlace={place}
          onDelete={remove}
        />
      ))}
    </div>
  );
}
