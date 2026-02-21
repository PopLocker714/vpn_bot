export const parseUsername = (input: string): string => {
    return input.trim().replace(/[^a-zA-Z0-9_-]/g, "");
};
