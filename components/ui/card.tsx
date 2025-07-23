import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col border shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "gap-6 rounded-xl py-6",
        optical: "optical-card gap-phi-lg hover:shadow-lg",
        golden: "gap-phi-lg rounded-phi-md p-phi-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.ComponentProps<"div"> {
  golden?: boolean;
}

function CardHeader({ className, golden, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        golden ? "gap-phi-sm px-phi-xl pb-phi-lg" : "gap-1.5 px-6 [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

interface CardContentProps extends React.ComponentProps<"div"> {
  golden?: boolean;
}

function CardContent({ className, golden, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        golden ? "px-phi-xl" : "px-6",
        className
      )}
      {...props}
    />
  )
}

interface CardFooterProps extends React.ComponentProps<"div"> {
  golden?: boolean;
}

function CardFooter({ className, golden, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        golden ? "px-phi-xl pt-phi-lg" : "px-6 [.border-t]:pt-6",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
