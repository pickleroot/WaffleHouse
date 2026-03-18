import { Input } from "@/components/ui/input"
import RangeInput from "@/components/RangeInput.tsx";
import {
    Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList, ComboboxValue, useComboboxAnchor,
} from "@/components/ui/combobox"
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";
import React from "react"
import { cn } from "@/lib/utils"
import {Toggle} from "@/components/ui/toggle.tsx";

// TODO QUESTION: Do we do parsing and filtering here, or do we have to call the API again? (then maybe intersect the results?)
// TODO QUESTION: Should I make the filters a sidebar? I think yes since there's so many fields...

// TODO: replace these with API calls
const departments = [
    "ACCT",
    "COMP",
    "MATH",
    "HUMA",
    "ENGL",
] as const

const professors = [
    "Jon Hutchins",
    "Brian Dickinson",
    "Britton Wolfe"
] as const

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

export default function FilterGroup({className}: React.ComponentProps<"div">) {
    const weekAnchor = useComboboxAnchor()
//     const profAnchor = useComboboxAnchor()

    return (
        <FieldGroup className={cn("grid grid-cols-7", className)}>
        {/* Only show open courses */}
        {/* <Field>
            <FieldLabel htmlFor="hide-full">Hide full courses</FieldLabel>
            <Toggle id="hide-full" variant="outline" aria-label="Toggle for hiding full courses" size="default">
                Hide
            </Toggle>
        </Field> */}

        {/* TODO: Semester */}

        {/* Department: Single select */}
        <Field>
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <Combobox items={departments}>
                <ComboboxInput id="department" name="dept" placeholder="Department" showClear />
                <ComboboxContent>
                    <ComboboxEmpty>No department found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>

        {/* Course name: Text input */}
        <Field>
            <FieldLabel htmlFor="course-name">Course name</FieldLabel>
            <Input id="course-name" name="name" placeholder="Course name" />
        </Field>


        {/* Number of credits: Number input */}
        <Field>
            <FieldLabel htmlFor="credit">Number of credits</FieldLabel>
            <Input id="credit" name="credits" type="number" />
             {/*<RangeInput id="credit" name="credit-hours"
//                 minPlaceholder="Min" maxPlaceholder="Max"
//                 type="number" min="1" max="4" step="1"
//             />*/}
        </Field>


        {/* Days of the week: Multiselect */}
        <Field>
            <FieldLabel htmlFor="days-of-week">Days of the week</FieldLabel>
            <Combobox
                multiple
                autoHighlight
                items={daysOfWeek}
            >
                <ComboboxChips ref={weekAnchor} className="w-full max-w-xs">
                    <ComboboxValue>
                        {(values) => (
                            <React.Fragment>
                                {values.map((value: string) => (
                                    <ComboboxChip key={value}>{value}</ComboboxChip>
                                ))}
                                <ComboboxChipsInput id="days-of-week" name="day" placeholder="Select day(s)..."/>
                            </React.Fragment>
                        )}
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={weekAnchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>

        {/* Start and end time: RangeInput */}
        <Field>
            <FieldLabel htmlFor="start-time">Time range</FieldLabel>
            <Input id="start-time" name="start-time" type="time" min="08:00" max="21:00" step="900"/>
            <Input id="end-time" name="end-time" type="time" min="08:00" max="21:00" step="900"/>
            {/*}<RangeInput id="time"
                        minDefaultValue="08:00" maxDefaultValue="21:00"
                        type="time" min="08:00" max="21:00" step="900"
            />*/}
        </Field>
        {/*    TODO: make sure Time range has a sufficient min width for showing AM/PM info*/}

        {/* Professor: Multiselect */}
        <Field>
            <FieldLabel htmlFor="professor">Professor</FieldLabel>
            <Combobox items={professors}>
                <ComboboxInput id="professor" name="prof" placeholder="Professor" showClear />
                <ComboboxContent>
                    <ComboboxEmpty>No professor found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>

            {/*<Combobox
                multiple
                autoHighlight
                items={professors}
            >
                <ComboboxChips ref={profAnchor} className="w-full max-w-xs">
                    <ComboboxValue>
                        {(values) => (
                            <React.Fragment>
                                {values.map((value: string) => (
                                    <ComboboxChip key={value}>{value}</ComboboxChip>
                                ))}
                                <ComboboxChipsInput id="professor" name="professor" placeholder="Select prof(s)..."/>
                            </React.Fragment>
                        )}
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={profAnchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>*/}
        </Field>

        {/* TODO: Semester */}
        </FieldGroup>
    )
}