import type { CaretPosition } from "@/src/types/typing";

interface CaretProps {
    position: CaretPosition;
    isTyping: boolean;
}

export const Caret = ({ position, isTyping }: CaretProps) => {
    return (
        <div
            className={`absolute w-[2px] bg-primary z-20 pointer-events-none ${!isTyping ? "animate-caret-blink" : ""}`}
            style={{
                top: position.top,
                left: position.left,
                height: position.height,
                transition: 'top 0.1s cubic-bezier(0.4, 0, 0.2, 1), left 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        />
    );
};