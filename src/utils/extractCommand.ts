interface UpdateWithEntities {
    text?: string;
    entities?: Array<{ type: string; offset: number; length: number }>;
}

export const extractCommand = (update: unknown): string | undefined => {
    if (typeof update !== "object" || update === null) return undefined;
    const u = update as UpdateWithEntities;
    if (!u.entities || !u.text) return undefined;
    const entity = u.entities.find((e) => e.type === "bot_command");
    if (!entity) return undefined;
    return u.text.slice(entity.offset, entity.offset + entity.length);
};
