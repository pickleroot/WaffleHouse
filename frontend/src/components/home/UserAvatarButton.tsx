import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserAvatarButton() {
    return (
        <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>IT</AvatarFallback>
            </Avatar>
        </Button>
    );
}
