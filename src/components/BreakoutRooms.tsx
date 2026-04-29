import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import { CheckMark, ChevronRight, Pencil } from "../icons";
import { useJitsiContext } from "../JitsiContext";
import { useState } from "react";
import { JitsiRoom } from "../types";

export interface BreakoutRoomsProps {
    className?: string;
    style?: React.CSSProperties;
    children?: (
        rooms: JitsiRoom[] | null,
        create: (subject: string) => void,
        rename: (roomJid: string, subject: string) => void,
        join: (roomJid: string) => void,
        leave: () => void,
        send: (participantJid: string, roomJid: string) => void,
        remove: (roomJid: string) => void,
    ) => React.ReactNode;
}

function RoomNameEditor({ room }: { room: JitsiRoom }) {
    const { participants, renameBreakoutRoom } = useJitsiContext();
    const [editing, setEditing] = useState(false);

    const [currentName, setName] = useState<string>()

    if (editing) return (
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            <input
                className="rj-input"
                defaultValue={room.name}
                onChange={(e) => setName(e.currentTarget.value)}
                style={{ width: "100%" }}
            />
            <button
                className="rj-btn-sm rj-btn--success"
                onClick={() => {
                    setEditing(false);
                    renameBreakoutRoom(room.jid, currentName ?? room.name ?? "Room")
                }}
            >
                <CheckMark />
            </button>
        </div>
    )

    return (
        <button
            className="rj-btn-sm rj-btn-sm--ghost"
            style={{ display: "flex", gap: 5, marginBottom: 10, background: "transparent" }} onClick={() => !room.isMainRoom && setEditing(true)}
        >
            <p>{room.name ?? room.id} ({Object.values(room.participants).filter(p => !participants.has(p.jid.split("-")[0])).length})</p>
            {!room.isMainRoom && <Pencil />}
        </button>
    )
}

export function BreakoutRooms({ className, style, children }: BreakoutRoomsProps) {
    const { conference, breakoutRooms, participants, localRole, createBreakoutRoom, renameBreakoutRoom, joinBreakoutRoom, leaveBreakoutRoom, sendToBreakoutRoom, removeBreakoutRoom } = useJitsiContext();

    if (!conference) return;
    const currentRoom = conference.room;
    if (!currentRoom) return;

    if (children) return <>{children(breakoutRooms, createBreakoutRoom, renameBreakoutRoom, joinBreakoutRoom, leaveBreakoutRoom, sendToBreakoutRoom, removeBreakoutRoom)}</>

    return (
        <div className={className} style={style}>
            {
                conference.getBreakoutRooms()?.isBreakoutRoom() &&
                <button
                    className="rj-btn-sm rj-btn--muted"
                    onClick={leaveBreakoutRoom}
                    style={{ width: "100%", marginTop: 10 }}
                >Leave breakout room</button>
            }
            {
                breakoutRooms?.map(room => (
                    room.jid !== currentRoom.roomjid &&
                    <div key={room.id} style={{ marginTop: 10 }}>
                        <RoomNameEditor room={room} />
                        <div style={{ display: "flex", gap: "5px" }}>
                            <button
                                className="rj-btn-sm rj-btn-sm--ghost"
                                onClick={() => joinBreakoutRoom(room.id)}
                                style={{ width: "100%" }}
                            >
                                Join
                            </button>
                            {
                                !room.isMainRoom &&
                                <button
                                    className="rj-btn-sm rj-btn--muted"
                                    onClick={() => removeBreakoutRoom(room.jid)}
                                    style={{ width: "100%" }}
                                >
                                    Remove
                                </button>
                            }
                        </div>
                        {
                            Object.entries(room.participants).map(([jid, participant]) => (
                                !participants.get(participant.jid.split("-")[0]) &&
                                <div key={participant.jid} className="rj-participant-item" style={{ flexWrap: 'wrap', marginTop: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                        <div
                                            className="rj-avatar rj-avatar--sm"
                                            style={{ backgroundColor: "#0000" }}
                                        >
                                            {participant.displayName?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="rj-participant-item__name">
                                            {participant.displayName}
                                            {participant.role === "moderator" && <span className="rj-participant-item__you">(Admin)</span>}
                                        </span>
                                        {
                                            localRole === "moderator" &&
                                            <div className="rj-participant-item__icons">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="rj-btn-sm" style={{ background: "transparent", color: "#ffffff" }}>
                                                            <ChevronRight />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverPortal>
                                                        <PopoverContent>
                                                            <div className="rj-panel">
                                                                <p style={{ color: "#ffffff" }}>Move to room</p>
                                                                {
                                                                    breakoutRooms.map(mRoom => (
                                                                        mRoom.id !== room.id &&
                                                                        <button
                                                                            key={mRoom.id}
                                                                            className="rj-btn-sm rj-btn-sm--ghost"
                                                                            onClick={() => sendToBreakoutRoom(participant.jid, mRoom.jid)}
                                                                        >
                                                                            {mRoom.name ?? mRoom.id}
                                                                        </button>
                                                                    ))
                                                                }
                                                            </div>
                                                        </PopoverContent>
                                                    </PopoverPortal>
                                                </Popover>
                                            </div>
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))
            }
            <button
                className="rj-btn-sm rj-btn-sm--active"
                onClick={() => createBreakoutRoom("Room")}
                style={{ width: "100%", marginTop: 10 }}
            >Add breakout room</button>
        </div>
    )
}