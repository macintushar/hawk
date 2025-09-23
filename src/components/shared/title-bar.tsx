type TitleBarProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  leftElement?: React.ReactNode;
};

export default function TitleBar({
  title,
  description,
  children,
  leftElement,
}: TitleBarProps) {
  return (
    <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
      <div className="flex flex-col items-center space-y-4 space-x-6 sm:flex-row sm:space-y-0">
        {leftElement && <div>{leftElement}</div>}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
