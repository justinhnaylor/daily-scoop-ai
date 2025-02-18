import { cn } from "@/lib/utils"

const TypographyH1 = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-foreground text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
    >
      {children}
    </h1>
  )
}

const TypographyH2 = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-foreground border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
    >
      {children}
    </h2>
  )
}

const TypographyH3 = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-foreground text-2xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h3>
  )
}

const TypographyH4 = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-foreground text-xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h4>
  )
}

const TypographyP = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  )
}

const TypographyBlockquote = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  )
}

const TypographyTable = ({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) => {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">
        <thead>
          <tr className="m-0 border-t p-0 even:bg-muted">
            {headers.map((header, index) => (
              <th
                key={index}
                className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="m-0 border-t p-0 even:bg-muted">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TypographyList = ({
  items,
  className,
}: {
  items: string[]
  className?: string
}) => {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

const TypographyLead = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>
  )
}

const TypographyLarge = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("text-lg font-semibold", className)}>{children}</div>
  )
}

const TypographySmall = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <small className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </small>
  )
}

const TypographyMuted = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  )
}

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyTable,
  TypographyList,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
}
