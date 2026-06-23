type ReadingPoolProps = {
  children: React.ReactNode;
  className?: string;
};

export function ReadingPool({ children, className = "" }: ReadingPoolProps) {
  return <div className={`reading-pool${className ? ` ${className}` : ""}`}>{children}</div>;
}
