import { Input } from "@/components/ui/input"
import * as React from "react";
import { cn } from "@/lib/utils"

// React components receive one props object, not positional arguments
type RangeInputProps = React.ComponentProps<"input"> & {
    minPlaceholder?: string
    maxPlaceholder?: string
    minDefaultValue?: string | number
    maxDefaultValue?: string | number
}

export default function RangeInput({
                                       minPlaceholder,
                                       maxPlaceholder,
                                       minDefaultValue,
                                       maxDefaultValue,
                                       className,
                                       type,
                                       ...props
                                   }: RangeInputProps) {
    return (
        <div className="flex w-full max-w-sm items-center border border-input rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <Input
                type={type}
                placeholder={minPlaceholder}
                value={minDefaultValue}
                className={cn(
                    "border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    className
                )}
                {...props}
            />

            <div className="w-px h-6 bg-input" />

            <Input
                type={type}
                placeholder={maxPlaceholder}
                value={maxDefaultValue}
                className={cn(
                    "border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    className
                )}
                {...props}
            />
        </div>
    )
}