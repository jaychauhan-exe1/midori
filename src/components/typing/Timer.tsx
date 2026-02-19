export const Timer = ({ timeLeft }: { timeLeft: number }) => {
    return (
        <div className="text-4xl font-black text-primary/40 tabular-nums">
            {timeLeft}
        </div>
    );
};