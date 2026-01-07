'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';

interface Seat {
    id: string;
    label: string;
    row: number;
    column: number;
    status: 'available' | 'reserved' | 'sold';
    x?: number;
    y?: number;
}

interface SeatMapProps {
    seats: Seat[];
    onSeatSelect?: (seatId: string) => void;
    primaryColor?: string;
}

const SeatMap = forwardRef(({ seats, onSeatSelect, primaryColor = '#3b82f6' }: SeatMapProps, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);

    const [transform, setTransform] = useState({ x: 50, y: 50, scale: 0.8 });
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const SEAT_SIZE = 24;
    const SEAT_PADDING = 8;
    const BORDER_RADIUS = 6;

    // Initialize Shadow DOM and Event Listeners
    useEffect(() => {
        if (containerRef.current && !shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

            const style = document.createElement('style');
            style.textContent = `
        :host {
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0f172a;
          position: relative;
          cursor: grab;
          user-select: none;
          touch-action: none;
        }
        :host(.dragging) { cursor: grabbing; }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        .interaction-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 10;
        }
      `;
            shadowRootRef.current.appendChild(style);

            const canvas = document.createElement('canvas');
            const hoverCanvas = document.createElement('canvas');
            const interactionLayer = document.createElement('div');
            interactionLayer.className = 'interaction-layer';

            shadowRootRef.current.appendChild(canvas);
            shadowRootRef.current.appendChild(hoverCanvas);
            shadowRootRef.current.appendChild(interactionLayer);

            (canvasRef as any).current = canvas;
            (hoverCanvasRef as any).current = hoverCanvas;

            // Interaction Events
            const handleMouseDown = (e: MouseEvent) => {
                isDragging.current = true;
                lastMousePos.current = { x: e.clientX, y: e.clientY };
                containerRef.current?.classList.add('dragging');
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (isDragging.current) {
                    const dx = e.clientX - lastMousePos.current.x;
                    const dy = e.clientY - lastMousePos.current.y;
                    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
                    lastMousePos.current = { x: e.clientX, y: e.clientY };
                } else {
                    // Check for hits
                    const rect = containerRef.current!.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    // Transform mouse to world coordinates
                    const worldX = (mouseX - transform.x) / transform.scale;
                    const worldY = (mouseY - transform.y) / transform.scale;

                    // Simple hit test
                    const hit = seats.find(seat => {
                        const sx = seat.column * (SEAT_SIZE + SEAT_PADDING);
                        const sy = seat.row * (SEAT_SIZE + SEAT_PADDING);
                        return worldX >= sx && worldX <= sx + SEAT_SIZE && worldY >= sy && worldY <= sy + SEAT_SIZE;
                    });

                    if (hit) {
                        containerRef.current!.style.cursor = 'pointer';
                    } else {
                        containerRef.current!.style.cursor = isDragging.current ? 'grabbing' : 'grab';
                    }
                }
            };

            const handleMouseUp = (e: MouseEvent) => {
                if (isDragging.current) {
                    isDragging.current = false;
                    containerRef.current?.classList.remove('dragging');
                } else {
                    // Click check
                    const rect = containerRef.current!.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const worldX = (mouseX - transform.x) / transform.scale;
                    const worldY = (mouseY - transform.y) / transform.scale;

                    const hit = seats.find(seat => {
                        const sx = seat.column * (SEAT_SIZE + SEAT_PADDING);
                        const sy = seat.row * (SEAT_SIZE + SEAT_PADDING);
                        return worldX >= sx && worldX <= sx + SEAT_SIZE && worldY >= sy && worldY <= sy + SEAT_SIZE;
                    });

                    if (hit && hit.status === 'available' && onSeatSelect) {
                        onSeatSelect(hit.id);
                    }
                }
            };

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                const delta = -e.deltaY;
                const factor = Math.pow(1.1, delta / 100);

                setTransform(prev => {
                    const nextScale = Math.min(Math.max(prev.scale * factor, 0.1), 5);
                    // Zoom towards mouse
                    const rect = containerRef.current!.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const worldX = (mouseX - prev.x) / prev.scale;
                    const worldY = (mouseY - prev.y) / prev.scale;

                    return {
                        x: mouseX - worldX * nextScale,
                        y: mouseY - worldY * nextScale,
                        scale: nextScale
                    };
                });
            };

            interactionLayer.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            interactionLayer.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
                interactionLayer.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                interactionLayer.removeEventListener('wheel', handleWheel);
            };
        }
    }, [seats, transform, onSeatSelect]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.scale(dpr, dpr);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        const availableColor = '#1e293b';
        const borderColor = '#334155';
        const soldColor = '#1e293b';
        const reservedColor = primaryColor;

        seats.forEach(seat => {
            const x = seat.column * (SEAT_SIZE + SEAT_PADDING);
            const y = seat.row * (SEAT_SIZE + SEAT_PADDING);

            // Path and Fill
            ctx.beginPath();
            // Round rect polyfill for older browsers if needed, but modern chrome/safari support it
            (ctx as any).roundRect(x, y, SEAT_SIZE, SEAT_SIZE, BORDER_RADIUS);

            if (seat.status === 'available') {
                ctx.fillStyle = availableColor;
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
            } else if (seat.status === 'sold') {
                ctx.fillStyle = '#020617';
                ctx.fill();
                // Draw an X
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 6, y + 6);
                ctx.lineTo(x + SEAT_SIZE - 6, y + SEAT_SIZE - 6);
                ctx.moveTo(x + SEAT_SIZE - 6, y + 6);
                ctx.lineTo(x + 6, y + SEAT_SIZE - 6);
                ctx.stroke();
            } else {
                ctx.fillStyle = reservedColor;
                ctx.fill();
            }
        });

    }, [seats, transform, primaryColor]);

    useEffect(() => {
        const render = () => {
            draw();
            requestAnimationFrame(render);
        };
        const req = requestAnimationFrame(render);
        return () => cancelAnimationFrame(req);
    }, [draw]);

    useEffect(() => {
        if (shadowRootRef.current) {
            // Clear existing a11y container if any
            const existing = shadowRootRef.current.querySelector('.a11y-container');
            if (existing) existing.remove();

            const a11yContainer = document.createElement('div');
            a11yContainer.className = 'a11y-container';
            // Visually hidden styles
            a11yContainer.style.position = 'absolute';
            a11yContainer.style.width = '1px';
            a11yContainer.style.height = '1px';
            a11yContainer.style.padding = '0';
            a11yContainer.style.overflow = 'hidden';
            a11yContainer.style.clip = 'rect(0,0,0,0)';
            a11yContainer.style.whiteSpace = 'nowrap';
            a11yContainer.style.border = '0';

            seats.forEach(seat => {
                if (seat.status === 'available') {
                    const btn = document.createElement('button');
                    btn.textContent = `Select Seat ${seat.label}`;
                    btn.setAttribute('aria-label', `Select Seat ${seat.label}`);
                    btn.onclick = () => onSeatSelect?.(seat.id);
                    btn.setAttribute('data-testid', `seat-${seat.label}`);
                    a11yContainer.appendChild(btn);
                }
            });
            shadowRootRef.current.appendChild(a11yContainer);
        }
    }, [seats, onSeatSelect]);

    useEffect(() => {
        if (containerRef.current && canvasRef.current && hoverCanvasRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            [canvasRef.current, hoverCanvasRef.current].forEach(cvs => {
                cvs.width = width * dpr;
                cvs.height = height * dpr;
                cvs.style.width = `${width}px`;
                cvs.style.height = `${height}px`;
            });
        }
    }, [seats]);

    return <div ref={containerRef} className="w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/5" />;
});

SeatMap.displayName = 'SeatMap';

export default SeatMap;
