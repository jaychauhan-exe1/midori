import type { CaretPosition, CursorType } from "@/src/types/typing";

interface CaretProps {
    position: CaretPosition;
    isTyping: boolean;
    type?: CursorType;
}

export const Caret = ({ position, isTyping, type = "line" }: CaretProps) => {
    const getCaretStyle = () => {
        switch (type) {
            case "block":
                return {
                    width: '12px',
                    backgroundColor: 'var(--primary)',
                    opacity: 0.5,
                };
            case "box":
                return {
                    width: '12px',
                    border: '2px solid var(--primary)',
                    backgroundColor: 'transparent',
                };
            case "underline":
                return {
                    width: '12px',
                    height: '2px',
                    marginTop: `${position.height - 2}px`,
                    backgroundColor: 'var(--primary)',
                };
            case "line":
            default:
                return {
                    width: '2px',
                    backgroundColor: 'var(--primary)',
                };
        }
    };

    const style = getCaretStyle();

    return (
        <div
            className={`absolute z-20 pointer-events-none transition-all duration-75 ease-out ${!isTyping ? "animate-caret-blink" : ""}`}
            style={{
                top: position.top,
                left: position.left,
                height: type === 'underline' ? '2px' : position.height,
                ...style,
                // Using a slightly faster transition for horizontal movement to prevent "glitching"
                transition: 'top 0.1s cubic-bezier(0.4, 0, 0.2, 1), left 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        />
    );
};
